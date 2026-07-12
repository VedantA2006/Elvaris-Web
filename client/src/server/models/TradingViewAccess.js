import mongoose from 'mongoose';

const accessHistorySchema = new mongoose.Schema({
  action: { type: String, required: true }, // e.g. "requested", "granted", "revoked", "suspended"
  by: { type: String, required: true },     // e.g. "auto", "admin-email"
  at: { type: Date, default: Date.now }
});

const tradingViewAccessSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  indicator: { type: mongoose.Schema.Types.ObjectId, ref: 'Indicator', default: null, index: true }, // null for bundle access
  tradingViewUsername: { type: String, required: true, trim: true },
  status: { 
    type: String, 
    enum: ['pending', 'granted', 'revoked', 'suspended'], 
    default: 'pending',
    index: true
  },
  grantedBy: { type: String, enum: ['auto', 'admin'], default: 'admin' },
  grantedAt: { type: Date },
  expiresAt: { type: Date },
  history: [accessHistorySchema]
}, {
  timestamps: true
});

const TradingViewAccess = mongoose.models.TradingViewAccess || mongoose.model('TradingViewAccess', tradingViewAccessSchema);
export default TradingViewAccess;
