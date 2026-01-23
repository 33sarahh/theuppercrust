const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Initialize database
const dbPath = path.join(__dirname, 'orders.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to SQLite database');
        // Create orders table if it doesn't exist
        db.run(`CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            phone TEXT NOT NULL,
            apartment TEXT NOT NULL,
            breadQuantity INTEGER NOT NULL DEFAULT 0,
            jamQuantity INTEGER NOT NULL DEFAULT 0,
            deliveryDate TEXT NOT NULL,
            notes TEXT,
            orderTime TEXT NOT NULL,
            status TEXT DEFAULT 'pending'
        )`, (err) => {
            if (err) {
                console.error('Error creating table:', err.message);
            } else {
                console.log('Orders table ready');
            }
        });
    }
});

// API Routes

// Get all orders
app.get('/api/orders', (req, res) => {
    db.all('SELECT * FROM orders ORDER BY orderTime DESC', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// Get a single order by ID
app.get('/api/orders/:id', (req, res) => {
    const id = req.params.id;
    db.get('SELECT * FROM orders WHERE id = ?', [id], (err, row) => {
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

// Create a new order
app.post('/api/orders', (req, res) => {
    const { name, phone, apartment, breadQuantity, jamQuantity, deliveryDate, notes } = req.body;
    
    // Validation
    if (!name || !phone || !apartment || !deliveryDate) {
        return res.status(400).json({ error: 'Missing required fields' });
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
    
    db.run(
        `INSERT INTO orders (name, phone, apartment, breadQuantity, jamQuantity, deliveryDate, notes, orderTime, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [name, phone, apartment, breadQty, jamQty, deliveryDate, notes || '', orderTime, 'pending'],
        function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.status(201).json({
                id: this.lastID,
                name,
                phone,
                apartment,
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

// Update order status
app.patch('/api/orders/:id', (req, res) => {
    const id = req.params.id;
    const { status } = req.body;
    
    if (!status) {
        return res.status(400).json({ error: 'Status is required' });
    }
    
    db.run('UPDATE orders SET status = ? WHERE id = ?', [status, id], function(err) {
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
    res.json({ status: 'ok', message: 'Upper Crust API is running' });
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
