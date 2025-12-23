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
  Select,
  Textarea,
  Modal,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  EmptyState,
  SummaryCard,
  FilterPills,
  Dropdown,
  DropdownItem,
  Alert,
  Checkbox,
} from '@/components/ui';
import { formatCurrency, formatDate, generateUUID, calculateInvoiceTotals } from '@/lib/utils';
import type { Invoice, InvoiceStatus, InvoiceLineItem } from '@/types';
import {
  Plus,
  Search,
  FileText,
  MoreHorizontal,
  Pencil,
  Trash2,
  Download,
  CheckCircle,
  Clock,
  DollarSign,
  TrendingUp,
  X,
} from 'lucide-react';

const statusOptions: { value: InvoiceStatus | ''; label: string }[] = [
  { value: '', label: 'All Statuses' },
  { value: 'draft', label: 'Draft' },
  { value: 'unpaid', label: 'Unpaid' },
  { value: 'paid', label: 'Paid' },
  { value: 'overdue', label: 'Overdue' },
  { value: 'cancelled', label: 'Cancelled' },
];

export default function InvoicesPage() {
  const { team } = useAuthStore();
  const { invoices, clients, addInvoice, updateInvoice, removeInvoice } = useDataStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<InvoiceStatus | ''>('');
  const [filterYear, setFilterYear] = useState<number>(new Date().getFullYear());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [formClientId, setFormClientId] = useState('');
  const [formIssueDate, setFormIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [formDueDate, setFormDueDate] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [formApplyTps, setFormApplyTps] = useState(true);
  const [formApplyTvq, setFormApplyTvq] = useState(true);
  const [formLineItems, setFormLineItems] = useState<{ description: string; quantity: number; rate: number }[]>([
    { description: '', quantity: 1, rate: 0 },
  ]);
  
  // Available years
  const years = useMemo(() => {
    const allYears = new Set(invoices.map(i => new Date(i.issue_date).getFullYear()));
    allYears.add(new Date().getFullYear());
    return Array.from(allYears).sort((a, b) => b - a);
  }, [invoices]);
  
  // Filter invoices
  const filteredInvoices = useMemo(() => {
    return invoices
      .filter(i => new Date(i.issue_date).getFullYear() === filterYear)
      .filter(i => !filterStatus || i.status === filterStatus)
      .filter(i => {
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          return (
            i.invoice_number.toLowerCase().includes(query) ||
            i.client?.name?.toLowerCase().includes(query)
          );
        }
        return true;
      })
      .sort((a, b) => new Date(b.issue_date).getTime() - new Date(a.issue_date).getTime());
  }, [invoices, filterYear, filterStatus, searchQuery]);
  
  // Calculate summary
  const yearInvoices = invoices.filter(i => new Date(i.issue_date).getFullYear() === filterYear);
  const totalIncome = yearInvoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.total_amount, 0);
  const totalOutstanding = yearInvoices.filter(i => i.status === 'unpaid' || i.status === 'overdue').reduce((sum, i) => sum + i.total_amount, 0);
  
  // Calculate form totals
  const formSubtotal = formLineItems.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
  const { tpsAmount, tvqAmount, totalAmount } = calculateInvoiceTotals(
    formSubtotal,
    formApplyTps,
    formApplyTvq,
    team?.tps_rate || 0.05,
    team?.tvq_rate || 0.09975
  );
  
  // Generate next invoice number
  const getNextInvoiceNumber = () => {
    const yearInvoices = invoices.filter(i => 
      new Date(i.issue_date).getFullYear() === new Date().getFullYear()
    );
    const maxNumber = yearInvoices.reduce((max, i) => {
      const num = parseInt(i.invoice_number.replace(/\D/g, ''));
      return num > max ? num : max;
    }, 0);
    return String(maxNumber + 1).padStart(4, '0');
  };
  
  const handleNewInvoice = () => {
    setEditingInvoice(null);
    setFormClientId('');
    setFormIssueDate(new Date().toISOString().split('T')[0]);
    setFormDueDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    setFormNotes('');
    setFormApplyTps(true);
    setFormApplyTvq(true);
    setFormLineItems([{ description: '', quantity: 1, rate: 0 }]);
    setIsModalOpen(true);
  };
  
  const handleEditInvoice = (invoice: Invoice) => {
    setEditingInvoice(invoice);
    setFormClientId(invoice.client_id || '');
    setFormIssueDate(invoice.issue_date.split('T')[0]);
    setFormDueDate(invoice.due_date.split('T')[0]);
    setFormNotes(invoice.notes);
    setFormApplyTps(invoice.apply_tps);
    setFormApplyTvq(invoice.apply_tvq);
    // We'd need to fetch line items here - for now just set empty
    setFormLineItems([{ description: '', quantity: 1, rate: 0 }]);
    setIsModalOpen(true);
  };
  
  const addLineItem = () => {
    setFormLineItems([...formLineItems, { description: '', quantity: 1, rate: 0 }]);
  };
  
  const removeLineItem = (index: number) => {
    if (formLineItems.length > 1) {
      setFormLineItems(formLineItems.filter((_, i) => i !== index));
    }
  };
  
  const updateLineItem = (index: number, field: string, value: string | number) => {
    const updated = [...formLineItems];
    updated[index] = { ...updated[index], [field]: value };
    setFormLineItems(updated);
  };
  
  const handleSaveInvoice = async () => {
    if (!team?.id) return;
    
    setIsLoading(true);
    setError(null);
    
    const supabase = getSupabaseClient();
    
    try {
      const invoiceData = {
        team_id: team.id,
        client_id: formClientId || null,
        invoice_number: editingInvoice?.invoice_number || getNextInvoiceNumber(),
        subtotal: formSubtotal,
        tps_amount: tpsAmount,
        tvq_amount: tvqAmount,
        total_amount: totalAmount,
        apply_tps: formApplyTps,
        apply_tvq: formApplyTvq,
        status: 'unpaid' as InvoiceStatus,
        issue_date: formIssueDate,
        due_date: formDueDate,
        notes: formNotes,
        client_visible: true,
      };
      
      if (editingInvoice) {
        const { data, error } = await supabase
          .from('invoices')
          .update({ ...invoiceData, updated_at: new Date().toISOString() })
          .eq('id', editingInvoice.id)
          .select('*, client:clients(*)')
          .single();
        
        if (error) throw error;
        if (data) updateInvoice(data);
      } else {
        const invoiceId = generateUUID();
        const { data, error } = await supabase
          .from('invoices')
          .insert({ ...invoiceData, id: invoiceId })
          .select('*, client:clients(*)')
          .single();
        
        if (error) throw error;
        
        // Insert line items
        if (formLineItems.length > 0) {
          const lineItems = formLineItems
            .filter(item => item.description.trim())
            .map((item, index) => ({
              id: generateUUID(),
              invoice_id: invoiceId,
              description: item.description,
              quantity: item.quantity,
              rate: item.rate,
              amount: item.quantity * item.rate,
              sort_order: index,
            }));
          
          if (lineItems.length > 0) {
            await supabase.from('invoice_line_items').insert(lineItems);
          }
        }
        
        if (data) addInvoice(data);
      }
      
      setIsModalOpen(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleMarkPaid = async (invoice: Invoice) => {
    const supabase = getSupabaseClient();
    
    try {
      const { data, error } = await supabase
        .from('invoices')
        .update({ status: 'paid', paid_date: new Date().toISOString(), updated_at: new Date().toISOString() })
        .eq('id', invoice.id)
        .select('*, client:clients(*)')
        .single();
      
      if (error) throw error;
      if (data) updateInvoice(data);
    } catch (err: any) {
      setError(err.message);
    }
  };
  
  const handleDeleteInvoice = async (invoice: Invoice) => {
    if (!confirm('Are you sure you want to delete this invoice?')) return;
    
    const supabase = getSupabaseClient();
    
    try {
      const { error } = await supabase.from('invoices').delete().eq('id', invoice.id);
      if (error) throw error;
      removeInvoice(invoice.id);
    } catch (err: any) {
      setError(err.message);
    }
  };
  
  const getStatusBadge = (status: InvoiceStatus) => {
    const colors: Record<InvoiceStatus, string> = {
      draft: 'gray',
      unpaid: 'orange',
      paid: 'green',
      overdue: 'red',
      cancelled: 'gray',
    };
    return <Badge color={colors[status]}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>;
  };
  
  return (
    <div className="space-y-6">
      <PageHeader
        title="Invoices"
        subtitle={`${filteredInvoices.length} invoices in ${filterYear}`}
        actions={
          <Button onClick={handleNewInvoice}>
            <Plus className="w-4 h-4 mr-2" />
            New Invoice
          </Button>
        }
      />
      
      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <SummaryCard
          title="Total Income"
          value={totalIncome}
          icon={<TrendingUp className="w-5 h-5" />}
          variant="success"
        />
        <SummaryCard
          title="Outstanding"
          value={totalOutstanding}
          icon={<Clock className="w-5 h-5" />}
          variant={totalOutstanding > 0 ? 'warning' : 'default'}
        />
        <SummaryCard
          title="Total Invoices"
          value={yearInvoices.length.toString()}
          subtitle={`${yearInvoices.filter(i => i.status === 'paid').length} paid`}
          icon={<FileText className="w-5 h-5" />}
        />
      </div>
      
      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <Select
          value={filterYear.toString()}
          onChange={(e) => setFilterYear(parseInt(e.target.value))}
          options={years.map(y => ({ value: y.toString(), label: y.toString() }))}
          className="w-28"
        />
        
        <Select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as InvoiceStatus | '')}
          options={statusOptions}
          className="w-40"
        />
        
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <Input
            placeholder="Search invoices..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
      
      {/* Invoices Table */}
      {filteredInvoices.length > 0 ? (
        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Issue Date</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="w-10">&nbsp;</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell>
                    <span className="font-medium text-white">#{invoice.invoice_number}</span>
                  </TableCell>
                  <TableCell>{invoice.client?.name || '—'}</TableCell>
                  <TableCell>{formatDate(invoice.issue_date)}</TableCell>
                  <TableCell>{formatDate(invoice.due_date)}</TableCell>
                  <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                  <TableCell className="text-right font-medium text-white">
                    {formatCurrency(invoice.total_amount)}
                  </TableCell>
                  <TableCell>
                    <Dropdown trigger={<button className="p-1 hover:bg-dark-border rounded"><MoreHorizontal className="w-4 h-4 text-gray-400" /></button>} align="right">
                      <DropdownItem icon={<Pencil className="w-4 h-4" />} onClick={() => handleEditInvoice(invoice)}>Edit</DropdownItem>
                      {invoice.status !== 'paid' && (
                        <DropdownItem icon={<CheckCircle className="w-4 h-4" />} onClick={() => handleMarkPaid(invoice)}>Mark as Paid</DropdownItem>
                      )}
                      <DropdownItem icon={<Trash2 className="w-4 h-4" />} onClick={() => handleDeleteInvoice(invoice)} danger>Delete</DropdownItem>
                    </Dropdown>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      ) : (
        <Card className="p-12">
          <EmptyState
            icon={<FileText className="w-12 h-12" />}
            title="No invoices yet"
            description="Create your first invoice to get started"
            action={<Button onClick={handleNewInvoice}><Plus className="w-4 h-4 mr-2" />New Invoice</Button>}
          />
        </Card>
      )}
      
      {/* Add/Edit Modal */}
      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingInvoice ? 'Edit Invoice' : 'New Invoice'} size="xl">
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Client"
              value={formClientId}
              onChange={(e) => setFormClientId(e.target.value)}
              options={[{ value: '', label: 'Select client' }, ...clients.map(c => ({ value: c.id, label: c.name }))]}
            />
            <div></div>
            <Input type="date" label="Issue Date" value={formIssueDate} onChange={(e) => setFormIssueDate(e.target.value)} />
            <Input type="date" label="Due Date" value={formDueDate} onChange={(e) => setFormDueDate(e.target.value)} />
          </div>
          
          {/* Line Items */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-gray-400">Line Items</h4>
              <Button variant="ghost" size="sm" onClick={addLineItem}><Plus className="w-3 h-3 mr-1" />Add Item</Button>
            </div>
            
            <div className="space-y-2">
              {formLineItems.map((item, index) => (
                <div key={index} className="flex gap-2 items-start">
                  <div className="flex-1">
                    <Input placeholder="Description" value={item.description} onChange={(e) => updateLineItem(index, 'description', e.target.value)} />
                  </div>
                  <div className="w-24">
                    <Input type="number" placeholder="Qty" value={item.quantity} onChange={(e) => updateLineItem(index, 'quantity', parseFloat(e.target.value) || 0)} />
                  </div>
                  <div className="w-32">
                    <Input type="number" placeholder="Rate" value={item.rate} onChange={(e) => updateLineItem(index, 'rate', parseFloat(e.target.value) || 0)} />
                  </div>
                  <div className="w-32 py-2 text-right text-white font-medium">
                    {formatCurrency(item.quantity * item.rate)}
                  </div>
                  <button onClick={() => removeLineItem(index)} className="p-2 text-gray-500 hover:text-error">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
          
          {/* Taxes */}
          <div className="flex gap-6">
            <Checkbox checked={formApplyTps} onChange={setFormApplyTps} label={`Apply TPS (${((team?.tps_rate || 0.05) * 100).toFixed(2)}%)`} />
            <Checkbox checked={formApplyTvq} onChange={setFormApplyTvq} label={`Apply TVQ (${((team?.tvq_rate || 0.09975) * 100).toFixed(3)}%)`} />
          </div>
          
          {/* Totals */}
          <div className="border-t border-dark-border pt-4 space-y-2 text-right">
            <div className="flex justify-end gap-8"><span className="text-gray-500">Subtotal:</span><span className="text-white w-32">{formatCurrency(formSubtotal)}</span></div>
            {formApplyTps && <div className="flex justify-end gap-8"><span className="text-gray-500">TPS:</span><span className="text-white w-32">{formatCurrency(tpsAmount)}</span></div>}
            {formApplyTvq && <div className="flex justify-end gap-8"><span className="text-gray-500">TVQ:</span><span className="text-white w-32">{formatCurrency(tvqAmount)}</span></div>}
            <div className="flex justify-end gap-8 text-lg font-bold"><span className="text-gray-400">Total:</span><span className="text-white w-32">{formatCurrency(totalAmount)}</span></div>
          </div>
          
          <Textarea label="Notes" placeholder="Add any notes..." value={formNotes} onChange={(e) => setFormNotes(e.target.value)} rows={2} />
          
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveInvoice} loading={isLoading}>
              {editingInvoice ? 'Save Changes' : 'Create Invoice'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
