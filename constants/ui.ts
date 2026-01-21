import { PriorityLevel, StatusLevel } from "../types";

// UI & Animation Constants
export const UI_TRANSITION_SPEED = "transition-all duration-300 ease-in-out";
export const UI_MODAL_ANIMATION = "animate-scale-in";

// Color definitions
export const PALETTE = {
  violet: "violet",
  purple: "purple",
  indigo: "indigo",
  slate: "slate",
} as const;

export type PaletteColor = keyof typeof PALETTE;

// Map Palette colors to Hex for Charts
export const PALETTE_HEX: Record<PaletteColor, string> = {
  violet: "#8b5cf6",
  purple: "#a855f7",
  indigo: "#6366f1",
  slate: "#64748b",
};

// Helper functions for consistent color tokens
function module(
  color: PaletteColor,
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
  color: PaletteColor,
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
  High: module("violet", "700"),
  Medium: module("purple", "700"),
  Low: module("indigo", "600"),
};

export const PRIORITY_DOTS: Record<PriorityLevel, string> = {
  High: PRIORITY_COLORS.High.dot,
  Medium: PRIORITY_COLORS.Medium.dot,
  Low: PRIORITY_COLORS.Low.dot,
};

export const STATUS_COLORS: Record<StatusLevel, ColorToken> = {
  Backlog: module("indigo", "600"),
  "In Progress": module("violet", "700"),
  Done: module("purple", "700"),
};

export const STATUS_INDICATORS: Record<StatusLevel, string> = {
  Backlog: STATUS_COLORS.Backlog.dot,
  "In Progress": STATUS_COLORS["In Progress"].dot,
  Done: STATUS_COLORS.Done.dot,
};

export type ModuleKey =
  | "tasks"
  | "crm"
  | "docs"
  | "analytics"
  | "automation"
  | "ai"
  | "strategy"
  | "sovereign"
  | "vault"
  | "report"
  | "assets"
  | "awareness"
  | "reflection"
  | "life"
  | "integrations"
  | "integration"
  | "energy_high"
  | "energy_medium"
  | "energy_low"
  | "status_active"
  | "status_idle"
  | "error"
  | "success";

// Module Color Mappings (Aligns with blueprintData.ts)
export const MODULE_COLORS: Record<ModuleKey, ColorToken> = {
  tasks: module("indigo"),
  crm: module("violet"),
  docs: module("purple"),
  analytics: module("indigo"),
  automation: module("violet"),
  ai: module("purple"),
  strategy: module("violet"),
  sovereign: module("indigo"),

  vault: neutral(),
  report: module("indigo"),
  assets: module("purple"),

  awareness: module("violet"),
  reflection: module("indigo"),
  life: module("purple"),

  integrations: module("violet"),
  integration: module("violet"),

  energy_high: module("violet"),
  energy_medium: module("purple"),
  energy_low: neutral(),

  status_active: module("violet"),
  status_idle: neutral(),

  error: module("purple", "800"),
  success: module("violet", "500"),
};

// Project specific styles
export const PROJECT_COLOR_PALETTE = [
  getCombinedColorClasses("violet"),
  getCombinedColorClasses("purple"),
  getCombinedColorClasses("indigo"),
  getCombinedColorClasses("slate"),
];

export const CONTACT_TYPE_COLORS: Record<string, string> = {
  Client: getCombinedColorClasses("violet"),
  Lead: getCombinedColorClasses("purple"),
  Vendor: getCombinedColorClasses("indigo"),
  Partner: getCombinedColorClasses("slate"),
};
