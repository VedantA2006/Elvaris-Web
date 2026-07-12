import crypto from 'crypto';
import Payment from '../models/Payment.js';
import Order from '../models/Order.js';
import Subscription from '../models/Subscription.js';
import AuditLog from '../models/AuditLog.js';
import Affiliate from '../models/Affiliate.js';

// Simple subscription provisioner stub (will be fully integrated in Phase 4)
const provisionSubscription = async (order, payment) => {
  try {
    console.log(`[Provisioning] Creating subscription for User: ${order.user}, Indicator: ${order.indicator}, Plan: ${order.planType}`);
    
    // Calculate expiry date
    const startDate = new Date();
    const endDate = new Date();
    if (order.planType === 'monthly') {
      endDate.setDate(endDate.getDate() + 30);
    } else if (order.planType === 'quarterly') {
      endDate.setDate(endDate.getDate() + 90);
    } else if (order.planType === 'yearly') {
      endDate.setDate(endDate.getDate() + 365);
    } else if (order.planType === 'lifetime') {
      endDate.setFullYear(endDate.getFullYear() + 99); // 99 years for lifetime
    }

    const subscription = new Subscription({
      user: order.user,
      indicator: order.indicator,
      planType: order.planType,
      price: order.finalPriceUsd,
      startDate,
      endDate,
      status: 'active'
    });
    await subscription.save();

    // Link subscription back to payment
    payment.subscription = subscription._id;
    await payment.save();

    // Create Audit Log
    const audit = new AuditLog({
      actor: order.user,
      action: 'SUBSCRIPTION_PROVISIONED',
      target: subscription._id.toString(),
      after: {
        orderId: order._id,
        subscriptionId: subscription._id,
        planType: order.planType
      }
    });
    await audit.save();

    console.log(`[Provisioning] Subscription created successfully: ${subscription._id}`);
    return subscription;
  } catch (error) {
    console.error('[Provisioning Error] Failed to provision subscription:', error);
    // Write warning to audit log
    const audit = new AuditLog({
      actor: order.user,
      action: 'SUBSCRIPTION_PROVISION_FAILED',
      target: order._id.toString(),
      after: {
        error: error.message
      }
    });
    await audit.save();
  }
};

const creditAffiliateCommission = async (order) => {
  if (!order.affiliate) return;
  try {
    const affiliate = await Affiliate.findById(order.affiliate);
    if (!affiliate) return;

    const commission = Number((order.finalPriceUsd * (affiliate.commissionRate / 100)).toFixed(2));
    
    affiliate.sales += 1;
    affiliate.earnings += commission;
    affiliate.pendingWithdrawal += commission;
    await affiliate.save();

    // Create Audit Log
    const audit = new AuditLog({
      actor: order.user,
      action: 'AFFILIATE_COMMISSION_CREDITED',
      target: affiliate._id.toString(),
      after: {
        orderId: order._id,
        commissionEarned: commission,
        finalPriceUsd: order.finalPriceUsd
      }
    });
    await audit.save();

    console.log(`[Affiliate] Credited commission $${commission} to affiliate: ${affiliate.referralCode} for Order: ${order._id}`);
  } catch (err) {
    console.error('[Affiliate Error] Failed to credit commission:', err.message);
  }
};

const verifyIpnSignature = (payload, headerSig, secret) => {
  if (!headerSig || !secret) return false;
  
  // NOWPayments signature verification formula:
  // Sort the keys alphabetically, stringify, and generate HMAC SHA-512
  const sortedKeys = Object.keys(payload).sort();
  const sortedString = JSON.stringify(payload, sortedKeys);
  
  const hmac = crypto.createHmac('sha512', secret);
  hmac.update(sortedString);
  const calculatedSig = hmac.digest('hex');
  
  return calculatedSig === headerSig;
};

export const nowpaymentsWebhook = async (req, res, next) => {
  try {
    const signature = req.headers['x-nowpayments-sig'];
    const ipnSecret = process.env.NOWPAYMENTS_IPN_SECRET || 'your_nowpayments_ipn_secret';
    
    // Log incoming webhook for inspection
    console.log('[IPN Webhook] Received webhook payload:', req.body);

    // Skip signature check in development if no secret is set or if bypass header is present
    const isDev = process.env.NODE_ENV === 'development' || process.env.NODE_ENV === undefined;
    const bypassCheck = isDev && req.headers['x-bypass-webhook-signature'] === 'true';

    if (!bypassCheck) {
      if (!signature) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_SIGNATURE',
            message: 'Webhook signature header x-nowpayments-sig is missing.'
          }
        });
      }

      const isValid = verifyIpnSignature(req.body, signature, ipnSecret);
      if (!isValid) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'INVALID_SIGNATURE',
            message: 'Webhook cryptographic signature verification failed.'
          }
        });
      }
    }

    const { payment_id, payment_status, pay_address, pay_amount, order_id, txn_id } = req.body;

    // Find payment record
    const payment = await Payment.findOne({ providerPaymentId: payment_id.toString() });
    if (!payment) {
      // Return 200 to prevent retries but log a warning
      console.warn(`[IPN Webhook] Payment ID ${payment_id} not found in database.`);
      return res.status(200).json({ success: true, message: 'Payment not tracked.' });
    }

    // Capture webhook payload in payment logs
    payment.rawWebhookPayload = req.body;
    if (txn_id) {
      payment.txHash = txn_id;
    }

    // Map NOWPayments payment_status values
    // statuses: waiting, confirming, confirmed, sending, finished, failed, expired
    let newStatus = payment.status;
    if (payment_status === 'waiting') {
      newStatus = 'waiting';
    } else if (payment_status === 'confirming') {
      newStatus = 'confirming';
    } else if (payment_status === 'confirmed' || payment_status === 'finished') {
      newStatus = 'confirmed';
    } else if (payment_status === 'failed') {
      newStatus = 'failed';
    } else if (payment_status === 'expired') {
      newStatus = 'expired';
    }

    // If payment status is transitioning to confirmed
    if (newStatus === 'confirmed' && payment.status !== 'confirmed') {
      payment.status = 'confirmed';
      await payment.save();

      // Find matching Order
      const order = await Order.findOne({ payment: payment._id });
      if (order && order.status !== 'completed') {
        order.status = 'completed';
        await order.save();
        
        // Provision the user's indicator subscription
        await provisionSubscription(order, payment);
        
        // Credit Affiliate Commission if referred
        await creditAffiliateCommission(order);
      }
    } else {
      // Simple status update
      payment.status = newStatus;
      await payment.save();

      // Update Order if failed or expired
      if (newStatus === 'failed' || newStatus === 'expired') {
        const order = await Order.findOne({ payment: payment._id });
        if (order && order.status === 'pending') {
          order.status = newStatus;
          await order.save();
        }
      }
    }

    res.status(200).json({
      success: true,
      message: 'IPN processed successfully.'
    });

  } catch (error) {
    next(error);
  }
};
