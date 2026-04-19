const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authMiddleware, requireRole } = require('../middleware/auth');

router.put('/profile', authMiddleware, requireRole('customer'), async (req, res) => {
  try {
    const { name, phone, address, city } = req.body;
    const u = await User.findByIdAndUpdate(req.user.id, { name, phone, address, city }, { new: true }).select('-password');
    res.json(u);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
