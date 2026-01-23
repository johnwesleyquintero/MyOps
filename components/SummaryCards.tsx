import React from "react";
import { MetricSummary } from "../types";
import { Icon } from "./Icons";

import { Card, Badge } from "./ui";

interface SummaryCardsProps {
  metrics: MetricSummary;
}

export const SummaryCards: React.FC<SummaryCardsProps> = React.memo(
  ({ metrics }) => {
    // Calculate completion percentage
    const totalActive = metrics.total;
    const completionRate =
      totalActive > 0 ? Math.round((metrics.done / totalActive) * 100) : 0;

    return (
      <div className="flex flex-col h-full">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4 mb-4 flex-1">
          {/* Backlog */}
          <Card
            hoverEffect
            className="flex flex-col justify-between border-slate-200/60 dark:border-white/5 p-4 md:p-5"
          >
            <div className="flex justify-between items-start mb-3 md:mb-4">
              <Badge
                variant="ghost"
                size="xs"
                className="font-black uppercase tracking-[0.2em] text-notion-light-text/50 dark:text-white/40 !p-0 text-[8px] md:text-[9px]"
              >
                Backlog
              </Badge>
              <div className="p-1.5 md:p-2 bg-slate-50 dark:bg-white/5 rounded-lg md:rounded-xl text-slate-400 dark:text-slate-400 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-500/10 group-hover:text-indigo-600 transition-colors">
                <Icon.Backlog size={16} className="md:w-5 md:h-5" />
              </div>
            </div>
            <div className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 dark:text-white leading-none">
              {metrics.backlog}
            </div>
          </Card>

          {/* Active / In Progress */}
          <Card
            hoverEffect
            className="flex flex-col justify-between border-slate-200/60 dark:border-white/5 p-4 md:p-5"
          >
            <div className="flex justify-between items-start mb-3 md:mb-4">
              <Badge
                variant="ghost"
                size="xs"
                className="font-black uppercase tracking-[0.2em] text-notion-light-text/50 dark:text-white/40 !p-0 text-[8px] md:text-[9px]"
              >
                Active
              </Badge>
              <div className="p-1.5 md:p-2 bg-slate-50 dark:bg-white/5 rounded-lg md:rounded-xl text-slate-400 dark:text-slate-400 group-hover:bg-violet-50 dark:group-hover:bg-violet-500/10 group-hover:text-violet-600 transition-colors">
                <Icon.Active size={16} className="md:w-5 md:h-5" />
              </div>
            </div>
            <div className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
              {metrics.inProgress}
            </div>
          </Card>

          {/* Done */}
          <Card
            hoverEffect
            className="flex flex-col justify-between border-slate-200/60 dark:border-white/5 p-4 md:p-5"
          >
            <div className="flex justify-between items-start mb-3 md:mb-4">
              <Badge
                variant="ghost"
                size="xs"
                className="font-black uppercase tracking-[0.2em] text-notion-light-text/50 dark:text-white/40 !p-0 text-[8px] md:text-[9px]"
              >
                Completed
              </Badge>
              <div className="p-1.5 md:p-2 bg-slate-50 dark:bg-white/5 rounded-lg md:rounded-xl text-slate-400 dark:text-slate-400 group-hover:bg-purple-50 dark:group-hover:bg-purple-500/10 group-hover:text-purple-600 transition-colors">
                <Icon.Completed size={16} className="md:w-5 md:h-5" />
              </div>
            </div>
            <div className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
              {metrics.done}
            </div>
          </Card>
        </div>

        {/* Completion Rate Bar */}
        <Card className="flex flex-col sm:flex-row items-start sm:items-center gap-3 md:gap-4 sm:gap-8 border-slate-200/60 dark:border-white/5 shadow-sm hover:shadow-md transition-shadow py-3 md:py-4 px-4 md:px-5 sm:px-6">
          <div className="flex flex-col min-w-[80px] md:min-w-[100px]">
            <Badge
              variant="ghost"
              size="xs"
              className="font-black uppercase tracking-[0.2em] text-notion-light-text/50 dark:text-white/40 !p-0 mb-1 text-[8px] md:text-[9px]"
            >
              Success Rate
            </Badge>
            <div className="flex items-baseline gap-1">
              <span className="text-xl md:text-2xl font-black text-slate-900 dark:text-white">
                {completionRate}
              </span>
              <span className="text-[9px] md:text-[10px] font-black text-slate-400 dark:text-slate-500">
                %
              </span>
            </div>
          </div>
          <div className="w-full flex-1 h-2 md:h-3 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden relative border border-slate-200/10 dark:border-white/5">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500 rounded-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(139,92,246,0.4)]"
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </Card>
      </div>
    );
  },
);

SummaryCards.displayName = "SummaryCards";
