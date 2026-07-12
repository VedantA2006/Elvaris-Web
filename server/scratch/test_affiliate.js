import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

import User from '../models/User.js';
import Indicator from '../models/Indicator.js';
import Order from '../models/Order.js';
import Payment from '../models/Payment.js';
import Affiliate from '../models/Affiliate.js';
import AuditLog from '../models/AuditLog.js';
import TradingViewAccess from '../models/TradingViewAccess.js';
import Subscription from '../models/Subscription.js';
import connectDB from '../config/db.js';
import { registerAffiliate, trackClick, getAffiliateStats } from '../controllers/affiliateController.js';
import { createOrder } from '../controllers/orderController.js';
import { nowpaymentsWebhook } from '../controllers/paymentController.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });
dotenv.config({ path: path.join(__dirname, '../.env') });

const runAffiliateTest = async () => {
  console.log('=== Affiliate Referral System Integration Test ===');
  
  // 1. Connect to DB
  console.log('Connecting to database...');
  await connectDB();

  let dummyPartner = null;
  let dummyCustomer = null;
  let dummyIndicator = null;
  let dummyAffiliate = null;
  let dummyOrder = null;

  try {
    // 2. Seed partner and customer users
    console.log('\nSeeding mock users...');
    
    dummyPartner = new User({
      name: 'Affiliate Partner Pro',
      email: 'affiliate@partner.com',
      passwordHash: 'partner123',
      isEmailVerified: true,
      role: 'customer'
    });
    await dummyPartner.save();

    dummyCustomer = new User({
      name: 'Referred Customer',
      email: 'referred@customer.com',
      passwordHash: 'cust123',
      isEmailVerified: true,
      role: 'customer'
    });
    await dummyCustomer.save();

    dummyIndicator = new Indicator({
      name: 'Affiliate Algos Pro',
      slug: 'affiliate-algos-pro',
      shortDescription: 'Short details',
      description: 'Long details',
      category: ['Forex'],
      tradingStyle: ['Swing'],
      pricing: [{ planType: 'monthly', price: 100 }],
      isActive: true
    });
    await dummyIndicator.save();

    console.log('Mock records seeded.');

    // 3. Register Affiliate
    console.log('\nTesting Affiliate Registration...');
    const regReq = {
      user: dummyPartner,
      body: { referralCode: 'partner_deal' }
    };
    
    let regResCode = null;
    let regResBody = null;
    const regRes = {
      status: (code) => {
        regResCode = code;
        return {
          json: (body) => {
            regResBody = body;
          }
        };
      }
    };

    await registerAffiliate(regReq, regRes, (err) => {
      if (err) throw err;
    });

    console.log(`Registration Response Status: ${regResCode}`);
    if (regResCode === 201 && regResBody.success) {
      console.log('✅ Affiliate registered successfully: Code is "@' + regResBody.data.referralCode + '"');
      dummyAffiliate = await Affiliate.findOne({ user: dummyPartner._id });
    } else {
      console.log('❌ Affiliate registration FAILED:', regResBody);
      return;
    }

    // Verify role upgrade
    const updatedPartner = await User.findById(dummyPartner._id);
    console.log(`Partner user role updated to: "${updatedPartner.role}" (Expected: "affiliate")`);
    if (updatedPartner.role === 'affiliate') {
      console.log('✅ User role promotion: PASSED');
    } else {
      console.log('❌ User role promotion: FAILED');
    }

    // 4. Track Link Click
    console.log('\nTesting Referral Click Tracking...');
    const clickReq = {
      body: { referralCode: 'partner_deal' }
    };
    
    let clickResCode = null;
    let clickResBody = null;
    const clickRes = {
      status: (code) => {
        clickResCode = code;
        return {
          json: (body) => {
            clickResBody = body;
          }
        };
      }
    };

    await trackClick(clickReq, clickRes, (err) => {
      if (err) throw err;
    });

    console.log(`Click Track response status: ${clickResCode}`);
    const checkAffClick = await Affiliate.findById(dummyAffiliate._id);
    console.log(`Affiliate Click Count is: ${checkAffClick.clicks} (Expected: 1)`);
    if (checkAffClick.clicks === 1) {
      console.log('✅ Click tracking increment: PASSED');
    } else {
      console.log('❌ Click tracking increment: FAILED');
    }

    // 5. Create Order with Referral Code
    console.log('\nTesting Referred Order Creation...');
    const orderReq = {
      user: dummyCustomer,
      body: {
        indicatorId: dummyIndicator._id,
        planType: 'monthly',
        payCurrency: 'USDT',
        referralCode: 'partner_deal'
      }
    };

    let orderResCode = null;
    let orderResBody = null;
    const orderRes = {
      status: (code) => {
        orderResCode = code;
        return {
          json: (body) => {
            orderResBody = body;
          }
        };
      }
    };

    await createOrder(orderReq, orderRes, (err) => {
      if (err) throw err;
    });

    console.log(`Order Creation Response status: ${orderResCode}`);
    if (orderResCode === 201 && orderResBody.success) {
      console.log('✅ Referred Order created successfully.');
      dummyOrder = await Order.findById(orderResBody.data.orderId).populate('payment');
      console.log(`Linked Affiliate on Order document: ${dummyOrder.affiliate} (Expected: ${dummyAffiliate._id})`);
      if (dummyOrder.affiliate?.toString() === dummyAffiliate._id.toString()) {
        console.log('✅ Order Affiliate mapping: PASSED');
      } else {
        console.log('❌ Order Affiliate mapping: FAILED');
      }
    } else {
      console.log('❌ Referred Order creation FAILED:', orderResBody);
      return;
    }

    // 6. Simulate Completed Payment Webhook to trigger commission credit
    console.log('\nSimulating Payment webhook completion...');
    const webhookReq = {
      headers: {
        'x-bypass-webhook-signature': 'true'
      },
      body: {
        payment_id: dummyOrder.payment.providerPaymentId,
        payment_status: 'finished',
        pay_address: dummyOrder.payment.walletAddress,
        price_amount: dummyOrder.priceUsd,
        price_currency: 'usd',
        pay_amount: dummyOrder.payment.amountCrypto,
        pay_currency: 'usdttrc20',
        order_id: `temp_${Date.now()}` // Bypass router handles matching by paymentId
      }
    };

    let webhookResCode = null;
    let webhookResBody = null;
    const webhookRes = {
      status: (code) => {
        webhookResCode = code;
        return {
          json: (body) => {
            webhookResBody = body;
          }
        };
      }
    };

    await nowpaymentsWebhook(webhookReq, webhookRes, (err) => {
      if (err) throw err;
    });

    console.log(`Webhook handler response status: ${webhookResCode}`);
    
    // 7. Verify Commission credited
    console.log('\nChecking Affiliate commission balances...');
    const finalAff = await Affiliate.findById(dummyAffiliate._id);
    
    // Commission rate is 20% on $100 price = $20
    console.log(`Affiliate Sales: ${finalAff.sales} (Expected: 1)`);
    console.log(`Affiliate Earnings: $${finalAff.earnings} USD (Expected: $20.00)`);
    console.log(`Affiliate Pending Payout: $${finalAff.pendingWithdrawal} USD (Expected: $20.00)`);

    if (finalAff.sales === 1 && finalAff.earnings === 20 && finalAff.pendingWithdrawal === 20) {
      console.log('✅ Affiliate commission credit: PASSED');
    } else {
      console.log('❌ Affiliate commission credit: FAILED');
    }

    // Verify Audit Log
    const audit = await AuditLog.findOne({
      action: 'AFFILIATE_COMMISSION_CREDITED',
      target: dummyAffiliate._id.toString()
    });

    if (audit) {
      console.log('✅ Audit Log verification: PASSED');
      console.log('Audit details:', audit.after);
    } else {
      console.log('❌ Audit Log verification: FAILED');
    }

  } catch (error) {
    console.error('❌ Affiliate System Test Failed with error:', error);
  } finally {
    // Clean up
    console.log('\nCleaning up seeded database entries...');
    if (dummyPartner) {
      await User.deleteOne({ _id: dummyPartner._id });
      await Affiliate.deleteOne({ user: dummyPartner._id });
      await AuditLog.deleteMany({ target: dummyAffiliate?._id.toString() });
    }
    if (dummyCustomer) {
      await User.deleteOne({ _id: dummyCustomer._id });
    }
    if (dummyIndicator) {
      await Indicator.deleteOne({ _id: dummyIndicator._id });
    }
    if (dummyOrder) {
      await Order.deleteOne({ _id: dummyOrder._id });
      await Payment.deleteOne({ _id: dummyOrder.payment?._id });
      // Delete any subscriptions created in background by webhook stub
      await Subscription.deleteMany({ user: dummyCustomer._id });
      await TradingViewAccess.deleteMany({ user: dummyCustomer._id });
      await AuditLog.deleteMany({ actor: dummyCustomer._id });
    }
    console.log('Cleanup completed.');

    // Disconnect
    await mongoose.disconnect();
    console.log('Disconnected database connection.');
  }
};

runAffiliateTest();
