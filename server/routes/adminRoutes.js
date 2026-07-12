import { Router } from 'express';
import { getAdminStats, manuallyCompleteOrder } from '../controllers/adminController.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();

// Protect all routes with admin authentication
router.use(authenticate, requireRole('admin'));

// Admin endpoints
router.get('/stats', getAdminStats);
router.post('/orders/:id/complete', manuallyCompleteOrder);

export default router;
