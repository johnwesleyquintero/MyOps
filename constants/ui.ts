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

// Project specific styles
export const PROJECT_COLOR_PALETTE = [
  "bg-notion-light-sidebar text-notion-light-muted border-notion-light-border dark:bg-notion-dark-sidebar/30 dark:text-notion-dark-muted dark:border-notion-dark-border/30",
  "bg-blue-500/10 text-blue-600 border-blue-500/20 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-500/30",
  "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30",
  "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-500/30",
];
