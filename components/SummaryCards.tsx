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
    <div className="flex flex-col h-full">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4 flex-1">
        {/* Backlog */}
        <div className="notion-card p-6 bg-white dark:bg-notion-dark-sidebar/30 relative overflow-hidden group hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between border-slate-200/60 dark:border-white/5">
          <div className="flex justify-between items-start mb-4">
            <h3 className="notion-label text-slate-400 dark:text-slate-500">
              Backlog
            </h3>
            <div className="p-2 bg-slate-50 dark:bg-white/5 rounded-xl text-slate-400 dark:text-slate-400 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-500/10 group-hover:text-indigo-600 transition-colors">
              <Icon.Backlog {...iconProps(20)} />
            </div>
          </div>
          <div className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            {metrics.backlog}
          </div>
        </div>

        {/* Active / In Progress */}
        <div className="notion-card p-6 bg-white dark:bg-notion-dark-sidebar/30 relative overflow-hidden group hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between border-slate-200/60 dark:border-white/5">
          <div className="flex justify-between items-start mb-4">
            <h3 className="notion-label text-slate-400 dark:text-slate-500">
              Active
            </h3>
            <div className="p-2 bg-slate-50 dark:bg-white/5 rounded-xl text-slate-400 dark:text-slate-400 group-hover:bg-blue-50 dark:group-hover:bg-blue-500/10 group-hover:text-blue-600 transition-colors">
              <Icon.Active {...iconProps(20)} />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {metrics.inProgress}
          </div>
        </div>

        {/* Done */}
        <div className="notion-card p-6 bg-white dark:bg-notion-dark-sidebar/30 relative overflow-hidden group hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between border-slate-200/60 dark:border-white/5">
          <div className="flex justify-between items-start mb-4">
            <h3 className="notion-label text-slate-400 dark:text-slate-500">
              Completed
            </h3>
            <div className="p-2 bg-slate-50 dark:bg-white/5 rounded-xl text-slate-400 dark:text-slate-400 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-500/10 group-hover:text-emerald-600 transition-colors">
              <Icon.Completed {...iconProps(20)} />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {metrics.done}
          </div>
        </div>
      </div>

      {/* Completion Rate Bar */}
      <div className="notion-card px-6 py-5 bg-white dark:bg-notion-dark-sidebar/30 flex items-center gap-8 border-slate-200/60 dark:border-white/5 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex flex-col min-w-[100px]">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 mb-1.5">
            Success Rate
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {completionRate}
            </span>
            <span className="text-[10px] font-black text-slate-400 dark:text-slate-500">
              %
            </span>
          </div>
        </div>
        <div className="flex-1 h-3 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden relative border border-slate-200/10 dark:border-white/5">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 rounded-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(99,102,241,0.4)]"
            style={{ width: `${completionRate}%` }}
          />
        </div>
      </div>
    </div>
  );
};
