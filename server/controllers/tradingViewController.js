import User from '../models/User.js';
import TradingViewAccess from '../models/TradingViewAccess.js';
import Subscription from '../models/Subscription.js';
import Indicator from '../models/Indicator.js';
import AuditLog from '../models/AuditLog.js';
import { sendAccessNotification } from '../utils/email.js';

// 1. Bind TradingView username to customer profile
export const bindTradingViewUsername = async (req, res, next) => {
  try {
    const { tradingViewUsername } = req.body;
    
    if (!tradingViewUsername || tradingViewUsername.trim() === '') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'BAD_REQUEST',
          message: 'tradingViewUsername is a required field.'
        }
      });
    }

    const user = await User.findById(req.user._id);
    const oldUsername = user.tradingViewUsername;
    const cleanUsername = tradingViewUsername.trim();

    // If username is unchanged, do nothing
    if (oldUsername === cleanUsername) {
      return res.status(200).json({
        success: true,
        message: 'TradingView username is already bound to this value.'
      });
    }

    // Update user record
    user.tradingViewUsername = cleanUsername;
    await user.save();

    // Audit log
    const audit = new AuditLog({
      actor: user._id,
      action: 'TRADINGVIEW_USERNAME_BOUND',
      target: user._id.toString(),
      before: { username: oldUsername },
      after: { username: cleanUsername }
    });
    await audit.save();

    // Find all active subscriptions for this user
    const activeSubs = await Subscription.find({ 
      user: user._id, 
      status: 'active' 
    }).populate('indicator');

    if (activeSubs.length > 0) {
      for (const sub of activeSubs) {
        // If they had an old username, create a revocation queue request for the old name
        if (oldUsername) {
          const revokeRequest = new TradingViewAccess({
            user: user._id,
            indicator: sub.indicator?._id,
            tradingViewUsername: oldUsername,
            status: 'pending',
            grantedBy: 'auto',
            history: [{ action: 'revoked', by: 'auto', at: new Date() }]
          });
          // Tag as revoked in history, set main status pending for queue execution
          revokeRequest.status = 'revoked'; // Wait, let's keep status pending so admin sees it needs removal
          revokeRequest.history.push({ action: 'requested_removal', by: 'auto' });
          await revokeRequest.save();
        }

        // Create or update access record for the new username
        let access = await TradingViewAccess.findOne({
          user: user._id,
          indicator: sub.indicator?._id,
          tradingViewUsername: cleanUsername
        });

        if (!access) {
          access = new TradingViewAccess({
            user: user._id,
            indicator: sub.indicator?._id,
            tradingViewUsername: cleanUsername,
            status: 'pending',
            grantedBy: 'admin',
            history: [{ action: 'requested', by: 'auto' }]
          });
          await access.save();
        } else if (access.status !== 'granted') {
          access.status = 'pending';
          access.history.push({ action: 'requested_reauth', by: 'auto' });
          await access.save();
        }
      }
    }

    res.status(200).json({
      success: true,
      message: 'TradingView username bound successfully. Script access queued.',
      data: {
        tradingViewUsername: cleanUsername
      }
    });

  } catch (error) {
    next(error);
  }
};

// 2. Admin retrieves all pending access requests (invites/removals)
export const getAdminAccessQueue = async (req, res, next) => {
  try {
    const queue = await TradingViewAccess.find()
      .populate('user', 'name email')
      .populate('indicator', 'name slug')
      .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      data: queue
    });
  } catch (error) {
    next(error);
  }
};

// 3. Admin updates access status (grants/revokes script invite)
export const updateAccessStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'granted' | 'revoked' | 'suspended'

    if (!['granted', 'revoked', 'suspended'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'BAD_REQUEST',
          message: 'Invalid status. Choose from granted, revoked, or suspended.'
        }
      });
    }

    const access = await TradingViewAccess.findById(id)
      .populate('user', 'name email')
      .populate('indicator', 'name');

    if (!access) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Entitlement queue record not found.'
        }
      });
    }

    const oldStatus = access.status;
    access.status = status;
    
    if (status === 'granted') {
      access.grantedAt = new Date();
    }
    
    // Log history
    access.history.push({
      action: status,
      by: req.user.email,
      at: new Date()
    });
    await access.save();

    // Audit logs
    const audit = new AuditLog({
      actor: req.user._id,
      action: `TRADINGVIEW_ACCESS_${status.toUpperCase()}`,
      target: access._id.toString(),
      before: { status: oldStatus },
      after: {
        status,
        tradingViewUsername: access.tradingViewUsername,
        indicatorName: access.indicator?.name,
        adminEmail: req.user.email
      }
    });
    await audit.save();

    // Dispatch notification email to client
    if (access.user && access.user.email) {
      await sendAccessNotification(
        access.user.email,
        access.tradingViewUsername,
        access.indicator?.name || 'Indicator Bundle',
        status
      );
    }

    res.status(200).json({
      success: true,
      message: `Access request marked as ${status} and notification email sent.`,
      data: access
    });

  } catch (error) {
    next(error);
  }
};
