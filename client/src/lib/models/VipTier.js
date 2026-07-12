import mongoose from 'mongoose';

const vipTierSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, index: true, trim: true },
  description: { type: String, required: true },
  entryFeeUsd: { type: Number, required: true, min: 0 },
  billingCycle: {
    type: String,
    enum: ['one_time', 'monthly', 'yearly'],
    default: 'one_time'
  },
  benefits: [{ type: String }],
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

const VipTier = mongoose.models.VipTier || mongoose.model('VipTier', vipTierSchema);
export default VipTier;
