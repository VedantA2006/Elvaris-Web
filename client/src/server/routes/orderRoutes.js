import { Router } from 'express';
import { createOrder, getOrderStatus } from '../controllers/orderController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// Secure endpoints
router.post('/', authenticate, createOrder);
router.get('/:id/status', authenticate, getOrderStatus);

export default router;
