const express = require('express');
const router = express.Router();
const User   = require('../models/User');
const Tailor = require('../models/Tailor');
const Order  = require('../models/Order');
const { authMiddleware, requireRole } = require('../middleware/auth');

router.use(authMiddleware, requireRole('admin'));

router.get('/stats', async (req, res) => {
  try {
    const [totalUsers, totalTailors, verifiedTailors, pendingTailors, totalOrders, completedOrders] = await Promise.all([
      User.countDocuments(), Tailor.countDocuments(),
      Tailor.countDocuments({ isVerified: true }), Tailor.countDocuments({ isVerified: false }),
      Order.countDocuments(), Order.countDocuments({ status: 'completed' }),
    ]);
    const revenue = await Order.aggregate([{ $match: { status: 'completed' } }, { $group: { _id: null, total: { $sum: '$totalPrice' } } }]);
    res.json({ totalUsers, totalTailors, verifiedTailors, pendingTailors, totalOrders, completedOrders, totalRevenue: revenue[0]?.total || 0 });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/users', async (req, res) => {
  try {
    const { search, city } = req.query;
    const q = {};
    if (search) q.$or = [{ name: { $regex: search, $options: 'i' } }, { phone: { $regex: search, $options: 'i' } }];
    if (city)   q.city = { $regex: city, $options: 'i' };
    res.json(await User.find(q).select('-password').sort({ createdAt: -1 }));
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/tailors', async (req, res) => {
  try {
    const { verified, search, city } = req.query;
    const q = {};
    if (verified === 'true')  q.isVerified = true;
    if (verified === 'false') q.isVerified = false;
    if (search) q.$or = [{ shopName: { $regex: search, $options: 'i' } }, { proprietorName: { $regex: search, $options: 'i' } }];
    if (city)   q.city = { $regex: city, $options: 'i' };
    res.json(await Tailor.find(q).select('-password').sort({ createdAt: -1 }));
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.patch('/tailors/:id/verify', async (req, res) => {
  try {
    const t = await Tailor.findByIdAndUpdate(req.params.id, { isVerified: req.body.isVerified }, { new: true }).select('-password');
    if (!t) return res.status(404).json({ message: 'Not found' });
    res.json(t);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete('/tailors/:id', async (req, res) => {
  try { await Tailor.findByIdAndDelete(req.params.id); res.json({ message: 'Deleted' }); }
  catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/orders', async (req, res) => {
  try {
    const { status, dateFrom, dateTo } = req.query;
    const q = {};
    if (status && status !== 'all') q.status = status;
    if (dateFrom || dateTo) {
      q.scheduledDate = {};
      if (dateFrom) q.scheduledDate.$gte = new Date(dateFrom);
      if (dateTo)   q.scheduledDate.$lte = new Date(dateTo + 'T23:59:59');
    }
    const orders = await Order.find(q)
      .populate('customerId', 'name email phone')
      .populate('tailorId', 'shopName proprietorName')
      .sort({ createdAt: -1 }).limit(200);
    res.json(orders);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
