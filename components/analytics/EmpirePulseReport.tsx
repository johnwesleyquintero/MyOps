import React from "react";
import { Icon } from "../Icons";
import { EmpirePulseData } from "../../hooks/useEmpirePulse";
import { Card, Badge } from "../ui";
import { MODULE_COLORS } from "@/constants";

interface EmpirePulseReportProps {
  data: EmpirePulseData;
}

export const EmpirePulseReport: React.FC<EmpirePulseReportProps> = React.memo(
  ({ data }) => {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Commander's Briefing */}
        <div className="p-6 bg-indigo-500/5 dark:bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-start gap-4">
          <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-600 dark:text-indigo-400">
            <Icon.Bot size={24} />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge
                variant="ghost"
                size="xs"
                className="!p-0 font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-300"
              >
                Operational Intelligence Briefing
              </Badge>
              <Badge
                variant="custom"
                size="xs"
                className="bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 !text-[8px] font-black uppercase tracking-tighter"
              >
                Live Link Active
              </Badge>
            </div>
            <p className="text-sm text-notion-light-text/80 dark:text-indigo-100/70 leading-relaxed max-w-3xl">
              {data.commanderBriefing}
            </p>
          </div>
        </div>

        {/* Grid Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            label="Strategic Accuracy"
            value={`${data.overallAccuracy}%`}
            subLabel={
              data.calibrationTrend === "improving"
                ? "Optimal Alignment"
                : "Calibration Required"
            }
            icon={Icon.Target}
            trend={data.calibrationTrend}
            color="analytics"
          />
          <MetricCard
            label="Operational Streak"
            value={`${data.activeStreak} Days`}
            subLabel="Continuous Momentum"
            icon={Icon.Zap}
            trend="up"
            color="strategy"
          />
          <MetricCard
            label="Peak State Multiplier"
            value={
              data.topProject
                ? `${data.topProject.peakStateMultiplier}x`
                : "1.0x"
            }
            subLabel={
              data.topProject
                ? `Driving ${data.topProject.name}`
                : "Awaiting Peak Focus"
            }
            icon={Icon.Active}
            trend="up"
            color="awareness"
          />
          <MetricCard
            label="Risk Assessment"
            value={data.projectsAtRisk.toString()}
            subLabel="Stagnant Theaters"
            icon={Icon.Alert}
            trend={data.projectsAtRisk > 0 ? "down" : "stable"}
            color="report"
          />
        </div>

        {/* Activity & Calibration Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 p-6 space-y-6">
            <div className="flex justify-between items-center">
              <Badge
                variant="ghost"
                size="xs"
                className="!p-0 font-black uppercase tracking-widest text-notion-light-muted dark:text-white/40"
              >
                Weekly Throughput Trend
              </Badge>
              <div className="flex gap-2">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-indigo-500/40" />
                  <Badge
                    variant="ghost"
                    size="xs"
                    className="!p-0 font-bold text-notion-light-muted dark:text-white/20 uppercase border-none bg-transparent"
                  >
                    Tasks
                  </Badge>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-violet-500/40" />
                  <Badge
                    variant="ghost"
                    size="xs"
                    className="!p-0 font-bold text-notion-light-muted dark:text-white/20 uppercase border-none bg-transparent"
                  >
                    Streak
                  </Badge>
                </div>
              </div>
            </div>

            <div className="h-40 flex items-end gap-1.5 pb-2 border-b border-notion-light-border dark:border-white/5 relative">
              {/* Grid lines */}
              <div className="absolute inset-0 flex flex-col justify-between py-1 pointer-events-none opacity-5 dark:opacity-5">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-full border-t border-notion-light-text dark:border-white"
                  />
                ))}
              </div>

              {data.weeklyActivity.map((count, i) => (
                <div
                  key={i}
                  className="flex-1 flex flex-col items-center gap-2 group relative"
                >
                  <div className="w-full flex items-end justify-center gap-0.5">
                    {/* Task Bar */}
                    <div
                      className="w-full bg-indigo-500/20 group-hover:bg-indigo-500/40 rounded-t-sm transition-all duration-300 relative"
                      style={{ height: `${Math.max(count * 8, 4)}px` }}
                    >
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-notion-light-text dark:bg-black text-white text-[8px] font-bold px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                        {count} Tasks
                      </div>
                    </div>
                    {/* Streak Line/Bar */}
                    <div
                      className="w-1 bg-violet-500/40 rounded-t-full"
                      style={{
                        height: `${Math.max(data.streakTrend[i] * 4, 2)}px`,
                      }}
                    />
                  </div>
                  <Badge
                    variant="ghost"
                    size="xs"
                    className="!p-0 font-bold text-notion-light-muted/40 dark:text-white/10 uppercase border-none bg-transparent"
                  >
                    {["M", "T", "W", "T", "F", "S", "S"][i]}
                  </Badge>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center border-t border-notion-light-border dark:border-white/5 pt-4">
              <Badge
                variant="ghost"
                size="xs"
                className="!p-0 font-bold text-notion-light-muted dark:text-white/20 uppercase tracking-widest border-none bg-transparent"
              >
                Operational Pulse Active
              </Badge>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <span className="text-indigo-600 dark:text-indigo-400 text-[10px] font-bold">
                    {data.weeklyActivity.reduce((a, b) => a + b, 0)}
                  </span>
                  <Badge
                    variant="ghost"
                    size="xs"
                    className="!p-0 font-bold text-notion-light-muted dark:text-white/20 uppercase border-none bg-transparent"
                  >
                    Total Actions
                  </Badge>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-violet-600 dark:text-violet-400 text-[10px] font-bold">
                    {data.activeStreak}d
                  </span>
                  <Badge
                    variant="ghost"
                    size="xs"
                    className="!p-0 font-bold text-notion-light-muted dark:text-white/20 uppercase border-none bg-transparent"
                  >
                    Max Streak
                  </Badge>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6 space-y-6">
            <Badge
              variant="ghost"
              size="xs"
              className="!p-0 font-black uppercase tracking-widest text-notion-light-muted dark:text-white/40"
            >
              Calibration Insights
            </Badge>

            <div className="space-y-4">
              <div className="p-4 bg-black/5 dark:bg-white/5 rounded-xl border border-notion-light-border dark:border-white/5 space-y-3">
                <div className="flex justify-between items-center">
                  <Badge
                    variant="ghost"
                    size="xs"
                    className="!p-0 font-bold text-notion-light-muted dark:text-white/40 uppercase"
                  >
                    Intuition vs Outcome
                  </Badge>
                  <span
                    className={`text-[10px] font-black ${data.decisionInsights.calibrationGap < 15 ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}`}
                  >
                    {data.decisionInsights.calibrationGap < 15
                      ? "HIGH SYNC"
                      : "OFFSET DETECTED"}
                  </span>
                </div>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-2xl font-black text-notion-light-text dark:text-white">
                      {data.decisionInsights.avgConfidence}%
                    </p>
                    <Badge
                      variant="ghost"
                      size="xs"
                      className="!p-0 font-black text-notion-light-muted/40 dark:text-white/20 uppercase border-none bg-transparent"
                    >
                      Avg Confidence
                    </Badge>
                  </div>
                  <div className="w-px h-8 bg-notion-light-border dark:bg-white/10" />
                  <div className="text-right">
                    <p className="text-2xl font-black text-notion-light-text dark:text-white">
                      {data.overallAccuracy}%
                    </p>
                    <Badge
                      variant="ghost"
                      size="xs"
                      className="!p-0 font-black text-notion-light-muted/40 dark:text-white/20 uppercase border-none bg-transparent"
                    >
                      Avg Accuracy
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-black/5 dark:bg-white/5 rounded-xl border border-notion-light-border dark:border-white/5">
                  <p className="text-lg font-black text-notion-light-text dark:text-white">
                    {data.decisionInsights.highImpact}
                  </p>
                  <Badge
                    variant="ghost"
                    size="xs"
                    className="!p-0 font-black text-notion-light-muted/40 dark:text-white/20 uppercase border-none bg-transparent"
                  >
                    High Impact
                  </Badge>
                </div>
                <div className="p-3 bg-black/5 dark:bg-white/5 rounded-xl border border-notion-light-border dark:border-white/5">
                  <p className="text-lg font-black text-notion-light-text dark:text-white">
                    {data.decisionInsights.total}
                  </p>
                  <Badge
                    variant="ghost"
                    size="xs"
                    className="!p-0 font-black text-notion-light-muted/40 dark:text-white/20 uppercase border-none bg-transparent"
                  >
                    Total Decisions
                  </Badge>
                </div>
              </div>

              <div className="pt-2">
                <p className="text-[10px] text-notion-light-muted dark:text-white/40 leading-relaxed italic">
                  {data.decisionInsights.calibrationGap < 10
                    ? "Neural alignment is optimal. Trust high-impact intuitions."
                    : "Calibration offset detected. Review high-confidence failures."}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Top Theater & Risk Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6 space-y-4">
            <Badge
              variant="ghost"
              size="xs"
              className="!p-0 font-black uppercase tracking-widest text-notion-light-muted dark:text-white/40"
            >
              Top Theater Focus
            </Badge>
            {data.topProject ? (
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <div>
                    <h2 className="text-xl font-black text-notion-light-text dark:text-white">
                      {data.topProject.name}
                    </h2>
                    <Badge
                      variant="ghost"
                      size="xs"
                      className="!p-0 font-bold text-notion-light-muted/60 dark:text-white/40 uppercase tracking-widest border-none bg-transparent"
                    >
                      {data.topProject.xp} XP Earned •{" "}
                      {data.topProject.momentum} Momentum
                    </Badge>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                      {data.topProject.accuracy}%
                    </span>
                    <Badge
                      variant="ghost"
                      size="xs"
                      className="!p-0 font-black text-notion-light-muted/40 dark:text-white/20 uppercase border-none bg-transparent"
                    >
                      Accuracy
                    </Badge>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <Badge
                      variant="ghost"
                      size="xs"
                      className="!p-0 font-bold text-notion-light-muted/60 dark:text-white/40 uppercase border-none bg-transparent"
                    >
                      Efficiency Rate
                    </Badge>
                    <span className="text-[10px] font-bold text-notion-light-muted/60 dark:text-white/40">
                      {data.topProject.completionRate}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)] transition-all duration-1000"
                      style={{ width: `${data.topProject.completionRate}%` }}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-notion-light-muted/20 dark:text-white/20 py-8">
                <Icon.Missions size={32} className="mb-2 opacity-20" />
                <Badge
                  variant="ghost"
                  size="xs"
                  className="!p-0 font-bold uppercase tracking-widest border-none bg-transparent opacity-40"
                >
                  No Active Data
                </Badge>
              </div>
            )}
          </Card>

          <Card className="p-6 space-y-4">
            <div className="flex justify-between items-center">
              <Badge
                variant="ghost"
                size="xs"
                className="!p-0 font-black uppercase tracking-widest text-notion-light-muted dark:text-white/40"
              >
                Operational Risk Analysis
              </Badge>
              {data.projectsAtRisk > 0 && (
                <Badge
                  variant="error"
                  size="xs"
                  className="!text-[8px] font-black uppercase"
                >
                  Attention Required
                </Badge>
              )}
            </div>

            <div className="space-y-3">
              {data.projectsAtRisk > 0 ? (
                <div className="p-4 bg-rose-500/5 border border-rose-500/10 rounded-xl flex items-center gap-4">
                  <div className="p-2 bg-rose-500/10 rounded-lg text-rose-600 dark:text-rose-400">
                    <Icon.Alert size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-notion-light-text dark:text-rose-100">
                      {data.projectsAtRisk} Theater(s) Stagnant
                    </p>
                    <Badge
                      variant="ghost"
                      size="xs"
                      className="!p-0 text-rose-600 dark:text-rose-400/60 uppercase font-bold tracking-tight border-none bg-transparent"
                    >
                      Immediate tactical engagement recommended
                    </Badge>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl flex items-center gap-4">
                  <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-600 dark:text-emerald-400">
                    <Icon.Check size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-notion-light-text dark:text-emerald-100">
                      All Theaters Operational
                    </p>
                    <Badge
                      variant="ghost"
                      size="xs"
                      className="!p-0 text-emerald-600 dark:text-emerald-400/60 uppercase font-bold tracking-tight border-none bg-transparent"
                    >
                      Zero stagnation detected in active sectors
                    </Badge>
                  </div>
                </div>
              )}

              <div className="pt-2 border-t border-notion-light-border dark:border-white/5">
                <div className="flex justify-between items-center mb-2">
                  <Badge
                    variant="ghost"
                    size="xs"
                    className="!p-0 font-black text-notion-light-muted/40 dark:text-white/20 uppercase border-none bg-transparent"
                  >
                    Mental State Impact
                  </Badge>
                  <Badge
                    variant="ghost"
                    size="xs"
                    className="!p-0 font-black text-notion-light-muted dark:text-white/40 uppercase border-none bg-transparent"
                  >
                    Stable
                  </Badge>
                </div>
                <p className="text-[10px] text-notion-light-muted dark:text-white/40 leading-relaxed">
                  Risk factors are currently dominated by{" "}
                  {data.projectsAtRisk > 0
                    ? "stagnation in peripheral objectives"
                    : "optimal focus distribution"}
                  . Maintain current trajectory for maximum streak retention.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  },
);

interface MetricCardProps {
  label: string;
  value: string;
  subLabel: string;
  icon: React.FC<{ size?: number; className?: string }>;
  trend: "up" | "down" | "stable" | "improving" | "declining";
  color: keyof typeof MODULE_COLORS;
}

const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  subLabel,
  icon: IconComp,
  trend,
  color,
}) => {
  const colors = MODULE_COLORS[color] || MODULE_COLORS.analytics;

  return (
    <Card className="p-5 flex flex-col gap-3 group hover:border-indigo-500/30 transition-all duration-300">
      <div className="flex justify-between items-start">
        <div className={`p-2 rounded-lg ${colors.bg} ${colors.text}`}>
          <IconComp size={18} />
        </div>
        {(trend === "up" || trend === "improving") && (
          <Icon.TrendUp size={14} className="text-emerald-500" />
        )}
        {(trend === "down" || trend === "declining") && (
          <Icon.TrendDown size={14} className="text-rose-500" />
        )}
      </div>
      <div>
        <Badge
          variant="ghost"
          size="xs"
          className="!p-0 font-black text-notion-light-muted dark:text-notion-dark-muted uppercase tracking-widest mb-1"
        >
          {label}
        </Badge>
        <h3 className="text-2xl font-black text-notion-light-text dark:text-notion-dark-text">
          {value}
        </h3>
        <p className="text-[10px] font-bold text-notion-light-muted/60 dark:text-notion-dark-muted/40 uppercase tracking-tighter mt-1">
          {subLabel}
        </p>
      </div>
    </Card>
  );
};
