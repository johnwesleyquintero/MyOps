import { PriorityLevel, StatusLevel } from "../types";

export const DEFAULT_PROJECTS = [
  "Inbox",
  "Development",
  "Operations",
  "Content",
  "Strategy",
  "Life",
  "Learning",
  "Health",
];

export const PRIORITIES: PriorityLevel[] = ["High", "Medium", "Low"];
export const STATUSES: StatusLevel[] = ["Backlog", "In Progress", "Done"];

export const PRIORITY_RANKS: Record<string, number> = {
  High: 0,
  Medium: 1,
  Low: 2,
};

export const STATUS_RANKS: Record<string, number> = {
  Backlog: 0,
  "In Progress": 1,
  Done: 2,
  Active: 0,
  Lead: 1,
  Idle: 2,
  Completed: 3,
};

export const RECURRENCE_OPTIONS = [
  { label: "No Recurrence", tag: "" },
  { label: "Daily", tag: "🔁 Daily" },
  { label: "Weekly", tag: "🔁 Weekly" },
  { label: "Monthly", tag: "🔁 Monthly" },
];
