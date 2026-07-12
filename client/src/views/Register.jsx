'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';

const Register = () => {
  const { register } = useAuth();
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);

    const res = await register(name, email, password);
    if (res.success) {
      setSuccess(true);
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
    } else {
      setError(res.error || 'Failed to register');
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-background min-h-screen flex items-center justify-center p-margin-mobile md:p-margin-desktop text-on-surface antialiased">
      <div className="w-full max-w-[420px] bg-surface-container-lowest border border-outline-variant rounded-xl p-8 ambient-shadow relative">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <img src="/logo.png" alt="Elvaris Logo" className="w-10 h-10 object-contain" />
            <h1 className="font-display text-headline-md font-extrabold tracking-tighter text-primary">ELVARIS</h1>
          </div>
          <p className="font-display text-body-md text-on-surface-variant">Create an institutional account</p>
        </div>

        {error && (
          <div className="bg-error-container/20 border border-error text-error text-sm p-3 rounded-lg mb-6 text-center">
            {error}
          </div>
        )}

        <form className="space-y-5" onSubmit={handleRegister}>
          <div>
            <label className="block font-display text-label-sm text-on-surface mb-2" htmlFor="fullName">Full Name</label>
            <input
              className="w-full bg-surface-container-lowest border border-outline-variant rounded p-3 font-display text-body-md text-on-surface placeholder-on-surface-variant/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
              id="fullName"
              placeholder="e.g. Jane Doe"
              required
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="block font-display text-label-sm text-on-surface mb-2" htmlFor="email">Corporate Email</label>
            <input
              className="w-full bg-surface-container-lowest border border-outline-variant rounded p-3 font-display text-body-md text-on-surface placeholder-on-surface-variant/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
              id="email"
              placeholder="jane.doe@firm.com"
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block font-display text-label-sm text-on-surface mb-2" htmlFor="password">Password</label>
            <div className="relative">
              <input
                className="w-full bg-surface-container-lowest border border-outline-variant rounded p-3 pr-10 font-display text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                id="password"
                required
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="block font-display text-label-sm text-on-surface mb-2" htmlFor="confirmPassword">Confirm Password</label>
            <input
              className="w-full bg-surface-container-lowest border border-outline-variant rounded p-3 font-display text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
              id="confirmPassword"
              required
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          <div className="flex items-start pt-2">
            <div className="flex items-center h-5">
              <input
                className="w-4 h-4 border border-outline-variant rounded bg-surface-container-lowest text-primary focus:ring-primary focus:ring-offset-0 cursor-pointer"
                id="terms"
                required
                type="checkbox"
              />
            </div>
            <div className="ml-3">
              <label className="font-display text-label-sm font-normal text-on-surface-variant cursor-pointer" htmlFor="terms">
                I agree to the <a className="text-primary hover:underline font-semibold" href="#">Terms of Service</a> and <a className="text-primary hover:underline font-semibold" href="#">Privacy Policy</a>.
              </label>
            </div>
          </div>
          <div className="pt-4">
            <button
              className={`w-full font-display text-label-sm py-3 px-4 rounded flex justify-center items-center transition-all duration-200 group relative overflow-hidden active:scale-[0.98] ${
                success ? 'bg-[#14b8a6] text-white' : 'bg-primary text-on-primary hover:shadow-[0_4px_12px_rgba(0,0,0,0.15)]'
              }`}
              type="submit"
              disabled={isLoading || success}
            >
              {isLoading && !success && (
                <span className="absolute inset-0 flex items-center justify-center opacity-100">
                  <svg className="animate-spin h-5 w-5 text-on-primary" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" fill="currentColor"></path>
                  </svg>
                </span>
              )}
              <span className={`transition-opacity duration-200 ${isLoading && !success ? 'opacity-0' : 'opacity-100'}`}>
                {success ? 'Account Created' : 'Create Account'}
              </span>
            </button>
          </div>
        </form>
        <div className="mt-8 text-center">
          <p className="font-display text-body-md text-on-surface-variant">
            Already have an account? <Link className="text-primary font-semibold hover:underline" href="/login">Log In</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
