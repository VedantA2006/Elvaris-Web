'use client';

import React, { useState } from 'react';

const sidebarNav = [
  {
    title: 'Getting Started',
    items: [
      { label: 'Installation Guide', id: 'installation' },
      { label: 'System Requirements', id: 'requirements' },
      { label: 'Quick Start Video', id: 'quickstart' },
    ],
  },
  {
    title: 'Core Functionality',
    items: [
      { label: 'Trading Guide', id: 'trading' },
      { label: 'Settings Guide', id: 'settings' },
      { label: 'Alert Guide', id: 'alerts' },
    ],
  },
  {
    title: 'Support',
    items: [
      { label: 'Troubleshooting', id: 'troubleshooting' },
      { label: 'FAQ', id: 'faq' },
    ],
  },
];

const Docs = () => {
  const [activeDoc, setActiveDoc] = useState('installation');
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="max-w-container-max mx-auto w-full px-margin-mobile md:px-margin-desktop py-stack-lg md:py-margin-desktop flex flex-col md:flex-row gap-gutter md:gap-margin-desktop">
      {/* Left Sidebar */}
      <aside className="w-full md:w-[280px] flex-shrink-0 mb-stack-lg md:mb-0 hidden md:block">
        <div className="sticky top-[120px] max-h-[calc(100vh-160px)] overflow-y-auto custom-scrollbar pr-4">
          {/* Search */}
          <div className="relative mb-stack-lg">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">search</span>
            <input
              type="text"
              placeholder="Search documentation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg pl-10 pr-4 py-2 text-body-md font-body-md text-primary placeholder-on-surface-variant focus:outline-none focus:border-primary focus:ring-0 transition-colors"
            />
          </div>

          {/* Nav Sections */}
          <nav className="space-y-stack-lg">
            {sidebarNav.map((section) => (
              <div key={section.title}>
                <h3 className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-stack-sm">{section.title}</h3>
                <ul className="space-y-1">
                  {section.items.map((item) => (
                    <li key={item.id}>
                      <button
                        onClick={() => setActiveDoc(item.id)}
                        className={`block w-full text-left py-2 pl-4 border-l-2 font-body-md text-body-md transition-colors ${
                          activeDoc === item.id
                            ? 'border-primary text-primary font-bold bg-surface-container-low rounded-r-lg'
                            : 'border-transparent text-on-surface-variant hover:text-primary hover:border-outline-variant'
                        }`}
                      >
                        {item.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0">
        {/* Breadcrumbs */}
        <nav className="flex items-center space-x-2 text-on-surface-variant font-label-sm text-label-sm mb-stack-lg">
          <span className="hover:text-primary transition-colors cursor-pointer">Documentation</span>
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          <span className="hover:text-primary transition-colors cursor-pointer">Getting Started</span>
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          <span className="text-primary font-bold">Installation Guide</span>
        </nav>

        {/* Article */}
        <article className="prose max-w-none">
          <h1 className="font-headline-lg md:font-headline-lg text-headline-lg-mobile md:text-headline-lg font-extrabold text-primary mb-stack-lg tracking-tighter">
            Installation Guide
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant mb-stack-lg max-w-[800px] leading-relaxed">
            Welcome to the official Elvaris platform. This guide will walk you through the process of adding our proprietary institutional-grade indicators to your charting environment. The setup process takes less than 5 minutes.
          </p>

          {/* Tip Callout */}
          <div className="my-stack-lg p-stack-md bg-surface-container-low border border-outline-variant rounded-xl flex gap-stack-md items-start">
            <span className="material-symbols-outlined text-primary shrink-0 mt-1" style={{ fontVariationSettings: "'FILL' 1" }}>lightbulb</span>
            <div>
              <strong className="block font-label-sm text-label-sm text-primary mb-1 uppercase tracking-wider">PRO TIP</strong>
              <p className="font-body-md text-body-md text-primary m-0">Ensure you are logged into your primary TradingView account before clicking the authorization link below to avoid syncing issues.</p>
            </div>
          </div>

          <h2 className="font-headline-md text-headline-md font-bold text-primary mt-stack-lg mb-stack-md tracking-tight">
            1. Account Synchronization
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant mb-stack-md leading-relaxed max-w-[800px]">
            To begin using the Elvaris suite, you must link your active subscription to your charting username. Navigate to your Elvaris Dashboard and locate the <code className="font-mono text-sm bg-surface-container py-0.5 px-1.5 rounded border border-outline-variant text-primary">Integrations</code> tab.
          </p>

          {/* Code Snippet */}
          <div className="my-stack-lg rounded-xl border border-outline-variant bg-surface-container-lowest overflow-hidden">
            <div className="bg-surface-container-low px-4 py-2 border-b border-outline-variant flex justify-between items-center">
              <span className="font-label-sm text-label-sm text-on-surface-variant">Authentication Token Format</span>
              <button className="text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1 font-label-sm text-label-sm">
                <span className="material-symbols-outlined text-[16px]">content_copy</span>
                Copy
              </button>
            </div>
            <pre className="p-4 m-0 overflow-x-auto">
              <code className="font-mono text-sm text-primary">{`ELV-AUTH-v2.1-[YOUR_UNIQUE_ID]
--region=us-east
--strict-sync=true`}</code>
            </pre>
          </div>

          <h2 className="font-headline-md text-headline-md font-bold text-primary mt-stack-lg mb-stack-md tracking-tight">
            2. Applying the Indicators
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant mb-stack-lg leading-relaxed max-w-[800px]">
            Once synchronized, open any chart. Click the &quot;Indicators&quot; button in the top toolbar, select &quot;Invite-Only Scripts&quot;, and click on the Elvaris Master Suite.
          </p>

          {/* Screenshot */}
          <figure className="my-stack-lg">
            <div className="rounded-xl border border-outline-variant bg-surface-container-lowest overflow-hidden p-2 ambient-shadow">
              <img
                className="w-full h-auto rounded-lg border border-outline-variant/50 object-cover aspect-video"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuB5mWD-CXu49kfx9ClxjL0Y1_AH8P3hUWSnkJZ7XMr83qsvc5ftuLYpoAkHBws4ogwheW_YavlLafktCJOmYTvnFamaAAEZK_UA-MjexUs7pDBqsoZ13LqKqM8QbTkKSGdLYL138W3_K9fRgTYDOdyYTL4l2mfiCXHnMSj1uzAJrC9IMe4iTyrw_TkBaoEvyyqk3_o7l786NrWlMjU42m2uGUzTYulKEQ8x_ISWngGUIxXsOM-DCZWYHtL3AhM9P_ohKRannzkBrxM"
                alt="Elvaris Master Suite in TradingView"
              />
            </div>
            <figcaption className="text-center mt-3 font-label-sm text-label-sm text-on-surface-variant">
              Fig 1. Locating the Elvaris Master Suite within the Invite-Only scripts directory.
            </figcaption>
          </figure>

          {/* Warning Callout */}
          <div className="my-stack-lg p-stack-md bg-surface-container-lowest border border-primary rounded-xl flex gap-stack-md items-start ambient-shadow">
            <span className="material-symbols-outlined text-primary shrink-0 mt-1" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
            <div>
              <strong className="block font-label-sm text-label-sm text-primary mb-1 uppercase tracking-wider">IMPORTANT</strong>
              <p className="font-body-md text-body-md text-primary m-0">Do not attempt to modify the source code of the indicators. Doing so will immediately invalidate your subscription hash and require a manual reset from support.</p>
            </div>
          </div>

          <hr className="my-section-gap border-outline-variant" />

          {/* Bottom Navigation */}
          <div className="flex justify-between items-center mt-stack-lg">
            <button className="flex flex-col items-start p-4 rounded-xl border border-transparent hover:border-outline-variant hover:bg-surface-container-low transition-all duration-200">
              <span className="font-label-sm text-label-sm text-on-surface-variant mb-1">Previous</span>
              <span className="font-body-md text-body-md font-bold text-primary flex items-center gap-2">
                <span className="material-symbols-outlined">arrow_back</span>
                System Requirements
              </span>
            </button>
            <button className="flex flex-col items-end p-4 rounded-xl border border-transparent hover:border-outline-variant hover:bg-surface-container-low transition-all duration-200 text-right">
              <span className="font-label-sm text-label-sm text-on-surface-variant mb-1">Next</span>
              <span className="font-body-md text-body-md font-bold text-primary flex items-center gap-2">
                Trading Guide
                <span className="material-symbols-outlined">arrow_forward</span>
              </span>
            </button>
          </div>
        </article>
      </main>
    </div>
  );
};

export default Docs;
