import { PriorityLevel, StatusLevel } from "../types";

// UI & Animation Constants
export const UI_TRANSITION_SPEED = "transition-all duration-300 ease-in-out";
export const UI_MODAL_ANIMATION = "animate-scale-in";

// Helper functions for consistent color tokens
function module(
  color: string,
  textShade: string = "600",
  darkTextShade: string = "400",
) {
  const text = `text-${color}-${textShade} dark:text-${color}-${darkTextShade}`;
  const bg = `bg-${color}-500/10 dark:bg-${color}-500/20`;
  const border = `border-${color}-500/25 dark:border-${color}-500/30`;

  return {
    text,
    bg,
    border,
    dot: `bg-${color}-500`,
    icon: text,
    lightBg: `bg-${color}-100/50 dark:bg-${color}-900/20`,
    hoverBg: `hover:bg-${color}-50/50 dark:hover:bg-${color}-900/10`,
    combined: `${text} ${bg} ${border}`,
  };
}

// Specialized helper for combined styles (used by Priority and Status)
function getCombinedColorClasses(
  color: string,
  textShade: string = "600",
  darkTextShade: string = "400",
): string {
  return module(color, textShade, darkTextShade).combined;
}

function neutral() {
  const text = "text-slate-600 dark:text-slate-400";
  const bg = "bg-slate-500/10 dark:bg-slate-500/20";
  const border = "border-slate-500/20 dark:border-slate-500/30";

  return {
    text,
    bg,
    border,
    dot: "bg-slate-400 dark:bg-slate-500",
    icon: text,
    lightBg: "bg-slate-100/50 dark:bg-slate-900/20",
    hoverBg: "hover:bg-slate-50/50 dark:hover:bg-slate-900/10",
    combined: `${text} ${bg} ${border}`,
  };
}

export type ColorToken = {
  text: string;
  bg: string;
  border: string;
  dot: string;
  icon: string;
  lightBg: string;
  hoverBg: string;
  combined: string;
};

// Priority and Status Styles (Tailwind Classes)
export const PRIORITY_COLORS: Record<PriorityLevel, ColorToken> = {
  High: module("indigo", "700"),
  Medium: module("sky", "700"),
  Low: module("slate", "600"),
};

export const PRIORITY_DOTS: Record<PriorityLevel, string> = {
  High: PRIORITY_COLORS.High.dot,
  Medium: PRIORITY_COLORS.Medium.dot,
  Low: PRIORITY_COLORS.Low.dot,
};

export const STATUS_COLORS: Record<StatusLevel, ColorToken> = {
  Backlog: module("slate", "600"),
  "In Progress": module("blue", "700"),
  Done: module("emerald", "700"),
};

export const STATUS_INDICATORS: Record<StatusLevel, string> = {
  Backlog: STATUS_COLORS.Backlog.dot,
  "In Progress": STATUS_COLORS["In Progress"].dot,
  Done: STATUS_COLORS.Done.dot,
};

// Module Color Mappings (Aligns with blueprintData.ts)
export const MODULE_COLORS: Record<string, ColorToken> = {
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
  getCombinedColorClasses("slate"),
  getCombinedColorClasses("blue"),
  getCombinedColorClasses("emerald"),
  getCombinedColorClasses("indigo"),
];

export const CONTACT_TYPE_COLORS: Record<string, string> = {
  Client: getCombinedColorClasses("blue"),
  Lead: getCombinedColorClasses("purple"),
  Vendor: getCombinedColorClasses("emerald"),
  Partner: getCombinedColorClasses("indigo"),
};
