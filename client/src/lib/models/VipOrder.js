import mongoose from 'mongoose';

const vipOrderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  vipTier: { type: mongoose.Schema.Types.ObjectId, ref: 'VipTier', required: true },
  priceUsd: { type: Number, required: true, min: 0 },
  providerPaymentId: { type: String, index: true },
  invoiceUrl: { type: String },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'expired'],
    default: 'pending',
    index: true
  }
}, {
  timestamps: true
});

const VipOrder = mongoose.models.VipOrder || mongoose.model('VipOrder', vipOrderSchema);
export default VipOrder;
