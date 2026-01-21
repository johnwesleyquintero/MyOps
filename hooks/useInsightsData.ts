import { useMemo } from "react";
import {
  TaskEntry,
  OperatorMetrics,
  Note,
  Contact,
  VaultEntry,
} from "../types";
import { Icon } from "../components/Icons";
import { MODULE_COLORS } from "../constants";

interface UseInsightsDataProps {
  entries: TaskEntry[];
  metrics: OperatorMetrics;
  notes?: Note[];
  contacts?: Contact[];
  vaultEntries?: VaultEntry[];
}

export const useInsightsData = ({
  entries,
  metrics,
  notes = [],
  contacts = [],
  vaultEntries = [],
}: UseInsightsDataProps) => {
  // Prepare data for project distribution pie chart
  const projectData = useMemo(() => {
    return Object.entries(
      entries.reduce(
        (acc, task) => {
          acc[task.project] = (acc[task.project] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>,
      ),
    ).map(([name, value]) => ({ name, value }));
  }, [entries]);

  // Prepare data for activity bar chart (last 7 days)
  const activityData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split("T")[0];
    }).reverse();

    return last7Days.map((date) => ({
      date: new Date(date).toLocaleDateString(undefined, { weekday: "short" }),
      completed: entries.filter((e) => e.date === date && e.status === "Done")
        .length,
      created: entries.filter((e) => e.createdAt?.startsWith(date)).length,
    }));
  }, [entries]);

  // Preparation for Radar Chart (Operator Skills)
  const radarData = useMemo(
    () => [
      {
        subject: "Consistency",
        A: Math.min(100, metrics.streak * 20),
        fullMark: 100,
      },
      {
        subject: "Velocity",
        A: Math.min(100, (metrics.totalTasksCompleted / 10) * 10),
        fullMark: 100,
      },
      { subject: "Focus", A: 85, fullMark: 100 }, // Placeholder for actual focus metrics
      { subject: "Reliability", A: 90, fullMark: 100 },
      {
        subject: "Growth",
        A: Math.min(100, metrics.level * 10),
        fullMark: 100,
      },
    ],
    [metrics],
  );

  // Artifacts definition with real-time progress
  const artifacts = useMemo(
    () => [
      {
        name: "Initiator",
        icon: Icon.Zap,
        condition: "Create 5 missions",
        current: entries.length,
        total: 5,
        isUnlocked: entries.length >= 5,
        colors: MODULE_COLORS.tasks,
      },
      {
        name: "Finisher",
        icon: Icon.Check,
        condition: "Complete 10 missions",
        current: metrics.totalTasksCompleted,
        total: 10,
        isUnlocked: metrics.totalTasksCompleted >= 10,
        colors: MODULE_COLORS.tasks,
      },
      {
        name: "Strategist",
        icon: Icon.Blueprint,
        condition: "3+ Active Projects",
        current: new Set(entries.map((e) => e.project)).size,
        total: 3,
        isUnlocked: new Set(entries.map((e) => e.project)).size >= 3,
        colors: MODULE_COLORS.strategy,
      },
      {
        name: "Knowledgeable",
        icon: Icon.Docs,
        condition: "Create 5 notes",
        current: notes.length,
        total: 5,
        isUnlocked: notes.length >= 5,
        colors: MODULE_COLORS.docs,
      },
      {
        name: "Vault Keeper",
        icon: Icon.Vault,
        condition: "Store 3 secrets",
        current: vaultEntries.length,
        total: 3,
        isUnlocked: vaultEntries.length >= 3,
        colors: MODULE_COLORS.vault,
      },
      {
        name: "Dependency",
        icon: Icon.Link,
        condition: "Link 1st dependency",
        current: entries.some((e) => (e.dependencies?.length ?? 0) > 0) ? 1 : 0,
        total: 1,
        isUnlocked: entries.some((e) => (e.dependencies?.length ?? 0) > 0),
        colors: MODULE_COLORS.automation,
      },
      {
        name: "Consistent",
        icon: Icon.Date,
        condition: "3-Day Streak",
        current: metrics.streak,
        total: 3,
        isUnlocked: metrics.streak >= 3,
        colors: MODULE_COLORS.awareness,
      },
      {
        name: "Elite Operator",
        icon: Icon.Active,
        condition: "Complete 25 missions",
        current: metrics.totalTasksCompleted,
        total: 25,
        isUnlocked: metrics.totalTasksCompleted >= 25,
        colors: MODULE_COLORS.analytics,
      },
      {
        name: "Networker",
        icon: Icon.Users,
        condition: "Save 5 contacts",
        current: contacts.length,
        total: 5,
        isUnlocked: contacts.length >= 5,
        colors: MODULE_COLORS.crm,
      },
      {
        name: "High Priority",
        icon: Icon.Alert,
        condition: "5 High Priority done",
        current: entries.filter(
          (e) => e.priority === "High" && e.status === "Done",
        ).length,
        total: 5,
        isUnlocked:
          entries.filter((e) => e.priority === "High" && e.status === "Done")
            .length >= 5,
        colors: MODULE_COLORS.life,
      },
      {
        name: "Veteran",
        icon: Icon.Missions,
        condition: "Reach Level 5",
        current: metrics.level,
        total: 5,
        isUnlocked: metrics.level >= 5,
        colors: MODULE_COLORS.ai,
      },
      {
        name: "Archon",
        icon: Icon.Bot,
        condition: "Reach Level 10",
        current: metrics.level,
        total: 10,
        isUnlocked: metrics.level >= 10,
        colors: MODULE_COLORS.ai,
      },
    ],
    [entries, metrics, notes, vaultEntries, contacts],
  );

  const unlockedCount = useMemo(
    () => artifacts.filter((a) => a.isUnlocked).length,
    [artifacts],
  );

  return useMemo(
    () => ({
      projectData,
      activityData,
      radarData,
      artifacts,
      unlockedCount,
    }),
    [projectData, activityData, radarData, artifacts, unlockedCount],
  );
};
