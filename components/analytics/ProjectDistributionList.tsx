import React, { useMemo } from "react";
import { TaskEntry } from "../../types";
import { calculateProjectDistribution } from "../../utils/analyticsUtils";

interface ProjectDistributionListProps {
  entries: TaskEntry[];
  currency?: string;
  locale?: string;
}

export const ProjectDistributionList: React.FC<
  ProjectDistributionListProps
> = ({ entries }) => {
  // Using calculateProjectDistribution to get top projects by volume
  const categoryData = useMemo(
    () => calculateProjectDistribution(entries),
    [entries],
  );

  return (
    <div className="notion-card p-6 hover:shadow-xl transition-all duration-300 h-full flex flex-col border-slate-200/60 dark:border-white/5 bg-white dark:bg-notion-dark-sidebar/30">
      <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 mb-6">
        Project Distribution
      </h3>
      <div className="space-y-4 flex-1 overflow-y-auto scrollbar-thin pr-1">
        {categoryData.length === 0 ? (
          <div className="text-sm text-notion-light-muted dark:text-notion-dark-muted italic">
            No active projects
          </div>
        ) : (
          categoryData.map((item) => (
            <div key={item.cat} className="group/item">
              <div className="flex justify-between text-xs mb-1.5">
                <span className="font-black text-slate-700 dark:text-slate-300 uppercase tracking-tight">
                  {item.cat}
                </span>
                <span className="font-bold text-slate-400 dark:text-slate-500 text-[10px]">
                  {item.val} missions
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-white/5 rounded-full h-1.5 overflow-hidden border border-slate-200/5 dark:border-white/5">
                <div
                  className="bg-gradient-to-r from-indigo-500 to-blue-500 h-full rounded-full transition-all duration-700 group-hover/item:shadow-[0_0_8px_rgba(99,102,241,0.5)]"
                  style={{ width: `${item.pct}%` }}
                ></div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
