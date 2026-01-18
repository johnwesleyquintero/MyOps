export type PriorityLevel = "High" | "Medium" | "Low";
export type StatusLevel = "Backlog" | "In Progress" | "Done";

export type Page =
  | "DASHBOARD"
  | "MISSIONS"
  | "SETTINGS"
  | "FOCUS"
  | "CRM"
  | "KNOWLEDGE"
  | "INSIGHTS"
  | "VAULT"
  | "AUTOMATION"
  | "REPORT"
  | "BLUEPRINT";

export interface TaskEntry {
  id: string; // UUID
  date: string; // Due Date (YYYY-MM-DD)
  description: string;
  project: string;
  priority: PriorityLevel;
  status: StatusLevel;
  createdAt?: string; // ISO Timestamp
  dependencies?: string[]; // Array of IDs blocking this task
}

export interface TaskTemplate {
  id: string;
  name: string;
  description: string;
  project: string;
  priority: PriorityLevel;
}

export interface Contact {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  type: "Client" | "Vendor" | "Partner" | "Lead";
  status: "Active" | "Completed" | "Idle" | "Lead";
  tags: string[];
  notes?: string;
  createdAt: string;
  lastInteraction: string;
  interactions: Interaction[];
}

export interface Interaction {
  id: string;
  contactId: string;
  date: string;
  type: "Call" | "Email" | "Message" | "Meeting" | "Other";
  notes: string;
  taskId?: string; // Optional link to a task
}

export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  lastModified: string;
  createdAt: string;
  updatedAt: string;
  isFavorite?: boolean;
}

export interface OperatorMetrics {
  xp: number;
  level: number;
  streak: number;
  artifactsGained: number;
  totalTasksCompleted: number;
  lastActiveDate: string;
}

export interface VaultEntry {
  id: string;
  label: string;
  category: "API Key" | "Password" | "Token" | "Other";
  value: string;
  createdAt: string;
  lastAccessed?: string;
}

export interface Automation {
  id: string;
  name: string;
  trigger: string;
  action: string;
  status: "Active" | "Inactive";
  lastRun?: string;
}

export interface AppConfig {
  mode: "DEMO" | "LIVE";
  gasDeploymentUrl: string;
  apiToken: string;
  locale: string;
  currency: string;
  theme: "LIGHT" | "DARK";
  geminiApiKey?: string;
}

export interface MetricSummary {
  total: number;
  backlog: number;
  inProgress: number;
  done: number;
}

export interface NotificationAction {
  label: string;
  onClick: () => void;
}

export interface Notification {
  id: string;
  message: string;
  type: "success" | "error" | "info";
  action?: NotificationAction;
}
