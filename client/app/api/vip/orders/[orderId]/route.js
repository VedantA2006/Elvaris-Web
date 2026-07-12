import { NextResponse } from 'next/server';
import connectDB from '../../../../../src/lib/db.js';
import { getOrCreateDbUser } from '../../../../../src/lib/auth-helpers.js';
import VipOrder from '../../../../../src/lib/models/VipOrder.js';
import '../../../../../src/lib/models/VipTier.js'; // Ensure VipTier schema registered

export const dynamic = 'force-dynamic';

export async function GET(req, { params }) {
  try {
    const dbUser = await getOrCreateDbUser();
    await connectDB();

    const { orderId } = params;
    const order = await VipOrder.findById(orderId).populate('vipTier', 'name slug entryFeeUsd');

    if (!order) {
      return NextResponse.json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'VIP order not found.' }
      }, { status: 404 });
    }

    if (order.user.toString() !== dbUser._id.toString() && dbUser.role !== 'admin') {
      return NextResponse.json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'You are not authorized to check this order.' }
      }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      data: {
        orderId: order._id,
        status: order.status,
        priceUsd: order.priceUsd,
        invoiceUrl: order.invoiceUrl,
        providerPaymentId: order.providerPaymentId,
        tier: order.vipTier,
        createdAt: order.createdAt
      }
    }, { status: 200 });

  } catch (error) {
    if (error.status === 401) {
      return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: error.message } }, { status: 401 });
    }
    console.error('[API GET /api/vip/orders/[orderId] Error]', error);
    return NextResponse.json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to retrieve order status.' }
    }, { status: 500 });
  }
}
