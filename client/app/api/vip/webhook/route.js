import { NextResponse } from 'next/server';
import connectDB from '../../../../src/lib/db.js';
import VipOrder from '../../../../src/lib/models/VipOrder.js';
import VipMembership from '../../../../src/lib/models/VipMembership.js';
import VipTier from '../../../../src/lib/models/VipTier.js';
import User from '../../../../src/lib/models/User.js';
import AuditLog from '../../../../src/lib/models/AuditLog.js';
import { verifyIpnSignature } from '../../../../src/lib/nowpayments.js';
import { sendVipWelcomeEmail } from '../../../../src/lib/utils/email.js';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    const signature = req.headers.get('x-nowpayments-sig');
    const ipnSecret = process.env.NOWPAYMENTS_IPN_SECRET || 'your_nowpayments_ipn_secret';
    const body = await req.json().catch(() => ({}));

    console.log('[VIP IPN Webhook] Received payload:', body);

    const isDev = process.env.NODE_ENV === 'development' || process.env.NODE_ENV === undefined;
    const bypassCheck = isDev && req.headers.get('x-bypass-webhook-signature') === 'true';

    if (!bypassCheck) {
      if (!signature) {
        return NextResponse.json({
          success: false,
          error: { code: 'MISSING_SIGNATURE', message: 'x-nowpayments-sig header missing.' }
        }, { status: 400 });
      }

      const isValid = verifyIpnSignature(body, signature, ipnSecret);
      if (!isValid) {
        return NextResponse.json({
          success: false,
          error: { code: 'INVALID_SIGNATURE', message: 'Signature verification failed.' }
        }, { status: 401 });
      }
    }

    await connectDB();

    const { payment_id, payment_status, order_id } = body;
    const vipOrder = await VipOrder.findById(order_id).populate('vipTier') ||
                     await VipOrder.findOne({ providerPaymentId: payment_id?.toString() }).populate('vipTier');

    if (!vipOrder) {
      console.warn(`[VIP IPN Webhook] Order ${order_id || payment_id} not found.`);
      return NextResponse.json({ success: true, message: 'VIP Order not tracked.' }, { status: 200 });
    }

    let newStatus = vipOrder.status;
    if (payment_status === 'waiting' || payment_status === 'confirming') {
      newStatus = 'pending';
    } else if (payment_status === 'confirmed' || payment_status === 'finished') {
      newStatus = 'completed';
    } else if (payment_status === 'failed' || payment_status === 'expired') {
      newStatus = payment_status;
    }

    if (newStatus === 'completed' && vipOrder.status !== 'completed') {
      vipOrder.status = 'completed';
      await vipOrder.save();

      // Provision active membership
      const tier = vipOrder.vipTier || await VipTier.findById(vipOrder.vipTier);
      let expiresAt = null;
      if (tier && tier.billingCycle === 'monthly') {
        expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      } else if (tier && tier.billingCycle === 'yearly') {
        expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
      }

      let membership = await VipMembership.findOne({ user: vipOrder.user });
      if (!membership) {
        membership = new VipMembership({
          user: vipOrder.user,
          vipTier: tier?._id || vipOrder.vipTier,
          status: 'active',
          joinedAt: new Date(),
          expiresAt,
          vipOrder: vipOrder._id
        });
      } else {
        membership.status = 'active';
        membership.vipTier = tier?._id || vipOrder.vipTier;
        membership.joinedAt = membership.joinedAt || new Date();
        membership.expiresAt = expiresAt;
        membership.vipOrder = vipOrder._id;
      }
      await membership.save();

      // Send Welcome Email
      const userDoc = await User.findById(vipOrder.user);
      if (userDoc && userDoc.email) {
        await sendVipWelcomeEmail(userDoc.email, membership);
      }

      // Record Audit Log
      const audit = new AuditLog({
        actor: vipOrder.user,
        action: 'VIP_MEMBERSHIP_ACTIVATED',
        target: membership._id.toString(),
        after: {
          orderId: vipOrder._id,
          tierId: tier?._id
        }
      });
      await audit.save();

    } else if (newStatus !== vipOrder.status) {
      vipOrder.status = newStatus;
      await vipOrder.save();
    }

    return NextResponse.json({
      success: true,
      message: 'VIP IPN processed successfully.'
    }, { status: 200 });

  } catch (error) {
    console.error('[API POST /api/vip/webhook Error]', error);
    return NextResponse.json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to process webhook.' }
    }, { status: 500 });
  }
}
