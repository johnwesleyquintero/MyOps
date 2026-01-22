import { useMemo } from "react";
import { useData } from "./useData";
import { ProjectDebrief } from "../components/analytics/ProjectDebriefPanel";

export interface EmpirePulseData {
  overallAccuracy: number;
  totalXp: number;
  activeStreak: number;
  topProject: ProjectDebrief | null;
  projectsAtRisk: number;
  peakStateSessions: number;
  calibrationTrend: "improving" | "declining" | "stable";
  commanderBriefing: string;
  weeklyActivity: number[];
  decisionInsights: {
    total: number;
    highImpact: number;
    avgConfidence: number;
    calibrationGap: number;
  };
  streakTrend: number[];
}

export const useEmpirePulse = (): EmpirePulseData => {
  const { tasks, strategy, operatorMetrics } = useData();
  const { entries: taskEntries } = tasks;
  const { decisions } = strategy;

  const projectMomentum = useMemo(() => {
    const projects: Record<
      string,
      {
        xp: number;
        completedTasks: number;
        totalTasks: number;
        decisions: number;
        accuracy: number;
        accuracyCount: number;
        lastActive: string;
        peakStateCount: number;
        recentActivity: number[];
        reflections: number;
      }
    > = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    taskEntries.forEach((t) => {
      const p = t.project || "General";
      if (!projects[p]) {
        projects[p] = {
          xp: 0,
          completedTasks: 0,
          totalTasks: 0,
          decisions: 0,
          accuracy: 0,
          accuracyCount: 0,
          lastActive: "",
          peakStateCount: 0,
          recentActivity: Array(7).fill(0),
          reflections: 0,
        };
      }
      projects[p].totalTasks += 1;
      if (t.status === "Done") {
        projects[p].completedTasks += 1;
        projects[p].xp += t.xpAwarded || 10;
        if (t.date) {
          if (!projects[p].lastActive || t.date > projects[p].lastActive) {
            projects[p].lastActive = t.date;
          }
        }
      }
    });

    decisions.forEach((d) => {
      const p = d.project || "General";
      if (!projects[p]) {
        projects[p] = {
          xp: 0,
          completedTasks: 0,
          totalTasks: 0,
          decisions: 0,
          accuracy: 0,
          accuracyCount: 0,
          lastActive: "",
          peakStateCount: 0,
          recentActivity: Array(7).fill(0),
          reflections: 0,
        };
      }
      projects[p].decisions += 1;
      if (d.status === "REVIEWED") {
        const normalizedImpact = (d.impact / 5) * 100;
        const confidence = d.confidenceScore || 50;
        const diff = Math.abs(normalizedImpact - confidence);
        projects[p].accuracy += 100 - diff;
        projects[p].accuracyCount += 1;
      }
      if (
        d.biometricContext?.energy === "high" &&
        d.biometricContext?.clarity === "sharp"
      ) {
        projects[p].peakStateCount += 1;
      }
    });

    return Object.entries(projects).map(([name, data]) => {
      const momentum = data.completedTasks + data.decisions;
      return {
        name,
        xp: data.xp,
        completionRate: data.totalTasks
          ? Math.round((data.completedTasks / data.totalTasks) * 100)
          : 0,
        accuracy: data.accuracyCount
          ? Math.round(data.accuracy / data.accuracyCount)
          : 0,
        momentum,
        peakStateMultiplier:
          momentum > 0
            ? (1 + data.peakStateCount / momentum).toFixed(2)
            : "1.00",
        trend: "stable",
        isAtRisk: data.totalTasks > 0 && data.completedTasks === 0,
        riskFactor: "Low",
        reflections: data.reflections,
        recentActivity: data.recentActivity,
      } as ProjectDebrief;
    });
  }, [taskEntries, decisions]);

  const stats = useMemo(() => {
    const totalAccuracy = projectMomentum.reduce(
      (acc, p) => acc + p.accuracy,
      0,
    );
    const avgAccuracy =
      projectMomentum.length > 0
        ? Math.round(totalAccuracy / projectMomentum.length)
        : 0;
    const projectsAtRisk = projectMomentum.filter((p) => p.isAtRisk).length;
    const topProject =
      projectMomentum.length > 0
        ? [...projectMomentum].sort((a, b) => b.momentum - a.momentum)[0]
        : null;

    // Weekly activity aggregation
    const weeklyActivity: number[] = Array(7).fill(0);
    const streakTrend: number[] = Array(7).fill(0);
    const now = new Date();

    taskEntries.forEach((t) => {
      if (t.status === "Done" && t.date) {
        const taskDate = new Date(t.date);
        const diffDays = Math.floor(
          (now.getTime() - taskDate.getTime()) / (1000 * 3600 * 24),
        );
        if (diffDays >= 0 && diffDays < 7) {
          weeklyActivity[6 - diffDays]++;
        }
      }
    });

    // Mock streak trend based on active streak
    for (let i = 0; i < 7; i++) {
      streakTrend[i] = Math.max(0, operatorMetrics.streak - (6 - i));
    }

    // Decision Insights
    const highImpactDecisions = decisions.filter((d) => d.impact >= 4).length;
    const avgConfidence =
      decisions.length > 0
        ? Math.round(
            decisions.reduce((acc, d) => acc + (d.confidenceScore || 0), 0) /
              decisions.length,
          )
        : 0;
    const calibrationGap = Math.abs(avgAccuracy - avgConfidence);

    // Calibration trend
    const calibrationTrend: "improving" | "declining" | "stable" =
      avgAccuracy > 80
        ? "improving"
        : avgAccuracy > 60
          ? "stable"
          : "declining";

    // Briefing generation
    let briefing = `Operator status is ${operatorMetrics.streak > 5 ? "OPTIMAL" : "STABLE"}. `;
    if (topProject) {
      briefing += `The ${topProject.name} theater is currently your primary momentum driver with a ${topProject.peakStateMultiplier}x peak-state multiplier. `;
    }
    if (projectsAtRisk > 0) {
      briefing += `Warning: ${projectsAtRisk} project(s) are currently showing signs of stagnation. `;
    }
    briefing += `Strategic accuracy is holding at ${avgAccuracy}%, suggesting ${calibrationTrend === "improving" ? "high" : "moderate"} alignment between intuition and outcome.`;

    return {
      overallAccuracy: avgAccuracy,
      totalXp: operatorMetrics.xp,
      activeStreak: operatorMetrics.streak,
      topProject,
      projectsAtRisk,
      peakStateSessions: operatorMetrics.peakStateCompletions,
      calibrationTrend,
      commanderBriefing: briefing,
      weeklyActivity,
      decisionInsights: {
        total: decisions.length,
        highImpact: highImpactDecisions,
        avgConfidence,
        calibrationGap,
      },
      streakTrend,
    };
  }, [projectMomentum, operatorMetrics, taskEntries, decisions]);

  return stats;
};
