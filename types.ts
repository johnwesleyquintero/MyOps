
export type PriorityLevel = 'High' | 'Medium' | 'Low';
export type StatusLevel = 'Backlog' | 'In Progress' | 'Done';

export type Page = 'DASHBOARD' | 'MISSIONS' | 'SETTINGS';

export interface TaskEntry {
  id: string;         // UUID
  date: string;       // Due Date (YYYY-MM-DD)
  description: string;
  project: string;    // Formerly Category
  priority: PriorityLevel;
  status: StatusLevel;
  createdAt?: string; // ISO Timestamp
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
