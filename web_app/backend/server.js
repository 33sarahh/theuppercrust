const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const session = require('express-session');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Session configuration
app.use(session({
    secret: 'upper-crust-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // Set to true in production with HTTPS
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Middleware
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Middleware to check authentication
const requireAuth = (req, res, next) => {
    if (req.session && req.session.userId) {
        next();
    } else {
        res.status(401).json({ error: 'Authentication required' });
    }
};

// Initialize database
const dbPath = path.join(__dirname, 'orders.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to SQLite database');
        
        // Create users table
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            firstName TEXT NOT NULL,
            lastName TEXT NOT NULL,
            apartment TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            phone TEXT NOT NULL,
            avatar TEXT DEFAULT '/images/profile_bread.jpg',
            createdAt TEXT NOT NULL
        )`, (err) => {
            if (err) {
                console.error('Error creating users table:', err.message);
            } else {
                console.log('Users table ready');
            }
        });
        
        // Create orders table with userId
        db.run(`CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            userId INTEGER,
            name TEXT NOT NULL,
            phone TEXT NOT NULL,
            apartment TEXT NOT NULL,
            breadQuantity INTEGER NOT NULL DEFAULT 0,
            jamQuantity INTEGER NOT NULL DEFAULT 0,
            deliveryDate TEXT NOT NULL,
            notes TEXT,
            orderTime TEXT NOT NULL,
            status TEXT DEFAULT 'pending',
            FOREIGN KEY (userId) REFERENCES users(id)
        )`, (err) => {
            if (err) {
                console.error('Error creating orders table:', err.message);
            } else {
                console.log('Orders table ready');
                // Migrate existing orders: add userId column if it doesn't exist
                db.run(`ALTER TABLE orders ADD COLUMN userId INTEGER`, (err) => {
                    // Ignore error if column already exists
                });
            }
        });
        
        // Create reviews table
        db.run(`CREATE TABLE IF NOT EXISTS reviews (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            userId INTEGER NOT NULL,
            rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
            text TEXT,
            createdAt TEXT NOT NULL,
            FOREIGN KEY (userId) REFERENCES users(id)
        )`, (err) => {
            if (err) {
                console.error('Error creating reviews table:', err.message);
            } else {
                console.log('Reviews table ready');
            }
        });
    }
});

// API Routes

// ========== Authentication Routes ==========

// Register new user
app.post('/api/auth/register', (req, res) => {
    const { firstName, lastName, apartment, email, phone } = req.body;
    
    // Validation
    if (!firstName || !lastName || !apartment || !email || !phone) {
        return res.status(400).json({ error: 'All fields are required' });
    }
    
    // Validate apartment (exactly 4 digits)
    if (!/^\d{4}$/.test(apartment)) {
        return res.status(400).json({ error: 'Apartment number must be exactly 4 digits' });
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
    }
    
    // Validate phone (basic format check)
    if (phone.replace(/\D/g, '').length < 10) {
        return res.status(400).json({ error: 'Invalid phone number' });
    }
    
    const createdAt = new Date().toISOString();
    const avatar = '/images/profile_bread.jpg'; // Fixed avatar
    
    // Check if email already exists
    db.get('SELECT id FROM users WHERE email = ?', [email], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (row) {
            return res.status(400).json({ error: 'Email already registered' });
        }
        
        // Create user
        db.run(
            `INSERT INTO users (firstName, lastName, apartment, email, phone, avatar, createdAt)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [firstName, lastName, apartment, email, phone, avatar, createdAt],
            function(err) {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }
                
                // Set session
                req.session.userId = this.lastID;
                
                // Return user data (without sensitive info)
                res.status(201).json({
                    id: this.lastID,
                    firstName,
                    lastName,
                    apartment,
                    email,
                    phone,
                    avatar
                });
            }
        );
    });
});

// Login (using email and apartment as credentials)
app.post('/api/auth/login', (req, res) => {
    const { email, apartment } = req.body;
    
    if (!email || !apartment) {
        return res.status(400).json({ error: 'Email and apartment number are required' });
    }
    
    // Find user by email and apartment
    db.get(
        'SELECT * FROM users WHERE email = ? AND apartment = ?',
        [email, apartment],
        (err, user) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            if (!user) {
                return res.status(401).json({ error: 'Invalid email or apartment number' });
            }
            
            // Set session
            req.session.userId = user.id;
            
            // Return user data (without sensitive info)
            res.json({
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                apartment: user.apartment,
                email: user.email,
                phone: user.phone,
                avatar: user.avatar
            });
        }
    );
});

// Logout
app.post('/api/auth/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to logout' });
        }
        res.json({ message: 'Logged out successfully' });
    });
});

// Get current user
app.get('/api/auth/me', requireAuth, (req, res) => {
    const userId = req.session.userId;
    
    db.get('SELECT id, firstName, lastName, apartment, email, phone, avatar FROM users WHERE id = ?', [userId], (err, user) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(user);
    });
});

// ========== User Profile Routes ==========

// Get user profile
app.get('/api/users/profile', requireAuth, (req, res) => {
    const userId = req.session.userId;
    
    db.get('SELECT id, firstName, lastName, apartment, email, phone, avatar FROM users WHERE id = ?', [userId], (err, user) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(user);
    });
});

// Update user profile
app.put('/api/users/profile', requireAuth, (req, res) => {
    const userId = req.session.userId;
    const { firstName, lastName, apartment, email, phone } = req.body;
    
    // Validation
    if (!firstName || !lastName || !apartment || !email || !phone) {
        return res.status(400).json({ error: 'All fields are required' });
    }
    
    // Validate apartment (exactly 4 digits)
    if (!/^\d{4}$/.test(apartment)) {
        return res.status(400).json({ error: 'Apartment number must be exactly 4 digits' });
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
    }
    
    // Check if email is taken by another user
    db.get('SELECT id FROM users WHERE email = ? AND id != ?', [email, userId], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (row) {
            return res.status(400).json({ error: 'Email already taken' });
        }
        
        // Update user
        db.run(
            `UPDATE users SET firstName = ?, lastName = ?, apartment = ?, email = ?, phone = ? WHERE id = ?`,
            [firstName, lastName, apartment, email, phone, userId],
            function(err) {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }
                
                // Return updated user
                db.get('SELECT id, firstName, lastName, apartment, email, phone, avatar FROM users WHERE id = ?', [userId], (err, user) => {
                    if (err) {
                        return res.status(500).json({ error: err.message });
                    }
                    res.json(user);
                });
            }
        );
    });
});

// ========== Reviews Routes ==========

// Create review
app.post('/api/reviews', requireAuth, (req, res) => {
    const userId = req.session.userId;
    const { rating, text } = req.body;
    
    // Validation
    if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }
    
    const createdAt = new Date().toISOString();
    
    db.run(
        `INSERT INTO reviews (userId, rating, text, createdAt) VALUES (?, ?, ?, ?)`,
        [userId, rating, text || '', createdAt],
        function(err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.status(201).json({
                id: this.lastID,
                userId,
                rating,
                text: text || '',
                createdAt
            });
        }
    );
});

// Get user's reviews
app.get('/api/reviews/my', requireAuth, (req, res) => {
    const userId = req.session.userId;
    
    db.all(
        'SELECT * FROM reviews WHERE userId = ? ORDER BY createdAt DESC',
        [userId],
        (err, reviews) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json(reviews);
        }
    );
});

// ========== Orders Routes ==========

// Get all orders (for authenticated user, only their orders)
app.get('/api/orders', requireAuth, (req, res) => {
    const userId = req.session.userId;
    
    db.all(
        'SELECT * FROM orders WHERE userId = ? ORDER BY orderTime DESC',
        [userId],
        (err, rows) => {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json(rows);
        }
    );
});

// Get a single order by ID (must belong to user)
app.get('/api/orders/:id', requireAuth, (req, res) => {
    const id = req.params.id;
    const userId = req.session.userId;
    
    db.get('SELECT * FROM orders WHERE id = ? AND userId = ?', [id, userId], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (!row) {
            res.status(404).json({ error: 'Order not found' });
            return;
        }
        res.json(row);
    });
});

// Create a new order (requires authentication)
app.post('/api/orders', requireAuth, (req, res) => {
    const userId = req.session.userId;
    const { breadQuantity, jamQuantity, deliveryDate, notes } = req.body;
    
    // Get user info to populate order
    db.get('SELECT firstName, lastName, phone, apartment FROM users WHERE id = ?', [userId], (err, user) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        // Validation
        if (!deliveryDate) {
            return res.status(400).json({ error: 'Delivery date is required' });
        }
        
        const breadQty = parseInt(breadQuantity) || 0;
        const jamQty = parseInt(jamQuantity) || 0;
        
        if (breadQty === 0 && jamQty === 0) {
            return res.status(400).json({ error: 'Please select at least one item to order' });
        }
        
        // Validate delivery date (must be at least 48 hours from now)
        const selectedDate = new Date(deliveryDate);
        const now = new Date();
        const minDate = new Date(now.getTime() + (48 * 60 * 60 * 1000));
        
        if (selectedDate < minDate) {
            return res.status(400).json({ error: 'Delivery date must be at least 48 hours from now' });
        }
        
        const orderTime = new Date().toISOString();
        const name = `${user.firstName} ${user.lastName}`;
        
        db.run(
            `INSERT INTO orders (userId, name, phone, apartment, breadQuantity, jamQuantity, deliveryDate, notes, orderTime, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [userId, name, user.phone, user.apartment, breadQty, jamQty, deliveryDate, notes || '', orderTime, 'pending'],
            function(err) {
                if (err) {
                    res.status(500).json({ error: err.message });
                    return;
                }
                res.status(201).json({
                    id: this.lastID,
                    userId,
                    name,
                    phone: user.phone,
                    apartment: user.apartment,
                    breadQuantity: breadQty,
                    jamQuantity: jamQty,
                    deliveryDate,
                    notes: notes || '',
                    orderTime,
                    status: 'pending'
                });
            }
        );
    });
});

// Update order status (admin only - keeping for backward compatibility)
app.patch('/api/orders/:id', requireAuth, (req, res) => {
    const id = req.params.id;
    const userId = req.session.userId;
    const { status } = req.body;
    
    if (!status) {
        return res.status(400).json({ error: 'Status is required' });
    }
    
    db.run('UPDATE orders SET status = ? WHERE id = ? AND userId = ?', [status, id, userId], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (this.changes === 0) {
            res.status(404).json({ error: 'Order not found' });
            return;
        }
        res.json({ message: 'Order updated successfully' });
    });
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'the upper crust API is running' });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    db.close((err) => {
        if (err) {
            console.error(err.message);
        }
        console.log('Database connection closed');
        process.exit(0);
    });
});
