import { NextResponse } from 'next/server';
import connectDB from '../../../../src/lib/db.js';
import { getOrCreateDbUser } from '../../../../src/lib/auth-helpers.js';
import VipMembership from '../../../../src/lib/models/VipMembership.js';
import '../../../../src/lib/models/VipTier.js'; // Register schema

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    let dbUser = null;
    try {
      dbUser = await getOrCreateDbUser();
    } catch (authErr) {
      if (authErr.status === 401) {
        return NextResponse.json({
          success: true,
          data: { active: false, membership: null, user: null }
        }, { status: 200 });
      }
      throw authErr;
    }

    await connectDB();
    const membership = await VipMembership.findOne({ user: dbUser._id }).populate('vipTier');

    let active = false;
    if (membership && membership.status === 'active') {
      if (!membership.expiresAt || new Date(membership.expiresAt) > new Date()) {
        active = true;
      } else {
        // Mark as expired
        membership.status = 'expired';
        await membership.save();
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        active,
        membership: active ? membership : null,
        user: {
          id: dbUser._id,
          name: dbUser.name,
          email: dbUser.email,
          role: dbUser.role
        }
      }
    }, { status: 200 });

  } catch (error) {
    console.error('[API GET /api/vip/me Error]', error);
    return NextResponse.json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to retrieve membership status.' }
    }, { status: 500 });
  }
}
