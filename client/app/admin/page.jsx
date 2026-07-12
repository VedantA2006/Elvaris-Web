import React from 'react';
import AdminDashboard from '../../src/views/AdminDashboard.jsx';

export const metadata = {
  title: 'Administrative Control Panel — Elvaris Technologies',
  description: 'Manage catalogs, process TradingView access queues, oversee affiliate payouts, and administer institutional CMS content.',
};

export default function AdminPage() {
  return <AdminDashboard />;
}
