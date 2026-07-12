import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { 
  sendOrderConfirmation, 
  sendAccessNotification, 
  sendExpiryWarning 
} from '../utils/email.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });
dotenv.config({ path: path.join(__dirname, '../.env') });

const runMailTest = async () => {
  console.log('=== Transactional Email Dispatcher Test ===');
  
  const testEmail = 'customer@example.com';
  
  // Dummy Order object
  const dummyOrder = {
    orderId: '64f8a20de29c4882bf88e12b',
    priceUsd: 49.00,
    planType: 'monthly',
    indicator: {
      name: 'SMC Pro Algos'
    }
  };

  try {
    // 1. Test Order Receipt Email
    console.log('\nSending mock Order Confirmation receipt...');
    await sendOrderConfirmation(testEmail, dummyOrder);

    // 2. Test TradingView Access Granted Email
    console.log('\nSending mock TradingView Access Granted notification...');
    await sendAccessNotification(testEmail, 'trader_joe', 'SMC Pro Algos', 'granted');

    // 3. Test Subscription Expiry Alert Email
    console.log('\nSending mock Subscription Expiry Warning notification...');
    await sendExpiryWarning(testEmail, 'SMC Pro Algos', 3);

    console.log('\n✅ All mail dispatches processed! Check console outputs or local log files.');
    console.log('Local Log Path: server/scratch/sent_emails.log');
  } catch (error) {
    console.error('❌ Mail Test Failed:', error);
  }
};

runMailTest();
