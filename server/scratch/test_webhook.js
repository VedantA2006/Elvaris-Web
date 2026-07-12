import crypto from 'crypto';
import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });
dotenv.config({ path: path.join(__dirname, '../.env') });

const TEST_SECRET = process.env.NOWPAYMENTS_IPN_SECRET || 'your_nowpayments_ipn_secret';
const WEBHOOK_URL = 'http://localhost:5000/api/payments/webhook';

// 1. Setup a test payload resembling a NOWPayments finished IPN payload
const payload = {
  payment_id: '5004123890',
  payment_status: 'finished',
  pay_address: '0x1234567890123456789012345678901234567890',
  price_amount: 49.00,
  price_currency: 'usd',
  pay_amount: 0.00245,
  pay_currency: 'btc',
  order_id: 'mock_order_123',
  txn_id: '0xhash123abc456def789'
};

// 2. Function to compute the signature using sorting
const calculateSignature = (body, secret) => {
  const sortedKeys = Object.keys(body).sort();
  const sortedString = JSON.stringify(body, sortedKeys);
  const hmac = crypto.createHmac('sha512', secret);
  hmac.update(sortedString);
  return hmac.digest('hex');
};

const runTest = async () => {
  console.log('=== Webhook Cryptographic Verification Test ===');
  
  // Set the environment variable locally in the script execution or rely on default
  process.env.NOWPAYMENTS_IPN_SECRET = TEST_SECRET;
  
  const validSignature = calculateSignature(payload, TEST_SECRET);
  console.log(`Generated Valid Signature: ${validSignature.substring(0, 20)}...`);

  // Test 1: Send request with INVALID signature (should fail with 401)
  console.log('\nTest 1: Sending request with INVALID signature...');
  try {
    const res = await axios.post(WEBHOOK_URL, payload, {
      headers: {
        'x-nowpayments-sig': 'badsignature12345'
      }
    });
    console.log('❌ Test 1 FAILED (Expected 401, but got status:', res.status);
  } catch (err) {
    if (err.response && err.response.status === 401) {
      console.log('✅ Test 1 PASSED: Webhook successfully blocked invalid signature (401 Unauthorized)');
    } else {
      console.log('❌ Test 1 FAILED:', err.message);
    }
  }

  // Test 2: Send request with VALID signature
  // Note: We need a payment in the database to test the full update flow, but the signature validation itself
  // is the core part we are testing here. Since we seeded our DB, let's see. If the signature matches,
  // the controller looks for the payment. If the payment isn't found, the controller logs a warning
  // and returns 200 OK (to prevent NOWPayments from continuously retrying).
  console.log('\nTest 2: Sending request with VALID signature...');
  try {
    const res = await axios.post(WEBHOOK_URL, payload, {
      headers: {
        'x-nowpayments-sig': validSignature
      }
    });
    console.log('Status returned:', res.status, res.data);
    if (res.status === 200 && res.data.success === true) {
      console.log('✅ Test 2 PASSED: Signature validated and processed correctly (200 OK)');
    } else {
      console.log('❌ Test 2 FAILED (Unexpected response shape)');
    }
  } catch (err) {
    console.log('❌ Test 2 FAILED:', err.response?.data || err.message);
  }
};

runTest();
