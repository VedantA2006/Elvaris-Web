import React from 'react';
import './globals.css';
import { ClerkProvider } from '@clerk/nextjs';
import Providers from './providers.jsx';
import Navbar from '../src/components/layout/Navbar.jsx';
import Footer from '../src/components/layout/Footer.jsx';

export const metadata = {
  title: 'Elvaris Technologies — Professional TradingView Indicators',
  description: 'Institutional-grade SMC signals, liquidity maps, and market structure algorithms designed for precision execution and risk management.',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-surface-container-lowest text-on-surface font-body-md antialiased min-h-screen flex flex-col">
        <ClerkProvider>
          <Providers>
            <Navbar />
            <main className="flex-grow pt-24">
              {children}
            </main>
            <Footer />
          </Providers>
        </ClerkProvider>
      </body>
    </html>
  );
}
