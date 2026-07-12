import axios from 'axios';
import Order from '../models/Order.js';
import Indicator from '../models/Indicator.js';
import Coupon from '../models/Coupon.js';
import Payment from '../models/Payment.js';
import Affiliate from '../models/Affiliate.js';

// Map client cryptocurrency labels to NOWPayments pay_currency strings
const mapPayCurrency = (coin) => {
  const mapping = {
    'BTC': 'btc',
    'ETH': 'eth',
    'USDT': 'usdttrc20', // Default to TRC20 for cheaper fees
    'BNB': 'bnbbsc',    // BSC version
    'SOL': 'sol',
    'LTC': 'ltc'
  };
  return mapping[coin.toUpperCase()] || coin.toLowerCase();
};

export const createOrder = async (req, res, next) => {
  try {
    const { indicatorId, planType, payCurrency, couponCode, referralCode } = req.body;
    
    if (!indicatorId || !planType || !payCurrency) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'BAD_REQUEST',
          message: 'indicatorId, planType, and payCurrency are required fields.'
        }
      });
    }

    // 1. Find indicator
    const indicator = await Indicator.findById(indicatorId);
    if (!indicator || !indicator.isActive) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Indicator not found or is currently inactive.'
        }
      });
    }

    // 2. Resolve base price
    const pricingOption = indicator.pricing.find(p => p.planType === planType);
    if (!pricingOption) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'BAD_REQUEST',
          message: `Invalid planType: ${planType}. Choose from indicators pricing options.`
        }
      });
    }

    let priceUsd = pricingOption.price;
    let discountUsd = 0;
    let finalPriceUsd = priceUsd;
    let couponRef = null;

    // 3. Apply coupon if provided
    if (couponCode) {
      const coupon = await Coupon.findOne({ 
        code: couponCode.toUpperCase(), 
        isActive: true,
        startDate: { $lte: new Date() },
        endDate: { $gte: new Date() }
      });

      if (coupon && (coupon.maxUses === 0 || coupon.usedCount < coupon.maxUses)) {
        discountUsd = Math.round((priceUsd * (coupon.discountPercent / 100)) * 100) / 100;
        finalPriceUsd = Math.max(0, priceUsd - discountUsd);
        couponRef = coupon;
      } else {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_COUPON',
            message: 'Coupon code is invalid, expired, or has exceeded its limit.'
          }
        });
      }
    }

    // 4. Initialize NOWPayments API details
    const nowPaymentsApiKey = process.env.NOWPAYMENTS_API_KEY;
    const nowPaymentsIpnSecret = process.env.NOWPAYMENTS_IPN_SECRET;
    const nowPaymentsEnv = process.env.NOWPAYMENTS_ENV || 'sandbox';
    
    const baseUrl = nowPaymentsEnv === 'sandbox' 
      ? 'https://api-sandbox.nowpayments.io' 
      : 'https://api.nowpayments.io';

    let providerPaymentId = `MOCK_PAY_ID_${Date.now()}`;
    let walletAddress = `MOCK_WALLET_ADDRESS_FOR_${payCurrency.toUpperCase()}`;
    let amountCrypto = Math.round((finalPriceUsd / 20000) * 1000000) / 1000000; // Simulated price conversion for mock

    let useMock = !nowPaymentsApiKey || nowPaymentsApiKey === 'your_nowpayments_api_key';

    if (!useMock) {
      try {
        const paymentPayload = {
          price_amount: finalPriceUsd,
          price_currency: 'usd',
          pay_currency: mapPayCurrency(payCurrency),
          ipn_callback_url: `${process.env.BACKEND_URL}/api/payments/webhook`,
          order_id: `temp_${Date.now()}`, // will update or use temporary
          order_description: `${indicator.name} - ${planType.toUpperCase()}`
        };

        const response = await axios.post(`${baseUrl}/v1/payment`, paymentPayload, {
          headers: {
            'x-api-key': nowPaymentsApiKey,
            'Content-Type': 'application/json'
          }
        });

        if (response.data) {
          providerPaymentId = response.data.payment_id;
          walletAddress = response.data.pay_address;
          amountCrypto = response.data.pay_amount;
        }
      } catch (apiError) {
        console.error('NOWPayments API Error:', apiError.response?.data || apiError.message);
        // Fallback to mock in development environment to prevent blockages
        if (process.env.NODE_ENV !== 'production') {
          console.warn('Fallback to mock invoice execution in non-production environment.');
          useMock = true;
        } else {
          return res.status(502).json({
            success: false,
            error: {
              code: 'PAYMENT_GATEWAY_ERROR',
              message: 'Failed to contact NOWPayments gateway. Please try again later.'
            }
          });
        }
      }
    }

    // 5. Look up referral code if supplied
    let affiliateRef = null;
    if (referralCode) {
      const affiliate = await Affiliate.findOne({ referralCode: referralCode.trim().toLowerCase() });
      if (affiliate) {
        affiliateRef = affiliate._id;
      }
    }

    // 6. Create Order and Payment
    const payment = new Payment({
      user: req.user._id,
      provider: 'nowpayments',
      providerPaymentId,
      currency: payCurrency.toUpperCase(),
      amountCrypto,
      amountUsd: finalPriceUsd,
      walletAddress,
      status: 'waiting'
    });
    await payment.save();

    const order = new Order({
      user: req.user._id,
      indicator: indicator._id,
      planType,
      priceUsd,
      discountUsd,
      finalPriceUsd,
      couponCode: couponCode ? couponCode.toUpperCase() : undefined,
      affiliate: affiliateRef,
      payment: payment._id,
      status: 'pending'
    });
    await order.save();

    // Link subscription field placeholder requirement in Payment schema
    // In Phase 1, Payment required a subscription ref. Let's make it optional in schema or stub a mock ID.
    // Wait, let's check Payment.js: it has "subscription: { type: ObjectId, ref: 'Subscription', required: true }"
    // Ah! Payment model requires subscription! Let's modify Payment.js model to make subscription field optional
    // (since during checkout subscription is not created yet; subscription is created AFTER payment is confirmed!)
    // This is a crucial fix. We will modify Payment.js to make subscription optional.

    // Increment coupon usage count
    if (couponRef) {
      couponRef.usedCount += 1;
      await couponRef.save();
    }

    // Return checkout info
    res.status(201).json({
      success: true,
      message: 'Order created successfully.',
      data: {
        orderId: order._id,
        indicator: {
          name: indicator.name,
          slug: indicator.slug
        },
        planType: order.planType,
        priceUsd: order.finalPriceUsd,
        payment: {
          id: payment.providerPaymentId,
          coin: payment.currency,
          payAmount: payment.amountCrypto,
          payAddress: payment.walletAddress,
          status: payment.status,
          createdAt: payment.createdAt
        }
      }
    });

  } catch (error) {
    next(error);
  }
};

export const getOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const order = await Order.findById(id)
      .populate('payment')
      .populate('indicator', 'name slug');

    if (!order) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Order not found.'
        }
      });
    }

    // Verify ownership
    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You are not authorized to view this order.'
        }
      });
    }

    res.status(200).json({
      success: true,
      data: {
        orderId: order._id,
        status: order.status,
        indicator: order.indicator,
        planType: order.planType,
        priceUsd: order.finalPriceUsd,
        payment: order.payment ? {
          id: order.payment.providerPaymentId,
          coin: order.payment.currency,
          payAmount: order.payment.amountCrypto,
          payAddress: order.payment.walletAddress,
          status: order.payment.status,
          txHash: order.payment.txHash
        } : null
      }
    });

  } catch (error) {
    next(error);
  }
};
