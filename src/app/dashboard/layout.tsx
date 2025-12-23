'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore, useDataStore, useUIStore } from '@/lib/store';
import { Sidebar } from '@/components/layout/Sidebar';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, team, isInitialized, initialize } = useAuthStore();
  const { fetchAll, isLoading: dataLoading } = useDataStore();
  const { sidebarOpen } = useUIStore();
  
  // Initialize auth
  useEffect(() => {
    initialize();
  }, [initialize]);
  
  // Fetch data when team is available
  useEffect(() => {
    if (team?.id) {
      fetchAll(team.id);
    }
  }, [team?.id, fetchAll]);
  
  // Handle auth redirects
  useEffect(() => {
    if (isInitialized) {
      if (!user) {
        router.push('/login');
      } else if (!team) {
        router.push('/setup');
      }
    }
  }, [isInitialized, user, team, router]);
  
  // Show loading while initializing
  if (!isInitialized || !user || !team) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-accent mx-auto mb-4" />
          <p className="text-sm text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-dark-bg">
      <Sidebar />
      
      {/* Main content */}
      <main
        className={cn(
          'min-h-screen transition-all duration-300',
          sidebarOpen ? 'lg:pl-64' : 'lg:pl-20',
          'pt-16 lg:pt-0' // Account for mobile header
        )}
      >
        <div className="p-6 lg:p-8">
          {dataLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin text-accent mx-auto mb-4" />
                <p className="text-sm text-gray-500">Loading your data...</p>
              </div>
            </div>
          ) : (
            children
          )}
        </div>
      </main>
    </div>
  );
}
