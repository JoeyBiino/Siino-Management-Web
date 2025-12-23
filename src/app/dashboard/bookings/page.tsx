'use client';

import React from 'react';
import { PageHeader } from '@/components/layout/Sidebar';
import { Card, EmptyState, Button } from '@/components/ui';
import { Calendar, Plus } from 'lucide-react';

export default function BookingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Bookings"
        subtitle="Manage appointments and schedules"
        actions={
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Booking
          </Button>
        }
      />
      
      <Card className="p-12">
        <EmptyState
          icon={<Calendar className="w-12 h-12" />}
          title="Bookings coming soon"
          description="This page is under construction. Full booking management will be available soon."
        />
      </Card>
    </div>
  );
}
