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
import Subscription from '../models/Subscription.js';
import TradingViewAccess from '../models/TradingViewAccess.js';
import connectDB from '../config/db.js';

import { getAdminStats, manuallyCompleteOrder } from '../controllers/adminController.js';
import { getAdminPayoutQueue, completeAffiliatePayout } from '../controllers/affiliateController.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });
dotenv.config({ path: path.join(__dirname, '../.env') });

const runAdminTest = async () => {
  console.log('=== Admin Dashboard Integration Test ===');
  
  // 1. Connect to DB
  console.log('Connecting to database...');
  await connectDB();

  let dummyAdmin = null;
  let dummyUser = null;
  let dummyIndicator = null;
  let dummyOrder = null;
  let dummyPayment = null;
  let dummyAffiliate = null;

  try {
    // 2. Seed mock data
    console.log('\nSeeding mock data for tests...');
    
    // Clear duplicates defensively
    await User.deleteMany({ email: { $in: ['admin@elvaris.com', 'customer@elvaris.com'] } });
    await Affiliate.deleteMany({ referralCode: 'admin_test_partner' });
    await Indicator.deleteMany({ slug: 'premium-cloud-breakout' });
    
    dummyAdmin = new User({
      name: 'System Admin Pro',
      email: 'admin@elvaris.com',
      passwordHash: 'admin123',
      isEmailVerified: true,
      role: 'admin'
    });
    await dummyAdmin.save();

    dummyUser = new User({
      name: 'Regular Customer',
      email: 'customer@elvaris.com',
      passwordHash: 'cust123',
      isEmailVerified: true,
      role: 'customer',
      tradingViewUsername: 'customer_tv'
    });
    await dummyUser.save();

    dummyIndicator = new Indicator({
      name: 'Premium Cloud Breakout',
      slug: 'premium-cloud-breakout',
      shortDescription: 'Breakout indicators',
      description: 'Long description details',
      category: ['Crypto'],
      tradingStyle: ['Scalping'],
      pricing: [{ planType: 'monthly', price: 99.99 }],
      isActive: true
    });
    await dummyIndicator.save();

    dummyPayment = new Payment({
      user: dummyUser._id,
      providerPaymentId: 'ADMIN_MOCK_PAY_ID_' + Date.now(),
      amountCrypto: 0.003,
      amountUsd: 99.99,
      currency: 'BTC',
      walletAddress: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
      status: 'waiting'
    });
    await dummyPayment.save();

    dummyOrder = new Order({
      orderId: 'ORD_' + Date.now(),
      user: dummyUser._id,
      indicator: dummyIndicator._id,
      planType: 'monthly',
      priceUsd: 99.99,
      finalPriceUsd: 99.99,
      payment: dummyPayment._id,
      status: 'pending'
    });
    await dummyOrder.save();

    // Seed affiliate partner with pending payout
    dummyAffiliate = new Affiliate({
      user: dummyUser._id,
      referralCode: 'admin_test_partner',
      commissionRate: 20,
      clicks: 10,
      sales: 2,
      earnings: 40.00,
      pendingWithdrawal: 40.00,
      totalWithdrawn: 0.00
    });
    await dummyAffiliate.save();

    console.log('Seed completed successfully.');

    // 3. Test: Get Admin Stats
    console.log('\nTesting Stats Aggregation (getAdminStats)...');
    const statsReq = { user: dummyAdmin };
    let statsCode = null;
    let statsBody = null;
    const statsRes = {
      status: (code) => {
        statsCode = code;
        return {
          json: (body) => {
            statsBody = body;
          }
        };
      }
    };

    await getAdminStats(statsReq, statsRes, (err) => { if (err) throw err; });
    console.log(`Stats Response Status: ${statsCode}`);
    if (statsCode === 200 && statsBody.success) {
      console.log('✅ Stats retrieval: PASSED');
      console.log('Summary stats:', statsBody.data);
    } else {
      console.log('❌ Stats retrieval: FAILED', statsBody);
    }

    // 4. Test: Manually Complete Order
    console.log('\nTesting Manual Order Override (manuallyCompleteOrder)...');
    const completeReq = {
      user: dummyAdmin,
      params: { id: dummyOrder._id }
    };
    let completeCode = null;
    let completeBody = null;
    const completeRes = {
      status: (code) => {
        completeCode = code;
        return {
          json: (body) => {
            completeBody = body;
          }
        };
      }
    };

    await manuallyCompleteOrder(completeReq, completeRes, (err) => { if (err) throw err; });
    console.log(`Override Response Status: ${completeCode}`);
    if (completeCode === 200 && completeBody.success) {
      console.log('✅ Manual order override API: PASSED');

      // Verify db changes
      const checkOrder = await Order.findById(dummyOrder._id);
      const checkPayment = await Payment.findById(dummyPayment._id);
      const checkSub = await Subscription.findOne({ user: dummyUser._id, indicator: dummyIndicator._id });
      const checkAccess = await TradingViewAccess.findOne({ user: dummyUser._id, indicator: dummyIndicator._id });
      const checkAudit = await AuditLog.findOne({ action: 'ORDER_MANUALLY_COMPLETED', target: dummyOrder._id.toString() });

      console.log(`Order Status is now: "${checkOrder.status}" (Expected: "completed")`);
      console.log(`Payment Status is now: "${checkPayment.status}" (Expected: "confirmed")`);
      console.log(`Subscription active: ${!!checkSub} (Expected: true)`);
      console.log(`TradingView Access Pending Request queued: ${!!checkAccess} (Expected: true)`);
      console.log(`Audit Log written: ${!!checkAudit} (Expected: true)`);

      if (checkOrder.status === 'completed' && checkPayment.status === 'confirmed' && checkSub && checkAccess && checkAudit) {
        console.log('✅ Order manual override verification: PASSED');
      } else {
        console.log('❌ Order manual override verification: FAILED');
      }
    } else {
      console.log('❌ Manual order override API: FAILED', completeBody);
    }

    // 5. Test: Get Payout Queue & Complete Payout
    console.log('\nTesting Affiliate Payouts Queue...');
    const queueReq = { user: dummyAdmin };
    let queueCode = null;
    let queueBody = null;
    const queueRes = {
      status: (code) => {
        queueCode = code;
        return {
          json: (body) => {
            queueBody = body;
          }
        };
      }
    };

    await getAdminPayoutQueue(queueReq, queueRes, (err) => { if (err) throw err; });
    console.log(`Payout Queue Response Status: ${queueCode}`);
    if (queueCode === 200 && queueBody.success) {
      console.log('✅ Payout Queue lookup: PASSED');
      console.log('Payout items:', queueBody.data);
    } else {
      console.log('❌ Payout Queue lookup: FAILED');
    }

    console.log('\nTesting Payout Processing (completeAffiliatePayout)...');
    const payReq = {
      user: dummyAdmin,
      params: { id: dummyAffiliate._id },
      body: { txHash: '0x88f21918a38c82b412' }
    };
    let payCode = null;
    let payBody = null;
    const payRes = {
      status: (code) => {
        payCode = code;
        return {
          json: (body) => {
            payBody = body;
          }
        };
      }
    };

    await completeAffiliatePayout(payReq, payRes, (err) => { if (err) throw err; });
    console.log(`Payout Process Response Status: ${payCode}`);
    if (payCode === 200 && payBody.success) {
      console.log('✅ Payout Process API: PASSED');

      // Verify db changes
      const checkAff = await Affiliate.findById(dummyAffiliate._id);
      const checkAudit = await AuditLog.findOne({ action: 'AFFILIATE_PAYOUT_COMPLETED', target: dummyAffiliate._id.toString() });

      console.log(`Affiliate pending withdrawal is now: $${checkAff.pendingWithdrawal} (Expected: 0)`);
      console.log(`Affiliate total withdrawn is now: $${checkAff.totalWithdrawn} (Expected: 40.00)`);
      console.log(`Payout Audit Log written: ${!!checkAudit} (Expected: true)`);

      if (checkAff.pendingWithdrawal === 0 && checkAff.totalWithdrawn === 40.00 && checkAudit) {
        console.log('✅ Affiliate payout verification: PASSED');
      } else {
        console.log('❌ Affiliate payout verification: FAILED');
      }
    } else {
      console.log('❌ Payout Process API: FAILED', payBody);
    }

  } catch (error) {
    console.error('❌ Admin System integration test execution failed:', error.message);
  } finally {
    // Clean up
    console.log('\nCleaning up seeded database entries...');
    if (dummyAdmin) await User.deleteOne({ _id: dummyAdmin._id });
    if (dummyUser) {
      await User.deleteOne({ _id: dummyUser._id });
      await Affiliate.deleteOne({ user: dummyUser._id });
      await Subscription.deleteMany({ user: dummyUser._id });
      await TradingViewAccess.deleteMany({ user: dummyUser._id });
      await AuditLog.deleteMany({ actor: dummyUser._id });
    }
    if (dummyIndicator) await Indicator.deleteOne({ _id: dummyIndicator._id });
    if (dummyOrder) {
      await Order.deleteOne({ _id: dummyOrder._id });
      await Payment.deleteOne({ _id: dummyOrder.payment });
      await AuditLog.deleteMany({ target: dummyOrder._id.toString() });
    }
    if (dummyAffiliate) {
      await AuditLog.deleteMany({ target: dummyAffiliate._id.toString() });
    }
    console.log('Cleanup completed.');

    // Disconnect
    await mongoose.disconnect();
    console.log('Disconnected database connection.');
  }
};

runAdminTest();
