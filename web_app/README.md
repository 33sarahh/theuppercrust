# Upper Crust - Full Stack Web Application

A full-stack web application for ordering custom bread and jam, built with React frontend and Node.js/Express backend.

## Project Structure

```
web_app/
├── backend/          # Node.js/Express API server
│   ├── server.js     # Main server file
│   ├── package.json # Backend dependencies
│   └── orders.db    # SQLite database (created automatically)
├── frontend/         # React frontend application
│   ├── src/         # React source files
│   ├── public/      # Static assets (images, etc.)
│   └── package.json # Frontend dependencies
└── README.md        # This file
```

## Prerequisites

- Node.js (v14 or higher)
- npm (comes with Node.js)

## Setup Instructions

### 1. Install Backend Dependencies

```bash
cd backend
npm install
```

### 2. Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

## Running the Application

### Development Mode

You'll need to run both the backend and frontend servers:

#### Terminal 1 - Backend Server
```bash
cd backend
npm start
# or for development with auto-reload:
npm run dev
```

The backend server will run on `http://localhost:3001`

#### Terminal 2 - Frontend Server
```bash
cd frontend
npm start
```

The frontend will run on `http://localhost:3000` and will automatically open in your browser.

### Production Build

To build the frontend for production:

```bash
cd frontend
npm run build
```

This creates an optimized production build in the `frontend/build` directory.

## API Endpoints

### GET /api/orders
Get all orders

### GET /api/orders/:id
Get a specific order by ID

### POST /api/orders
Create a new order

**Request Body:**
```json
{
  "name": "John Doe",
  "phone": "(555) 123-4567",
  "apartment": "1234",
  "breadQuantity": 2,
  "jamQuantity": 1,
  "deliveryDate": "2024-01-25",
  "notes": "Optional notes"
}
```

### PATCH /api/orders/:id
Update order status

**Request Body:**
```json
{
  "status": "completed"
}
```

### GET /api/health
Health check endpoint

## Database

The application uses SQLite for data storage. The database file (`orders.db`) is automatically created in the `backend` directory when the server starts.

### Database Schema

```sql
CREATE TABLE orders (
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
)
```

## Features

- ✅ Full-stack order management
- ✅ SQLite database for persistent storage
- ✅ React frontend with routing
- ✅ Responsive design matching original site
- ✅ Form validation (48-hour advance notice required)
- ✅ Phone number and apartment number formatting
- ✅ Order confirmation flow

## Notes

- Orders must be placed at least 48 hours in advance
- At least one item (bread or jam) must be selected
- The frontend is configured to proxy API requests to the backend during development
