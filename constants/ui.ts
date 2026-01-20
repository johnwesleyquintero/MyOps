import { PriorityLevel, StatusLevel } from "../types";

// UI & Animation Constants
export const UI_TRANSITION_SPEED = "transition-all duration-300 ease-in-out";
export const UI_MODAL_ANIMATION = "animate-scale-in";

// Priority and Status Styles (Tailwind Classes)
export const PRIORITY_COLORS: Record<PriorityLevel, string> = {
  High: "text-red-700 bg-red-500/10 border-red-500/25 dark:bg-red-500/20 dark:border-red-500/30 dark:text-red-400",
  Medium:
    "text-amber-700 bg-amber-500/10 border-amber-500/25 dark:bg-amber-500/20 dark:border-amber-500/30 dark:text-amber-400",
  Low: "text-slate-600 bg-slate-500/10 border-slate-500/20 dark:bg-slate-500/20 dark:border-slate-500/30 dark:text-slate-400",
};

export const PRIORITY_DOTS: Record<PriorityLevel, string> = {
  High: "bg-red-500",
  Medium: "bg-amber-500",
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
  crm: module("emerald"),
  docs: module("amber"),
  analytics: module("sky"),
  automation: module("cyan"),
  ai: module("violet"),
  strategy: module("fuchsia"),
  sovereign: module("blue"),

  vault: neutral(),
  report: module("sky"),
  assets: module("lime"),

  awareness: module("orange"),
  reflection: module("teal"),
  life: module("pink"),

  integrations: module("purple"),
  integration: module("purple"),

  energy_high: module("red"),
  energy_medium: module("amber"),
  energy_low: neutral(),

  status_active: module("emerald"),
  status_idle: neutral(),

  error: module("red"),
  success: module("emerald"),
};

// Project specific styles
export const PROJECT_COLOR_PALETTE = [
  "bg-slate-500/10 text-slate-600 border-slate-500/20 dark:bg-slate-500/20 dark:text-slate-400 dark:border-slate-500/30",
  "bg-blue-500/10 text-blue-600 border-blue-500/20 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-500/30",
  "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30",
  "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-500/30",
];
