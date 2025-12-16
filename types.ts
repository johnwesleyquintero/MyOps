
export type PriorityLevel = 'High' | 'Medium' | 'Low';
export type StatusLevel = 'Backlog' | 'In Progress' | 'Done';

export interface TaskEntry {
  id: string;         // UUID
  date: string;       // Due Date (YYYY-MM-DD)
  description: string;
  project: string;    // Formerly Category
  priority: PriorityLevel;
  status: StatusLevel;
  createdAt?: string; // ISO Timestamp
}

// Added to support legacy analytics components
export interface LedgerEntry {
  id?: string;
  date: string;
  description: string;
  amount: number | string;
  category?: string;
}

export interface LedgerState {
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
  currency?: string; // Added to fix useAppConfig error
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
