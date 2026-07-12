import mongoose from 'mongoose';

const docArticleSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  slug: { 
    type: String, 
    required: true, 
    unique: true, 
    index: true, 
    lowercase: true, 
    trim: true 
  },
  content: { type: String, required: true }, // Markdown guide content
  category: { 
    type: String, 
    required: true, 
    enum: ['Installation', 'Trading Guide', 'Settings', 'Alerts', 'Troubleshooting', 'FAQ'],
    default: 'Installation',
    index: true
  },
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

const DocArticle = mongoose.model('DocArticle', docArticleSchema);
export default DocArticle;
