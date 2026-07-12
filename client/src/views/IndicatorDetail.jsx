'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import axios from 'axios';

const TABS = ['Overview', 'Features', 'Version History', 'Screenshots', 'Reviews', 'Performance', 'Documentation'];

const PLANS = ['Monthly', 'Quarterly', 'Yearly', 'Lifetime'];

const fallback = {
  name: 'SMC Pro',
  shortDescription: 'Institutional-grade Smart Money Concepts toolkit with non-repainting order blocks, liquidity zones, and fair value gaps.',
  price: 49,
  image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD4EWRroMWKoBCihEfcAKmhKkhYqWYjaRJJfb3ZvGd0Yit8vrRG8hb7DtvcAnvPK97U8rnOYkjCbPcPB3-GkxcACdGN2p1pa4OIw7nDxBBWY5i4F4X6-i_oDUgbUMQz4PN4gAvhF8hBEO_ZUuxygG0-DkSKiWH5leSwCtdAAXH1MTaqaLu1UkDNxRFMac73ZlRESqxbNQp3dnnTC0kFGyYvm5YF3pQpAn7yh77O5E04OcrAdp99Hq-I-S7H9wCSgQpey2N23SGL1hM',
  thumbnails: [
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCjLdf7pk1ORg4rEYCh3pOumYhgUBNr4LYmqjKyXEjvd-lVSdD6L_pTQzRKA97-wLTaTRZjX_aMWoPgxIpJGNv9xTh_HZl0S82-ru4j59LDaW5iLplu6ibm08dN3iH8-LRBWbxQEqKRp2qYDBCbjsjiTa-t5oHQxKzqZepgr1kP0eHJSaSXxl6RzbKGDhDFZG1osKNUzQicGHjcfa-hPH6FNoXANpV65YQZNBdbIPfYxGoFEPSvTv0YZTVEtzI5eKkJ6hlW6vW3xQ0',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDlr2D3FaXbRKoDg_OT2hRor6tNE8hO3YMUy99aOUToS-y0Wa1xtf6DhFKaD4DPNDnLzvVnnC_j7lPUfc1yZKYogftD--OTHGw9enJdNFgDsYj5qa8PmD22mvzJheLe8gTzhm5VBMzXyNCSmcRZONEhKatFYRWLfb4SMbaM_qa2QiP0JoAajqrROdjXRM36SsO9E2_8Gs-NxPdwdNLPYZznxDTFtu-t3IRsGdQRoUXwjJN9yphi4W5W3e4xHJ7vjaXSa9F5chmrnzs',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBJbpamXJ81j9tI0n7pc0VvDNu3c5tSiPiOKO5R3hWjTDZ4KU2BX788aihjbsswUmmhFYOLP2t_mOCbki1ht5VvL4yjbj_srcvSKwF4LZOHEFwfJkB7yqfdNVW9SOaoZidVot6Nx-CuEjAQo142mAUzroE406RefYDW8iLrDRGS83Nqvt4agVXRCsERpXdQobxIFgthNzmtlXJuSYO8_LHZzvRGo8Ew-tlvWr4PSsegmZhCtTLSat5n1iM01YnInuNgf9n1uzb5BLk',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuB4mypJV_-o_k23STvLvmczwo7HL2OZ3PzXfIpD792utjsufXHPtoWeULH5dp_R71sHqxbNJPumsxOcGfja0jNakqeCYjQARLAfH8gOTc3yU1-ghYlofln7PSMbXxE1cQuVkV0wBJEBLfolAXsQxEfgHODYF2rOge5EfdaCLSXIcKs8Klu6O4A7CGDAOkj7wFLU4mOWxpnQsyu5rwoKzbPCBJnq-d0MVsowb3rGL5Qo77WCv9THXgv-or7gnjd4S4bs4EjjYN8UEu4',
  ],
};

const capabilities = [
  { title: 'Non-Repainting Logic', desc: 'Signals remain permanent upon candle close for reliable backtesting.' },
  { title: 'Multi-Timeframe Order Blocks', desc: 'Automatically project higher timeframe OBs onto lower timeframe charts.' },
  { title: 'Dynamic Liquidity Zones', desc: 'Identify buyside and sellside liquidity sweeps with precision alerts.' },
  { title: 'Fair Value Gaps (FVG)', desc: 'Highlight inefficiencies in price delivery with customizable visual settings.' },
];

const IndicatorDetail = () => {
  const { slug } = useParams();
  const [indicator, setIndicator] = useState(fallback);
  const [activeTab, setActiveTab] = useState('Overview');
  const [activePlan, setActivePlan] = useState('Monthly');
  const [activeThumb, setActiveThumb] = useState(0);

  useEffect(() => {
    if (slug) {
      axios.get(`/api/indicators/${slug}`).then((res) => {
        if (res.data && res.data.data) setIndicator(res.data.data);
      }).catch(() => {});
    }
  }, [slug]);

  return (
    <div className="pb-section-gap max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
      {/* Breadcrumbs & Title */}
      <div className="mb-stack-lg">
        <div className="flex items-center gap-2 text-on-surface-variant font-label-sm text-label-sm mb-4">
          <Link href="/indicators" className="hover:text-primary">Indicator Catalog</Link>
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          <span className="text-primary">{indicator.name}</span>
        </div>
        <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary tracking-tight">
          {indicator.name}
        </h1>
        <p className="text-on-surface-variant font-body-lg text-body-lg mt-2 max-w-3xl">
          {indicator.shortDescription}
        </p>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        {/* Left Column */}
        <div className="lg:col-span-8 flex flex-col gap-stack-lg">
          {/* Hero Gallery */}
          <div className="flex flex-col gap-stack-sm">
            <div className="relative w-full aspect-video rounded-xl overflow-hidden hairline-border bg-surface-container-low group cursor-pointer">
              <img
                alt={indicator.name}
                className="w-full h-full object-cover filter grayscale"
                src={indicator.thumbnails?.[activeThumb] || indicator.image}
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/20 transition-colors">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg transform group-hover:scale-105 transition-transform">
                  <span className="material-symbols-outlined text-primary text-[32px] ml-1" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
                </div>
              </div>
            </div>
            <div className="flex gap-stack-sm overflow-x-auto pb-2">
              {(indicator.thumbnails || fallback.thumbnails).map((thumb, i) => (
                <div
                  key={i}
                  onClick={() => setActiveThumb(i)}
                  className={`w-1/4 min-w-[120px] aspect-video rounded-lg overflow-hidden hairline-border cursor-pointer transition-opacity ${
                    activeThumb === i ? 'border-primary opacity-100' : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  <img alt={`Thumbnail ${i + 1}`} className="w-full h-full object-cover filter grayscale" src={thumb} />
                </div>
              ))}
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex overflow-x-auto hairline-border-b">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-4 font-label-sm text-label-sm whitespace-nowrap transition-colors ${
                  activeTab === tab
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-on-surface-variant hover:text-primary'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab Content: Overview */}
          {activeTab === 'Overview' && (
            <div className="flex flex-col gap-stack-lg py-4">
              <div className="prose max-w-none">
                <h3 className="font-headline-md text-headline-md text-primary mb-4">Master Market Structure</h3>
                <p className="font-body-md text-body-md text-on-surface-variant mb-4 leading-relaxed">
                  {indicator.name} is engineered for precision. Utilizing proprietary algorithms designed alongside institutional traders, this indicator maps complex market structures—identifying genuine order blocks, tracking liquidity pools, and defining fair value gaps in real-time.
                </p>
                <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                  Every signal is strictly <strong className="text-primary">no-repaint</strong>. Once a candle closes and a structural shift is confirmed, the data is immutable.
                </p>
              </div>
              <div className="bg-surface-container-low p-8 rounded-xl hairline-border">
                <h4 className="font-label-sm text-label-sm text-primary uppercase tracking-widest mb-6">Core Capabilities</h4>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {capabilities.map((cap) => (
                    <li key={cap.title} className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                      <div>
                        <strong className="block font-body-md text-body-md text-primary mb-1">{cap.title}</strong>
                        <span className="font-body-md text-body-md text-on-surface-variant text-sm">{cap.desc}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Sticky Buy Box */}
        <div className="lg:col-span-4">
          <div className="sticky top-24 bg-surface rounded-xl hairline-border ambient-shadow p-6 flex flex-col gap-6 border-primary/20">
            <div>
              <h2 className="font-headline-md text-headline-md text-primary mb-1">Select Plan</h2>
              <p className="font-body-md text-body-md text-on-surface-variant text-sm">Full access to {indicator.name} + Discord Community</p>
            </div>

            {/* Plan Selector */}
            <div className="flex flex-wrap gap-2">
              {PLANS.map((plan) => (
                <button
                  key={plan}
                  onClick={() => setActivePlan(plan)}
                  className={`flex-1 py-2 px-3 rounded-full font-label-sm text-label-sm text-center transition-colors relative ${
                    activePlan === plan
                      ? 'bg-primary text-on-primary'
                      : 'bg-surface-container-low text-on-surface hover:bg-surface-dim'
                  }`}
                >
                  {plan}
                  {plan === 'Yearly' && (
                    <span className="absolute -top-2 -right-2 bg-secondary-fixed text-on-secondary-fixed font-label-sm text-[10px] px-2 py-0.5 rounded-full">-20%</span>
                  )}
                </button>
              ))}
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-2 py-4 border-y border-outline-variant">
              <span className="font-display text-display text-primary">
                ${indicator.pricing?.find(p => p.planType === activePlan.toLowerCase())?.price ?? (indicator.price || 49)}
              </span>
              <span className="font-body-md text-body-md text-on-surface-variant">
                {activePlan === 'Lifetime' ? ' once' : ` / ${activePlan.toLowerCase()}`}
              </span>
            </div>

            {/* CTA */}
            <Link
              href={`/checkout/${slug}?plan=${activePlan.toLowerCase()}`}
              className="w-full bg-primary text-on-primary py-4 rounded-lg font-label-sm text-label-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 text-center block"
            >
              Buy Now
            </Link>

            {/* Trust Indicators */}
            <div className="flex flex-col gap-3 mt-2">
              <div className="flex items-center gap-2 text-on-surface-variant">
                <span className="material-symbols-outlined text-[20px]">lock</span>
                <span className="font-body-md text-sm">Secure Crypto Checkout Available</span>
              </div>
              <div className="flex items-center gap-2 text-on-surface-variant">
                <span className="material-symbols-outlined text-[20px]">bolt</span>
                <span className="font-body-md text-sm">Instant TradingView Activation</span>
              </div>
              <div className="flex items-center gap-2 text-on-surface-variant">
                <span className="material-symbols-outlined text-[20px]">autorenew</span>
                <span className="font-body-md text-sm">Cancel anytime, no hidden fees</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IndicatorDetail;
