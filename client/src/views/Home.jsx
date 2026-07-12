'use client';

import React from 'react';
import Link from 'next/link';

const features = [
  { icon: 'architecture', title: 'Smart Money Concepts', desc: 'Automated detection of institutional order flow and market sentiment shifts.' },
  { icon: 'water_drop', title: 'Liquidity Sweeps', desc: 'Identify areas where retail stops are resting and institutions are accumulating.' },
  { icon: 'space_dashboard', title: 'Fair Value Gaps', desc: 'Highlight inefficiencies in price action to pinpoint high-probability entries.' },
  { icon: 'show_chart', title: 'Break of Structure', desc: 'Real-time alerts for trend continuation signals across multiple timeframes.' },
  { icon: 'swap_horiz', title: 'CHOCH', desc: 'Change of Character detection to catch early trend reversals before the crowd.' },
  { icon: 'layers', title: 'Order Blocks', desc: 'Visualize significant institutional supply and demand zones accurately.' },
  { icon: 'schedule', title: 'Multi-TF Analysis', desc: 'View higher timeframe market structure on lower timeframe charts seamlessly.' },
  { icon: 'language', title: 'Session Detection', desc: 'Automatically highlight London, New York, and Asian trading sessions.' },
];

const stats = [
  { label: 'Win Rate', value: '68%', bars: [2, 4, 3, 5, 4, 6, 7, 5] },
  { label: 'Profit Factor', value: '2.4', bars: [3, 2, 4, 5, 6, 7, 8, 8] },
  { label: 'Max Drawdown', value: '4.2%', bars: [8, 7, 6, 5, 4, 3, 2, 2] },
  { label: 'Avg RR', value: '1:3.5', bars: [2, 2, 3, 4, 5, 5, 6, 7] },
];

const trustItems = [
  { icon: 'group', text: '10,000+ Users' },
  { icon: 'verified_user', text: 'Verified Traders' },
  { icon: 'lock', text: 'Crypto-Secure Checkout' },
  { icon: 'sync', text: 'Auto-Updates' },
];

const Home = () => {
  return (
    <>
      {/* Hero Section */}
      <section className="bg-primary text-on-primary py-section-gap px-margin-mobile md:px-margin-desktop relative overflow-hidden">
        <div className="max-w-container-max mx-auto grid md:grid-cols-12 gap-gutter items-center z-10 relative">
          <div className="md:col-span-6 flex flex-col gap-stack-lg">
            <h1 className="text-headline-lg-mobile md:text-display font-display tracking-tighter font-extrabold text-on-primary">
              Professional TradingView Indicators Built For Serious Traders
            </h1>
            <p className="text-body-lg font-body-lg text-on-primary-container max-w-xl">
              Institutional-grade SMC signals, liquidity maps, and market structure algorithms designed for precision execution and risk management.
            </p>
            <div className="flex flex-wrap gap-4 mt-stack-md">
              <Link
                href="/vip-community"
                className="bg-surface-container-lowest text-primary text-label-sm font-label-sm px-8 py-3 rounded hover:bg-surface-container-highest transition-colors"
              >
                VIP Access
              </Link>
              <Link
                href="/performance"
                className="border border-surface-container-lowest text-on-primary text-label-sm font-label-sm px-8 py-3 rounded hover:bg-surface-container-lowest/10 transition-colors"
              >
                View Performance
              </Link>
              <Link
                href="/indicators"
                className="border border-surface-container-lowest text-on-primary text-label-sm font-label-sm px-8 py-3 rounded hover:bg-surface-container-lowest/10 transition-colors"
              >
                Live Demo
              </Link>
            </div>
          </div>
          <div className="md:col-span-6 mt-16 md:mt-0 relative h-[500px] border border-white/10 rounded-xl overflow-hidden bg-primary-container p-4">
            {/* Chart Grid */}
            <div className="absolute inset-0 grid grid-cols-6 grid-rows-6 opacity-20 pointer-events-none">
              {Array.from({ length: 36 }).map((_, i) => (
                <div key={i} className={`${i % 6 !== 5 ? 'border-r' : ''} ${Math.floor(i / 6) !== 5 ? 'border-b' : ''} border-white/20`} />
              ))}
            </div>
            {/* Mock Candlesticks */}
            <div className="absolute bottom-20 left-10 w-4 h-32 bg-white/10 border border-white flex justify-center items-center">
              <div className="w-px h-48 bg-white absolute" />
            </div>
            <div className="absolute bottom-32 left-24 w-4 h-24 bg-white flex justify-center items-center">
              <div className="w-px h-40 bg-white absolute" />
            </div>
            <div className="absolute bottom-48 left-36 w-4 h-40 bg-white/10 border border-white flex justify-center items-center">
              <div className="w-px h-56 bg-white absolute" />
            </div>
            <div className="absolute bottom-64 left-[200px] w-4 h-16 bg-white flex justify-center items-center">
              <div className="w-px h-32 bg-white absolute" />
            </div>
            {/* Signal Overlays */}
            <div className="absolute top-20 right-32 bg-white text-primary px-3 py-1 rounded-full text-xs font-bold font-label-sm border border-white">SHORT</div>
            <div className="absolute bottom-10 left-32 bg-primary text-white border border-white px-3 py-1 rounded-full text-xs font-bold font-label-sm">LONG</div>
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="bg-surface-container-lowest py-8 border-b border-outline-variant px-margin-mobile md:px-margin-desktop">
        <div className="max-w-container-max mx-auto flex flex-wrap justify-center md:justify-between items-center gap-8">
          {trustItems.map((item) => (
            <div key={item.text} className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary">{item.icon}</span>
              <span className="text-label-sm font-label-sm text-secondary">{item.text}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Feature Grid */}
      <section className="bg-surface-container-lowest py-section-gap px-margin-mobile md:px-margin-desktop">
        <div className="max-w-container-max mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-headline-md font-headline-md text-primary tracking-tight font-bold mb-4">Precision Algorithms</h2>
            <p className="text-body-lg font-body-lg text-secondary max-w-2xl mx-auto">
              Our suite of indicators automatically detects complex market structures, freeing you to focus on execution.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter">
            {features.map((f) => (
              <div
                key={f.title}
                className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 ambient-shadow hover:-translate-y-1 transition-transform duration-300"
              >
                <span className="material-symbols-outlined text-primary text-3xl mb-4">{f.icon}</span>
                <h3 className="text-label-sm font-label-sm text-primary mb-2 text-lg">{f.title}</h3>
                <p className="text-body-md font-body-md text-secondary text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Performance Section */}
      <section className="bg-surface-container-low py-section-gap px-margin-mobile md:px-margin-desktop border-t border-outline-variant">
        <div className="max-w-container-max mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-headline-md font-headline-md text-primary tracking-tight font-bold mb-4">Verified Performance</h2>
            <p className="text-body-lg font-body-lg text-secondary max-w-2xl mx-auto">
              Metrics based on backtested data across major FX pairs and Indices over a 5-year period.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter">
            {stats.map((s) => (
              <div
                key={s.label}
                className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 ambient-shadow flex flex-col items-center"
              >
                <span className="text-secondary text-sm font-label-sm mb-2 uppercase tracking-wider">{s.label}</span>
                <span className="text-headline-lg font-headline-lg text-primary font-black">{s.value}</span>
                <div className="w-full h-8 flex items-end gap-1 opacity-50 justify-center">
                  {s.bars.map((h, i) => (
                    <div key={i} className="w-2 bg-primary" style={{ height: `${h * 4}px` }} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Band */}
      <section className="bg-primary text-on-primary py-section-gap px-margin-mobile md:px-margin-desktop text-center">
        <div className="max-w-3xl mx-auto flex flex-col items-center gap-stack-lg">
          <h2 className="text-headline-lg-mobile md:text-display font-display tracking-tighter font-extrabold text-on-primary">
            Ready to Master the Markets?
          </h2>
          <p className="text-body-lg font-body-lg text-on-primary-container">
            Join thousands of serious traders leveraging institutional-grade tools to refine their edge.
          </p>
          <Link
            href="/vip-community"
            className="bg-on-primary text-primary text-label-sm font-label-sm px-10 py-4 rounded hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 mt-stack-md"
          >
            Get Started Immediately
          </Link>
        </div>
      </section>
    </>
  );
};

export default Home;
