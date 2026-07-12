'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';
import GlassCard from '../components/ui/GlassCard.jsx';
import Button from '../components/ui/Button.jsx';

const AffiliateDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Registration Form State
  const [isNotRegistered, setIsNotRegistered] = useState(false);
  const [referralCodeInput, setReferralCodeInput] = useState('');
  const [regError, setRegError] = useState('');
  const [registering, setRegistering] = useState(false);

  // Link copy state
  const [copiedLink, setCopiedLink] = useState(false);

  // Withdrawal Request State
  const [payoutAddress, setPayoutAddress] = useState('');
  const [withdrawalSuccess, setWithdrawalSuccess] = useState('');
  const [submittingWithdrawal, setSubmittingWithdrawal] = useState(false);

  // Fetch stats on load
  const fetchAffiliateStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get('/api/affiliates/stats');
      if (res.data && res.data.success) {
        setStats(res.data.data);
        setIsNotRegistered(false);
      }
    } catch (err) {
      if (err.response?.status === 404) {
        setIsNotRegistered(true);
      } else {
        setError(err.response?.data?.error?.message || 'Failed to load affiliate statistics.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAffiliateStats();
  }, []);

  // Handle registration form submit
  const handleRegister = async (e) => {
    e.preventDefault();
    if (!referralCodeInput.trim()) return;

    try {
      setRegistering(true);
      setRegError('');
      const res = await axios.post('/api/affiliates/register', {
        referralCode: referralCodeInput
      });
      if (res.data && res.data.success) {
        // Success, fetch stats again to display dashboard
        fetchAffiliateStats();
      }
    } catch (err) {
      setRegError(err.response?.data?.error?.message || 'Affiliate registration failed.');
    } finally {
      setRegistering(false);
    }
  };

  // Copy referral link to clipboard
  const handleCopyLink = () => {
    if (!stats) return;
    const link = `${window.location.protocol}//${window.location.host}?ref=${stats.referralCode}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Submit mock withdrawal request
  const handleRequestPayout = (e) => {
    e.preventDefault();
    if (!payoutAddress.trim() || stats.pendingWithdrawal <= 0) return;

    setSubmittingWithdrawal(true);
    setWithdrawalSuccess('');
    
    // Simulate API delay
    setTimeout(() => {
      setWithdrawalSuccess(`Payout request for $${stats.pendingWithdrawal} submitted successfully! Your funds will arrive at your address in 24-48 hours.`);
      setPayoutAddress('');
      // Mock deduction locally
      setStats(prev => ({
        ...prev,
        totalWithdrawn: Number((prev.totalWithdrawn + prev.pendingWithdrawal).toFixed(2)),
        pendingWithdrawal: 0
      }));
      setSubmittingWithdrawal(false);
    }, 1500);
  };

  if (loading) {
    return (
      <div className="max-w-container-max mx-auto px-6 lg:px-12 py-20 text-center animate-pulse">
        <div className="h-96 bg-surface-container border border-outline-variant/60 rounded-2xl w-full" />
      </div>
    );
  }

  // 1. Show registration page if user is not yet an affiliate
  if (isNotRegistered) {
    return (
      <div className="font-body-md antialiased text-on-surface">
        {/* Hero Section */}
        <section className="bg-primary text-on-primary pt-32 pb-section-gap px-margin-mobile md:px-margin-desktop relative">
          <div className="max-w-container-max mx-auto grid md:grid-cols-2 gap-gutter items-center">
            <div className="space-y-stack-lg z-10">
              <h1 className="font-display text-display md:text-[80px] leading-tight tracking-tighter max-w-2xl">
                Elite Performance.<br />
                Premium Commissions.
              </h1>
              <p className="font-body-lg text-body-lg text-inverse-primary max-w-xl">
                Partner with Elvaris Technologies. Refer sophisticated traders to our institutional-grade systems and earn industry-leading, recurring revenue.
              </p>
              
              {/* Inline Registration Form replacing the basic buttons */}
              <div className="mt-8 bg-surface-container-lowest border border-outline-variant rounded-xl p-6 text-on-surface">
                <h3 className="font-headline-md text-xl mb-4 text-primary">Join the Program</h3>
                <form onSubmit={handleRegister} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-on-surface-variant uppercase tracking-wider font-bold">
                      Desired Referral Code
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. tradingpro"
                      value={referralCodeInput}
                      onChange={(e) => setReferralCodeInput(e.target.value.replace(/[^a-zA-Z0-9-_]/g, '').toLowerCase())}
                      className="bg-surface border border-outline-variant/80 focus:border-primary rounded-xl px-4 py-2.5 text-xs text-primary placeholder:text-on-surface-variant/50 outline-none transition-all font-bold tracking-widest uppercase"
                    />
                    <span className="text-[10px] text-on-surface-variant leading-relaxed mt-1">
                      Your link: <span className="text-primary font-bold">elvaris.com?ref={referralCodeInput || 'yourcode'}</span>
                    </span>
                  </div>
                  {regError && (
                    <span className="text-error text-xs font-semibold leading-relaxed">
                      ⚠️ {regError}
                    </span>
                  )}
                  <Button
                    variant="primary"
                    type="submit"
                    disabled={registering || !referralCodeInput}
                    className="py-3 font-bold mt-2"
                  >
                    {registering ? 'Creating Account...' : 'Create Affiliate Account'}
                  </Button>
                </form>
              </div>

            </div>
            <div className="relative h-[400px] md:h-[600px] hidden md:block">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary via-primary to-surface-tint opacity-30 rounded-xl overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent opacity-50 mix-blend-overlay"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-section-gap px-margin-mobile md:px-margin-desktop bg-surface">
          <div className="max-w-container-max mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
              <div className="bg-surface-container-lowest border border-outline-variant p-8 rounded-xl ambient-shadow hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-shadow">
                <span className="material-symbols-outlined text-4xl mb-4 text-primary">percent</span>
                <h3 className="font-headline-md text-headline-md mb-2">Commission Rate</h3>
                <p className="font-display text-display text-4xl mb-4 text-primary">30% <span className="text-body-md font-body-md text-secondary align-middle">Recurring</span></p>
                <p className="text-secondary font-body-md">Earn a continuous share of revenue for the lifetime of the referred client's active subscription.</p>
              </div>
              <div className="bg-surface-container-lowest border border-outline-variant p-8 rounded-xl ambient-shadow hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-shadow">
                <span className="material-symbols-outlined text-4xl mb-4 text-primary">schedule</span>
                <h3 className="font-headline-md text-headline-md mb-2">Cookie Duration</h3>
                <p className="font-display text-display text-4xl mb-4 text-primary">90 <span className="text-body-md font-body-md text-secondary align-middle">Days</span></p>
                <p className="text-secondary font-body-md">Extended tracking windows ensure you receive credit even if prospects take time to evaluate.</p>
              </div>
              <div className="bg-surface-container-lowest border border-outline-variant p-8 rounded-xl ambient-shadow hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-shadow">
                <span className="material-symbols-outlined text-4xl mb-4 text-primary">payments</span>
                <h3 className="font-headline-md text-headline-md mb-2">Payout Method</h3>
                <p className="font-display text-display text-4xl mb-4 text-primary">Crypto / Wire</p>
                <p className="text-secondary font-body-md">Flexible, high-speed settlements supporting major fiat currencies and institutional digital assets.</p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-section-gap px-margin-mobile md:px-margin-desktop bg-surface-bright" id="how-it-works">
          <div className="max-w-container-max mx-auto text-center">
            <h2 className="font-headline-lg text-headline-lg mb-16 text-primary">The Path to Partnership</h2>
            <div className="flex flex-col md:flex-row justify-center items-center gap-12 relative">
              {/* Connector Line (Desktop) */}
              <div className="hidden md:block absolute top-1/2 left-[15%] right-[15%] h-px bg-outline-variant -translate-y-1/2 z-0"></div>
              {/* Step 1 */}
              <div className="relative z-10 flex flex-col items-center bg-surface-bright px-4">
                <div className="w-16 h-16 rounded-full bg-primary text-on-primary flex items-center justify-center font-headline-md text-headline-md mb-6 shadow-md">1</div>
                <h4 className="font-headline-md text-xl mb-2 text-primary">Sign Up</h4>
                <p className="text-secondary font-body-md max-w-[200px]">Complete the institutional onboarding application.</p>
              </div>
              {/* Step 2 */}
              <div className="relative z-10 flex flex-col items-center bg-surface-bright px-4">
                <div className="w-16 h-16 rounded-full bg-primary text-on-primary flex items-center justify-center font-headline-md text-headline-md mb-6 shadow-md">2</div>
                <h4 className="font-headline-md text-xl mb-2 text-primary">Share Your Link</h4>
                <p className="text-secondary font-body-md max-w-[200px]">Distribute your unique tracking identifier to your network.</p>
              </div>
              {/* Step 3 */}
              <div className="relative z-10 flex flex-col items-center bg-surface-bright px-4">
                <div className="w-16 h-16 rounded-full bg-primary text-on-primary flex items-center justify-center font-headline-md text-headline-md mb-6 shadow-md">3</div>
                <h4 className="font-headline-md text-xl mb-2 text-primary">Earn Commission</h4>
                <p className="text-secondary font-body-md max-w-[200px]">Receive automated payouts on verified subscriptions.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Leaderboard Section */}
        <section className="py-section-gap px-margin-mobile md:px-margin-desktop bg-surface">
          <div className="max-w-container-max mx-auto">
            <h2 className="font-headline-lg text-headline-lg mb-8 text-primary">Top Performing Affiliates</h2>
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden ambient-shadow">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low border-b border-outline-variant">
                    <th className="py-4 px-6 font-label-sm text-secondary">Rank</th>
                    <th className="py-4 px-6 font-label-sm text-secondary">Partner</th>
                    <th className="py-4 px-6 font-label-sm text-secondary text-right">Active Referrals</th>
                    <th className="py-4 px-6 font-label-sm text-secondary text-right">Est. 30D Earnings</th>
                  </tr>
                </thead>
                <tbody className="font-stats-tabular text-stats-tabular">
                  {/* Top Spot */}
                  <tr className="border-b border-outline-variant bg-surface-bright relative group hover:bg-surface-container-lowest transition-colors">
                    <td className="absolute inset-y-0 left-0 w-1.5 bg-primary"></td>
                    <td className="py-5 px-6 font-bold flex items-center gap-2 text-primary">
                      <span className="material-symbols-outlined text-primary text-xl">trophy</span> 1
                    </td>
                    <td className="py-5 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center font-bold text-xs text-primary">AQ</div>
                        <span className="text-primary">AlphaQuant Group</span>
                      </div>
                    </td>
                    <td className="py-5 px-6 text-right text-primary">1,492</td>
                    <td className="py-5 px-6 text-right font-bold text-primary">$142,850.00</td>
                  </tr>
                  <tr className="border-b border-outline-variant hover:bg-surface-container-lowest transition-colors">
                    <td className="py-4 px-6 text-secondary">2</td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center font-bold text-xs text-secondary">VZ</div>
                        <span className="text-primary">Velocity Zero</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right text-primary">985</td>
                    <td className="py-4 px-6 text-right text-primary">$88,400.00</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="max-w-md mx-auto px-6 py-20 text-center">
        <GlassCard className="border-error/40 flex flex-col items-center gap-4 py-12 shadow-elevated">
          <span className="text-error text-2xl font-bold">Error</span>
          <p className="text-on-surface-variant text-sm">{error || 'Could not retrieve affiliate data.'}</p>
          <Button variant="outline" onClick={fetchAffiliateStats}>Try Again</Button>
        </GlassCard>
      </div>
    );
  }

  // 2. Show Affiliate Dashboard stats
  return (
    <div className="max-w-container-max mx-auto px-6 lg:px-12 py-8 flex flex-col gap-8 text-left">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-outline-variant/60 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary font-stats">
            <span className="material-symbols-outlined text-sm">partner_exchange</span>
            <span>Institutional Partner Portal</span>
          </div>
          <h1 className="text-3xl font-black text-primary tracking-tight mt-1">Affiliate Partner Dashboard</h1>
          <p className="text-on-surface-variant text-xs mt-1 font-stats">
            Tracking code: <span className="font-bold text-primary uppercase">@{stats.referralCode}</span> &bull; Commission Rate: <strong className="text-primary">{stats.commissionRate}%</strong>
          </p>
        </div>
        <Button variant="outline" className="px-5 py-2.5 text-xs font-bold" onClick={handleCopyLink}>
          {copiedLink ? 'Copied Link!' : 'Copy Partner Link'}
        </Button>
      </div>

      {/* Grid of Key Stats Card */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <GlassCard className="border-outline-variant/60 p-6 flex flex-col justify-between gap-3 ambient-shadow" hoverEffect={false}>
          <span className="text-[10px] text-on-surface-variant uppercase tracking-wider font-bold font-stats">Click Throughs</span>
          <span className="text-3xl font-black text-primary font-stats">{stats.clicks}</span>
        </GlassCard>

        <GlassCard className="border-outline-variant/60 p-6 flex flex-col justify-between gap-3 ambient-shadow" hoverEffect={false}>
          <span className="text-[10px] text-on-surface-variant uppercase tracking-wider font-bold font-stats">Referred Sales</span>
          <span className="text-3xl font-black text-primary font-stats">{stats.sales}</span>
        </GlassCard>

        <GlassCard className="border-outline-variant/60 p-6 flex flex-col justify-between gap-3 ambient-shadow" hoverEffect={false}>
          <span className="text-[10px] text-on-surface-variant uppercase tracking-wider font-bold font-stats">Conversion Rate</span>
          <span className="text-3xl font-black text-primary font-stats-tabular">{stats.conversionRate}%</span>
        </GlassCard>

        <GlassCard className="border-outline-variant/60 p-6 flex flex-col justify-between gap-3 ambient-shadow" hoverEffect={false} glowColor="purple">
          <span className="text-[10px] text-on-surface-variant uppercase tracking-wider font-bold font-stats">Total Earnings</span>
          <span className="text-3xl font-black text-primary font-stats">${stats.earnings.toFixed(2)}</span>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Columns - Referred Sales History */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <GlassCard className="border-outline-variant/60 p-6 flex flex-col gap-4 ambient-shadow" hoverEffect={false}>
            <h3 className="text-base font-black text-primary pb-2 border-b border-outline-variant/40">Recent Commission Conversions</h3>
            
            {stats.recentOrders && stats.recentOrders.length > 0 ? (
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left text-xs border-collapse font-stats">
                  <thead>
                    <tr className="text-on-surface-variant border-b border-outline-variant/80 pb-2 uppercase text-[10px]">
                      <th className="pb-3 font-bold tracking-wider">Indicator</th>
                      <th className="pb-3 font-bold tracking-wider">Sale Amount</th>
                      <th className="pb-3 font-bold tracking-wider">Commission</th>
                      <th className="pb-3 font-bold tracking-wider">Status</th>
                      <th className="pb-3 font-bold tracking-wider">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/30 font-medium">
                    {stats.recentOrders.map(order => (
                      <tr key={order.id} className="hover:bg-surface/50 transition-colors">
                        <td className="py-3.5 font-bold text-primary">{order.indicatorName}</td>
                        <td className="py-3.5">${order.finalPrice.toFixed(2)}</td>
                        <td className="py-3.5 text-primary font-black">+${order.commissionEarned.toFixed(2)}</td>
                        <td className="py-3.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            order.status === 'completed' 
                              ? 'bg-primary/10 text-primary border border-primary/20' 
                              : 'bg-surface border border-outline-variant text-on-surface-variant'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="py-3.5 text-on-surface-variant">{new Date(order.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-10 text-on-surface-variant text-xs">
                No referrals logged yet. Generate your link and share it on socials to begin earning commissions.
              </div>
            )}
          </GlassCard>
        </div>

        {/* Right Column - Withdrawal Portal */}
        <div className="flex flex-col gap-6">
          <GlassCard className="border-outline-variant p-6 flex flex-col gap-5 ambient-shadow" hoverEffect={false}>
            <div>
              <h3 className="text-base font-black text-primary pb-2 border-b border-outline-variant/40">Payout Withdrawals</h3>
              <p className="text-[11px] text-on-surface-variant mt-2 leading-relaxed">
                Claim verified commissions and transfer them directly to your personal Bitcoin or TRC-20 USDT wallet.
              </p>
            </div>

            <div className="flex flex-col gap-3.5 border-t border-outline-variant/40 pt-4 text-xs font-stats">
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Withdrawn to date:</span>
                <span className="text-primary font-bold">${stats.totalWithdrawn.toFixed(2)} USD</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Available Balance:</span>
                <span className="text-primary font-black">${stats.pendingWithdrawal.toFixed(2)} USD</span>
              </div>
            </div>

            {stats.pendingWithdrawal > 0 ? (
              <form onSubmit={handleRequestPayout} className="flex flex-col gap-4 border-t border-outline-variant/40 pt-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-on-surface-variant uppercase tracking-wider font-bold font-stats">
                    Payout Address (USDT TRC20 / BTC)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter wallet address"
                    value={payoutAddress}
                    onChange={(e) => setPayoutAddress(e.target.value)}
                    className="bg-surface border border-outline-variant/80 focus:border-primary rounded-xl px-3.5 py-2.5 text-xs text-primary placeholder:text-on-surface-variant/50 outline-none transition-all font-stats"
                  />
                </div>

                <Button
                  variant="primary"
                  type="submit"
                  disabled={submittingWithdrawal || !payoutAddress}
                  className="py-3 text-xs font-black"
                >
                  {submittingWithdrawal ? 'Requesting...' : 'Request Payout Commission'}
                </Button>
              </form>
            ) : (
              <div className="bg-surface border border-outline-variant/60 p-3 rounded-xl text-[11px] text-on-surface-variant leading-relaxed text-center font-semibold">
                Payout claims are locked. You must earn commissions on referred conversions to unlock payouts.
              </div>
            )}

            {withdrawalSuccess && (
              <div className="bg-primary/10 border border-primary/20 p-3.5 rounded-xl text-xs text-primary leading-relaxed font-bold font-stats">
                ✓ {withdrawalSuccess}
              </div>
            )}
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default AffiliateDashboard;
