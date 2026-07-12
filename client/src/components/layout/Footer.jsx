import React from 'react';
import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="bg-primary w-full py-section-gap border-t border-white/10 px-margin-mobile md:px-margin-desktop">
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-gutter max-w-container-max mx-auto mb-16">
        {/* Brand */}
        <div className="col-span-2 lg:col-span-2 flex flex-col gap-4 pr-8">
          <div className="text-headline-md font-display font-black text-on-primary">
            Elvaris
          </div>
          <p className="text-on-primary-container text-sm">
            Professional trading indicators engineered for precision and performance.
          </p>
        </div>

        {/* Products */}
        <div className="flex flex-col gap-4">
          <h4 className="text-on-primary font-bold text-sm uppercase tracking-wider">Products</h4>
          <Link href="/indicators" className="text-label-sm font-label-sm text-on-secondary-container hover:text-on-primary transition-all">
            Indicator Catalog
          </Link>
          <Link href="/performance" className="text-label-sm font-label-sm text-on-secondary-container hover:text-on-primary transition-all">
            Performance Metrics
          </Link>
          <Link href="/pricing" className="text-label-sm font-label-sm text-on-secondary-container hover:text-on-primary transition-all">
            Pricing Plans
          </Link>
        </div>

        {/* Company */}
        <div className="flex flex-col gap-4">
          <h4 className="text-on-primary font-bold text-sm uppercase tracking-wider">Company</h4>
          <Link href="/documentation" className="text-label-sm font-label-sm text-on-secondary-container hover:text-on-primary transition-all">
            Documentation
          </Link>
          <Link href="/blog" className="text-label-sm font-label-sm text-on-secondary-container hover:text-on-primary transition-all">
            Blog
          </Link>
          <Link href="/affiliate" className="text-label-sm font-label-sm text-on-secondary-container hover:text-on-primary transition-all">
            Affiliate Program
          </Link>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="max-w-container-max mx-auto pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-label-sm font-label-sm text-on-secondary-container">
          © {new Date().getFullYear()} Elvaris Technologies. All rights reserved.
        </p>
        <div className="flex gap-4">
          <Link href="#" className="text-on-secondary-container hover:text-on-primary transition-colors">
            <span className="material-symbols-outlined text-lg">policy</span>
          </Link>
          <Link href="#" className="text-on-secondary-container hover:text-on-primary transition-colors">
            <span className="material-symbols-outlined text-lg">gavel</span>
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
