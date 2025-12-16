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

export const INITIAL_CONFIG_KEY = 'myops_config_v1';
export const LOCAL_STORAGE_KEY = 'myops_data_v1';
export const DEFAULT_GAS_URL = '';

export const PRIORITY_COLORS: Record<PriorityLevel, string> = {
  "High": "bg-rose-100 text-rose-800 border-rose-200",
  "Medium": "bg-orange-100 text-orange-800 border-orange-200",
  "Low": "bg-blue-100 text-blue-800 border-blue-200"
};

export const STATUS_COLORS: Record<StatusLevel, string> = {
  "Backlog": "bg-slate-100 text-slate-600 border-slate-200",
  "In Progress": "bg-indigo-100 text-indigo-700 border-indigo-200",
  "Done": "bg-emerald-100 text-emerald-800 border-emerald-200"
};

export const getProjectStyle = (project: string): string => {
  // Hash string to get a consistent color index
  const hash = project.split('').reduce((acc, char) => char.charCodeAt(0) + acc, 0);
  const colors = [
    "bg-slate-100 text-slate-700 border-slate-200",
    "bg-zinc-100 text-zinc-700 border-zinc-200",
    "bg-neutral-100 text-neutral-700 border-neutral-200",
    "bg-stone-100 text-stone-700 border-stone-200",
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