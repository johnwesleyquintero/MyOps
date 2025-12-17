
export type PriorityLevel = 'High' | 'Medium' | 'Low';
export type StatusLevel = 'Backlog' | 'In Progress' | 'Done';

export type Page = 'DASHBOARD' | 'MISSIONS' | 'SETTINGS' | 'FOCUS';

export interface TaskEntry {
  id: string;         // UUID
  date: string;       // Due Date (YYYY-MM-DD)
  description: string;
  project: string;    // Formerly Category
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

export interface TaskState {
  entries: TaskEntry[];
  isLoading: boolean;
  error: string | null;
  config: AppConfig;
}

export interface AppConfig {
  mode: 'DEMO' | 'LIVE';
  gasDeploymentUrl: string;
  apiToken: string; // The Shared Secret
  locale: string;   // e.g. 'en-US'
  currency?: string; 
  theme: 'LIGHT' | 'DARK';
  geminiApiKey?: string; // User-provided Gemini API Key
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
  type: 'success' | 'error' | 'info';
  action?: NotificationAction;
}
