import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  subscription: { type: mongoose.Schema.Types.ObjectId, ref: 'Subscription', index: true },
  provider: { 
    type: String, 
    enum: ['nowpayments', 'coinbase'], 
    default: 'nowpayments' 
  },
  providerPaymentId: { type: String, required: true, unique: true, index: true },
  currency: { type: String },
  amountCrypto: { type: Number },
  amountUsd: { type: Number, required: true },
  walletAddress: { type: String },
  txHash: { type: String },
  status: { 
    type: String, 
    enum: ['waiting', 'confirming', 'confirmed', 'failed', 'expired', 'refunded'], 
    default: 'waiting',
    index: true
  },
  rawWebhookPayload: { type: mongoose.Schema.Types.Mixed } // for audit trails
}, {
  timestamps: true
});

const Payment = mongoose.models.Payment || mongoose.model('Payment', paymentSchema);
export default Payment;
