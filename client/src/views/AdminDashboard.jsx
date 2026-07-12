'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';

const AdminDashboard = () => {
  // Navigation Tabs mapped to the new layout
  const [activeTab, setActiveTab] = useState('Overview');
  const [cmsSubTab, setCmsSubTab] = useState('Indicators');

  // Stats & States
  const [stats, setStats] = useState(null);
  const [tvQueue, setTvQueue] = useState([]);
  const [payoutQueue, setPayoutQueue] = useState([]);
  
  // CMS Lists
  const [indicators, setIndicators] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [users, setUsers] = useState([]);
  const [vipMembers, setVipMembers] = useState([]);
  const [vipTiersList, setVipTiersList] = useState([]);
  const [vipModalOpen, setVipModalOpen] = useState(false);
  const [vipFormData, setVipFormData] = useState({ userEmail: '', vipTierId: '', status: 'active' });

  // VIP Community Sub-tabs & Management state
  const [vipSubTab, setVipSubTab] = useState('Members'); // 'Members', 'Posts', 'Broadcast Email'
  const [vipPostSearch, setVipPostSearch] = useState('');
  const [vipPosts, setVipPosts] = useState([
    {
      _id: 'post_1',
      symbol: 'XAUUSD',
      title: 'Gold Macro Support Zone Rejection',
      content: 'Algorithmic execution scanner has registered a high-timeframe buy-side liquidity purge on XAU/USD at $2412.80. Immediate mitigation target sits at the 15-minute bullish FVG ($2404.20 - $2406.50). Institutional orderflow delta: +420 lots.',
      author: 'A. Mercer',
      createdAt: '2023-10-24 14:30',
      pinned: true,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDXUaGWwGYIGQlgU2HYHDQfucRn4pRRDjtDXRk5MiFQrcA4u7HLoj9ChbOoyDJ4LTB4AP7M7_AitbafKol_03u6aWp9LDGl9-LNHt2BakB-4viqYCsu-_rCK1dSuvnoamnrXWyY8zsn_MaoRrbCX1tugl-_EwIUJHIKwl8I5xrrI2_ItVGS3P9cUDMWr3BJVRlvq-utOQKh-oOLSvh5EvXph0NKPknwXMGf1bs44ec3SiGVkEst4OkUm_ztZK7oe1PwNVRIDEcGeWk'
    },
    {
      _id: 'post_2',
      symbol: 'BTCUSD',
      title: 'Weekly Close Analysis & Key Levels',
      content: 'Full Pine Script code drop for the dynamic volatility regime filter has been committed to the member repository below. Ensure your local SMC models have useVolatilityScaling = true activated prior to the London cash open.',
      author: 'T. Vance',
      createdAt: '2023-10-23 09:15',
      pinned: false,
      image: null
    },
    {
      _id: 'post_3',
      symbol: 'EURUSD',
      title: 'ECB Rate Decision Setup',
      content: 'Automated structure verification: 4H closing candle confirmed break of structure (BOS) above 1.0885. Algorithmic bias shifted from Neutral to Accumulation.',
      author: 'A. Mercer',
      createdAt: '2023-10-22 16:45',
      pinned: false,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCxGQnhYDrkYPuik2kulj0egBHRzFj3MU3GGeRwEu1e19RXVkbuMEzorC1OGXCiGkJReMqcjjj63jipzN5MDB3IQ9nfuZl_84164GP5idIHWc2EbFoBiLCVZ7VDwskf_YkVzI5xYMeHh4C811veSH8QeeJAoOEu2s44DL2vJiB9JXryb9gEqD9XHqtOw2z2RkL9ovXnn1qJG2yJtYZ1lqvZs39GpTnb5aWnLTkalt4CoIl91G4YsGKwSI5EczKONIQrgoyqvf_YxT4'
    }
  ]);
  const [vipPostForm, setVipPostForm] = useState({ symbol: '', title: '', content: '', pinned: false });

  const [vipBroadcasts, setVipBroadcasts] = useState([
    { _id: 'bc_1', subject: 'Q3 Earnings Call Prep Materials', sentAt: '2023-10-12 14:30', recipients: 214, failed: 0 },
    { _id: 'bc_2', subject: 'Platform Maintenance Notice', sentAt: '2023-09-28 09:15', recipients: 212, failed: 2 },
    { _id: 'bc_3', subject: 'New Indicator Launch: Momentum RSI Overlay', sentAt: '2023-09-15 11:00', recipients: 208, failed: 0 },
    { _id: 'bc_4', subject: 'Weekly Market Briefing - Volatility Alert', sentAt: '2023-09-08 16:45', recipients: 205, failed: 1 },
  ]);
  const [vipBroadcastForm, setVipBroadcastForm] = useState({ subject: '', message: '' });


  // Loaders & Errors
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal / Form state
  const [payoutModalOpen, setPayoutModalOpen] = useState(false);
  const [selectedPayout, setSelectedPayout] = useState(null);
  const [payoutTxHash, setPayoutTxHash] = useState('');

  // Indicator Editor Modal state
  const [indicatorModalOpen, setIndicatorModalOpen] = useState(false);
  const [editingIndicator, setEditingIndicator] = useState(null);
  const [indSubmitting, setIndSubmitting] = useState(false);
  const [indModalTab, setIndModalTab] = useState('General'); // 'General', 'Pricing', 'Script & Media'
  const [indFormData, setIndFormData] = useState({
    name: '',
    slug: '',
    shortDescription: '',
    description: '',
    category: ['Gold Strategies'],
    tradingStyle: ['Scalping'],
    price: 49,
    pricing: [
      { planType: 'monthly', price: 49, currency: 'USD' },
      { planType: 'quarterly', price: 129, currency: 'USD' },
      { planType: 'yearly', price: 399, currency: 'USD' },
      { planType: 'lifetime', price: 899, currency: 'USD' },
    ],
    bannerImage: '',
    gallery: [],
    videos: [],
    features: ['Non-Repainting Logic', 'Multi-Timeframe Support', 'Real-time Alerts'],
    scriptFile: '',
    scriptType: 'pine',
    isActive: true,
  });

  // 1. Fetch administrative statistics and lists
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const statsRes = await axios.get('/api/admin/stats').catch(() => null);
      if (statsRes?.data?.success) setStats(statsRes.data.data);

      const tvRes = await axios.get('/api/tradingview/admin/queue').catch(() => null);
      if (tvRes?.data?.success) setTvQueue(tvRes.data.data);

      const payoutRes = await axios.get('/api/affiliates/admin/payouts').catch(() => null);
      if (payoutRes?.data?.success) setPayoutQueue(payoutRes.data.data);

      const indRes = await axios.get('/api/indicators').catch(() => null);
      if (indRes?.data?.success) setIndicators(indRes.data.data);

      const faqRes = await axios.get('/api/faq').catch(() => null);
      if (faqRes?.data?.success) setFaqs(faqRes.data.data);

      const blogRes = await axios.get('/api/blog').catch(() => null);
      if (blogRes?.data?.success) setBlogs(blogRes.data.data);

      const userRes = await axios.get('/api/admin/users').catch(() => null);
      if (userRes?.data?.success) setUsers(userRes.data.data);

      const vipRes = await axios.get('/api/admin/vip/members').catch(() => null);
      if (vipRes?.data?.success) {
        setVipMembers(vipRes.data.data?.members || []);
        setVipTiersList(vipRes.data.data?.tiers || []);
      }

    } catch (err) {
      // Ignore errors for now to allow layout to render with mock data if backend is down
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Actions
  const handleUpdateTvStatus = async (accessId, status) => {
    alert(`Updating status for ${accessId} to ${status}`);
  };

  const handleProcessPayout = async (e) => {
    e.preventDefault();
    alert(`Processing payout for ${selectedPayout?.id} with txHash ${payoutTxHash}`);
    setPayoutModalOpen(false);
  };

  const handleOpenIndicatorModal = (ind = null) => {
    if (ind) {
      setEditingIndicator(ind);
      setIndFormData({
        name: ind.name || '',
        slug: ind.slug || '',
        shortDescription: ind.shortDescription || '',
        description: ind.description || '',
        category: ind.category?.length ? ind.category : ['Gold Strategies'],
        tradingStyle: ind.tradingStyle?.length ? ind.tradingStyle : ['Scalping'],
        price: ind.price ?? (ind.pricing?.[0]?.price ?? 49),
        pricing: ind.pricing?.length ? ind.pricing : [
          { planType: 'monthly', price: ind.price || 49, currency: 'USD' },
          { planType: 'quarterly', price: Math.round((ind.price || 49) * 2.5), currency: 'USD' },
          { planType: 'yearly', price: Math.round((ind.price || 49) * 8), currency: 'USD' },
          { planType: 'lifetime', price: Math.round((ind.price || 49) * 15), currency: 'USD' },
        ],
        bannerImage: ind.bannerImage || '',
        gallery: ind.gallery || [],
        videos: ind.videos || [],
        features: ind.features?.length ? ind.features : ['Non-Repainting Logic', 'Multi-Timeframe Support', 'Real-time Alerts'],
        scriptFile: ind.scriptFile || '',
        scriptType: ind.scriptType || 'pine',
        isActive: ind.isActive !== undefined ? ind.isActive : true,
      });
    } else {
      setEditingIndicator(null);
      setIndFormData({
        name: '',
        slug: '',
        shortDescription: '',
        description: '',
        category: ['Gold Strategies'],
        tradingStyle: ['Scalping'],
        price: 49,
        pricing: [
          { planType: 'monthly', price: 49, currency: 'USD' },
          { planType: 'quarterly', price: 129, currency: 'USD' },
          { planType: 'yearly', price: 399, currency: 'USD' },
          { planType: 'lifetime', price: 899, currency: 'USD' },
        ],
        bannerImage: '',
        gallery: [],
        videos: [],
        features: ['Non-Repainting Logic', 'Multi-Timeframe Support', 'Real-time Alerts'],
        scriptFile: '',
        scriptType: 'pine',
        isActive: true,
      });
    }
    setIndModalTab('General');
    setIndicatorModalOpen(true);
  };

  const handleSaveIndicator = async (e) => {
    e.preventDefault();
    try {
      setIndSubmitting(true);
      const payload = {
        ...indFormData,
        price: Number(indFormData.price),
        pricing: indFormData.pricing.map(p => ({ ...p, price: Number(p.price) }))
      };

      if (editingIndicator && editingIndicator._id) {
        const res = await axios.put(`/api/indicators/${editingIndicator._id}`, payload).catch(() => null);
        if (res?.data?.success) {
          setIndicators(prev => prev.map(item => item._id === editingIndicator._id ? res.data.data : item));
        } else {
          setIndicators(prev => prev.map(item => item._id === editingIndicator._id ? { ...editingIndicator, ...payload } : item));
        }
      } else {
        const res = await axios.post('/api/indicators', payload).catch(() => null);
        if (res?.data?.success) {
          setIndicators(prev => [res.data.data, ...prev]);
        } else {
          setIndicators(prev => [{ _id: 'ind_' + Date.now(), ...payload }, ...prev]);
        }
      }
      setIndicatorModalOpen(false);
    } catch (err) {
      alert('Error saving indicator: ' + (err.response?.data?.error?.message || err.message));
      if (editingIndicator && editingIndicator._id) {
        setIndicators(prev => prev.map(item => item._id === editingIndicator._id ? { ...editingIndicator, ...indFormData } : item));
      } else {
        setIndicators(prev => [{ _id: 'ind_' + Date.now(), ...indFormData }, ...prev]);
      }
      setIndicatorModalOpen(false);
    } finally {
      setIndSubmitting(false);
    }
  };

  const handleGrantVipMembership = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/admin/vip/members', vipFormData);
      if (res.data?.success && res.data?.data) {
        setVipMembers(prev => [res.data.data, ...prev.filter(m => m._id !== res.data.data._id)]);
        setVipModalOpen(false);
        setVipFormData({ userEmail: '', vipTierId: vipTiersList[0]?._id || '', status: 'active' });
      }
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Failed to grant VIP membership.');
    }
  };

  const handleUpdateVipStatus = async (id, status) => {
    try {
      const res = await axios.patch(`/api/admin/vip/members/${id}`, { status });
      if (res.data?.success && res.data?.data) {
        setVipMembers(prev => prev.map(m => m._id === id ? { ...m, status } : m));
      }
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Failed to update status.');
    }
  };

  const handleDeleteIndicator = async (indId) => {
    if (!confirm('Are you sure you want to delete this indicator?')) return;
    try {
      await axios.delete(`/api/indicators/${indId}`).catch(() => null);
      setIndicators(prev => prev.filter(item => item._id !== indId));
      if (editingIndicator?._id === indId) setIndicatorModalOpen(false);
    } catch (err) {
      setIndicators(prev => prev.filter(item => item._id !== indId));
      if (editingIndicator?._id === indId) setIndicatorModalOpen(false);
    }
  };

  const handleAddVipPost = async (e) => {
    e.preventDefault();
    if (!vipPostForm.symbol || !vipPostForm.title || !vipPostForm.content) {
      alert('Please fill in Symbol, Title, and Trade Details.');
      return;
    }
    const newPost = {
      _id: 'post_' + Date.now(),
      symbol: vipPostForm.symbol.toUpperCase(),
      title: vipPostForm.title,
      content: vipPostForm.content,
      author: 'A. Mercer',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      pinned: vipPostForm.pinned,
      image: null
    };
    try {
      await axios.post('/api/admin/vip/posts', newPost).catch(() => null);
    } catch (err) {}
    setVipPosts(prev => [newPost, ...prev]);
    setVipPostForm({ symbol: '', title: '', content: '', pinned: false });
  };

  const handleDeleteVipPost = async (postId) => {
    if (!confirm('Are you sure you want to delete this community post?')) return;
    try {
      await axios.delete(`/api/admin/vip/posts/${postId}`).catch(() => null);
    } catch (err) {}
    setVipPosts(prev => prev.filter(p => p._id !== postId));
  };

  const handleTogglePinVipPost = async (postId) => {
    setVipPosts(prev => prev.map(p => p._id === postId ? { ...p, pinned: !p.pinned } : p));
  };

  const handleSendVipBroadcast = async (e) => {
    e.preventDefault();
    if (!vipBroadcastForm.subject || !vipBroadcastForm.message) {
      alert('Please fill in both Subject Line and Message Body.');
      return;
    }
    const newBroadcast = {
      _id: 'bc_' + Date.now(),
      subject: vipBroadcastForm.subject,
      sentAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      recipients: vipMembers.length || 214,
      failed: 0
    };
    try {
      await axios.post('/api/admin/vip/broadcast', vipBroadcastForm).catch(() => null);
    } catch (err) {}
    setVipBroadcasts(prev => [newBroadcast, ...prev]);
    setVipBroadcastForm({ subject: '', message: '' });
    alert('Broadcast dispatched to VIP community members.');
  };

  // Nav Items
  const navItems = [
    { id: 'Overview', icon: 'dashboard', label: 'Dashboard' },
    { id: 'Analytics', icon: 'monitoring', label: 'Analytics' },
    { id: 'Payments', icon: 'account_balance_wallet', label: 'Global Payments' },
    { id: 'TV Queue', icon: 'query_stats', label: 'Access Queue' },
    { id: 'Clients', icon: 'group', label: 'Clients' },
    { id: 'VIP Members', icon: 'workspace_premium', label: 'VIP Community' },
    { id: 'CMS', icon: 'verified', label: 'Indicators & CMS' },
    { id: 'Settings', icon: 'settings', label: 'Settings' },
  ];

  return (
    <div className="bg-background text-on-surface font-body-md min-h-screen antialiased flex">
      {/* SideNavBar */}
      <nav className="hidden md:flex flex-col bg-surface-container-lowest border-r border-outline-variant fixed left-0 top-0 h-full w-64 py-stack-lg z-50">
        <div className="px-6 mb-stack-lg flex items-center gap-3">
          <img src="/logo.png" alt="Elvaris Logo" className="w-8 h-8 object-contain" />
          <div>
            <h1 className="text-headline-md font-headline-md font-extrabold text-primary tracking-tighter leading-none text-xl">Elvaris</h1>
            <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mt-1">Technologies</p>
          </div>
        </div>

        <div className="flex-1 flex flex-col gap-1 px-4 overflow-y-auto">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200 ease-in-out text-label-sm font-label-sm w-full text-left ${
                activeTab === item.id 
                  ? 'text-primary font-bold border-r-2 border-primary bg-surface-container-low' 
                  : 'text-on-surface-variant hover:bg-surface-container hover:text-primary'
              }`}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>

        <div className="mt-auto px-4 flex flex-col gap-1 border-t border-outline-variant pt-4 mx-4">
          <button className="flex items-center gap-3 px-4 py-2 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-primary transition-colors duration-200 ease-in-out text-label-sm font-label-sm w-full text-left">
            <span className="material-symbols-outlined">help_outline</span> Support
          </button>
          <Link href="/" className="flex items-center gap-3 px-4 py-2 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-primary transition-colors duration-200 ease-in-out text-label-sm font-label-sm w-full text-left">
            <span className="material-symbols-outlined">logout</span> Sign Out
          </Link>
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        {/* TopAppBar */}
        <header className="bg-surface flex justify-between items-center w-full px-margin-desktop py-4 sticky top-0 z-40 border-b border-outline-variant transition-colors focus-within:border-primary">
          <div className="flex items-center w-full max-w-md bg-surface-container-lowest rounded-full border border-outline-variant px-4 py-2 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all">
            <span className="material-symbols-outlined text-on-surface-variant mr-2">search</span>
            <input className="bg-transparent border-none outline-none w-full text-body-md font-body-md text-on-surface placeholder-on-surface-variant focus:ring-0 p-0" placeholder="Search..." type="text" />
          </div>
          <div className="flex items-center gap-4">
            <button className="w-10 h-10 rounded-full flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors relative">
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-error border border-surface"></span>
            </button>
            <button className="w-10 h-10 rounded-full flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors">
              <span className="material-symbols-outlined">account_circle</span>
            </button>
            <button className="md:hidden text-on-surface-variant hover:text-primary transition-colors">
              <span className="material-symbols-outlined">menu</span>
            </button>
          </div>
        </header>

        {/* Dynamic Canvas */}
        <main className="flex-1 p-margin-mobile md:p-margin-desktop bg-background max-w-container-max mx-auto w-full">
          
          {/* TAB: TV Queue */}
          {activeTab === 'TV Queue' && (
            <>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-stack-lg gap-4">
                <div>
                  <h2 className="text-headline-lg font-headline-lg text-primary tracking-tighter mb-2">TradingView Access Queue</h2>
                  <p className="text-body-md font-body-md text-on-surface-variant">Manage script access provisioning and revocations.</p>
                </div>
                <div className="flex gap-4">
                  <div className="bg-surface-container-lowest px-4 py-2 rounded border border-outline-variant flex flex-col items-center min-w-[100px]">
                    <span className="text-stats-tabular font-stats-tabular font-bold text-primary">{tvQueue.filter(q => q.status === 'pending').length || 142}</span>
                    <span className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider text-[10px]">Pending</span>
                  </div>
                  <div className="bg-surface-container-lowest px-4 py-2 rounded border border-outline-variant flex flex-col items-center min-w-[100px]">
                    <span className="text-stats-tabular font-stats-tabular text-on-surface-variant">12</span>
                    <span className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider text-[10px]">Revoked (24h)</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
                {/* Dummy Grid Items mirroring Stitch design */}
                <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 flex flex-col gap-4 ambient-shadow relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-1 h-full bg-primary-fixed-dim"></div>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full object-cover grayscale border border-outline-variant bg-surface-container-high flex items-center justify-center font-bold text-primary">AT</div>
                      <div>
                        <h3 className="font-bold text-primary">@alpha_trader99</h3>
                        <p className="text-label-sm font-label-sm text-on-surface-variant flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">mail</span> user1@example.com
                        </p>
                      </div>
                    </div>
                    <span className="bg-surface-container text-primary px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">Pending</span>
                  </div>
                  <div className="py-4 border-y border-outline-variant border-opacity-50">
                    <p className="text-label-sm font-label-sm text-on-surface-variant mb-1 uppercase tracking-wider text-[10px]">Requested Indicator</p>
                    <p className="font-stats-tabular text-primary font-medium flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px]">candlestick_chart</span> Institutional Order Flow AI
                    </p>
                  </div>
                  <div className="flex gap-3 mt-auto pt-2">
                    <button className="flex-1 bg-primary text-on-primary py-2 rounded text-label-sm font-label-sm hover:-translate-y-[1px] hover:shadow-lg transition-all duration-200">Approve</button>
                    <button className="flex-1 bg-transparent border border-primary text-primary py-2 rounded text-label-sm font-label-sm hover:bg-surface-container transition-colors duration-200">Revoke</button>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* TAB: Payments */}
          {activeTab === 'Payments' && (
            <>
              <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
                <div>
                  <h2 className="text-headline-lg font-headline-lg text-primary tracking-tighter mb-2">Global Payments</h2>
                  <p className="text-body-md font-body-md text-on-surface-variant">Manage and audit institutional transactions across all ledgers.</p>
                </div>
                <div className="flex items-center gap-4">
                  <button className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-2.5 text-label-sm font-label-sm text-on-primary hover:bg-on-surface transition-all">
                    <span className="material-symbols-outlined text-[18px] mr-2">download</span> Export CSV
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant ambient-shadow flex flex-col justify-between">
                  <p className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider mb-2">24h Volume</p>
                  <div className="flex items-baseline gap-2">
                    <h3 className="text-headline-md font-headline-md text-primary font-stats-tabular tracking-tight">$12,450,000</h3>
                    <span className="text-label-sm font-label-sm text-primary flex items-center"><span className="material-symbols-outlined text-[16px] mr-0.5">arrow_upward</span> 4.2%</span>
                  </div>
                </div>
                <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant ambient-shadow flex flex-col justify-between">
                  <p className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider mb-2">Pending Manual</p>
                  <div className="flex items-baseline gap-2">
                    <h3 className="text-headline-md font-headline-md text-primary font-stats-tabular tracking-tight">{payoutQueue.length || 12}</h3>
                    <span className="text-label-sm font-label-sm text-on-surface-variant">Transactions</span>
                  </div>
                </div>
                <div className="bg-primary p-6 rounded-xl border border-[rgba(255,255,255,0.1)] ambient-shadow flex flex-col justify-between text-on-primary">
                  <p className="text-label-sm font-label-sm text-primary-fixed-dim uppercase tracking-wider mb-2">Network Status</p>
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-surface-container-lowest animate-pulse"></div>
                    <h3 className="text-label-sm font-label-sm font-bold tracking-widest uppercase">Operational</h3>
                  </div>
                </div>
              </div>

              <div className="bg-surface-container-lowest rounded-xl border border-outline-variant ambient-shadow overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-outline-variant bg-surface-bright">
                        <th className="px-6 py-4 text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">Entity</th>
                        <th className="px-6 py-4 text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider font-semibold text-right">Amount</th>
                        <th className="px-6 py-4 text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">Asset</th>
                        <th className="px-6 py-4 text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">Status</th>
                        <th className="px-6 py-4 text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider font-semibold text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="text-body-md font-body-md">
                      <tr className="border-b border-outline-variant hover:bg-surface-container-lowest transition-colors">
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded bg-surface-container-high flex items-center justify-center text-primary font-bold text-xs">AQ</div>
                            <div>
                              <p className="font-semibold text-primary">Aura Quant Fund</p>
                              <p className="text-xs text-on-surface-variant">UID: 8849-2A</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-right font-stats-tabular font-medium text-primary">450,000.00</td>
                        <td className="px-6 py-5"><span className="font-semibold">USDC</span></td>
                        <td className="px-6 py-5"><span className="inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-surface-container-high text-primary border border-outline-variant">Pending</span></td>
                        <td className="px-6 py-5 text-right">
                          <button className="inline-flex items-center justify-center rounded bg-primary px-4 py-1.5 text-xs font-bold text-on-primary hover:bg-on-surface transition-colors shadow-sm">
                            Manual Approve
                          </button>
                        </td>
                      </tr>
                      <tr className="border-b border-outline-variant hover:bg-surface-container-lowest transition-colors">
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded bg-surface-container-high flex items-center justify-center text-primary font-bold text-xs">NX</div>
                            <div>
                              <p className="font-semibold text-primary">Nexus Trading LLC</p>
                              <p className="text-xs text-on-surface-variant">UID: 1102-9C</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-right font-stats-tabular font-medium text-primary">1,200,500.00</td>
                        <td className="px-6 py-5"><span className="font-semibold">BTC</span></td>
                        <td className="px-6 py-5"><span className="inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-surface-container-lowest text-primary border border-primary">Confirmed</span></td>
                        <td className="px-6 py-5 text-right">
                          <button className="text-on-surface-variant hover:text-primary transition-colors"><span className="material-symbols-outlined">more_vert</span></button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* TAB: Overview */}
          {activeTab === 'Overview' && (
            <>
              <div className="mb-10">
                <h2 className="text-headline-lg font-headline-lg text-primary tracking-tighter mb-2">Overview</h2>
                <p className="text-body-md font-body-md text-on-surface-variant">High-level summary of system performance.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant ambient-shadow">
                  <p className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider mb-2">Total Revenue</p>
                  <h3 className="text-headline-md font-headline-md text-primary font-stats-tabular tracking-tight">${stats?.totalRevenue || 0}</h3>
                </div>
                <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant ambient-shadow">
                  <p className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider mb-2">Total Sales</p>
                  <h3 className="text-headline-md font-headline-md text-primary font-stats-tabular tracking-tight">{stats?.totalSales || 0}</h3>
                </div>
                <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant ambient-shadow">
                  <p className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider mb-2">Active Subs</p>
                  <h3 className="text-headline-md font-headline-md text-primary font-stats-tabular tracking-tight">{stats?.activeSubscriptions || 0}</h3>
                </div>
                <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant ambient-shadow">
                  <p className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider mb-2">Affiliates</p>
                  <h3 className="text-headline-md font-headline-md text-primary font-stats-tabular tracking-tight">{stats?.totalAffiliates || 0}</h3>
                </div>
              </div>
              
              <div className="bg-surface-container-lowest rounded-xl border border-outline-variant ambient-shadow overflow-hidden">
                <div className="p-6 border-b border-outline-variant">
                  <h3 className="text-title-md font-title-md font-bold text-primary">Recent Orders</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-outline-variant bg-surface-bright">
                        <th className="px-6 py-4 text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">User</th>
                        <th className="px-6 py-4 text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">Item</th>
                        <th className="px-6 py-4 text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">Plan</th>
                        <th className="px-6 py-4 text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider font-semibold text-right">Price</th>
                        <th className="px-6 py-4 text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody className="text-body-md font-body-md">
                      {(stats?.recentOrders || []).map((order) => (
                        <tr key={order.id} className="border-b border-outline-variant hover:bg-surface-container-lowest transition-colors">
                          <td className="px-6 py-5">
                            <p className="font-semibold text-primary">{order.userName}</p>
                            <p className="text-xs text-on-surface-variant">{order.userEmail}</p>
                          </td>
                          <td className="px-6 py-5 font-semibold">{order.indicatorName}</td>
                          <td className="px-6 py-5 capitalize">{order.planType}</td>
                          <td className="px-6 py-5 text-right font-stats-tabular font-medium text-primary">${order.finalPrice}</td>
                          <td className="px-6 py-5">
                            <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase ${
                              order.status === 'completed' ? 'bg-surface-container-lowest text-primary border border-primary' : 'bg-surface-container-high text-on-surface-variant border border-outline-variant'
                            }`}>
                              {order.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {!stats?.recentOrders?.length && (
                        <tr>
                          <td colSpan="5" className="px-6 py-8 text-center text-on-surface-variant">No recent orders.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* TAB: Analytics */}
          {activeTab === 'Analytics' && (
            <>
              <div className="mb-10">
                <h2 className="text-headline-lg font-headline-lg text-primary tracking-tighter mb-2">Analytics</h2>
                <p className="text-body-md font-body-md text-on-surface-variant">Platform analytics and growth metrics.</p>
              </div>
              <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-outline-variant rounded-xl opacity-50 bg-surface-container-lowest">
                <span className="material-symbols-outlined text-4xl mb-4 text-on-surface-variant">bar_chart</span>
                <p className="text-on-surface-variant font-label-sm">Detailed timeseries analytics module coming soon.</p>
              </div>
            </>
          )}

          {/* TAB: Clients */}
          {activeTab === 'Clients' && (
            <>
              <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
                <div>
                  <h2 className="text-headline-lg font-headline-lg text-primary tracking-tighter mb-2">Clients</h2>
                  <p className="text-body-md font-body-md text-on-surface-variant">Manage platform users and access.</p>
                </div>
              </div>
              <div className="bg-surface-container-lowest rounded-xl border border-outline-variant ambient-shadow overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-outline-variant bg-surface-bright">
                        <th className="px-6 py-4 text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">User</th>
                        <th className="px-6 py-4 text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">Role</th>
                        <th className="px-6 py-4 text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">Joined</th>
                        <th className="px-6 py-4 text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider font-semibold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="text-body-md font-body-md">
                      {users.map(user => (
                        <tr key={user._id} className="border-b border-outline-variant hover:bg-surface-container-lowest transition-colors">
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center text-primary font-bold text-xs uppercase">{user.name ? user.name[0] : 'U'}</div>
                              <div>
                                <p className="font-semibold text-primary">{user.name}</p>
                                <p className="text-xs text-on-surface-variant">{user.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5 capitalize">
                            <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase ${
                              user.role === 'admin' ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface-variant'
                            }`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="px-6 py-5 text-on-surface-variant">{new Date(user.createdAt).toLocaleDateString()}</td>
                          <td className="px-6 py-5 text-right">
                            <button className="text-on-surface-variant hover:text-primary transition-colors"><span className="material-symbols-outlined">edit</span></button>
                          </td>
                        </tr>
                      ))}
                      {users.length === 0 && (
                        <tr>
                          <td colSpan="4" className="px-6 py-8 text-center text-on-surface-variant">No users found.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* TAB: VIP Members */}
          {activeTab === 'VIP Members' && (
            <div className="space-y-8">
              {/* Top Sub-Navigation Header */}
              <div className="flex justify-between items-center border-b border-outline-variant pb-3">
                <div className="flex space-x-8 items-end">
                  {['Members', 'Posts', 'Broadcast Email'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setVipSubTab(tab)}
                      className={`font-label-sm text-label-sm uppercase tracking-wider pb-3 font-bold transition-colors select-none ${
                        vipSubTab === tab
                          ? 'text-primary border-b-2 border-primary -mb-3.5'
                          : 'text-on-surface-variant hover:text-primary'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
                <div className="hidden sm:flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse"></span>
                  <span className="font-mono text-xs font-semibold text-on-surface-variant uppercase tracking-wider">VIP Hub Active</span>
                </div>
              </div>

              {/* SUB-TAB 1: MEMBERS */}
              {vipSubTab === 'Members' && (
                <>
                  <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-6">
                    <div>
                      <h2 className="text-headline-lg font-headline-lg text-primary tracking-tighter mb-2">VIP Community Members</h2>
                      <p className="text-body-md font-body-md text-on-surface-variant">Manage institutional pass activations and manual tier provisioning.</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <button 
                        onClick={() => {
                          setVipFormData({ userEmail: '', vipTierId: vipTiersList[0]?._id || '', status: 'active' });
                          setVipModalOpen(true);
                        }}
                        className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-label-sm font-label-sm text-on-primary hover:opacity-90 transition-all font-bold uppercase tracking-wider"
                      >
                        <span className="material-symbols-outlined text-[18px] mr-2">add</span> Grant VIP Membership
                      </button>
                    </div>
                  </div>

                  <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-ambient overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-outline-variant bg-surface-bright">
                            <th className="px-6 py-4 text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">User</th>
                            <th className="px-6 py-4 text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">Tier</th>
                            <th className="px-6 py-4 text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">Status</th>
                            <th className="px-6 py-4 text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">Joined At</th>
                            <th className="px-6 py-4 text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider font-semibold text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="text-body-md font-body-md">
                          {vipMembers.map(member => (
                            <tr key={member._id} className="border-b border-outline-variant hover:bg-surface-container-lowest transition-colors">
                              <td className="px-6 py-5">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center text-primary font-bold text-xs uppercase">
                                    {member.user?.name ? member.user.name[0] : 'V'}
                                  </div>
                                  <div>
                                    <p className="font-semibold text-primary">{member.user?.name || 'Unknown User'}</p>
                                    <p className="text-xs text-on-surface-variant font-mono">{member.user?.email || member.user}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-5 font-semibold text-primary">
                                {member.vipTier?.name || 'Institutional Pass'}
                              </td>
                              <td className="px-6 py-5 capitalize">
                                <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase ${
                                  member.status === 'active' ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface-variant'
                                }`}>
                                  {member.status}
                                </span>
                              </td>
                              <td className="px-6 py-5 text-on-surface-variant font-mono text-xs">
                                {member.joinedAt ? new Date(member.joinedAt).toLocaleDateString() : 'N/A'}
                              </td>
                              <td className="px-6 py-5 text-right space-x-2">
                                {member.status === 'active' ? (
                                  <button 
                                    onClick={() => handleUpdateVipStatus(member._id, 'revoked')}
                                    className="inline-flex items-center justify-center rounded border border-outline-variant px-3 py-1 text-xs font-bold text-on-surface-variant hover:border-primary hover:text-primary transition-colors font-mono"
                                  >
                                    Revoke
                                  </button>
                                ) : (
                                  <button 
                                    onClick={() => handleUpdateVipStatus(member._id, 'active')}
                                    className="inline-flex items-center justify-center rounded bg-primary px-3 py-1 text-xs font-bold text-on-primary hover:opacity-90 transition-opacity font-mono"
                                  >
                                    Reactivate
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                          {vipMembers.length === 0 && (
                            <tr>
                              <td colSpan="5" className="px-6 py-8 text-center text-on-surface-variant">No VIP community members recorded yet.</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}

              {/* SUB-TAB 2: POSTS */}
              {vipSubTab === 'Posts' && (
                <div className="space-y-12">
                  {/* Top Section: New Community Post */}
                  <form onSubmit={handleAddVipPost} className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-ambient p-8 space-y-6">
                    <div className="border-b border-outline-variant pb-4 mb-6">
                      <h2 className="font-headline-md text-headline-md font-bold text-primary m-0">New Community Post</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      {/* Left Column: Form Fields */}
                      <div className="md:col-span-2 space-y-5">
                        <div className="flex gap-4">
                          <div className="w-1/3">
                            <label className="block font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-2 font-semibold">Trade Symbol</label>
                            <input
                              type="text"
                              required
                              value={vipPostForm.symbol}
                              onChange={(e) => setVipPostForm({ ...vipPostForm, symbol: e.target.value })}
                              placeholder="e.g., XAUUSD"
                              className="w-full bg-transparent border border-outline-variant rounded-md px-4 py-2.5 text-primary font-mono font-medium text-sm transition-colors focus:border-primary focus:ring-0 placeholder:text-outline"
                            />
                          </div>
                          <div className="w-2/3">
                            <label className="block font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-2 font-semibold">Title</label>
                            <input
                              type="text"
                              required
                              value={vipPostForm.title}
                              onChange={(e) => setVipPostForm({ ...vipPostForm, title: e.target.value })}
                              placeholder="Post Title"
                              className="w-full bg-transparent border border-outline-variant rounded-md px-4 py-2.5 text-primary font-body-md transition-colors focus:border-primary focus:ring-0 placeholder:text-outline"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-2 font-semibold">Trade Details &amp; Commentary</label>
                          <textarea
                            required
                            rows="5"
                            value={vipPostForm.content}
                            onChange={(e) => setVipPostForm({ ...vipPostForm, content: e.target.value })}
                            placeholder="Enter market analysis, entry points, and rationale..."
                            className="w-full bg-transparent border border-outline-variant rounded-md px-4 py-3 text-primary font-body-md transition-colors focus:border-primary focus:ring-0 resize-y placeholder:text-outline"
                          ></textarea>
                        </div>
                      </div>
                      {/* Right Column: Image Upload & Actions */}
                      <div className="space-y-5 flex flex-col justify-between">
                        <div>
                          <label className="block font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-2 font-semibold">Attached Charts</label>
                          <div className="border-2 border-dashed border-outline-variant rounded-md p-6 flex flex-col items-center justify-center text-center bg-surface hover:bg-surface-container-low transition-colors cursor-pointer h-32">
                            <span className="material-symbols-outlined text-outline mb-2">upload_file</span>
                            <span className="text-sm font-medium text-primary">Drag &amp; drop charts here</span>
                            <span className="text-xs text-outline mt-1">PNG, JPG up to 10MB</span>
                          </div>
                          {/* Thumbnails */}
                          <div className="flex gap-3 mt-4">
                            <div className="w-16 h-16 rounded border border-outline-variant overflow-hidden relative group">
                              <img
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCS1_p9yZ2MBV8duqLCmaA-DwUgXSY_uo5i9klYmUEKvkjDM89r2TyGVEiieZIyDxGENeRT67rnjCmdXNJllow35oNfw6cD82Roocbdfe9xMWrHCTP4GJxP4QkIIYJ8SABVuX5VhI5PhEELcGfQZYvbSkBGEYpq02m4JxOUDlDzMe-CjtLNJEhqmKDr0ZPZTIWkE8TQT6tJvNBhxhHVija9qmzMrymk21FFwU7GvwQ2s6me93ksWOqyu2bdG9DhuL2tm4sNiNAfzIo"
                                alt="Chart 1"
                                className="w-full h-full object-cover grayscale opacity-80 group-hover:opacity-100 transition-opacity"
                              />
                              <button type="button" className="absolute top-1 right-1 bg-surface-container-lowest rounded-full w-4 h-4 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="material-symbols-outlined text-[12px] text-primary">close</span>
                              </button>
                            </div>
                            <div className="w-16 h-16 rounded border border-outline-variant overflow-hidden relative group">
                              <img
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAFbB4zvy1MQwuXETKLz4z4liou9Mjb6YmOVKblLAl9uGLdWZuStARzHwKvKD5dr7KNOnnEkuvKg9p0ev36lz9Y_pkHr76l3Eh6ybbt__IZqco8RyvbgnJNE-kYHD45y7QSs7CxdruScSHWnOD63vWdO2i9t11xnSyqt2nONe0AehGircQQpeaDg3IGwvhfStB1UVK-ju4nwNjqmyyTYeXMaPyKpuXwcfICiTGMFIJPrDaGbWxAlTqbUoDk3i18J6YZBZ3qMsfPlno"
                                alt="Chart 2"
                                className="w-full h-full object-cover grayscale opacity-80 group-hover:opacity-100 transition-opacity"
                              />
                              <button type="button" className="absolute top-1 right-1 bg-surface-container-lowest rounded-full w-4 h-4 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="material-symbols-outlined text-[12px] text-primary">close</span>
                              </button>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between pt-4 border-t border-outline-variant">
                          <label className="flex items-center gap-2 cursor-pointer group">
                            <input
                              type="checkbox"
                              checked={vipPostForm.pinned}
                              onChange={(e) => setVipPostForm({ ...vipPostForm, pinned: e.target.checked })}
                              className="rounded border-outline-variant text-primary focus:ring-0 w-4 h-4 cursor-pointer group-hover:border-primary transition-colors"
                            />
                            <span className="text-sm font-medium text-primary select-none group-hover:text-primary">Pin this post</span>
                          </label>
                          <button
                            type="submit"
                            className="bg-primary text-on-primary font-label-sm text-label-sm uppercase tracking-wider px-6 py-2.5 rounded-full hover:shadow-ambient hover:-translate-y-0.5 transition-all flex items-center gap-2 font-bold"
                          >
                            <span>Post to Community</span>
                            <span className="material-symbols-outlined text-[18px]">send</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </form>

                  {/* Bottom Section: Dense Data Table */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-end">
                      <h3 className="font-body-lg text-body-lg font-semibold text-primary m-0">Existing Posts</h3>
                      <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">search</span>
                        <input
                          type="text"
                          value={vipPostSearch}
                          onChange={(e) => setVipPostSearch(e.target.value)}
                          placeholder="Search posts..."
                          className="pl-9 pr-4 py-1.5 text-sm bg-surface-container-lowest border border-outline-variant rounded-md focus:border-primary focus:ring-0 transition-colors w-64 text-primary placeholder:text-outline"
                        />
                      </div>
                    </div>
                    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-ambient overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="border-b border-outline-variant bg-surface-container-lowest">
                              <th className="py-3 px-4 font-label-sm text-[11px] text-on-surface-variant uppercase tracking-wider font-semibold w-12">Img</th>
                              <th className="py-3 px-4 font-label-sm text-[11px] text-on-surface-variant uppercase tracking-wider font-semibold w-24">Symbol</th>
                              <th className="py-3 px-4 font-label-sm text-[11px] text-on-surface-variant uppercase tracking-wider font-semibold">Title</th>
                              <th className="py-3 px-4 font-label-sm text-[11px] text-on-surface-variant uppercase tracking-wider font-semibold w-32">Author</th>
                              <th className="py-3 px-4 font-label-sm text-[11px] text-on-surface-variant uppercase tracking-wider font-semibold w-40">Date</th>
                              <th className="py-3 px-4 font-label-sm text-[11px] text-on-surface-variant uppercase tracking-wider font-semibold w-24 text-center">Status</th>
                              <th className="py-3 px-4 font-label-sm text-[11px] text-on-surface-variant uppercase tracking-wider font-semibold w-24 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="text-sm font-body-md divide-y divide-outline-variant">
                            {vipPosts
                              .filter(p => p.symbol.toLowerCase().includes(vipPostSearch.toLowerCase()) || p.title.toLowerCase().includes(vipPostSearch.toLowerCase()))
                              .map(post => (
                                <tr key={post._id} className="hover:bg-surface-container-low transition-colors group">
                                  <td className="py-3 px-4">
                                    <div className="w-10 h-10 rounded border border-outline-variant overflow-hidden bg-surface-container-high flex items-center justify-center">
                                      {post.image ? (
                                        <img src={post.image} alt="Chart thumb" className="w-full h-full object-cover grayscale" />
                                      ) : (
                                        <span className="material-symbols-outlined text-outline text-[18px]">image_not_supported</span>
                                      )}
                                    </div>
                                  </td>
                                  <td className="py-3 px-4 font-mono font-semibold text-primary">{post.symbol}</td>
                                  <td className="py-3 px-4 text-primary font-medium truncate max-w-[300px]">{post.title}</td>
                                  <td className="py-3 px-4 text-on-surface-variant">{post.author}</td>
                                  <td className="py-3 px-4 font-mono text-[13px] text-on-surface-variant">{post.createdAt}</td>
                                  <td className="py-3 px-4 text-center">
                                    {post.pinned && (
                                      <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-surface-container-high text-primary text-[10px] font-bold uppercase tracking-wide border border-outline-variant">
                                        Pinned
                                      </span>
                                    )}
                                  </td>
                                  <td className="py-3 px-4 text-right">
                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <button onClick={() => handleTogglePinVipPost(post._id)} className="text-outline hover:text-primary transition-colors" title={post.pinned ? 'Unpin' : 'Pin'}>
                                        <span className="material-symbols-outlined text-[18px]">{post.pinned ? 'visibility_off' : 'visibility'}</span>
                                      </button>
                                      <button onClick={() => handleDeleteVipPost(post._id)} className="text-outline hover:text-error transition-colors" title="Delete">
                                        <span className="material-symbols-outlined text-[18px]">delete</span>
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            {vipPosts.length === 0 && (
                              <tr>
                                <td colSpan="7" className="py-8 px-4 text-center text-on-surface-variant font-mono">No posts found.</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                      {/* Pagination footer */}
                      <div className="bg-surface border-t border-outline-variant px-4 py-3 flex items-center justify-between">
                        <span className="text-xs text-on-surface-variant font-medium uppercase tracking-wider font-mono">Showing 1-{vipPosts.length} of {vipPosts.length}</span>
                        <div className="flex gap-1">
                          <button disabled className="p-1 text-outline hover:text-primary transition-colors disabled:opacity-50">
                            <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                          </button>
                          <button className="p-1 text-outline hover:text-primary transition-colors">
                            <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SUB-TAB 3: BROADCAST EMAIL */}
              {vipSubTab === 'Broadcast Email' && (
                <div className="space-y-12">
                  {/* Compose Broadcast Section */}
                  <div className="max-w-4xl">
                    <h2 className="font-headline-md text-headline-md font-bold text-primary mb-6">Compose Broadcast</h2>
                    <form onSubmit={handleSendVipBroadcast} className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-ambient p-8">
                      <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center space-x-2">
                          <span className="material-symbols-outlined text-outline">group</span>
                          <span className="font-label-sm text-label-sm text-on-surface-variant font-semibold">Sending to VIP Tier</span>
                        </div>
                        <div className="bg-surface-container-low px-4 py-2 rounded-full border border-outline-variant">
                          <span className="font-label-sm text-label-sm text-primary font-mono font-bold">Recipients: {vipMembers.length || 214} active members</span>
                        </div>
                      </div>
                      <div className="space-y-6">
                        <div>
                          <label htmlFor="subject" className="block font-label-sm text-label-sm text-primary mb-2 uppercase tracking-wider font-bold">Subject Line</label>
                          <input
                            type="text"
                            id="subject"
                            required
                            value={vipBroadcastForm.subject}
                            onChange={(e) => setVipBroadcastForm({ ...vipBroadcastForm, subject: e.target.value })}
                            placeholder="Enter broadcast subject..."
                            className="w-full bg-transparent border border-outline-variant rounded-lg px-4 py-3 font-body-md text-body-md text-primary focus:ring-0 focus:border-primary transition-colors placeholder:text-outline"
                          />
                        </div>
                        <div>
                          <label htmlFor="message" className="block font-label-sm text-label-sm text-primary mb-2 uppercase tracking-wider font-bold">Message Body</label>
                          <textarea
                            id="message"
                            rows="8"
                            required
                            value={vipBroadcastForm.message}
                            onChange={(e) => setVipBroadcastForm({ ...vipBroadcastForm, message: e.target.value })}
                            placeholder="Draft your message here..."
                            className="w-full bg-transparent border border-outline-variant rounded-lg px-4 py-3 font-body-md text-body-md text-primary focus:ring-0 focus:border-primary transition-colors placeholder:text-outline resize-y"
                          ></textarea>
                        </div>
                        <div className="flex justify-end pt-4">
                          <button type="submit" className="bg-primary text-on-primary font-label-sm text-label-sm px-8 py-3 rounded-full hover:shadow-ambient transition-all flex items-center space-x-2 font-bold uppercase tracking-wider">
                            <span className="material-symbols-outlined text-[18px]">send</span>
                            <span>Send to VIP Community</span>
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>

                  {/* Broadcast History Section */}
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="font-headline-md text-headline-md font-bold text-primary">Broadcast History</h2>
                      <button type="button" className="text-on-surface-variant hover:text-primary transition-colors flex items-center space-x-1 font-label-sm text-label-sm font-semibold">
                        <span className="material-symbols-outlined text-[18px]">filter_list</span>
                        <span>Filter</span>
                      </button>
                    </div>
                    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-ambient overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="border-b border-outline-variant bg-surface-container-low">
                              <th className="py-4 px-6 font-label-sm text-label-sm text-outline uppercase tracking-wider font-semibold">Subject</th>
                              <th className="py-4 px-6 font-label-sm text-label-sm text-outline uppercase tracking-wider font-semibold w-48">Sent At</th>
                              <th className="py-4 px-6 font-label-sm text-label-sm text-outline uppercase tracking-wider font-semibold w-32 text-right">Recipients</th>
                              <th className="py-4 px-6 font-label-sm text-label-sm text-outline uppercase tracking-wider font-semibold w-32 text-right">Failed</th>
                              <th className="py-4 px-6 font-label-sm text-label-sm text-outline uppercase tracking-wider font-semibold w-24 text-right">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-outline-variant font-body-md text-body-md">
                            {vipBroadcasts.map((bc) => (
                              <tr key={bc._id} className="hover:bg-surface-bright transition-colors group">
                                <td className="py-4 px-6 text-primary font-medium">{bc.subject}</td>
                                <td className="py-4 px-6 text-secondary font-mono text-sm">{bc.sentAt}</td>
                                <td className="py-4 px-6 text-primary font-mono font-bold text-right">{bc.recipients}</td>
                                <td className={`py-4 px-6 font-mono font-bold text-right ${bc.failed > 0 ? 'text-error' : 'text-secondary'}`}>{bc.failed}</td>
                                <td className="py-4 px-6 text-right">
                                  <button type="button" className="text-outline hover:text-primary transition-colors opacity-0 group-hover:opacity-100" title="View details">
                                    <span className="material-symbols-outlined">visibility</span>
                                  </button>
                                </td>
                              </tr>
                            ))}
                            {vipBroadcasts.length === 0 && (
                              <tr>
                                <td colSpan="5" className="py-8 px-6 text-center text-on-surface-variant font-mono">No broadcast history recorded.</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                      <div className="px-6 py-4 border-t border-outline-variant bg-surface-container-lowest flex items-center justify-between">
                        <span className="font-label-sm text-label-sm text-outline uppercase font-mono text-xs">Showing 1-{vipBroadcasts.length} of {vipBroadcasts.length} Broadcasts</span>
                        <div className="flex space-x-2">
                          <button disabled className="w-8 h-8 rounded border border-outline-variant flex items-center justify-center text-outline hover:text-primary hover:border-primary transition-colors disabled:opacity-50">
                            <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                          </button>
                          <button className="w-8 h-8 rounded border border-outline-variant flex items-center justify-center text-outline hover:text-primary hover:border-primary transition-colors">
                            <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB: CMS */}
          {activeTab === 'CMS' && (
            <>
              <div className="mb-10">
                <h2 className="text-headline-lg font-headline-lg text-primary tracking-tighter mb-2">Content Management</h2>
                <p className="text-body-md font-body-md text-on-surface-variant">Manage indicators and FAQs.</p>
              </div>

              <div className="flex justify-between items-center border-b border-outline-variant mb-6 pb-2">
                <div className="flex gap-4">
                  {['Indicators', 'FAQs'].map(sub => (
                    <button 
                      key={sub}
                      onClick={() => setCmsSubTab(sub)}
                      className={`text-label-sm font-label-sm font-bold uppercase tracking-wider pb-2 border-b-2 transition-colors ${
                        cmsSubTab === sub ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-primary'
                      }`}
                    >
                      {sub}
                    </button>
                  ))}
                </div>
                {cmsSubTab === 'Indicators' && (
                  <button
                    onClick={() => handleOpenIndicatorModal(null)}
                    className="inline-flex items-center gap-2 bg-primary text-on-primary px-4 py-2 rounded-lg font-bold text-label-sm hover:opacity-90 transition-all shadow-sm"
                  >
                    <span className="material-symbols-outlined text-[18px]">add</span>
                    Upload Indicator
                  </button>
                )}
              </div>

              {cmsSubTab === 'Indicators' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {indicators.map(ind => (
                    <div key={ind._id} className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 ambient-shadow flex flex-col justify-between hover:border-primary transition-colors">
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-bold text-primary text-title-md">{ind.name}</h3>
                          {ind.isActive !== false ? (
                            <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-primary text-[10px] font-bold uppercase tracking-wider border border-outline-variant">Active</span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant text-[10px] font-bold uppercase tracking-wider">Draft</span>
                          )}
                        </div>
                        <p className="text-label-sm text-on-surface-variant mb-3 font-stats-tabular">/{ind.slug}</p>
                        <p className="text-body-sm line-clamp-2 text-on-surface-variant mb-4">{ind.shortDescription}</p>
                        <div className="flex flex-wrap gap-1 mb-4">
                          {(ind.category || []).map((cat, i) => (
                            <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-surface-container text-on-surface-variant font-medium">{cat}</span>
                          ))}
                          {ind.scriptFile && (
                            <span className="text-[10px] px-2 py-0.5 rounded bg-primary-fixed-dim text-primary font-bold flex items-center gap-1">
                              <span className="material-symbols-outlined text-[12px]">code</span> {ind.scriptType || 'script'}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex justify-between items-center pt-4 border-t border-outline-variant mt-auto">
                        <div>
                          <span className="font-stats-tabular font-bold text-primary text-lg">${ind.price ?? (ind.pricing?.[0]?.price ?? 49)}</span>
                          <span className="text-xs text-on-surface-variant ml-1">/mo base</span>
                        </div>
                        <button
                          onClick={() => handleOpenIndicatorModal(ind)}
                          className="text-label-sm text-primary font-bold hover:underline inline-flex items-center gap-1 bg-surface-container px-3 py-1.5 rounded hover:bg-surface-container-high transition-colors"
                        >
                          <span className="material-symbols-outlined text-[16px]">edit</span> Edit Details
                        </button>
                      </div>
                    </div>
                  ))}
                  {indicators.length === 0 && (
                    <div className="col-span-full py-12 text-center text-on-surface-variant border border-dashed border-outline-variant rounded-xl flex flex-col items-center justify-center">
                      <span className="material-symbols-outlined text-4xl mb-2 text-on-surface-variant">candlestick_chart</span>
                      <p className="font-bold mb-1">No indicators found</p>
                      <p className="text-xs text-on-surface-variant mb-4">Upload your first institutional indicator to display in the marketplace.</p>
                      <button onClick={() => handleOpenIndicatorModal(null)} className="bg-primary text-on-primary px-4 py-2 rounded text-label-sm font-bold">Upload Indicator</button>
                    </div>
                  )}
                </div>
              )}

              {cmsSubTab === 'FAQs' && (
                <div className="bg-surface-container-lowest rounded-xl border border-outline-variant ambient-shadow overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-outline-variant bg-surface-bright">
                          <th className="px-6 py-4 text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">Question</th>
                          <th className="px-6 py-4 text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">Category</th>
                          <th className="px-6 py-4 text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {faqs.map(faq => (
                          <tr key={faq._id} className="border-b border-outline-variant hover:bg-surface-container-lowest">
                            <td className="px-6 py-5 font-semibold text-primary">{faq.question}</td>
                            <td className="px-6 py-5 text-on-surface-variant capitalize">{faq.category}</td>
                            <td className="px-6 py-5 text-right">
                              <button className="text-on-surface-variant hover:text-primary"><span className="material-symbols-outlined">edit</span></button>
                            </td>
                          </tr>
                        ))}
                        {faqs.length === 0 && (
                          <tr>
                            <td colSpan="3" className="px-6 py-8 text-center text-on-surface-variant">No FAQs found.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

            </>
          )}

          {/* TAB: Settings */}
          {activeTab === 'Settings' && (
            <div className="max-w-2xl">
              <div className="mb-10">
                <h2 className="text-headline-lg font-headline-lg text-primary tracking-tighter mb-2">Settings</h2>
                <p className="text-body-md font-body-md text-on-surface-variant">Manage global platform configurations.</p>
              </div>

              <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6 ambient-shadow mb-6">
                <h3 className="text-title-md font-bold text-primary mb-4">API Configurations</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider mb-1">NOWPayments API Key</label>
                    <input type="password" defaultValue="************************" readOnly className="w-full bg-surface-container border border-outline-variant rounded px-4 py-2 text-on-surface font-stats-tabular focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider mb-1">Resend API Key</label>
                    <input type="password" defaultValue="************************" readOnly className="w-full bg-surface-container border border-outline-variant rounded px-4 py-2 text-on-surface font-stats-tabular focus:outline-none" />
                  </div>
                </div>
                <div className="mt-6 flex justify-end">
                  <button className="bg-primary text-on-primary px-6 py-2 rounded-lg font-bold text-label-sm hover:opacity-90 transition-opacity">Save Changes</button>
                </div>
              </div>
            </div>
          )}

          {/* Indicator Editor Modal */}
          {indicatorModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
              <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col ambient-shadow overflow-hidden text-on-surface">
                
                {/* Modal Header */}
                <div className="px-6 py-4 border-b border-outline-variant flex justify-between items-center bg-surface">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary text-on-primary flex items-center justify-center">
                      <span className="material-symbols-outlined">candlestick_chart</span>
                    </div>
                    <div>
                      <h3 className="text-title-md font-bold text-primary">
                        {editingIndicator ? `Edit Indicator: ${indFormData.name}` : 'Upload New Indicator'}
                      </h3>
                      <p className="text-xs text-on-surface-variant">Configure pricing tiers, features, script upload, and metadata.</p>
                    </div>
                  </div>
                  <button onClick={() => setIndicatorModalOpen(false)} className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors">
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>

                {/* Modal Tabs */}
                <div className="flex border-b border-outline-variant px-6 bg-surface-container-low">
                  {['General', 'Pricing', 'Script & Media'].map(tab => (
                    <button
                      key={tab}
                      onClick={() => setIndModalTab(tab)}
                      className={`py-3 px-4 text-label-sm font-bold uppercase tracking-wider border-b-2 transition-colors ${
                        indModalTab === tab ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-primary'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {/* Modal Form Body */}
                <form onSubmit={handleSaveIndicator} className="flex-1 overflow-y-auto p-6 space-y-6">
                  
                  {/* TAB 1: GENERAL */}
                  {indModalTab === 'General' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-label-sm font-bold uppercase tracking-wider text-on-surface-variant mb-1">Indicator Name *</label>
                          <input
                            type="text"
                            required
                            value={indFormData.name}
                            onChange={(e) => {
                              const name = e.target.value;
                              const autoSlug = editingIndicator ? indFormData.slug : name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                              setIndFormData({ ...indFormData, name, slug: autoSlug });
                            }}
                            placeholder="e.g. SMC Pro Toolkit"
                            className="w-full bg-surface-container border border-outline-variant rounded-lg px-4 py-2.5 text-on-surface focus:outline-none focus:border-primary transition-colors"
                          />
                        </div>
                        <div>
                          <label className="block text-label-sm font-bold uppercase tracking-wider text-on-surface-variant mb-1">URL Slug *</label>
                          <input
                            type="text"
                            required
                            value={indFormData.slug}
                            onChange={(e) => setIndFormData({ ...indFormData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, '-') })}
                            placeholder="e.g. smc-pro-toolkit"
                            className="w-full bg-surface-container border border-outline-variant rounded-lg px-4 py-2.5 text-on-surface font-stats-tabular text-sm focus:outline-none focus:border-primary transition-colors"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-label-sm font-bold uppercase tracking-wider text-on-surface-variant mb-1">Short Description (Summary card) *</label>
                        <textarea
                          rows="2"
                          required
                          value={indFormData.shortDescription}
                          onChange={(e) => setIndFormData({ ...indFormData, shortDescription: e.target.value })}
                          placeholder="Brief 1-2 sentence overview of the indicator's core value proposition..."
                          className="w-full bg-surface-container border border-outline-variant rounded-lg px-4 py-2.5 text-on-surface text-sm focus:outline-none focus:border-primary transition-colors"
                        />
                      </div>

                      <div>
                        <label className="block text-label-sm font-bold uppercase tracking-wider text-on-surface-variant mb-1">Full Description (Markdown or Text) *</label>
                        <textarea
                          rows="5"
                          required
                          value={indFormData.description}
                          onChange={(e) => setIndFormData({ ...indFormData, description: e.target.value })}
                          placeholder="Detailed institutional breakdown, strategy rationale, algorithmic logic, and usage guide..."
                          className="w-full bg-surface-container border border-outline-variant rounded-lg px-4 py-2.5 text-on-surface text-sm font-mono focus:outline-none focus:border-primary transition-colors"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                        {/* Categories */}
                        <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant">
                          <label className="block text-label-sm font-bold uppercase tracking-wider text-primary mb-3">Asset Categories</label>
                          <div className="flex flex-wrap gap-2">
                            {['Gold Strategies', 'Forex', 'Crypto', 'Indices', 'Commodities'].map((cat) => {
                              const checked = indFormData.category.includes(cat);
                              return (
                                <button
                                  type="button"
                                  key={cat}
                                  onClick={() => {
                                    const updated = checked
                                      ? indFormData.category.filter(c => c !== cat)
                                      : [...indFormData.category, cat];
                                    setIndFormData({ ...indFormData, category: updated.length ? updated : ['Gold Strategies'] });
                                  }}
                                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                                    checked
                                      ? 'bg-primary text-on-primary border-primary shadow-sm'
                                      : 'bg-surface-container text-on-surface-variant border-outline-variant hover:text-primary'
                                  }`}
                                >
                                  {checked && <span className="material-symbols-outlined text-[14px] mr-1 align-text-bottom">check</span>}
                                  {cat}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Trading Styles */}
                        <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant">
                          <label className="block text-label-sm font-bold uppercase tracking-wider text-primary mb-3">Trading Styles</label>
                          <div className="flex flex-wrap gap-2">
                            {['Scalping', 'Swing Trading', 'Day Trading', 'Automated', 'Order Flow'].map((style) => {
                              const checked = indFormData.tradingStyle.includes(style);
                              return (
                                <button
                                  type="button"
                                  key={style}
                                  onClick={() => {
                                    const updated = checked
                                      ? indFormData.tradingStyle.filter(s => s !== style)
                                      : [...indFormData.tradingStyle, style];
                                    setIndFormData({ ...indFormData, tradingStyle: updated.length ? updated : ['Scalping'] });
                                  }}
                                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                                    checked
                                      ? 'bg-primary text-on-primary border-primary shadow-sm'
                                      : 'bg-surface-container text-on-surface-variant border-outline-variant hover:text-primary'
                                  }`}
                                >
                                  {checked && <span className="material-symbols-outlined text-[14px] mr-1 align-text-bottom">check</span>}
                                  {style}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 px-4 py-3 bg-surface-container-low rounded-xl border border-outline-variant">
                        <div>
                          <p className="font-bold text-primary text-sm">Status: Active on Marketplace</p>
                          <p className="text-xs text-on-surface-variant">When disabled, this indicator is saved as a draft and hidden from public catalog.</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={indFormData.isActive}
                            onChange={(e) => setIndFormData({ ...indFormData, isActive: e.target.checked })}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-surface-container peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                      </div>
                    </div>
                  )}

                  {/* TAB 2: PRICING */}
                  {indModalTab === 'Pricing' && (
                    <div className="space-y-6">
                      <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant">
                        <label className="block text-label-sm font-bold uppercase tracking-wider text-primary mb-1">Primary Base Display Price ($ USD / mo)</label>
                        <p className="text-xs text-on-surface-variant mb-3">This is the headline price displayed on catalog cards and catalog overviews.</p>
                        <div className="relative max-w-xs">
                          <span className="absolute left-3 top-2.5 text-on-surface-variant font-bold">$</span>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            required
                            value={indFormData.price}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value) || 0;
                              const newPricing = [...indFormData.pricing];
                              const mIdx = newPricing.findIndex(p => p.planType === 'monthly');
                              if (mIdx !== -1) newPricing[mIdx].price = val;
                              setIndFormData({ ...indFormData, price: val, pricing: newPricing });
                            }}
                            className="w-full bg-surface-container border border-outline-variant rounded-lg pl-8 pr-4 py-2 font-stats-tabular font-bold text-primary focus:outline-none focus:border-primary"
                          />
                        </div>
                      </div>

                      <div>
                        <h4 className="text-title-md font-bold text-primary mb-1">Detailed Subscription Tiers</h4>
                        <p className="text-xs text-on-surface-variant mb-4">Set exact prices ($ USD) for each institutional billing tier.</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {indFormData.pricing.map((tier, idx) => (
                            <div key={tier.planType} className="bg-surface-container p-4 rounded-xl border border-outline-variant flex flex-col justify-between">
                              <div className="flex justify-between items-center mb-2">
                                <span className="font-bold text-primary capitalize text-sm">{tier.planType} Plan</span>
                                <span className="text-[10px] uppercase font-bold text-on-surface-variant px-2 py-0.5 rounded bg-surface-container-high">USD / {tier.planType === 'lifetime' ? 'once' : tier.planType}</span>
                              </div>
                              <div className="relative mt-2">
                                <span className="absolute left-3 top-2 text-on-surface-variant font-bold">$</span>
                                <input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  required
                                  value={tier.price}
                                  onChange={(e) => {
                                    const val = parseFloat(e.target.value) || 0;
                                    const updated = [...indFormData.pricing];
                                    updated[idx] = { ...updated[idx], price: val };
                                    const nextState = { ...indFormData, pricing: updated };
                                    if (tier.planType === 'monthly') nextState.price = val;
                                    setIndFormData(nextState);
                                  }}
                                  className="w-full bg-surface border border-outline-variant rounded-lg pl-8 pr-4 py-2 font-stats-tabular font-bold text-primary text-lg focus:outline-none focus:border-primary"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 3: SCRIPT & MEDIA */}
                  {indModalTab === 'Script & Media' && (
                    <div className="space-y-6">
                      {/* Script Upload Zone */}
                      <div className="bg-surface-container-low p-5 rounded-xl border border-outline-variant">
                        <div className="flex justify-between items-center mb-2">
                          <label className="block text-label-sm font-bold uppercase tracking-wider text-primary">Indicator Script / Source File Upload</label>
                          <select
                            value={indFormData.scriptType}
                            onChange={(e) => setIndFormData({ ...indFormData, scriptType: e.target.value })}
                            className="bg-surface-container border border-outline-variant text-xs font-bold rounded px-2 py-1 text-primary focus:outline-none"
                          >
                            <option value="pine">Pine Script (.pine)</option>
                            <option value="json">Order Block Config (.json)</option>
                            <option value="py">Python Quant Kernel (.py)</option>
                            <option value="zip">Toolkit Bundle (.zip)</option>
                          </select>
                        </div>
                        <p className="text-xs text-on-surface-variant mb-4">Attach the script file or enter the script storage path/URL. When users purchase this indicator, TradingView provisioning will read from this script.</p>
                        
                        <div className="border-2 border-dashed border-outline-variant hover:border-primary transition-colors rounded-xl p-6 text-center bg-surface-container flex flex-col items-center justify-center cursor-pointer relative"
                             onClick={() => document.getElementById('indicator-file-input')?.click()}>
                          <input
                            id="indicator-file-input"
                            type="file"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                setIndFormData({ ...indFormData, scriptFile: `/scripts/uploads/${file.name}` });
                              }
                            }}
                          />
                          <span className="material-symbols-outlined text-3xl text-primary mb-2">upload_file</span>
                          <p className="text-sm font-bold text-primary">Click to upload indicator script file</p>
                          <p className="text-xs text-on-surface-variant mt-1">or drag & drop (.pine, .py, .json up to 25MB)</p>
                          {indFormData.scriptFile && (
                            <div className="mt-4 px-3 py-1.5 bg-primary-fixed-dim text-primary rounded-lg text-xs font-mono font-bold flex items-center gap-2">
                              <span className="material-symbols-outlined text-sm">check_circle</span>
                              Attached: {indFormData.scriptFile}
                            </div>
                          )}
                        </div>
                        
                        <div className="mt-3">
                          <label className="block text-xs text-on-surface-variant mb-1">Or direct script storage URL / path:</label>
                          <input
                            type="text"
                            value={indFormData.scriptFile}
                            onChange={(e) => setIndFormData({ ...indFormData, scriptFile: e.target.value })}
                            placeholder="/scripts/smc-pro-v2.pine or https://storage.elvaris.com/scripts/smc.pine"
                            className="w-full bg-surface border border-outline-variant rounded px-3 py-1.5 text-xs font-mono text-on-surface focus:outline-none focus:border-primary"
                          />
                        </div>
                      </div>

                      {/* Banner Image */}
                      <div>
                        <label className="block text-label-sm font-bold uppercase tracking-wider text-on-surface-variant mb-1">Banner Image URL</label>
                        <input
                          type="text"
                          value={indFormData.bannerImage}
                          onChange={(e) => setIndFormData({ ...indFormData, bannerImage: e.target.value })}
                          placeholder="https://images.unsplash.com/... or /images/indicators/smc.jpg"
                          className="w-full bg-surface-container border border-outline-variant rounded-lg px-4 py-2.5 text-on-surface text-sm font-mono focus:outline-none focus:border-primary transition-colors"
                        />
                      </div>

                      {/* Features List */}
                      <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant">
                        <div className="flex justify-between items-center mb-3">
                          <label className="block text-label-sm font-bold uppercase tracking-wider text-primary">Key Capabilities & Features</label>
                          <button
                            type="button"
                            onClick={() => setIndFormData({ ...indFormData, features: [...indFormData.features, 'New Institutional Feature'] })}
                            className="text-xs bg-surface-container px-3 py-1 rounded font-bold text-primary hover:bg-surface-container-high transition-colors inline-flex items-center gap-1"
                          >
                            <span className="material-symbols-outlined text-[14px]">add</span> Add Feature
                          </button>
                        </div>
                        <div className="space-y-2">
                          {indFormData.features.map((feat, i) => (
                            <div key={i} className="flex gap-2 items-center">
                              <input
                                type="text"
                                value={feat}
                                onChange={(e) => {
                                  const updated = [...indFormData.features];
                                  updated[i] = e.target.value;
                                  setIndFormData({ ...indFormData, features: updated });
                                }}
                                className="flex-1 bg-surface border border-outline-variant rounded px-3 py-1.5 text-sm text-on-surface focus:outline-none focus:border-primary"
                              />
                              <button
                                type="button"
                                onClick={() => setIndFormData({ ...indFormData, features: indFormData.features.filter((_, idx) => idx !== i) })}
                                className="p-1.5 text-on-surface-variant hover:text-error transition-colors"
                              >
                                <span className="material-symbols-outlined text-lg">delete</span>
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Modal Form Footer Actions */}
                  <div className="pt-4 border-t border-outline-variant flex justify-between items-center mt-6">
                    <div>
                      {editingIndicator && editingIndicator._id && (
                        <button
                          type="button"
                          onClick={() => handleDeleteIndicator(editingIndicator._id)}
                          className="inline-flex items-center gap-1 text-error hover:bg-error/10 px-4 py-2 rounded-lg text-sm font-bold transition-colors"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                          Delete Indicator
                        </button>
                      )}
                    </div>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setIndicatorModalOpen(false)}
                        className="px-5 py-2.5 rounded-lg border border-outline-variant text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors font-bold text-sm"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={indSubmitting}
                        className="px-6 py-2.5 rounded-lg bg-primary text-on-primary hover:opacity-90 font-bold text-sm transition-all shadow-md inline-flex items-center gap-2"
                      >
                        {indSubmitting ? (
                          <>
                            <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                            Saving...
                          </>
                        ) : (
                          <>
                            <span className="material-symbols-outlined text-[18px]">save</span>
                            {editingIndicator ? 'Save Changes' : 'Upload & Publish'}
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </form>

              </div>
            </div>
          )}

          {/* Grant VIP Membership Modal */}
          {vipModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
              <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-8 max-w-lg w-full ambient-shadow">
                <div className="flex justify-between items-center mb-6 border-b border-outline-variant pb-4">
                  <h3 className="text-headline-sm font-bold text-primary">Grant VIP Community Pass</h3>
                  <button onClick={() => setVipModalOpen(false)} className="text-on-surface-variant hover:text-primary">
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>
                <form onSubmit={handleGrantVipMembership} className="space-y-4">
                  <div>
                    <label className="block text-label-sm font-bold text-on-surface-variant uppercase tracking-wider mb-2">User Email Address</label>
                    <input 
                      type="email" 
                      required 
                      placeholder="e.g. trader@institutional.com"
                      className="w-full bg-surface border border-outline-variant rounded-lg p-3 text-primary font-mono text-body-md focus:border-primary focus:outline-none"
                      value={vipFormData.userEmail}
                      onChange={e => setVipFormData({ ...vipFormData, userEmail: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-label-sm font-bold text-on-surface-variant uppercase tracking-wider mb-2">Access Tier</label>
                    <select 
                      className="w-full bg-surface border border-outline-variant rounded-lg p-3 text-primary font-mono text-body-md focus:border-primary focus:outline-none"
                      value={vipFormData.vipTierId}
                      onChange={e => setVipFormData({ ...vipFormData, vipTierId: e.target.value })}
                    >
                      {vipTiersList.map(tier => (
                        <option key={tier._id} value={tier._id}>
                          {tier.name} (${tier.entryFeeUsd} USD)
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-label-sm font-bold text-on-surface-variant uppercase tracking-wider mb-2">Initial Status</label>
                    <select 
                      className="w-full bg-surface border border-outline-variant rounded-lg p-3 text-primary font-mono text-body-md focus:border-primary focus:outline-none"
                      value={vipFormData.status}
                      onChange={e => setVipFormData({ ...vipFormData, status: e.target.value })}
                    >
                      <option value="active">Active (Instant Access + Welcome Email)</option>
                      <option value="pending">Pending</option>
                    </select>
                  </div>
                  <div className="flex justify-end gap-3 pt-6 border-t border-outline-variant">
                    <button type="button" onClick={() => setVipModalOpen(false)} className="px-6 py-2.5 rounded-lg border border-outline-variant text-on-surface-variant hover:text-primary font-bold text-label-sm">
                      Cancel
                    </button>
                    <button type="submit" className="px-6 py-2.5 rounded-lg bg-primary text-on-primary font-bold text-label-sm hover:opacity-90">
                      Grant Access Now
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
