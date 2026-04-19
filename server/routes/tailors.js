const express = require('express');
const router = express.Router();
const Tailor = require('../models/Tailor');
const Order  = require('../models/Order');
const Review = require('../models/Review');
const { authMiddleware, requireRole } = require('../middleware/auth');

// GET /api/tailors — browse with filters + availability date
router.get('/', async (req, res) => {
  try {
    const { city, service, minRating, sort, availableOn } = req.query;
    const q = { isVerified: true };
    if (city)      q.city = { $regex: city, $options: 'i' };
    if (service)   q.servicesOffered = service;
    if (minRating) q.averageRating = { $gte: parseFloat(minRating) };

    let tailors = await Tailor.find(q).select('-password')
      .sort(sort === 'experience' ? { experience: -1 } : { averageRating: -1 });

    if (availableOn) {
      const d0 = new Date(availableOn); d0.setHours(0,0,0,0);
      const d1 = new Date(availableOn); d1.setHours(23,59,59,999);
      const busy = await Order.aggregate([
        { $match: { scheduledDate: { $gte: d0, $lte: d1 }, status: { $nin: ['cancelled'] } } },
        { $group: { _id: '$tailorId', count: { $sum: 1 } } },
      ]);
      const busyMap = {};
      busy.forEach(b => { busyMap[b._id.toString()] = b.count; });
      tailors = tailors.filter(t => (busyMap[t._id.toString()] || 0) < (t.capacityPerDay || 5));
    }

    // Attach next available date for each tailor
    const today = new Date(); today.setHours(0,0,0,0);
    const tailorsWithSlot = await Promise.all(tailors.map(async (t) => {
      let nextDate = null;
      for (let offset = 0; offset < 14; offset++) {
        const d = new Date(today); d.setDate(d.getDate() + offset);
        const d0 = new Date(d); d0.setHours(0,0,0,0);
        const d1 = new Date(d); d1.setHours(23,59,59,999);
        const cnt = await Order.countDocuments({ tailorId: t._id, scheduledDate: { $gte: d0, $lte: d1 }, status: { $nin: ['cancelled'] } });
        if (cnt < (t.capacityPerDay || 5)) { nextDate = d; break; }
      }
      return { ...t.toObject(), nextAvailableDate: nextDate };
    }));

    res.json(tailorsWithSlot);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/tailors/dashboard/me
router.get('/dashboard/me', authMiddleware, requireRole('tailor'), async (req, res) => {
  try {
    const tailor = await Tailor.findById(req.user.id).select('-password');
    const allOrders = await Order.find({ tailorId: req.user.id })
      .populate('customerId', 'name phone email address')
      .sort({ createdAt: -1 });
    const confirmed  = allOrders.filter(o => o.status === 'confirmed');
    const inProgress = allOrders.filter(o => o.status === 'in_progress');
    const completed  = allOrders.filter(o => o.status === 'completed');
    const totalEarnings = completed.reduce((s, o) => s + (o.totalPrice || 0), 0);
    const reviews = await Review.find({ tailorId: req.user.id }).sort({ createdAt: -1 }).limit(5);
    res.json({ tailor, allOrders, confirmedOrders: confirmed, inProgressOrders: inProgress, completedOrders: completed, reviews, stats: { total: allOrders.length, confirmed: confirmed.length, inProgress: inProgress.length, completed: completed.length, totalEarnings } });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/tailors/:id
router.get('/:id', async (req, res) => {
  try {
    const tailor  = await Tailor.findById(req.params.id).select('-password');
    if (!tailor) return res.status(404).json({ message: 'Tailor not found' });
    const reviews = await Review.find({ tailorId: req.params.id }).sort({ createdAt: -1 }).limit(10);

    // Find next available date
    const today = new Date(); today.setHours(0,0,0,0);
    let nextAvailableDate = null;
    for (let i = 0; i < 30; i++) {
      const d = new Date(today); d.setDate(d.getDate() + i);
      const d0 = new Date(d); d0.setHours(0,0,0,0);
      const d1 = new Date(d); d1.setHours(23,59,59,999);
      const cnt = await Order.countDocuments({ tailorId: tailor._id, scheduledDate: { $gte: d0, $lte: d1 }, status: { $nin: ['cancelled'] } });
      if (cnt < (tailor.capacityPerDay || 5)) { nextAvailableDate = d; break; }
    }

    res.json({ tailor: { ...tailor.toObject(), nextAvailableDate }, reviews });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PUT /api/tailors/profile
router.put('/profile', authMiddleware, requireRole('tailor'), async (req, res) => {
  try {
    const fields = ['shopName','proprietorName','phone','shopAddress','city','servicesOffered','experience','description','isAvailable','shopImage','capacityPerDay'];
    const upd = {};
    fields.forEach(f => { if (req.body[f] !== undefined) upd[f] = req.body[f]; });
    const t = await Tailor.findByIdAndUpdate(req.user.id, upd, { new: true }).select('-password');
    res.json(t);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PATCH /api/tailors/availability
router.patch('/availability', authMiddleware, requireRole('tailor'), async (req, res) => {
  try {
    const t = await Tailor.findById(req.user.id);
    t.isAvailable = !t.isAvailable;
    await t.save();
    res.json({ isAvailable: t.isAvailable });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
