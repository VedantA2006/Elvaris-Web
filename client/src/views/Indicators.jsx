'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';

const ASSET_FILTERS = ['All', 'Gold', 'Forex', 'Crypto', 'Indices'];
const STYLE_FILTERS = ['Scalping', 'Swing Trading'];

const fallbackIndicators = [
  {
    slug: 'smc-pro',
    name: 'SMC Pro',
    shortDescription: 'Advanced Smart Money Concepts indicator mapping institutional order blocks, liquidity voids, and market structure shifts in real-time.',
    price: 49,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB2SxMUcyzzqaWGtUAmbCRllBxhz0pMHivoMDc_bRyRQP6bZ7ZXRRoStXYumr4TlL7XXMR8_WgOaUoaNmNNNvJmOFUKOs2ltQwGojntH4VfhULSK5HGITSvP1D918pVh4FCwBfkb_oePml6YjC8c9c9qbMP54jTjTq2iIe-RA6HcpCgYkOlrcrxA_wLBXdRQQgoLN7BSwFlr0NZi6vyVmqFGNNAKHqFAwSmcilPgb7YqyJ5Jh94hliVvc5owlBvfZv64eJq15V7Fa4',
    tags: ['Real-time', 'Multi-TF', 'Alerts'],
  },
  {
    slug: 'liquidity-flux',
    name: 'Liquidity Flux',
    shortDescription: 'Visualize hidden liquidity pools and stop-hunt zones. Essential for anticipating price reversals and breakout traps.',
    price: 39,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCE8-Q88h96Py_HYzOZFcMcndD5fdgsmOhK7papa2Oh_dmE-1D22LWkw6p-Iixw-0su552-zMioDK_TMDHrMKdwOKytBJIMwDCZ1M7BgCluUV44h17leaX5Kdj-X29KiXwvsxP74oF62kaebMQzC5cSQUvPFIDhdPEGiHGE6mOosprc-2N_MStHn7QYyesH3OJYLayZSbSUwxypbbWmXi6RsZufkYyRAiP1SIXzkjC5ajQHsb9GG61xF8y-iGQfIaYLpsvI6KLRVsY',
    tags: ['Heatmap', 'Volume Profile'],
  },
  {
    slug: 'order-block-engine',
    name: 'Order Block Engine',
    shortDescription: 'Automated detection of high-probability supply and demand zones based on institutional trading footprints.',
    price: 59,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAS68labLy6NHNidW4CPsWWrO_vF8w-d-3xN9eOItAP51bK0EY5k-P5bHulM3SN6T8FRqZtu7jKIVl5g2nvh9JRwCQNNCYXoZSiNhxe1-ofecxJHMtuTRRKgeTbZKYVqErxV_vl2UZcLl68gO27T3inem2LSxBJc_miL3kn9OK-a9i0KfT5lsTSV_qy494G3UdZ22gOIx4REXlD1RJzdtCxqndtzpuSLVfITKRNvXweyHSAYviVz_-IADrRzF4Oz5i28K4giRW93xI',
    tags: ['Auto-Draw', 'Swing'],
  },
  {
    slug: 'momentum-delta',
    name: 'Momentum Delta',
    shortDescription: 'Track aggressive buying and selling pressure. Identifies divergences between price action and underlying order flow.',
    price: 29,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCIcRgWHXPYtLbhkywhAPWOzb-gHclGEq1TjYDy2ms5G2Ctpgyfj4nxQ_8lesGOJBR_-Gw_rivsDUfIATzoH5AKNozpqcwCxonXPgIqIIU67SSnan-LFf2DD3FTLPkv7e1eS2WGtJLyvzDiHS2MbkYZnokoSYVOPTojfdWw1fi3uubxZIiD6UhCaagmqjy5ax04IDyMwUn2iZ9Pv596RxR9WlVpXgh0kcRrIgnUjQqOdXvN-a84v2rEz-2a9IUhY9G2vdAuStKO4Ys',
    tags: ['Oscillator', 'Divergence'],
  },
];

const Indicators = () => {
  const [indicators, setIndicators] = useState(fallbackIndicators);
  const [activeAsset, setActiveAsset] = useState('All');
  const [sortBy, setSortBy] = useState('Popularity');

  useEffect(() => {
    axios.get('/api/indicators').then((res) => {
      if (res.data?.length) setIndicators(res.data);
    }).catch(() => {});
  }, []);

  return (
    <>
      {/* Header */}
      <header className="bg-surface-container-lowest pt-stack-lg pb-section-gap px-margin-mobile md:px-margin-desktop text-center border-b border-surface-variant">
        <div className="max-w-3xl mx-auto pt-section-gap">
          <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary mb-stack-md">Indicators</h1>
          <p className="font-body-lg text-body-lg text-secondary">
            Institutional-grade tools for precision execution across all asset classes.
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-section-gap">
        {/* Filter Bar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-stack-lg mb-stack-lg border-b border-surface-variant pb-stack-md">
          <div className="flex flex-wrap gap-stack-sm items-center">
            <span className="font-label-sm text-label-sm text-secondary mr-2">Asset Class:</span>
            {ASSET_FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setActiveAsset(f)}
                className={`px-4 py-2 rounded-full font-label-sm text-label-sm transition-colors ${
                  activeAsset === f
                    ? 'bg-primary text-on-primary'
                    : 'bg-transparent text-primary border border-outline-variant hover:bg-surface-container'
                }`}
              >
                {f}
              </button>
            ))}
            <div className="w-px h-6 bg-outline-variant mx-2 hidden md:block" />
            <span className="font-label-sm text-label-sm text-secondary mr-2 mt-4 md:mt-0 w-full md:w-auto">Style:</span>
            {STYLE_FILTERS.map((f) => (
              <button
                key={f}
                className="px-4 py-2 bg-transparent text-primary border border-outline-variant rounded-full font-label-sm text-label-sm hover:bg-surface-container transition-colors"
              >
                {f}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span className="font-label-sm text-label-sm text-secondary">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent border border-outline-variant text-primary font-body-md text-body-md py-2 pl-4 pr-8 focus:ring-primary focus:border-primary"
            >
              <option>Popularity</option>
              <option>Newest</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Indicator Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
          {indicators.map((ind) => (
            <article
              key={ind.slug}
              className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden ambient-shadow flex flex-col h-full group hover:border-primary transition-colors duration-300"
            >
              <div className="h-48 bg-surface-variant relative overflow-hidden border-b border-outline-variant">
                <img
                  className="w-full h-full object-cover grayscale mix-blend-multiply opacity-80 group-hover:opacity-100 transition-opacity duration-300"
                  src={ind.image || ind.headerImage}
                  alt={ind.name}
                />
              </div>
              <div className="p-stack-lg flex-grow flex flex-col">
                <h3 className="font-headline-md text-headline-md text-primary mb-stack-sm text-[24px]">{ind.name}</h3>
                <p className="font-body-md text-body-md text-secondary line-clamp-2 mb-stack-md flex-grow">
                  {ind.shortDescription}
                </p>
                <div className="flex flex-wrap gap-2 mb-stack-lg">
                  {(ind.tags || ind.tradingStyle || []).map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 border border-outline-variant rounded-full font-label-sm text-label-sm text-[10px] text-primary"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="flex justify-between items-center mt-auto">
                  <span className="font-stats-tabular text-stats-tabular text-primary font-bold text-xl">
                    ${ind.price ?? (ind.pricing?.[0]?.price ?? 49)}/mo
                  </span>
                  <Link
                    href={`/indicators/${ind.slug}`}
                    className="bg-primary text-on-primary px-4 py-2 font-label-sm text-label-sm hover:shadow-ambient hover:-translate-y-0.5 transition-all duration-200"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </main>
    </>
  );
};

export default Indicators;
