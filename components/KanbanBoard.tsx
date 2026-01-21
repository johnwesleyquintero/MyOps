import React, { useMemo, useCallback } from "react";
import { TaskEntry, StatusLevel } from "../types";
import { KanbanCard } from "./kanban/KanbanCard";
import { Icon, iconProps } from "./Icons";
import { Button } from "./ui/Button";

interface KanbanBoardProps {
  entries: TaskEntry[];
  onEdit: (entry: TaskEntry) => void;
  onStatusUpdate: (entry: TaskEntry) => void;
  onAdd: () => void;
  onFocus: (entry: TaskEntry) => void;
  onDuplicate: (entry: TaskEntry) => void;
  allEntries?: TaskEntry[];
}

export const KanbanBoard: React.FC<KanbanBoardProps> = React.memo(
  ({ entries, onEdit, onAdd, onFocus, onDuplicate, allEntries = [] }) => {
    const entriesMap = useMemo(() => {
      const map = new Map<string, TaskEntry>();
      allEntries.forEach((e) => map.set(e.id, e));
      return map;
    }, [allEntries]);

    const columns = useMemo(() => {
      const cols: Record<StatusLevel, TaskEntry[]> = {
        Backlog: [],
        "In Progress": [],
        Done: [],
      };
      entries.forEach((e) => {
        if (cols[e.status]) {
          cols[e.status].push(e);
        } else {
          cols["Backlog"].push(e);
        }
      });
      return cols;
    }, [entries]);

    const getDependencyStatus = useCallback(
      (entry: TaskEntry) => {
        if (!entry.dependencies || entry.dependencies.length === 0) return null;
        const blockerCount = entry.dependencies.filter((depId) => {
          const depTask = entriesMap.get(depId);
          return depTask && depTask.status !== "Done";
        }).length;
        return {
          count: entry.dependencies.length,
          blocked: blockerCount > 0,
          blockerCount,
        };
      },
      [entriesMap],
    );

    return (
      <div className="flex flex-col md:flex-row gap-4 overflow-x-auto pb-4 h-[calc(100vh-250px)] custom-scrollbar snap-x snap-mandatory">
        {(["Backlog", "In Progress", "Done"] as StatusLevel[]).map((status) => (
          <div
            key={status}
            className="flex-1 min-w-[85vw] md:min-w-[300px] flex flex-col rounded bg-notion-light-sidebar dark:bg-notion-dark-sidebar/50 border border-notion-light-border dark:border-notion-dark-border/50 snap-center"
          >
            <div className="p-3 flex justify-between items-center border-b border-notion-light-border/50 dark:border-notion-dark-border/30">
              <div className="flex items-center gap-2">
                <h3 className="notion-label">{status}</h3>
                <span className="px-1.5 py-0.5 rounded bg-notion-light-hover dark:bg-notion-dark-hover text-[10px] font-bold text-notion-light-muted dark:text-notion-dark-muted">
                  {columns[status].length}
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onAdd}
                className="text-notion-light-muted dark:text-notion-dark-muted hover:text-notion-light-text dark:hover:text-notion-dark-text transition-all"
              >
                <Icon.Add {...iconProps(14)} />
              </Button>
            </div>
            <div className="flex-1 p-2 overflow-y-auto space-y-2 custom-scrollbar">
              {columns[status].map((task) => (
                <KanbanCard
                  key={task.id}
                  task={task}
                  onEdit={onEdit}
                  onFocus={onFocus}
                  onDuplicate={onDuplicate}
                  isDone={status === "Done"}
                  dependencyStatus={getDependencyStatus(task)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  },
);

KanbanBoard.displayName = "KanbanBoard";
