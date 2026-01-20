import React, { useMemo } from "react";
import { TaskEntry, MetricSummary, Page, OperatorMetrics } from "@/types";
import { SummaryCards } from "../SummaryCards";
import { MissionTrendChart } from "../analytics/MissionTrendChart";
import { ProjectDistributionList } from "../analytics/ProjectDistributionList";
import { TaskTable } from "../TaskTable";
import { Icon, iconProps } from "../Icons";
import { ViewHeader } from "../ViewHeader";
import { Button, Card } from "../ui";
import { toast } from "sonner";
import { useTableColumns, ColumnConfig } from "../../hooks/useTableColumns";
import { COLUMN_CONFIG_KEY } from "../../constants/storage";
import { ColumnConfigDropdown } from "../ColumnConfigDropdown";
import { MODULE_COLORS } from "@/constants";

const DEFAULT_COLUMNS = [
  { key: "date", label: "Due", visible: true, width: "w-32" },
  {
    key: "description",
    label: "Mission",
    visible: true,
    width: "min-w-[300px]",
  },
  { key: "project", label: "Project", visible: true, width: "w-32" },
  { key: "priority", label: "Priority", visible: true, width: "w-28" },
  { key: "status", label: "Status", visible: true, width: "w-32" },
];

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
  onOpenCreate: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
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
  onOpenCreate,
}) => {
  const tacticalFocus = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];

    return entries
      .filter((e) => e.status !== "Done")
      .map((t) => {
        let score = 0;
        // Priority Score
        if (t.priority === "High") score += 3;
        // Date Score (Overdue is highest priority)
        if (t.date < today) score += 5;
        // Imminent (Due today or tomorrow)
        else if (t.date === today) score += 2;

        // Dependency Score (Blocking others)
        const isBlockingOthers = entries.some(
          (other) =>
            other.dependencies?.includes(t.id) && other.status !== "Done",
        );
        if (isBlockingOthers) score += 2;

        return { ...t, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
  }, [entries]);

  const xpProgress = (operatorMetrics.xp % 1000) / 10; // Simple XP bar logic

  const { columns, toggleColumn } = useTableColumns(
    DEFAULT_COLUMNS as ColumnConfig[],
    COLUMN_CONFIG_KEY,
  );

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
        <div className="notion-card p-6 bg-gradient-to-br from-blue-600 to-indigo-700 dark:from-blue-700 dark:to-indigo-900 text-white border-none shadow-lg relative overflow-hidden group flex flex-col justify-center min-h-[200px]">
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
                    <Icon.Streak size={16} className="text-orange-400" />
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
                    <Icon.Vault size={16} className="text-emerald-400" />
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

      {/* Middle Row: Quick Actions & Intelligence */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-1 space-y-4">
          <div className="flex items-center gap-2 px-1">
            <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">
              Quick Actions
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={onOpenCreate}
              className="flex flex-col items-center justify-center p-6 bg-white dark:bg-notion-dark-sidebar rounded-2xl border border-slate-200/60 dark:border-white/5 hover:border-blue-500/50 dark:hover:border-blue-500/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="p-4 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-2xl mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-sm">
                <Icon.Plus size={24} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-600 dark:text-slate-400">
                New Mission
              </span>
            </button>
            <button
              onClick={() => onNavigate("KNOWLEDGE")}
              className="flex flex-col items-center justify-center p-6 bg-white dark:bg-notion-dark-sidebar rounded-2xl border border-slate-200/60 dark:border-white/5 hover:border-amber-500/50 dark:hover:border-amber-500/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-amber-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="p-4 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-2xl mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-sm">
                <Icon.Notes size={24} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-600 dark:text-slate-400">
                New Note
              </span>
            </button>
            <button
              onClick={() => onNavigate("CRM")}
              className="flex flex-col items-center justify-center p-6 bg-white dark:bg-notion-dark-sidebar rounded-2xl border border-slate-200/60 dark:border-white/5 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="p-4 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-2xl mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-sm">
                <Icon.Contacts size={24} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-600 dark:text-slate-400">
                Log Contact
              </span>
            </button>
            <button
              onClick={() => onNavigate("VAULT")}
              className="flex flex-col items-center justify-center p-6 bg-white dark:bg-notion-dark-sidebar rounded-2xl border border-slate-200/60 dark:border-white/5 hover:border-slate-500/50 dark:hover:border-slate-500/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="p-4 bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-slate-400 rounded-2xl mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-sm">
                <Icon.Vault size={24} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-600 dark:text-slate-400">
                Secure Vault
              </span>
            </button>
          </div>
        </div>

        {/* intelligence */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="bg-white dark:bg-notion-dark-sidebar p-10 rounded-2xl border border-slate-200/60 dark:border-white/5 shadow-sm hover:shadow-2xl transition-all duration-500 relative overflow-hidden flex-1 group">
            {/* Background pattern */}
            <div className="absolute top-0 right-0 w-full h-full opacity-[0.03] dark:opacity-[0.07] pointer-events-none">
              <div className="absolute top-0 right-0 p-8 transform group-hover:scale-110 group-hover:rotate-12 transition-transform duration-700">
                <Icon.Ai size={200} />
              </div>
            </div>

            <div className="flex items-center gap-6 mb-8 relative z-10">
              <div className="p-4 bg-violet-600 text-white rounded-2xl shadow-xl shadow-violet-500/20 transform group-hover:scale-110 transition-transform duration-300">
                <Icon.Ai {...iconProps(32)} />
              </div>
              <div>
                <h3 className="font-black text-xl text-slate-900 dark:text-white tracking-tighter">
                  WesAI Briefing
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500"></span>
                  </span>
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-violet-600 dark:text-violet-400">
                    Agentic Co-Pilot Online
                  </span>
                </div>
              </div>
            </div>
            <div className="relative z-10 mb-10">
              <div className="absolute -left-6 top-0 bottom-0 w-1 bg-gradient-to-b from-violet-500/0 via-violet-500/40 to-violet-500/0" />
              <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed italic font-medium">
                "We've got{" "}
                <span className="text-violet-600 dark:text-violet-400 font-black">
                  {tacticalFocus.length} high-impact targets
                </span>{" "}
                identified for immediate execution. Your current streak is{" "}
                <span className="text-violet-600 dark:text-violet-400 font-black">
                  {operatorMetrics.streak} days
                </span>
                —let's keep the momentum."
              </p>
            </div>
            <Button
              onClick={() => {
                onNavigate("WESAI");
                toast.info("Connecting to WesAI...", {
                  description: "Initializing agentic co-pilot session.",
                  icon: <Icon.Ai size={14} />,
                });
              }}
              variant="custom"
              className="bg-violet-600 dark:bg-violet-500 hover:bg-violet-700 dark:hover:bg-violet-400 text-white border-none w-full justify-center py-5 text-[11px] font-black uppercase tracking-[0.3em] shadow-xl shadow-violet-500/30 active:scale-[0.98] group/btn relative overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-2">
                LAUNCH CO-PILOT SESSION{" "}
                <Icon.Ai size={16} className="animate-pulse" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            </Button>
          </div>
        </div>
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
                No pending high-priority missions. Take this time to strategize
                or explore new opportunities.
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
