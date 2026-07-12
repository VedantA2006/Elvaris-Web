import { Router } from 'express';
import { 
  registerAffiliate, 
  trackClick, 
  getAffiliateStats,
  getAdminPayoutQueue,
  completeAffiliatePayout
} from '../controllers/affiliateController.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();

// Public click tracker
router.post('/clicks', trackClick);

// Authenticated Affiliate features
router.post('/register', authenticate, registerAffiliate);
router.get('/stats', authenticate, getAffiliateStats);

// Admin-only payout features
router.get('/admin/payouts', authenticate, requireRole('admin'), getAdminPayoutQueue);
router.post('/admin/payouts/:id/complete', authenticate, requireRole('admin'), completeAffiliatePayout);

export default router;
