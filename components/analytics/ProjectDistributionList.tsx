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
    <div className="notion-card p-5 transition-colors duration-300 h-full flex flex-col">
      <h3 className="notion-label mb-4">Project Distribution</h3>
      <div className="space-y-3 flex-1 overflow-y-auto scrollbar-thin">
        {categoryData.length === 0 ? (
          <div className="text-sm text-notion-light-muted dark:text-notion-dark-muted italic">
            No active projects
          </div>
        ) : (
          categoryData.map((item) => (
            <div key={item.cat}>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-notion-light-text dark:text-notion-dark-text">
                  {item.cat}
                </span>
                <span className="font-mono text-notion-light-muted dark:text-notion-dark-muted">
                  {item.val} missions
                </span>
              </div>
              <div className="w-full bg-notion-light-hover dark:bg-notion-dark-hover rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-notion-light-text dark:bg-notion-dark-text h-1.5 rounded-full transition-all duration-500"
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
