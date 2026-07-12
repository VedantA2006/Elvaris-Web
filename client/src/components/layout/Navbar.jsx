'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';

const navLinks = [
  { href: '/indicators', label: 'Indicators' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/performance', label: 'Performance' },
  { href: '/documentation', label: 'Documentation' },
  { href: '/blog', label: 'Blog' },
];

const Navbar = () => {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="fixed top-0 w-full z-50 bg-surface/90 backdrop-blur-md border-b border-outline-variant">
      <div className="flex justify-between items-center h-20 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
        {/* Brand */}
        <Link
          href="/"
          className="font-display text-headline-md font-extrabold tracking-tighter text-primary"
        >
          Elvaris
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex gap-8 items-center h-full">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || pathname?.startsWith(link.href + '/');
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`font-label-sm text-label-sm uppercase tracking-wider h-full flex items-center transition-colors duration-200 ${
                  isActive
                    ? 'text-primary font-bold border-b-2 border-primary'
                    : 'text-secondary hover:text-primary'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <SignedIn>
            <Link
              href="/dashboard"
              className="hidden md:block font-label-sm text-label-sm text-primary hover:opacity-80 transition-opacity mr-2"
            >
              Dashboard
            </Link>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
          <SignedOut>
            <SignInButton mode="modal">
              <button className="hidden md:block font-label-sm text-label-sm text-primary hover:opacity-80 transition-opacity">
                Login
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="bg-primary text-on-primary font-label-sm text-label-sm px-6 py-2 rounded hover:shadow-ambient hover:-translate-y-0.5 transition-all duration-200">
                Get Started
              </button>
            </SignUpButton>
          </SignedOut>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden text-primary p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            <span className="material-symbols-outlined">
              {mobileOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-surface-container-lowest border-t border-outline-variant px-margin-mobile py-stack-lg">
          <nav className="flex flex-col gap-4">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || pathname?.startsWith(link.href + '/');
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`font-label-sm text-label-sm uppercase tracking-wider py-2 transition-colors ${
                    isActive ? 'text-primary font-bold' : 'text-secondary hover:text-primary'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
