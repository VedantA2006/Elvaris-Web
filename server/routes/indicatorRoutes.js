import { Router } from 'express';
import { 
  getIndicators, 
  getIndicatorBySlug, 
  createIndicator, 
  updateIndicator, 
  deleteIndicator 
} from '../controllers/indicatorController.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import { indicatorSchema } from '../validators/cmsValidators.js';

const router = Router();

// Public routes
router.get('/', getIndicators);
router.get('/:slug', getIndicatorBySlug);

// Admin-only routes
router.post('/', authenticate, requireRole('admin'), validate({ body: indicatorSchema }), createIndicator);
router.put('/:id', authenticate, requireRole('admin'), validate({ body: indicatorSchema }), updateIndicator);
router.delete('/:id', authenticate, requireRole('admin'), deleteIndicator);

export default router;
