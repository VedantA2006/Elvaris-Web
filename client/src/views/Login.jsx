'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Button from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const { login } = useAuth();
  const router = useRouter();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await login(email, password);
    if (res.success) {
      router.push('/dashboard');
    } else {
      setError(res.error || 'Failed to login');
      setLoading(false);
    }
  };

  return (
    <div className="bg-background text-on-background min-h-screen flex items-center justify-center p-margin-mobile md:p-margin-desktop antialiased font-display">
      <div className="w-full max-w-[420px] bg-surface-container-lowest border border-surface-variant rounded-xl ambient-shadow p-8 md:p-10 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-primary"></div>
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <img src="/logo.png" alt="Elvaris Logo" className="w-10 h-10 object-contain" />
            <h1 className="font-display text-headline-md text-primary font-extrabold tracking-tighter">ELVARIS</h1>
          </div>
          <p className="font-display text-body-md text-secondary">Sign in to your institutional account</p>
        </div>
        
        {error && (
          <div className="bg-error-container/20 border border-error text-error text-sm p-3 rounded-lg mb-6 text-center">
            {error}
          </div>
        )}

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="block font-display text-label-sm text-on-surface" htmlFor="email">Email Address</label>
            <input
              className="w-full bg-surface-container-lowest border border-outline-variant text-on-surface font-display text-body-md rounded-DEFAULT px-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
              id="email"
              name="email"
              placeholder="name@institution.com"
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="block font-display text-label-sm text-on-surface" htmlFor="password">Password</label>
              <a className="font-display text-label-sm text-secondary hover:text-primary transition-colors" href="#">Forgot password?</a>
            </div>
            <input
              className="w-full bg-surface-container-lowest border border-outline-variant text-on-surface font-display text-body-md rounded-DEFAULT px-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
              id="password"
              name="password"
              placeholder="••••••••"
              required
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <Button variant="primary" type="submit" className="w-full py-3 font-display" disabled={loading}>
            {loading ? 'Logging in...' : 'Log In'}
          </Button>
        </form>
        
        <p className="mt-8 text-center font-display text-body-md text-secondary">
          Don't have an account? <Link className="text-primary hover:underline font-semibold" href="/register">Register</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
