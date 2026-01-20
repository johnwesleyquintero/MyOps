import { PriorityLevel, StatusLevel } from "../types";

// UI & Animation Constants
export const UI_TRANSITION_SPEED = "transition-all duration-300 ease-in-out";
export const UI_MODAL_ANIMATION = "animate-scale-in";

// Priority and Status Styles (Tailwind Classes)
export const PRIORITY_COLORS: Record<PriorityLevel, string> = {
  High: "text-red-700 bg-red-500/10 border-red-500/20 dark:bg-red-500/20 dark:border-red-500/30 dark:text-red-400",
  Medium:
    "text-amber-700 bg-amber-500/10 border-amber-500/20 dark:bg-amber-500/20 dark:border-amber-500/30 dark:text-amber-400",
  Low: "text-notion-light-muted bg-notion-light-sidebar border-notion-light-border dark:bg-notion-dark-sidebar/50 dark:border-notion-dark-border/50 dark:text-notion-dark-muted",
};

export const PRIORITY_DOTS: Record<PriorityLevel, string> = {
  High: "bg-red-500",
  Medium: "bg-amber-500",
  Low: "bg-notion-light-muted dark:bg-notion-dark-muted",
};

export const STATUS_COLORS: Record<StatusLevel, string> = {
  Backlog:
    "bg-notion-light-sidebar text-notion-light-muted border-notion-light-border dark:bg-notion-dark-sidebar/50 dark:text-notion-dark-muted dark:border-notion-dark-border/50",
  "In Progress":
    "bg-blue-500/10 text-blue-700 border-blue-500/20 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-500/30",
  Done: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30",
};

export const STATUS_INDICATORS: Record<StatusLevel, string> = {
  Backlog: "bg-notion-light-muted dark:bg-notion-dark-muted",
  "In Progress": "bg-blue-500",
  Done: "bg-emerald-500",
};

// Module Color Mappings (Aligns with blueprintData.ts)
export const MODULE_COLORS: Record<
  string,
  {
    text: string;
    bg: string;
    border: string;
    dot: string;
    icon: string;
    lightBg: string;
    hoverBg: string;
  }
> = {
  tasks: {
    text: "text-indigo-600 dark:text-indigo-400",
    bg: "bg-indigo-500/10 dark:bg-indigo-500/20",
    border: "border-indigo-500/20 dark:border-indigo-500/30",
    dot: "bg-indigo-500",
    icon: "text-indigo-600 dark:text-indigo-400",
    lightBg: "bg-indigo-100/50 dark:bg-indigo-900/20",
    hoverBg: "hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10",
  },
  crm: {
    text: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-500/10 dark:bg-emerald-500/20",
    border: "border-emerald-500/20 dark:border-emerald-500/30",
    dot: "bg-emerald-500",
    icon: "text-emerald-600 dark:text-emerald-400",
    lightBg: "bg-emerald-100/50 dark:bg-emerald-900/20",
    hoverBg: "hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10",
  },
  docs: {
    text: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-500/10 dark:bg-amber-500/20",
    border: "border-amber-500/20 dark:border-amber-500/30",
    dot: "bg-amber-500",
    icon: "text-amber-600 dark:text-amber-400",
    lightBg: "bg-amber-100/50 dark:bg-amber-900/20",
    hoverBg: "hover:bg-amber-50/50 dark:hover:bg-amber-900/10",
  },
  analytics: {
    text: "text-rose-600 dark:text-rose-400",
    bg: "bg-rose-500/10 dark:bg-rose-500/20",
    border: "border-rose-500/20 dark:border-rose-500/30",
    dot: "bg-rose-500",
    icon: "text-rose-600 dark:text-rose-400",
    lightBg: "bg-rose-100/50 dark:bg-rose-900/20",
    hoverBg: "hover:bg-rose-50/50 dark:hover:bg-rose-900/10",
  },
  automation: {
    text: "text-cyan-600 dark:text-cyan-400",
    bg: "bg-cyan-500/10 dark:bg-cyan-500/20",
    border: "border-cyan-500/20 dark:border-cyan-500/30",
    dot: "bg-cyan-500",
    icon: "text-cyan-600 dark:text-cyan-400",
    lightBg: "bg-cyan-100/50 dark:bg-cyan-900/20",
    hoverBg: "hover:bg-cyan-50/50 dark:hover:bg-cyan-900/10",
  },
  vault: {
    text: "text-slate-600 dark:text-slate-400",
    bg: "bg-slate-500/10 dark:bg-slate-500/20",
    border: "border-slate-500/20 dark:border-slate-500/30",
    dot: "bg-slate-500",
    icon: "text-slate-600 dark:text-slate-400",
    lightBg: "bg-slate-100/50 dark:bg-slate-900/20",
    hoverBg: "hover:bg-slate-50/50 dark:hover:bg-slate-900/10",
  },
  ai: {
    text: "text-violet-600 dark:text-violet-400",
    bg: "bg-violet-500/10 dark:bg-violet-500/20",
    border: "border-violet-500/20 dark:border-violet-500/30",
    dot: "bg-violet-500",
    icon: "text-violet-600 dark:text-violet-400",
    lightBg: "bg-violet-100/50 dark:bg-violet-900/20",
    hoverBg: "hover:bg-violet-50/50 dark:hover:bg-violet-900/10",
  },
  sovereign: {
    text: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-500/10 dark:bg-blue-500/20",
    border: "border-blue-500/20 dark:border-blue-500/30",
    dot: "bg-blue-500",
    icon: "text-blue-600 dark:text-blue-400",
    lightBg: "bg-blue-100/50 dark:bg-blue-900/20",
    hoverBg: "hover:bg-blue-50/50 dark:hover:bg-blue-900/10",
  },
  strategy: {
    text: "text-fuchsia-600 dark:text-fuchsia-400",
    bg: "bg-fuchsia-500/10 dark:bg-fuchsia-500/20",
    border: "border-fuchsia-500/20 dark:border-fuchsia-500/30",
    dot: "bg-fuchsia-500",
    icon: "text-fuchsia-600 dark:text-fuchsia-400",
    lightBg: "bg-fuchsia-100/50 dark:bg-fuchsia-900/20",
    hoverBg: "hover:bg-fuchsia-50/50 dark:hover:bg-fuchsia-900/10",
  },
  awareness: {
    text: "text-orange-600 dark:text-orange-400",
    bg: "bg-orange-500/10 dark:bg-orange-500/20",
    border: "border-orange-500/20 dark:border-orange-500/30",
    dot: "bg-orange-500",
    icon: "text-orange-600 dark:text-orange-400",
    lightBg: "bg-orange-100/50 dark:bg-orange-900/20",
    hoverBg: "hover:bg-orange-50/50 dark:hover:bg-orange-900/10",
  },
  assets: {
    text: "text-lime-600 dark:text-lime-400",
    bg: "bg-lime-500/10 dark:bg-lime-500/20",
    border: "border-lime-500/20 dark:border-lime-500/30",
    dot: "bg-lime-500",
    icon: "text-lime-600 dark:text-lime-400",
    lightBg: "bg-lime-100/50 dark:bg-lime-900/20",
    hoverBg: "hover:bg-lime-50/50 dark:hover:bg-lime-900/10",
  },
  reflection: {
    text: "text-teal-600 dark:text-teal-400",
    bg: "bg-teal-500/10 dark:bg-teal-500/20",
    border: "border-teal-500/20 dark:border-teal-500/30",
    dot: "bg-teal-500",
    icon: "text-teal-600 dark:text-teal-400",
    lightBg: "bg-teal-100/50 dark:bg-teal-900/20",
    hoverBg: "hover:bg-teal-50/50 dark:hover:bg-teal-900/10",
  },
  life: {
    text: "text-pink-600 dark:text-pink-400",
    bg: "bg-pink-500/10 dark:bg-pink-500/20",
    border: "border-pink-500/20 dark:border-pink-500/30",
    dot: "bg-pink-500",
    icon: "text-pink-600 dark:text-pink-400",
    lightBg: "bg-pink-100/50 dark:bg-pink-900/20",
    hoverBg: "hover:bg-pink-50/50 dark:hover:bg-pink-900/10",
  },
  integrations: {
    text: "text-purple-600 dark:text-purple-400",
    bg: "bg-purple-500/10 dark:bg-purple-500/20",
    border: "border-purple-500/20 dark:border-purple-500/30",
    dot: "bg-purple-500",
    icon: "text-purple-600 dark:text-purple-400",
    lightBg: "bg-purple-100/50 dark:bg-purple-900/20",
    hoverBg: "hover:bg-purple-50/50 dark:hover:bg-purple-900/10",
  },
  integration: {
    text: "text-purple-600 dark:text-purple-400",
    bg: "bg-purple-500/10 dark:bg-purple-500/20",
    border: "border-purple-500/20 dark:border-purple-500/30",
    dot: "bg-purple-500",
    icon: "text-purple-600 dark:text-purple-400",
    lightBg: "bg-purple-100/50 dark:bg-purple-900/20",
    hoverBg: "hover:bg-purple-50/50 dark:hover:bg-purple-900/10",
  },
  report: {
    text: "text-sky-600 dark:text-sky-400",
    bg: "bg-sky-500/10 dark:bg-sky-500/20",
    border: "border-sky-500/20 dark:border-sky-500/30",
    dot: "bg-sky-500",
    icon: "text-sky-600 dark:text-sky-400",
    lightBg: "bg-sky-100/50 dark:bg-sky-900/20",
    hoverBg: "hover:bg-sky-50/50 dark:hover:bg-sky-900/10",
  },
  energy_high: {
    text: "text-red-600 dark:text-red-400",
    bg: "bg-red-500/10 dark:bg-red-500/20",
    border: "border-red-500/20 dark:border-red-500/30",
    dot: "bg-red-500",
    icon: "text-red-600 dark:text-red-400",
    lightBg: "bg-red-100/50 dark:bg-red-900/20",
    hoverBg: "hover:bg-red-50/50 dark:hover:bg-red-900/10",
  },
  energy_medium: {
    text: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-500/10 dark:bg-amber-500/20",
    border: "border-amber-500/20 dark:border-amber-500/30",
    dot: "bg-amber-500",
    icon: "text-amber-600 dark:text-amber-400",
    lightBg: "bg-amber-100/50 dark:bg-amber-900/20",
    hoverBg: "hover:bg-amber-50/50 dark:hover:bg-amber-900/10",
  },
  energy_low: {
    text: "text-slate-600 dark:text-slate-400",
    bg: "bg-slate-500/10 dark:bg-slate-500/20",
    border: "border-slate-500/20 dark:border-slate-500/30",
    dot: "bg-slate-500",
    icon: "text-slate-600 dark:text-slate-400",
    lightBg: "bg-slate-100/50 dark:bg-slate-900/20",
    hoverBg: "hover:bg-slate-50/50 dark:hover:bg-slate-900/10",
  },
  status_active: {
    text: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-500/10 dark:bg-emerald-500/20",
    border: "border-emerald-500/20 dark:border-emerald-500/30",
    dot: "bg-emerald-500",
    icon: "text-emerald-600 dark:text-emerald-400",
    lightBg: "bg-emerald-100/50 dark:bg-emerald-900/20",
    hoverBg: "hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10",
  },
  status_idle: {
    text: "text-slate-600 dark:text-slate-400",
    bg: "bg-slate-500/10 dark:bg-slate-500/20",
    border: "border-slate-500/20 dark:border-slate-500/30",
    dot: "bg-slate-500",
    icon: "text-slate-600 dark:text-slate-400",
    lightBg: "bg-slate-100/50 dark:bg-slate-900/20",
    hoverBg: "hover:bg-slate-50/50 dark:hover:bg-slate-900/10",
  },
  error: {
    text: "text-red-600 dark:text-red-400",
    bg: "bg-red-500/10 dark:bg-red-500/20",
    border: "border-red-500/20 dark:border-red-500/30",
    dot: "bg-red-500",
    icon: "text-red-600 dark:text-red-400",
    lightBg: "bg-red-100/50 dark:bg-red-900/20",
    hoverBg: "hover:bg-red-50/50 dark:hover:bg-red-900/10",
  },
  success: {
    text: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-500/10 dark:bg-emerald-500/20",
    border: "border-emerald-500/20 dark:border-emerald-500/30",
    dot: "bg-emerald-500",
    icon: "text-emerald-600 dark:text-emerald-400",
    lightBg: "bg-emerald-100/50 dark:bg-emerald-900/20",
    hoverBg: "hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10",
  },
};

// Project specific styles
export const PROJECT_COLOR_PALETTE = [
  "bg-notion-light-sidebar text-notion-light-muted border-notion-light-border dark:bg-notion-dark-sidebar/30 dark:text-notion-dark-muted dark:border-notion-dark-border/30",
  "bg-blue-500/10 text-blue-600 border-blue-500/20 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-500/30",
  "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30",
  "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-500/30",
];
