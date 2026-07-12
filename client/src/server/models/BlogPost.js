import mongoose from 'mongoose';

const blogPostSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  slug: { 
    type: String, 
    required: true, 
    unique: true, 
    index: true, 
    lowercase: true, 
    trim: true 
  },
  content: { type: String, required: true }, // Markdown supported content
  summary: { type: String, required: true },
  category: { 
    type: String, 
    required: true, 
    enum: ['Gold Strategies', 'Forex', 'Indicator Updates', 'Market Analysis', 'Trading Psychology'],
    default: 'Market Analysis'
  },
  bannerImage: { type: String },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { 
    type: String, 
    enum: ['draft', 'published'], 
    default: 'draft',
    index: true
  },
  publishedAt: { type: Date }
}, {
  timestamps: true
});

const BlogPost = mongoose.models.BlogPost || mongoose.model('BlogPost', blogPostSchema);
export default BlogPost;
