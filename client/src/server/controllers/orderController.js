import axios from 'axios';
import Order from '../models/Order.js';
import Indicator from '../models/Indicator.js';
import Coupon from '../models/Coupon.js';
import Payment from '../models/Payment.js';
import Affiliate from '../models/Affiliate.js';

// Removed mapPayCurrency as it is handled by NOWPayments hosted checkout

export const createOrder = async (req, res, next) => {
  try {
    const { indicatorId, planType, couponCode, referralCode } = req.body;
    
    if (!indicatorId || !planType) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'BAD_REQUEST',
          message: 'indicatorId and planType are required fields.'
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
    let invoiceUrl = '';

    if (!nowPaymentsApiKey || nowPaymentsApiKey === 'your_nowpayments_api_key_here') {
      return res.status(500).json({
        success: false,
        error: {
          code: 'PAYMENT_GATEWAY_UNCONFIGURED',
          message: 'The NOWPayments API Key is not configured on the server.'
        }
      });
    }

    try {
        const paymentPayload = {
          price_amount: finalPriceUsd,
          price_currency: 'usd',
          ipn_callback_url: `${process.env.BACKEND_URL}/api/payments/webhook`,
          order_id: `temp_${Date.now()}`, // will update or use temporary
          order_description: `${indicator.name} - ${planType.toUpperCase()}`,
          success_url: `${process.env.FRONTEND_URL}/dashboard`,
          cancel_url: `${process.env.FRONTEND_URL}/checkout/${indicator.slug}?plan=${planType}`
        };

        const response = await axios.post(`${baseUrl}/v1/invoice`, paymentPayload, {
          headers: {
            'x-api-key': nowPaymentsApiKey,
            'Content-Type': 'application/json'
          }
        });

        if (response.data) {
          providerPaymentId = response.data.id;
          invoiceUrl = response.data.invoice_url;
        }
    } catch (apiError) {
      console.error('NOWPayments API Error:', apiError.response?.data || apiError.message);
      return res.status(502).json({
        success: false,
        error: {
          code: 'PAYMENT_GATEWAY_ERROR',
          message: 'Failed to contact NOWPayments gateway. Please try again later.'
        }
      });
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
      amountUsd: finalPriceUsd,
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
    // (since during checkout subscription is not created yet; subscription is created AFTER payment is confirmed!)
    
    // Note: The Payment schema may require `subscription` by default if it was written strictly.
    // If you encounter a validation error saving the Payment model, ensure the `subscription` 
    // field in `Payment.js` is NOT required (required: false).

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
        invoiceUrl,
        indicator: {
          name: indicator.name,
          slug: indicator.slug
        },
        planType: order.planType,
        priceUsd: order.finalPriceUsd,
        payment: {
          id: payment.providerPaymentId,
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
