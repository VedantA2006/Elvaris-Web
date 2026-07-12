import { Router } from 'express';
import { 
  getBlogPosts, 
  getBlogPostBySlug, 
  createBlogPost, 
  updateBlogPost, 
  deleteBlogPost 
} from '../controllers/blogController.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import { blogPostSchema } from '../validators/cmsValidators.js';

const router = Router();

// Public routes
router.get('/', getBlogPosts);
router.get('/:slug', getBlogPostBySlug);

// Admin-only routes
router.post('/', authenticate, requireRole('admin'), validate({ body: blogPostSchema }), createBlogPost);
router.put('/:id', authenticate, requireRole('admin'), validate({ body: blogPostSchema }), updateBlogPost);
router.delete('/:id', authenticate, requireRole('admin'), deleteBlogPost);

export default router;
