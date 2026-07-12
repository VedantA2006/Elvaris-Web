import { NextResponse } from 'next/server';
import connectDB from '../../../../src/lib/db.js';
import VipTier from '../../../../src/lib/models/VipTier.js';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectDB();
    const tiers = await VipTier.find({ isActive: true }).sort({ entryFeeUsd: 1 });
    
    return NextResponse.json({
      success: true,
      data: tiers
    }, { status: 200 });
  } catch (error) {
    console.error('[API GET /api/vip/tiers Error]', error);
    return NextResponse.json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to retrieve VIP tiers.'
      }
    }, { status: 500 });
  }
}
