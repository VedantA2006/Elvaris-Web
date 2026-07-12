import Order from '../models/Order.js';
import Payment from '../models/Payment.js';
import Subscription from '../models/Subscription.js';
import Affiliate from '../models/Affiliate.js';
import TradingViewAccess from '../models/TradingViewAccess.js';
import User from '../models/User.js';
import AuditLog from '../models/AuditLog.js';

// 1. Retrieve site-wide stats for admin dashboard
export const getAdminStats = async (req, res, next) => {
  try {
    // Aggregate completed orders revenue
    const revenueData = await Order.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$finalPriceUsd' } } }
    ]);
    const totalRevenue = revenueData.length > 0 ? Number(revenueData[0].total.toFixed(2)) : 0;

    // Counts
    const totalSales = await Order.countDocuments({ status: 'completed' });
    const activeSubscriptions = await Subscription.countDocuments({ status: 'active' });
    const totalAffiliates = await Affiliate.countDocuments();
    
    // Queues count
    const pendingTradingView = await TradingViewAccess.countDocuments({ status: 'pending' });
    const pendingPayouts = await Affiliate.countDocuments({ pendingWithdrawal: { $gt: 0 } });

    // Recent orders
    const recentOrders = await Order.find()
      .populate('user', 'name email')
      .populate('indicator', 'name')
      .sort({ createdAt: -1 })
      .limit(10);

    const formattedOrders = recentOrders.map(order => ({
      id: order._id,
      userName: order.user?.name || 'Unknown',
      userEmail: order.user?.email || 'Unknown',
      indicatorName: order.indicator?.name || 'Indicator Bundle',
      planType: order.planType,
      finalPrice: order.finalPriceUsd,
      status: order.status,
      createdAt: order.createdAt
    }));

    res.status(200).json({
      success: true,
      data: {
        totalRevenue,
        totalSales,
        activeSubscriptions,
        totalAffiliates,
        pendingTradingView,
        pendingPayouts,
        recentOrders: formattedOrders
      }
    });

  } catch (error) {
    next(error);
  }
};

// 2. Manually override order status to completed (useful for offline/manual support cases)
export const manuallyCompleteOrder = async (req, res, next) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Order not found.'
        }
      });
    }

    if (order.status === 'completed') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'ALREADY_COMPLETED',
          message: 'Order is already marked as completed.'
        }
      });
    }

    // 1. Update Order status
    const oldStatus = order.status;
    order.status = 'completed';
    await order.save();

    // 2. Update Payment status if present
    if (order.payment) {
      const payment = await Payment.findById(order.payment);
      if (payment) {
        payment.status = 'confirmed';
        await payment.save();
      }
    }

    // 3. Resolve subscription dates
    const startDate = new Date();
    const endDate = new Date();
    if (order.planType === 'monthly') endDate.setDate(endDate.getDate() + 30);
    else if (order.planType === 'quarterly') endDate.setDate(endDate.getDate() + 90);
    else if (order.planType === 'yearly') endDate.setDate(endDate.getDate() + 365);
    else if (order.planType === 'lifetime') endDate.setDate(endDate.getDate() + 36500); // ~100 years

    // 4. Provision subscription
    let subscription = await Subscription.findOne({
      user: order.user,
      indicator: order.indicator,
      status: 'active'
    });

    if (subscription) {
      // Extend existing subscription
      subscription.endDate = new Date(subscription.endDate.getTime() + (endDate - startDate));
      await subscription.save();
    } else {
      // Create new subscription
      subscription = new Subscription({
        user: order.user,
        indicator: order.indicator,
        planType: order.planType,
        price: order.finalPriceUsd,
        startDate,
        endDate,
        status: 'active'
      });
      await subscription.save();
    }

    // 5. Create or update TradingView entitlement request
    const user = await User.findById(order.user);
    if (user && user.tradingViewUsername) {
      let access = await TradingViewAccess.findOne({
        user: user._id,
        indicator: order.indicator,
        tradingViewUsername: user.tradingViewUsername
      });

      if (!access) {
        access = new TradingViewAccess({
          user: user._id,
          indicator: order.indicator,
          tradingViewUsername: user.tradingViewUsername,
          status: 'pending',
          grantedBy: 'admin',
          history: [{ action: 'requested', by: 'auto', at: new Date() }]
        });
        await access.save();
      } else if (access.status !== 'granted') {
        access.status = 'pending';
        access.history.push({ action: 'requested_reauth', by: 'auto', at: new Date() });
        await access.save();
      }
    }

    // 6. Credit affiliate commission if order is referred
    if (order.affiliate) {
      const affiliate = await Affiliate.findById(order.affiliate);
      if (affiliate) {
        const commission = Number((order.finalPriceUsd * (affiliate.commissionRate / 100)).toFixed(2));
        
        affiliate.sales += 1;
        affiliate.earnings += commission;
        affiliate.pendingWithdrawal += commission;
        await affiliate.save();

        const affAudit = new AuditLog({
          actor: req.user._id,
          action: 'AFFILIATE_COMMISSION_CREDITED',
          target: affiliate._id.toString(),
          after: {
            orderId: order._id,
            commissionEarned: commission,
            finalPriceUsd: order.finalPriceUsd
          }
        });
        await affAudit.save();
      }
    }

    // 7. Write Audit Log for manual complete action
    const audit = new AuditLog({
      actor: req.user._id,
      action: 'ORDER_MANUALLY_COMPLETED',
      target: order._id.toString(),
      before: { status: oldStatus },
      after: {
        orderId: order._id,
        subscriptionId: subscription._id,
        userId: order.user
      }
    });
    await audit.save();

    res.status(200).json({
      success: true,
      message: 'Order manually completed, subscription provisioned, and access queue updated successfully.',
      data: {
        orderId: order._id,
        subscriptionId: subscription._id
      }
    });

  } catch (error) {
    next(error);
  }
};

// 3. Fetch all users for the Clients admin tab
export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-passwordHash');
    res.status(200).json({
      success: true,
      data: users
    });
  } catch (error) {
    next(error);
  }
};
