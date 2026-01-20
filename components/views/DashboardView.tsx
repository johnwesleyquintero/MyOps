import React, { useMemo } from "react";
import { TaskEntry, MetricSummary, Page, OperatorMetrics } from "@/types";
import { SummaryCards } from "../SummaryCards";
import { MissionTrendChart } from "../analytics/MissionTrendChart";
import { ProjectDistributionList } from "../analytics/ProjectDistributionList";
import { TaskTable } from "../TaskTable";
import { Icon, iconProps } from "../Icons";
import { ViewHeader } from "../ViewHeader";
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

  const colors = MODULE_COLORS.tasks;
  const copilotColors = MODULE_COLORS.ai;
  const operatorColors = MODULE_COLORS.sovereign;

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
        <div
          className={`notion-card p-6 bg-gradient-to-br from-${operatorColors.text.split("-")[1]}-600 to-${colors.text.split("-")[1]}-700 dark:from-${operatorColors.text.split("-")[1]}-700 dark:to-${colors.text.split("-")[1]}-900 text-white border-none shadow-lg relative overflow-hidden group flex flex-col justify-center`}
        >
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
                    className="h-full bg-white rounded-full transition-all duration-1000"
                    style={{ width: `${xpProgress}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="bg-white/10 p-3 rounded-xl backdrop-blur-sm border border-white/5">
                  <span className="text-[10px] opacity-70 block uppercase font-bold tracking-tighter mb-1">
                    Streak
                  </span>
                  <div className="flex items-center gap-2">
                    <Icon.Streak
                      size={16}
                      className={MODULE_COLORS.awareness.text
                        .split(" ")[0]
                        .replace("text-", "text-")}
                    />
                    <span className="text-lg font-bold">
                      {operatorMetrics.streak}d
                    </span>
                  </div>
                </div>
                <div className="bg-white/10 p-3 rounded-xl backdrop-blur-sm border border-white/5">
                  <span className="text-[10px] opacity-70 block uppercase font-bold tracking-tighter mb-1">
                    Artifacts
                  </span>
                  <div className="flex items-center gap-2">
                    <Icon.Vault
                      size={16}
                      className={MODULE_COLORS.crm.text
                        .split(" ")[0]
                        .replace("text-", "text-")}
                    />
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
            <h3 className="text-[11px] font-bold text-notion-light-text/40 dark:text-notion-dark-text/40 uppercase tracking-[0.2em]">
              Quick Actions
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={onOpenCreate}
              className={`flex flex-col items-center justify-center p-4 bg-notion-light-sidebar dark:bg-notion-dark-sidebar rounded-2xl border border-notion-light-border dark:border-notion-dark-border ${MODULE_COLORS.sovereign.border.replace(/border-/g, "hover:border-")} ${MODULE_COLORS.sovereign.hoverBg} transition-all group`}
            >
              <div
                className={`p-2 ${MODULE_COLORS.sovereign.lightBg} ${MODULE_COLORS.sovereign.text} rounded-lg mb-2 group-hover:scale-110 transition-transform`}
              >
                <Icon.Plus size={18} />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-notion-light-text dark:text-notion-dark-text">
                New Mission
              </span>
            </button>
            <button
              onClick={() => onNavigate("KNOWLEDGE")}
              className={`flex flex-col items-center justify-center p-4 bg-notion-light-sidebar dark:bg-notion-dark-sidebar rounded-2xl border border-notion-light-border dark:border-notion-dark-border ${MODULE_COLORS.docs.border.replace(/border-/g, "hover:border-")} ${MODULE_COLORS.docs.hoverBg} transition-all group`}
            >
              <div
                className={`p-2 ${MODULE_COLORS.docs.lightBg} ${MODULE_COLORS.docs.text} rounded-lg mb-2 group-hover:scale-110 transition-transform`}
              >
                <Icon.Notes size={18} />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-notion-light-text dark:text-notion-dark-text">
                New Note
              </span>
            </button>
            <button
              onClick={() => onNavigate("CRM")}
              className={`flex flex-col items-center justify-center p-4 bg-notion-light-sidebar dark:bg-notion-dark-sidebar rounded-2xl border border-notion-light-border dark:border-notion-dark-border ${MODULE_COLORS.crm.border.replace(/border-/g, "hover:border-")} ${MODULE_COLORS.crm.hoverBg} transition-all group`}
            >
              <div
                className={`p-2 ${MODULE_COLORS.crm.lightBg} ${MODULE_COLORS.crm.text} rounded-lg mb-2 group-hover:scale-110 transition-transform`}
              >
                <Icon.Contacts size={18} />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-notion-light-text dark:text-notion-dark-text">
                Log Contact
              </span>
            </button>
            <button
              onClick={() => onNavigate("VAULT")}
              className={`flex flex-col items-center justify-center p-4 bg-notion-light-sidebar dark:bg-notion-dark-sidebar rounded-2xl border border-notion-light-border dark:border-notion-dark-border ${MODULE_COLORS.vault.border.replace(/border-/g, "hover:border-")} ${MODULE_COLORS.vault.hoverBg} transition-all group`}
            >
              <div
                className={`p-2 ${MODULE_COLORS.vault.lightBg} ${MODULE_COLORS.vault.text} rounded-lg mb-2 group-hover:scale-110 transition-transform`}
              >
                <Icon.Vault size={18} />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-notion-light-text dark:text-notion-dark-text">
                Secure Vault
              </span>
            </button>
          </div>
        </div>

        {/* intelligence */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="bg-notion-light-sidebar dark:bg-notion-dark-sidebar p-6 rounded-2xl border border-notion-light-border dark:border-notion-dark-border shadow-sm hover:shadow-md transition-shadow duration-300 relative overflow-hidden flex-1 group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform duration-500">
              <Icon.Ai size={80} />
            </div>
            <div className="flex items-center gap-3 mb-4">
              <div
                className={`p-2 ${copilotColors.lightBg} ${copilotColors.text} rounded-lg shadow-sm border ${copilotColors.border}`}
              >
                <Icon.Ai {...iconProps(18)} />
              </div>
              <div>
                <h3 className="font-bold text-sm text-notion-light-text dark:text-notion-dark-text tracking-tight">
                  WesAI Briefing
                </h3>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${copilotColors.bg} ${copilotColors.text} border ${copilotColors.border}`}
                >
                  Agentic Co-Pilot Active
                </span>
              </div>
            </div>
            <p
              className={`text-sm text-notion-light-text/80 dark:text-notion-dark-text/80 mb-6 leading-relaxed italic border-l-2 ${copilotColors.border.split(" ")[0]}/30 pl-4 py-1`}
            >
              "We've got {tacticalFocus.length} high-impact targets identified
              for immediate execution. Your current streak is{" "}
              {operatorMetrics.streak} days—let's keep the momentum."
            </p>
            <button
              onClick={() => {
                onNavigate("WESAI");
                toast.info("Connecting to WesAI...", {
                  description: "Initializing agentic co-pilot session.",
                  icon: <Icon.Ai size={14} />,
                });
              }}
              className={`notion-button bg-violet-600 dark:bg-violet-500 hover:bg-violet-700 dark:hover:bg-violet-600 text-white border-none w-full justify-center text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-violet-500/20 active:scale-[0.98] transition-all`}
            >
              LAUNCH CO-PILOT SESSION &rarr;
            </button>
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
              className={`text-notion-light-text/60 dark:text-notion-dark-text/60 text-[10px] font-black uppercase tracking-widest ${colors.text.replace("text-", "hover:text-").split(" ")[0]} dark:${colors.text.replace("text-", "hover:text-").split(" ")[0]} flex items-center gap-2 transition-all group bg-notion-light-sidebar dark:bg-notion-dark-sidebar px-4 py-2 rounded-xl border border-notion-light-border dark:border-notion-dark-border shadow-sm`}
            />
            <button
              onClick={() => onNavigate("MISSIONS")}
              className={`text-notion-light-text/60 dark:text-notion-dark-text/60 text-[10px] font-black uppercase tracking-widest ${colors.text.replace("text-", "hover:text-").split(" ")[0]} dark:${colors.text.replace("text-", "hover:text-").split(" ")[0]} flex items-center gap-2 transition-all group bg-notion-light-sidebar dark:bg-notion-dark-sidebar px-4 py-2 rounded-xl border border-notion-light-border dark:border-notion-dark-border shadow-sm`}
            >
              Full Board{" "}
              <Icon.Layout
                {...iconProps(
                  14,
                  "group-hover:translate-x-0.5 transition-transform",
                )}
              />
            </button>
          </div>
        </div>
        <div className="notion-card overflow-hidden transition-all duration-300 hover:shadow-lg border-notion-light-border dark:border-notion-dark-border">
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
        </div>
      </div>
    </div>
  );
};
