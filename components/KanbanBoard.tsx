import React, { useMemo, useCallback } from "react";
import { TaskEntry, StatusLevel } from "../types";
import { KanbanCard } from "./kanban/KanbanCard";
import { Icon, iconProps } from "./Icons";
import { Button, Badge } from "./ui";

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
      <div className="flex flex-col md:flex-row gap-6 overflow-x-auto pb-4 h-[calc(100vh-250px)] custom-scrollbar snap-x snap-mandatory">
        {(["Backlog", "In Progress", "Done"] as StatusLevel[]).map((status) => (
          <div
            key={status}
            className="flex-1 min-w-[85vw] md:min-w-[320px] flex flex-col rounded-xl bg-notion-light-sidebar/30 dark:bg-notion-dark-sidebar/20 border border-notion-light-border dark:border-notion-dark-border/40 snap-center shadow-sm"
          >
            <div className="p-4 flex justify-between items-center border-b border-notion-light-border/50 dark:border-notion-dark-border/20">
              <div className="flex items-center gap-2">
                <Badge
                  variant="ghost"
                  size="xs"
                  className="font-bold uppercase tracking-wider opacity-70"
                >
                  {status}
                </Badge>
                <Badge
                  variant="ghost"
                  size="xs"
                  className="bg-notion-light-hover/50 dark:bg-notion-dark-hover/30 px-1.5 opacity-60"
                >
                  {columns[status].length}
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onAdd}
                className="h-7 w-7 text-notion-light-muted dark:text-notion-dark-muted hover:text-notion-light-text dark:hover:text-notion-dark-text transition-all"
              >
                <Icon.Add {...iconProps(14)} />
              </Button>
            </div>
            <div className="flex-1 p-3 overflow-y-auto space-y-3 custom-scrollbar">
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
