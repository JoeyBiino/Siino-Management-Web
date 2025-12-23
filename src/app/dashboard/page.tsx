'use client';

import React from 'react';
import Link from 'next/link';
import { useAuthStore, useDataStore } from '@/lib/store';
import { PageHeader } from '@/components/layout/Sidebar';
import { Card, SummaryCard, Badge, Button, EmptyState } from '@/components/ui';
import { formatCurrency, formatDate, formatRelativeDate, getStatusColor } from '@/lib/utils';
import {
  FolderKanban,
  Users,
  FileText,
  CreditCard,
  Calendar,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
} from 'lucide-react';

export default function DashboardPage() {
  const { user, team } = useAuthStore();
  const { projects, clients, invoices, expenses, tasks, bookings } = useDataStore();
  
  // Calculate stats
  const activeProjects = projects.filter(p => !p.is_archived);
  const recentProjects = activeProjects.slice(0, 5);
  
  const currentYear = new Date().getFullYear();
  const yearInvoices = invoices.filter(i => 
    new Date(i.issue_date).getFullYear() === currentYear
  );
  const paidInvoices = yearInvoices.filter(i => i.status === 'paid');
  const unpaidInvoices = yearInvoices.filter(i => i.status === 'unpaid' || i.status === 'overdue');
  const totalIncome = paidInvoices.reduce((sum, i) => sum + i.total_amount, 0);
  const totalOutstanding = unpaidInvoices.reduce((sum, i) => sum + i.total_amount, 0);
  
  const yearExpenses = expenses.filter(e => 
    new Date(e.date).getFullYear() === currentYear
  );
  const totalExpenses = yearExpenses.reduce((sum, e) => sum + e.amount, 0);
  
  const pendingTasks = tasks.filter(t => !t.completed_at);
  const upcomingBookings = bookings.filter(b => 
    new Date(b.start_time) > new Date() && b.status !== 'cancelled'
  ).slice(0, 5);
  
  // Greeting based on time
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">
          {greeting}, {user?.full_name?.split(' ')[0] || 'there'}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Here&apos;s what&apos;s happening with {team?.name} today
        </p>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          title="Total Income"
          value={totalIncome}
          subtitle={`${paidInvoices.length} paid invoices`}
          icon={<TrendingUp className="w-5 h-5" />}
          variant="success"
        />
        <SummaryCard
          title="Outstanding"
          value={totalOutstanding}
          subtitle={`${unpaidInvoices.length} unpaid invoices`}
          icon={<Clock className="w-5 h-5" />}
          variant={totalOutstanding > 0 ? 'warning' : 'default'}
        />
        <SummaryCard
          title="Expenses"
          value={totalExpenses}
          subtitle={`${yearExpenses.length} this year`}
          icon={<TrendingDown className="w-5 h-5" />}
        />
        <SummaryCard
          title="Net Income"
          value={totalIncome - totalExpenses}
          subtitle={`${currentYear} YTD`}
          icon={<CreditCard className="w-5 h-5" />}
          variant={totalIncome - totalExpenses > 0 ? 'success' : 'error'}
        />
      </div>
      
      {/* Quick Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Link href="/dashboard/projects">
          <Card className="p-4 hover:border-accent/50 transition-colors cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/15 flex items-center justify-center">
                <FolderKanban className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{activeProjects.length}</p>
                <p className="text-xs text-gray-500">Active Projects</p>
              </div>
            </div>
          </Card>
        </Link>
        
        <Link href="/dashboard/clients">
          <Card className="p-4 hover:border-accent/50 transition-colors cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/15 flex items-center justify-center">
                <Users className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{clients.length}</p>
                <p className="text-xs text-gray-500">Clients</p>
              </div>
            </div>
          </Card>
        </Link>
        
        <Link href="/dashboard/tasks">
          <Card className="p-4 hover:border-accent/50 transition-colors cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-500/15 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{pendingTasks.length}</p>
                <p className="text-xs text-gray-500">Pending Tasks</p>
              </div>
            </div>
          </Card>
        </Link>
        
        <Link href="/dashboard/bookings">
          <Card className="p-4 hover:border-accent/50 transition-colors cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500/15 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{upcomingBookings.length}</p>
                <p className="text-xs text-gray-500">Upcoming Bookings</p>
              </div>
            </div>
          </Card>
        </Link>
      </div>
      
      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Projects */}
        <Card className="p-0 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-dark-border">
            <h3 className="font-semibold text-white">Recent Projects</h3>
            <Link href="/dashboard/projects">
              <Button variant="ghost" size="sm">
                View all <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </Link>
          </div>
          
          {recentProjects.length > 0 ? (
            <div className="divide-y divide-dark-border/50">
              {recentProjects.map((project) => (
                <div key={project.id} className="px-4 py-3 hover:bg-dark-surface-secondary transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-white">{project.name}</p>
                      <p className="text-xs text-gray-500">{project.client?.name || 'No client'}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {project.status && (
                        <Badge color={project.status.color}>{project.status.name}</Badge>
                      )}
                      {project.deadline && (
                        <span className="text-xs text-gray-500">
                          {formatRelativeDate(project.deadline)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8">
              <EmptyState
                icon={<FolderKanban className="w-10 h-10" />}
                title="No projects yet"
                description="Create your first project to get started"
                action={
                  <Link href="/dashboard/projects">
                    <Button size="sm">
                      <Plus className="w-4 h-4 mr-1" /> New Project
                    </Button>
                  </Link>
                }
              />
            </div>
          )}
        </Card>
        
        {/* Unpaid Invoices */}
        <Card className="p-0 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-dark-border">
            <h3 className="font-semibold text-white">Unpaid Invoices</h3>
            <Link href="/dashboard/invoices">
              <Button variant="ghost" size="sm">
                View all <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </Link>
          </div>
          
          {unpaidInvoices.length > 0 ? (
            <div className="divide-y divide-dark-border/50">
              {unpaidInvoices.slice(0, 5).map((invoice) => (
                <div key={invoice.id} className="px-4 py-3 hover:bg-dark-surface-secondary transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-white">#{invoice.invoice_number}</p>
                      <p className="text-xs text-gray-500">{invoice.client?.name || 'No client'}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-white">{formatCurrency(invoice.total_amount)}</p>
                      <p className="text-xs text-gray-500">Due {formatRelativeDate(invoice.due_date)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8">
              <EmptyState
                icon={<CheckCircle className="w-10 h-10 text-success" />}
                title="All caught up!"
                description="No unpaid invoices at the moment"
              />
            </div>
          )}
        </Card>
      </div>
      
      {/* Upcoming Bookings */}
      {upcomingBookings.length > 0 && (
        <Card className="p-0 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-dark-border">
            <h3 className="font-semibold text-white">Upcoming Bookings</h3>
            <Link href="/dashboard/bookings">
              <Button variant="ghost" size="sm">
                View all <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </Link>
          </div>
          
          <div className="divide-y divide-dark-border/50">
            {upcomingBookings.map((booking) => (
              <div key={booking.id} className="px-4 py-3 hover:bg-dark-surface-secondary transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-accent/15 flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <p className="font-medium text-white">{booking.title}</p>
                      <p className="text-xs text-gray-500">
                        {booking.client?.name || booking.guest_name || 'Guest'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-white">{formatDate(booking.start_time, 'MMM d')}</p>
                    <p className="text-xs text-gray-500">{formatDate(booking.start_time, 'h:mm a')}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
