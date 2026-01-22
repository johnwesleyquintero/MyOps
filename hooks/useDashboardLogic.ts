import { useMemo } from "react";
import { TaskEntry, OperatorMetrics, DecisionEntry } from "../types";
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
  decisions?: DecisionEntry[];
}

export const useDashboardLogic = ({
  entries,
  operatorMetrics,
  decisions = [],
}: UseDashboardLogicProps) => {
  const tacticalFocus = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];

    // Pre-calculate which tasks are blocking others to avoid O(n^2) complexity
    const blockingTasks = new Set<string>();
    entries.forEach((e) => {
      if (e.status !== "Done" && e.dependencies) {
        e.dependencies.forEach((depId) => blockingTasks.add(depId));
      }
    });

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
        if (blockingTasks.has(t.id)) score += 2;

        return { ...t, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
  }, [entries]);

  const xpProgress = (operatorMetrics.xp % 1000) / 10; // Simple XP bar logic

  const predictiveMetrics = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    const pendingTasks = entries.filter((e) => e.status !== "Done");

    // Calculate base XP for pending tasks
    const basePendingXP = pendingTasks.reduce((acc, t) => {
      const base =
        t.priority === "High" ? 150 : t.priority === "Medium" ? 120 : 100;
      return acc + base;
    }, 0);

    // Calculate multiplier based on current mental state (simplified for prediction)
    // In a real app, this would be more complex
    const estimatedMultiplier = 1.1; // Assume slight positive bias for prediction

    const predictedXP = Math.round(basePendingXP * estimatedMultiplier);

    // Streak Forecast
    const streakForecast = operatorMetrics.streak + 1;
    const isStreakAtRisk =
      !operatorMetrics.lastActiveDate || operatorMetrics.lastActiveDate < today;

    return {
      predictedXP,
      streakForecast,
      isStreakAtRisk,
      potentialLevel: Math.floor((operatorMetrics.xp + predictedXP) / 1000) + 1,
    };
  }, [entries, operatorMetrics]);

  const calibrationMetrics = useMemo(() => {
    if (!decisions.length) return { calibrationScore: 0, bias: "neutral" };

    const reviewedDecisions = decisions.filter((d) => d.status === "REVIEWED");
    if (!reviewedDecisions.length)
      return { calibrationScore: 50, bias: "neutral" };

    // Simple calibration: How close was confidence to impact?
    // impact is 1-5, confidence is 1-100
    const totalDiff = reviewedDecisions.reduce((acc, d) => {
      const normalizedImpact = (d.impact / 5) * 100;
      const confidence = d.confidenceScore || 50;
      return acc + Math.abs(normalizedImpact - confidence);
    }, 0);

    const avgDiff = totalDiff / reviewedDecisions.length;
    const calibrationScore = Math.max(0, Math.round(100 - avgDiff));

    // Determine bias (overconfident vs underconfident)
    const totalBias = reviewedDecisions.reduce((acc, d) => {
      const normalizedImpact = (d.impact / 5) * 100;
      const confidence = d.confidenceScore || 50;
      return acc + (confidence - normalizedImpact);
    }, 0);

    const avgBias = totalBias / reviewedDecisions.length;
    const bias = avgBias > 10 ? "over" : avgBias < -10 ? "under" : "calibrated";

    return { calibrationScore, bias };
  }, [decisions]);

  const { columns, toggleColumn } = useTableColumns(
    DASHBOARD_COLUMNS as ColumnConfig[],
    COLUMN_CONFIG_KEY,
  );

  return useMemo(
    () => ({
      tacticalFocus,
      xpProgress,
      predictiveMetrics,
      calibrationMetrics,
      columns,
      toggleColumn,
    }),
    [
      tacticalFocus,
      xpProgress,
      predictiveMetrics,
      calibrationMetrics,
      columns,
      toggleColumn,
    ],
  );
};
