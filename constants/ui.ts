import { PriorityLevel, StatusLevel } from "../types";

// UI & Animation Constants
export const UI_TRANSITION_SPEED = "transition-all duration-300 ease-in-out";
export const UI_MODAL_ANIMATION = "animate-scale-in";

// Priority and Status Styles (Tailwind Classes)
export const PRIORITY_COLORS: Record<PriorityLevel, string> = {
  High: "text-indigo-700 bg-indigo-500/10 border-indigo-500/25 dark:bg-indigo-500/20 dark:border-indigo-500/30 dark:text-indigo-400",
  Medium:
    "text-sky-700 bg-sky-500/10 border-sky-500/25 dark:bg-sky-500/20 dark:border-sky-500/30 dark:text-sky-400",
  Low: "text-slate-600 bg-slate-500/10 border-slate-500/20 dark:bg-slate-500/20 dark:border-slate-500/30 dark:text-slate-400",
};

export const PRIORITY_DOTS: Record<PriorityLevel, string> = {
  High: "bg-indigo-500",
  Medium: "bg-sky-500",
  Low: "bg-slate-400 dark:bg-slate-500",
};

export const STATUS_COLORS: Record<StatusLevel, string> = {
  Backlog:
    "bg-slate-500/10 text-slate-600 border-slate-500/20 dark:bg-slate-500/20 dark:text-slate-400 dark:border-slate-500/30",
  "In Progress":
    "bg-blue-500/10 text-blue-700 border-blue-500/25 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-500/30",
  Done: "bg-emerald-500/10 text-emerald-700 border-emerald-500/25 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30",
};

export const STATUS_INDICATORS: Record<StatusLevel, string> = {
  Backlog: "bg-slate-400 dark:bg-slate-500",
  "In Progress": "bg-blue-500",
  Done: "bg-emerald-500",
};

// Helper functions for consistent color tokens
function module(color: string) {
  return {
    text: `text-${color}-600 dark:text-${color}-400`,
    bg: `bg-${color}-500/10 dark:bg-${color}-500/20`,
    border: `border-${color}-500/25 dark:border-${color}-500/30`,
    dot: `bg-${color}-500`,
    icon: `text-${color}-600 dark:text-${color}-400`,
    lightBg: `bg-${color}-100/50 dark:bg-${color}-900/20`,
    hoverBg: `hover:bg-${color}-50/50 dark:hover:bg-${color}-900/10`,
  };
}

function neutral() {
  return {
    text: "text-slate-600 dark:text-slate-400",
    bg: "bg-slate-500/10 dark:bg-slate-500/20",
    border: "border-slate-500/20 dark:border-slate-500/30",
    dot: "bg-slate-400 dark:bg-slate-500",
    icon: "text-slate-600 dark:text-slate-400",
    lightBg: "bg-slate-100/50 dark:bg-slate-900/20",
    hoverBg: "hover:bg-slate-50/50 dark:hover:bg-slate-900/10",
  };
}

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
  tasks: module("indigo"),
  crm: module("blue"),
  docs: module("emerald"),
  analytics: module("indigo"),
  automation: module("blue"),
  ai: module("violet"),
  strategy: module("purple"),
  sovereign: module("cyan"),

  vault: neutral(),
  report: module("indigo"),
  assets: module("teal"),

  awareness: module("sky"),
  reflection: module("teal"),
  life: module("emerald"),

  integrations: module("purple"),
  integration: module("purple"),

  energy_high: module("emerald"),
  energy_medium: module("sky"),
  energy_low: neutral(),

  status_active: module("emerald"),
  status_idle: neutral(),

  error: module("indigo"),
  success: module("emerald"),
};

// Project specific styles
export const PROJECT_COLOR_PALETTE = [
  "bg-slate-500/10 text-slate-600 border-slate-500/20 dark:bg-slate-500/20 dark:text-slate-400 dark:border-slate-500/30",
  "bg-blue-500/10 text-blue-600 border-blue-500/20 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-500/30",
  "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30",
  "bg-indigo-500/10 text-indigo-600 border-indigo-500/20 dark:bg-indigo-500/20 dark:text-indigo-400 dark:border-indigo-500/30",
];
