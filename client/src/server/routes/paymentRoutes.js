import { Router } from 'express';
import { nowpaymentsWebhook } from '../controllers/paymentController.js';

const router = Router();

// Public IPN callback
router.post('/webhook', nowpaymentsWebhook);

export default router;
