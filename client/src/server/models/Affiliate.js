import mongoose from 'mongoose';

const affiliateSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
  referralCode: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
  commissionRate: { type: Number, required: true, default: 20 }, // Percentage rate, e.g. 20%
  clicks: { type: Number, default: 0 },
  sales: { type: Number, default: 0 },
  earnings: { type: Number, default: 0 }, // Total commission earned in USD equivalent
  pendingWithdrawal: { type: Number, default: 0 },
  totalWithdrawn: { type: Number, default: 0 }
}, {
  timestamps: true
});

const Affiliate = mongoose.models.Affiliate || mongoose.model('Affiliate', affiliateSchema);
export default Affiliate;
