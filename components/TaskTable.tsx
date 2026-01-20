import React from "react";
import { TaskEntry } from "../types";
import {
  COLUMN_CONFIG_KEY,
  PRIORITY_DOTS,
  STATUS_INDICATORS,
  MODULE_COLORS,
} from "@/constants";
import { Icon, iconProps } from "./Icons";
import { getProjectBadgeStyle } from "../utils/styleUtils";
import { formatRelativeDate } from "../utils/formatUtils";
import {
  useTableColumns,
  ColumnConfig,
  SortKey,
} from "../hooks/useTableColumns";
import { useSortableData } from "../hooks/useSortableData";
import { ColumnConfigDropdown } from "./ColumnConfigDropdown";

interface TaskTableProps {
  entries: TaskEntry[];
  isLoading: boolean;
  onEdit: (entry: TaskEntry) => void;
  onDelete: (entry: TaskEntry) => void;
  onStatusUpdate?: (entry: TaskEntry) => void;
  onDescriptionUpdate?: (entry: TaskEntry, newDesc: string) => void;
  onFocus: (entry: TaskEntry) => void;
  onDuplicate: (entry: TaskEntry) => void;
  allEntries?: TaskEntry[];
  // Optional external column control
  externalColumns?: ColumnConfig[];
  externalToggleColumn?: (key: SortKey) => void;
  showConfigGear?: boolean;
}

const DEFAULT_COLUMNS: ColumnConfig[] = [
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

const TableSkeleton = ({ colSpan }: { colSpan: number }) => (
  <tbody className="divide-y divide-notion-light-border dark:divide-notion-dark-border animate-pulse">
    {[...Array(5)].map((_, i) => (
      <tr key={i}>
        <td colSpan={colSpan} className="px-3 py-4">
          <div className="flex gap-4">
            <div className="h-4 bg-notion-light-hover dark:bg-notion-dark-hover rounded w-24"></div>
            <div className="h-4 bg-notion-light-hover dark:bg-notion-dark-hover rounded w-full"></div>
            <div className="h-4 bg-notion-light-hover dark:bg-notion-dark-hover rounded w-20"></div>
          </div>
        </td>
      </tr>
    ))}
  </tbody>
);

export const TaskTable: React.FC<TaskTableProps> = ({
  entries,
  isLoading,
  onEdit,
  onDelete,
  onStatusUpdate,
  onFocus,
  onDuplicate,
  externalColumns,
  externalToggleColumn,
  showConfigGear = true,
}) => {
  const { columns: internalColumns, toggleColumn: internalToggleColumn } =
    useTableColumns(DEFAULT_COLUMNS, COLUMN_CONFIG_KEY);

  const colors = MODULE_COLORS.tasks;

  const columns = externalColumns || internalColumns;
  const toggleColumn = externalToggleColumn || internalToggleColumn;

  const {
    items: sortedEntries,
    requestSort,
    sortConfig,
  } = useSortableData(entries);

  return (
    <div className="flex flex-col h-full overflow-hidden bg-notion-light-bg dark:bg-notion-dark-bg transition-colors">
      <div className="flex-1 overflow-auto custom-scrollbar border border-notion-light-border dark:border-notion-dark-border rounded shadow-sm">
        <table className="w-full text-left border-collapse table-fixed">
          <thead className="sticky top-0 z-20 bg-notion-light-sidebar dark:bg-notion-dark-sidebar border-b border-notion-light-border dark:border-notion-dark-border">
            <tr>
              {columns
                .filter((c) => c.visible)
                .map((col) => (
                  <th
                    key={col.key}
                    className={`${col.width} px-3 py-2 text-[10px] font-bold text-notion-light-muted dark:text-notion-dark-muted uppercase tracking-widest cursor-pointer ${colors.hoverBg} transition-colors group ${["project", "priority"].includes(col.key) ? "hidden md:table-cell" : ""}`}
                    onClick={() => requestSort(col.key as SortKey)}
                  >
                    <div className="flex items-center gap-2">
                      {col.label}
                      {sortConfig?.key === col.key && (
                        <span className="text-notion-light-text dark:text-notion-dark-text">
                          {sortConfig.direction === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              <th className="w-28 px-3 py-2 bg-notion-light-sidebar dark:bg-notion-dark-sidebar border-b border-notion-light-border dark:border-notion-dark-border">
                <div className="flex items-center justify-end gap-2">
                  <span className="text-[10px] font-bold text-notion-light-muted dark:text-notion-dark-muted uppercase tracking-widest">
                    Actions
                  </span>
                  {showConfigGear && (
                    <ColumnConfigDropdown
                      columns={columns}
                      toggleColumn={toggleColumn}
                    />
                  )}
                </div>
              </th>
            </tr>
          </thead>
          {isLoading ? (
            <TableSkeleton
              colSpan={columns.filter((c) => c.visible).length + 1}
            />
          ) : (
            <tbody className="divide-y divide-notion-light-border dark:divide-notion-dark-border">
              {sortedEntries.map((task) => (
                <tr
                  key={task.id}
                  className={`group ${colors.hoverBg} transition-colors`}
                >
                  {columns
                    .filter((c) => c.visible)
                    .map((col) => (
                      <td
                        key={col.key}
                        className={`px-3 py-2 align-top text-sm ${["project", "priority"].includes(col.key) ? "hidden md:table-cell" : ""}`}
                        onClick={() => {
                          if (col.key !== "description") onEdit(task);
                        }}
                      >
                        {col.key === "date" && (
                          <div className="flex flex-col">
                            <span
                              className={`text-[10px] font-medium ${formatRelativeDate(task.date).colorClass}`}
                            >
                              {formatRelativeDate(task.date).text}
                            </span>
                          </div>
                        )}
                        {col.key === "description" && (
                          <div
                            className="relative pr-8 cursor-pointer group/desc"
                            onClick={() => onEdit(task)}
                          >
                            <p
                              className={`text-notion-light-text dark:text-notion-dark-text font-medium leading-relaxed group-hover/desc:${colors.text} transition-colors`}
                            >
                              {task.description.split("\n")[0]}
                            </p>
                          </div>
                        )}
                        {col.key === "project" && (
                          <span
                            className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium border ${getProjectBadgeStyle(task.project)}`}
                          >
                            {task.project}
                          </span>
                        )}
                        {col.key === "priority" && (
                          <div className="flex items-center gap-1.5">
                            <div
                              className={`w-1.5 h-1.5 rounded-full ${PRIORITY_DOTS[task.priority]}`}
                            />
                            <span className="text-xs text-notion-light-text dark:text-notion-dark-text">
                              {task.priority}
                            </span>
                          </div>
                        )}
                        {col.key === "status" && (
                          <div
                            className="flex items-center gap-1.5 cursor-pointer group/status"
                            onClick={() =>
                              onStatusUpdate && onStatusUpdate(task)
                            }
                          >
                            <div
                              className={`w-1.5 h-1.5 rounded-full ${STATUS_INDICATORS[task.status]} group-hover/status:ring-2 group-hover/status:ring-offset-1 group-hover/status:ring-current transition-all`}
                            />
                            <span
                              className={`text-xs text-notion-light-text dark:text-notion-dark-text group-hover/status:underline group-hover/status:${colors.text}`}
                            >
                              {task.status}
                            </span>
                          </div>
                        )}
                      </td>
                    ))}
                  <td className="px-3 py-2 align-top">
                    <div className="flex items-center justify-end gap-0.5 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => onEdit(task)}
                        className={`text-notion-light-muted hover:${colors.text} p-1 rounded ${colors.lightBg}`}
                        title="Edit Mission"
                      >
                        <Icon.Edit {...iconProps(14)} />
                      </button>
                      <button
                        onClick={() => onDuplicate(task)}
                        className={`text-notion-light-muted hover:${colors.text} p-1 rounded ${colors.lightBg}`}
                        title="Duplicate Mission"
                      >
                        <Icon.Copy {...iconProps(14)} />
                      </button>
                      <button
                        onClick={() => onFocus(task)}
                        className={`text-notion-light-muted hover:${colors.text} p-1 rounded ${colors.lightBg}`}
                        title="Focus Mode"
                      >
                        <Icon.Focus {...iconProps(14)} />
                      </button>
                      <div className="w-px h-3 bg-notion-light-border dark:bg-notion-dark-border mx-0.5" />
                      <button
                        onClick={() => onDelete(task)}
                        className="text-notion-light-muted hover:text-red-500 p-1 rounded hover:bg-red-500/10"
                        title="Terminate Mission"
                      >
                        <Icon.Delete {...iconProps(14)} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          )}
        </table>
      </div>
    </div>
  );
};
