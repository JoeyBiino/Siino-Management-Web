'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store';
import { Button, Input, Alert } from '@/components/ui';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { signIn, isLoading, user, team, initialize, isInitialized } = useAuthStore();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Initialize auth on mount
  useEffect(() => {
    initialize();
  }, [initialize]);
  
  // Redirect if already logged in
  useEffect(() => {
    if (isInitialized && user) {
      if (team) {
        router.push('/dashboard');
      } else {
        router.push('/setup');
      }
    }
  }, [isInitialized, user, team, router]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    const result = await signIn(email, password);
    
    if (result.error) {
      setError(result.error);
    } else {
      // Auth store will update, useEffect will handle redirect
    }
  };
  
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-dark-bg flex">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-accent-dark flex items-center justify-center">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Siino Management</h1>
              <p className="text-xs text-gray-500">Business management platform</p>
            </div>
          </div>
          
          {/* Form */}
          <div className="bg-dark-surface border border-dark-border rounded-card p-8">
            <h2 className="text-xl font-semibold text-white mb-2">Welcome back</h2>
            <p className="text-sm text-gray-500 mb-6">Sign in to your account to continue</p>
            
            {error && (
              <div className="mb-4">
                <Alert type="error" message={error} onClose={() => setError(null)} />
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                type="email"
                label="Email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
              
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  label="Password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-[34px] text-gray-500 hover:text-white"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              
              <Button
                type="submit"
                className="w-full"
                loading={isLoading}
              >
                Sign In
              </Button>
            </form>
            
            <p className="text-sm text-gray-500 text-center mt-6">
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="text-accent hover:text-accent-light">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
      
      {/* Right side - Decoration */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-accent/20 to-dark-bg items-center justify-center p-8">
        <div className="max-w-lg text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Manage your creative business
          </h2>
          <p className="text-gray-400">
            Track projects, clients, invoices, and expenses all in one place.
            Built for freelancers and creative agencies.
          </p>
          
          {/* Feature highlights */}
          <div className="grid grid-cols-2 gap-4 mt-8">
            {[
              { title: 'Projects', desc: 'Track status & deadlines' },
              { title: 'Invoicing', desc: 'Generate PDFs instantly' },
              { title: 'Bookings', desc: 'Client scheduling' },
              { title: 'Expenses', desc: 'Track business costs' },
            ].map((feature) => (
              <div key={feature.title} className="bg-dark-surface/50 border border-dark-border rounded-card p-4 text-left">
                <h3 className="text-sm font-medium text-white">{feature.title}</h3>
                <p className="text-xs text-gray-500">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
