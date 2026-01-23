import React, { useMemo } from "react";
import {
  TaskEntry,
  MetricSummary,
  Page,
  OperatorMetrics,
  MentalStateEntry,
  DecisionEntry,
  ReflectionEntry,
} from "@/types";
import { SummaryCards } from "../SummaryCards";
import { MissionTrendChart } from "../analytics/MissionTrendChart";
import { ProjectDistributionList } from "../analytics/ProjectDistributionList";
import {
  ProjectDebriefPanel,
  ProjectDebrief,
} from "../analytics/ProjectDebriefPanel";
import { TaskTable } from "../TaskTable";
import { Icon, iconProps } from "../Icons";
import { ViewHeader } from "../ViewHeader";
import { Button, Card } from "../ui";
import { ColumnConfigDropdown } from "../ColumnConfigDropdown";
import { MODULE_COLORS } from "@/constants";
import { useDashboardLogic } from "../../hooks/useDashboardLogic";
import { useUi } from "@/hooks/useUi";

interface DashboardViewProps {
  entries: TaskEntry[];
  metrics: MetricSummary;
  operatorMetrics: OperatorMetrics;
  mentalStates: MentalStateEntry[];
  decisions: DecisionEntry[];
  reflections: ReflectionEntry[];
  isLoading: boolean;
  onEdit: (entry: TaskEntry) => void;
  onDelete: (entry: TaskEntry) => void;
  onStatusUpdate: (entry: TaskEntry) => void;
  onFocus: (entry: TaskEntry) => void;
  onDuplicate: (entry: TaskEntry) => void;
  onNavigate: (page: Page) => void;
}

const getConfidenceColor = (score: number) => {
  if (score >= 80) return "text-emerald-400";
  if (score >= 50) return "text-indigo-400";
  return "text-amber-400";
};

export const DashboardView: React.FC<DashboardViewProps> = React.memo(
  ({
    entries,
    metrics,
    operatorMetrics,
    mentalStates,
    decisions,
    reflections,
    isLoading,
    onEdit,
    onDelete,
    onStatusUpdate,
    onFocus,
    onDuplicate,
    onNavigate,
  }) => {
    const {
      tacticalFocus,
      xpProgress,
      predictiveMetrics,
      calibrationMetrics,
      biometricCalibration,
      projectMomentum,
      columns,
      toggleColumn,
    } = useDashboardLogic({
      entries,
      operatorMetrics,
      decisions,
      mentalStates,
      reflections,
    });
    const { isHudMode, toggleHudMode } = useUi();
    const [isDebriefMode, setIsDebriefMode] = React.useState(false);

    // Calculate Confidence Score
    const confidenceScore = useMemo(() => {
      let score = 50; // Base score

      // Streak Bonus (cap at 30)
      score += Math.min(operatorMetrics.streak * 5, 30);

      // Mental State Impact
      const today = new Date().toISOString().split("T")[0];
      const todaysState = mentalStates.find((m) => m.date === today);

      if (todaysState) {
        if (todaysState.energy === "high") score += 10;
        if (todaysState.energy === "low") score -= 10;

        if (todaysState.clarity === "sharp") score += 10;
        if (todaysState.clarity === "foggy") score -= 10;
      }

      return Math.min(Math.max(score, 0), 100);
    }, [operatorMetrics.streak, mentalStates]);

    return (
      <div
        className={`animate-fade-in space-y-8 relative ${isHudMode ? "hud-mode" : ""}`}
      >
        <ViewHeader
          title="Command Center"
          subTitle="Operational overview and tactical focus"
        >
          <button
            onClick={toggleHudMode}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all duration-300 ${
              isHudMode
                ? "bg-indigo-600 text-white border-indigo-500 shadow-[0_0_15px_rgba(79,70,229,0.4)]"
                : "bg-notion-light-sidebar dark:bg-notion-dark-sidebar border-notion-light-border dark:border-notion-dark-border text-notion-light-text/60 dark:text-notion-dark-text/60 hover:border-indigo-500"
            }`}
          >
            <Icon.Rank size={16} className={isHudMode ? "animate-pulse" : ""} />
            <span className="text-[10px] font-black uppercase tracking-widest">
              {isHudMode ? "HUD Active" : "HUD Mode"}
            </span>
          </button>
        </ViewHeader>

        {/* HUD Elements Overlay (Conditional) */}
        {isHudMode && (
          <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end gap-4 pointer-events-none">
            {/* Predictive Analytics Panel */}
            <div className="pointer-events-auto bg-black/80 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-2xl flex flex-col gap-3 min-w-[240px] animate-slide-up">
              <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-white/60 border-b border-white/10 pb-2 mb-1">
                <span>TACTICAL FORECAST</span>
                <Icon.Activity size={12} className="text-indigo-400" />
              </div>

              <div className="space-y-3">
                {/* Predicted XP */}
                <div className="flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="text-[9px] text-white/40 uppercase">
                      Est. Session XP
                    </span>
                    <span className="text-sm font-bold text-white">
                      +{predictiveMetrics.predictedXP} XP
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] text-white/40 uppercase">
                      Next Lvl
                    </span>
                    <div className="text-[10px] font-mono text-indigo-300">
                      {predictiveMetrics.potentialLevel >
                      operatorMetrics.level ? (
                        <span className="animate-pulse text-emerald-400">
                          LVL UP IMMINENT
                        </span>
                      ) : (
                        <span>
                          {(operatorMetrics.xp +
                            predictiveMetrics.predictedXP) %
                            1000}{" "}
                          / 1000
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Momentum Tracking */}
                <div className="flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="text-[9px] text-white/40 uppercase">
                      Momentum
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-sm font-bold ${predictiveMetrics.isStreakAtRisk ? "text-amber-400" : "text-emerald-400"}`}
                      >
                        {operatorMetrics.streak} Days
                      </span>
                      {predictiveMetrics.isStreakAtRisk && (
                        <span className="px-1 py-0.5 bg-amber-500/20 text-amber-400 text-[8px] rounded uppercase font-black tracking-wider animate-pulse">
                          At Risk
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] text-white/40 uppercase">
                      Forecast
                    </span>
                    <span className="text-[10px] font-mono text-white/80 block">
                      Day {predictiveMetrics.streakForecast} Locked
                    </span>
                  </div>
                </div>

                {/* Decision Calibration */}
                <div className="flex justify-between items-center border-t border-white/5 pt-2 mt-1">
                  <div className="flex flex-col">
                    <span className="text-[9px] text-white/40 uppercase">
                      Calibration
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-sm font-bold ${
                          calibrationMetrics.calibrationScore >= 80
                            ? "text-emerald-400"
                            : calibrationMetrics.calibrationScore >= 50
                              ? "text-indigo-400"
                              : "text-amber-400"
                        }`}
                      >
                        {calibrationMetrics.calibrationScore}%
                      </span>
                      <span
                        className={`text-[8px] uppercase font-black tracking-widest ${
                          calibrationMetrics.bias === "calibrated"
                            ? "text-emerald-500/60"
                            : "text-amber-500/60"
                        }`}
                      >
                        {calibrationMetrics.bias}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <Icon.Strategy
                      size={14}
                      className="text-white/20 inline-block mb-1"
                    />
                    <span className="text-[8px] text-white/40 block uppercase tracking-tighter">
                      Impact Accuracy
                    </span>
                  </div>
                </div>

                {/* Biometric Calibration Correlation */}
                {biometricCalibration && biometricCalibration.length > 0 && (
                  <div className="flex flex-col gap-2 border-t border-white/5 pt-2 mt-1">
                    <span className="text-[9px] text-white/40 uppercase">
                      State Accuracy
                    </span>
                    <div className="space-y-1.5">
                      {biometricCalibration.map((s) => (
                        <div
                          key={s.state}
                          className="flex justify-between items-center"
                        >
                          <div className="flex items-center gap-1.5">
                            <div
                              className={`w-1 h-1 rounded-full ${s.state === "peak" ? "bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]" : s.state === "low" ? "bg-amber-500" : "bg-indigo-500"}`}
                            />
                            <span className="text-[10px] text-white/60 capitalize">
                              {s.state}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-[10px] font-bold ${s.accuracy >= 80 ? "text-emerald-400" : s.accuracy >= 50 ? "text-indigo-400" : "text-amber-400"}`}
                            >
                              {s.accuracy}%
                            </span>
                            <span className="text-[8px] text-white/20 uppercase font-mono">
                              {s.bias}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Confidence Dial HUD Snippet */}
            <div className="pointer-events-auto bg-black/80 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-2xl flex flex-col gap-3 min-w-[200px] animate-slide-up [animation-delay:100ms]">
              <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-white/60">
                <span>CONFIDENCE DIAL</span>
                <span className={getConfidenceColor(confidenceScore)}>
                  {confidenceScore}%
                </span>
              </div>
              <div className="relative h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-1000 ${
                    confidenceScore >= 80
                      ? "bg-emerald-500"
                      : confidenceScore >= 50
                        ? "bg-indigo-500"
                        : "bg-amber-500"
                  }`}
                  style={{ width: `${confidenceScore}%` }}
                />
              </div>
              <div className="flex justify-between items-center">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-2 h-1 rounded-full ${
                        i < Math.floor(confidenceScore / 20)
                          ? confidenceScore >= 80
                            ? "bg-emerald-500"
                            : confidenceScore >= 50
                              ? "bg-indigo-500"
                              : "bg-amber-500"
                          : "bg-white/10"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-[9px] font-mono text-white/40 uppercase tracking-tighter">
                  {confidenceScore >= 80
                    ? "OPTIMAL"
                    : confidenceScore >= 50
                      ? "STABLE"
                      : "CAUTION"}
                </span>
              </div>
            </div>

            {/* Project Momentum HUD Snippet (Advanced) */}
            {projectMomentum && projectMomentum.length > 0 && (
              <div className="pointer-events-auto bg-black/80 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-2xl flex flex-col gap-3 min-w-[200px] animate-slide-up [animation-delay:200ms]">
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-white/60">
                  <span>PROJECT MOMENTUM</span>
                  <button
                    onClick={() => setIsDebriefMode(!isDebriefMode)}
                    className={`px-2 py-0.5 rounded text-[8px] font-black uppercase transition-all ${
                      isDebriefMode
                        ? "bg-indigo-500 text-white shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                        : "bg-white/5 text-white/40 hover:bg-white/10"
                    }`}
                  >
                    {isDebriefMode ? "Close Debrief" : "Debrief Layer"}
                  </button>
                </div>
                <div className="space-y-3">
                  {projectMomentum.map((p) => (
                    <div key={p.name} className="flex flex-col gap-1.5">
                      <div className="flex justify-between items-center">
                        <span className="text-[11px] font-bold text-white/80 truncate max-w-[120px]">
                          {p.name}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`text-[10px] font-black ${p.trend === "up" ? "text-emerald-400" : p.trend === "down" ? "text-rose-400" : "text-white/40"}`}
                          >
                            {p.momentum}
                          </span>
                          {p.isAtRisk && (
                            <div className="w-1 h-1 rounded-full bg-rose-500 animate-pulse" />
                          )}
                        </div>
                      </div>
                      <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-1000 ${p.isAtRisk ? "bg-rose-500" : "bg-indigo-500"}`}
                          style={{ width: `${p.completionRate}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Debrief Layer Overlay */}
            {isDebriefMode && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-8 pointer-events-none">
                <div
                  className="absolute inset-0 bg-black/60 backdrop-blur-md pointer-events-auto"
                  onClick={() => setIsDebriefMode(false)}
                />
                <div className="relative w-full max-w-5xl pointer-events-auto animate-in zoom-in-95 duration-300">
                  <div className="flex justify-between items-end mb-6">
                    <div>
                      <h2 className="text-[12px] font-black uppercase tracking-[0.3em] text-indigo-400 mb-1">
                        Strategic Command
                      </h2>
                      <h1 className="text-3xl font-black text-white">
                        Mission Debrief <span className="text-white/20">/</span>{" "}
                        Project Insights
                      </h1>
                    </div>
                    <button
                      onClick={() => setIsDebriefMode(false)}
                      className="p-3 rounded-full bg-white/5 text-white/40 hover:bg-white/10 transition-all"
                    >
                      <Icon.Close size={24} />
                    </button>
                  </div>
                  <ProjectDebriefPanel
                    projects={projectMomentum as ProjectDebrief[]}
                  />

                  <div className="mt-8 p-6 bg-indigo-500/5 border border-indigo-500/20 rounded-2xl flex items-center gap-4">
                    <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400">
                      <Icon.Bot size={24} />
                    </div>
                    <div>
                      <h4 className="text-[11px] font-black uppercase tracking-widest text-indigo-300">
                        Operational Intelligence
                      </h4>
                      <p className="text-sm text-indigo-100/60 max-w-2xl">
                        Your peak state multiplier is currently at its highest
                        in the <strong>{projectMomentum[0]?.name}</strong>{" "}
                        theater. Strategic accuracy across all sectors is
                        holding at{" "}
                        <strong>{calibrationMetrics.calibrationScore}%</strong>.
                        Maintain momentum to avoid streak degradation in
                        high-risk zones.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Top Row: Core Metrics & Operator Status */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          <div className="lg:col-span-2">
            <SummaryCards metrics={metrics} />
          </div>
          <div className="notion-card p-6 bg-gradient-to-br from-violet-600 to-indigo-700 dark:from-violet-700 dark:to-indigo-900 text-white border-none shadow-lg relative overflow-hidden group flex flex-col justify-center min-h-[200px]">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-500">
              <Icon.Rank size={120} />
            </div>
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70">
                    Operator Status
                  </span>
                  <h3 className="text-2xl font-bold tracking-tight mt-1">
                    Level {operatorMetrics.level}
                  </h3>
                </div>
                <div className="px-3 py-1 bg-white/20 rounded-full text-[10px] font-bold backdrop-blur-md border border-white/10 uppercase tracking-widest">
                  Specialist
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest mb-1.5 opacity-80">
                    <span>XP Progress</span>
                    <span>{operatorMetrics.xp % 1000} / 1000</span>
                  </div>
                  <div className="h-2 bg-black/20 rounded-full overflow-hidden border border-white/5">
                    <div
                      className="h-full bg-white rounded-full transition-all duration-1000 shadow-[0_0_8px_rgba(255,255,255,0.5)]"
                      style={{ width: `${xpProgress}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="bg-white/10 p-3 rounded-xl backdrop-blur-sm border border-white/5 hover:bg-white/20 transition-colors">
                    <span className="text-[10px] opacity-70 block uppercase font-bold tracking-tighter mb-1">
                      Streak
                    </span>
                    <div className="flex items-center gap-2">
                      <Icon.Streak size={16} className="text-violet-400" />
                      <span className="text-lg font-bold">
                        {operatorMetrics.streak}d
                      </span>
                    </div>
                  </div>
                  <div className="bg-white/10 p-3 rounded-xl backdrop-blur-sm border border-white/5 hover:bg-white/20 transition-colors">
                    <span className="text-[10px] opacity-70 block uppercase font-bold tracking-tighter mb-1">
                      Artifacts
                    </span>
                    <div className="flex items-center gap-2">
                      <Icon.Vault size={16} className="text-purple-400" />
                      <span className="text-lg font-bold">
                        {operatorMetrics.artifactsGained}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button
            onClick={() => onNavigate("MISSIONS")}
            className="notion-card p-6 bg-white dark:bg-notion-dark-sidebar/30 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-left group border-slate-200/60 dark:border-white/5"
          >
            <div className="flex flex-col">
              <div className="flex justify-between items-start">
                <div className="p-4 bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400 rounded-2xl mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-sm">
                  <Icon.Missions size={24} />
                </div>
                <Icon.ArrowRight
                  size={16}
                  className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-slate-400"
                />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                Active Missions
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Manage your tactical task list and project execution.
              </p>
            </div>
          </button>

          <button
            onClick={() => onNavigate("KNOWLEDGE")}
            className="notion-card p-6 bg-white dark:bg-notion-dark-sidebar/30 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-left group border-slate-200/60 dark:border-white/5"
          >
            <div className="flex flex-col">
              <div className="flex justify-between items-start">
                <div className="p-4 bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-2xl mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-sm">
                  <Icon.Docs size={24} />
                </div>
                <Icon.ArrowRight
                  size={16}
                  className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-slate-400"
                />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                Knowledge Base
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Access your SOPs, framework library, and intel.
              </p>
            </div>
          </button>

          <button
            onClick={() => onNavigate("CRM")}
            className="notion-card p-6 bg-white dark:bg-notion-dark-sidebar/30 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-left group border-slate-200/60 dark:border-white/5"
          >
            <div className="flex flex-col">
              <div className="flex justify-between items-start">
                <div className="p-4 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-2xl mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-sm">
                  <Icon.Users size={24} />
                </div>
                <Icon.ArrowRight
                  size={16}
                  className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-slate-400"
                />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                Contact Layer
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Track interactions with clients, leads, and vendors.
              </p>
            </div>
          </button>
        </div>

        {/* Analytics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          <div className="lg:col-span-2">
            <MissionTrendChart entries={entries} />
          </div>
          <div>
            <ProjectDistributionList entries={entries} />
          </div>
        </div>

        {/* Bottom Section: Tactical Focus */}
        <div>
          <div className="flex justify-between items-center mb-4 mt-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-notion-light-sidebar dark:bg-notion-dark-sidebar border border-notion-light-border dark:border-notion-dark-border">
                <Icon.Missions
                  {...iconProps(
                    16,
                    "text-notion-light-text/60 dark:text-notion-dark-text/60",
                  )}
                />
              </div>
              <div>
                <h3 className="text-[11px] font-black text-notion-light-text/40 dark:text-notion-dark-text/40 uppercase tracking-[0.2em]">
                  Tactical Focus
                </h3>
                <span className="text-[9px] font-bold text-notion-light-muted dark:text-notion-dark-muted">
                  TOP 5 PRIORITIES
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ColumnConfigDropdown
                columns={columns}
                toggleColumn={toggleColumn}
                label="Columns"
                className="text-notion-light-text/60 dark:text-notion-dark-text/60 text-[10px] font-black uppercase tracking-widest hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-2 transition-all group bg-notion-light-sidebar dark:bg-notion-dark-sidebar px-4 py-2 rounded-xl border border-notion-light-border dark:border-notion-dark-border shadow-sm"
              />
              <Button
                onClick={() => onNavigate("MISSIONS")}
                variant="secondary"
                className="text-[10px] font-black uppercase tracking-widest hover:text-indigo-600 dark:hover:text-indigo-400"
              >
                Full Board{" "}
                <Icon.Layout
                  {...iconProps(
                    14,
                    "group-hover:translate-x-0.5 transition-transform",
                  )}
                />
              </Button>
            </div>
          </div>
          <Card
            padding="none"
            className="overflow-hidden transition-all duration-300 hover:shadow-lg"
          >
            <TaskTable
              entries={tacticalFocus}
              isLoading={isLoading}
              onEdit={onEdit}
              onDelete={onDelete}
              onStatusUpdate={onStatusUpdate}
              onFocus={onFocus}
              onDuplicate={onDuplicate}
              externalColumns={columns}
              externalToggleColumn={toggleColumn}
              showConfigGear={false}
            />
            {tacticalFocus.length === 0 && !isLoading && (
              <div className="p-20 text-center bg-notion-light-sidebar/30 dark:bg-notion-dark-sidebar/10">
                <div
                  className={`inline-flex p-6 ${MODULE_COLORS.status_active.lightBg} ${MODULE_COLORS.status_active.text} rounded-full mb-6 animate-pulse`}
                >
                  <Icon.Check {...iconProps(48)} />
                </div>
                <h4 className="text-lg font-bold text-notion-light-text dark:text-notion-dark-text mb-2">
                  All Systems Clear
                </h4>
                <p className="text-sm text-notion-light-text/50 dark:text-notion-dark-text/50 max-w-xs mx-auto">
                  No pending high-priority missions. Take this time to
                  strategize or explore new opportunities.
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>
    );
  },
);
