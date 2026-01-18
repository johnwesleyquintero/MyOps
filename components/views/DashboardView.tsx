import React, { useMemo } from "react";
import { TaskEntry, MetricSummary, Page } from "@/types";
import { SummaryCards } from "../SummaryCards";
import { CashFlowChart } from "../analytics/CashFlowChart";
import { ExpenseCategoryList } from "../analytics/ExpenseCategoryList";
import { TaskTable } from "../TaskTable";
import { Icon, iconProps } from "../Icons";
import { ViewHeader } from "../ViewHeader";

interface DashboardViewProps {
  entries: TaskEntry[];
  metrics: MetricSummary;
  isLoading: boolean;
  onEdit: (entry: TaskEntry) => void;
  onDelete: (entry: TaskEntry) => void;
  onStatusUpdate: (entry: TaskEntry) => void;
  onDescriptionUpdate: (entry: TaskEntry, desc: string) => void;
  onFocus: (entry: TaskEntry) => void;
  onDuplicate: (entry: TaskEntry) => void;
  onNavigate: (page: Page) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  entries,
  metrics,
  isLoading,
  onEdit,
  onDelete,
  onStatusUpdate,
  onDescriptionUpdate,
  onFocus,
  onDuplicate,
  onNavigate,
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

  return (
    <div className="animate-fade-in space-y-6">
      <ViewHeader
        title="Command Center"
        subTitle="Operational overview and tactical focus"
      />
      <SummaryCards metrics={metrics} />

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <CashFlowChart entries={entries} />
        </div>
        <div className="space-y-6">
          <div className="bg-notion-light-sidebar dark:bg-notion-dark-sidebar p-6 rounded-2xl border border-notion-light-border dark:border-notion-dark-border shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-notion-light-text/5 dark:bg-notion-dark-text/5 rounded-lg text-notion-light-text dark:text-notion-dark-text">
                <Icon.Ai {...iconProps(18)} />
              </div>
              <h3 className="font-semibold text-sm text-notion-light-text dark:text-notion-dark-text tracking-tight">
                WesAI Briefing
              </h3>
            </div>
            <p className="text-sm text-notion-light-text/70 dark:text-notion-dark-text/70 mb-5 leading-relaxed italic">
              "We've got {tacticalFocus.length} high-impact targets identified
              for immediate execution. Let's clear the board."
            </p>
            <button
              onClick={() => onNavigate("MISSIONS")}
              className="notion-button w-full justify-center text-[11px] uppercase tracking-widest"
            >
              MISSION CONTROL &rarr;
            </button>
          </div>
          <ExpenseCategoryList entries={entries} />
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-4 mt-8">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded bg-notion-light-border dark:bg-notion-dark-border">
              <Icon.Missions
                {...iconProps(
                  14,
                  "text-notion-light-text/60 dark:text-notion-dark-text/60",
                )}
              />
            </div>
            <h3 className="text-[11px] font-bold text-notion-light-text/50 dark:text-notion-dark-text/50 uppercase tracking-[0.2em]">
              Tactical Focus
            </h3>
          </div>
          <button
            onClick={() => onNavigate("MISSIONS")}
            className="text-notion-light-muted dark:text-notion-dark-muted text-xs font-bold hover:text-notion-light-text dark:hover:text-notion-dark-text flex items-center gap-1.5 transition-colors group"
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
        <div className="notion-card overflow-hidden transition-all duration-300 hover:shadow-md">
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
          />
          {tacticalFocus.length === 0 && !isLoading && (
            <div className="p-16 text-center">
              <div className="inline-flex p-5 bg-notion-light-sidebar dark:bg-notion-dark-sidebar rounded-full mb-6 animate-in zoom-in duration-500">
                <Icon.Check
                  {...iconProps(
                    40,
                    "text-notion-light-text/40 dark:text-notion-dark-text/40",
                  )}
                />
              </div>
              <p className="text-notion-light-text/50 dark:text-notion-dark-text/50 font-medium tracking-tight">
                All clear, operator. No pending high-priority tasks.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
