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
  FilterPills,
  Dropdown,
  DropdownItem,
  Alert,
  Loading,
} from '@/components/ui';
import { formatDate, formatRelativeDate, cn, generateUUID } from '@/lib/utils';
import type { Project, Client, ProjectStatus, ProjectType } from '@/types';
import {
  Plus,
  Search,
  FolderKanban,
  MoreHorizontal,
  Pencil,
  Trash2,
  Archive,
  ArchiveRestore,
  Calendar,
  User,
  Filter,
} from 'lucide-react';

export default function ProjectsPage() {
  const { team } = useAuthStore();
  const { 
    projects, 
    clients, 
    projectStatuses, 
    projectTypes,
    addProject,
    updateProject,
    removeProject,
    fetchProjects,
  } = useDataStore();
  
  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [formName, setFormName] = useState('');
  const [formClientId, setFormClientId] = useState('');
  const [formStatusId, setFormStatusId] = useState('');
  const [formTypeId, setFormTypeId] = useState('');
  const [formDeadline, setFormDeadline] = useState('');
  const [formNotes, setFormNotes] = useState('');
  
  // Filter projects
  const filteredProjects = useMemo(() => {
    return projects
      .filter(p => p.is_archived === showArchived)
      .filter(p => {
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          return (
            p.name.toLowerCase().includes(query) ||
            p.client?.name?.toLowerCase().includes(query)
          );
        }
        return true;
      })
      .filter(p => !filterStatus || p.status_id === filterStatus)
      .filter(p => !filterType || p.project_type_id === filterType)
      .sort((a, b) => {
        // Sort by deadline, then by created date
        if (a.deadline && b.deadline) {
          return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
        }
        if (a.deadline) return -1;
        if (b.deadline) return 1;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
  }, [projects, showArchived, searchQuery, filterStatus, filterType]);
  
  // Open modal for new project
  const handleNewProject = () => {
    setEditingProject(null);
    setFormName('');
    setFormClientId('');
    setFormStatusId(projectStatuses.find(s => s.is_default)?.id || '');
    setFormTypeId('');
    setFormDeadline('');
    setFormNotes('');
    setIsModalOpen(true);
  };
  
  // Open modal for editing
  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setFormName(project.name);
    setFormClientId(project.client_id || '');
    setFormStatusId(project.status_id || '');
    setFormTypeId(project.project_type_id || '');
    setFormDeadline(project.deadline ? project.deadline.split('T')[0] : '');
    setFormNotes(project.notes || '');
    setIsModalOpen(true);
  };
  
  // Save project
  const handleSaveProject = async () => {
    if (!team?.id || !formName.trim()) return;
    
    setIsLoading(true);
    setError(null);
    
    const supabase = getSupabaseClient();
    
    try {
      const projectData = {
        name: formName.trim(),
        client_id: formClientId || null,
        status_id: formStatusId || null,
        project_type_id: formTypeId || null,
        deadline: formDeadline || null,
        notes: formNotes,
        team_id: team.id,
        is_archived: false,
        client_visible: true,
      };
      
      if (editingProject) {
        // Update
        const { data, error } = await supabase
          .from('projects')
          .update({ ...projectData, updated_at: new Date().toISOString() })
          .eq('id', editingProject.id)
          .select('*, client:clients(*), status:project_statuses(*), project_type:project_types(*)')
          .single();
        
        if (error) throw error;
        if (data) updateProject(data);
      } else {
        // Create
        const { data, error } = await supabase
          .from('projects')
          .insert({ ...projectData, id: generateUUID() })
          .select('*, client:clients(*), status:project_statuses(*), project_type:project_types(*)')
          .single();
        
        if (error) throw error;
        if (data) addProject(data);
      }
      
      setIsModalOpen(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Archive/Unarchive project
  const handleToggleArchive = async (project: Project) => {
    const supabase = getSupabaseClient();
    
    try {
      const { data, error } = await supabase
        .from('projects')
        .update({
          is_archived: !project.is_archived,
          archived_at: !project.is_archived ? new Date().toISOString() : null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', project.id)
        .select('*, client:clients(*), status:project_statuses(*), project_type:project_types(*)')
        .single();
      
      if (error) throw error;
      if (data) updateProject(data);
    } catch (err: any) {
      setError(err.message);
    }
  };
  
  // Delete project
  const handleDeleteProject = async (project: Project) => {
    if (!confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      return;
    }
    
    const supabase = getSupabaseClient();
    
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', project.id);
      
      if (error) throw error;
      removeProject(project.id);
    } catch (err: any) {
      setError(err.message);
    }
  };
  
  return (
    <div className="space-y-6">
      <PageHeader
        title="Projects"
        subtitle={`${filteredProjects.length} ${showArchived ? 'archived' : 'active'} projects`}
        actions={
          <Button onClick={handleNewProject}>
            <Plus className="w-4 h-4 mr-2" />
            New Project
          </Button>
        }
      />
      
      {error && (
        <Alert type="error" message={error} onClose={() => setError(null)} />
      )}
      
      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <Input
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <FilterPills
          options={[
            { value: 'active', label: 'Active' },
            { value: 'archived', label: 'Archived' },
          ]}
          selected={showArchived ? 'archived' : 'active'}
          onChange={(value) => setShowArchived(value === 'archived')}
          allowAll={false}
        />
        
        <Select
          value={filterStatus || ''}
          onChange={(e) => setFilterStatus(e.target.value || null)}
          options={[
            { value: '', label: 'All Statuses' },
            ...projectStatuses.map(s => ({ value: s.id, label: s.name })),
          ]}
          className="w-40"
        />
        
        <Select
          value={filterType || ''}
          onChange={(e) => setFilterType(e.target.value || null)}
          options={[
            { value: '', label: 'All Types' },
            ...projectTypes.map(t => ({ value: t.id, label: t.name })),
          ]}
          className="w-40"
        />
      </div>
      
      {/* Projects Table */}
      {filteredProjects.length > 0 ? (
        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Deadline</TableHead>
                <TableHead className="w-10">&nbsp;</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProjects.map((project) => (
                <TableRow 
                  key={project.id} 
                  onClick={() => handleEditProject(project)}
                  className="cursor-pointer"
                >
                  <TableCell>
                    <div>
                      <p className="font-medium text-white">{project.name}</p>
                      {project.notes && (
                        <p className="text-xs text-gray-500 truncate max-w-xs">{project.notes}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {project.client ? (
                      <div className="flex items-center gap-2">
                        <User className="w-3 h-3 text-gray-500" />
                        <span>{project.client.name}</span>
                      </div>
                    ) : (
                      <span className="text-gray-500">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {project.status ? (
                      <Badge color={project.status.color}>{project.status.name}</Badge>
                    ) : (
                      <span className="text-gray-500">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {project.project_type ? (
                      <Badge color={project.project_type.color}>{project.project_type.name}</Badge>
                    ) : (
                      <span className="text-gray-500">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {project.deadline ? (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3 h-3 text-gray-500" />
                        <span className={cn(
                          new Date(project.deadline) < new Date() && !project.is_archived && 'text-error'
                        )}>
                          {formatRelativeDate(project.deadline)}
                        </span>
                      </div>
                    ) : (
                      <span className="text-gray-500">—</span>
                    )}
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Dropdown
                      trigger={
                        <button className="p-1 hover:bg-dark-border rounded">
                          <MoreHorizontal className="w-4 h-4 text-gray-400" />
                        </button>
                      }
                      align="right"
                    >
                      <DropdownItem icon={<Pencil className="w-4 h-4" />} onClick={() => handleEditProject(project)}>
                        Edit
                      </DropdownItem>
                      <DropdownItem
                        icon={project.is_archived ? <ArchiveRestore className="w-4 h-4" /> : <Archive className="w-4 h-4" />}
                        onClick={() => handleToggleArchive(project)}
                      >
                        {project.is_archived ? 'Unarchive' : 'Archive'}
                      </DropdownItem>
                      <DropdownItem icon={<Trash2 className="w-4 h-4" />} onClick={() => handleDeleteProject(project)} danger>
                        Delete
                      </DropdownItem>
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
            icon={<FolderKanban className="w-12 h-12" />}
            title={showArchived ? 'No archived projects' : 'No projects yet'}
            description={showArchived ? 'Archived projects will appear here' : 'Create your first project to get started'}
            action={
              !showArchived && (
                <Button onClick={handleNewProject}>
                  <Plus className="w-4 h-4 mr-2" />
                  New Project
                </Button>
              )
            }
          />
        </Card>
      )}
      
      {/* Add/Edit Modal */}
      <Modal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProject ? 'Edit Project' : 'New Project'}
        size="md"
      >
        <div className="space-y-4">
          <Input
            label="Project Name"
            placeholder="Enter project name"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            required
          />
          
          <Select
            label="Client"
            value={formClientId}
            onChange={(e) => setFormClientId(e.target.value)}
            options={[
              { value: '', label: 'No client' },
              ...clients.map(c => ({ value: c.id, label: c.name })),
            ]}
          />
          
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Status"
              value={formStatusId}
              onChange={(e) => setFormStatusId(e.target.value)}
              options={[
                { value: '', label: 'No status' },
                ...projectStatuses.map(s => ({ value: s.id, label: s.name })),
              ]}
            />
            
            <Select
              label="Type"
              value={formTypeId}
              onChange={(e) => setFormTypeId(e.target.value)}
              options={[
                { value: '', label: 'No type' },
                ...projectTypes.map(t => ({ value: t.id, label: t.name })),
              ]}
            />
          </div>
          
          <Input
            type="date"
            label="Deadline"
            value={formDeadline}
            onChange={(e) => setFormDeadline(e.target.value)}
          />
          
          <Textarea
            label="Notes"
            placeholder="Add any notes about this project..."
            value={formNotes}
            onChange={(e) => setFormNotes(e.target.value)}
            rows={3}
          />
          
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveProject} loading={isLoading} disabled={!formName.trim()}>
              {editingProject ? 'Save Changes' : 'Create Project'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
