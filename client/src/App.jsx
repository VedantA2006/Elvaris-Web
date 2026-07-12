import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import PublicLayout from './layouts/PublicLayout.jsx';
import Home from './pages/Home.jsx';
import Indicators from './pages/Indicators.jsx';
import IndicatorDetail from './pages/IndicatorDetail.jsx';
import Pricing from './pages/Pricing.jsx';
import Performance from './pages/Performance.jsx';
import Docs from './pages/Docs.jsx';
import Blog from './pages/Blog.jsx';
import Checkout from './pages/Checkout.jsx';
import AffiliateDashboard from './pages/AffiliateDashboard.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import Button from './components/ui/Button.jsx';
import GlassCard from './components/ui/GlassCard.jsx';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Simple placeholder page for mock routes
const MockPlaceholder = ({ title }) => (
  <PublicLayout>
    <div className="max-w-md mx-auto px-6 py-20 text-center">
      <GlassCard className="border-border-subtle p-12 flex flex-col items-center gap-4">
        <h2 className="text-2xl font-extrabold text-text-primary">{title}</h2>
        <p className="text-text-secondary text-sm">This screen will be fully enabled in the next phases of development.</p>
        <Link to="/">
          <Button variant="primary-gradient" className="mt-4">Back Home</Button>
        </Link>
      </GlassCard>
    </div>
  </PublicLayout>
);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          {/* Public Views */}
          <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
          <Route path="/indicators" element={<PublicLayout><Indicators /></PublicLayout>} />
          <Route path="/indicators/:slug" element={<PublicLayout><IndicatorDetail /></PublicLayout>} />
          <Route path="/pricing" element={<PublicLayout><Pricing /></PublicLayout>} />
          <Route path="/performance" element={<PublicLayout><Performance /></PublicLayout>} />
          <Route path="/documentation" element={<PublicLayout><Docs /></PublicLayout>} />
          <Route path="/blog" element={<PublicLayout><Blog /></PublicLayout>} />
          <Route path="/blog/:slug" element={<PublicLayout><Blog /></PublicLayout>} />
          <Route path="/affiliate" element={<PublicLayout><AffiliateDashboard /></PublicLayout>} />
          <Route path="/admin" element={<PublicLayout><AdminDashboard /></PublicLayout>} />

          {/* Placeholders for upcoming modules */}
          <Route path="/login" element={<MockPlaceholder title="Account Login" />} />
          <Route path="/register" element={<MockPlaceholder title="Register Account" />} />
          <Route path="/checkout/:id" element={<PublicLayout><Checkout /></PublicLayout>} />
          
          {/* Wildcard 404 */}
          <Route 
            path="*" 
            element={
              <PublicLayout>
                <div className="max-w-md mx-auto px-6 py-20 text-center">
                  <GlassCard className="border-accent-danger/20 p-12 flex flex-col items-center gap-4">
                    <span className="text-accent-danger text-4xl font-extrabold">404</span>
                    <h2 className="text-2xl font-bold text-text-primary">Page Not Found</h2>
                    <p className="text-text-secondary text-sm">The route you are requesting does not exist.</p>
                    <a href="/">
                      <Button variant="outline" className="mt-2">Back to Safety</Button>
                    </a>
                  </GlassCard>
                </div>
              </PublicLayout>
            } 
          />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
