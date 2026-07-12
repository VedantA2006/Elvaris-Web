import mongoose from 'mongoose';

const versionSchema = new mongoose.Schema({
  version: { type: String, required: true },
  date: { type: Date, default: Date.now },
  notes: { type: String, required: true }
});

const pricingSchema = new mongoose.Schema({
  planType: { 
    type: String, 
    enum: ['monthly', 'quarterly', 'yearly', 'lifetime'], 
    required: true 
  },
  price: { type: Number, required: true },
  currency: { type: String, default: 'USD' } // Base pricing unit (typically USD, paid in crypto equivalents)
});

const indicatorSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
  shortDescription: { type: String, required: true },
  description: { type: String, required: true }, // Rich text or Markdown content
  category: [{ type: String }], // e.g. Gold, Forex, Crypto, Indices
  tradingStyle: [{ type: String }], // e.g. Scalping, Swing, Day Trading
  bannerImage: { type: String },
  gallery: [{ type: String }],
  videos: [{ type: String }],
  features: [{ type: String }],
  versionHistory: [versionSchema],
  documentationRefs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'DocArticle' }],
  pricing: [pricingSchema],
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

const Indicator = mongoose.model('Indicator', indicatorSchema);
export default Indicator;
