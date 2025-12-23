'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store';
import { Button, Input, Alert } from '@/components/ui';
import { Eye, EyeOff, Loader2, Check } from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const { signUp, isLoading, user, isInitialized, initialize } = useAuthStore();
  
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  // Initialize auth on mount
  useEffect(() => {
    initialize();
  }, [initialize]);
  
  // Redirect if already logged in
  useEffect(() => {
    if (isInitialized && user) {
      router.push('/setup');
    }
  }, [isInitialized, user, router]);
  
  const passwordRequirements = [
    { met: password.length >= 8, text: 'At least 8 characters' },
    { met: /[A-Z]/.test(password), text: 'One uppercase letter' },
    { met: /[a-z]/.test(password), text: 'One lowercase letter' },
    { met: /[0-9]/.test(password), text: 'One number' },
  ];
  
  const isPasswordValid = passwordRequirements.every((req) => req.met);
  const passwordsMatch = password === confirmPassword;
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!isPasswordValid) {
      setError('Please meet all password requirements');
      return;
    }
    
    if (!passwordsMatch) {
      setError('Passwords do not match');
      return;
    }
    
    const result = await signUp(email, password, fullName);
    
    if (result.error) {
      setError(result.error);
    } else {
      setSuccess(true);
      // Redirect to team setup
      setTimeout(() => {
        router.push('/setup');
      }, 1500);
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
      {/* Left side - Decoration */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-accent/20 to-dark-bg items-center justify-center p-8">
        <div className="max-w-lg text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Start managing your business today
          </h2>
          <p className="text-gray-400">
            Join thousands of creative professionals who use Siino to streamline their workflow.
          </p>
          
          {/* Testimonial */}
          <div className="bg-dark-surface/50 border border-dark-border rounded-card p-6 mt-8 text-left">
            <p className="text-gray-300 italic mb-4">
              &ldquo;Siino has completely transformed how I manage my freelance business. 
              Invoicing takes seconds now, and I never miss a deadline.&rdquo;
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                <span className="text-accent font-medium">JD</span>
              </div>
              <div>
                <p className="text-sm font-medium text-white">Joey D.</p>
                <p className="text-xs text-gray-500">Creative Director</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Right side - Form */}
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
            <h2 className="text-xl font-semibold text-white mb-2">Create your account</h2>
            <p className="text-sm text-gray-500 mb-6">Get started with a free account</p>
            
            {error && (
              <div className="mb-4">
                <Alert type="error" message={error} onClose={() => setError(null)} />
              </div>
            )}
            
            {success && (
              <div className="mb-4">
                <Alert type="success" message="Account created! Redirecting to setup..." />
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                type="text"
                label="Full Name"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                autoComplete="name"
              />
              
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
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-[34px] text-gray-500 hover:text-white"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              
              {/* Password requirements */}
              {password && (
                <div className="space-y-1">
                  {passwordRequirements.map((req) => (
                    <div key={req.text} className="flex items-center gap-2 text-xs">
                      <Check className={`w-3 h-3 ${req.met ? 'text-success' : 'text-gray-600'}`} />
                      <span className={req.met ? 'text-success' : 'text-gray-500'}>{req.text}</span>
                    </div>
                  ))}
                </div>
              )}
              
              <Input
                type="password"
                label="Confirm Password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
                error={confirmPassword && !passwordsMatch ? 'Passwords do not match' : undefined}
              />
              
              <Button
                type="submit"
                className="w-full"
                loading={isLoading}
                disabled={!isPasswordValid || !passwordsMatch}
              >
                Create Account
              </Button>
            </form>
            
            <p className="text-sm text-gray-500 text-center mt-6">
              Already have an account?{' '}
              <Link href="/login" className="text-accent hover:text-accent-light">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
