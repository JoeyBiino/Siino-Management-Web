import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow, isToday, isTomorrow, isYesterday, parseISO } from 'date-fns';

// Merge Tailwind classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format currency (CAD)
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
  }).format(amount);
}

// Format date
export function formatDate(date: string | Date, formatStr: string = 'MMM d, yyyy'): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, formatStr);
}

// Format relative date
export function formatRelativeDate(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  
  if (isToday(d)) return 'Today';
  if (isTomorrow(d)) return 'Tomorrow';
  if (isYesterday(d)) return 'Yesterday';
  
  return formatDistanceToNow(d, { addSuffix: true });
}

// Format time
export function formatTime(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'h:mm a');
}

// Format time range
export function formatTimeRange(start: string | Date, end: string | Date): string {
  return `${formatTime(start)} - ${formatTime(end)}`;
}

// Generate UUID
export function generateUUID(): string {
  return crypto.randomUUID();
}

// Generate portal code
export function generatePortalCode(): string {
  const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 8 }, () => 
    characters.charAt(Math.floor(Math.random() * characters.length))
  ).join('');
}

// Debounce function
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Color utilities
export function getStatusColor(color: string): string {
  const colorMap: Record<string, string> = {
    red: 'bg-red-500/15 text-red-500 border-red-500/30',
    orange: 'bg-orange-500/15 text-orange-500 border-orange-500/30',
    yellow: 'bg-yellow-500/15 text-yellow-500 border-yellow-500/30',
    green: 'bg-green-500/15 text-green-500 border-green-500/30',
    blue: 'bg-blue-500/15 text-blue-500 border-blue-500/30',
    purple: 'bg-purple-500/15 text-purple-500 border-purple-500/30',
    pink: 'bg-pink-500/15 text-pink-500 border-pink-500/30',
    gray: 'bg-gray-500/15 text-gray-400 border-gray-500/30',
    grey: 'bg-gray-500/15 text-gray-400 border-gray-500/30',
  };
  
  return colorMap[color.toLowerCase()] || colorMap.gray;
}

// Get hex color from color name
export function getHexColor(color: string): string {
  const colorMap: Record<string, string> = {
    red: '#ef4444',
    orange: '#f59e0b',
    yellow: '#eab308',
    green: '#10b981',
    blue: '#3b82f6',
    purple: '#9B7EBF',
    pink: '#ec4899',
    gray: '#6b7280',
    grey: '#6b7280',
  };
  
  // If it's already a hex color, return it
  if (color.startsWith('#')) return color;
  
  return colorMap[color.toLowerCase()] || colorMap.gray;
}

// Truncate text
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length) + '...';
}

// Pluralize
export function pluralize(count: number, singular: string, plural?: string): string {
  return count === 1 ? singular : (plural || `${singular}s`);
}

// Group by key
export function groupBy<T>(array: T[], key: keyof T | ((item: T) => string)): Record<string, T[]> {
  return array.reduce((groups, item) => {
    const groupKey = typeof key === 'function' ? key(item) : String(item[key]);
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(item);
    return groups;
  }, {} as Record<string, T[]>);
}

// Sort by key
export function sortBy<T>(array: T[], key: keyof T, order: 'asc' | 'desc' = 'asc'): T[] {
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    
    if (aVal === bVal) return 0;
    if (aVal === null || aVal === undefined) return 1;
    if (bVal === null || bVal === undefined) return -1;
    
    const comparison = aVal < bVal ? -1 : 1;
    return order === 'asc' ? comparison : -comparison;
  });
}

// Calculate invoice totals
export function calculateInvoiceTotals(
  subtotal: number,
  applyTps: boolean,
  applyTvq: boolean,
  tpsRate: number = 0.05,
  tvqRate: number = 0.09975
) {
  const tpsAmount = applyTps ? subtotal * tpsRate : 0;
  const tvqAmount = applyTvq ? subtotal * tvqRate : 0;
  const totalAmount = subtotal + tpsAmount + tvqAmount;
  
  return { tpsAmount, tvqAmount, totalAmount };
}
