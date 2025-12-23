'use client';

import React from 'react';
import { PageHeader } from '@/components/layout/Sidebar';
import { Card, EmptyState, Button } from '@/components/ui';
import { CheckSquare, Plus } from 'lucide-react';

export default function TasksPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Tasks"
        subtitle="Manage your to-do list"
        actions={
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Task
          </Button>
        }
      />
      
      <Card className="p-12">
        <EmptyState
          icon={<CheckSquare className="w-12 h-12" />}
          title="Tasks coming soon"
          description="This page is under construction. Full task management will be available soon."
        />
      </Card>
    </div>
  );
}
