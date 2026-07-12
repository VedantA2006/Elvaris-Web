'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import api from '../lib/api';
import { useUser } from '@clerk/nextjs';
import Button from '../components/ui/Button';

// Coin grid removed as NOWPayments hosted checkout handles it

const Checkout = () => {
  const { id: slug } = useParams();
  const searchParams = useSearchParams();
  const planType = searchParams.get('plan') || 'monthly';
  const { user, isLoaded } = useUser();
  const router = useRouter();

  const [indicator, setIndicator] = useState(null);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [countdown, setCountdown] = useState(15 * 60);

  // 1. Fetch indicator details first
  useEffect(() => {
    if (isLoaded && !user) {
      router.push(`/sign-in?redirect_url=/checkout/${slug}?plan=${planType}`);
      return;
    }

    if (slug && user) {
      api.get(`/indicators/${slug}`)
        .then((res) => {
          if (res.data && res.data.data) {
            setIndicator(res.data.data);
          } else {
            setError('Indicator not found.');
          }
        })
        .catch((err) => {
          setError('Failed to load indicator details.');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [slug, user, isLoaded, router, planType]);

  // Polling effect when order exists
  useEffect(() => {
    let pollInterval;
    if (order && order.status === 'pending') {
      pollInterval = setInterval(() => {
        api.get(`/orders/${order.orderId}`)
          .then((res) => {
            if (res.data.success && res.data.data) {
              setOrder(res.data.data);
              if (res.data.data.status === 'completed') {
                clearInterval(pollInterval);
              }
            }
          })
          .catch(() => {});
      }, 10000);
    }
    return () => clearInterval(pollInterval);
  }, [order]);

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
    setGenerating(true);
    setError(null);
    try {
      const res = await api.post('/orders', {
        indicatorId: indicator._id,
        planType: planType
      });

      if (res.data.success && res.data.data.invoiceUrl) {
        window.location.href = res.data.data.invoiceUrl;
      }
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to generate payment invoice.');
    } finally {
      setGenerating(false);
    }
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const copyAddress = () => {
    if (order?.address) {
      navigator.clipboard.writeText(order.address);
    }
  };

  const getPrice = () => {
    if (!indicator) return 0;
    const plan = indicator.pricing.find(p => p.planType.toLowerCase() === planType.toLowerCase());
    return plan ? plan.price : indicator.price;
  };

  if (loading || !isLoaded) {
    return (
      <div className="w-full h-[60vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error && !indicator) {
    return (
      <div className="w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-stack-lg flex flex-col items-center justify-center h-[60vh]">
        <div className="bg-surface-container-low border border-error p-stack-lg rounded-xl text-center max-w-lg">
          <span className="material-symbols-outlined text-[48px] text-error mb-stack-sm">error</span>
          <h2 className="font-headline-md text-error mb-stack-sm">Checkout Error</h2>
          <p className="font-body-md text-on-surface-variant">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-section-gap font-display">
      <h1 className="text-headline-lg font-bold text-primary mb-8 text-center">Secure Checkout</h1>

      {error && (
        <div className="bg-error-container/20 border border-error text-error text-sm p-4 rounded-lg mb-8 text-center max-w-3xl mx-auto">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-8 max-w-5xl mx-auto">
        {/* Left: Order Summary */}
        <div className="md:col-span-4 space-y-6">
          <div className="bg-surface-container-lowest rounded-xl border border-surface-variant ambient-shadow p-6">
            <h2 className="text-headline-sm font-bold text-primary mb-6">Order Summary</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-surface-variant pb-4">
                <span className="text-on-surface-variant">Indicator</span>
                <span className="font-bold text-primary">{indicator.name}</span>
              </div>
              <div className="flex justify-between items-center border-b border-surface-variant pb-4">
                <span className="text-on-surface-variant">Billing Cycle</span>
                <span className="font-bold text-primary capitalize">{planType}</span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-on-surface-variant">Total Due</span>
                <span className="text-headline-md font-bold text-primary">${getPrice().toFixed(2)} USD</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Payment Steps */}
        <div className="md:col-span-8">
            <div className="bg-surface-container-lowest rounded-xl border border-surface-variant ambient-shadow p-8">
              <h3 className="text-headline-sm font-bold text-primary mb-6">Proceed to Payment</h3>
              <p className="text-on-surface-variant mb-6">
                You will be securely redirected to NOWPayments to select your preferred cryptocurrency and network.
              </p>
              <Button 
                variant="primary" 
                className="w-full py-4 text-lg font-bold" 
                onClick={handleGeneratePayment}
                disabled={generating}
              >
                {generating ? 'Preparing Secure Checkout...' : 'Pay with Crypto'}
              </Button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
