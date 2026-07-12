import { NextResponse } from 'next/server';
import connectDB from '../../../../../../src/lib/db.js';
import { getOrCreateDbUser, requireAdmin } from '../../../../../../src/lib/auth-helpers.js';
import VipMembership from '../../../../../../src/lib/models/VipMembership.js';
import AuditLog from '../../../../../../src/lib/models/AuditLog.js';
import '../../../../../../src/lib/models/User.js';
import '../../../../../../src/lib/models/VipTier.js';

export const dynamic = 'force-dynamic';

export async function PATCH(req, { params }) {
  try {
    const dbUser = await getOrCreateDbUser();
    requireAdmin(dbUser);
    await connectDB();

    const { id } = params;
    const body = await req.json().catch(() => ({}));
    const { status } = body;

    if (!status || !['active', 'revoked', 'expired', 'pending'].includes(status)) {
      return NextResponse.json({
        success: false,
        error: { code: 'BAD_REQUEST', message: 'Valid status (`active`, `revoked`, `expired`, `pending`) is required.' }
      }, { status: 400 });
    }

    const membership = await VipMembership.findById(id)
      .populate('user', 'name email status role')
      .populate('vipTier', 'name slug entryFeeUsd');

    if (!membership) {
      return NextResponse.json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'VIP membership record not found.' }
      }, { status: 404 });
    }

    const oldStatus = membership.status;
    membership.status = status;
    await membership.save();

    const audit = new AuditLog({
      actor: dbUser._id,
      action: status === 'active' ? 'ADMIN_REACTIVATED_VIP_MEMBERSHIP' : 'ADMIN_CHANGED_VIP_MEMBERSHIP_STATUS',
      target: membership._id.toString(),
      after: { oldStatus, newStatus: status, userId: membership.user?._id }
    });
    await audit.save();

    return NextResponse.json({
      success: true,
      message: `VIP membership status updated to ${status.toUpperCase()}.`,
      data: membership
    }, { status: 200 });

  } catch (error) {
    if (error.status === 401 || error.status === 403) {
      return NextResponse.json({ success: false, error: { code: error.status === 401 ? 'UNAUTHORIZED' : 'FORBIDDEN', message: error.message } }, { status: error.status });
    }
    console.error('[API PATCH /api/admin/vip/members/[id] Error]', error);
    return NextResponse.json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to update VIP membership status.' }
    }, { status: 500 });
  }
}
