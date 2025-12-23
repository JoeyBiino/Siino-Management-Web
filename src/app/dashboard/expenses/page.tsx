'use client';

import React from 'react';
import { PageHeader } from '@/components/layout/Sidebar';
import { Card, EmptyState, Button } from '@/components/ui';
import { CreditCard, Plus } from 'lucide-react';

export default function ExpensesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Expenses"
        subtitle="Track your business expenses"
        actions={
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Expense
          </Button>
        }
      />
      
      <Card className="p-12">
        <EmptyState
          icon={<CreditCard className="w-12 h-12" />}
          title="Expenses coming soon"
          description="This page is under construction. Full expense tracking will be available soon."
        />
      </Card>
    </div>
  );
}
