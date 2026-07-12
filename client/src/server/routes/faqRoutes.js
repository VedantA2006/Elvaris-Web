import { Router } from 'express';
import { 
  getFAQs, 
  createFAQ, 
  updateFAQ, 
  deleteFAQ 
} from '../controllers/faqController.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import { faqSchema } from '../validators/cmsValidators.js';

const router = Router();

// Public routes
router.get('/', getFAQs);

// Admin-only routes
router.post('/', authenticate, requireRole('admin'), validate({ body: faqSchema }), createFAQ);
router.put('/:id', authenticate, requireRole('admin'), validate({ body: faqSchema }), updateFAQ);
router.delete('/:id', authenticate, requireRole('admin'), deleteFAQ);

export default router;
