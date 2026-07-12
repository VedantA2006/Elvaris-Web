import mongoose from 'mongoose';

const vipMembershipSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true, unique: true },
  vipTier: { type: mongoose.Schema.Types.ObjectId, ref: 'VipTier', required: true },
  status: {
    type: String,
    enum: ['pending', 'active', 'revoked', 'expired'],
    default: 'pending',
    index: true
  },
  joinedAt: { type: Date },
  expiresAt: { type: Date, default: null }, // null = lifetime/one-time
  vipOrder: { type: mongoose.Schema.Types.ObjectId, ref: 'VipOrder' }
}, {
  timestamps: true
});

const VipMembership = mongoose.models.VipMembership || mongoose.model('VipMembership', vipMembershipSchema);
export default VipMembership;
