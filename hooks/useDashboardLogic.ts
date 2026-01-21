import { useMemo } from "react";
import { TaskEntry, OperatorMetrics } from "../types";
import { useTableColumns, ColumnConfig } from "./useTableColumns";
import { COLUMN_CONFIG_KEY } from "../constants/storage";

export const DASHBOARD_COLUMNS = [
  { key: "date", label: "Due", visible: true, width: "w-32" },
  {
    key: "description",
    label: "Mission",
    visible: true,
    width: "min-w-[300px]",
  },
  { key: "project", label: "Project", visible: true, width: "w-32" },
  { key: "priority", label: "Priority", visible: true, width: "w-28" },
  { key: "status", label: "Status", visible: true, width: "w-32" },
];

interface UseDashboardLogicProps {
  entries: TaskEntry[];
  operatorMetrics: OperatorMetrics;
}

export const useDashboardLogic = ({
  entries,
  operatorMetrics,
}: UseDashboardLogicProps) => {
  const tacticalFocus = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];

    return entries
      .filter((e) => e.status !== "Done")
      .map((t) => {
        let score = 0;
        // Priority Score
        if (t.priority === "High") score += 3;
        // Date Score (Overdue is highest priority)
        if (t.date < today) score += 5;
        // Imminent (Due today or tomorrow)
        else if (t.date === today) score += 2;

        // Dependency Score (Blocking others)
        const isBlockingOthers = entries.some(
          (other) =>
            other.dependencies?.includes(t.id) && other.status !== "Done",
        );
        if (isBlockingOthers) score += 2;

        return { ...t, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
  }, [entries]);

  const xpProgress = (operatorMetrics.xp % 1000) / 10; // Simple XP bar logic

  const { columns, toggleColumn } = useTableColumns(
    DASHBOARD_COLUMNS as ColumnConfig[],
    COLUMN_CONFIG_KEY,
  );

  return {
    tacticalFocus,
    xpProgress,
    columns,
    toggleColumn,
  };
};
