const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Tailor = require('../models/Tailor');
const { authMiddleware } = require('../middleware/auth');

const sign = (payload) => jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

router.post('/register/customer', async (req, res) => {
  try {
    const { name, email, password, phone, address, city } = req.body;
    if (await User.findOne({ email })) return res.status(400).json({ message: 'Email already registered' });
    const user = await User.create({ name, email, password, phone, address, city });
    const token = sign({ id: user._id, role: 'customer', email });
    res.status(201).json({ token, user: { id: user._id, name: user.name, email, role: 'customer', city: user.city } });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/register/tailor', async (req, res) => {
  try {
    const { shopName, proprietorName, email, password, phone, shopAddress, city, servicesOffered, experience, description, shopImage } = req.body;
    if (await Tailor.findOne({ email })) return res.status(400).json({ message: 'Email already registered' });
    const tailor = await Tailor.create({ shopName, proprietorName, email, password, phone, shopAddress, city, servicesOffered: servicesOffered || [], experience: experience || 0, description: description || '', shopImage: shopImage || '' });
    const token = sign({ id: tailor._id, role: 'tailor', email });
    res.status(201).json({ token, user: { id: tailor._id, name: tailor.proprietorName, shopName: tailor.shopName, email, role: 'tailor', city: tailor.city, isVerified: tailor.isVerified } });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;
    if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
      return res.json({ token: sign({ id: 'admin', role: 'admin', email }), user: { id: 'admin', name: 'Admin', email, role: 'admin' } });
    }
    const tryCustomer = async () => {
      const u = await User.findOne({ email });
      if (u && await u.comparePassword(password)) return res.json({ token: sign({ id: u._id, role: 'customer', email }), user: { id: u._id, name: u.name, email, role: 'customer', city: u.city, address: u.address, phone: u.phone } });
    };
    const tryTailor = async () => {
      const t = await Tailor.findOne({ email });
      if (t && await t.comparePassword(password)) return res.json({ token: sign({ id: t._id, role: 'tailor', email }), user: { id: t._id, name: t.proprietorName, shopName: t.shopName, email, role: 'tailor', city: t.city, isVerified: t.isVerified } });
    };
    if (!role || role === 'customer') { const r = await tryCustomer(); if (r) return; }
    if (!role || role === 'tailor')   { const r = await tryTailor();   if (r) return; }
    res.status(401).json({ message: 'Invalid email or password' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/me', authMiddleware, async (req, res) => {
  try {
    const { id, role } = req.user;
    if (role === 'admin') return res.json({ id: 'admin', name: 'Admin', email: process.env.ADMIN_EMAIL, role: 'admin' });
    if (role === 'customer') { const u = await User.findById(id).select('-password'); return res.json({ ...u.toObject(), role: 'customer' }); }
    if (role === 'tailor')   { const t = await Tailor.findById(id).select('-password'); return res.json({ ...t.toObject(), role: 'tailor' }); }
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
