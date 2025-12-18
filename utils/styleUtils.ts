
import { PriorityLevel, StatusLevel } from '../types';

export const UI_TRANSITION = 'transition-all duration-300 ease-in-out';

export const PRIORITY_STYLES: Record<PriorityLevel, string> = {
  "High": "text-rose-700 bg-rose-50 border-rose-100 dark:bg-rose-900/20 dark:border-rose-800 dark:text-rose-400",
  "Medium": "text-orange-700 bg-orange-50 border-orange-100 dark:bg-orange-900/20 dark:border-orange-800 dark:text-orange-400",
  "Low": "text-slate-600 bg-slate-100 border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400"
};

export const PRIORITY_DOT_STYLES: Record<PriorityLevel, string> = {
  "High": "bg-rose-500",
  "Medium": "bg-orange-500",
  "Low": "bg-slate-400"
};

export const STATUS_STYLES: Record<StatusLevel, string> = {
  "Backlog": "bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-500 dark:border-slate-700",
  "In Progress": "bg-indigo-50 text-indigo-700 border-indigo-100 dark:bg-indigo-900/20 dark:text-indigo-400 dark:border-indigo-800",
  "Done": "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800"
};

export const STATUS_DOT_STYLES: Record<StatusLevel, string> = {
  "Backlog": "bg-slate-400",
  "In Progress": "bg-indigo-500",
  "Done": "bg-emerald-500"
};

export const PROJECT_COLOR_PALETTE = [
  "bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
  "bg-zinc-50 text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700",
  "bg-neutral-50 text-neutral-600 border-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:border-neutral-700",
  "bg-stone-50 text-stone-600 border-stone-200 dark:bg-stone-800 dark:text-stone-300 dark:border-stone-700",
];

export const getProjectBadgeStyle = (project: string): string => {
  const hash = project.split('').reduce((acc, char) => char.charCodeAt(0) + acc, 0);
  return `inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${PROJECT_COLOR_PALETTE[hash % PROJECT_COLOR_PALETTE.length]}`;
};
