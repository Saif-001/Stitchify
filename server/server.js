const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path'); // ✅ ADDED: Built-in Node module for file paths
require('dotenv').config();

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000', credentials: true }));
app.use(express.json());

// --- API Routes ---
app.use('/api/auth', require('./routes/auth'));
app.use('/api/tailors', require('./routes/tailors'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/users', require('./routes/users'));
app.use('/api/admin', require('./routes/admin'));
app.get('/api/health', (_, res) => res.json({ status: 'OK' }));

// --- Serve React Frontend in Production ---
// ✅ ADDED: Serve static files from the React app's build directory.
// (Note: If your frontend was built with Vite instead of Create React App, change 'build' to 'dist' below)
app.use(express.static(path.join(__dirname, '../client/build')));

// ✅ ADDED: Catch-all route. If a user refreshes a React page (like /login), 
// Express won't know that route. This sends them back to the React index.html file to handle it.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

// --- Server & DB Connection ---
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGODB_URI)
  .then(() => { 
    console.log('✅ MongoDB connected'); 
    app.listen(PORT, () => console.log(`🚀 Server on :${PORT}`)); 
  })
  .catch(err => { 
    console.error('MongoDB error:', err.message); 
    app.listen(PORT, () => console.log(`🚀 Server on :${PORT} (no DB)`)); 
  });

module.exports = app;