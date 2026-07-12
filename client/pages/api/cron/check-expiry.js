import { checkSubscriptionExpiries } from '../../../src/server/jobs/subscriptionExpiry.js';
import connectDB from '../../../src/lib/db.js';

export default async function handler(req, res) {
  // Simple security check (replace with a secure secret in production)
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.CRON_SECRET || 'secret'}`) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  try {
    await connectDB();
    const result = await checkSubscriptionExpiries();
    return res.status(200).json({ success: true, result });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
