import { auth } from '@clerk/nextjs/server';
import connectDB from './db.js';
import User from './models/User.js';

export const getOrCreateDbUser = async () => {
  const { userId } = auth();

  if (!userId) {
    const error = new Error('Authentication required');
    error.status = 401;
    throw error;
  }

  await connectDB();

  let dbUser = await User.findOne({ googleId: userId });

  if (!dbUser) {
    dbUser = new User({
      googleId: userId,
      name: 'Clerk User',
      email: `${userId}@clerk.elvaris.com`,
      passwordHash: 'CLERK_MANAGED',
      isEmailVerified: true
    });
    await dbUser.save();
  }

  return dbUser;
};

export const requireAdmin = (dbUser) => {
  if (!dbUser || dbUser.role !== 'admin') {
    const error = new Error('Forbidden: Administrative privileges required');
    error.status = 403;
    throw error;
  }
  return true;
};
