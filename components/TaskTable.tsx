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
import { Button, Badge } from "./ui";
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
  onFocus: (entry: TaskEntry) => void;
  onDuplicate: (entry: TaskEntry) => void;
  // Optional external column control
  externalColumns?: ColumnConfig[];
  externalToggleColumn?: (key: SortKey) => void;
  showConfigGear?: boolean;
}

const DEFAULT_COLUMNS: ColumnConfig[] = [
  { key: "date", label: "Due", visible: true, width: "w-24 md:w-32" },
  {
    key: "description",
    label: "Mission",
    visible: true,
    width: "min-w-[200px] md:min-w-[300px]",
  },
  { key: "project", label: "Project", visible: true, width: "w-24 md:w-32" },
  { key: "priority", label: "Priority", visible: true, width: "w-20 md:w-28" },
  { key: "status", label: "Status", visible: true, width: "w-24 md:w-32" },
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

export const TaskTable: React.FC<TaskTableProps> = React.memo(
  ({
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
                      className={`${col.width} px-2 md:px-3 py-2 text-[9px] md:text-[10px] font-bold text-notion-light-muted dark:text-notion-dark-muted uppercase tracking-widest cursor-pointer ${colors.hoverBg} transition-colors group ${["project", "priority"].includes(col.key) ? "hidden md:table-cell" : ""}`}
                      onClick={() => requestSort(col.key as keyof TaskEntry)}
                    >
                      <div className="flex items-center gap-1 md:gap-2">
                        {col.label}
                        {sortConfig?.key === col.key && (
                          <span className="text-notion-light-text dark:text-notion-dark-text">
                            {sortConfig.direction === "asc" ? "↑" : "↓"}
                          </span>
                        )}
                      </div>
                    </th>
                  ))}
                <th className="w-20 md:w-28 px-2 md:px-3 py-2 bg-notion-light-sidebar dark:bg-notion-dark-sidebar border-b border-notion-light-border dark:border-notion-dark-border">
                  <div className="flex items-center justify-end gap-2">
                    <span className="hidden md:inline text-[10px] font-bold text-notion-light-muted dark:text-notion-dark-muted uppercase tracking-widest">
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
                          className={`px-2 md:px-3 py-2 align-top text-[13px] md:text-sm ${["project", "priority"].includes(col.key) ? "hidden md:table-cell" : ""}`}
                          onClick={() => {
                            if (col.key !== "description") onEdit(task);
                          }}
                        >
                          {col.key === "date" && (
                            <div className="flex flex-col">
                              <Badge
                                variant="custom"
                                size="xs"
                                className={`font-bold ${formatRelativeDate(task.date).colorClass}`}
                              >
                                {formatRelativeDate(task.date).text}
                              </Badge>
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
                            <Badge
                              variant="custom"
                              size="xs"
                              className={`border ${getProjectBadgeStyle(task.project)}`}
                            >
                              {task.project}
                            </Badge>
                          )}
                          {col.key === "priority" && (
                            <div className="flex items-center gap-1.5">
                              <Badge
                                variant="dot"
                                size="xs"
                                dotColor={PRIORITY_DOTS[task.priority]}
                                className="border-none bg-transparent dark:bg-transparent text-notion-light-text dark:text-notion-dark-text"
                              >
                                {task.priority}
                              </Badge>
                            </div>
                          )}
                          {col.key === "status" && (
                            <div
                              className="flex items-center gap-1.5 cursor-pointer group/status"
                              onClick={() =>
                                onStatusUpdate && onStatusUpdate(task)
                              }
                            >
                              <Badge
                                variant="dot"
                                size="xs"
                                dotColor={STATUS_INDICATORS[task.status]}
                                className="border-none bg-transparent dark:bg-transparent text-notion-light-text dark:text-notion-dark-text group-hover/status:underline"
                              >
                                {task.status}
                              </Badge>
                            </div>
                          )}
                        </td>
                      ))}
                    <td className="px-2 md:px-3 py-2 align-top">
                      <div className="flex items-center justify-end gap-0.5 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                        <Button
                          onClick={() => onEdit(task)}
                          variant="custom"
                          size="icon"
                          className={`h-8 w-8 md:h-9 md:w-9 text-notion-light-muted hover:${colors.text} ${colors.lightBg} rounded-lg`}
                          title="Edit Mission"
                        >
                          <Icon.Edit {...iconProps(14)} />
                        </Button>
                        <Button
                          onClick={() => onDuplicate(task)}
                          variant="custom"
                          size="icon"
                          className={`hidden xs:flex h-8 w-8 md:h-9 md:w-9 text-notion-light-muted hover:${colors.text} ${colors.lightBg} rounded-lg`}
                          title="Duplicate Mission"
                        >
                          <Icon.Copy {...iconProps(14)} />
                        </Button>
                        <Button
                          onClick={() => onFocus(task)}
                          variant="custom"
                          size="icon"
                          className={`hidden sm:flex h-8 w-8 md:h-9 md:w-9 text-notion-light-muted hover:${colors.text} ${colors.lightBg} rounded-lg`}
                          title="Focus Mode"
                        >
                          <Icon.Focus {...iconProps(14)} />
                        </Button>
                        <div className="hidden xs:block w-px h-3 bg-notion-light-border dark:bg-notion-dark-border mx-0.5" />
                        <Button
                          onClick={() => onDelete(task)}
                          variant="custom"
                          size="icon"
                          className="h-8 w-8 md:h-9 md:w-9 text-notion-light-muted hover:text-purple-500 hover:bg-purple-500/10 rounded-lg"
                          title="Terminate Mission"
                        >
                          <Icon.Delete {...iconProps(14)} />
                        </Button>
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
  },
);
