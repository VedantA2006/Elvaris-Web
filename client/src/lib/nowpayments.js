import axios from 'axios';
import crypto from 'crypto';

export const createInvoice = async ({ priceUsd, orderId, description, successUrl, cancelUrl }) => {
  const nowPaymentsApiKey = process.env.NOWPAYMENTS_API_KEY;
  const nowPaymentsEnv = process.env.NOWPAYMENTS_ENV || 'sandbox';

  const baseUrl = nowPaymentsEnv === 'sandbox'
    ? 'https://api-sandbox.nowpayments.io'
    : 'https://api.nowpayments.io';

  if (!nowPaymentsApiKey || nowPaymentsApiKey === 'your_nowpayments_api_key_here') {
    // If running without live key, return mock sandbox invoice for seamless local testing
    return {
      providerPaymentId: `MOCK_VIP_PAY_${Date.now()}`,
      invoiceUrl: `${successUrl}?mock_paid=true&order_id=${orderId}`
    };
  }

  const payload = {
    price_amount: Number(priceUsd),
    price_currency: 'usd',
    ipn_callback_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/vip/webhook`,
    order_id: orderId.toString(),
    order_description: description,
    success_url: successUrl,
    cancel_url: cancelUrl
  };

  try {
    const response = await axios.post(`${baseUrl}/v1/invoice`, payload, {
      headers: {
        'x-api-key': nowPaymentsApiKey,
        'Content-Type': 'application/json'
      }
    });

    if (response.data && response.data.id) {
      return {
        providerPaymentId: response.data.id.toString(),
        invoiceUrl: response.data.invoice_url
      };
    }

    throw new Error('Invalid response received from NOWPayments API.');
  } catch (err) {
    console.error('[NOWPayments Helper Error] Failed to create invoice:', err.response?.data || err.message);
    throw new Error(err.response?.data?.message || 'Payment gateway communication error.');
  }
};

export const verifyIpnSignature = (rawBody, signatureHeader, secret) => {
  if (!signatureHeader || !secret || !rawBody) return false;

  const sortedKeys = Object.keys(rawBody).sort();
  const sortedString = JSON.stringify(rawBody, sortedKeys);

  const hmac = crypto.createHmac('sha512', secret);
  hmac.update(sortedString);
  const calculatedSig = hmac.digest('hex');

  return calculatedSig === signatureHeader;
};
