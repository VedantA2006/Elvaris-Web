import { Resend } from 'resend';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const resend = new Resend(process.env.RESEND_API_KEY);

// Helper to log emails locally during development if Resend API Key is missing
const logEmailLocally = (to, subject, html) => {
  const logDir = path.join(__dirname, '../scratch');
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
  const logFile = path.join(logDir, 'sent_emails.log');
  const timestamp = new Date().toISOString();
  const logEntry = `\n========================================\n[${timestamp}] TO: ${to}\nSUBJECT: ${subject}\n----------------------------------------\n${html}\n========================================\n`;
  
  fs.appendFileSync(logFile, logEntry);
  console.log(`[Email Mock] Transactional Email logged locally to server/scratch/sent_emails.log. Subject: "${subject}"`);
};

const sendMail = async ({ to, subject, html }) => {
  const from = process.env.SMTP_FROM || 'Elvaris Technologies <noreply@elvaris.com>';

  // If no API key is provided or it's a dummy key, fall back to local logging
  if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === 'your_resend_api_key_here') {
    logEmailLocally(to, subject, html);
    return true;
  }

  try {
    const data = await resend.emails.send({
      from,
      to,
      subject,
      html,
    });

    if (data.error) {
      console.error('[Resend Error]', data.error);
      logEmailLocally(to, `[FAILED-RESEND] ${subject}`, html);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('[Email Dispatch Error] Failed to send email via Resend:', error.message);
    logEmailLocally(to, `[FAILED-RESEND] ${subject}`, html);
    return false;
  }
};

// 1. Send Order Confirmation
export const sendOrderConfirmation = async (userEmail, order) => {
  const subject = `Order Confirmed: Invoice #${order.orderId.toString().substring(18)}`;
  
  const html = `
    <div style="background-color: #05060A; color: #E4E4E7; font-family: sans-serif; padding: 40px; max-width: 600px; margin: 0 auto; border: 1px solid #1E293B; border-radius: 12px;">
      <h1 style="color: #00F5D4; text-align: center; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">ELVARIS TECHNOLOGIES</h1>
      <p style="text-align: center; color: #A1A1AA; font-size: 14px; margin-bottom: 30px;">Thank you for your purchase. Your payment has been confirmed.</p>
      
      <div style="background-color: #0B0D14; border: 1px solid #1E293B; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
        <h3 style="margin-top: 0; color: #F4F4F5; font-size: 14px; border-bottom: 1px solid #1E293B; padding-bottom: 10px;">ORDER DETAILS</h3>
        <table style="width: 100%; font-size: 12px; line-height: 20px;">
          <tr>
            <td style="color: #A1A1AA;">Order ID:</td>
            <td style="text-align: right; color: #F4F4F5; font-family: monospace;">#${order.orderId}</td>
          </tr>
          <tr>
            <td style="color: #A1A1AA;">Indicator:</td>
            <td style="text-align: right; color: #F4F4F5; font-weight: bold;">${order.indicator.name}</td>
          </tr>
          <tr>
            <td style="color: #A1A1AA;">Licensing Plan:</td>
            <td style="text-align: right; color: #F4F4F5; text-transform: uppercase;">${order.planType}</td>
          </tr>
          <tr>
            <td style="color: #A1A1AA; padding-top: 10px; font-weight: bold;">Total Paid:</td>
            <td style="text-align: right; color: #00F5D4; padding-top: 10px; font-weight: bold; font-size: 14px;">$${order.priceUsd} USD</td>
          </tr>
        </table>
      </div>

      <div style="background-color: #1E1B4B; border: 1px solid #4338CA; border-radius: 8px; padding: 15px; margin-bottom: 30px;">
        <p style="margin: 0; font-size: 12px; color: #C7D2FE; line-height: 18px; text-align: center;">
          <strong>Next Step:</strong> Link your TradingView username in your Elvaris Dashboard settings so we can authorize your account access immediately.
        </p>
      </div>

      <div style="text-align: center;">
        <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/login" style="background: linear-gradient(90deg, #3B82F6 0%, #8B5CF6 100%); color: #ffffff; text-decoration: none; padding: 12px 24px; font-size: 12px; font-weight: bold; border-radius: 8px; display: inline-block;">
          Go to Elvaris Settings
        </a>
      </div>
      
      <p style="font-size: 10px; color: #71717A; text-align: center; margin-top: 40px; border-top: 1px solid #1E293B; padding-top: 20px;">
        This is an automated receipt. For assistance or support, please reply directly or contact support@elvaris.com.
      </p>
    </div>
  `;

  return await sendMail({ to: userEmail, subject, html });
};

// 2. Send Access Activation Notification
export const sendAccessNotification = async (userEmail, username, indicatorName, status) => {
  const subject = status === 'granted' 
    ? `TradingView Access Granted: ${indicatorName}` 
    : `TradingView Access Status Update: ${indicatorName}`;

  const statusText = status === 'granted' ? 'GRANTED' : status.toUpperCase();
  const statusColor = status === 'granted' ? '#00F5D4' : '#F59E0B';

  const html = `
    <div style="background-color: #05060A; color: #E4E4E7; font-family: sans-serif; padding: 40px; max-width: 600px; margin: 0 auto; border: 1px solid #1E293B; border-radius: 12px;">
      <h1 style="color: #8B5CF6; text-align: center; font-size: 24px; font-weight: 800;">ELVARIS ACCESS AGENT</h1>
      <p style="text-align: center; color: #A1A1AA; font-size: 14px; margin-bottom: 30px;">Your indicator script invitation access status has been updated.</p>

      <div style="background-color: #0B0D14; border: 1px solid #1E293B; padding: 20px; border-radius: 8px; margin-bottom: 25px; text-align: left;">
        <table style="width: 100%; font-size: 12px; line-height: 22px;">
          <tr>
            <td style="color: #A1A1AA;">TradingView User:</td>
            <td style="text-align: right; color: #F4F4F5; font-family: monospace;">@${username}</td>
          </tr>
          <tr>
            <td style="color: #A1A1AA;">Indicator Package:</td>
            <td style="text-align: right; color: #F4F4F5; font-weight: bold;">${indicatorName}</td>
          </tr>
          <tr>
            <td style="color: #A1A1AA;">Access Status:</td>
            <td style="text-align: right; color: ${statusColor}; font-weight: bold; letter-spacing: 0.5px;">${statusText}</td>
          </tr>
        </table>
      </div>

      ${status === 'granted' ? `
        <div style="background-color: #022C22; border: 1px solid #065F46; border-radius: 8px; padding: 15px; margin-bottom: 30px; text-align: left;">
          <h4 style="margin: 0 0 5px 0; color: #34D399; font-size: 13px;">How to load the indicator:</h4>
          <ol style="margin: 0; padding-left: 20px; font-size: 12px; color: #A7F3D0; line-height: 18px;">
            <li>Open a new chart on TradingView.com.</li>
            <li>Click on <strong>Indicators</strong> (top toolbar).</li>
            <li>Select <strong>Invite-only scripts</strong> in the left sidebar menu.</li>
            <li>Click <strong>${indicatorName}</strong> to add it to your chart layout.</li>
          </ol>
        </div>
      ` : ''}

      <div style="text-align: center;">
        <a href="https://tradingview.com" target="_blank" style="background-color: #1E293B; border: 1px solid #334155; color: #ffffff; text-decoration: none; padding: 12px 24px; font-size: 12px; font-weight: bold; border-radius: 8px; display: inline-block;">
          Open TradingView Chart
        </a>
      </div>
      
      <p style="font-size: 10px; color: #71717A; text-align: center; margin-top: 40px; border-top: 1px solid #1E293B; padding-top: 20px;">
        If you experience issues loaded scripts, double-check your username spelling in your dashboard settings page or open a ticket.
      </p>
    </div>
  `;

  return await sendMail({ to: userEmail, subject, html });
};

// 3. Send Subscription Expiry Warning
export const sendExpiryWarning = async (userEmail, indicatorName, daysLeft) => {
  const isExpired = daysLeft <= 0;
  const subject = isExpired 
    ? `Subscription Expired: ${indicatorName}` 
    : `Action Required: Subscription Renewing in ${daysLeft} Days (${indicatorName})`;

  const titleText = isExpired ? 'Subscription Expired' : 'Renewal Notification';
  const descText = isExpired 
    ? `Your subscription for ${indicatorName} has expired. Invite-only TradingView scripts access has been revoked.`
    : `Your subscription for ${indicatorName} will expire in ${daysLeft} days. Renew now to avoid losing invite-only access.`;

  const html = `
    <div style="background-color: #05060A; color: #E4E4E7; font-family: sans-serif; padding: 40px; max-width: 600px; margin: 0 auto; border: 1px solid #1E293B; border-radius: 12px;">
      <h1 style="color: #EF4444; text-align: center; font-size: 24px; font-weight: 800;">${titleText}</h1>
      <p style="text-align: center; color: #A1A1AA; font-size: 14px; line-height: 20px; margin-bottom: 30px;">
        ${descText}
      </p>

      <div style="background-color: #0B0D14; border: 1px solid #1E293B; padding: 20px; border-radius: 8px; margin-bottom: 30px; text-align: left;">
        <h4 style="margin: 0 0 10px 0; color: #F4F4F5; font-size: 13px;">INDICATOR STATUS SUMMARY</h4>
        <table style="width: 100%; font-size: 12px; line-height: 20px;">
          <tr>
            <td style="color: #A1A1AA;">Script Name:</td>
            <td style="text-align: right; color: #F4F4F5; font-weight: bold;">${indicatorName}</td>
          </tr>
          <tr>
            <td style="color: #A1A1AA;">Time Remaining:</td>
            <td style="text-align: right; color: ${isExpired ? '#EF4444' : '#F59E0B'}; font-weight: bold;">
              ${isExpired ? '0 Days (Expired)' : `${daysLeft} Days`}
            </td>
          </tr>
        </table>
      </div>

      <div style="text-align: center;">
        <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/pricing" style="background-color: #EF4444; color: #ffffff; text-decoration: none; padding: 12px 24px; font-size: 12px; font-weight: bold; border-radius: 8px; display: inline-block;">
          ${isExpired ? 'Resubscribe Now' : 'Renew Subscription'}
        </a>
      </div>
      
      <p style="font-size: 10px; color: #71717A; text-align: center; margin-top: 40px; border-top: 1px solid #1E293B; padding-top: 20px;">
        If you have questions regarding billing details, contact support@elvaris.com.
      </p>
    </div>
  `;

  return await sendMail({ to: userEmail, subject, html });
};

// 4. Send Verification Email (New)
export const sendVerificationEmail = async (userEmail, verificationLink) => {
  const subject = "Verify your email - Elvaris Technologies";
  const html = `
    <div style="background-color: #05060A; color: #E4E4E7; font-family: sans-serif; padding: 40px; max-width: 600px; margin: 0 auto; border: 1px solid #1E293B; border-radius: 12px;">
      <h1 style="color: #00F5D4; text-align: center; font-size: 24px; font-weight: 800;">Welcome to Elvaris!</h1>
      <p style="text-align: center; color: #A1A1AA; font-size: 14px; margin-bottom: 30px;">
        Please verify your email address to complete your registration.
      </p>
      
      <div style="text-align: center;">
        <a href="${verificationLink}" style="background: linear-gradient(90deg, #3B82F6 0%, #8B5CF6 100%); color: #ffffff; text-decoration: none; padding: 12px 24px; font-size: 14px; font-weight: bold; border-radius: 8px; display: inline-block;">
          Verify Email Address
        </a>
      </div>
      
      <p style="text-align: center; color: #71717A; font-size: 12px; margin-top: 20px;">
        Or copy and paste this link into your browser: <br/>
        <a href="${verificationLink}" style="color: #3B82F6;">${verificationLink}</a>
      </p>
    </div>
  `;
  return await sendMail({ to: userEmail, subject, html });
};

// 5. Send Password Reset Email (New)
export const sendPasswordResetEmail = async (userEmail, resetLink) => {
  const subject = "Password Reset Request - Elvaris Technologies";
  const html = `
    <div style="background-color: #05060A; color: #E4E4E7; font-family: sans-serif; padding: 40px; max-width: 600px; margin: 0 auto; border: 1px solid #1E293B; border-radius: 12px;">
      <h1 style="color: #F59E0B; text-align: center; font-size: 24px; font-weight: 800;">Password Reset</h1>
      <p style="text-align: center; color: #A1A1AA; font-size: 14px; margin-bottom: 30px;">
        We received a request to reset your password. If you didn't make this request, you can safely ignore this email.
      </p>
      
      <div style="text-align: center;">
        <a href="${resetLink}" style="background-color: #F59E0B; color: #ffffff; text-decoration: none; padding: 12px 24px; font-size: 14px; font-weight: bold; border-radius: 8px; display: inline-block;">
          Reset Password
        </a>
      </div>
      
      <p style="text-align: center; color: #71717A; font-size: 12px; margin-top: 20px;">
        Or copy and paste this link into your browser: <br/>
        <a href="${resetLink}" style="color: #F59E0B;">${resetLink}</a>
      </p>
    </div>
  `;
  return await sendMail({ to: userEmail, subject, html });
};

// 6. Send Welcome Email (New)
export const sendWelcomeEmail = async (userEmail, userName) => {
  const subject = "Welcome to Elvaris Technologies!";
  const html = `
    <div style="background-color: #05060A; color: #E4E4E7; font-family: sans-serif; padding: 40px; max-width: 600px; margin: 0 auto; border: 1px solid #1E293B; border-radius: 12px;">
      <h1 style="color: #00F5D4; text-align: center; font-size: 24px; font-weight: 800;">Hello ${userName}!</h1>
      <p style="text-align: center; color: #A1A1AA; font-size: 14px; margin-bottom: 30px;">
        Your email has been successfully verified. Welcome to the Elvaris community!
      </p>
      <p style="text-align: center; color: #A1A1AA; font-size: 14px; margin-bottom: 30px;">
        You can now browse our premium TradingView indicators, manage your subscriptions, and link your TradingView account.
      </p>
      
      <div style="text-align: center;">
        <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/login" style="background: linear-gradient(90deg, #3B82F6 0%, #8B5CF6 100%); color: #ffffff; text-decoration: none; padding: 12px 24px; font-size: 14px; font-weight: bold; border-radius: 8px; display: inline-block;">
          Go to Dashboard
        </a>
      </div>
    </div>
  `;
  return await sendMail({ to: userEmail, subject, html });
};
