const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const tailorSchema = new mongoose.Schema({
  shopName:       { type: String, required: true, trim: true },
  proprietorName: { type: String, required: true, trim: true },
  email:          { type: String, required: true, unique: true, lowercase: true },
  password:       { type: String, required: true, minlength: 6 },
  phone:          { type: String, required: true },
  shopAddress:    { type: String, required: true },
  city:           { type: String, required: true },
  servicesOffered:[{ type: String, enum: ['kurta','shirt','pant','blouse','saree','suit','dress','lehenga','jacket','alteration','other'] }],
  experience:     { type: Number, required: true, min: 0 },
  description:    { type: String, default: '' },
  shopImage:      { type: String, default: '' },
  portfolioImages:[{ type: String }],
  capacityPerDay: { type: Number, default: 5 },
  role:           { type: String, default: 'tailor' },
  isVerified:     { type: Boolean, default: false },
  isAvailable:    { type: Boolean, default: true },
  averageRating:  { type: Number, default: 0, min: 0, max: 5 },
  totalReviews:   { type: Number, default: 0 },
  totalEarnings:  { type: Number, default: 0 },
  createdAt:      { type: Date, default: Date.now },
});

tailorSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});
tailorSchema.methods.comparePassword = function (p) { return bcrypt.compare(p, this.password); };

module.exports = mongoose.model('Tailor', tailorSchema);
