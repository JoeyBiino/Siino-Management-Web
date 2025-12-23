'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuthStore, useUIStore } from '@/lib/store';
import { Avatar } from '@/components/ui';
import {
  LayoutGrid,
  Users,
  FolderKanban,
  FileText,
  CreditCard,
  CheckSquare,
  Calendar,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Moon,
  Sun,
  Menu,
} from 'lucide-react';

const navigation = [
  { name: 'Overview', href: '/dashboard', icon: LayoutGrid },
  { name: 'Projects', href: '/dashboard/projects', icon: FolderKanban },
  { name: 'Clients', href: '/dashboard/clients', icon: Users },
  { name: 'Invoices', href: '/dashboard/invoices', icon: FileText },
  { name: 'Expenses', href: '/dashboard/expenses', icon: CreditCard },
  { name: 'Tasks', href: '/dashboard/tasks', icon: CheckSquare },
  { name: 'Bookings', href: '/dashboard/bookings', icon: Calendar },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, team, signOut } = useAuthStore();
  const { sidebarOpen, toggleSidebar, theme, toggleTheme } = useUIStore();
  
  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/login';
  };
  
  return (
    <>
      {/* Mobile menu button */}
      <button
        className="fixed top-4 left-4 z-50 p-2 rounded-button bg-dark-surface border border-dark-border lg:hidden"
        onClick={toggleSidebar}
      >
        <Menu className="w-5 h-5 text-gray-400" />
      </button>
      
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}
      
      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-40 h-screen bg-dark-surface border-r border-dark-border transition-all duration-300',
          sidebarOpen ? 'w-64' : 'w-20',
          'lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className={cn(
            'flex items-center h-16 px-4 border-b border-dark-border',
            sidebarOpen ? 'justify-between' : 'justify-center'
          )}>
            {sidebarOpen ? (
              <>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-accent-dark flex items-center justify-center">
                    <span className="text-white font-bold text-sm">S</span>
                  </div>
                  <div>
                    <h1 className="font-semibold text-white text-sm">Siino</h1>
                    <p className="text-xs text-gray-500 truncate max-w-[140px]">{team?.name || 'Management'}</p>
                  </div>
                </div>
                <button
                  onClick={toggleSidebar}
                  className="p-1.5 rounded-button hover:bg-dark-border text-gray-500 hover:text-white hidden lg:block"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </>
            ) : (
              <button
                onClick={toggleSidebar}
                className="p-1.5 rounded-button hover:bg-dark-border text-gray-500 hover:text-white"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href || 
                (item.href !== '/dashboard' && pathname.startsWith(item.href));
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150',
                    isActive
                      ? 'bg-accent/15 text-accent'
                      : 'text-gray-400 hover:text-white hover:bg-dark-border',
                    !sidebarOpen && 'justify-center px-2'
                  )}
                  title={!sidebarOpen ? item.name : undefined}
                >
                  <Icon className={cn('flex-shrink-0', sidebarOpen ? 'w-5 h-5' : 'w-6 h-6')} />
                  {sidebarOpen && (
                    <span className="text-sm font-medium">{item.name}</span>
                  )}
                </Link>
              );
            })}
          </nav>
          
          {/* Footer */}
          <div className="p-3 border-t border-dark-border space-y-2">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className={cn(
                'flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-gray-400 hover:text-white hover:bg-dark-border transition-all',
                !sidebarOpen && 'justify-center px-2'
              )}
            >
              {theme === 'dark' ? (
                <Sun className={cn(sidebarOpen ? 'w-5 h-5' : 'w-6 h-6')} />
              ) : (
                <Moon className={cn(sidebarOpen ? 'w-5 h-5' : 'w-6 h-6')} />
              )}
              {sidebarOpen && (
                <span className="text-sm font-medium">
                  {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                </span>
              )}
            </button>
            
            {/* User section */}
            {sidebarOpen ? (
              <div className="flex items-center justify-between px-3 py-2">
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar
                    name={user?.full_name || user?.email || 'User'}
                    size="sm"
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {user?.full_name || 'User'}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {user?.email}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleSignOut}
                  className="p-1.5 rounded-button text-gray-500 hover:text-error hover:bg-error/10 transition-colors"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleSignOut}
                className="flex items-center justify-center w-full p-2.5 rounded-lg text-gray-400 hover:text-error hover:bg-error/10 transition-all"
                title="Sign out"
              >
                <LogOut className="w-6 h-6" />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}

// Page header component
interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-bold text-white">{title}</h1>
        {subtitle && (
          <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-2">
          {actions}
        </div>
      )}
    </div>
  );
}
