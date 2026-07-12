'use client';

import React, { useState } from 'react';
import Link from 'next/link';

const BILLING_PERIODS = ['Monthly', 'Quarterly', 'Yearly', 'Lifetime'];

const tiers = [
  {
    name: 'Standard',
    desc: 'Essential indicators for retail analysis.',
    price: { Monthly: 49, Quarterly: 129, Yearly: 399, Lifetime: 999 },
    features: ['Core Momentum Oscillators', 'Basic Trend Filters', 'Standard Support'],
    highlighted: false,
  },
  {
    name: 'Professional',
    desc: 'Advanced metrics for active traders.',
    price: { Monthly: 149, Quarterly: 399, Yearly: 1199, Lifetime: 2999 },
    features: ['All Standard Features', 'Order Block Detection', 'Volume Profile Suite', 'Priority Support'],
    highlighted: true,
  },
  {
    name: 'Institutional',
    desc: 'Full suite for funds and prop firms.',
    price: { Monthly: 499, Quarterly: 1299, Yearly: 3999, Lifetime: 9999 },
    features: ['All Professional Features', 'API Access', 'Custom Indicator Development', 'Dedicated Account Manager'],
    highlighted: false,
  },
];

const comparisonRows = [
  { category: 'Signals', items: [
    { feature: 'Core Oscillators', std: true, pro: true, inst: true },
    { feature: 'Order Block Detection', std: false, pro: true, inst: true },
    { feature: 'Liquidity Heatmaps', std: false, pro: false, inst: true },
  ]},
  { category: 'Data', items: [
    { feature: 'Real-time Feeds', std: true, pro: true, inst: true },
    { feature: 'API Access', std: false, pro: false, inst: true },
  ]},
  { category: 'Support', items: [
    { feature: 'Email Support', std: true, pro: true, inst: true },
    { feature: 'Priority Discord', std: false, pro: true, inst: true },
    { feature: 'Dedicated Account Manager', std: false, pro: false, inst: true },
  ]},
];

const faqs = [
  { q: 'Installation', a: 'Installation is handled via TradingView invite-only scripts. Once purchased, you will receive access within 24 hours.' },
  { q: 'Refunds', a: 'Due to the digital nature of the indicators, we offer a strict 7-day money-back guarantee for the Standard and Professional tiers if you are unsatisfied.' },
  { q: 'TradingView Access', a: 'Yes, a free TradingView account is required, though a paid TradingView tier is recommended for full feature utilization like multi-chart layouts.' },
  { q: 'Crypto Payments', a: 'We accept USDC, USDT, and Bitcoin for Annual and Lifetime plans. Please contact support to initiate a crypto transaction.' },
  { q: 'Alerts', a: 'All indicators come with pre-configured TradingView alerts that can be routed to Discord, Telegram, or email via webhooks.' },
  { q: 'Compatibility', a: 'Our scripts are compatible with all asset classes available on TradingView, including Forex, Crypto, Indices, and Equities.' },
  { q: 'Updates', a: 'Active subscribers receive seamless over-the-air updates to all indicators as we refine our algorithms.' },
];

const Pricing = () => {
  const [billing, setBilling] = useState('Quarterly');
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (i) => setOpenFaq(openFaq === i ? null : i);

  return (
    <>
      {/* Header */}
      <section className="px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto pt-section-gap pb-12 text-center">
        <h1 className="font-display text-headline-lg-mobile md:text-headline-lg text-primary mb-stack-md">
          Institutional Grade Precision
        </h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto mb-stack-lg">
          Select a tier that aligns with your trading volume and complexity requirements. High-contrast analysis tools for elite operators.
        </p>
        {/* Billing Toggle */}
        <div className="inline-flex items-center bg-surface-container-low rounded-full p-1 border border-outline-variant">
          {BILLING_PERIODS.map((p) => (
            <button
              key={p}
              onClick={() => setBilling(p)}
              className={`px-6 py-2 rounded-full font-label-sm text-label-sm transition-colors focus:outline-none ${
                billing === p
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto pb-section-gap">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter items-center">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`rounded-xl p-8 ambient-shadow flex flex-col h-full ${
                tier.highlighted
                  ? 'bg-primary border border-primary transform md:scale-105 z-10 p-10 relative'
                  : 'bg-surface-container-lowest border border-outline-variant'
              }`}
            >
              {tier.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-surface-container-lowest text-primary px-4 py-1 rounded-full font-label-sm text-label-sm border border-outline-variant shadow-sm">
                  Most Popular
                </div>
              )}
              <h3 className={`font-headline-md text-headline-md mb-2 ${tier.highlighted ? 'text-on-primary' : 'text-primary'}`}>
                {tier.name}
              </h3>
              <p className={`font-body-md text-body-md mb-6 ${tier.highlighted ? 'text-inverse-primary' : 'text-on-surface-variant'}`}>
                {tier.desc}
              </p>
              <div className="mb-8">
                <span className={`font-display text-display ${tier.highlighted ? 'text-on-primary' : 'text-primary'}`}>
                  ${tier.price[billing]}
                </span>
                <span className={`font-body-md text-body-md ${tier.highlighted ? 'text-inverse-primary' : 'text-on-surface-variant'}`}>
                  /{billing === 'Lifetime' ? 'once' : billing === 'Yearly' ? 'yr' : billing === 'Quarterly' ? 'qtr' : 'mo'}
                </span>
              </div>
              <ul className="space-y-4 mb-8 flex-grow">
                {tier.features.map((feat) => (
                  <li key={feat} className="flex items-center gap-3">
                    <span className={`material-symbols-outlined text-[20px] ${tier.highlighted ? 'text-on-primary' : 'text-primary'}`}>check</span>
                    <span className={`font-body-md text-body-md ${tier.highlighted ? 'text-on-primary' : ''}`}>{feat}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/checkout/professional"
                className={`w-full py-4 font-label-sm text-label-sm rounded-lg text-center block transition-all ${
                  tier.highlighted
                    ? 'bg-surface-container-lowest text-primary hover:bg-surface-container-high'
                    : 'bg-primary text-on-primary hover:opacity-90'
                }`}
              >
                Buy Now
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Comparison Table */}
      <section className="px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto pb-section-gap overflow-x-auto">
        <h2 className="font-headline-md text-headline-md text-primary mb-stack-lg text-center">Feature Comparison</h2>
        <div className="min-w-[800px] border border-outline-variant rounded-xl overflow-hidden bg-surface-container-lowest">
          <table className="w-full text-left font-body-md text-body-md">
            <thead>
              <tr className="bg-surface border-b border-outline-variant">
                <th className="p-6 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider w-1/4">Features</th>
                <th className="p-6 font-label-sm text-label-sm text-primary w-1/4 text-center">Standard</th>
                <th className="p-6 font-label-sm text-label-sm text-on-primary bg-primary w-1/4 text-center">Professional</th>
                <th className="p-6 font-label-sm text-label-sm text-primary w-1/4 text-center">Institutional</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {comparisonRows.map((cat) => (
                <React.Fragment key={cat.category}>
                  <tr className="bg-surface-container-low">
                    <td className="p-4 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider" colSpan={4}>{cat.category}</td>
                  </tr>
                  {cat.items.map((row) => (
                    <tr key={row.feature}>
                      <td className="p-6">{row.feature}</td>
                      <td className="p-6 text-center">
                        <span className={`material-symbols-outlined ${row.std ? 'text-primary' : 'text-outline-variant'}`}>{row.std ? 'check' : 'remove'}</span>
                      </td>
                      <td className="p-6 text-center">
                        <span className={`material-symbols-outlined ${row.pro ? 'text-primary' : 'text-outline-variant'}`}>{row.pro ? 'check' : 'remove'}</span>
                      </td>
                      <td className="p-6 text-center">
                        <span className={`material-symbols-outlined ${row.inst ? 'text-primary' : 'text-outline-variant'}`}>{row.inst ? 'check' : 'remove'}</span>
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto pb-section-gap max-w-3xl">
        <h2 className="font-headline-md text-headline-md text-primary mb-stack-lg text-center">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div key={i} className="border-b border-outline-variant pb-4">
              <button
                onClick={() => toggleFaq(i)}
                className="w-full flex justify-between items-center py-2 text-left focus:outline-none"
                aria-expanded={openFaq === i}
              >
                <span className="font-label-sm text-label-sm text-primary">{faq.q}</span>
                <span className={`material-symbols-outlined text-primary transition-transform duration-300 ${openFaq === i ? 'rotate-180' : ''}`}>
                  expand_more
                </span>
              </button>
              <div className={`overflow-hidden transition-all duration-300 ${openFaq === i ? 'max-h-96 mt-2' : 'max-h-0'}`}>
                <p className="font-body-md text-body-md text-on-surface-variant">{faq.a}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
};

export default Pricing;
