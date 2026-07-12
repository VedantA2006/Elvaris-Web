import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  indicator: { type: mongoose.Schema.Types.ObjectId, ref: 'Indicator', default: null, index: true }, // null represents bundle
  planType: { 
    type: String, 
    enum: ['monthly', 'quarterly', 'yearly', 'lifetime'], 
    required: true 
  },
  price: { type: Number, required: true },
  currency: { type: String, default: 'USD' },
  status: { 
    type: String, 
    enum: ['pending', 'active', 'expired', 'paused', 'cancelled'], 
    default: 'pending',
    index: true
  },
  startDate: { type: Date },
  endDate: { type: Date },
  autoRenew: { type: Boolean, default: true },
  paymentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment' }
}, {
  timestamps: true
});

const Subscription = mongoose.model('Subscription', subscriptionSchema);
export default Subscription;
