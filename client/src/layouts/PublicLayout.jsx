import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/layout/Navbar.jsx';
import Footer from '../components/layout/Footer.jsx';

const PublicLayout = ({ children }) => {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const ref = searchParams.get('ref');
    if (ref) {
      const storedRef = localStorage.getItem('elvaris_ref');
      if (storedRef !== ref) {
        localStorage.setItem('elvaris_ref', ref);
        axios.post('/api/affiliates/clicks', { referralCode: ref })
          .then(() => console.log(`Referral click registered: ${ref}`))
          .catch(err => console.warn('Referral click record warning:', err.response?.data?.error?.message || err.message));
      }
    }
  }, [searchParams]);

  return (
    <div className="flex flex-col min-h-screen bg-surface text-on-surface relative overflow-x-hidden">
      {/* Subtle high-contrast ambient glows */}
      <div className="absolute top-[5%] left-[20%] w-[500px] h-[500px] bg-primary/[0.03] rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-[10%] right-[15%] w-[400px] h-[400px] bg-outline-variant/[0.08] rounded-full blur-[100px] pointer-events-none z-0" />
      
      {/* Header */}
      <Navbar />

      {/* Main Viewport Content */}
      <main className="flex-grow pt-20 pb-16 z-10 relative">
        {children}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default PublicLayout;
