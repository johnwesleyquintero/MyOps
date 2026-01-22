import React from "react";
import { Icon, iconProps } from "../Icons";

export interface ProjectDebrief {
  name: string;
  xp: number;
  completionRate: number;
  accuracy: number;
  momentum: number;
  peakStateMultiplier: string;
  trend: "up" | "down" | "stable";
  isAtRisk: boolean;
  riskFactor: "Low" | "Medium" | "High";
  reflections: number;
  recentActivity: number[];
}

interface ProjectDebriefPanelProps {
  projects: ProjectDebrief[];
  className?: string;
}

export const ProjectDebriefPanel: React.FC<ProjectDebriefPanelProps> = ({
  projects,
  className = "",
}) => {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 ${className}`}>
      {projects.map((project, idx) => (
        <div
          key={project.name}
          className="bg-white dark:bg-black/40 backdrop-blur-xl border border-slate-200/60 dark:border-white/5 p-5 rounded-2xl flex flex-col gap-4 group hover:shadow-2xl transition-all duration-500 animate-in slide-in-from-bottom-4"
          style={{ animationDelay: `${idx * 100}ms` }}
        >
          {/* Header */}
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
                Mission Debrief
              </h4>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white truncate max-w-[140px]">
                {project.name}
              </h3>
            </div>
            <div
              className={`p-2 rounded-xl ${
                project.isAtRisk
                  ? "bg-rose-500/10 text-rose-500"
                  : "bg-emerald-500/10 text-emerald-500"
              }`}
            >
              <Icon.Target {...iconProps(18)} />
            </div>
          </div>

          {/* Core Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                Momentum
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black text-slate-800 dark:text-white">
                  {project.momentum}
                </span>
                {project.trend === "up" && (
                  <Icon.TrendUp {...iconProps(14, "text-emerald-500")} />
                )}
                {project.trend === "down" && (
                  <Icon.TrendDown {...iconProps(14, "text-rose-500")} />
                )}
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                Multiplier
              </span>
              <div className="flex items-center gap-1">
                <span className="text-xl font-black text-indigo-500">
                  {project.peakStateMultiplier}
                </span>
                <span className="text-[10px] font-bold text-indigo-400/60 uppercase">
                  x
                </span>
              </div>
            </div>
          </div>

          {/* Progress Bar (Completion) */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                Efficiency
              </span>
              <span className="text-[10px] font-black text-slate-600 dark:text-slate-300">
                {project.completionRate}%
              </span>
            </div>
            <div className="h-1.5 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-1000"
                style={{ width: `${project.completionRate}%` }}
              />
            </div>
          </div>

          {/* Secondary Stats */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-white/5">
            <div className="flex items-center gap-3">
              <div className="flex flex-col">
                <span className="text-[8px] font-bold text-slate-400 uppercase">
                  Accuracy
                </span>
                <span className="text-[11px] font-black text-slate-700 dark:text-slate-200">
                  {project.accuracy}%
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[8px] font-bold text-slate-400 uppercase">
                  Reflections
                </span>
                <span className="text-[11px] font-black text-slate-700 dark:text-slate-200">
                  {project.reflections}
                </span>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[8px] font-bold text-slate-400 uppercase">
                Risk Level
              </span>
              <span
                className={`text-[10px] font-black uppercase tracking-tighter ${
                  project.riskFactor === "High"
                    ? "text-rose-500"
                    : project.riskFactor === "Medium"
                      ? "text-amber-500"
                      : "text-emerald-500"
                }`}
              >
                {project.riskFactor}
              </span>
            </div>
          </div>

          {/* Activity Mini Sparkline */}
          <div className="flex items-end justify-between h-8 gap-1 pt-2">
            {project.recentActivity.map((val, i) => (
              <div
                key={i}
                className="flex-1 bg-indigo-500/20 dark:bg-indigo-500/10 rounded-sm group-hover:bg-indigo-500/30 transition-all duration-300"
                style={{ height: `${Math.max(val * 20, 10)}%` }}
                title={`Day ${i + 1}: ${val} actions`}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
