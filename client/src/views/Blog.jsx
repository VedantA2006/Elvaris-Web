'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import axios from 'axios';

const fallbackPosts = [
  {
    slug: 'the-psychology-of-high-stakes-scalping',
    title: 'The Psychology of High-Stakes Scalping',
    excerpt: 'Understanding the cognitive biases that impact precision execution in volatile markets.',
    category: 'Trading Psychology',
    date: 'May 12, 2024',
    readTime: '8 min read',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDqfssibQj2-Q7hepmBXVoPdZ_pMQCZw-vxNV30vSIJncC02asCgok8rf10CE4YmHCN2ZDRHosXla3cuhkoIKBcWBbfI-A1sKBDgI7HSKJ2aip3LTzPBE6zvqCUQOC82dtJFO-NsXS9D5xOi5X9lh1spRtIUixxc2UoFIzVihLblS98kObQMxq67_DYyOgCrlqHNW6xlCcDU3-KsV0UhWzRbJBrBv8ICy1C9DYyWvgdiafn0RfACi_zjPZdEjgbcteQ4W6h5iOkKZY',
    content: `In the relentless arena of high-frequency trading, scalping stands as the ultimate test of nerve and cognitive endurance. Unlike long-term positional trading, which allows for measured analysis and considered adjustments, scalping demands split-second execution and an ironclad mental framework.

The psychological toll of executing dozens, sometimes hundreds, of trades within a single session is profound. The trader must navigate a landscape of microscopic price movements, where hesitation translates directly to tangible losses. It requires a paradoxical state of mind: hyper-vigilance coupled with emotional detachment.

## The Burden of Milliseconds

When dealing with institutional-grade flow and order book dynamics, the human element becomes the weakest link. The cognitive load required to interpret fleeting imbalances in bid-ask spreads while managing risk per trade is immense. Fear and greed, the primal drivers of market behavior, are amplified in this microcosm.

> "Trading is not a game of certainty, but a game of probabilities and discipline."

A single mistimed entry, driven by the anxiety of missing out (FOMO) or the desperation to recover a loss (revenge trading), can unravel a session's meticulous work. High-stakes scalpers must cultivate a mindset that views losses not as personal failures, but as statistical inevitabilities—the cost of doing business in a probabilistic environment.

## Structuring the Mental Framework

Elite scalpers rely on rigorous routine to mitigate psychological drift. This involves predefined risk parameters that are non-negotiable. Hard stops, daily loss limits, and maximum drawdown thresholds act as mechanical fail-safes against human frailty.

- **Decoupling from the Outcome:** Focusing purely on execution quality rather than the immediate PnL of a single trade.
- **Cognitive Reset Protocols:** Employing brief, structured breaks following significant drawdowns or periods of intense volatility to clear mental cache.
- **Systematized Review:** Post-market analysis focused on deviations from the trading plan, emphasizing procedural discipline over profit maximization.

Ultimately, mastering high-stakes scalping is less about predicting the next tick and more about mastering oneself. It is the continuous refinement of an internal algorithm designed to execute flawlessly amidst chaos.`,
  },
  {
    slug: 'gold-market-structural-shift',
    title: 'Gold Market Structural Shift',
    excerpt: 'Analyzing the recent institutional liquidity sweep in XAUUSD.',
    category: 'Market Analysis',
    date: 'May 10, 2024',
    readTime: '5 min read',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCrqG1gpxn79azJ3aph-GU2nBGH-Ps5wNq41oY5Agl-B1_a1GHTrxBge_830eIIrRJLYUVM-Pi_4Kmo6M0OU298FkZna2hynY4tEpleO9AB8oMHsRPYrIB0A8aLnHyu__mp2l04fAyAiOtlpNbzFtQsXTq4fsHC6YhOHknNj5GRVeuuFfc6nsUd4Z1do0h1OxevwQrB4QCp5GKIB86rpNGWrBdf_Y7F7MTi5JLezrefvERbaCwBzXXe9aikTHD7uKUfEgeBqrfgFFM',
  },
  {
    slug: 'indicator-suite-v2-4-release',
    title: 'Indicator Suite v2.4 Release Notes',
    excerpt: 'New multi-timeframe order block detection and refined alert logic.',
    category: 'Indicator Updates',
    date: 'May 08, 2024',
    readTime: '4 min read',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBbiNmrvj-oy8c0K6Dbh0PQp5RNOotJXODIFgOmPz1QG1elGMtRwVpLeZoQ68k54N-lIU1Kywwl4fmUsU8p8oRvBczR1LOiGPELeCF6H3LU2oaeHSy1L88WoDZVjueyttqPpB3J1_S4PMIuW0vMr7ZIXDaPiRamSkofiw7TuOJgade9johtaGjQRSUX6gxO3jCh1Wzb6ih7pf0ToZjxTMoT43N4ph839KeiPgxsK95jwjkBZnseKn1E9Oy57TeG0w3pN0u2Bjj5VXU',
  },
  {
    slug: 'forex-liquidity-maps-explained',
    title: 'Forex Liquidity Maps Explained',
    excerpt: 'How to visualize institutional sell-side and buy-side liquidity.',
    category: 'Forex',
    date: 'May 05, 2024',
    readTime: '12 min read',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC39udTTuIB__YtVBmSFnehOZUzLvK1ezUQyJfVYvO5msj4m-v41zSMedup6BMG-yniYb4v4dkBH39zN6NrJjrzUghW_JQvg9PCsVFHtWklOpixljG7Y9w8i4_doPWdszoqFhR59ou3SPDWLTs7MFYlWnsUVeCAC5C8YxbSMFNe1FbuMZARj2YmAXC8QdpP_AuNq7Met_7qmL0qtgqRs4IEO42Hr-cx5JIhwKzYp-ovR6gSo23Z_aG7fSiuKz99_fiMvwfk8QqfM9c',
  },
];

const Blog = () => {
  const params = useParams();
  const slug = params?.slug;
  const [posts, setPosts] = useState(fallbackPosts);
  const [activeCategory, setActiveCategory] = useState('All Posts');

  useEffect(() => {
    axios.get('/api/blog').then((res) => {
      if (res.data?.length) setPosts(res.data);
    }).catch(() => {});
  }, []);

  const categories = ['All Posts', 'Gold Strategies', 'Forex', 'Indicator Updates', 'Market Analysis', 'Trading Psychology'];

  // Single post view
  if (slug) {
    const post = posts.find((p) => p.slug === slug) || posts[0];
    return (
      <div className="bg-surface text-on-surface">
        {/* Header Image */}
        <div className="w-full h-[50vh] min-h-[400px] bg-surface-container-high relative overflow-hidden">
          <img
            alt={post.title}
            className="absolute inset-0 w-full h-full object-cover grayscale opacity-90"
            src={post.image || fallbackPosts[0].image}
          />
        </div>

        {/* Main Content Canvas */}
        <main className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-stack-lg flex relative">
          {/* Sticky Share Rail (Left) */}
          <aside className="hidden lg:block w-16 flex-shrink-0 relative">
            <div className="sticky top-32 flex flex-col gap-6 items-center">
              <div className="w-[1px] h-12 bg-outline-variant mb-2"></div>
              <button className="w-10 h-10 rounded-full border border-outline flex items-center justify-center hover:bg-surface-variant transition-colors group">
                <span className="material-symbols-outlined text-outline group-hover:text-primary transition-colors text-[20px]">share</span>
              </button>
              <button className="w-10 h-10 rounded-full border border-outline flex items-center justify-center hover:bg-surface-variant transition-colors group">
                <span className="material-symbols-outlined text-outline group-hover:text-primary transition-colors text-[20px]">bookmark</span>
              </button>
              <button className="w-10 h-10 rounded-full border border-outline flex items-center justify-center hover:bg-surface-variant transition-colors group">
                <span className="material-symbols-outlined text-outline group-hover:text-primary transition-colors text-[20px]">print</span>
              </button>
            </div>
          </aside>

          {/* Article Body */}
          <article className="flex-1 max-w-3xl mx-auto lg:ml-16">
            <header className="mb-stack-lg">
              <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary mb-stack-sm">
                {post.title}
              </h1>
              <div className="flex items-center gap-2 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                <span>By Elvaris Research</span>
                <span className="text-outline-variant">•</span>
                <span>{post.date}</span>
              </div>
            </header>

            <div className="prose prose-lg max-w-none prose-p:font-body-md prose-p:text-body-md prose-p:text-on-surface prose-p:mb-6 prose-headings:font-headline-md prose-headings:text-headline-md prose-headings:text-primary prose-headings:mb-4 prose-headings:mt-8">
              {post.content ? (
                // Super simple markdown parser for the fallback content
                post.content.split('\n\n').map((para, idx) => {
                  if (para.startsWith('## ')) return <h2 key={idx} className="font-headline-md text-headline-md text-primary mt-12 mb-6">{para.replace('## ', '')}</h2>;
                  if (para.startsWith('> ')) return (
                    <blockquote key={idx} className="my-12 pl-6 border-l-2 border-primary py-2 pr-4">
                      <p className="font-headline-md text-headline-md text-primary italic leading-tight">{para.replace('> ', '')}</p>
                    </blockquote>
                  );
                  if (para.startsWith('- ')) return (
                    <ul key={idx} className="list-disc pl-6 mb-6 font-body-md text-body-md text-on-surface space-y-2">
                      {para.split('\n').map((item, i) => (
                        <li key={i}>{item.replace('- ', '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</li>
                      ))}
                    </ul>
                  );
                  return <p key={idx}>{para}</p>;
                })
              ) : (
                <p>{post.excerpt}</p>
              )}
            </div>
          </article>
        </main>

        {/* Related Posts */}
        <section className="bg-surface-container-lowest w-full py-section-gap border-t border-outline-variant">
          <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
            <h3 className="font-headline-md text-headline-md text-primary mb-stack-lg">Related Posts</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
              {posts.filter(p => p.slug !== slug).slice(0, 3).map((rel) => (
                <Link key={rel.slug} href={`/blog/${rel.slug}`} className="group block border border-outline-variant bg-surface rounded-lg overflow-hidden ambient-shadow hover:border-primary transition-all duration-300">
                  <div className="h-48 bg-surface-variant overflow-hidden">
                    <img alt={rel.title} className="w-full h-full object-cover grayscale group-hover:scale-105 transition-transform duration-500" src={rel.image || fallbackPosts[0].image} />
                  </div>
                  <div className="p-6">
                    <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-2">{rel.category}</p>
                    <h4 className="font-body-lg text-body-lg text-primary font-semibold mb-2 group-hover:underline">{rel.title}</h4>
                    <p className="font-label-sm text-label-sm text-on-surface-variant">{rel.date}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </div>
    );
  }

  // Blog index
  const filteredPosts = activeCategory === 'All Posts' ? posts : posts.filter((p) => p.category === activeCategory);
  const heroPost = filteredPosts[0];
  const gridPosts = filteredPosts.slice(1);

  return (
    <main className="flex-grow w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-section-gap">
      {/* Header & Filters */}
      <div className="mb-section-gap">
        <h1 className="font-display text-display text-primary mb-stack-lg hidden md:block">Insights & Analysis</h1>
        <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-primary mb-stack-lg md:hidden">Insights & Analysis</h1>
        
        <div className="flex flex-wrap gap-stack-sm">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`font-label-sm text-label-sm px-4 py-2 rounded-full transition-colors duration-200 ${
                activeCategory === cat
                  ? 'bg-primary text-on-primary'
                  : 'bg-transparent border border-primary text-primary hover:bg-surface-variant'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Hero Featured Post */}
      {heroPost && (
        <Link href={`/blog/${heroPost.slug}`} className="mb-section-gap grid grid-cols-1 md:grid-cols-12 gap-gutter items-center group cursor-pointer block">
          <div className="md:col-span-8 overflow-hidden rounded-xl border border-outline-variant ambient-shadow h-[400px] md:h-[600px] relative">
            <img alt={heroPost.title} className="w-full h-full object-cover filter grayscale transition-transform duration-700 group-hover:scale-105" src={heroPost.image} />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent flex items-end p-margin-mobile md:hidden">
              <div>
                <div className="flex gap-4 items-center mb-stack-sm text-on-primary opacity-80 font-stats-tabular text-stats-tabular">
                  <span>{heroPost.date}</span>
                  <span className="w-1 h-1 bg-on-primary rounded-full"></span>
                  <span>{heroPost.readTime}</span>
                </div>
                <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-on-primary mb-stack-md leading-tight">{heroPost.title}</h2>
              </div>
            </div>
          </div>
          <div className="md:col-span-4 hidden md:flex flex-col justify-center pl-gutter">
            <div className="flex gap-4 items-center mb-stack-md text-on-surface-variant font-stats-tabular text-stats-tabular">
              <span>{heroPost.date}</span>
              <span className="w-1 h-1 bg-outline rounded-full"></span>
              <span>{heroPost.readTime}</span>
            </div>
            <h2 className="font-headline-lg text-headline-lg text-primary mb-stack-lg leading-tight group-hover:underline decoration-2 underline-offset-4">{heroPost.title}</h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant mb-stack-lg">{heroPost.excerpt}</p>
            <div className="flex items-center text-primary font-label-sm text-label-sm gap-2 uppercase tracking-widest group-hover:gap-4 transition-all duration-300">
              Read Article <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </div>
          </div>
        </Link>
      )}

      {/* Grid Posts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
        {gridPosts.map((post) => (
          <Link key={post.slug} href={`/blog/${post.slug}`} className="bg-surface-container-lowest rounded-xl border border-outline-variant ambient-shadow overflow-hidden flex flex-col group cursor-pointer hover:-translate-y-1 transition-transform duration-300">
            <div className="h-64 overflow-hidden relative border-b border-outline-variant">
              <img alt={post.title} className="w-full h-full object-cover filter grayscale transition-transform duration-700 group-hover:scale-105" src={post.image || fallbackPosts[0].image} />
            </div>
            <div className="p-stack-lg flex flex-col flex-grow">
              <div className="flex gap-3 items-center mb-stack-sm text-on-surface-variant font-stats-tabular text-stats-tabular text-sm">
                <span>{post.date}</span>
                <span className="w-1 h-1 bg-outline rounded-full"></span>
                <span>{post.readTime || '5 min read'}</span>
              </div>
              <h3 className="font-headline-md text-headline-md text-primary mb-stack-sm leading-tight group-hover:text-surface-tint transition-colors duration-200">{post.title}</h3>
              <p className="font-body-md text-body-md text-on-surface-variant mb-stack-lg flex-grow">{post.excerpt}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-stack-lg flex justify-center">
        <button className="font-label-sm text-label-sm bg-transparent border border-primary text-primary px-8 py-3 rounded hover:bg-surface-variant transition-colors duration-200 uppercase tracking-widest">
          Load More
        </button>
      </div>
    </main>
  );
};

export default Blog;
