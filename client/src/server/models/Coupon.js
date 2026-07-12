import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema({
  code: { 
    type: String, 
    required: true, 
    unique: true, 
    index: true, 
    uppercase: true, 
    trim: true 
  },
  type: { 
    type: String, 
    enum: ['percentage', 'fixed'], 
    required: true 
  },
  value: { type: Number, required: true }, // e.g. 15 for 15% or 10.00 for $10 off
  usageLimit: { type: Number, default: null }, // null means unlimited
  usedCount: { type: Number, default: 0 },
  expiresAt: { type: Date },
  isPrivate: { type: Boolean, default: false }, // if private, not publically listed
  affiliateOwner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null } // linked affiliate
}, {
  timestamps: true
});

const Coupon = mongoose.models.Coupon || mongoose.model('Coupon', couponSchema);
export default Coupon;
