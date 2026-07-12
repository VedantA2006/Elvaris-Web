import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { 
  register, 
  login, 
  refresh, 
  logout, 
  verifyEmail, 
  forgotPassword, 
  resetPassword 
} from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import { 
  registerSchema, 
  loginSchema, 
  forgotPasswordSchema, 
  resetPasswordSchema, 
  verifyEmailSchema 
} from '../validators/authValidators.js';

const router = Router();

// Apply stricter rate limiting on authentication routes to prevent brute-forcing
const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 20 auth-related requests per windowMs
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Too many authentication attempts from this IP, please try again after 15 minutes'
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/register', authRateLimiter, validate({ body: registerSchema }), register);
router.post('/login', authRateLimiter, validate({ body: loginSchema }), login);
router.post('/refresh', refresh);
router.post('/logout', authenticate, logout);
router.post('/verify-email', validate({ body: verifyEmailSchema }), verifyEmail);
router.post('/forgot-password', authRateLimiter, validate({ body: forgotPasswordSchema }), forgotPassword);
router.post('/reset-password', authRateLimiter, validate({ body: resetPasswordSchema }), resetPassword);

export default router;
