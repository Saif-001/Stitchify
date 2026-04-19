const express = require('express');
const router = express.Router();
const Order  = require('../models/Order');
const Tailor = require('../models/Tailor');
const Review = require('../models/Review');
const { authMiddleware, requireRole } = require('../middleware/auth');

// POST /api/orders — instant confirm
router.post('/', authMiddleware, requireRole('customer'), async (req, res) => {
  try {
    const { tailorId, services, scheduledDate, deliveryDate, timeSlot, pickupAddress, deliveryAddress, notes, paymentMethod, address } = req.body;
    if (!tailorId || !scheduledDate || !timeSlot) return res.status(400).json({ message: 'tailorId, scheduledDate and timeSlot required' });
    const pAddr = pickupAddress || address || '';
    const dAddr = deliveryAddress || pickupAddress || address || '';
    if (!pAddr) return res.status(400).json({ message: 'pickupAddress required' });

    const tailor = await Tailor.findById(tailorId);
    if (!tailor)            return res.status(404).json({ message: 'Tailor not found' });
    if (!tailor.isVerified) return res.status(400).json({ message: 'Tailor not verified' });
    if (!tailor.isAvailable) return res.status(400).json({ message: 'Tailor unavailable' });

    // capacity check
    const d0 = new Date(scheduledDate); d0.setHours(0,0,0,0);
    const d1 = new Date(scheduledDate); d1.setHours(23,59,59,999);
    const cnt = await Order.countDocuments({ tailorId, scheduledDate: { $gte: d0, $lte: d1 }, status: { $nin: ['cancelled'] } });
    if (cnt >= (tailor.capacityPerDay || 5)) return res.status(400).json({ message: 'Tailor fully booked on this date. Please choose another date.' });

    const resolvedServices = Array.isArray(services) ? services.map(s => ({ name: s.name, price: Number(s.price) || 0, qty: Number(s.qty) || 1 })) : [];
    const totalPrice = resolvedServices.reduce((sum, s) => sum + s.price * s.qty, 0);

    const order = await Order.create({
      customerId: req.user.id, tailorId,
      services: resolvedServices, totalPrice,
      serviceType: resolvedServices[0]?.name || '',
      status: 'confirmed',
      scheduledDate, deliveryDate: deliveryDate || null, timeSlot,
      pickupAddress: pAddr, deliveryAddress: dAddr, address: pAddr,
      notes: notes || '',
      paymentStatus: 'unpaid',
      paymentMethod: paymentMethod || '',
    });
    await order.populate('tailorId', 'shopName proprietorName phone shopImage shopAddress city');
    res.status(201).json(order);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/orders/my
router.get('/my', authMiddleware, requireRole('customer'), async (req, res) => {
  try {
    const orders = await Order.find({ customerId: req.user.id })
      .populate('tailorId', 'shopName proprietorName phone city averageRating shopImage shopAddress')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PATCH /api/orders/:id/status
router.patch('/:id/status', authMiddleware, requireRole('tailor'), async (req, res) => {
  try {
    const { status } = req.body;
    if (!['in_progress','completed','cancelled'].includes(status)) return res.status(400).json({ message: 'Invalid status' });
    const order = await Order.findOne({ _id: req.params.id, tailorId: req.user.id });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    order.status = status;
    await order.save();
    if (status === 'completed' && order.totalPrice > 0)
      await Tailor.findByIdAndUpdate(req.user.id, { $inc: { totalEarnings: order.totalPrice } });
    res.json(order);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PATCH /api/orders/:id/payment
router.patch('/:id/payment', authMiddleware, requireRole('tailor'), async (req, res) => {
  try {
    const { paymentStatus, paymentMethod } = req.body;
    if (!['paid','unpaid'].includes(paymentStatus)) return res.status(400).json({ message: 'Invalid paymentStatus' });
    const order = await Order.findOneAndUpdate({ _id: req.params.id, tailorId: req.user.id }, { paymentStatus, ...(paymentMethod ? { paymentMethod } : {}) }, { new: true }).populate('customerId','name phone email');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST /api/orders/:id/review
router.post('/:id/review', authMiddleware, requireRole('customer'), async (req, res) => {
  try {
    const { rating, comment, customerName } = req.body;
    const order = await Order.findOne({ _id: req.params.id, customerId: req.user.id, status: 'completed' });
    if (!order) return res.status(404).json({ message: 'Order not found or not completed' });
    if (order.isReviewed) return res.status(400).json({ message: 'Already reviewed' });
    const review = await Review.create({ customerId: req.user.id, tailorId: order.tailorId, orderId: order._id, rating, comment: comment || '', customerName: customerName || 'Anonymous' });
    order.isReviewed = true; await order.save();
    const all = await Review.find({ tailorId: order.tailorId });
    const avg = all.reduce((s, r) => s + r.rating, 0) / all.length;
    await Tailor.findByIdAndUpdate(order.tailorId, { averageRating: parseFloat(avg.toFixed(1)), totalReviews: all.length });
    res.status(201).json(review);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
