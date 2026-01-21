import React from "react";
import { TaskEntry, MetricSummary, Page, OperatorMetrics } from "@/types";
import { SummaryCards } from "../SummaryCards";
import { MissionTrendChart } from "../analytics/MissionTrendChart";
import { ProjectDistributionList } from "../analytics/ProjectDistributionList";
import { TaskTable } from "../TaskTable";
import { Icon, iconProps } from "../Icons";
import { ViewHeader } from "../ViewHeader";
import { Button, Card } from "../ui";
import { ColumnConfigDropdown } from "../ColumnConfigDropdown";
import { MODULE_COLORS } from "@/constants";
import { useDashboardLogic } from "../../hooks/useDashboardLogic";

interface DashboardViewProps {
  entries: TaskEntry[];
  metrics: MetricSummary;
  operatorMetrics: OperatorMetrics;
  isLoading: boolean;
  onEdit: (entry: TaskEntry) => void;
  onDelete: (entry: TaskEntry) => void;
  onStatusUpdate: (entry: TaskEntry) => void;
  onDescriptionUpdate: (entry: TaskEntry, desc: string) => void;
  onFocus: (entry: TaskEntry) => void;
  onDuplicate: (entry: TaskEntry) => void;
  onNavigate: (page: Page) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = React.memo(
  ({
    entries,
    metrics,
    operatorMetrics,
    isLoading,
    onEdit,
    onDelete,
    onStatusUpdate,
    onDescriptionUpdate,
    onFocus,
    onDuplicate,
    onNavigate,
  }) => {
    const { tacticalFocus, xpProgress, columns, toggleColumn } =
      useDashboardLogic({ entries, operatorMetrics });

    return (
      <div className="animate-fade-in space-y-8">
        <ViewHeader
          title="Command Center"
          subTitle="Operational overview and tactical focus"
        />

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
              onDescriptionUpdate={onDescriptionUpdate}
              onFocus={onFocus}
              onDuplicate={onDuplicate}
              allEntries={entries}
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
