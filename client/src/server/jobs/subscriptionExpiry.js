import Subscription from '../models/Subscription.js';
import TradingViewAccess from '../models/TradingViewAccess.js';
import AuditLog from '../models/AuditLog.js';
import { sendExpiryWarning } from '../utils/email.js';

export const checkSubscriptionExpiries = async () => {
  console.log('[Expiry Job] Executing subscription expiry scans...');
  const now = new Date();
  let expiredCount = 0;
  let warningCount = 0;

  try {
    // 1. Scan for subscriptions that have already expired
    const expiredSubs = await Subscription.find({
      status: 'active',
      endDate: { $lte: now }
    }).populate('user').populate('indicator');

    for (const sub of expiredSubs) {
      // Mark subscription as expired
      sub.status = 'expired';
      await sub.save();

      expiredCount++;

      // Create Audit Log
      const audit = new AuditLog({
        actor: sub.user?._id || null,
        action: 'SUBSCRIPTION_EXPIRED',
        target: sub._id.toString(),
        after: {
          indicatorName: sub.indicator?.name
        }
      });
      await audit.save();

      // Revoke TradingView Access
      if (sub.user && sub.indicator) {
        // Find existing access record for this username
        const access = await TradingViewAccess.findOne({
          user: sub.user._id,
          indicator: sub.indicator._id,
          tradingViewUsername: sub.user.tradingViewUsername
        });

        if (access) {
          access.status = 'revoked';
          access.history.push({
            action: 'revoked',
            by: 'auto',
            at: new Date()
          });
          await access.save();
        } else if (sub.user.tradingViewUsername) {
          // If no active access record is found but username exists, create one to queue removal
          const newRevoke = new TradingViewAccess({
            user: sub.user._id,
            indicator: sub.indicator._id,
            tradingViewUsername: sub.user.tradingViewUsername,
            status: 'revoked',
            history: [{ action: 'revoked', by: 'auto', at: new Date() }]
          });
          await newRevoke.save();
        }

        // Send Expiry Notification Email
        if (sub.user.email) {
          await sendExpiryWarning(sub.user.email, sub.indicator.name, 0);
        }
      }
      
      console.log(`[Expiry Job] Processed expired license: ${sub._id} (User: ${sub.user?.email})`);
    }

    // 2. Scan for subscriptions expiring in exactly 3 days (Warning alerts)
    const warningStart = new Date(now);
    warningStart.setDate(warningStart.getDate() + 3);
    warningStart.setHours(0, 0, 0, 0);

    const warningEnd = new Date(now);
    warningEnd.setDate(warningEnd.getDate() + 3);
    warningEnd.setHours(23, 59, 59, 999);

    const expiringSoon = await Subscription.find({
      status: 'active',
      endDate: { $gte: warningStart, $lte: warningEnd }
    }).populate('user').populate('indicator');

    for (const sub of expiringSoon) {
      if (sub.user && sub.user.email && sub.indicator) {
        await sendExpiryWarning(sub.user.email, sub.indicator.name, 3);
        warningCount++;
      }
    }

    console.log(`[Expiry Job] Completed scans. Expired subscriptions updated: ${expiredCount}. Warnings dispatched: ${warningCount}.`);
    return { expiredCount, warningCount };

  } catch (error) {
    console.error('[Expiry Job Error] Failed executing job:', error);
    return { error: error.message };
  }
};

// Start background cron checking every 12 hours
export const startExpiryScheduler = () => {
  // Check immediately on launch
  checkSubscriptionExpiries();
  
  // Set interval to check every 12 hours (12 * 60 * 60 * 1000 ms)
  const INTERVAL_MS = 12 * 60 * 60 * 1000;
  setInterval(checkSubscriptionExpiries, INTERVAL_MS);
  
  console.log('[Expiry Job] Background scheduler initialized (runs every 12 hours).');
};
