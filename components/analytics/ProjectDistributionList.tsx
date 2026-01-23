import React, { useMemo } from "react";
import { TaskEntry } from "../../types";
import { calculateProjectDistribution } from "../../utils/analyticsUtils";

import { Card, Badge } from "../ui";

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
    <Card
      hoverEffect
      className="h-full flex flex-col border-slate-200/60 dark:border-white/5"
    >
      <Badge
        variant="ghost"
        size="xs"
        className="!p-0 uppercase tracking-[0.2em] opacity-50 font-black mb-6"
      >
        Project Distribution
      </Badge>
      <div className="space-y-4 flex-1 overflow-y-auto scrollbar-thin pr-1">
        {categoryData.length === 0 ? (
          <div className="text-sm text-notion-light-muted dark:text-notion-dark-muted italic">
            No active projects
          </div>
        ) : (
          categoryData.map((item) => (
            <div key={item.cat} className="group/item">
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="font-black text-slate-700 dark:text-slate-300 uppercase tracking-tight">
                  {item.cat}
                </span>
                <Badge
                  variant="ghost"
                  size="xs"
                  className="opacity-60 lowercase !tracking-normal"
                >
                  {item.val} missions
                </Badge>
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
    </Card>
  );
};
