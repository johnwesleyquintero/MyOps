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
  | "BLUEPRINT"
  | "STRATEGY"
  | "AWARENESS"
  | "WESAI"
  | "ASSETS"
  | "REFLECTION"
  | "INTEGRATIONS"
  | "STORY"
  | "LIFE";

export interface TaskEntry {
  id: string; // UUID
  date: string; // Due Date (YYYY-MM-DD)
  description: string;
  project: string;
  priority: PriorityLevel;
  status: StatusLevel;
  createdAt?: string; // ISO Timestamp
  dependencies?: string[]; // Array of IDs blocking this task
  xpAwarded?: number; // XP earned for this task
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
}

export interface Integration {
  id: string;
  name: string;
  type: "Slack" | "WhatsApp" | "Email" | "Webhook";
  url: string;
  isEnabled: boolean;
  events: IntegrationEvent[];
  lastTested?: string;
}

export type IntegrationEvent =
  | "task_created"
  | "task_completed"
  | "milestone_reached"
  | "reflection_logged";

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

export interface DecisionEntry {
  id: string;
  date: string;
  title: string;
  context: string;
  options: string[];
  decision: string;
  expectedOutcome: string;
  actualOutcome?: string;
  assumptions: string[];
  decisionType: "strategy" | "tactic";
  reviewDate: string;
  status: "PENDING" | "REVIEWED" | "ARCHIVED";
  impact: 1 | 2 | 3 | 4 | 5;
  confidenceScore?: number; // 1-100
  predictedImpact?: string;
  tags?: string[];
}

export interface MentalStateEntry {
  id: string;
  date: string;
  energy: "low" | "medium" | "high";
  clarity: "foggy" | "neutral" | "sharp";
  notes?: string;
}

export interface AssetEntry {
  id: string;
  title: string;
  type: "Framework" | "SOP" | "Tool" | "Content" | "Code";
  status: "Draft" | "Active" | "Archived";
  reusabilityScore: 1 | 2 | 3 | 4 | 5;
  monetizationPotential: 1 | 2 | 3 | 4 | 5;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  link?: string;
}

export interface ReflectionEntry {
  id: string;
  date: string;
  title: string;
  type: "Post-Mortem" | "Weekly" | "Monthly" | "Mistake Log";
  content: string;
  learnings: string[];
  actionItems: string[];
  linkedTaskId?: string;
  linkedProjectId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LifeConstraintEntry {
  id: string;
  title: string;
  category: "Health" | "Family" | "Personal" | "Recovery";
  startTime?: string; // HH:mm
  endTime?: string; // HH:mm
  daysOfWeek: number[]; // 0-6
  energyRequirement: "Low" | "Medium" | "High";
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
