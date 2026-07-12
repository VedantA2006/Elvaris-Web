import Affiliate from '../models/Affiliate.js';
import User from '../models/User.js';
import Order from '../models/Order.js';
import AuditLog from '../models/AuditLog.js';

// 1. Register user as an affiliate
export const registerAffiliate = async (req, res, next) => {
  try {
    const { referralCode } = req.body;

    if (!referralCode || referralCode.trim() === '') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'BAD_REQUEST',
          message: 'Referral code is required.'
        }
      });
    }

    const cleanCode = referralCode.trim().toLowerCase();
    
    // Validate character sets (only alphanumeric, hyphens, and underscores)
    const codeRegex = /^[a-z0-9-_]+$/;
    if (!codeRegex.test(cleanCode)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_CHARACTERS',
          message: 'Referral code can only contain alphanumeric characters, hyphens, and underscores.'
        }
      });
    }

    if (cleanCode.length < 3 || cleanCode.length > 20) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_LENGTH',
          message: 'Referral code must be between 3 and 20 characters.'
        }
      });
    }

    // Check if user is already an affiliate
    const existingUserAff = await Affiliate.findOne({ user: req.user._id });
    if (existingUserAff) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'ALREADY_REGISTERED',
          message: 'You are already registered as an affiliate. Code: ' + existingUserAff.referralCode
        }
      });
    }

    // Check if code is already taken
    const existingCodeAff = await Affiliate.findOne({ referralCode: cleanCode });
    if (existingCodeAff) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'CODE_TAKEN',
          message: 'This referral code is already taken. Please try another one.'
        }
      });
    }

    // Create affiliate record
    const affiliate = new Affiliate({
      user: req.user._id,
      referralCode: cleanCode,
      commissionRate: 20 // default 20%
    });
    await affiliate.save();

    // Optionally promote user role to affiliate if currently customer
    const user = await User.findById(req.user._id);
    if (user.role === 'customer') {
      user.role = 'affiliate';
      await user.save();
    }

    // Create Audit Log
    const audit = new AuditLog({
      actor: user._id,
      action: 'AFFILIATE_REGISTERED',
      target: affiliate._id.toString(),
      after: {
        referralCode: cleanCode,
        commissionRate: 20
      }
    });
    await audit.save();

    res.status(201).json({
      success: true,
      message: 'Affiliate registered successfully.',
      data: affiliate
    });

  } catch (error) {
    next(error);
  }
};

// 2. Track click on referral link (public endpoint called on landing load)
export const trackClick = async (req, res, next) => {
  try {
    const { referralCode } = req.body;

    if (!referralCode) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'BAD_REQUEST',
          message: 'Referral code is required to track click.'
        }
      });
    }

    const affiliate = await Affiliate.findOne({ referralCode: referralCode.trim().toLowerCase() });
    if (!affiliate) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Referral code not found.'
        }
      });
    }

    // Increment clicks count
    affiliate.clicks += 1;
    await affiliate.save();

    res.status(200).json({
      success: true,
      message: 'Referral click tracked successfully.'
    });

  } catch (error) {
    next(error);
  }
};

// 3. Get affiliate statistics and recent sales referrals
export const getAffiliateStats = async (req, res, next) => {
  try {
    const affiliate = await Affiliate.findOne({ user: req.user._id });
    if (!affiliate) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Affiliate profile not found for this account.'
        }
      });
    }

    // Calculate conversion rate
    const conversionRate = affiliate.clicks > 0 
      ? Number(((affiliate.sales / affiliate.clicks) * 100).toFixed(2))
      : 0;

    // Retrieve recent referred orders
    const referredOrders = await Order.find({ affiliate: affiliate._id })
      .populate('user', 'name')
      .populate('indicator', 'name')
      .sort({ createdAt: -1 })
      .limit(10);

    // Format orders for dashboard
    const formattedOrders = referredOrders.map(order => ({
      id: order._id,
      indicatorName: order.indicator?.name || 'Indicator Bundle',
      finalPrice: order.finalPriceUsd,
      status: order.status,
      commissionEarned: Number((order.finalPriceUsd * (affiliate.commissionRate / 100)).toFixed(2)),
      createdAt: order.createdAt
    }));

    res.status(200).json({
      success: true,
      data: {
        referralCode: affiliate.referralCode,
        commissionRate: affiliate.commissionRate,
        clicks: affiliate.clicks,
        sales: affiliate.sales,
        conversionRate,
        earnings: affiliate.earnings,
        pendingWithdrawal: affiliate.pendingWithdrawal,
        totalWithdrawn: affiliate.totalWithdrawn,
        recentOrders: formattedOrders
      }
    });

  } catch (error) {
    next(error);
  }
};

// 4. Admin: Get all pending affiliate withdrawal requests
export const getAdminPayoutQueue = async (req, res, next) => {
  try {
    const affiliates = await Affiliate.find({ pendingWithdrawal: { $gt: 0 } })
      .populate('user', 'name email')
      .sort({ pendingWithdrawal: -1 });

    res.status(200).json({
      success: true,
      data: affiliates.map(aff => ({
        id: aff._id,
        referralCode: aff.referralCode,
        commissionRate: aff.commissionRate,
        pendingWithdrawal: aff.pendingWithdrawal,
        totalWithdrawn: aff.totalWithdrawn,
        userName: aff.user?.name || 'Unknown',
        userEmail: aff.user?.email || 'Unknown'
      }))
    });
  } catch (error) {
    next(error);
  }
};

// 5. Admin: Mark affiliate payout as processed/complete
export const completeAffiliatePayout = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { txHash } = req.body;

    const affiliate = await Affiliate.findById(id);
    if (!affiliate) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Affiliate not found.'
        }
      });
    }

    if (affiliate.pendingWithdrawal <= 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'NO_BALANCE',
          message: 'This affiliate has no pending withdrawal balance.'
        }
      });
    }

    const payoutAmount = affiliate.pendingWithdrawal;
    const oldPending = affiliate.pendingWithdrawal;
    const oldWithdrawn = affiliate.totalWithdrawn;

    affiliate.totalWithdrawn = Number((affiliate.totalWithdrawn + payoutAmount).toFixed(2));
    affiliate.pendingWithdrawal = 0;
    await affiliate.save();

    // Create Audit Log
    const audit = new AuditLog({
      actor: req.user._id,
      action: 'AFFILIATE_PAYOUT_COMPLETED',
      target: affiliate._id.toString(),
      before: {
        pendingWithdrawal: oldPending,
        totalWithdrawn: oldWithdrawn
      },
      after: {
        payoutAmount,
        totalWithdrawn: affiliate.totalWithdrawn,
        txHash: txHash || 'none'
      }
    });
    await audit.save();

    res.status(200).json({
      success: true,
      message: `Affiliate payout of $${payoutAmount} marked as completed successfully.`,
      data: {
        payoutAmount,
        totalWithdrawn: affiliate.totalWithdrawn
      }
    });

  } catch (error) {
    next(error);
  }
};
