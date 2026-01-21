import React from "react";
import { TaskEntry } from "../../types";
import { PRIORITY_DOTS } from "@/constants";
import { formatRelativeDate, getProjectStyle } from "../../utils/formatUtils";
import { CopyIdButton } from "../CopyIdButton";
import { Icon, iconProps } from "../Icons";
import { Button } from "../ui";

interface KanbanCardProps {
  task: TaskEntry;
  onEdit: (entry: TaskEntry) => void;
  onFocus: (entry: TaskEntry) => void;
  onDuplicate: (entry: TaskEntry) => void;
  isDone?: boolean;
  dependencyStatus: {
    count: number;
    blocked: boolean;
    blockerCount: number;
  } | null;
}

export const KanbanCard: React.FC<KanbanCardProps> = ({
  task,
  onEdit,
  onFocus,
  onDuplicate,
  isDone,
  dependencyStatus,
}) => {
  const getTags = (desc: string) => {
    const matches = desc.match(/#\w+/g);
    return matches || [];
  };

  const tags = getTags(task.description);

  return (
    <div
      onClick={() => onEdit(task)}
      className={`notion-card-interactive p-3 ${isDone ? "opacity-60" : ""}`}
    >
      <div className="flex justify-between items-start mb-2">
        <span className={`notion-badge ${getProjectStyle(task.project)}`}>
          {task.project}
        </span>
        <div className="flex gap-1.5 items-center">
          {dependencyStatus && (
            <div
              className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold border transition-colors ${dependencyStatus.blocked ? "bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 border-purple-500/20 dark:border-purple-500/30" : "bg-notion-light-sidebar dark:bg-notion-dark-sidebar text-notion-light-muted dark:text-notion-dark-muted border-notion-light-border dark:border-notion-dark-border"}`}
              title={dependencyStatus.blocked ? "Blocked" : "Dependencies"}
            >
              <Icon.Link className="w-2.5 h-2.5" strokeWidth={3} />
              {dependencyStatus.blocked && (
                <span>{dependencyStatus.blockerCount}</span>
              )}
            </div>
          )}
          <div
            className={`w-1.5 h-1.5 rounded-full ${PRIORITY_DOTS[task.priority]}`}
          />
        </div>
      </div>

      <p
        className={`text-[13px] text-notion-light-text dark:text-notion-dark-text font-medium mb-3 line-clamp-2 leading-snug ${isDone ? "line-through opacity-50" : ""}`}
      >
        {task.description.split("\n")[0]}
      </p>

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {tags.map((tag, i) => (
            <span
              key={i}
              className="px-1.5 py-0.5 bg-notion-light-hover dark:bg-notion-dark-hover text-notion-light-muted dark:text-notion-dark-muted text-[9px] font-bold rounded border border-notion-light-border dark:border-notion-dark-border"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between pt-2 border-t border-notion-light-border/50 dark:border-notion-dark-border/30">
        <span
          className={`notion-label ${formatRelativeDate(task.date).colorClass}`}
        >
          {formatRelativeDate(task.date).text}
        </span>
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <CopyIdButton
            id={task.id}
            className="text-notion-light-muted hover:text-notion-light-text dark:hover:text-notion-dark-text p-1 rounded hover:bg-notion-light-hover dark:hover:bg-notion-dark-hover"
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate(task);
            }}
            className="text-notion-light-muted hover:text-notion-light-text dark:hover:text-notion-dark-text h-6 w-6"
          >
            <Icon.Copy {...iconProps(12)} />
          </Button>
          {!isDone && (
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onFocus(task);
              }}
              className="text-notion-light-muted hover:text-notion-light-text dark:hover:text-notion-dark-text h-6 w-6"
            >
              <Icon.Focus {...iconProps(12)} />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
