import React from "react";
import {
  TaskEntry,
  OperatorMetrics,
  Note,
  Contact,
  VaultEntry,
} from "../../types";
import { Icon, iconProps } from "../Icons";
import { ViewHeader } from "../ViewHeader";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
} from "recharts";

interface InsightsViewProps {
  entries: TaskEntry[];
  metrics: OperatorMetrics;
  notes?: Note[];
  contacts?: Contact[];
  vaultEntries?: VaultEntry[];
}

export const InsightsView: React.FC<InsightsViewProps> = ({
  entries,
  metrics,
  notes = [],
  contacts = [],
  vaultEntries = [],
}) => {
  // Prepare data for project distribution pie chart
  const projectData = Object.entries(
    entries.reduce(
      (acc, task) => {
        acc[task.project] = (acc[task.project] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    ),
  ).map(([name, value]) => ({ name, value }));

  const COLORS = [
    "#37352F", // Notion Light Text
    "#787774", // Notion Light Muted
    "#E9E9E8", // Notion Light Border
    "#F7F6F3", // Notion Light Sidebar
    "#2383E2", // Notion Blue (Standard)
    "#D44028", // Notion Red
  ];

  // Prepare data for activity bar chart (last 7 days)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toISOString().split("T")[0];
  }).reverse();

  const activityData = last7Days.map((date) => ({
    date: new Date(date).toLocaleDateString(undefined, { weekday: "short" }),
    completed: entries.filter((e) => e.date === date && e.status === "Done")
      .length,
    created: entries.filter((e) => e.createdAt?.startsWith(date)).length,
  }));

  // Preparation for Radar Chart (Operator Skills)
  const radarData = [
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
    { subject: "Growth", A: Math.min(100, metrics.level * 10), fullMark: 100 },
  ];

  // Artifacts definition with real-time progress
  const artifacts = [
    {
      name: "Initiator",
      icon: <Icon.Zap size={24} />,
      condition: "Create 5 missions",
      current: entries.length,
      total: 5,
      isUnlocked: entries.length >= 5,
    },
    {
      name: "Finisher",
      icon: <Icon.Check size={24} />,
      condition: "Complete 10 missions",
      current: metrics.totalTasksCompleted,
      total: 10,
      isUnlocked: metrics.totalTasksCompleted >= 10,
    },
    {
      name: "Strategist",
      icon: <Icon.Blueprint size={24} />,
      condition: "3+ Active Projects",
      current: new Set(entries.map((e) => e.project)).size,
      total: 3,
      isUnlocked: new Set(entries.map((e) => e.project)).size >= 3,
    },
    {
      name: "Knowledgeable",
      icon: <Icon.Docs size={24} />,
      condition: "Create 5 notes",
      current: notes.length,
      total: 5,
      isUnlocked: notes.length >= 5,
    },
    {
      name: "Vault Keeper",
      icon: <Icon.Vault size={24} />,
      condition: "Store 3 secrets",
      current: vaultEntries.length,
      total: 3,
      isUnlocked: vaultEntries.length >= 3,
    },
    {
      name: "Dependency",
      icon: <Icon.Link size={24} />,
      condition: "Link 1st dependency",
      current: entries.some((e) => (e.dependencies?.length ?? 0) > 0) ? 1 : 0,
      total: 1,
      isUnlocked: entries.some((e) => (e.dependencies?.length ?? 0) > 0),
    },
    {
      name: "Consistent",
      icon: <Icon.Date size={24} />,
      condition: "3-Day Streak",
      current: metrics.streak,
      total: 3,
      isUnlocked: metrics.streak >= 3,
    },
    {
      name: "Elite Operator",
      icon: <Icon.Active size={24} />,
      condition: "Complete 25 missions",
      current: metrics.totalTasksCompleted,
      total: 25,
      isUnlocked: metrics.totalTasksCompleted >= 25,
    },
    {
      name: "Networker",
      icon: <Icon.Users size={24} />,
      condition: "Save 5 contacts",
      current: contacts.length,
      total: 5,
      isUnlocked: contacts.length >= 5,
    },
    {
      name: "High Priority",
      icon: <Icon.Alert size={24} />,
      condition: "5 High Priority done",
      current: entries.filter(
        (e) => e.priority === "High" && e.status === "Done",
      ).length,
      total: 5,
      isUnlocked:
        entries.filter((e) => e.priority === "High" && e.status === "Done")
          .length >= 5,
    },
    {
      name: "Veteran",
      icon: <Icon.Missions size={24} />,
      condition: "Reach Level 5",
      current: metrics.level,
      total: 5,
      isUnlocked: metrics.level >= 5,
    },
    {
      name: "Archon",
      icon: <Icon.Bot size={24} />,
      condition: "Reach Level 10",
      current: metrics.level,
      total: 10,
      isUnlocked: metrics.level >= 10,
    },
  ];

  const unlockedCount = artifacts.filter((a) => a.isUnlocked).length;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
      <ViewHeader
        title="Operator Insights"
        subTitle="Analyze your growth and operational velocity"
      >
        <div className="px-4 py-2 bg-notion-light-sidebar dark:bg-notion-dark-sidebar rounded-xl border border-notion-light-border dark:border-notion-dark-border">
          <span className="text-[10px] font-black text-notion-light-muted dark:text-notion-dark-muted uppercase tracking-widest block">
            Last Sync
          </span>
          <span className="text-sm font-bold text-notion-light-text dark:text-notion-dark-text">
            Just now
          </span>
        </div>
      </ViewHeader>

      {/* Gamification Layer */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-notion-light-text dark:bg-notion-dark-text rounded-2xl p-6 text-notion-light-bg dark:text-notion-dark-bg shadow-xl relative overflow-hidden">
          <div className="absolute right-[-10%] top-[-10%] opacity-10 rotate-12">
            <Icon.Active size={120} />
          </div>
          <p className="opacity-70 text-[10px] font-black uppercase tracking-widest mb-1">
            Operator Level
          </p>
          <div className="flex items-end gap-2 mb-4">
            <h2 className="text-5xl font-black leading-none">
              {metrics.level}
            </h2>
            <span className="opacity-70 text-xs font-bold mb-1">
              Rank: Specialist
            </span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-[10px] font-bold uppercase">
              <span>XP Progress</span>
              <span>{metrics.xp % 1000} / 1000</span>
            </div>
            <div className="h-2 bg-white/20 dark:bg-black/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-notion-light-bg dark:bg-notion-dark-bg transition-all duration-1000"
                style={{ width: `${(metrics.xp % 1000) / 10}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="bg-notion-light-bg dark:bg-notion-dark-bg border border-notion-light-border dark:border-notion-dark-border rounded-2xl p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-notion-light-sidebar dark:bg-notion-dark-sidebar text-notion-light-text dark:text-notion-dark-text rounded-xl border border-notion-light-border dark:border-notion-dark-border">
              <Icon.Active {...iconProps(24)} />
            </div>
            <span className="text-[10px] font-black text-notion-light-text dark:text-notion-dark-text bg-notion-light-sidebar dark:bg-notion-dark-sidebar px-2 py-0.5 rounded uppercase tracking-wider border border-notion-light-border dark:border-notion-dark-border">
              {metrics.streak > 0 ? "ACTIVE" : "IDLE"}
            </span>
          </div>
          <p className="text-notion-light-muted dark:text-notion-dark-muted text-[10px] font-black uppercase tracking-widest mb-1">
            Daily Streak
          </p>
          <h2 className="text-3xl font-black text-notion-light-text dark:text-notion-dark-text">
            {metrics.streak} Days
          </h2>
          <p className="text-notion-light-muted dark:text-notion-dark-muted text-xs mt-2 font-medium">
            Keep the momentum alive!
          </p>
        </div>

        <div className="bg-notion-light-bg dark:bg-notion-dark-bg border border-notion-light-border dark:border-notion-dark-border rounded-2xl p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-notion-light-sidebar dark:bg-notion-dark-sidebar text-notion-light-text dark:text-notion-dark-text rounded-xl border border-notion-light-border dark:border-notion-dark-border">
              <Icon.Check {...iconProps(24)} />
            </div>
          </div>
          <p className="text-notion-light-muted dark:text-notion-dark-muted text-[10px] font-black uppercase tracking-widest mb-1">
            Completed
          </p>
          <h2 className="text-3xl font-black text-notion-light-text dark:text-notion-dark-text">
            {metrics.totalTasksCompleted}
          </h2>
          <p className="text-notion-light-muted dark:text-notion-dark-muted text-xs mt-2 font-medium">
            Total missions accomplished
          </p>
        </div>

        <div className="bg-notion-light-bg dark:bg-notion-dark-bg border border-notion-light-border dark:border-notion-dark-border rounded-2xl p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-notion-light-sidebar dark:bg-notion-dark-sidebar text-notion-light-text dark:text-notion-dark-text rounded-xl border border-notion-light-border dark:border-notion-dark-border">
              <Icon.Project {...iconProps(24)} />
            </div>
          </div>
          <p className="text-notion-light-muted dark:text-notion-dark-muted text-[10px] font-black uppercase tracking-widest mb-1">
            Artifacts
          </p>
          <h2 className="text-3xl font-black text-notion-light-text dark:text-notion-dark-text">
            {metrics.artifactsGained}
          </h2>
          <p className="text-notion-light-muted dark:text-notion-dark-muted text-xs mt-2 font-medium">
            Rare gains from consistency
          </p>
        </div>
      </div>

      {/* Top Section: Operator Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-notion-light-bg dark:bg-notion-dark-bg p-6 rounded-2xl border border-notion-light-border dark:border-notion-dark-border">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-notion-light-sidebar dark:bg-notion-dark-sidebar text-notion-light-text dark:text-notion-dark-text rounded-lg border border-notion-light-border dark:border-notion-dark-border">
              <Icon.Active size={18} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-notion-light-muted dark:text-notion-dark-muted">
              Operator XP
            </span>
          </div>
          <div className="space-y-2">
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-black text-notion-light-text dark:text-notion-dark-text">
                {metrics.xp}
              </span>
              <span className="text-[10px] font-bold text-notion-light-text dark:text-notion-dark-text opacity-60 uppercase">
                Level {metrics.level}
              </span>
            </div>
            <div className="h-1.5 bg-notion-light-sidebar dark:bg-notion-dark-sidebar rounded-full overflow-hidden">
              <div
                className="h-full bg-notion-light-text dark:bg-notion-dark-text transition-all duration-1000"
                style={{ width: `${(metrics.xp % 1000) / 10}%` }}
              />
            </div>
            <p className="text-[10px] text-notion-light-muted dark:text-notion-dark-muted font-medium">
              {1000 - (metrics.xp % 1000)} XP to next level
            </p>
          </div>
        </div>

        <div className="bg-notion-light-bg dark:bg-notion-dark-bg p-6 rounded-2xl border border-notion-light-border dark:border-notion-dark-border">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-notion-light-sidebar dark:bg-notion-dark-sidebar text-notion-light-text dark:text-notion-dark-text rounded-lg border border-notion-light-border dark:border-notion-dark-border">
              <Icon.Zap size={18} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-notion-light-muted dark:text-notion-dark-muted">
              Current Streak
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-notion-light-text dark:text-notion-dark-text">
              {metrics.streak}
            </span>
            <span className="text-xs font-bold text-notion-light-text dark:text-notion-dark-text opacity-60 uppercase">
              Days
            </span>
          </div>
          <p className="text-[10px] text-notion-light-muted dark:text-notion-dark-muted mt-2 font-medium">
            Keep the momentum going!
          </p>
        </div>

        <div className="bg-notion-light-bg dark:bg-notion-dark-bg p-6 rounded-2xl border border-notion-light-border dark:border-notion-dark-border">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-notion-light-sidebar dark:bg-notion-dark-sidebar text-notion-light-text dark:text-notion-dark-text rounded-lg border border-notion-light-border dark:border-notion-dark-border">
              <Icon.Project size={18} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-notion-light-muted dark:text-notion-dark-muted">
              Artifacts
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-notion-light-text dark:text-notion-dark-text">
              {metrics.artifactsGained}
            </span>
            <span className="text-xs font-bold text-notion-light-text dark:text-notion-dark-text opacity-60 uppercase">
              Unlocked
            </span>
          </div>
          <p className="text-[10px] text-notion-light-muted dark:text-notion-dark-muted mt-2 font-medium">
            Rare operational achievements
          </p>
        </div>

        <div className="bg-notion-light-bg dark:bg-notion-dark-bg p-6 rounded-2xl border border-notion-light-border dark:border-notion-dark-border">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-notion-light-sidebar dark:bg-notion-dark-sidebar text-notion-light-text dark:text-notion-dark-text rounded-lg border border-notion-light-border dark:border-notion-dark-border">
              <Icon.Check size={18} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-notion-light-muted dark:text-notion-dark-muted">
              Total Missions
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-notion-light-text dark:text-notion-dark-text">
              {metrics.totalTasksCompleted}
            </span>
            <span className="text-xs font-bold text-notion-light-text dark:text-notion-dark-text opacity-60 uppercase">
              Done
            </span>
          </div>
          <p className="text-[10px] text-notion-light-muted dark:text-notion-dark-muted mt-2 font-medium">
            Lifetime operational success
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Activity Chart */}
        <div className="bg-notion-light-bg dark:bg-notion-dark-bg border border-notion-light-border dark:border-notion-dark-border rounded-2xl p-8">
          <h3 className="text-sm font-black text-notion-light-text dark:text-notion-dark-text mb-8 uppercase tracking-widest">
            Operational Velocity
          </h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activityData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="currentColor"
                  className="text-notion-light-border dark:text-notion-dark-border"
                />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "currentColor", fontSize: 10, fontWeight: 700 }}
                  className="text-notion-light-muted dark:text-notion-dark-muted"
                  dy={10}
                />
                <YAxis hide />
                <Tooltip
                  cursor={{ fill: "currentColor", opacity: 0.1 }}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid currentColor",
                    boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                    backgroundColor: "var(--notion-bg)",
                    color: "var(--notion-text)",
                  }}
                  itemStyle={{
                    fontSize: "10px",
                    fontWeight: "bold",
                    textTransform: "uppercase",
                  }}
                />
                <Bar
                  dataKey="completed"
                  fill="currentColor"
                  className="text-notion-light-text dark:text-notion-dark-text"
                  radius={[4, 4, 0, 0]}
                  barSize={20}
                />
                <Bar
                  dataKey="created"
                  fill="currentColor"
                  className="text-notion-light-border dark:text-notion-dark-border"
                  radius={[4, 4, 0, 0]}
                  barSize={20}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center gap-6 mt-6">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-notion-light-text dark:bg-notion-dark-text"></div>
              <span className="text-[10px] font-black uppercase tracking-wider text-notion-light-muted dark:text-notion-dark-muted">
                Completed
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-notion-light-border dark:bg-notion-dark-border border border-notion-light-border dark:border-notion-dark-border"></div>
              <span className="text-[10px] font-black uppercase tracking-wider text-notion-light-muted dark:text-notion-dark-muted">
                New Tasks
              </span>
            </div>
          </div>
        </div>

        {/* Radar & Pie Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-notion-light-bg dark:bg-notion-dark-bg border border-notion-light-border dark:border-notion-dark-border rounded-2xl p-8">
            <h3 className="text-[10px] font-black text-notion-light-text dark:text-notion-dark-text mb-6 uppercase tracking-widest">
              Project Mix
            </h3>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={projectData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {projectData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                        stroke="none"
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-notion-light-bg dark:bg-notion-dark-bg border border-notion-light-border dark:border-notion-dark-border rounded-2xl p-8">
            <h3 className="text-[10px] font-black text-notion-light-text dark:text-notion-dark-text mb-6 uppercase tracking-widest">
              Operator Skills
            </h3>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart
                  cx="50%"
                  cy="50%"
                  outerRadius="80%"
                  data={radarData}
                >
                  <PolarGrid
                    stroke="currentColor"
                    className="text-notion-light-border dark:text-notion-dark-border"
                  />
                  <PolarAngleAxis
                    dataKey="subject"
                    tick={{
                      fill: "currentColor",
                      fontSize: 8,
                      fontWeight: 800,
                    }}
                    className="text-notion-light-muted dark:text-notion-dark-muted uppercase"
                  />
                  <Radar
                    name="Operator"
                    dataKey="A"
                    stroke="currentColor"
                    fill="currentColor"
                    fillOpacity={0.6}
                    className="text-notion-light-text dark:text-notion-dark-text"
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Artifacts Gallery */}
      <div className="bg-notion-light-bg dark:bg-notion-dark-bg p-8 rounded-2xl border border-notion-light-border dark:border-notion-dark-border">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-xl font-black text-notion-light-text dark:text-notion-dark-text uppercase tracking-widest">
              Artifact <span className="opacity-50">Gallery</span>
            </h2>
            <p className="text-[10px] font-bold text-notion-light-muted dark:text-notion-dark-muted mt-1 uppercase tracking-wider">
              Earned operational badges and rare items
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 bg-notion-light-sidebar dark:bg-notion-dark-sidebar text-notion-light-text dark:text-notion-dark-text rounded-lg border border-notion-light-border dark:border-notion-dark-border text-[10px] font-black uppercase tracking-widest">
            {unlockedCount} / {artifacts.length} Discovered
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {artifacts.map((artifact, index) => (
            <div
              key={index}
              className={`group relative flex flex-col items-center justify-center p-6 rounded-2xl border transition-all duration-300 ${
                artifact.isUnlocked
                  ? "bg-notion-light-bg dark:bg-notion-dark-bg border-notion-light-border dark:border-notion-dark-border text-notion-light-text dark:text-notion-dark-text shadow-sm hover:shadow-md hover:scale-[1.02]"
                  : "bg-notion-light-sidebar dark:bg-notion-dark-sidebar border-notion-light-border dark:border-notion-dark-border text-notion-light-muted dark:text-notion-dark-muted grayscale opacity-40"
              }`}
            >
              <div
                className={`mb-3 transition-transform duration-300 ${artifact.isUnlocked ? "group-hover:scale-110 group-hover:rotate-6" : ""}`}
              >
                {artifact.icon}
              </div>
              <span
                className={`text-[10px] font-black uppercase tracking-widest text-center leading-tight ${artifact.isUnlocked ? "text-notion-light-text dark:text-notion-dark-text" : "text-notion-light-muted dark:text-notion-dark-muted"}`}
              >
                {artifact.name}
              </span>

              {/* Tooltip on Hover */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-32 p-2 bg-notion-light-text dark:bg-notion-dark-text text-notion-light-bg dark:text-notion-dark-bg text-[10px] font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 text-center shadow-xl border border-notion-light-border dark:border-notion-dark-border">
                <p className="uppercase tracking-widest mb-1 opacity-50">
                  {artifact.isUnlocked ? "Unlocked" : "Locked"}
                </p>
                <p className="leading-snug">{artifact.condition}</p>
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-notion-light-text dark:border-t-notion-dark-text"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
