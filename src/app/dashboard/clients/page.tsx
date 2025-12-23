'use client';

import React, { useState, useMemo } from 'react';
import { useAuthStore, useDataStore } from '@/lib/store';
import { getSupabaseClient } from '@/lib/supabase/client';
import { PageHeader } from '@/components/layout/Sidebar';
import {
  Button,
  Card,
  Badge,
  Input,
  Textarea,
  Modal,
  EmptyState,
  Dropdown,
  DropdownItem,
  Alert,
  Checkbox,
} from '@/components/ui';
import { generateUUID, generatePortalCode } from '@/lib/utils';
import type { Client } from '@/types';
import {
  Plus,
  Search,
  Users,
  MoreHorizontal,
  Pencil,
  Trash2,
  Mail,
  Phone,
  MapPin,
  Globe,
  Copy,
  Check,
} from 'lucide-react';

export default function ClientsPage() {
  const { team } = useAuthStore();
  const { clients, projects, invoices, addClient, updateClient, removeClient } = useDataStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formBillingName, setFormBillingName] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formCity, setFormCity] = useState('');
  const [formProvince, setFormProvince] = useState('QC');
  const [formPostalCode, setFormPostalCode] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [formChargeTaxes, setFormChargeTaxes] = useState(true);
  const [formPortalEnabled, setFormPortalEnabled] = useState(false);
  const [formPortalCode, setFormPortalCode] = useState('');
  
  const filteredClients = useMemo(() => {
    return clients
      .filter(c => {
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          return (
            c.name.toLowerCase().includes(query) ||
            c.email.toLowerCase().includes(query) ||
            c.phone.includes(query)
          );
        }
        return true;
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [clients, searchQuery]);
  
  const getClientStats = (clientId: string) => {
    const clientProjects = projects.filter(p => p.client_id === clientId);
    const clientInvoices = invoices.filter(i => i.client_id === clientId);
    return {
      projects: clientProjects.length,
      invoices: clientInvoices.length,
    };
  };
  
  const handleNewClient = () => {
    setEditingClient(null);
    setFormName('');
    setFormEmail('');
    setFormPhone('');
    setFormBillingName('');
    setFormAddress('');
    setFormCity('');
    setFormProvince('QC');
    setFormPostalCode('');
    setFormNotes('');
    setFormChargeTaxes(true);
    setFormPortalEnabled(false);
    setFormPortalCode('');
    setIsModalOpen(true);
  };
  
  const handleEditClient = (client: Client) => {
    setEditingClient(client);
    setFormName(client.name);
    setFormEmail(client.email);
    setFormPhone(client.phone);
    setFormBillingName(client.billing_name);
    setFormAddress(client.address);
    setFormCity(client.city);
    setFormProvince(client.province);
    setFormPostalCode(client.postal_code);
    setFormNotes(client.notes);
    setFormChargeTaxes(client.charge_taxes_by_default);
    setFormPortalEnabled(client.portal_enabled);
    setFormPortalCode(client.portal_code || '');
    setIsModalOpen(true);
  };
  
  const handleGeneratePortalCode = () => {
    const code = generatePortalCode();
    setFormPortalCode(code);
    setFormPortalEnabled(true);
  };
  
  const handleCopyPortalCode = () => {
    navigator.clipboard.writeText(formPortalCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };
  
  const handleSaveClient = async () => {
    if (!team?.id || !formName.trim()) return;
    
    setIsLoading(true);
    setError(null);
    
    const supabase = getSupabaseClient();
    
    try {
      const clientData = {
        name: formName.trim(),
        email: formEmail.trim(),
        phone: formPhone.trim(),
        billing_name: formBillingName.trim(),
        address: formAddress.trim(),
        city: formCity.trim(),
        province: formProvince.trim(),
        postal_code: formPostalCode.trim(),
        other_info: '',
        notes: formNotes,
        charge_taxes_by_default: formChargeTaxes,
        portal_enabled: formPortalEnabled,
        portal_code: formPortalEnabled ? (formPortalCode || generatePortalCode()) : null,
        team_id: team.id,
      };
      
      if (editingClient) {
        const { data, error } = await supabase
          .from('clients')
          .update({ ...clientData, updated_at: new Date().toISOString() })
          .eq('id', editingClient.id)
          .select()
          .single();
        
        if (error) throw error;
        if (data) updateClient(data);
      } else {
        const { data, error } = await supabase
          .from('clients')
          .insert({ ...clientData, id: generateUUID() })
          .select()
          .single();
        
        if (error) throw error;
        if (data) addClient(data);
      }
      
      setIsModalOpen(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDeleteClient = async (client: Client) => {
    const stats = getClientStats(client.id);
    if (stats.projects > 0 || stats.invoices > 0) {
      setError('Cannot delete client with existing projects or invoices.');
      return;
    }
    
    if (!confirm('Are you sure you want to delete this client?')) return;
    
    const supabase = getSupabaseClient();
    
    try {
      const { error } = await supabase.from('clients').delete().eq('id', client.id);
      if (error) throw error;
      removeClient(client.id);
    } catch (err: any) {
      setError(err.message);
    }
  };
  
  return (
    <div className="space-y-6">
      <PageHeader
        title="Clients"
        subtitle={`${clients.length} total clients`}
        actions={
          <Button onClick={handleNewClient}>
            <Plus className="w-4 h-4 mr-2" />
            New Client
          </Button>
        }
      />
      
      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}
      
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <Input
          placeholder="Search clients..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>
      
      {filteredClients.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClients.map((client) => {
            const stats = getClientStats(client.id);
            return (
              <Card key={client.id} className="p-4 hover:border-accent/50 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                      <span className="text-accent font-semibold">{client.name.charAt(0).toUpperCase()}</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{client.name}</h3>
                      {client.billing_name && client.billing_name !== client.name && (
                        <p className="text-xs text-gray-500">{client.billing_name}</p>
                      )}
                    </div>
                  </div>
                  
                  <Dropdown trigger={<button className="p-1 hover:bg-dark-border rounded"><MoreHorizontal className="w-4 h-4 text-gray-400" /></button>} align="right">
                    <DropdownItem icon={<Pencil className="w-4 h-4" />} onClick={() => handleEditClient(client)}>Edit</DropdownItem>
                    <DropdownItem icon={<Trash2 className="w-4 h-4" />} onClick={() => handleDeleteClient(client)} danger>Delete</DropdownItem>
                  </Dropdown>
                </div>
                
                <div className="space-y-2 text-sm">
                  {client.email && (
                    <div className="flex items-center gap-2 text-gray-400">
                      <Mail className="w-3 h-3" />
                      <a href={`mailto:${client.email}`} className="hover:text-white truncate">{client.email}</a>
                    </div>
                  )}
                  {client.phone && (
                    <div className="flex items-center gap-2 text-gray-400">
                      <Phone className="w-3 h-3" />
                      <a href={`tel:${client.phone}`} className="hover:text-white">{client.phone}</a>
                    </div>
                  )}
                  {client.city && (
                    <div className="flex items-center gap-2 text-gray-400">
                      <MapPin className="w-3 h-3" />
                      <span>{client.city}, {client.province}</span>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-4 mt-4 pt-4 border-t border-dark-border text-xs">
                  <div><span className="text-gray-500">Projects:</span> <span className="text-white font-medium">{stats.projects}</span></div>
                  <div><span className="text-gray-500">Invoices:</span> <span className="text-white font-medium">{stats.invoices}</span></div>
                  {client.portal_enabled && (
                    <Badge color="purple" size="sm"><Globe className="w-3 h-3 mr-1" />Portal</Badge>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="p-12">
          <EmptyState
            icon={<Users className="w-12 h-12" />}
            title="No clients yet"
            description="Add your first client to get started"
            action={<Button onClick={handleNewClient}><Plus className="w-4 h-4 mr-2" />New Client</Button>}
          />
        </Card>
      )}
      
      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingClient ? 'Edit Client' : 'New Client'} size="lg">
        <div className="space-y-6">
          <div>
            <h4 className="text-sm font-medium text-gray-400 mb-3">Contact Information</h4>
            <div className="space-y-4">
              <Input label="Client Name" placeholder="John Doe or Company Name" value={formName} onChange={(e) => setFormName(e.target.value)} required />
              <div className="grid grid-cols-2 gap-4">
                <Input type="email" label="Email" placeholder="client@example.com" value={formEmail} onChange={(e) => setFormEmail(e.target.value)} />
                <Input type="tel" label="Phone" placeholder="(514) 555-0123" value={formPhone} onChange={(e) => setFormPhone(e.target.value)} />
              </div>
            </div>
          </div>
          
          <div className="border-t border-dark-border pt-6">
            <h4 className="text-sm font-medium text-gray-400 mb-3">Billing Information</h4>
            <div className="space-y-4">
              <Input label="Billing Name (if different)" placeholder="Company Inc." value={formBillingName} onChange={(e) => setFormBillingName(e.target.value)} />
              <Input label="Address" placeholder="123 Main Street" value={formAddress} onChange={(e) => setFormAddress(e.target.value)} />
              <div className="grid grid-cols-3 gap-4">
                <Input label="City" placeholder="Montreal" value={formCity} onChange={(e) => setFormCity(e.target.value)} />
                <Input label="Province" placeholder="QC" value={formProvince} onChange={(e) => setFormProvince(e.target.value)} />
                <Input label="Postal Code" placeholder="H2X 1Y4" value={formPostalCode} onChange={(e) => setFormPostalCode(e.target.value)} />
              </div>
              <Checkbox checked={formChargeTaxes} onChange={setFormChargeTaxes} label="Charge taxes by default (TPS/TVQ)" />
            </div>
          </div>
          
          <div className="border-t border-dark-border pt-6">
            <h4 className="text-sm font-medium text-gray-400 mb-3">Client Portal</h4>
            <div className="space-y-4">
              <Checkbox checked={formPortalEnabled} onChange={setFormPortalEnabled} label="Enable client portal access" />
              {formPortalEnabled && (
                <div className="flex gap-2 items-end">
                  <div className="flex-1">
                    <Input label="Portal Code" value={formPortalCode} onChange={(e) => setFormPortalCode(e.target.value)} placeholder="Auto-generated" readOnly />
                  </div>
                  <Button variant="secondary" onClick={handleGeneratePortalCode}>Generate</Button>
                  {formPortalCode && (
                    <Button variant="ghost" onClick={handleCopyPortalCode}>
                      {copiedCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
          
          <div className="border-t border-dark-border pt-6">
            <Textarea label="Notes" placeholder="Add any notes about this client..." value={formNotes} onChange={(e) => setFormNotes(e.target.value)} rows={3} />
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveClient} loading={isLoading} disabled={!formName.trim()}>
              {editingClient ? 'Save Changes' : 'Create Client'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
