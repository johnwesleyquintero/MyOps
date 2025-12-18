
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

export const STATUS_THEME: Record<StatusLevel, { text: string; bg: string; dot: string; border: string }> = {
  "Backlog": {
    text: "text-slate-500 dark:text-slate-400",
    bg: "bg-slate-100 dark:bg-slate-800/40",
    dot: "bg-slate-400",
    border: "border-slate-200 dark:border-slate-700"
  },
  "In Progress": {
    text: "text-indigo-700 dark:text-indigo-300",
    bg: "bg-indigo-50 dark:bg-indigo-950/30",
    dot: "bg-indigo-500",
    border: "border-indigo-100 dark:border-indigo-900/50"
  },
  "Done": {
    text: "text-emerald-700 dark:text-emerald-300",
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
    dot: "bg-emerald-500",
    border: "border-emerald-100 dark:border-emerald-900/50"
  }
};

export const PROJECT_THEME_BASE = [
  "bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
  "bg-zinc-50 text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700",
  "bg-neutral-50 text-neutral-600 border-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:border-neutral-700",
  "bg-stone-50 text-stone-600 border-stone-200 dark:bg-stone-800 dark:text-stone-300 dark:border-stone-700",
];

export const UI_COLORS = {
  primary: "indigo-600",
  primaryHover: "indigo-700",
  secondary: "slate-900",
  secondaryHover: "slate-800",
  danger: "red-600",
  dangerHover: "red-700",
  warning: "amber-500",
  success: "emerald-600"
};
