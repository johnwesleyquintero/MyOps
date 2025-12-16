
import { PriorityLevel, StatusLevel } from "./types";

export const DEFAULT_PROJECTS = [
  "Inbox",
  "Development",
  "Operations",
  "Content",
  "Strategy",
  "Life",
  "Learning",
  "Health"
];

export const PRIORITIES: PriorityLevel[] = ['High', 'Medium', 'Low'];
export const STATUSES: StatusLevel[] = ['Backlog', 'In Progress', 'Done'];

export const RECURRENCE_OPTIONS = [
  { label: 'No Recurrence', tag: '' },
  { label: 'Daily', tag: '🔁 Daily' },
  { label: 'Weekly', tag: '🔁 Weekly' },
  { label: 'Monthly', tag: '🔁 Monthly' }
];

export const INITIAL_CONFIG_KEY = 'myops_config_v1';
export const LOCAL_STORAGE_KEY = 'myops_data_v1';
export const TEMPLATE_STORAGE_KEY = 'myops_templates_v1';
export const DEFAULT_GAS_URL = '';

// Updated to "Dot" style background colors (more subtle)
export const PRIORITY_COLORS: Record<PriorityLevel, string> = {
  "High": "text-rose-700 bg-rose-50 border-rose-100",
  "Medium": "text-orange-700 bg-orange-50 border-orange-100",
  "Low": "text-slate-600 bg-slate-100 border-slate-200"
};

// Dot colors for the priorities
export const PRIORITY_DOTS: Record<PriorityLevel, string> = {
  "High": "bg-rose-500",
  "Medium": "bg-orange-500",
  "Low": "bg-slate-400"
};

export const STATUS_COLORS: Record<StatusLevel, string> = {
  "Backlog": "bg-slate-100 text-slate-500 border-slate-200",
  "In Progress": "bg-indigo-50 text-indigo-700 border-indigo-100",
  "Done": "bg-emerald-50 text-emerald-700 border-emerald-100"
};

export const getProjectStyle = (project: string): string => {
  const hash = project.split('').reduce((acc, char) => char.charCodeAt(0) + acc, 0);
  const colors = [
    "bg-slate-50 text-slate-600 border-slate-200",
    "bg-zinc-50 text-zinc-600 border-zinc-200",
    "bg-neutral-50 text-neutral-600 border-neutral-200",
    "bg-stone-50 text-stone-600 border-stone-200",
  ];
  return colors[hash % colors.length];
};

export const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const formatRelativeDate = (dateString: string): { text: string; colorClass: string } => {
  if (!dateString) return { text: '-', colorClass: 'text-slate-400' };
  
  const target = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Normalize target to midnight for comparison
  const targetMidnight = new Date(target);
  targetMidnight.setHours(0, 0, 0, 0);
  // Fix timezone offset issues roughly by just comparing local date strings or timestamps
  // This simple math works for same timezone
  
  const diffTime = targetMidnight.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

  if (diffDays === 0) return { text: 'Today', colorClass: 'text-indigo-600 font-bold' };
  if (diffDays === 1) return { text: 'Tomorrow', colorClass: 'text-amber-600' };
  if (diffDays === -1) return { text: 'Yesterday', colorClass: 'text-rose-600 font-medium' };
  if (diffDays < -1) return { text: formatDate(dateString), colorClass: 'text-rose-500' }; // Overdue
  
  return { text: formatDate(dateString), colorClass: 'text-slate-500' };
};

export const formatCurrency = (amount: number, currency: string = 'USD', locale: string = 'en-US'): string => {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
    }).format(amount);
  } catch (e) {
    return `${currency} ${amount}`;
  }
};
