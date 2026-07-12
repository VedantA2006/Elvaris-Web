import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

import User from '../models/User.js';
import Indicator from '../models/Indicator.js';
import Subscription from '../models/Subscription.js';
import TradingViewAccess from '../models/TradingViewAccess.js';
import AuditLog from '../models/AuditLog.js';
import connectDB from '../config/db.js';
import { checkSubscriptionExpiries } from '../jobs/subscriptionExpiry.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });
dotenv.config({ path: path.join(__dirname, '../.env') });

const runJobTest = async () => {
  console.log('=== Expiry Checker Background Job Test ===');
  
  // 1. Connect to DB
  console.log('Connecting to database...');
  await connectDB();

  let dummyUser = null;
  let dummyIndicator = null;
  let dummySubscription = null;

  try {
    // 2. Seed dummy records
    console.log('\nSeeding mock records for testing...');
    
    dummyUser = new User({
      name: 'Job Tester Customer',
      email: 'jobtester@example.com',
      passwordHash: 'dummyhash123',
      tradingViewUsername: 'jobtester_tv',
      isEmailVerified: true
    });
    await dummyUser.save();

    dummyIndicator = new Indicator({
      name: 'Mock Script Pro',
      slug: 'mock-script-pro',
      shortDescription: 'Short details',
      description: 'Long details',
      category: ['Forex'],
      tradingStyle: ['Swing'],
      pricing: [{ planType: 'monthly', price: 49 }],
      isActive: true
    });
    await dummyIndicator.save();

    // End date set to 2 hours ago (expired)
    const endDate = new Date();
    endDate.setHours(endDate.getHours() - 2);

    dummySubscription = new Subscription({
      user: dummyUser._id,
      indicator: dummyIndicator._id,
      planType: 'monthly',
      price: 49,
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      endDate,
      status: 'active'
    });
    await dummySubscription.save();

    console.log(`Seeded expired Subscription: ${dummySubscription._id}`);

    // 3. Trigger Expiry Scanner
    console.log('\nTriggering checkSubscriptionExpiries scanner...');
    const result = await checkSubscriptionExpiries();
    console.log('Job returned output:', result);

    // 4. Verify Database Modifications
    console.log('\nVerifying database updates...');
    
    // Check subscription status
    const updatedSub = await Subscription.findById(dummySubscription._id);
    console.log(`Subscription Status updated to: "${updatedSub.status}" (Expected: "expired")`);
    if (updatedSub.status === 'expired') {
      console.log('✅ Subscription update check: PASSED');
    } else {
      console.log('❌ Subscription update check: FAILED');
    }

    // Check TradingView Access queue record
    const access = await TradingViewAccess.findOne({
      user: dummyUser._id,
      indicator: dummyIndicator._id
    });
    
    if (access) {
      console.log(`TradingView Access Status: "${access.status}" (Expected: "revoked")`);
      console.log(`TradingView Access Username: "@${access.tradingViewUsername}"`);
      if (access.status === 'revoked' && access.tradingViewUsername === 'jobtester_tv') {
        console.log('✅ Access Queue verification: PASSED');
      } else {
        console.log('❌ Access Queue verification: FAILED');
      }
    } else {
      console.log('❌ Access Queue verification: FAILED (No access record created)');
    }

    // Check Audit Log
    const audit = await AuditLog.findOne({
      action: 'SUBSCRIPTION_EXPIRED',
      actor: dummyUser._id
    });
    if (audit) {
      console.log('✅ Audit log entry: PASSED');
    } else {
      console.log('❌ Audit log entry: FAILED');
    }

  } catch (error) {
    console.error('❌ Expiry Checker Job Test Failed:', error);
  } finally {
    // 5. Clean up seeded documents
    console.log('\nCleaning up seeded database entries...');
    if (dummyUser) {
      await User.deleteOne({ _id: dummyUser._id });
      await TradingViewAccess.deleteMany({ user: dummyUser._id });
      await AuditLog.deleteMany({ user: dummyUser._id });
    }
    if (dummyIndicator) {
      await Indicator.deleteOne({ _id: dummyIndicator._id });
    }
    if (dummySubscription) {
      await Subscription.deleteOne({ _id: dummySubscription._id });
    }
    console.log('Cleanup completed.');

    // Disconnect DB
    await mongoose.disconnect();
    console.log('Disconnected database connection.');
  }
};

runJobTest();
