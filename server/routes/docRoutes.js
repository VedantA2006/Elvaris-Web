import { Router } from 'express';
import { 
  getDocArticles, 
  getDocArticleBySlug, 
  createDocArticle, 
  updateDocArticle, 
  deleteDocArticle 
} from '../controllers/docController.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import { docArticleSchema } from '../validators/cmsValidators.js';

const router = Router();

// Public routes
router.get('/', getDocArticles);
router.get('/:slug', getDocArticleBySlug);

// Admin-only routes
router.post('/', authenticate, requireRole('admin'), validate({ body: docArticleSchema }), createDocArticle);
router.put('/:id', authenticate, requireRole('admin'), validate({ body: docArticleSchema }), updateDocArticle);
router.delete('/:id', authenticate, requireRole('admin'), deleteDocArticle);

export default router;
