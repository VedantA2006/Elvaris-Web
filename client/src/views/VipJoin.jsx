'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import api from '../lib/api';
import Button from '../components/ui/Button';

const VipJoin = () => {
  const searchParams = useSearchParams();
  const tierSlug = searchParams?.get('tier') || 'institutional-vip-pass';
  const { user, isLoaded } = useUser();
  const router = useRouter();

  const [tier, setTier] = useState(null);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [countdown, setCountdown] = useState(15 * 60);

  useEffect(() => {
    if (isLoaded && !user) {
      router.push(`/sign-in?redirect_url=/vip-community/join?tier=${tierSlug}`);
      return;
    }

    if (tierSlug && user) {
      api.get('/vip/tiers')
        .then((res) => {
          if (res.data?.success && res.data?.data) {
            const found = res.data.data.find(t => t.slug === tierSlug) || res.data.data[0];
            if (found) {
              setTier(found);
            } else {
              setError('Requested VIP tier not found.');
            }
          }
        })
        .catch((err) => {
          setError('Failed to load VIP tier pricing options.');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [tierSlug, user, isLoaded, router]);

  // Polling effect when order exists
  useEffect(() => {
    let pollInterval;
    if (order && order.status === 'pending') {
      pollInterval = setInterval(() => {
        api.get(`/vip/orders/${order.orderId}`)
          .then((res) => {
            if (res.data?.success && res.data?.data) {
              setOrder(res.data.data);
              if (res.data.data.status === 'completed') {
                clearInterval(pollInterval);
                router.push('/vip-community/hub');
              }
            }
          })
          .catch(() => {});
      }, 10000);
    }
    return () => clearInterval(pollInterval);
  }, [order, router]);

  // Countdown timer
  useEffect(() => {
    let timer;
    if (order && order.status === 'pending') {
      timer = setInterval(() => {
        setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [order]);

  const handleGeneratePayment = async () => {
    if (!tier) return;
    setGenerating(true);
    setError(null);
    try {
      const res = await api.post('/vip/orders', {
        vipTierSlug: tier.slug
      });

      if (res.data?.success && res.data?.data?.invoiceUrl) {
        setOrder(res.data.data);
        window.location.href = res.data.data.invoiceUrl;
      } else {
        throw new Error('Failed to generate payment link.');
      }
    } catch (err) {
      setError(err.response?.data?.error?.message || err.message || 'Failed to generate payment invoice.');
    } finally {
      setGenerating(false);
    }
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  if (loading || !isLoaded) {
    return (
      <div className="w-full bg-[#F9F9F9] min-h-[70vh] flex items-center justify-center font-sans">
        <div className="w-10 h-10 border-4 border-[#000000] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error && !tier) {
    return (
      <div className="w-full bg-[#F9F9F9] min-h-[70vh] flex items-center justify-center font-sans px-6 md:px-[64px]">
        <div className="bg-[#FFFFFF] border border-[#C4C7C7] p-8 rounded-[8px] text-center max-w-lg shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
          <span className="material-symbols-outlined text-[48px] text-[#000000] mb-4 block">error</span>
          <h2 className="text-[24px] text-[#000000] mb-2 font-bold tracking-tight">VIP Checkout Error</h2>
          <p className="text-[16px] leading-[24px] text-[#444748]">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#F9F9F9] min-h-screen">
      <div className="w-full max-w-[1280px] mx-auto px-6 md:px-[64px] py-[120px] font-sans text-[#000000]">
        <div className="flex items-center justify-center gap-3 mb-12">
          <img src="/logo.png" alt="Elvaris Logo" className="w-10 h-10 object-contain" />
          <h1 className="font-display text-display text-[#000000] text-center tracking-tight leading-tight font-extrabold">VIP Institutional Checkout</h1>
        </div>

        {error && (
          <div className="bg-[#FFFFFF] border border-[#C4C7C7] text-[#000000] text-[14px] p-4 rounded-[8px] mb-8 text-center max-w-3xl mx-auto shadow-[0_4px_20px_rgba(0,0,0,0.05)] font-mono">
            {error}
          </div>
        )}

        {order && order.status === 'pending' && (
          <div className="bg-[#FFFFFF] border border-[#C4C7C7] text-[#000000] p-8 rounded-[8px] mb-12 text-center max-w-3xl mx-auto shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
            <div className="flex items-center justify-center gap-3 mb-4 font-mono">
              <span className="w-3 h-3 rounded-full bg-[#000000] animate-ping"></span>
              <span className="font-bold text-[14px] tracking-widest uppercase">Awaiting On-Chain Confirmation</span>
            </div>
            <p className="text-[#444748] text-[16px] leading-[24px] mb-6 font-normal">
              Invoice generated (#<span className="font-mono font-bold text-[#000000]">{order.orderId}</span>). We are actively checking the blockchain every 10 seconds.
            </p>
            <div className="text-[14px] text-[#000000] font-mono font-bold bg-[#F9F9F9] inline-block px-6 py-3 rounded-full border border-[#C4C7C7]">
              Time Remaining: {formatTime(countdown)}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 max-w-5xl mx-auto">
          {/* Left: Order Summary */}
          <div className="md:col-span-5 space-y-6">
            <div className="bg-[#FFFFFF] rounded-[8px] border border-[#C4C7C7] shadow-[0_4px_20px_rgba(0,0,0,0.05)] p-8">
              <h2 className="text-[22px] font-bold text-[#000000] mb-6 tracking-tight">VIP Pass Summary</h2>
              <div className="space-y-4 text-[15px]">
                <div className="flex justify-between items-center border-b border-[#C4C7C7] pb-4">
                  <span className="text-[#444748]">Access Tier</span>
                  <span className="font-bold text-[#000000] text-right">{tier?.name}</span>
                </div>
                <div className="flex justify-between items-center border-b border-[#C4C7C7] pb-4">
                  <span className="text-[#444748]">Billing Cycle</span>
                  <span className="font-bold text-[#000000] uppercase font-mono text-[13px]">{tier?.billingCycle === 'one_time' ? 'Lifetime' : tier?.billingCycle}</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-[#444748] font-medium">Total Due</span>
                  <span className="text-[24px] font-bold text-[#000000] font-mono tracking-tight">${tier?.entryFeeUsd?.toFixed(2)} USD</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Payment Steps */}
          <div className="md:col-span-7">
            <div className="bg-[#FFFFFF] rounded-[8px] border border-[#C4C7C7] shadow-[0_4px_20px_rgba(0,0,0,0.05)] p-8">
              <h3 className="text-[22px] font-bold text-[#000000] mb-4 tracking-tight">Proceed with Crypto Checkout</h3>
              <p className="text-[#444748] text-[16px] leading-[26px] mb-8 font-normal">
                You will be securely redirected to NOWPayments to select your preferred cryptocurrency (BTC, ETH, USDT, SOL, etc.) and network. Upon 1 block confirmation, your institutional hub access will be activated immediately.
              </p>
              <Button 
                variant="primary" 
                className="w-full py-4 text-[16px] font-bold" 
                onClick={handleGeneratePayment}
                disabled={generating || (order && order.status === 'pending')}
              >
                {generating ? 'Initiating Secure Invoice...' : order && order.status === 'pending' ? 'Invoice Active — Awaiting Payment' : (
                  <span>Pay <span className="font-mono">${tier?.entryFeeUsd}</span> with Crypto</span>
                )}
              </Button>
              {order && order.invoiceUrl && (
                <div className="mt-6 text-center">
                  <a 
                    href={order.invoiceUrl} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="text-[13px] text-[#000000] underline font-mono font-medium hover:opacity-70"
                  >
                    Click here if not redirected automatically →
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VipJoin;
