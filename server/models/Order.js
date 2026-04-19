const mongoose = require('mongoose');

const serviceItemSchema = new mongoose.Schema({ name: String, price: Number, qty: { type: Number, default: 1 } }, { _id: false });

const orderSchema = new mongoose.Schema({
  customerId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  tailorId:        { type: mongoose.Schema.Types.ObjectId, ref: 'Tailor', required: true },
  services:        { type: [serviceItemSchema], default: [] },
  totalPrice:      { type: Number, default: 0 },
  serviceType:     { type: String, default: '' },
  status:          { type: String, enum: ['confirmed','in_progress','completed','cancelled'], default: 'confirmed' },
  scheduledDate:   { type: Date, required: true },
  deliveryDate:    { type: Date },
  timeSlot:        { type: String, required: true },
  pickupAddress:   { type: String, required: true },
  deliveryAddress: { type: String, required: true },
  address:         { type: String, default: '' },
  notes:           { type: String, default: '' },
  paymentStatus:   { type: String, enum: ['paid','unpaid'], default: 'unpaid' },
  paymentMethod:   { type: String, default: '' },
  isReviewed:      { type: Boolean, default: false },
  createdAt:       { type: Date, default: Date.now },
  updatedAt:       { type: Date, default: Date.now },
});

orderSchema.pre('save', function (next) { this.updatedAt = Date.now(); next(); });

module.exports = mongoose.model('Order', orderSchema);
