'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { Button, Input, Alert } from '@/components/ui';
import { Loader2, Building2, ArrowRight } from 'lucide-react';

export default function SetupPage() {
  const router = useRouter();
  const { user, team, createTeam, isLoading, isInitialized, initialize } = useAuthStore();
  
  const [step, setStep] = useState(1);
  const [teamName, setTeamName] = useState('');
  const [billingName, setBillingName] = useState('');
  const [billingAddress, setBillingAddress] = useState('');
  const [billingCity, setBillingCity] = useState('');
  const [billingProvince, setBillingProvince] = useState('QC');
  const [billingPostalCode, setBillingPostalCode] = useState('');
  const [billingPhone, setBillingPhone] = useState('');
  const [tpsNumber, setTpsNumber] = useState('');
  const [tvqNumber, setTvqNumber] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  // Initialize auth on mount
  useEffect(() => {
    initialize();
  }, [initialize]);
  
  // Redirect if not logged in or already has team
  useEffect(() => {
    if (isInitialized) {
      if (!user) {
        router.push('/login');
      } else if (team) {
        router.push('/dashboard');
      }
    }
  }, [isInitialized, user, team, router]);
  
  const handleCreateTeam = async () => {
    setError(null);
    
    const result = await createTeam(teamName, {
      billing_name: billingName,
      billing_address: billingAddress,
      billing_city: billingCity,
      billing_province: billingProvince,
      billing_postal_code: billingPostalCode,
      billing_phone: billingPhone,
      tps_number: tpsNumber,
      tvq_number: tvqNumber,
    });
    
    if (result.error) {
      setError(result.error);
    } else {
      router.push('/dashboard');
    }
  };
  
  if (!isInitialized || !user) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center p-8">
      <div className="w-full max-w-lg">
        {/* Progress indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2].map((s) => (
            <div
              key={s}
              className={`w-2 h-2 rounded-full transition-all ${
                s <= step ? 'bg-accent w-8' : 'bg-dark-border'
              }`}
            />
          ))}
        </div>
        
        <div className="bg-dark-surface border border-dark-border rounded-card p-8">
          {step === 1 ? (
            <>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">Create your team</h2>
                  <p className="text-sm text-gray-500">This will be your workspace</p>
                </div>
              </div>
              
              {error && (
                <div className="mb-4">
                  <Alert type="error" message={error} onClose={() => setError(null)} />
                </div>
              )}
              
              <div className="space-y-4">
                <Input
                  label="Team / Company Name"
                  placeholder="Acme Studio"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  required
                />
                
                <p className="text-xs text-gray-500">
                  This is typically your business or company name. You can change it later.
                </p>
                
                <div className="flex justify-end pt-4">
                  <Button
                    onClick={() => setStep(2)}
                    disabled={!teamName.trim()}
                  >
                    Continue
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-white">Billing Information</h2>
                <p className="text-sm text-gray-500">
                  This will appear on your invoices (optional, can be added later)
                </p>
              </div>
              
              {error && (
                <div className="mb-4">
                  <Alert type="error" message={error} onClose={() => setError(null)} />
                </div>
              )}
              
              <div className="space-y-4">
                <Input
                  label="Business Name (for invoices)"
                  placeholder="Acme Studio Inc."
                  value={billingName}
                  onChange={(e) => setBillingName(e.target.value)}
                />
                
                <Input
                  label="Address"
                  placeholder="123 Main Street"
                  value={billingAddress}
                  onChange={(e) => setBillingAddress(e.target.value)}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="City"
                    placeholder="Montreal"
                    value={billingCity}
                    onChange={(e) => setBillingCity(e.target.value)}
                  />
                  <Input
                    label="Province"
                    placeholder="QC"
                    value={billingProvince}
                    onChange={(e) => setBillingProvince(e.target.value)}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Postal Code"
                    placeholder="H2X 1Y4"
                    value={billingPostalCode}
                    onChange={(e) => setBillingPostalCode(e.target.value)}
                  />
                  <Input
                    label="Phone"
                    placeholder="(514) 555-0123"
                    value={billingPhone}
                    onChange={(e) => setBillingPhone(e.target.value)}
                  />
                </div>
                
                <div className="border-t border-dark-border pt-4 mt-4">
                  <p className="text-sm font-medium text-white mb-3">Tax Numbers (Quebec)</p>
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="TPS Number"
                      placeholder="123456789 RT0001"
                      value={tpsNumber}
                      onChange={(e) => setTpsNumber(e.target.value)}
                    />
                    <Input
                      label="TVQ Number"
                      placeholder="1234567890 TQ0001"
                      value={tvqNumber}
                      onChange={(e) => setTvqNumber(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="flex justify-between pt-4">
                  <Button variant="ghost" onClick={() => setStep(1)}>
                    Back
                  </Button>
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      onClick={handleCreateTeam}
                      loading={isLoading}
                    >
                      Skip for now
                    </Button>
                    <Button
                      onClick={handleCreateTeam}
                      loading={isLoading}
                    >
                      Create Team
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
