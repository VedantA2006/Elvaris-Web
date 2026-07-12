'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useVipMembership } from '../hooks/useVipMembership';
import Button from '../components/ui/Button';

const mockFeedItems = [
  {
    id: 1,
    author: 'Quant_Engine_01',
    role: 'SYSTEM BROADCAST',
    timestamp: '2 mins ago',
    title: 'XAU/USD Liquidity Sweep Detected — 15m FVG Fill Target',
    content: 'Algorithmic execution scanner has registered a high-timeframe buy-side liquidity purge on XAU/USD at $2412.80. Immediate mitigation target sits at the 15-minute bullish FVG ($2404.20 - $2406.50). Institutional orderflow delta: +420 lots.',
    tag: 'ORDERFLOW ALERT'
  },
  {
    id: 2,
    author: 'Dr. Marcus Vance',
    role: 'SENIOR QUANT ARCHITECT',
    timestamp: '45 mins ago',
    title: 'Macro Liquidity Briefing: Post-NFP Volatility Regimes',
    content: 'Full Pine Script code drop for the dynamic volatility regime filter has been committed to the member repository below. Ensure your local SMC models have `useVolatilityScaling = true` activated prior to the London cash open.',
    tag: 'MACRO BRIEFING'
  },
  {
    id: 3,
    author: 'Quant_Engine_02',
    role: 'SYSTEM BROADCAST',
    timestamp: '3 hours ago',
    title: 'EUR/USD Market Structure Shift — 4H Bullish Breaker Confirmed',
    content: 'Automated structure verification: 4H closing candle confirmed break of structure (BOS) above 1.0885. Algorithmic bias shifted from Neutral to Accumulation.',
    tag: 'STRUCTURE SHIFT'
  }
];

const leaderboard = [
  { rank: 1, handle: '@alpha_vector', sharpe: '3.42', winRate: '78.2%', returnPct: '+44.1%' },
  { rank: 2, handle: '@quant_euler', sharpe: '3.15', winRate: '74.5%', returnPct: '+38.9%' },
  { rank: 3, handle: '@vance_capital', sharpe: '2.98', winRate: '71.0%', returnPct: '+35.4%' },
  { rank: 4, handle: '@smc_institutional', sharpe: '2.84', winRate: '69.8%', returnPct: '+31.2%' },
  { rank: 5, handle: '@macro_liquidity', sharpe: '2.71', winRate: '68.1%', returnPct: '+28.7%' },
];

const VipHub = () => {
  const { data: membershipData, isLoading } = useVipMembership();
  const [activeTab, setActiveTab] = useState('alpha_stream');

  if (isLoading) {
    return (
      <div className="w-full bg-[#F9F9F9] min-h-[70vh] flex items-center justify-center font-sans">
        <div className="w-10 h-10 border-4 border-[#000000] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const isMember = membershipData?.active;
  const membership = membershipData?.membership;

  if (!isMember) {
    return (
      <div className="w-full bg-[#F9F9F9] min-h-screen py-[120px] px-6 md:px-[64px] font-sans flex items-center justify-center">
        <div className="bg-[#FFFFFF] border border-[#C4C7C7] rounded-[8px] p-10 text-center max-w-2xl mx-auto shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
          <span className="material-symbols-outlined text-[48px] text-[#000000] mb-4 block">lock</span>
          <h1 className="text-[32px] font-bold text-[#000000] mb-4 tracking-tight">Gated Institutional Hub</h1>
          <p className="text-[16px] leading-[26px] text-[#444748] mb-8 font-normal">
            This private community portal is strictly restricted to verified Elvaris Quantitative VIP pass holders. Please secure an active membership to access real-time orderflow streams, quantitative developer discussions, and exclusive pine script repositories.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/vip-community/join?tier=institutional-vip-pass">
              <Button variant="primary" className="px-8 py-4 font-bold text-[16px]">
                Unlock VIP Access (<span className="font-mono">$499 USD</span>)
              </Button>
            </Link>
            <Link href="/vip-community">
              <Button variant="secondary" className="px-8 py-4 text-[16px]">
                View Membership Benefits
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#F9F9F9] min-h-screen">
      <div className="w-full max-w-[1280px] mx-auto px-6 md:px-[64px] py-[120px] font-sans text-[#000000] space-y-12">
        {/* Member Banner */}
        <div className="bg-[#FFFFFF] border border-[#C4C7C7] rounded-[8px] p-8 shadow-[0_4px_20px_rgba(0,0,0,0.05)] flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#000000]"></span>
              <span className="text-[12px] font-mono text-[#000000] uppercase tracking-widest font-bold">
                Institutional Member Verified
              </span>
            </div>
            <h1 className="text-[28px] font-bold text-[#000000] tracking-tight">
              {membership?.vipTier?.name || 'Institutional VIP Community Pass'}
            </h1>
            <p className="text-[#444748] text-[15px] mt-1 font-normal">
              Joined: <span className="font-mono font-medium text-[#000000]">{membership?.joinedAt ? new Date(membership.joinedAt).toLocaleDateString() : 'Active'}</span> • Billing Cycle: <span className="font-mono font-medium text-[#000000] uppercase">{membership?.vipTier?.billingCycle || 'LIFETIME'}</span>
            </p>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <a
              href="https://discord.gg"
              target="_blank"
              rel="noreferrer"
              className="w-full md:w-auto bg-[#FFFFFF] border border-[#000000] hover:bg-[#000000]/5 text-[#000000] px-6 py-3 rounded-full font-bold text-[13px] text-center transition-colors font-mono uppercase tracking-wider"
            >
              Connect Discord VIP Role →
            </a>
          </div>
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left/Center: Alpha Feed & Resources */}
          <div className="lg:col-span-8 space-y-8">
            {/* Sub-nav Tabs */}
            <div className="flex gap-8 border-b border-[#C4C7C7] pb-3">
              <button
                onClick={() => setActiveTab('alpha_stream')}
                className={`font-bold text-[16px] pb-3 transition-colors select-none ${
                  activeTab === 'alpha_stream'
                    ? 'text-[#000000] border-b-2 border-[#000000] -mb-3.5'
                    : 'text-[#444748] hover:text-[#000000]'
                }`}
              >
                Real-Time Alpha Stream
              </button>
              <button
                onClick={() => setActiveTab('repositories')}
                className={`font-bold text-[16px] pb-3 transition-colors select-none ${
                  activeTab === 'repositories'
                    ? 'text-[#000000] border-b-2 border-[#000000] -mb-3.5'
                    : 'text-[#444748] hover:text-[#000000]'
                }`}
              >
                Pine Script Repositories
              </button>
            </div>

            {activeTab === 'alpha_stream' ? (
              <div className="space-y-6">
                {mockFeedItems.map((item) => (
                  <div key={item.id} className="bg-[#FFFFFF] border border-[#C4C7C7] rounded-[8px] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-[#000000] font-mono text-[15px]">{item.author}</span>
                        <span className="text-[11px] font-mono border border-[#C4C7C7] text-[#444748] px-2 py-0.5 rounded-[4px] uppercase font-semibold">
                          {item.role}
                        </span>
                      </div>
                      <span className="text-[12px] text-[#444748] font-mono">{item.timestamp}</span>
                    </div>
                    <div className="mb-3">
                      <span className="text-[11px] font-bold text-[#FFFFFF] bg-[#000000] px-2.5 py-1 rounded-[4px] font-mono uppercase mr-3 inline-block">
                        {item.tag}
                      </span>
                      <h3 className="text-[20px] font-bold text-[#000000] inline leading-snug">{item.title}</h3>
                    </div>
                    <p className="text-[#444748] text-[15px] leading-[24px] mt-2 font-normal">
                      {item.content}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-[#FFFFFF] border border-[#C4C7C7] rounded-[8px] p-8 shadow-[0_4px_20px_rgba(0,0,0,0.05)] space-y-6">
                <h3 className="text-[22px] font-bold text-[#000000] tracking-tight">Private Quantitative Source Code</h3>
                <p className="text-[#444748] text-[15px] leading-[24px]">
                  Below are direct source code drops and open-source models reserved for our VIP institutional members.
                </p>

                <div className="border border-[#C4C7C7] rounded-[8px] p-5 bg-[#F9F9F9] flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-[#000000] font-mono text-[16px]">Elvaris_SMC_Orderflow_v3.4.pine</h4>
                    <p className="text-[13px] text-[#444748] mt-1">Non-repainting FVGs and algorithmic bias engine.</p>
                  </div>
                  <Button variant="secondary" className="px-5 py-2 text-[13px] font-mono">
                    Download (.pine)
                  </Button>
                </div>

                <div className="border border-[#C4C7C7] rounded-[8px] p-5 bg-[#F9F9F9] flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-[#000000] font-mono text-[16px]">Macro_Volatility_Regime_Filter.pine</h4>
                    <p className="text-[13px] text-[#444748] mt-1">Filters choppy sessions automatically across NY/London.</p>
                  </div>
                  <Button variant="secondary" className="px-5 py-2 text-[13px] font-mono">
                    Download (.pine)
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar: Leaderboard & Livestreams */}
          <div className="lg:col-span-4 space-y-8">
            {/* Quantitative Leaderboard */}
            <div className="bg-[#FFFFFF] border border-[#C4C7C7] rounded-[8px] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
              <h3 className="text-[18px] font-bold text-[#000000] mb-4 border-b border-[#C4C7C7] pb-3 tracking-tight">
                Top Quant Traders (30D)
              </h3>
              <div className="space-y-4 font-mono text-[14px]">
                <div className="flex justify-between text-[#444748] border-b border-[#C4C7C7] pb-2 font-bold text-[12px]">
                  <span>RANK / HANDLE</span>
                  <span>SHARPE / WIN%</span>
                </div>
                {leaderboard.map((trader) => (
                  <div key={trader.rank} className="flex justify-between items-center py-1">
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-full border border-[#C4C7C7] flex items-center justify-center text-[12px] font-bold text-[#000000] bg-[#F9F9F9]">
                        {trader.rank}
                      </span>
                      <span className="text-[#000000] font-bold">{trader.handle}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[#000000] font-bold">{trader.sharpe}</span>
                      <span className="text-[#444748] ml-2">{trader.winRate}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming Macro Livestreams */}
            <div className="bg-[#FFFFFF] border border-[#C4C7C7] rounded-[8px] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
              <div className="flex items-center gap-2.5 mb-3">
                <span className="material-symbols-outlined text-[#000000]">live_tv</span>
                <h3 className="text-[18px] font-bold text-[#000000] tracking-tight">Weekly Macro Livestream</h3>
              </div>
              <p className="text-[#444748] text-[15px] leading-[24px] mb-5">
                Our next institutional market breakdown and live chart review with Senior Quant Architect Dr. Marcus Vance.
              </p>
              <div className="bg-[#F9F9F9] border border-[#C4C7C7] p-3 rounded-[8px] font-mono text-[13px] text-[#000000] mb-5 font-semibold text-center">
                📅 Every Sunday @ 21:00 UTC
              </div>
              <Button variant="secondary" className="w-full py-3 text-[13px] font-mono font-bold">
                Add to Calendar →
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VipHub;
