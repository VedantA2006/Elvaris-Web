import { NextResponse } from 'next/server';
import connectDB from '../../../../src/lib/db.js';
import { getOrCreateDbUser } from '../../../../src/lib/auth-helpers.js';
import VipTier from '../../../../src/lib/models/VipTier.js';
import VipOrder from '../../../../src/lib/models/VipOrder.js';
import { createInvoice } from '../../../../src/lib/nowpayments.js';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    const dbUser = await getOrCreateDbUser();
    await connectDB();

    const body = await req.json().catch(() => ({}));
    const { vipTierId, vipTierSlug } = body;

    if (!vipTierId && !vipTierSlug) {
      return NextResponse.json({
        success: false,
        error: { code: 'BAD_REQUEST', message: 'vipTierId or vipTierSlug is required.' }
      }, { status: 400 });
    }

    const query = vipTierId ? { _id: vipTierId } : { slug: vipTierSlug };
    const tier = await VipTier.findOne({ ...query, isActive: true });

    if (!tier) {
      return NextResponse.json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'VIP Tier not found or inactive.' }
      }, { status: 404 });
    }

    const vipOrder = new VipOrder({
      user: dbUser._id,
      vipTier: tier._id,
      priceUsd: tier.entryFeeUsd,
      status: 'pending'
    });
    await vipOrder.save();

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const invoiceData = await createInvoice({
      priceUsd: tier.entryFeeUsd,
      orderId: vipOrder._id.toString(),
      description: `Elvaris ${tier.name}`,
      successUrl: `${siteUrl}/vip-community/hub`,
      cancelUrl: `${siteUrl}/vip-community/join?tier=${tier.slug}`
    });

    vipOrder.providerPaymentId = invoiceData.providerPaymentId;
    vipOrder.invoiceUrl = invoiceData.invoiceUrl;
    await vipOrder.save();

    return NextResponse.json({
      success: true,
      data: {
        orderId: vipOrder._id,
        invoiceUrl: vipOrder.invoiceUrl,
        priceUsd: vipOrder.priceUsd,
        tier: {
          name: tier.name,
          slug: tier.slug
        }
      }
    }, { status: 201 });

  } catch (error) {
    if (error.status === 401) {
      return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: error.message } }, { status: 401 });
    }
    console.error('[API POST /api/vip/orders Error]', error);
    return NextResponse.json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: error.message || 'Failed to create VIP order invoice.' }
    }, { status: 500 });
  }
}
