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

export const RECURRENCE_OPTIONS = [
  { label: "No Recurrence", tag: "" },
  { label: "Daily", tag: "🔁 Daily" },
  { label: "Weekly", tag: "🔁 Weekly" },
  { label: "Monthly", tag: "🔁 Monthly" },
];
