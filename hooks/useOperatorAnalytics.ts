import { useMemo } from "react";
import { TaskEntry, OperatorMetrics, MentalStateEntry } from "../types";

export const useOperatorAnalytics = (
  entries: TaskEntry[],
  mentalStates: MentalStateEntry[] = [],
) => {
  const metrics: OperatorMetrics = useMemo(() => {
    const doneTasks = entries.filter((e) => e.status === "Done");
    const totalTasksCompleted = doneTasks.length;

    // XP: Use xpAwarded if present, otherwise default to 100 per task
    const xp = doneTasks.reduce(
      (acc, task) => acc + (task.xpAwarded ?? 100),
      0,
    );

    // Level: 1000 XP per level
    const level = Math.floor(xp / 1000) + 1;

    // Streak calculation (consecutive days with completed tasks)
    const completionDates = Array.from(
      new Set(
        doneTasks
          .map((e) => e.date)
          .filter(Boolean)
          .sort((a, b) => new Date(b).getTime() - new Date(a).getTime()),
      ),
    );

    let streak = 0;
    if (completionDates.length > 0) {
      const now = new Date();
      const today = now.toISOString().split("T")[0];
      const yesterdayDate = new Date(now);
      yesterdayDate.setDate(yesterdayDate.getDate() - 1);
      const yesterday = yesterdayDate.toISOString().split("T")[0];

      const lastDate = completionDates[0];

      // If the most recent completion wasn't today or yesterday, streak is 0
      if (lastDate === today || lastDate === yesterday) {
        streak = 1;
        for (let i = 1; i < completionDates.length; i++) {
          const d1 = new Date(completionDates[i - 1]);
          const d2 = new Date(completionDates[i]);
          const diffDays = Math.round(
            (d1.getTime() - d2.getTime()) / (1000 * 3600 * 24),
          );

          if (diffDays === 1) {
            streak++;
          } else {
            break;
          }
        }
      }
    }

    // Peak State Completions
    const peakStateCompletions = doneTasks.filter((task) => {
      const stateOnDate = mentalStates.find((m) => m.date === task.date);
      return stateOnDate?.energy === "high" && stateOnDate?.clarity === "sharp";
    }).length;

    // Artifacts: 1 artifact per 5 tasks
    const artifactsGained = Math.floor(totalTasksCompleted / 5);

    return {
      xp,
      level,
      streak,
      artifactsGained,
      totalTasksCompleted,
      lastActiveDate: completionDates[0] || "",
      peakStateCompletions,
    };
  }, [entries, mentalStates]);

  return metrics;
};
