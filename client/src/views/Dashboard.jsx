'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useClerk } from '@clerk/nextjs';
import api from '../lib/api';
import Link from 'next/link';
import Button from '../components/ui/Button';

const Dashboard = () => {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();

  const [tvUsername, setTvUsername] = useState('');
  const [linking, setLinking] = useState(false);
  const [linkMsg, setLinkMsg] = useState({ type: '', text: '' });
  
  const [access, setAccess] = useState([]);
  const [fetchingAccess, setFetchingAccess] = useState(true);

  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/');
    }
  }, [user, isLoaded, router]);

  useEffect(() => {
    if (user) {
      // Fetch user's active indicators
      api.get('/tradingview/status')
        .then(res => {
          if (res.data.success) {
            setAccess(res.data.data.access || []);
          }
        })
        .finally(() => {
          setFetchingAccess(false);
        });
    }
  }, [user]);

  const handleLinkTradingView = async (e) => {
    e.preventDefault();
    setLinking(true);
    setLinkMsg({ type: '', text: '' });

    try {
      const res = await api.post('/tradingview/link', { username: tvUsername });
      if (res.data.success) {
        setLinkMsg({ type: 'success', text: 'TradingView account linked successfully! Invite will be sent shortly.' });
      }
    } catch (error) {
      setLinkMsg({ type: 'error', text: error.response?.data?.error?.message || 'Failed to link account' });
    } finally {
      setLinking(false);
    }
  };

  if (!isLoaded || !user) {
    return (
      <div className="w-full h-[60vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-section-gap font-display">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-headline-lg font-bold text-primary">Dashboard</h1>
          <p className="text-on-surface-variant mt-1">Welcome back, {user.fullName || 'Trader'}</p>
        </div>
        <Button variant="outline" onClick={() => signOut()} className="border-error text-error hover:bg-error-container/10">
          Logout
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Subscriptions */}
        <div className="lg:col-span-8 space-y-8">
          <div className="bg-surface-container-lowest rounded-xl p-8 border border-surface-variant ambient-shadow">
            <h2 className="text-headline-sm font-bold text-primary mb-6">Active Indicators</h2>
            
            {fetchingAccess ? (
              <div className="animate-pulse flex space-x-4">
                <div className="flex-1 space-y-4 py-1">
                  <div className="h-4 bg-surface-variant rounded w-3/4"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-surface-variant rounded"></div>
                    <div className="h-4 bg-surface-variant rounded w-5/6"></div>
                  </div>
                </div>
              </div>
            ) : access.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {access.map((item, index) => (
                  <div key={index} className="border border-primary/30 rounded-lg p-5 bg-surface-container-low">
                    <h3 className="font-bold text-primary text-lg">{item.indicator?.name || 'Indicator'}</h3>
                    <p className="text-sm text-on-surface-variant mt-1">Status: <span className="text-[#14b8a6] capitalize">{item.status}</span></p>
                    <p className="text-sm text-on-surface-variant">Expires: {new Date(item.expiresAt).toLocaleDateString()}</p>
                    {item.tradingViewUsername && (
                      <p className="text-sm mt-2 text-primary">Linked to: {item.tradingViewUsername}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 border border-dashed border-outline-variant rounded-lg bg-surface-container-low">
                <span className="material-symbols-outlined text-[48px] text-on-surface-variant mb-4">insights</span>
                <h3 className="font-bold text-on-surface mb-2">No Active Subscriptions</h3>
                <p className="text-on-surface-variant text-sm mb-6 max-w-md mx-auto">
                  You don't have any active Elvaris indicators. Browse our catalog to find the right toolkit for your trading style.
                </p>
                <Link href="/indicators">
                  <Button variant="primary">Browse Indicators</Button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Settings & Link TV */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-surface-container-lowest rounded-xl p-6 border border-surface-variant ambient-shadow">
            <h2 className="text-headline-sm font-bold text-primary mb-2">TradingView Connection</h2>
            <p className="text-sm text-on-surface-variant mb-6">Link your TradingView username to receive invite-only script access.</p>
            
            {linkMsg.text && (
              <div className={`p-3 rounded-lg text-sm mb-4 ${linkMsg.type === 'error' ? 'bg-error-container/20 text-error border border-error' : 'bg-[#14b8a6]/20 text-[#14b8a6] border border-[#14b8a6]'}`}>
                {linkMsg.text}
              </div>
            )}

            <form onSubmit={handleLinkTradingView} className="space-y-4">
              <div>
                <label className="block text-sm text-on-surface mb-2">TradingView Username</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SatoshiNakamoto"
                  className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-3 text-on-surface focus:border-primary focus:outline-none transition-colors"
                  value={tvUsername}
                  onChange={(e) => setTvUsername(e.target.value)}
                />
              </div>
              <Button type="submit" variant="primary" className="w-full" disabled={linking}>
                {linking ? 'Linking...' : 'Link Account'}
              </Button>
            </form>
          </div>

          <div className="bg-surface-container-lowest rounded-xl p-6 border border-surface-variant ambient-shadow">
             <h2 className="text-headline-sm font-bold text-primary mb-2">Account Details</h2>
             <div className="space-y-3 mt-4">
                <div className="flex justify-between border-b border-surface-variant pb-2">
                  <span className="text-on-surface-variant text-sm">Email</span>
                  <span className="text-on-surface text-sm">{user.primaryEmailAddress?.emailAddress}</span>
                </div>
                <div className="flex justify-between border-b border-surface-variant pb-2">
                  <span className="text-on-surface-variant text-sm">Role</span>
                  <span className="text-primary text-sm capitalize">{user.publicMetadata?.role || 'Customer'}</span>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
