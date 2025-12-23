// =============================================================================
// Siino Management - TypeScript Types
// Converted from Swift models in SupabaseModels.swift and BookingModels.swift
// =============================================================================

// MARK: - User

export interface SupabaseUser {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

// MARK: - Team

export interface Team {
  id: string;
  name: string;
  slug: string;
  owner_id: string;
  
  // Billing settings
  billing_name: string;
  billing_address: string;
  billing_city: string;
  billing_province: string;
  billing_postal_code: string;
  billing_phone: string;
  tps_number: string;
  tvq_number: string;
  tps_rate: number;
  tvq_rate: number;
  
  // Google Drive
  google_drive_folder_id?: string;
  
  // Branding
  logo_url?: string;
  primary_color: string;
  
  created_at: string;
  updated_at: string;
}

// MARK: - Team Role

export type TeamRole = 'owner' | 'admin' | 'member' | 'viewer';

export const TeamRolePermissions: Record<TeamRole, { canEdit: boolean; canDelete: boolean; canInvite: boolean }> = {
  owner: { canEdit: true, canDelete: true, canInvite: true },
  admin: { canEdit: true, canDelete: true, canInvite: true },
  member: { canEdit: true, canDelete: false, canInvite: false },
  viewer: { canEdit: false, canDelete: false, canInvite: false },
};

// MARK: - Team Member

export type InviteStatus = 'pending' | 'accepted' | 'declined' | 'expired';

export interface TeamMember {
  id: string;
  team_id: string;
  user_id?: string;
  role: TeamRole;
  
  // Invitation tracking
  invited_email?: string;
  invite_status: InviteStatus;
  invite_token?: string;
  invited_by?: string;
  invited_at?: string;
  accepted_at?: string;
  
  created_at?: string;
  updated_at?: string;
  
  // Joined data
  user?: SupabaseUser;
  team?: Team;
}

// MARK: - Project Status

export interface ProjectStatus {
  id: string;
  team_id: string;
  name: string;
  color: string;
  sort_order: number;
  is_default: boolean;
  created_at: string;
}

// MARK: - Project Type

export interface ProjectType {
  id: string;
  team_id: string;
  name: string;
  color: string;
  sort_order: number;
  created_at: string;
}

// MARK: - Client

export interface Client {
  id: string;
  team_id: string;
  
  name: string;
  email: string;
  phone: string;
  
  billing_name: string;
  address: string;
  city: string;
  province: string;
  postal_code: string;
  other_info: string;
  
  notes: string;
  charge_taxes_by_default: boolean;
  
  // Portal
  portal_enabled: boolean;
  portal_code?: string;
  
  created_at: string;
  updated_at: string;
}

// MARK: - Project

export interface Project {
  id: string;
  team_id: string;
  client_id?: string;
  
  name: string;
  status_id?: string;
  project_type_id?: string;
  deadline?: string;
  notes: string;
  
  is_archived: boolean;
  archived_at?: string;
  
  google_drive_folder_id?: string;
  client_visible: boolean;
  
  created_at: string;
  updated_at: string;
  
  // Joined data
  client?: Client;
  status?: ProjectStatus;
  project_type?: ProjectType;
}

// MARK: - Project Line Item

export interface ProjectLineItem {
  id: string;
  project_id: string;
  
  item_name: string;
  hours: number;
  rate: number;
  total: number;
  is_quantity_based: boolean;
  sort_order: number;
  
  created_at: string;
}

// MARK: - Invoice Status

export type InvoiceStatus = 'draft' | 'unpaid' | 'paid' | 'overdue' | 'cancelled';

export const InvoiceStatusColors: Record<InvoiceStatus, string> = {
  draft: 'gray',
  unpaid: 'orange',
  paid: 'green',
  overdue: 'red',
  cancelled: 'gray',
};

// MARK: - Invoice

export interface Invoice {
  id: string;
  team_id: string;
  client_id?: string;
  
  invoice_number: string;
  subtotal: number;
  tps_amount: number;
  tvq_amount: number;
  total_amount: number;
  apply_tps: boolean;
  apply_tvq: boolean;
  status: InvoiceStatus;
  issue_date: string;
  due_date: string;
  paid_date?: string;
  notes: string;
  pdf_path?: string;
  client_visible: boolean;
  
  created_at: string;
  updated_at: string;
  
  // Joined data
  client?: Client;
  line_items?: InvoiceLineItem[];
  invoice_projects?: InvoiceProject[];
}

// MARK: - Invoice Line Item

export interface InvoiceLineItem {
  id: string;
  invoice_id: string;
  
  description: string;
  quantity: number;
  rate: number;
  amount: number;
  sort_order: number;
  
  created_at: string;
}

// MARK: - Invoice Project

export interface InvoiceProject {
  id: string;
  invoice_id: string;
  project_id: string;
  
  created_at: string;
  
  // Joined data
  project?: Project;
}

// MARK: - Expense Frequency

export type ExpenseFrequency = 'once' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly';

// MARK: - Expense

export interface Expense {
  id: string;
  team_id: string;
  project_id?: string;
  
  name: string;
  amount: number;
  category: string;
  date: string;
  is_recurring: boolean;
  frequency: ExpenseFrequency;
  notes: string;
  
  created_at: string;
  updated_at: string;
  
  // Joined data
  project?: Project;
}

// MARK: - Task Status

export interface TaskStatus {
  id: string;
  team_id: string;
  name: string;
  color: string;
  sort_order: number;
  is_completed: boolean;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

// MARK: - Task Priority

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export const TaskPriorityColors: Record<TaskPriority, string> = {
  low: 'gray',
  medium: 'blue',
  high: 'orange',
  urgent: 'red',
};

export const TaskPrioritySortOrder: Record<TaskPriority, number> = {
  urgent: 0,
  high: 1,
  medium: 2,
  low: 3,
};

// MARK: - Task

export interface Task {
  id: string;
  team_id: string;
  project_id?: string;
  status_id?: string;
  assigned_to?: string;
  
  title: string;
  description: string;
  priority: TaskPriority;
  due_date?: string;
  completed_at?: string;
  
  is_client_visible: boolean;
  
  created_by?: string;
  created_at: string;
  updated_at: string;
  
  // Joined data
  project?: Project;
  status?: TaskStatus;
  assignee?: TeamMember;
}

// MARK: - Project File

export interface ProjectFile {
  id: string;
  project_id: string;
  
  name: string;
  google_drive_file_id: string;
  google_drive_web_link?: string;
  mime_type?: string;
  size_bytes?: number;
  is_client_visible: boolean;
  category: string;
  
  uploaded_by?: string;
  created_at: string;
}

// =============================================================================
// BOOKING SYSTEM TYPES
// =============================================================================

// MARK: - Booking Status

export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';

export const BookingStatusColors: Record<BookingStatus, string> = {
  pending: 'orange',
  confirmed: 'blue',
  completed: 'green',
  cancelled: 'gray',
  no_show: 'red',
};

// MARK: - Blocked Time Source

export type BlockedTimeSource = 'manual' | 'google_calendar' | 'booking';

// MARK: - Recurrence Type

export type RecurrenceType = 'daily' | 'weekly' | 'monthly';

// MARK: - Service Category

export interface ServiceCategory {
  id: string;
  team_id: string;
  
  name: string;
  description: string;
  color: string;
  sort_order: number;
  is_active: boolean;
  
  created_at: string;
  updated_at: string;
}

// MARK: - Service

export interface Service {
  id: string;
  team_id: string;
  category_id?: string;
  
  name: string;
  description: string;
  duration_minutes: number;
  price: number;
  
  // Booking rules
  lead_time_hours: number;
  buffer_minutes: number;
  max_advance_days: number;
  
  is_active: boolean;
  sort_order: number;
  
  created_at: string;
  updated_at: string;
  
  // Relationship
  category?: ServiceCategory;
}

// MARK: - Team Availability

export interface TeamAvailability {
  id: string;
  team_id: string;
  team_member_id?: string;
  
  day_of_week: number; // 0 = Sunday, 6 = Saturday
  start_time: string; // HH:mm format
  end_time: string;
  is_available: boolean;
  
  created_at: string;
  updated_at: string;
}

// MARK: - Blocked Time

export interface BlockedTime {
  id: string;
  team_id: string;
  team_member_id?: string;
  
  title: string;
  start_time: string;
  end_time: string;
  is_all_day: boolean;
  source: BlockedTimeSource;
  external_id?: string;
  notes: string;
  
  // Recurrence
  is_recurring: boolean;
  recurrence_type?: RecurrenceType;
  recurrence_end_date?: string;
  
  created_at: string;
  updated_at: string;
}

// MARK: - Booking

export interface Booking {
  id: string;
  team_id: string;
  service_id: string;
  client_id?: string;
  project_id?: string;
  assigned_to?: string;
  
  title: string;
  start_time: string;
  end_time: string;
  status: BookingStatus;
  
  // Guest info
  guest_name?: string;
  guest_email?: string;
  guest_phone?: string;
  
  // Notes
  notes: string;
  internal_notes: string;
  
  // Approval tracking
  confirmed_at?: string;
  confirmed_by?: string;
  
  // Cancellation tracking
  cancelled_at?: string;
  cancellation_reason?: string;
  
  created_at: string;
  updated_at: string;
  
  // Relationships
  service?: Service;
  client?: Client;
  project?: Project;
}

// =============================================================================
// HELPER TYPES
// =============================================================================

// Generic API response wrapper
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

// Pagination
export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  pageSize: number;
}

// For forms
export type CreateInput<T> = Omit<T, 'id' | 'created_at' | 'updated_at'>;
export type UpdateInput<T> = Partial<Omit<T, 'id' | 'team_id' | 'created_at'>>;
