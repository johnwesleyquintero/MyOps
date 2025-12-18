
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
