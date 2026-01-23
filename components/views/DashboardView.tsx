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
import { TaskTable } from "../TaskTable";
import { Icon, iconProps } from "../Icons";
import { ViewHeader } from "../ViewHeader";
import { Button, Card, Badge } from "../ui";
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

    // Use state and useEffect for activity correlation data to keep the render function pure
    const [activityCorrelationData, setActivityCorrelationData] =
      React.useState<
        { focusHeight: number; outputHeight: number; focusValue: number }[]
      >([]);

    React.useEffect(() => {
      const data = [...Array(48)].map(() => ({
        focusHeight: Math.random() * 60 + 20,
        outputHeight: Math.random() * 40 + 10,
        focusValue: Math.floor(Math.random() * 40 + 60),
      }));
      setActivityCorrelationData(data);
    }, []);

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
          <Button
            variant="ghost"
            onClick={toggleHudMode}
            className={`flex items-center gap-2.5 px-4 py-2 rounded-xl border transition-all duration-500 ${
              isHudMode
                ? "bg-indigo-600/20 text-indigo-600 dark:text-indigo-400 border-indigo-500/50 shadow-[0_0_20px_rgba(79,70,229,0.3)]"
                : "bg-transparent border-notion-light-border dark:border-notion-dark-border text-notion-light-text/50 dark:text-notion-dark-text/50 hover:border-indigo-500/50 hover:bg-indigo-500/5"
            }`}
          >
            <Icon.Rank
              size={14}
              className={
                isHudMode
                  ? "animate-pulse text-indigo-600 dark:text-indigo-400"
                  : ""
              }
            />
            <Badge
              variant="ghost"
              size="xs"
              className="!p-0 font-black uppercase tracking-[0.2em] bg-transparent text-inherit border-none"
            >
              {isHudMode ? "HUD Active" : "Enable HUD"}
            </Badge>
          </Button>
        </ViewHeader>

        {/* HUD Elements Overlay (Conditional) */}
        {isHudMode && (
          <div className="fixed bottom-10 right-10 z-50 flex flex-col items-end gap-6 pointer-events-none">
            {/* Predictive Analytics Panel */}
            <Card
              padding="none"
              className="pointer-events-auto bg-white/90 dark:bg-black/85 backdrop-blur-2xl border border-notion-light-border dark:border-white/10 p-5 rounded-[2rem] shadow-xl dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col gap-4 min-w-[280px] animate-slide-up ring-1 ring-notion-light-border/50 dark:ring-white/5 border-none"
            >
              <div className="flex justify-between items-center border-b border-notion-light-border dark:border-white/5 pb-3 mb-1">
                <Badge
                  variant="ghost"
                  size="xs"
                  className="!p-0 font-black uppercase tracking-[0.25em] text-notion-light-text/60 dark:text-white/60 border-none bg-transparent"
                >
                  <span className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                    Tactical Forecast
                  </span>
                </Badge>
                <Icon.Activity
                  size={12}
                  className="text-indigo-600 dark:text-indigo-400 opacity-60"
                />
              </div>

              <div className="space-y-4 text-notion-light-text dark:text-white">
                {/* Predicted XP */}
                <div className="flex justify-between items-center">
                  <div className="flex flex-col gap-0.5">
                    <Badge
                      variant="ghost"
                      size="xs"
                      className="!p-0 text-notion-light-text/50 dark:text-white/40 uppercase font-black tracking-wider border-none bg-transparent"
                    >
                      Est. Session XP
                    </Badge>
                    <span className="text-lg font-black text-notion-light-text dark:text-white tracking-tight">
                      +{predictiveMetrics.predictedXP}{" "}
                      <span className="text-[10px] text-indigo-600 dark:text-indigo-400">
                        XP
                      </span>
                    </span>
                  </div>
                  <div className="text-right flex flex-col gap-0.5">
                    <Badge
                      variant="ghost"
                      size="xs"
                      className="!p-0 text-notion-light-text/50 dark:text-white/40 uppercase font-black tracking-wider border-none bg-transparent"
                    >
                      Next Lvl
                    </Badge>
                    <div className="text-[10px] font-black text-indigo-600 dark:text-indigo-300 tracking-tight">
                      {predictiveMetrics.potentialLevel >
                      operatorMetrics.level ? (
                        <span className="animate-pulse text-emerald-600 dark:text-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.3)]">
                          LVL UP IMMINENT
                        </span>
                      ) : (
                        <span>
                          {(operatorMetrics.xp +
                            predictiveMetrics.predictedXP) %
                            1000}{" "}
                          /{" "}
                          <span className="opacity-40 text-notion-light-text dark:text-white">
                            1000
                          </span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Momentum Tracking */}
                <div className="flex justify-between items-center">
                  <div className="flex flex-col gap-0.5">
                    <Badge
                      variant="ghost"
                      size="xs"
                      className="!p-0 text-notion-light-text/50 dark:text-white/40 uppercase font-black tracking-wider border-none bg-transparent"
                    >
                      Momentum
                    </Badge>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-lg font-black tracking-tight ${predictiveMetrics.isStreakAtRisk ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400"}`}
                      >
                        {operatorMetrics.streak}{" "}
                        <span className="text-[10px]">Days</span>
                      </span>
                      {predictiveMetrics.isStreakAtRisk && (
                        <Badge
                          variant="warning"
                          size="xs"
                          className="animate-pulse py-0 px-1.5 text-[7px] font-black tracking-widest border-none"
                        >
                          AT RISK
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="text-right flex flex-col gap-0.5">
                    <Badge
                      variant="ghost"
                      size="xs"
                      className="!p-0 text-notion-light-text/50 dark:text-white/40 uppercase font-black tracking-wider border-none bg-transparent"
                    >
                      Forecast
                    </Badge>
                    <span className="text-[10px] font-black text-notion-light-text/70 dark:text-white/70 block tracking-tight">
                      Day {predictiveMetrics.streakForecast}{" "}
                      <span className="opacity-40">Locked</span>
                    </span>
                  </div>
                </div>

                {/* Decision Calibration */}
                <div className="flex justify-between items-center border-t border-notion-light-border dark:border-white/5 pt-3 mt-1">
                  <div className="flex flex-col gap-0.5">
                    <Badge
                      variant="ghost"
                      size="xs"
                      className="!p-0 text-notion-light-text/50 dark:text-white/40 uppercase font-black tracking-wider border-none bg-transparent"
                    >
                      Calibration
                    </Badge>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-lg font-black tracking-tight ${
                          calibrationMetrics.calibrationScore >= 80
                            ? "text-emerald-600 dark:text-emerald-400"
                            : calibrationMetrics.calibrationScore >= 50
                              ? "text-indigo-600 dark:text-indigo-400"
                              : "text-amber-600 dark:text-amber-400"
                        }`}
                      >
                        {calibrationMetrics.calibrationScore}%
                      </span>
                      <Badge
                        variant="ghost"
                        size="xs"
                        className={`py-0 px-1.5 text-[7px] font-black tracking-widest uppercase border-none ${
                          calibrationMetrics.bias === "calibrated"
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-500/60"
                            : "bg-amber-500/10 text-amber-600 dark:text-amber-500/60"
                        }`}
                      >
                        {calibrationMetrics.bias}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end gap-1">
                    <Icon.Strategy
                      size={12}
                      className="text-notion-light-text/20 dark:text-white/20"
                    />
                    <Badge
                      variant="ghost"
                      size="xs"
                      className="!p-0 text-notion-light-text/50 dark:text-white/40 uppercase font-black tracking-widest leading-none border-none bg-transparent"
                    >
                      Impact Accuracy
                    </Badge>
                  </div>
                </div>

                {/* Biometric Calibration Correlation */}
                {biometricCalibration && biometricCalibration.length > 0 && (
                  <div className="flex flex-col gap-3 border-t border-notion-light-border dark:border-white/5 pt-3 mt-1">
                    <Badge
                      variant="ghost"
                      size="xs"
                      className="!p-0 text-notion-light-text/50 dark:text-white/40 uppercase font-black tracking-wider border-none bg-transparent"
                    >
                      State Accuracy
                    </Badge>
                    <div className="space-y-2">
                      {biometricCalibration.map((s) => (
                        <div
                          key={s.state}
                          className="flex justify-between items-center"
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-1.5 h-1.5 rounded-full ${s.state === "peak" ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" : s.state === "low" ? "bg-amber-500" : "bg-indigo-500"}`}
                            />
                            <span className="text-[10px] text-notion-light-text/60 dark:text-white/60 capitalize font-bold">
                              {s.state}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span
                              className={`text-[10px] font-black tracking-tight ${s.accuracy >= 80 ? "text-emerald-600 dark:text-emerald-400" : s.accuracy >= 50 ? "text-indigo-600 dark:text-indigo-400" : "text-amber-600 dark:text-amber-400"}`}
                            >
                              {s.accuracy}%
                            </span>
                            <Badge
                              variant="ghost"
                              size="xs"
                              className="!p-0 text-notion-light-text/20 dark:text-white/20 uppercase font-black tracking-widest border-none bg-transparent"
                            >
                              {s.bias}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Confidence Dial HUD Snippet */}
            <Card
              padding="none"
              className="pointer-events-auto bg-white/90 dark:bg-black/85 backdrop-blur-2xl border border-notion-light-border dark:border-white/10 p-5 rounded-[2rem] shadow-xl dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col gap-4 min-w-[240px] animate-slide-up [animation-delay:100ms] ring-1 ring-notion-light-border/50 dark:ring-white/5 border-none"
            >
              <div className="flex justify-between items-center">
                <Badge
                  variant="ghost"
                  size="xs"
                  className="!p-0 font-black uppercase tracking-[0.25em] text-notion-light-text/60 dark:text-white/60 border-none bg-transparent"
                >
                  Confidence Dial
                </Badge>
                <span
                  className={`${getConfidenceColor(confidenceScore).replace("text-", "text-").replace("dark:", "dark:")} font-black`}
                >
                  {confidenceScore}%
                </span>
              </div>
              <div className="relative h-2.5 bg-notion-light-sidebar dark:bg-white/5 rounded-full overflow-hidden p-[1px]">
                <div
                  className={`h-full rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(79,70,229,0.4)] ${
                    confidenceScore >= 80
                      ? "bg-gradient-to-r from-emerald-600 to-emerald-400"
                      : confidenceScore >= 50
                        ? "bg-gradient-to-r from-indigo-600 to-indigo-400"
                        : "bg-gradient-to-r from-amber-600 to-amber-400"
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
                          : "bg-notion-light-border dark:bg-white/10"
                      }`}
                    />
                  ))}
                </div>
                <Badge
                  variant="ghost"
                  size="xs"
                  className="!p-0 font-mono text-notion-light-text/40 dark:text-white/40 uppercase tracking-tighter border-none bg-transparent"
                >
                  {confidenceScore >= 80
                    ? "OPTIMAL"
                    : confidenceScore >= 50
                      ? "STABLE"
                      : "CAUTION"}
                </Badge>
              </div>
            </Card>

            {/* Project Momentum HUD Snippet (Advanced) */}
            {projectMomentum && projectMomentum.length > 0 && (
              <Card
                padding="none"
                className="pointer-events-auto bg-white/90 dark:bg-black/80 backdrop-blur-xl border border-notion-light-border dark:border-white/10 p-4 rounded-2xl shadow-xl dark:shadow-2xl flex flex-col gap-3 min-w-[200px] animate-slide-up [animation-delay:200ms] border-none"
              >
                <div className="flex justify-between items-center">
                  <Badge
                    variant="ghost"
                    size="xs"
                    className="!p-0 font-black uppercase tracking-widest text-notion-light-text/70 dark:text-white/60 border-none bg-transparent"
                  >
                    PROJECT MOMENTUM
                  </Badge>
                  <button
                    onClick={() => setIsDebriefMode(!isDebriefMode)}
                    className={`px-2 py-0.5 rounded text-[8px] font-black uppercase transition-all ${
                      isDebriefMode
                        ? "bg-indigo-600 dark:bg-indigo-500 text-white shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                        : "bg-notion-light-sidebar dark:bg-white/5 text-notion-light-text/40 dark:text-white/40 hover:bg-notion-light-hover dark:hover:bg-white/10"
                    }`}
                  >
                    {isDebriefMode ? "Close Debrief" : "Debrief Layer"}
                  </button>
                </div>
                <div className="space-y-3">
                  {projectMomentum.map((p) => (
                    <div key={p.name} className="flex flex-col gap-1.5">
                      <div className="flex justify-between items-center">
                        <span className="text-[11px] font-bold text-notion-light-text/80 dark:text-white/80 truncate max-w-[120px]">
                          {p.name}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <Badge
                            variant="ghost"
                            size="xs"
                            className={`!p-0 font-black border-none bg-transparent ${p.trend === "up" ? "text-emerald-600 dark:text-emerald-400" : p.trend === "down" ? "text-rose-600 dark:text-rose-400" : "text-notion-light-text/40 dark:text-white/40"}`}
                          >
                            {p.momentum}
                          </Badge>
                          {p.isAtRisk && (
                            <div className="w-1 h-1 rounded-full bg-rose-500 animate-pulse" />
                          )}
                        </div>
                      </div>
                      <div className="h-1 w-full bg-notion-light-sidebar dark:bg-white/5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-1000 ${p.isAtRisk ? "bg-rose-500" : "bg-indigo-600 dark:bg-indigo-500"}`}
                          style={{ width: `${p.completionRate}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Debrief Layer Overlay */}
            {isDebriefMode && (
              <div className="fixed inset-0 z-[60] bg-white/40 dark:bg-black/40 backdrop-blur-md animate-in fade-in duration-500 flex items-center justify-center p-10 pointer-events-auto">
                <Card
                  padding="none"
                  className="w-full max-w-4xl h-[80vh] bg-white/95 dark:bg-black/90 border border-notion-light-border dark:border-white/10 rounded-[3rem] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-500"
                >
                  <div className="p-8 border-b border-notion-light-border dark:border-white/5 flex justify-between items-center">
                    <div>
                      <h2 className="text-3xl font-black text-notion-light-text dark:text-white tracking-tighter uppercase">
                        Mission Debrief
                      </h2>
                      <p className="text-notion-light-text/40 dark:text-white/40 font-mono text-xs mt-1 uppercase tracking-widest">
                        Strategic Analysis & Performance Correlation
                      </p>
                    </div>
                    <button
                      onClick={() => setIsDebriefMode(false)}
                      className="p-3 rounded-full bg-notion-light-sidebar dark:bg-white/5 text-notion-light-text/40 dark:text-white/40 hover:text-notion-light-text dark:hover:text-white transition-colors"
                    >
                      <Icon.Close size={24} />
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    <div className="grid grid-cols-3 gap-8">
                      {/* Performance Metrics */}
                      <div className="space-y-6">
                        <Badge
                          variant="ghost"
                          size="xs"
                          className="!p-0 text-indigo-600 dark:text-indigo-400 font-black tracking-[0.3em] border-none bg-transparent"
                        >
                          PERFORMANCE
                        </Badge>
                        <div className="space-y-4">
                          {[
                            {
                              label: "Execution Precision",
                              value: 94,
                              trend: "+2%",
                            },
                            {
                              label: "Cognitive Load",
                              value: 68,
                              trend: "Stable",
                            },
                            {
                              label: "Flow Consistency",
                              value: 87,
                              trend: "+5%",
                            },
                          ].map((m) => (
                            <div
                              key={m.label}
                              className="p-4 rounded-2xl bg-notion-light-sidebar dark:bg-white/5 border border-notion-light-border dark:border-white/5"
                            >
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-[10px] font-black text-notion-light-text/40 dark:text-white/40 uppercase tracking-wider">
                                  {m.label}
                                </span>
                                <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400">
                                  {m.trend}
                                </span>
                              </div>
                              <div className="flex items-end gap-2">
                                <span className="text-2xl font-black text-notion-light-text dark:text-white">
                                  {m.value}%
                                </span>
                                <div className="flex-1 h-1 bg-notion-light-border dark:bg-white/10 rounded-full mb-2 overflow-hidden">
                                  <div
                                    className="h-full bg-indigo-600 dark:bg-indigo-500 rounded-full"
                                    style={{ width: `${m.value}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Strategic Insights */}
                      <div className="col-span-2 space-y-6">
                        <Badge
                          variant="ghost"
                          size="xs"
                          className="!p-0 text-purple-600 dark:text-purple-400 font-black tracking-[0.3em] border-none bg-transparent"
                        >
                          STRATEGIC INSIGHTS
                        </Badge>
                        <div className="grid grid-cols-2 gap-4">
                          {[
                            {
                              title: "Peak Performance Window",
                              desc: "Your cognitive output peaks between 09:00 - 11:30. Schedule high-impact tasks accordingly.",
                              icon: Icon.Activity,
                            },
                            {
                              title: "Context Switching Cost",
                              desc: "Detected 15% efficiency drop during rapid task transitions in Analytics module.",
                              icon: Icon.Project,
                            },
                            {
                              title: "Momentum Sustainability",
                              desc: "Current trajectory suggests level 42 reach within 48 hours at present velocity.",
                              icon: Icon.Missions,
                            },
                            {
                              title: "Focus Calibration",
                              desc: "Deep work sessions are 22% more effective when preceded by Biometric Sync.",
                              icon: Icon.Strategy,
                            },
                          ].map((i) => (
                            <div
                              key={i.title}
                              className="p-5 rounded-[2rem] bg-notion-light-sidebar dark:bg-white/5 border border-notion-light-border dark:border-white/5 hover:border-indigo-500/30 transition-colors group"
                            >
                              <i.icon
                                size={20}
                                className="text-indigo-600 dark:text-indigo-400 mb-3 opacity-60 group-hover:opacity-100 transition-opacity"
                              />
                              <h4 className="text-sm font-black text-notion-light-text dark:text-white mb-2 uppercase tracking-tight">
                                {i.title}
                              </h4>
                              <p className="text-xs text-notion-light-text/60 dark:text-white/60 leading-relaxed font-medium">
                                {i.desc}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Timeline Correlation */}
                    <div className="mt-12 p-8 rounded-[3rem] bg-indigo-600/5 dark:bg-indigo-500/5 border border-indigo-500/10">
                      <div className="flex justify-between items-center mb-8">
                        <Badge
                          variant="ghost"
                          size="xs"
                          className="!p-0 text-indigo-600 dark:text-indigo-400 font-black tracking-[0.3em] border-none bg-transparent"
                        >
                          ACTIVITY CORRELATION
                        </Badge>
                        <div className="flex gap-4">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-500" />
                            <span className="text-[10px] font-black text-notion-light-text/40 dark:text-white/40 uppercase">
                              Output
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-600 dark:bg-emerald-500" />
                            <span className="text-[10px] font-black text-notion-light-text/40 dark:text-white/40 uppercase">
                              Focus
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="h-32 flex items-end gap-1">
                        {activityCorrelationData.map((data, i) => (
                          <div
                            key={i}
                            className="flex-1 flex flex-col gap-1 group relative"
                          >
                            <div
                              className="w-full bg-emerald-600/40 dark:bg-emerald-500/40 rounded-t-sm hover:bg-emerald-500 transition-colors cursor-help"
                              style={{ height: `${data.focusHeight}%` }}
                            >
                              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white dark:bg-black border border-notion-light-border dark:border-white/10 px-2 py-1 rounded text-[8px] font-black opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 text-notion-light-text dark:text-white">
                                FOCUS: {data.focusValue}%
                              </div>
                            </div>
                            <div
                              className="w-full bg-indigo-600/40 dark:bg-indigo-500/40 rounded-t-sm hover:bg-indigo-500 transition-colors"
                              style={{ height: `${data.outputHeight}%` }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            )}
          </div>
        )}

        {/* Top Row: Core Metrics & Operator Status */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          <div className="lg:col-span-2">
            <SummaryCards metrics={metrics} />
          </div>
          <Card
            variant="default"
            padding="none"
            className="bg-gradient-to-br from-indigo-600 to-violet-700 dark:from-indigo-700 dark:to-violet-900 text-white border-none shadow-lg relative overflow-hidden group flex flex-col justify-center min-h-[200px]"
          >
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-500">
              <Icon.Rank size={120} />
            </div>
            <div className="relative z-10 p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <Badge
                    variant="ghost"
                    size="xs"
                    className="!p-0 font-black uppercase tracking-[0.2em] opacity-70 border-none bg-transparent text-white"
                  >
                    Operator Status
                  </Badge>
                  <h3 className="text-2xl font-bold tracking-tight mt-1">
                    Level {operatorMetrics.level}
                  </h3>
                </div>
                <Badge
                  variant="custom"
                  size="xs"
                  className="px-3 py-1 bg-white/20 rounded-full text-[10px] font-bold backdrop-blur-md border border-white/10 uppercase tracking-widest text-white"
                >
                  Specialist
                </Badge>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1.5 opacity-80">
                    <Badge
                      variant="ghost"
                      size="xs"
                      className="!p-0 text-white font-bold uppercase tracking-widest border-none bg-transparent"
                    >
                      XP Progress
                    </Badge>
                    <span className="text-[10px] font-bold text-white">
                      {operatorMetrics.xp % 1000} / 1000
                    </span>
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
                    <Badge
                      variant="ghost"
                      size="xs"
                      className="!p-0 opacity-70 block uppercase font-bold tracking-tighter mb-1 border-none bg-transparent text-white"
                    >
                      Streak
                    </Badge>
                    <div className="flex items-center gap-2 text-white">
                      <Icon.Streak size={16} className="text-violet-400" />
                      <span className="text-lg font-bold">
                        {operatorMetrics.streak}d
                      </span>
                    </div>
                  </div>
                  <div className="bg-white/10 p-3 rounded-xl backdrop-blur-sm border border-white/5 hover:bg-white/20 transition-colors">
                    <Badge
                      variant="ghost"
                      size="xs"
                      className="!p-0 opacity-70 block uppercase font-bold tracking-tighter mb-1 border-none bg-transparent text-white"
                    >
                      Artifacts
                    </Badge>
                    <div className="flex items-center gap-2 text-white">
                      <Icon.Vault size={16} className="text-purple-400" />
                      <span className="text-lg font-bold">
                        {operatorMetrics.artifactsGained}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Quick Actions Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card
            onClick={() => onNavigate("MISSIONS")}
            hoverEffect
            variant="default"
            className="cursor-pointer group border-slate-200/60 dark:border-white/5"
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
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1 uppercase tracking-tight">
                Active Missions
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Manage your tactical task list and project execution.
              </p>
            </div>
          </Card>

          <Card
            onClick={() => onNavigate("KNOWLEDGE")}
            hoverEffect
            variant="default"
            className="cursor-pointer group border-slate-200/60 dark:border-white/5"
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
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1 uppercase tracking-tight">
                Knowledge Base
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Access your SOPs, framework library, and intel.
              </p>
            </div>
          </Card>

          <Card
            onClick={() => onNavigate("CRM")}
            hoverEffect
            variant="default"
            className="cursor-pointer group border-slate-200/60 dark:border-white/5"
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
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1 uppercase tracking-tight">
                Contact Layer
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Track interactions with clients, leads, and vendors.
              </p>
            </div>
          </Card>
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
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400">
                <Icon.Missions size={20} />
              </div>
              <div>
                <Badge
                  variant="ghost"
                  size="xs"
                  className="!p-0 font-black text-notion-light-text/40 dark:text-notion-dark-text/40 uppercase tracking-[0.2em]"
                >
                  Tactical Focus
                </Badge>
                <h3 className="text-sm font-bold text-notion-light-text dark:text-notion-dark-text">
                  Top Priorities
                </h3>
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
                variant="ghost"
                size="sm"
                className="text-[10px] font-black uppercase tracking-widest hover:text-indigo-600 dark:hover:text-indigo-400 border border-notion-light-border dark:border-notion-dark-border bg-notion-light-sidebar dark:bg-notion-dark-sidebar rounded-xl px-4"
              >
                Full Board{" "}
                <Icon.Layout
                  size={14}
                  className="ml-2 group-hover:translate-x-0.5 transition-transform"
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
