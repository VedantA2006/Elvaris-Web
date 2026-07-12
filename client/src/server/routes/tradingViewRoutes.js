import { Router } from 'express';
import { 
  bindTradingViewUsername, 
  getAdminAccessQueue, 
  updateAccessStatus 
} from '../controllers/tradingViewController.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();

// Customer Bind Username
router.post('/bind', authenticate, bindTradingViewUsername);

// Admin Entitlement Queue Management
router.get('/admin/queue', authenticate, requireRole('admin'), getAdminAccessQueue);
router.post('/admin/queue/:id/status', authenticate, requireRole('admin'), updateAccessStatus);

export default router;
