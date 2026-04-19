const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000', credentials: true }));
app.use(express.json());

app.use('/api/auth',   require('./routes/auth'));
app.use('/api/tailors',require('./routes/tailors'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/users',  require('./routes/users'));
app.use('/api/admin',  require('./routes/admin'));
app.get('/api/health', (_, res) => res.json({ status: 'OK' }));

const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGODB_URI)
  .then(() => { console.log('✅ MongoDB connected'); app.listen(PORT, () => console.log(`🚀 Server on :${PORT}`)); })
  .catch(err => { console.error('MongoDB error:', err.message); app.listen(PORT, () => console.log(`🚀 Server on :${PORT} (no DB)`)); });

module.exports = app;
