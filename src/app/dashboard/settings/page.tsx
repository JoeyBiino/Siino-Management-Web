'use client';

import React, { useState } from 'react';
import { useAuthStore } from '@/lib/store';
import { getSupabaseClient } from '@/lib/supabase/client';
import { PageHeader } from '@/components/layout/Sidebar';
import { Card, Input, Button, Alert, Tabs } from '@/components/ui';
import { Save, Building2, CreditCard, Users, Palette } from 'lucide-react';

export default function SettingsPage() {
  const { team, refreshTeam } = useAuthStore();
  const [activeTab, setActiveTab] = useState('team');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Team settings
  const [teamName, setTeamName] = useState(team?.name || '');
  
  // Billing settings
  const [billingName, setBillingName] = useState(team?.billing_name || '');
  const [billingAddress, setBillingAddress] = useState(team?.billing_address || '');
  const [billingCity, setBillingCity] = useState(team?.billing_city || '');
  const [billingProvince, setBillingProvince] = useState(team?.billing_province || 'QC');
  const [billingPostalCode, setBillingPostalCode] = useState(team?.billing_postal_code || '');
  const [billingPhone, setBillingPhone] = useState(team?.billing_phone || '');
  const [tpsNumber, setTpsNumber] = useState(team?.tps_number || '');
  const [tvqNumber, setTvqNumber] = useState(team?.tvq_number || '');
  
  const handleSaveTeam = async () => {
    if (!team?.id) return;
    
    setIsLoading(true);
    setError(null);
    setSuccess(false);
    
    const supabase = getSupabaseClient();
    
    try {
      const { error } = await supabase
        .from('teams')
        .update({
          name: teamName,
          billing_name: billingName,
          billing_address: billingAddress,
          billing_city: billingCity,
          billing_province: billingProvince,
          billing_postal_code: billingPostalCode,
          billing_phone: billingPhone,
          tps_number: tpsNumber,
          tvq_number: tvqNumber,
          updated_at: new Date().toISOString(),
        })
        .eq('id', team.id);
      
      if (error) throw error;
      
      await refreshTeam();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  const tabs = [
    { id: 'team', label: 'Team', icon: <Building2 className="w-4 h-4" /> },
    { id: 'billing', label: 'Billing', icon: <CreditCard className="w-4 h-4" /> },
    { id: 'members', label: 'Members', icon: <Users className="w-4 h-4" /> },
    { id: 'appearance', label: 'Appearance', icon: <Palette className="w-4 h-4" /> },
  ];
  
  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        subtitle="Manage your team and preferences"
      />
      
      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}
      {success && <Alert type="success" message="Settings saved successfully!" />}
      
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
      
      {activeTab === 'team' && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Team Settings</h3>
          <div className="space-y-4 max-w-md">
            <Input
              label="Team Name"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
            />
            
            <div className="pt-4">
              <Button onClick={handleSaveTeam} loading={isLoading}>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </div>
        </Card>
      )}
      
      {activeTab === 'billing' && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Billing Information</h3>
          <p className="text-sm text-gray-500 mb-6">This information will appear on your invoices.</p>
          
          <div className="space-y-4 max-w-xl">
            <Input
              label="Business Name"
              value={billingName}
              onChange={(e) => setBillingName(e.target.value)}
            />
            
            <Input
              label="Address"
              value={billingAddress}
              onChange={(e) => setBillingAddress(e.target.value)}
            />
            
            <div className="grid grid-cols-3 gap-4">
              <Input
                label="City"
                value={billingCity}
                onChange={(e) => setBillingCity(e.target.value)}
              />
              <Input
                label="Province"
                value={billingProvince}
                onChange={(e) => setBillingProvince(e.target.value)}
              />
              <Input
                label="Postal Code"
                value={billingPostalCode}
                onChange={(e) => setBillingPostalCode(e.target.value)}
              />
            </div>
            
            <Input
              label="Phone"
              value={billingPhone}
              onChange={(e) => setBillingPhone(e.target.value)}
            />
            
            <div className="border-t border-dark-border pt-4 mt-4">
              <h4 className="text-sm font-medium text-white mb-3">Tax Numbers</h4>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="TPS Number"
                  value={tpsNumber}
                  onChange={(e) => setTpsNumber(e.target.value)}
                />
                <Input
                  label="TVQ Number"
                  value={tvqNumber}
                  onChange={(e) => setTvqNumber(e.target.value)}
                />
              </div>
            </div>
            
            <div className="pt-4">
              <Button onClick={handleSaveTeam} loading={isLoading}>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </div>
        </Card>
      )}
      
      {activeTab === 'members' && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Team Members</h3>
          <p className="text-sm text-gray-500">Team member management coming soon.</p>
        </Card>
      )}
      
      {activeTab === 'appearance' && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Appearance</h3>
          <p className="text-sm text-gray-500">Customize your dashboard appearance. Coming soon.</p>
        </Card>
      )}
    </div>
  );
}
