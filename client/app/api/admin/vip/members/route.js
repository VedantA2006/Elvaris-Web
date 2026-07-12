import { NextResponse } from 'next/server';
import connectDB from '../../../../../src/lib/db.js';
import { getOrCreateDbUser, requireAdmin } from '../../../../../src/lib/auth-helpers.js';
import VipMembership from '../../../../../src/lib/models/VipMembership.js';
import VipTier from '../../../../../src/lib/models/VipTier.js';
import User from '../../../../../src/lib/models/User.js';
import AuditLog from '../../../../../src/lib/models/AuditLog.js';
import { sendVipWelcomeEmail } from '../../../../../src/lib/utils/email.js';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const dbUser = await getOrCreateDbUser();
    requireAdmin(dbUser);
    await connectDB();

    const members = await VipMembership.find({})
      .populate('user', 'name email status role')
      .populate('vipTier', 'name slug entryFeeUsd')
      .sort({ updatedAt: -1 });

    const tiers = await VipTier.find({ isActive: true });

    return NextResponse.json({
      success: true,
      data: {
        members,
        tiers
      }
    }, { status: 200 });

  } catch (error) {
    if (error.status === 401 || error.status === 403) {
      return NextResponse.json({ success: false, error: { code: error.status === 401 ? 'UNAUTHORIZED' : 'FORBIDDEN', message: error.message } }, { status: error.status });
    }
    console.error('[API GET /api/admin/vip/members Error]', error);
    return NextResponse.json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to retrieve VIP members list.' }
    }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const dbUser = await getOrCreateDbUser();
    requireAdmin(dbUser);
    await connectDB();

    const body = await req.json().catch(() => ({}));
    const { userEmail, vipTierId, status = 'active' } = body;

    if (!userEmail || !vipTierId) {
      return NextResponse.json({
        success: false,
        error: { code: 'BAD_REQUEST', message: 'userEmail and vipTierId are required.' }
      }, { status: 400 });
    }

    const targetUser = await User.findOne({ email: userEmail.toLowerCase().trim() });
    if (!targetUser) {
      return NextResponse.json({
        success: false,
        error: { code: 'NOT_FOUND', message: `User with email ${userEmail} not found in database.` }
      }, { status: 404 });
    }

    const tier = await VipTier.findById(vipTierId);
    if (!tier) {
      return NextResponse.json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'VIP Tier not found.' }
      }, { status: 404 });
    }

    let membership = await VipMembership.findOne({ user: targetUser._id });
    if (!membership) {
      membership = new VipMembership({
        user: targetUser._id,
        vipTier: tier._id,
        status,
        joinedAt: new Date(),
        expiresAt: null
      });
    } else {
      membership.vipTier = tier._id;
      membership.status = status;
      membership.joinedAt = membership.joinedAt || new Date();
    }
    await membership.save();

    if (status === 'active') {
      await sendVipWelcomeEmail(targetUser.email, membership);
    }

    const audit = new AuditLog({
      actor: dbUser._id,
      action: 'ADMIN_GRANTED_VIP_MEMBERSHIP',
      target: membership._id.toString(),
      after: {
        userId: targetUser._id,
        userEmail: targetUser.email,
        tierId: tier._id,
        status
      }
    });
    await audit.save();

    const populated = await VipMembership.findById(membership._id)
      .populate('user', 'name email status role')
      .populate('vipTier', 'name slug entryFeeUsd');

    return NextResponse.json({
      success: true,
      message: 'VIP membership granted successfully.',
      data: populated
    }, { status: 201 });

  } catch (error) {
    if (error.status === 401 || error.status === 403) {
      return NextResponse.json({ success: false, error: { code: error.status === 401 ? 'UNAUTHORIZED' : 'FORBIDDEN', message: error.message } }, { status: error.status });
    }
    console.error('[API POST /api/admin/vip/members Error]', error);
    return NextResponse.json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to grant VIP membership.' }
    }, { status: 500 });
  }
}
