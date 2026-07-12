import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node';
import User from '../models/User.js';

export const authenticate = [
  ClerkExpressRequireAuth(),
  async (req, res, next) => {
    try {
      const clerkId = req.auth.userId;
      if (!clerkId) {
        return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'No Clerk User ID found.' } });
      }

      let dbUser = await User.findOne({ googleId: clerkId });
      
      if (!dbUser) {
        dbUser = new User({
          googleId: clerkId,
          name: 'Clerk User', // Fallback name
          email: `${clerkId}@clerk.elvaris.com`, // Fallback email
          passwordHash: 'CLERK_MANAGED', // Dummy password
          isEmailVerified: true
        });
        await dbUser.save();
      }
      
      req.user = dbUser;
      next();
    } catch (error) {
      next(error);
    }
  }
];

export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have permission to perform this action.'
        }
      });
    }
    next();
  };
};
