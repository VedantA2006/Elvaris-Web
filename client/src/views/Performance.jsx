'use client';

import React from 'react';

const statCards = [
  { label: 'Win Rate', value: '68.4%', icon: 'trending_up', bars: [2, 4, 3, 6, 5, 8] },
  { label: 'Profit Factor', value: '2.14', icon: 'account_balance', bars: [3, 2, 5, 4, 7, 8] },
  { label: 'Max Drawdown', value: '-8.2%', icon: 'show_chart', bars: [8, 6, 7, 4, 2, 1] },
  { label: 'Avg Risk/Reward', value: '1:1.8', icon: 'balance', bars: [4, 4, 5, 6, 7, 8] },
];

const monthlyReturns = [
  { month: 'Jan', pct: 3.2 }, { month: 'Feb', pct: 4.8 }, { month: 'Mar', pct: 1.5 },
  { month: 'Apr', pct: -1.0 }, { month: 'May', pct: 6.2 }, { month: 'Jun', pct: 2.8 },
  { month: 'Jul', pct: 4.1 }, { month: 'Aug', pct: -0.5 }, { month: 'Sep', pct: 5.7 },
  { month: 'Oct', pct: 7.5 }, { month: 'Nov', pct: 3.9 }, { month: 'Dec', pct: 9.1 },
];

const galleryImages = {
  backtest: [
    { src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCKQmuqLqqlx1qVhkjVryGHTb20BQvvc5lrX3EzNDo4s76w5uOSP-2-iMEx33ueTiLfJ5dntN6yrwuFQZBuyxD9DYEjl3ka2otUgo6yn4aQk1cWUd8GRgryj-Ikf2RNG9O7_ry1gvGG8k8z6SWp-lw2bipnXGqcKLMaYvOO_uEHexCUG0FLV6L8vJ40TZLqxTxICeIn72nB7gWVgNAAVIEgDG0UMnBvfdUOW2G-9qYePe6_cGCqbLhRrIAn7LUpoWZB3rx8_6tl5Tw', label: 'Strategy Alpha' },
    { src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBGcUzU6XiVLjKy-EZk0yRohg5q2iWKzTLkO4jUlUK0gdGPrn6XrBX0PbdHsg-E0pYMKqAwR2dxTs2uLNC5RlO2zHVeevPUckIgqIQgRFpSbq3NgXw0LumLVuN62MXdC3bNuxDqhKFvduJPgQ5dgo1MVqVc_AiI7BtX4SU0Tj9GpF3Er1xTAnLCv1jSSQEPd2KJBlcOfQ1FwoPaVWIIjL49zU2MYC3OuJTFsbkEmVrX6bDhrTb3GTj_DgOS-A45-eWC-bFZbmxB9Qs', label: 'Strategy Beta' },
  ],
  forward: [
    { src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCjOgw0oQoXeAjefGVkjbEJzga2-YYUY3kIU9WJipjmhewuuU07GUbj8KkEqRCAAHotMnCfufuVp57PYpPJP8v1bRreX07gHrpZx5cGtwXgMyj9zFK392RZp_RbRixCJe9rUCkpbni_5L43Kfes8CGgY-m13vz8IMs0N8WfSTJdDF_yKrzwJAIFwN7-X3UzyK7sS9QC3CYacHc1n-S9venVEXmri4EXKMAdhpFTlzmtcj6bGKYrVMYVa-SNvGm11iyjwS-4nQOQLqg', label: 'Live Alpha' },
    { src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAFaE0ULTWI8H6jhyGxaESakUOLmDV9kbaxQohtPYxUvpkJtXZLihK6J8neeZgVSRYvLIt1AEMp_a7zOd5go3tMZEFiIUFSJ8IuScIVDiIBd8c3V10U3okBN3W8i8ASnC8ykQDIfk7qAOrSRmK-fe8imz817yffPcHEFgHQWgztqYVWMfu6iwJ3-IIAtFLgXGkN3aZ2rDBMh5Pn0DqYcZfWiRQmzRZx5z_Jiw0qcE8mTW2pYJh32yNt5QsUOdSMuneU6UcUnsuqGtI', label: 'Live Beta' },
  ],
};

const Performance = () => {
  const maxPct = Math.max(...monthlyReturns.map((r) => Math.abs(r.pct)));

  return (
    <>
      {/* Hero Header */}
      <header className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop pt-section-gap pb-12">
        <h1 className="font-display text-display text-primary mb-stack-md">Institutional Performance</h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
          Verified algorithmic execution metrics. Engineered for precision, transparency, and absolute return generation across market cycles.
        </p>
      </header>

      {/* Stat Cards */}
      <section className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop mb-section-gap">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter">
          {statCards.map((s) => (
            <div key={s.label} className="bg-surface-container-lowest border border-outline-variant rounded-xl p-stack-lg ambient-shadow flex flex-col justify-between h-48">
              <div className="flex justify-between items-start">
                <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">{s.label}</span>
                <span className="material-symbols-outlined text-outline">{s.icon}</span>
              </div>
              <div>
                <div className="font-headline-lg text-headline-lg text-primary mb-stack-sm font-stats-tabular">{s.value}</div>
                <div className="w-full h-8 flex items-end gap-1 opacity-50">
                  {s.bars.map((h, i) => (
                    <div key={i} className="bg-primary w-1/6" style={{ height: `${h * 4}px` }} />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Return Analytics */}
      <section className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop mb-section-gap">
        <h2 className="font-headline-md text-headline-md text-primary mb-stack-lg border-b border-outline-variant pb-stack-sm">Return Analytics</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter">
          {/* Bar Chart */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-stack-lg ambient-shadow">
            <h3 className="font-body-md text-body-md font-semibold text-primary mb-stack-md">Monthly Returns (%)</h3>
            <div className="h-64 border-l border-b border-outline-variant relative flex items-end justify-between px-2 pb-2 pt-8">
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
                {[0, 1, 2, 3].map((i) => <div key={i} className="w-full h-px bg-outline-variant" />)}
              </div>
              {monthlyReturns.map((r) => (
                <div
                  key={r.month}
                  title={`${r.month}: ${r.pct}%`}
                  className={`w-1/12 mx-1 transition-opacity hover:opacity-80 ${
                    r.pct >= 0 ? 'bg-primary' : 'bg-surface border border-primary'
                  }`}
                  style={{ height: `${(Math.abs(r.pct) / maxPct) * 100}%` }}
                />
              ))}
            </div>
          </div>

          {/* Equity Curve */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-stack-lg ambient-shadow relative overflow-hidden">
            <h3 className="font-body-md text-body-md font-semibold text-primary mb-stack-md z-10 relative">Cumulative Equity Curve</h3>
            <div className="h-64 border-l border-b border-outline-variant relative z-0">
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
                {[0, 1, 2, 3].map((i) => <div key={i} className="w-full h-px bg-outline-variant" />)}
              </div>
              <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                <polyline
                  fill="none"
                  points="0,90 10,85 20,70 30,75 40,50 50,45 60,30 70,35 80,15 90,20 100,5"
                  stroke="black"
                  strokeWidth="2"
                />
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* Verified Results Gallery */}
      <section className="bg-surface-container-high py-section-gap border-y border-outline-variant">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
          <h2 className="font-headline-md text-headline-md text-primary mb-stack-lg text-center">Verified Results</h2>

          <div className="mb-stack-lg">
            <h3 className="font-body-lg text-body-lg text-primary mb-stack-md border-b border-outline-variant pb-stack-sm inline-block">Backtest Results</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
              {galleryImages.backtest.map((img) => (
                <div key={img.label} className="relative group">
                  <img
                    className="w-full h-64 object-cover rounded-xl border border-outline-variant ambient-shadow transition-transform duration-300 group-hover:scale-[1.02]"
                    src={img.src}
                    alt={img.label}
                  />
                  <div className="absolute top-4 left-4 bg-surface-container-lowest text-primary text-[10px] font-bold px-3 py-1 rounded-full border border-primary uppercase tracking-widest">
                    {img.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-body-lg text-body-lg text-primary mb-stack-md border-b border-outline-variant pb-stack-sm inline-block">Forward Test Results</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
              {galleryImages.forward.map((img) => (
                <div key={img.label} className="relative group">
                  <img
                    className="w-full h-64 object-cover rounded-xl border border-outline-variant ambient-shadow transition-transform duration-300 group-hover:scale-[1.02]"
                    src={img.src}
                    alt={img.label}
                  />
                  <div className="absolute top-4 left-4 bg-surface-container-lowest text-primary text-[10px] font-bold px-3 py-1 rounded-full border border-primary uppercase tracking-widest">
                    {img.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-stack-lg">
        <p className="font-label-sm text-label-sm text-on-surface-variant text-center opacity-50">
          Past performance is not indicative of future results. Trading involves significant risk of loss.
        </p>
      </div>
    </>
  );
};

export default Performance;
