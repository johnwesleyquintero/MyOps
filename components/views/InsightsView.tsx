import React, { useState } from "react";
import {
  TaskEntry,
  OperatorMetrics,
  Note,
  Contact,
  VaultEntry,
} from "../../types";
import { Icon, iconProps } from "../Icons";
import { Button } from "../ui";
import { ViewHeader } from "../ViewHeader";
import { toast } from "sonner";
import {
  MODULE_COLORS,
  INSIGHTS_CHART_COLORS,
  BUTTON_STYLES,
} from "@/constants";
import { useInsightsData } from "@/hooks/useInsightsData";
import { generateInsightsMarkdown } from "@/utils/exportUtils";
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

export const InsightsView: React.FC<InsightsViewProps> = React.memo(
  ({ entries, metrics, notes = [], contacts = [], vaultEntries = [] }) => {
    const [copied, setCopied] = useState(false);
    const colors = MODULE_COLORS.analytics;

    const { projectData, activityData, radarData, artifacts, unlockedCount } =
      useInsightsData({
        entries,
        metrics,
        notes,
        contacts,
        vaultEntries,
      });

    const handleCopyInsights = () => {
      const md = generateInsightsMarkdown({
        metrics,
        projectData,
        activityData,
        radarData,
        artifacts,
      });

      navigator.clipboard.writeText(md).then(() => {
        setCopied(true);
        toast.success("Insights copied to clipboard", {
          description: "Dashboard data formatted as Markdown.",
          icon: <Icon.Copy size={14} />,
        });
        setTimeout(() => setCopied(false), 2000);
      });
    };

    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
        <ViewHeader
          title="Operator Insights"
          subTitle="Analyze your growth and operational velocity"
        >
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <Button
              variant="ghost"
              onClick={handleCopyInsights}
              className={`w-full sm:w-auto ${BUTTON_STYLES.base} ${BUTTON_STYLES.padding} ${BUTTON_STYLES.rounded} bg-notion-light-bg dark:bg-notion-dark-bg hover:bg-notion-light-sidebar dark:hover:bg-notion-dark-sidebar border border-notion-light-border dark:border-notion-dark-border text-notion-light-text dark:text-notion-dark-text group`}
              title="Copy Insights as Markdown"
              leftIcon={
                copied ? (
                  <Icon.Check size={14} className={MODULE_COLORS.crm.text} />
                ) : (
                  <Icon.Copy
                    size={14}
                    className="opacity-60 group-hover:opacity-100"
                  />
                )
              }
            >
              <span className="uppercase tracking-widest">
                {copied ? "Copied!" : "COPY INSIGHTS"}
              </span>
            </Button>

            <div className="w-full sm:w-auto px-4 py-2 bg-notion-light-sidebar dark:bg-notion-dark-sidebar rounded-xl border border-notion-light-border dark:border-notion-dark-border flex flex-col items-center sm:items-start min-w-[120px]">
              <span className="text-[10px] font-black text-notion-light-muted dark:text-notion-dark-muted uppercase tracking-widest block">
                Last Sync
              </span>
              <span className="text-sm font-bold text-notion-light-text dark:text-notion-dark-text">
                Just now
              </span>
            </div>
          </div>
        </ViewHeader>

        {/* Gamification Layer */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div
            className={`rounded-2xl p-6 text-notion-light-bg dark:text-notion-dark-bg shadow-xl relative overflow-hidden group ${colors.solidBg}`}
          >
            {/* Using a custom gradient for the operator card that matches analytics theme */}
            <div className="absolute inset-0 opacity-100 bg-gradient-to-br from-violet-600 to-indigo-600 dark:from-violet-500 dark:to-indigo-500" />

            <div className="relative z-10">
              <div className="absolute right-[-10%] top-[-10%] opacity-10 rotate-12 group-hover:rotate-0 transition-transform duration-700">
                <Icon.Active size={120} />
              </div>
              <p className="opacity-70 text-[10px] font-black uppercase tracking-widest mb-1">
                Operator Level
              </p>
              <div className="flex items-end gap-2 mb-4">
                <h2 className="text-5xl font-black leading-none">
                  {metrics.level}
                </h2>
                <span className="opacity-70 text-xs font-bold mb-1 uppercase tracking-wider">
                  Specialist
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                  <span>XP Progress</span>
                  <span>{metrics.xp % 1000} / 1000</span>
                </div>
                <div className="h-2 bg-white/20 dark:bg-black/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white transition-all duration-1000"
                    style={{ width: `${(metrics.xp % 1000) / 10}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-notion-light-bg dark:bg-notion-dark-bg border border-notion-light-border dark:border-notion-dark-border rounded-2xl p-6 hover:shadow-md transition-shadow group">
            <div className="flex items-center justify-between mb-4">
              <div
                className={`p-3 ${colors.lightBg} ${colors.text} rounded-xl border ${colors.border} group-hover:scale-110 transition-transform`}
              >
                <Icon.Active {...iconProps(24)} />
              </div>
              <span
                className={`text-[10px] font-black ${colors.text} ${colors.bg} px-2 py-0.5 rounded uppercase tracking-wider border ${colors.border}`}
              >
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

          <div className="bg-notion-light-bg dark:bg-notion-dark-bg border border-notion-light-border dark:border-notion-dark-border rounded-2xl p-6 hover:shadow-md transition-shadow group">
            <div className="flex items-center justify-between mb-4">
              <div
                className={`p-3 ${colors.lightBg} ${colors.text} rounded-xl border ${colors.border} group-hover:scale-110 transition-transform`}
              >
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

          <div className="bg-notion-light-bg dark:bg-notion-dark-bg border border-notion-light-border dark:border-notion-dark-border rounded-2xl p-6 hover:shadow-md transition-shadow group">
            <div className="flex items-center justify-between mb-4">
              <div
                className={`p-3 ${colors.lightBg} ${colors.text} rounded-xl border ${colors.border} group-hover:scale-110 transition-transform`}
              >
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-notion-light-bg dark:bg-notion-dark-bg p-6 rounded-2xl border border-notion-light-border dark:border-notion-dark-border">
            <div className="flex items-center gap-3 mb-4">
              <div
                className={`p-2 ${colors.lightBg} ${colors.text} rounded-lg border ${colors.border}`}
              >
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
                  className={`h-full ${colors.solidBg} transition-all duration-1000`}
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
              <div
                className={`p-2 ${colors.lightBg} ${colors.text} rounded-lg border ${colors.border}`}
              >
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
              <div
                className={`p-2 ${colors.lightBg} ${colors.text} rounded-lg border ${colors.border}`}
              >
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
              <div
                className={`p-2 ${colors.lightBg} ${colors.text} rounded-lg border ${colors.border}`}
              >
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
                    tick={{
                      fill: "currentColor",
                      fontSize: 10,
                      fontWeight: 700,
                    }}
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
                    className={colors.text}
                    radius={[4, 4, 0, 0]}
                    barSize={20}
                  />
                  <Bar
                    dataKey="created"
                    fill="currentColor"
                    className={`${colors.bg.replace("/10", "").replace("/20", "")} opacity-40`}
                    radius={[4, 4, 0, 0]}
                    barSize={20}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center gap-6 mt-6">
              <div className="flex items-center gap-2">
                <div
                  className={`w-2.5 h-2.5 rounded-full ${MODULE_COLORS.crm.dot}`}
                ></div>
                <span className="text-[10px] font-black uppercase tracking-wider text-notion-light-muted dark:text-notion-dark-muted">
                  Completed
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className={`w-2.5 h-2.5 rounded-full ${MODULE_COLORS.tasks.dot}`}
                ></div>
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
                          fill={
                            INSIGHTS_CHART_COLORS[
                              index % INSIGHTS_CHART_COLORS.length
                            ]
                          }
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
                      className={colors.text}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* Artifacts Gallery */}
        <div className="bg-notion-light-bg dark:bg-notion-dark-bg p-4 sm:p-8 rounded-2xl border border-notion-light-border dark:border-notion-dark-border">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="text-xl font-black text-notion-light-text dark:text-notion-dark-text uppercase tracking-widest">
                Artifact <span className="opacity-50">Gallery</span>
              </h2>
              <p className="text-[10px] font-bold text-notion-light-muted dark:text-notion-dark-muted mt-1 uppercase tracking-wider">
                Earned operational badges and rare items
              </p>
            </div>
            <div className="w-fit flex items-center gap-2 px-3 py-1 bg-notion-light-sidebar dark:bg-notion-dark-sidebar text-notion-light-text dark:text-notion-dark-text rounded-lg border border-notion-light-border dark:border-notion-dark-border text-[10px] font-black uppercase tracking-widest">
              {unlockedCount} / {artifacts.length} Discovered
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {artifacts.map((artifact, index) => (
              <div
                key={index}
                className={`group relative flex flex-col items-center justify-center p-4 sm:p-6 rounded-2xl border transition-all duration-300 ${
                  artifact.isUnlocked
                    ? `bg-notion-light-bg dark:bg-notion-dark-bg ${artifact.colors.border} text-notion-light-text dark:text-notion-dark-text shadow-sm hover:shadow-md hover:scale-[1.02]`
                    : "bg-notion-light-sidebar dark:bg-notion-dark-sidebar border-notion-light-border dark:border-notion-dark-border text-notion-light-muted dark:text-notion-dark-muted grayscale opacity-40"
                }`}
              >
                <div
                  className={`mb-3 transition-transform duration-300 ${
                    artifact.isUnlocked
                      ? `group-hover:scale-110 group-hover:rotate-6 ${artifact.colors.text}`
                      : ""
                  }`}
                >
                  <artifact.icon size={24} />
                </div>
                <span
                  className={`text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-center leading-tight ${artifact.isUnlocked ? "text-notion-light-text dark:text-notion-dark-text" : "text-notion-light-muted dark:text-notion-dark-muted"}`}
                >
                  {artifact.name}
                </span>

                {!artifact.isUnlocked && (
                  <span className="mt-1.5 text-[8px] font-bold opacity-40 uppercase tracking-tighter text-center sm:hidden">
                    {artifact.condition}
                  </span>
                )}

                {/* Tooltip on Hover (Desktop only) */}
                <div className="absolute hidden sm:block bottom-full left-1/2 -translate-x-1/2 mb-2 w-32 p-2 bg-notion-light-text dark:bg-notion-dark-text text-notion-light-bg dark:text-notion-dark-bg text-[10px] font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 text-center shadow-xl border border-notion-light-border dark:border-notion-dark-border">
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
  },
);
