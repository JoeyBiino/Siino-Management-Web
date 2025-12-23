import { create } from 'zustand';
import { getSupabaseClient } from '@/lib/supabase/client';
import type {
  Team,
  TeamMember,
  SupabaseUser,
  Client,
  Project,
  ProjectStatus,
  ProjectType,
  Invoice,
  Expense,
  Task,
  TaskStatus,
  Service,
  ServiceCategory,
  Booking,
  TeamAvailability,
  BlockedTime,
  TeamRole,
} from '@/types';

// =============================================================================
// AUTH STORE
// =============================================================================

interface AuthState {
  user: SupabaseUser | null;
  team: Team | null;
  membership: TeamMember | null;
  isLoading: boolean;
  isInitialized: boolean;
  
  // Computed
  teamId: string | null;
  userId: string | null;
  userRole: TeamRole | null;
  canEdit: boolean;
  canDelete: boolean;
  canInvite: boolean;
  
  // Actions
  initialize: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  createTeam: (name: string, billingInfo?: Partial<Team>) => Promise<{ error: string | null }>;
  refreshTeam: () => Promise<void>;
  setTeam: (team: Team, membership: TeamMember) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  team: null,
  membership: null,
  isLoading: true,
  isInitialized: false,
  
  // Computed getters
  get teamId() { return get().team?.id ?? null; },
  get userId() { return get().user?.id ?? null; },
  get userRole() { return get().membership?.role ?? null; },
  get canEdit() { 
    const role = get().membership?.role;
    return role === 'owner' || role === 'admin' || role === 'member';
  },
  get canDelete() {
    const role = get().membership?.role;
    return role === 'owner' || role === 'admin';
  },
  get canInvite() {
    const role = get().membership?.role;
    return role === 'owner' || role === 'admin';
  },
  
  initialize: async () => {
    const supabase = getSupabaseClient();
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        set({ user: null, team: null, membership: null, isLoading: false, isInitialized: true });
        return;
      }
      
      // Load user profile
      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single();
      
      if (!userData) {
        set({ user: null, team: null, membership: null, isLoading: false, isInitialized: true });
        return;
      }
      
      // Load team membership
      const { data: membershipData } = await supabase
        .from('team_members')
        .select('*, team:teams(*)')
        .eq('user_id', session.user.id)
        .eq('invite_status', 'accepted')
        .single();
      
      if (membershipData && membershipData.team) {
        set({
          user: userData,
          team: membershipData.team as Team,
          membership: membershipData as TeamMember,
          isLoading: false,
          isInitialized: true,
        });
      } else {
        set({
          user: userData,
          team: null,
          membership: null,
          isLoading: false,
          isInitialized: true,
        });
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      set({ user: null, team: null, membership: null, isLoading: false, isInitialized: true });
    }
  },
  
  signIn: async (email, password) => {
    const supabase = getSupabaseClient();
    set({ isLoading: true });
    
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        set({ isLoading: false });
        return { error: error.message };
      }
      
      await get().initialize();
      return { error: null };
    } catch (error: any) {
      set({ isLoading: false });
      return { error: error.message };
    }
  },
  
  signUp: async (email, password, fullName) => {
    const supabase = getSupabaseClient();
    set({ isLoading: true });
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
        },
      });
      
      if (error) {
        set({ isLoading: false });
        return { error: error.message };
      }
      
      // Set user without team (they need to create/join one)
      if (data.user) {
        set({
          user: {
            id: data.user.id,
            email: data.user.email!,
            full_name: fullName,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          team: null,
          membership: null,
          isLoading: false,
        });
      }
      
      return { error: null };
    } catch (error: any) {
      set({ isLoading: false });
      return { error: error.message };
    }
  },
  
  signOut: async () => {
    const supabase = getSupabaseClient();
    await supabase.auth.signOut();
    set({ user: null, team: null, membership: null });
    
    // Clear data store
    useDataStore.getState().clearAll();
  },
  
  createTeam: async (name, billingInfo = {}) => {
    const supabase = getSupabaseClient();
    const userId = get().user?.id;
    
    if (!userId) return { error: 'Not authenticated' };
    
    try {
      const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      
      // Create team
      const { data: team, error: teamError } = await supabase
        .from('teams')
        .insert({
          name,
          slug,
          owner_id: userId,
          billing_name: billingInfo.billing_name || '',
          billing_address: billingInfo.billing_address || '',
          billing_city: billingInfo.billing_city || '',
          billing_province: billingInfo.billing_province || 'QC',
          billing_postal_code: billingInfo.billing_postal_code || '',
          billing_phone: billingInfo.billing_phone || '',
          tps_number: billingInfo.tps_number || '',
          tvq_number: billingInfo.tvq_number || '',
          tps_rate: billingInfo.tps_rate || 0.05,
          tvq_rate: billingInfo.tvq_rate || 0.09975,
          primary_color: '#9B7EBF',
        })
        .select()
        .single();
      
      if (teamError) return { error: teamError.message };
      
      // Create owner membership
      const { data: membership, error: memberError } = await supabase
        .from('team_members')
        .insert({
          team_id: team.id,
          user_id: userId,
          role: 'owner',
          invite_status: 'accepted',
          accepted_at: new Date().toISOString(),
        })
        .select()
        .single();
      
      if (memberError) {
        // Membership might already exist from trigger
        const { data: existingMembership } = await supabase
          .from('team_members')
          .select('*')
          .eq('team_id', team.id)
          .eq('user_id', userId)
          .single();
        
        if (existingMembership) {
          set({ team, membership: existingMembership });
        }
      } else {
        set({ team, membership });
      }
      
      // Create default project statuses
      const defaultStatuses = [
        { name: 'Waiting', color: 'gray', sort_order: 0, is_default: true },
        { name: 'Concepting', color: 'purple', sort_order: 1, is_default: false },
        { name: 'In-Progress', color: 'blue', sort_order: 2, is_default: false },
        { name: 'Review', color: 'yellow', sort_order: 3, is_default: false },
        { name: 'Revision', color: 'orange', sort_order: 4, is_default: false },
        { name: 'Delivered', color: 'green', sort_order: 5, is_default: false },
      ];
      
      await supabase.from('project_statuses').insert(
        defaultStatuses.map(s => ({ ...s, team_id: team.id }))
      );
      
      // Create default project types
      const defaultTypes = [
        { name: 'Video', color: 'red', sort_order: 0 },
        { name: 'Photo', color: 'blue', sort_order: 1 },
        { name: 'Design', color: 'purple', sort_order: 2 },
        { name: 'Web', color: 'green', sort_order: 3 },
        { name: 'Other', color: 'gray', sort_order: 4 },
      ];
      
      await supabase.from('project_types').insert(
        defaultTypes.map(t => ({ ...t, team_id: team.id }))
      );
      
      // Create default task statuses
      const defaultTaskStatuses = [
        { name: 'To Do', color: 'gray', sort_order: 0, is_completed: false, is_default: true },
        { name: 'In Progress', color: 'blue', sort_order: 1, is_completed: false, is_default: false },
        { name: 'Done', color: 'green', sort_order: 2, is_completed: true, is_default: false },
      ];
      
      await supabase.from('task_statuses').insert(
        defaultTaskStatuses.map(s => ({ ...s, team_id: team.id }))
      );
      
      return { error: null };
    } catch (error: any) {
      return { error: error.message };
    }
  },
  
  refreshTeam: async () => {
    const supabase = getSupabaseClient();
    const teamId = get().team?.id;
    
    if (!teamId) return;
    
    const { data } = await supabase
      .from('teams')
      .select('*')
      .eq('id', teamId)
      .single();
    
    if (data) {
      set({ team: data });
    }
  },
  
  setTeam: (team, membership) => {
    set({ team, membership });
  },
}));

// =============================================================================
// DATA STORE
// =============================================================================

interface DataState {
  // Data
  clients: Client[];
  projects: Project[];
  projectStatuses: ProjectStatus[];
  projectTypes: ProjectType[];
  invoices: Invoice[];
  expenses: Expense[];
  tasks: Task[];
  taskStatuses: TaskStatus[];
  services: Service[];
  serviceCategories: ServiceCategory[];
  bookings: Booking[];
  teamAvailability: TeamAvailability[];
  blockedTimes: BlockedTime[];
  teamMembers: TeamMember[];
  
  // Loading states
  isLoading: boolean;
  loadingEntities: Set<string>;
  
  // Actions
  fetchAll: (teamId: string) => Promise<void>;
  fetchClients: (teamId: string) => Promise<void>;
  fetchProjects: (teamId: string) => Promise<void>;
  fetchInvoices: (teamId: string) => Promise<void>;
  fetchExpenses: (teamId: string) => Promise<void>;
  fetchTasks: (teamId: string) => Promise<void>;
  fetchServices: (teamId: string) => Promise<void>;
  fetchBookings: (teamId: string) => Promise<void>;
  fetchTeamMembers: (teamId: string) => Promise<void>;
  
  // CRUD helpers
  addClient: (client: Client) => void;
  updateClient: (client: Client) => void;
  removeClient: (id: string) => void;
  
  addProject: (project: Project) => void;
  updateProject: (project: Project) => void;
  removeProject: (id: string) => void;
  
  addInvoice: (invoice: Invoice) => void;
  updateInvoice: (invoice: Invoice) => void;
  removeInvoice: (id: string) => void;
  
  addExpense: (expense: Expense) => void;
  updateExpense: (expense: Expense) => void;
  removeExpense: (id: string) => void;
  
  addTask: (task: Task) => void;
  updateTask: (task: Task) => void;
  removeTask: (id: string) => void;
  
  addBooking: (booking: Booking) => void;
  updateBooking: (booking: Booking) => void;
  removeBooking: (id: string) => void;
  
  clearAll: () => void;
}

export const useDataStore = create<DataState>((set, get) => ({
  clients: [],
  projects: [],
  projectStatuses: [],
  projectTypes: [],
  invoices: [],
  expenses: [],
  tasks: [],
  taskStatuses: [],
  services: [],
  serviceCategories: [],
  bookings: [],
  teamAvailability: [],
  blockedTimes: [],
  teamMembers: [],
  
  isLoading: false,
  loadingEntities: new Set(),
  
  fetchAll: async (teamId) => {
    set({ isLoading: true });
    
    const supabase = getSupabaseClient();
    
    try {
      await Promise.all([
        get().fetchClients(teamId),
        get().fetchProjects(teamId),
        get().fetchInvoices(teamId),
        get().fetchExpenses(teamId),
        get().fetchTasks(teamId),
        get().fetchServices(teamId),
        get().fetchBookings(teamId),
        get().fetchTeamMembers(teamId),
      ]);
    } finally {
      set({ isLoading: false });
    }
  },
  
  fetchClients: async (teamId) => {
    const supabase = getSupabaseClient();
    const { data } = await supabase
      .from('clients')
      .select('*')
      .eq('team_id', teamId)
      .order('name');
    
    if (data) set({ clients: data });
  },
  
  fetchProjects: async (teamId) => {
    const supabase = getSupabaseClient();
    
    // Fetch statuses and types first
    const [statusRes, typeRes, projectRes] = await Promise.all([
      supabase.from('project_statuses').select('*').eq('team_id', teamId).order('sort_order'),
      supabase.from('project_types').select('*').eq('team_id', teamId).order('sort_order'),
      supabase.from('projects').select('*, client:clients(*), status:project_statuses(*), project_type:project_types(*)').eq('team_id', teamId).order('created_at', { ascending: false }),
    ]);
    
    if (statusRes.data) set({ projectStatuses: statusRes.data });
    if (typeRes.data) set({ projectTypes: typeRes.data });
    if (projectRes.data) set({ projects: projectRes.data });
  },
  
  fetchInvoices: async (teamId) => {
    const supabase = getSupabaseClient();
    const { data } = await supabase
      .from('invoices')
      .select('*, client:clients(*)')
      .eq('team_id', teamId)
      .order('issue_date', { ascending: false });
    
    if (data) set({ invoices: data });
  },
  
  fetchExpenses: async (teamId) => {
    const supabase = getSupabaseClient();
    const { data } = await supabase
      .from('expenses')
      .select('*, project:projects(*)')
      .eq('team_id', teamId)
      .order('date', { ascending: false });
    
    if (data) set({ expenses: data });
  },
  
  fetchTasks: async (teamId) => {
    const supabase = getSupabaseClient();
    
    const [statusRes, taskRes] = await Promise.all([
      supabase.from('task_statuses').select('*').eq('team_id', teamId).order('sort_order'),
      supabase.from('tasks').select('*, project:projects(*), status:task_statuses(*)').eq('team_id', teamId).order('created_at', { ascending: false }),
    ]);
    
    if (statusRes.data) set({ taskStatuses: statusRes.data });
    if (taskRes.data) set({ tasks: taskRes.data });
  },
  
  fetchServices: async (teamId) => {
    const supabase = getSupabaseClient();
    
    const [categoryRes, serviceRes] = await Promise.all([
      supabase.from('service_categories').select('*').eq('team_id', teamId).order('sort_order'),
      supabase.from('services').select('*, category:service_categories(*)').eq('team_id', teamId).order('sort_order'),
    ]);
    
    if (categoryRes.data) set({ serviceCategories: categoryRes.data });
    if (serviceRes.data) set({ services: serviceRes.data });
  },
  
  fetchBookings: async (teamId) => {
    const supabase = getSupabaseClient();
    
    const [bookingRes, availabilityRes, blockedRes] = await Promise.all([
      supabase.from('bookings').select('*, service:services(*), client:clients(*)').eq('team_id', teamId).order('start_time', { ascending: false }),
      supabase.from('team_availability').select('*').eq('team_id', teamId),
      supabase.from('blocked_times').select('*').eq('team_id', teamId),
    ]);
    
    if (bookingRes.data) set({ bookings: bookingRes.data });
    if (availabilityRes.data) set({ teamAvailability: availabilityRes.data });
    if (blockedRes.data) set({ blockedTimes: blockedRes.data });
  },
  
  fetchTeamMembers: async (teamId) => {
    const supabase = getSupabaseClient();
    const { data } = await supabase
      .from('team_members')
      .select('*, user:users(*)')
      .eq('team_id', teamId);
    
    if (data) set({ teamMembers: data });
  },
  
  // CRUD helpers
  addClient: (client) => set((state) => ({ clients: [...state.clients, client].sort((a, b) => a.name.localeCompare(b.name)) })),
  updateClient: (client) => set((state) => ({ clients: state.clients.map(c => c.id === client.id ? client : c) })),
  removeClient: (id) => set((state) => ({ clients: state.clients.filter(c => c.id !== id) })),
  
  addProject: (project) => set((state) => ({ projects: [project, ...state.projects] })),
  updateProject: (project) => set((state) => ({ projects: state.projects.map(p => p.id === project.id ? project : p) })),
  removeProject: (id) => set((state) => ({ projects: state.projects.filter(p => p.id !== id) })),
  
  addInvoice: (invoice) => set((state) => ({ invoices: [invoice, ...state.invoices] })),
  updateInvoice: (invoice) => set((state) => ({ invoices: state.invoices.map(i => i.id === invoice.id ? invoice : i) })),
  removeInvoice: (id) => set((state) => ({ invoices: state.invoices.filter(i => i.id !== id) })),
  
  addExpense: (expense) => set((state) => ({ expenses: [expense, ...state.expenses] })),
  updateExpense: (expense) => set((state) => ({ expenses: state.expenses.map(e => e.id === expense.id ? expense : e) })),
  removeExpense: (id) => set((state) => ({ expenses: state.expenses.filter(e => e.id !== id) })),
  
  addTask: (task) => set((state) => ({ tasks: [task, ...state.tasks] })),
  updateTask: (task) => set((state) => ({ tasks: state.tasks.map(t => t.id === task.id ? task : t) })),
  removeTask: (id) => set((state) => ({ tasks: state.tasks.filter(t => t.id !== id) })),
  
  addBooking: (booking) => set((state) => ({ bookings: [booking, ...state.bookings] })),
  updateBooking: (booking) => set((state) => ({ bookings: state.bookings.map(b => b.id === booking.id ? booking : b) })),
  removeBooking: (id) => set((state) => ({ bookings: state.bookings.filter(b => b.id !== id) })),
  
  clearAll: () => set({
    clients: [],
    projects: [],
    projectStatuses: [],
    projectTypes: [],
    invoices: [],
    expenses: [],
    tasks: [],
    taskStatuses: [],
    services: [],
    serviceCategories: [],
    bookings: [],
    teamAvailability: [],
    blockedTimes: [],
    teamMembers: [],
  }),
}));

// =============================================================================
// UI STORE
// =============================================================================

interface UIState {
  sidebarOpen: boolean;
  theme: 'dark' | 'light';
  
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleTheme: () => void;
  setTheme: (theme: 'dark' | 'light') => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  theme: 'dark',
  
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleTheme: () => set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),
  setTheme: (theme) => set({ theme }),
}));
