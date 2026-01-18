import React from "react";
import { MetricSummary } from "../types";
import { Icon, iconProps } from "./Icons";

interface SummaryCardsProps {
  metrics: MetricSummary;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ metrics }) => {
  // Calculate completion percentage
  const totalActive = metrics.total;
  const completionRate =
    totalActive > 0 ? Math.round((metrics.done / totalActive) * 100) : 0;

  return (
    <div className="mb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {/* Backlog */}
        <div className="notion-card p-5 bg-notion-light-sidebar/50 dark:bg-notion-dark-sidebar/30 relative overflow-hidden group hover:shadow-md transition-all">
          <div className="flex justify-between items-start mb-2">
            <h3 className="notion-label">Backlog</h3>
            <div className="p-1.5 bg-notion-light-hover dark:bg-notion-dark-hover rounded text-notion-light-muted dark:text-notion-dark-muted">
              <Icon.Backlog {...iconProps(16)} />
            </div>
          </div>
          <div className="text-2xl font-bold tracking-tight text-notion-light-text dark:text-notion-dark-text">
            {metrics.backlog}
          </div>
        </div>

        {/* Active / In Progress */}
        <div className="notion-card p-5 bg-notion-light-sidebar/50 dark:bg-notion-dark-sidebar/30 relative overflow-hidden group hover:shadow-md transition-all">
          <div className="flex justify-between items-start mb-2">
            <h3 className="notion-label">Active</h3>
            <div className="p-1.5 bg-notion-light-hover dark:bg-notion-dark-hover rounded text-notion-light-muted dark:text-notion-dark-muted transition-colors">
              <Icon.Active {...iconProps(16)} />
            </div>
          </div>
          <div className="text-2xl font-bold text-notion-light-text dark:text-notion-dark-text tracking-tight">
            {metrics.inProgress}
          </div>
        </div>

        {/* Done */}
        <div className="notion-card p-5 bg-notion-light-sidebar/50 dark:bg-notion-dark-sidebar/30 relative overflow-hidden group hover:shadow-md transition-all">
          <div className="flex justify-between items-start mb-2">
            <h3 className="notion-label">Completed</h3>
            <div className="p-1.5 bg-notion-light-hover dark:bg-notion-dark-hover rounded text-notion-light-muted dark:text-notion-dark-muted transition-colors">
              <Icon.Completed {...iconProps(16)} />
            </div>
          </div>
          <div className="text-2xl font-bold text-notion-light-text dark:text-notion-dark-text tracking-tight">
            {metrics.done}
          </div>
        </div>
      </div>

      {/* Completion Rate Bar */}
      <div className="notion-card px-4 py-2.5 bg-notion-light-sidebar/50 dark:bg-notion-dark-sidebar/30 flex items-center gap-4">
        <span className="notion-label whitespace-nowrap">Completion Rate</span>
        <div className="flex-1 h-1.5 bg-notion-light-hover dark:bg-notion-dark-hover rounded-full overflow-hidden">
          <div
            className="h-full bg-notion-light-text dark:bg-notion-dark-text rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${completionRate}%` }}
          />
        </div>
        <span className="text-xs font-semibold text-notion-light-text dark:text-notion-dark-text w-8 text-right">
          {completionRate}%
        </span>
      </div>
    </div>
  );
};
