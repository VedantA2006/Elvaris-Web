import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  indicator: { type: mongoose.Schema.Types.ObjectId, ref: 'Indicator', required: true, index: true },
  planType: { 
    type: String, 
    enum: ['monthly', 'quarterly', 'yearly', 'lifetime'], 
    required: true 
  },
  priceUsd: { type: Number, required: true },
  discountUsd: { type: Number, default: 0 },
  finalPriceUsd: { type: Number, required: true },
  couponCode: { type: String, trim: true },
  affiliate: { type: mongoose.Schema.Types.ObjectId, ref: 'Affiliate', default: null, index: true },
  payment: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment', index: true },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'expired'],
    default: 'pending',
    index: true
  }
}, {
  timestamps: true
});

const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);
export default Order;
