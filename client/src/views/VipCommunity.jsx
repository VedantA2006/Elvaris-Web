'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useVipMembership } from '../hooks/useVipMembership';
import api from '../lib/api';
import Button from '../components/ui/Button';

const VipCommunity = () => {
  const router = useRouter();
  const { data: membershipData, isLoading: membershipLoading } = useVipMembership();
  const [tiers, setTiers] = useState([]);
  const [loadingTiers, setLoadingTiers] = useState(true);

  useEffect(() => {
    api.get('/vip/tiers')
      .then((res) => {
        if (res.data?.success) {
          setTiers(res.data.data || []);
        }
      })
      .catch((err) => console.error('Failed to fetch tiers', err))
      .finally(() => setLoadingTiers(false));
  }, []);

  const defaultTier = tiers[0] || {
    name: 'Institutional VIP Pass',
    slug: 'institutional-vip-pass',
    entryFeeUsd: 499,
    description: 'Full institutional quantitative community access, real-time algorithmic signals stream, and private macro liquidity maps.',
    benefits: [
      'Live Institutional Alpha Feed & SMC Orderflow Maps',
      'Direct Discord & Hub Chat with Senior Quant Engineers',
      'Private Weekly Macro Livestreams & Backtest Code Drops',
      'Early Invitation & Beta Access to All New TradingView Indicators',
      'Lifetime One-Time Entry — Zero Recurring Fees'
    ]
  };

  const isMember = membershipData?.active;

  return (
    <div className="w-full bg-[#F9F9F9] min-h-screen">
      <div className="w-full max-w-[1280px] mx-auto px-6 md:px-[64px] py-[120px] font-sans text-[#000000] space-y-[120px]">
        {/* Hero Section */}
        <header className="text-center max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-2 mb-4">
            <img src="/logo.png" alt="Elvaris Logo" className="w-12 h-12 object-contain" />
          </div>
          <div className="inline-block bg-[#FFFFFF] border border-[#C4C7C7] text-[#000000] font-mono text-[12px] font-semibold px-4 py-1.5 rounded-full uppercase tracking-widest mb-6 shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
            Gated Quantitative Access
          </div>
          <h1 className="text-[48px] md:text-[64px] leading-[1.1] font-extrabold text-[#000000] tracking-tight mb-6">
            Institutional Quantitative VIP Community
          </h1>
          <p className="text-[18px] leading-[28px] text-[#444748] max-w-2xl mx-auto mb-10 font-normal">
            Join an elite network of quantitative traders and system architects. Gain instant access to live algorithmic alpha streams, private institutional orderflow maps, and unfiltered macro insights.
          </p>
          
          {isMember ? (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/vip-community/hub">
                <Button variant="primary" className="px-8 py-4 text-[16px] font-bold">
                  Enter Community Hub
                </Button>
              </Link>
              <span className="text-[#000000] text-[14px] font-mono border border-[#000000] px-4 py-2.5 rounded-full uppercase tracking-wider font-semibold">
                STATUS: ACTIVE VIP MEMBER
              </span>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href={`/vip-community/join?tier=${defaultTier.slug}`}>
                <Button variant="primary" className="px-8 py-4 text-[16px] font-bold">
                  Join VIP Community (<span className="font-mono">${defaultTier.entryFeeUsd} USD</span>)
                </Button>
              </Link>
              <Link href="#pricing">
                <Button variant="secondary" className="px-8 py-4 text-[16px]">
                  View Access Benefits
                </Button>
              </Link>
            </div>
          )}
        </header>

        {/* Social Proof Bar */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-[#FFFFFF] border border-[#C4C7C7] rounded-[8px] p-6 text-center shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
            <div className="text-[36px] font-bold text-[#000000] mb-1 font-mono tracking-tight">$140M+</div>
            <div className="text-[13px] text-[#444748] font-medium uppercase tracking-wider">Tracked Orderflow Volume</div>
          </div>
          <div className="bg-[#FFFFFF] border border-[#C4C7C7] rounded-[8px] p-6 text-center shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
            <div className="text-[36px] font-bold text-[#000000] mb-1 font-mono tracking-tight">68.4%</div>
            <div className="text-[13px] text-[#444748] font-medium uppercase tracking-wider">Alpha Signal Consensus</div>
          </div>
          <div className="bg-[#FFFFFF] border border-[#C4C7C7] rounded-[8px] p-6 text-center shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
            <div className="text-[36px] font-bold text-[#000000] mb-1 font-mono tracking-tight">24/7</div>
            <div className="text-[13px] text-[#444748] font-medium uppercase tracking-wider">Algorithmic Stream</div>
          </div>
          <div className="bg-[#FFFFFF] border border-[#C4C7C7] rounded-[8px] p-6 text-center shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
            <div className="text-[36px] font-bold text-[#000000] mb-1 font-mono tracking-tight">0%</div>
            <div className="text-[13px] text-[#444748] font-medium uppercase tracking-wider">Recurring Fees (Lifetime)</div>
          </div>
        </section>

        {/* Benefits Grid */}
        <section>
          <h2 className="text-[32px] md:text-[40px] font-bold text-[#000000] text-center mb-12 tracking-tight">Institutional Advantages</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-[#FFFFFF] border border-[#C4C7C7] rounded-[8px] p-8 shadow-[0_4px_20px_rgba(0,0,0,0.05)] flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-[8px] border border-[#C4C7C7] flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-[24px] text-[#000000]">terminal</span>
                </div>
                <h3 className="text-[22px] font-bold text-[#000000] mb-3">Live Alpha Feed</h3>
                <p className="text-[#444748] text-[16px] leading-[24px] font-normal">
                  Direct algorithmic execution feeds broadcasted directly from Elvaris quantitative servers. Instant alerts on institutional liquidity sweeps and FVG imbalances.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-[#C4C7C7] text-[13px] text-[#000000] font-mono uppercase font-semibold">
                • Sub-second signal dispatch
              </div>
            </div>

            <div className="bg-[#FFFFFF] border border-[#C4C7C7] rounded-[8px] p-8 shadow-[0_4px_20px_rgba(0,0,0,0.05)] flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-[8px] border border-[#C4C7C7] flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-[24px] text-[#000000]">map</span>
                </div>
                <h3 className="text-[22px] font-bold text-[#000000] mb-3">SMC Orderflow Maps</h3>
                <p className="text-[#444748] text-[16px] leading-[24px] font-normal">
                  Unlock daily macroeconomic levels, buy-side / sell-side liquidity concentrations, and high-probability reversal zones mapped out before NY & London opens.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-[#C4C7C7] text-[13px] text-[#000000] font-mono uppercase font-semibold">
                • Pre-session briefing maps
              </div>
            </div>

            <div className="bg-[#FFFFFF] border border-[#C4C7C7] rounded-[8px] p-8 shadow-[0_4px_20px_rgba(0,0,0,0.05)] flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-[8px] border border-[#C4C7C7] flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-[24px] text-[#000000]">groups</span>
                </div>
                <h3 className="text-[22px] font-bold text-[#000000] mb-3">Direct Engineer Q&A</h3>
                <p className="text-[#444748] text-[16px] leading-[24px] font-normal">
                  Connect inside our private institutional channels with senior quantitative developers, pine script architects, and risk engineers. Review your custom strategies directly.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-[#C4C7C7] text-[13px] text-[#000000] font-mono uppercase font-semibold">
                • Direct peer-to-peer access
              </div>
            </div>
          </div>
        </section>

        {/* Blurred Hub Teaser */}
        <section className="bg-[#FFFFFF] border border-[#C4C7C7] rounded-[8px] p-8 md:p-12 shadow-[0_4px_20px_rgba(0,0,0,0.05)] relative overflow-hidden">
          <div className="max-w-xl z-10 relative">
            <span className="text-[13px] font-mono font-bold text-[#000000] uppercase tracking-widest block mb-2">Gated Experience Preview</span>
            <h2 className="text-[32px] md:text-[36px] font-bold text-[#000000] mb-4 tracking-tight">Inside The Private Hub</h2>
            <p className="text-[#444748] text-[16px] leading-[24px] mb-8 font-normal">
              Our members get an institutional-grade dashboard equipped with live consensus metrics, real-time trader rankings, and exclusive backtest code repositories.
            </p>
            {isMember ? (
              <Link href="/vip-community/hub">
                <Button variant="primary" className="px-8 py-3.5 font-bold">Open Hub Now</Button>
              </Link>
            ) : (
              <Link href={`/vip-community/join?tier=${defaultTier.slug}`}>
                <Button variant="primary" className="px-8 py-3.5 font-bold">Unlock Access Now</Button>
              </Link>
            )}
          </div>

          {/* Monochrome Blurred UI in Background */}
          <div className="absolute right-0 top-0 bottom-0 w-1/2 hidden lg:flex items-center justify-end pointer-events-none opacity-30 blur-[2px]">
            <div className="bg-[#FFFFFF] border border-[#C4C7C7] rounded-[8px] p-6 w-full h-4/5 space-y-4">
              <div className="flex justify-between items-center border-b border-[#C4C7C7] pb-3">
                <div className="w-32 h-4 bg-[#000000] rounded-[4px]"></div>
                <div className="w-16 h-4 bg-[#C4C7C7] rounded-[4px]"></div>
              </div>
              <div className="space-y-3 pt-2">
                <div className="w-full h-10 bg-[#F9F9F9] border border-[#C4C7C7] rounded-[4px]"></div>
                <div className="w-4/5 h-10 bg-[#F9F9F9] border border-[#C4C7C7] rounded-[4px]"></div>
                <div className="w-full h-10 bg-[#F9F9F9] border border-[#C4C7C7] rounded-[4px]"></div>
              </div>
            </div>
          </div>
        </section>

      {/* Pricing Section */}
      <section id="pricing" className="max-w-2xl mx-auto">
        <h2 className="text-[32px] md:text-[40px] font-bold text-[#000000] text-center mb-12 tracking-tight">Select Access Tier</h2>
        
        <div className="bg-[#FFFFFF] border border-[#C4C7C7] rounded-[8px] p-8 md:p-12 shadow-[0_4px_20px_rgba(0,0,0,0.05)] relative">
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#000000] text-[#FFFFFF] text-[12px] font-mono font-bold px-4 py-1 rounded-full uppercase tracking-widest">
            Institutional Standard
          </div>

          <div className="text-center mb-8 pb-8 border-b border-[#C4C7C7]">
            <h3 className="text-[28px] font-bold text-[#000000] mb-3">{defaultTier.name}</h3>
            <p className="text-[#444748] text-[16px] leading-[24px]">{defaultTier.description}</p>
            <div className="mt-8 flex items-baseline justify-center gap-2 font-mono">
              <span className="text-[56px] font-extrabold text-[#000000] tracking-tight">${defaultTier.entryFeeUsd}</span>
              <span className="text-[#444748] text-[16px] font-medium">USD / {defaultTier.billingCycle === 'one_time' ? 'Lifetime Access' : defaultTier.billingCycle}</span>
            </div>
          </div>

          <div className="space-y-4 mb-10">
            <span className="text-[13px] font-mono font-bold text-[#000000] uppercase tracking-wider block mb-4">Included Privileges:</span>
            {defaultTier.benefits?.map((benefit, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <span className="material-symbols-outlined text-[#000000] text-[20px] mt-0.5">check_circle</span>
                <span className="text-[#444748] text-[16px] leading-[24px] font-normal">{benefit}</span>
              </div>
            ))}
          </div>

          <div className="pt-4 text-center">
            {isMember ? (
              <Link href="/vip-community/hub" className="block w-full">
                <Button variant="primary" className="w-full py-4 text-[16px] font-bold">
                  Enter Community Hub
                </Button>
              </Link>
            ) : (
              <Link href={`/vip-community/join?tier=${defaultTier.slug}`} className="block w-full">
                <Button variant="primary" className="w-full py-4 text-[16px] font-bold">
                  Proceed to Crypto Checkout (<span className="font-mono">${defaultTier.entryFeeUsd}</span>)
                </Button>
              </Link>
            )}
            <span className="text-[12px] font-mono text-[#444748] mt-4 block opacity-80">
              Secured by NOWPayments • Instant automated activation upon 1 confirmation
            </span>
          </div>
        </div>
      </section>
      </div>
    </div>
  );
};

export default VipCommunity;
