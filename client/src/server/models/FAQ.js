import mongoose from 'mongoose';

const faqSchema = new mongoose.Schema({
  question: { type: String, required: true, trim: true },
  answer: { type: String, required: true, trim: true },
  category: { 
    type: String, 
    required: true, 
    enum: ['Installation', 'Refunds', 'TradingView', 'Crypto Payments', 'Alerts', 'Compatibility', 'Updates', 'General'],
    default: 'General',
    index: true
  },
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

const FAQ = mongoose.models.FAQ || mongoose.model('FAQ', faqSchema);
export default FAQ;
