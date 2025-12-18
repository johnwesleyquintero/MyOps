
export type PriorityLevel = 'High' | 'Medium' | 'Low';
export type StatusLevel = 'Backlog' | 'In Progress' | 'Done';

export type Page = 'DASHBOARD' | 'MISSIONS' | 'SETTINGS' | 'FOCUS';

export interface TaskEntry {
  id: string;         // UUID
  date: string;       // Due Date (YYYY-MM-DD)
  description: string;
  project: string;    
  priority: PriorityLevel;
  status: StatusLevel;
  createdAt?: string; 
  dependencies?: string[]; 
  completedAt?: string; // Track when finished
}

export interface TaskTemplate {
  id: string;
  name: string;
  description: string;
  project: string;
  priority: PriorityLevel;
}

export interface AppConfig {
  mode: 'DEMO' | 'LIVE';
  gasDeploymentUrl: string;
  apiToken: string; 
  locale: string;   
  currency?: string; 
  theme: 'LIGHT' | 'DARK';
  geminiApiKey?: string; 
}

export interface MetricSummary {
  total: number;
  backlog: number;
  inProgress: number;
  done: number;
  overdue: number; // New metric
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
