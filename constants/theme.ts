
import { PriorityLevel, StatusLevel } from "../types";

export const PRIORITY_THEME: Record<PriorityLevel, { text: string; bg: string; dot: string; border: string; accent: string }> = {
  "High": {
    text: "text-rose-700 dark:text-rose-300",
    bg: "bg-rose-50 dark:bg-rose-950/30",
    dot: "bg-rose-500",
    border: "border-rose-100 dark:border-rose-900/50",
    accent: "bg-rose-600"
  },
  "Medium": {
    text: "text-orange-700 dark:text-orange-300",
    bg: "bg-orange-50 dark:bg-orange-950/30",
    dot: "bg-orange-500",
    border: "border-orange-100 dark:border-orange-900/50",
    accent: "bg-orange-600"
  },
  "Low": {
    text: "text-slate-600 dark:text-slate-400",
    bg: "bg-slate-100 dark:bg-slate-800/50",
    dot: "bg-slate-400",
    border: "border-slate-200 dark:border-slate-700",
    accent: "bg-slate-600"
  }
};

export const STATUS_THEME: Record<StatusLevel, { text: string; bg: string; dot: string; border: string; terminal: string }> = {
  "Backlog": {
    text: "text-slate-500 dark:text-slate-400",
    bg: "bg-slate-100 dark:bg-slate-800/40",
    dot: "bg-slate-400",
    border: "border-slate-200 dark:border-slate-700",
    terminal: "text-slate-500"
  },
  "In Progress": {
    text: "text-indigo-700 dark:text-indigo-300",
    bg: "bg-indigo-50 dark:bg-indigo-950/30",
    dot: "bg-indigo-500",
    border: "border-indigo-100 dark:border-indigo-900/50",
    terminal: "text-indigo-400"
  },
  "Done": {
    text: "text-emerald-700 dark:text-emerald-300",
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
    dot: "bg-emerald-500",
    border: "border-emerald-100 dark:border-emerald-900/50",
    terminal: "text-emerald-400"
  }
};

export const PROJECT_THEME_BASE = [
  "bg-indigo-50/50 text-indigo-700 border-indigo-100 dark:bg-indigo-900/20 dark:text-indigo-300 dark:border-indigo-800",
  "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
  "bg-blue-50/50 text-blue-700 border-blue-100 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800",
  "bg-cyan-50/50 text-cyan-700 border-cyan-100 dark:bg-cyan-900/20 dark:text-cyan-300 dark:border-cyan-800",
];

export const UI_COLORS = {
  primary: "indigo-600",
  primaryHover: "indigo-700",
  secondary: "slate-900",
  secondaryHover: "slate-800",
  danger: "rose-600",
  dangerHover: "rose-700",
  warning: "orange-500",
  success: "emerald-600"
};
