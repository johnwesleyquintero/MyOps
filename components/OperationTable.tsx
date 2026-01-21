import React, { useState, useMemo, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { TaskEntry, StatusLevel } from "../types";
import {
  PRIORITY_COLORS,
  PRIORITY_DOTS,
  STATUS_COLORS,
  OPERATION_COLUMN_CONFIG_KEY,
} from "@/constants";
import { formatRelativeDate, getProjectStyle } from "../utils/formatUtils";
import { Button } from "./ui/Button";

interface OperationTableProps {
  entries: TaskEntry[];
  isLoading: boolean;
  onEdit: (entry: TaskEntry) => void;
  onStatusUpdate?: (entry: TaskEntry) => void;
}

type SortKey = "date" | "description" | "project" | "priority" | "status";
type SortDirection = "asc" | "desc";

interface ColumnConfig {
  key: SortKey;
  label: string;
  visible: boolean;
  width?: string;
}

const DEFAULT_COLUMNS: ColumnConfig[] = [
  { key: "date", label: "Due", visible: true, width: "w-32" },
  { key: "description", label: "Task", visible: true, width: "min-w-[300px]" },
  { key: "project", label: "Project", visible: true, width: "w-32" },
  { key: "priority", label: "Priority", visible: true, width: "w-28" },
  { key: "status", label: "Status", visible: true, width: "w-32" },
];

const TableSkeleton = ({ colSpan }: { colSpan: number }) => (
  <tbody className="divide-y divide-notion-light-border dark:divide-notion-dark-border animate-pulse">
    {[...Array(5)].map((_, i) => (
      <tr key={i}>
        <td colSpan={colSpan} className="px-6 py-4">
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

export const OperationTable: React.FC<OperationTableProps> = ({
  entries,
  isLoading,
  onEdit,
  onStatusUpdate,
}) => {
  // --- Column Management State ---
  const [columns, setColumns] = useState<ColumnConfig[]>(() => {
    try {
      const saved = localStorage.getItem(OPERATION_COLUMN_CONFIG_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const merged = DEFAULT_COLUMNS.map((def) => {
          const savedCol = parsed.find((p: ColumnConfig) => p.key === def.key);
          return savedCol ? { ...def, ...savedCol } : def;
        });
        const ordered = parsed
          .map((p: ColumnConfig) => merged.find((m) => m.key === p.key))
          .filter(Boolean) as ColumnConfig[];
        const missing = DEFAULT_COLUMNS.filter(
          (d) => !ordered.find((o) => o.key === d.key),
        );
        return [...ordered, ...missing];
      }
    } catch (e) {
      console.warn("Failed to load column config", e);
    }
    return DEFAULT_COLUMNS;
  });
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const configRef = useRef<HTMLDivElement>(null);

  const saveColumns = (newCols: ColumnConfig[]) => {
    setColumns(newCols);
    localStorage.setItem(OPERATION_COLUMN_CONFIG_KEY, JSON.stringify(newCols));
  };

  const toggleColumn = (key: SortKey) => {
    const newCols = columns.map((c) =>
      c.key === key ? { ...c, visible: !c.visible } : c,
    );
    saveColumns(newCols);
  };

  const moveColumn = (index: number, direction: "up" | "down") => {
    const newCols = [...columns];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newCols.length) return;
    [newCols[index], newCols[targetIndex]] = [
      newCols[targetIndex],
      newCols[index],
    ];
    saveColumns(newCols);
  };

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        configRef.current &&
        !configRef.current.contains(event.target as Node)
      ) {
        setIsConfigOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- Sorting & Data State ---
  const [sortConfig, setSortConfig] = useState<{
    key: SortKey;
    direction: SortDirection;
  }>({
    key: "date",
    direction: "desc",
  });

  const handleSort = (key: SortKey) => {
    setSortConfig((current) => ({
      key,
      direction:
        current.key === key && current.direction === "asc" ? "desc" : "asc",
    }));
  };

  const sortedEntries = useMemo(() => {
    if (!entries) return [];
    return [...entries].sort((a, b) => {
      let comparison = 0;
      switch (sortConfig.key) {
        case "date": {
          const timeA = a.date ? new Date(a.date).getTime() : 0;
          const timeB = b.date ? new Date(b.date).getTime() : 0;

          const isInvalidA = isNaN(timeA) || timeA === 0;
          const isInvalidB = isNaN(timeB) || timeB === 0;

          if (isInvalidA && isInvalidB) {
            comparison = 0;
          } else if (isInvalidA) {
            comparison = -1; // Move empty/invalid to bottom
          } else if (isInvalidB) {
            comparison = 1; // Move empty/invalid to bottom
          } else {
            comparison = timeA - timeB;
          }

          // Secondary sort by Priority if dates are equal
          if (comparison === 0) {
            const pRanks: Record<string, number> = {
              High: 0,
              Medium: 1,
              Low: 2,
            };
            const pA = pRanks[a.priority as string] ?? 99;
            const pB = pRanks[b.priority as string] ?? 99;
            comparison = pB - pA;
          }
          break;
        }
        case "priority": {
          const pRanks: Record<string, number> = {
            High: 0,
            Medium: 1,
            Low: 2,
          };
          comparison =
            (pRanks[a.priority as string] ?? 99) -
            (pRanks[b.priority as string] ?? 99);
          break;
        }
        case "status": {
          const sRanks: Record<StatusLevel, number> = {
            Backlog: 0,
            "In Progress": 1,
            Done: 2,
          };
          comparison = (sRanks[a.status] ?? 99) - (sRanks[b.status] ?? 99);
          break;
        }
        default: {
          const valA = String(a[sortConfig.key] || "").toLowerCase();
          const valB = String(b[sortConfig.key] || "").toLowerCase();
          if (valA < valB) comparison = -1;
          if (valA > valB) comparison = 1;
        }
      }
      return sortConfig.direction === "asc" ? comparison : -comparison;
    });
  }, [entries, sortConfig]);

  if (!isLoading && entries.length === 0) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-20 bg-notion-light-bg dark:bg-notion-dark-bg border border-notion-light-border dark:border-notion-dark-border rounded-xl border-dashed transition-colors">
        <div className="bg-notion-light-sidebar dark:bg-notion-dark-sidebar p-4 rounded-full mb-4 border border-notion-light-border dark:border-notion-dark-border">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8 text-notion-light-muted dark:text-notion-dark-muted"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h3 className="text-notion-light-text dark:text-notion-dark-text font-bold text-lg tracking-tight">
          All caught up
        </h3>
        <p className="text-notion-light-muted dark:text-notion-dark-muted text-sm mt-1 max-w-xs text-center font-medium">
          Your operation is clear. Time to strategize for the next move or enjoy
          the downtime.
        </p>
      </div>
    );
  }

  const SortHeader: React.FC<{ col: ColumnConfig }> = ({ col }) => {
    const isActive = sortConfig.key === col.key;
    const isAsc = sortConfig.direction === "asc";

    // Hide certain columns on mobile
    const mobileHiddenKeys = ["project", "priority"];
    const isMobileHidden = mobileHiddenKeys.includes(col.key);

    return (
      <th
        className={`px-4 md:px-6 py-3 bg-notion-light-sidebar dark:bg-notion-dark-sidebar text-[10px] md:text-[11px] uppercase tracking-widest font-bold text-notion-light-muted dark:text-notion-dark-muted cursor-pointer group/th select-none hover:bg-notion-light-hover dark:hover:bg-notion-dark-hover transition-colors whitespace-nowrap border-b border-notion-light-border dark:border-notion-dark-border ${isMobileHidden ? "hidden md:table-cell" : ""}`}
        onClick={() => handleSort(col.key)}
      >
        <div
          className={`flex items-center gap-1.5 ${isActive ? "text-notion-light-text dark:text-notion-dark-text" : ""}`}
        >
          {col.label}
          <div className="flex flex-col">
            <svg
              className={`w-2 h-2 ${isActive && isAsc ? "text-notion-light-text dark:text-notion-dark-text" : "text-notion-light-border dark:text-notion-dark-border"} ${!isActive && "group-hover/th:text-notion-light-muted dark:group-hover/th:text-notion-dark-muted"}`}
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 4l-8 8h16l-8-8z" />
            </svg>
            <svg
              className={`w-2 h-2 -mt-0.5 ${isActive && !isAsc ? "text-notion-light-text dark:text-notion-dark-text" : "text-notion-light-border dark:text-notion-dark-border"} ${!isActive && "group-hover/th:text-notion-light-muted dark:group-hover/th:text-notion-dark-muted"}`}
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 20l8-8H4l8 8z" />
            </svg>
          </div>
        </div>
      </th>
    );
  };

  const renderCell = (entry: TaskEntry, key: SortKey) => {
    switch (key) {
      case "date": {
        const dateInfo = formatRelativeDate(entry.date);
        return (
          <span
            className={`font-mono text-xs whitespace-nowrap ${dateInfo.colorClass}`}
          >
            {dateInfo.text}
          </span>
        );
      }
      case "description":
        return (
          <div
            className={`prose prose-sm max-w-none line-clamp-2 overflow-hidden ${entry.status === "Done" ? "opacity-50 line-through text-notion-light-muted dark:text-notion-dark-muted" : "text-notion-light-text dark:text-notion-dark-text"} cursor-pointer hover:underline transition-colors`}
            onClick={() => onEdit(entry)}
            title="Click to edit"
          >
            <ReactMarkdown
              components={{
                a: ({ ...props }) => (
                  <a
                    {...props}
                    className="text-notion-light-text dark:text-notion-dark-text underline decoration-notion-light-border/50 dark:decoration-notion-dark-border/50 hover:decoration-notion-light-text dark:hover:decoration-notion-dark-text pointer-events-none"
                  />
                ),
                p: ({ ...props }) => <span {...props} className="mr-1" />,
                strong: ({ ...props }) => (
                  <strong
                    {...props}
                    className="font-bold text-notion-light-text dark:text-notion-dark-text"
                  />
                ),
                em: ({ ...props }) => (
                  <em
                    {...props}
                    className="italic text-notion-light-muted dark:text-notion-dark-muted"
                  />
                ),
                code: ({ ...props }) => (
                  <code
                    {...props}
                    className="bg-notion-light-sidebar dark:bg-notion-dark-sidebar text-notion-light-muted dark:text-notion-dark-muted border border-notion-light-border dark:border-notion-dark-border px-1 py-0.5 rounded text-[10px] font-mono"
                  />
                ),
                h1: ({ ...props }) => (
                  <strong
                    {...props}
                    className="block text-notion-light-text dark:text-notion-dark-text font-bold"
                  />
                ),
                h2: ({ ...props }) => (
                  <strong
                    {...props}
                    className="block text-notion-light-text dark:text-notion-dark-text font-bold"
                  />
                ),
                ul: ({ ...props }) => <span {...props} />,
                li: ({ ...props }) => (
                  <span
                    {...props}
                    className="after:content-[',_'] last:after:content-none"
                  />
                ),
              }}
            >
              {entry.description}
            </ReactMarkdown>
          </div>
        );
      case "project":
        return (
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${getProjectStyle(entry.project)}`}
          >
            {entry.project}
          </span>
        );
      case "priority":
        return (
          <div
            className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold border ${PRIORITY_COLORS[entry.priority]?.combined || "bg-notion-light-sidebar dark:bg-notion-dark-sidebar border-notion-light-border dark:border-notion-dark-border text-notion-light-muted dark:text-notion-dark-muted"}`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${PRIORITY_DOTS[entry.priority] || "bg-notion-light-border dark:bg-notion-dark-border"}`}
            ></span>
            {entry.priority}
          </div>
        );
      case "status":
        return (
          <Button
            variant="custom"
            onClick={() => onStatusUpdate && onStatusUpdate(entry)}
            className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold border cursor-pointer hover:bg-notion-light-hover dark:hover:bg-notion-dark-hover h-auto min-h-0 ${STATUS_COLORS[entry.status]?.combined || "bg-notion-light-sidebar"}`}
            title="Click to cycle status"
          >
            {/* Status Dot */}
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                entry.status === "Done"
                  ? "bg-emerald-500"
                  : entry.status === "In Progress"
                    ? "bg-blue-500"
                    : "bg-notion-light-muted dark:text-notion-dark-muted"
              }`}
            ></span>
            {entry.status}
          </Button>
        );
      default:
        return null;
    }
  };

  const visibleColumns = columns.filter((c) => c.visible);

  return (
    <div className="relative">
      <div className="absolute -top-10 right-0 z-20" ref={configRef}>
        <Button
          variant="custom"
          onClick={() => setIsConfigOpen(!isConfigOpen)}
          className="flex items-center gap-2 px-3 py-1.5 bg-notion-light-bg dark:bg-notion-dark-bg border border-notion-light-border dark:border-notion-dark-border rounded text-xs font-medium text-notion-light-muted dark:text-notion-dark-muted hover:text-notion-light-text dark:hover:text-notion-dark-text hover:bg-notion-light-hover dark:hover:bg-notion-dark-hover shadow-sm transition-all h-auto min-h-0"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
          View
        </Button>

        {isConfigOpen && (
          <div className="absolute right-0 mt-2 w-56 bg-notion-light-bg dark:bg-notion-dark-bg border border-notion-light-border dark:border-notion-dark-border rounded-lg shadow-xl overflow-hidden animate-slide-in z-50">
            <div className="bg-notion-light-sidebar dark:bg-notion-dark-sidebar px-4 py-2 border-b border-notion-light-border dark:border-notion-dark-border text-[10px] font-bold uppercase text-notion-light-muted dark:text-notion-dark-muted tracking-wider">
              Table Columns
            </div>
            <div className="max-h-60 overflow-y-auto py-1">
              {columns.map((col, idx) => (
                <div
                  key={col.key}
                  className="flex items-center justify-between px-3 py-2 hover:bg-notion-light-hover dark:hover:bg-notion-dark-hover group"
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={col.visible}
                      onChange={() => toggleColumn(col.key)}
                      className="rounded border-notion-light-border dark:border-notion-dark-border text-notion-light-text dark:text-notion-dark-text bg-notion-light-bg dark:bg-notion-dark-bg focus:ring-0 h-4 w-4 cursor-pointer"
                    />
                    <span className="text-sm text-notion-light-text dark:text-notion-dark-text">
                      {col.label}
                    </span>
                  </div>
                  <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => moveColumn(idx, "up")}
                      disabled={idx === 0}
                      className="p-1 text-notion-light-muted hover:text-notion-light-text dark:hover:text-notion-dark-text disabled:opacity-30 h-6 w-6"
                    >
                      <svg
                        width="12"
                        height="12"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M5 15l7-7 7 7"
                        />
                      </svg>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => moveColumn(idx, "down")}
                      disabled={idx === columns.length - 1}
                      className="p-1 text-notion-light-muted hover:text-notion-light-text dark:hover:text-notion-dark-text disabled:opacity-30 h-6 w-6"
                    >
                      <svg
                        width="12"
                        height="12"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="overflow-hidden bg-notion-light-bg dark:bg-notion-dark-bg border border-notion-light-border dark:border-notion-dark-border rounded-xl shadow-sm">
        <div className="overflow-x-auto max-h-[650px] overflow-y-auto custom-scrollbar">
          <table className="min-w-full text-sm text-left relative border-collapse">
            <thead className="bg-notion-light-sidebar dark:bg-notion-dark-sidebar border-b border-notion-light-border dark:border-notion-dark-border sticky top-0 z-10 shadow-sm">
              <tr>
                {visibleColumns.map((col) => (
                  <SortHeader key={col.key} col={col} />
                ))}
                <th className="px-6 py-3 w-16 text-right bg-notion-light-sidebar dark:bg-notion-dark-sidebar text-[11px] uppercase tracking-widest text-notion-light-muted dark:text-notion-dark-muted font-bold sticky right-0 shadow-[inset_1px_0_0_0_rgba(233,233,232,0.5)] dark:shadow-[inset_1px_0_0_0_rgba(46,46,46,0.5)]"></th>
              </tr>
            </thead>

            {isLoading ? (
              <TableSkeleton colSpan={visibleColumns.length + 1} />
            ) : (
              <tbody className="divide-y divide-notion-light-border dark:divide-notion-dark-border">
                {sortedEntries.map((entry, idx) => (
                  <tr
                    key={entry.id || `row-${idx}`}
                    className={`group hover:bg-notion-light-hover/50 dark:hover:bg-notion-dark-hover/50 transition-colors ${entry.status === "Done" ? "bg-notion-light-sidebar/30 dark:bg-notion-dark-sidebar/30" : ""}`}
                  >
                    {visibleColumns.map((col) => (
                      <td
                        key={`${entry.id}-${col.key}`}
                        className={`px-4 md:px-6 py-3 align-middle ${col.width || ""} ${["project", "priority"].includes(col.key) ? "hidden md:table-cell" : ""}`}
                      >
                        {renderCell(entry, col.key)}
                      </td>
                    ))}
                    <td className="px-6 py-3 text-right sticky right-0 bg-notion-light-bg dark:bg-notion-dark-bg group-hover:bg-notion-light-hover/50 dark:group-hover:bg-notion-dark-hover/50 transition-colors shadow-[inset_1px_0_0_0_rgba(233,233,232,1)] dark:shadow-[inset_1px_0_0_0_rgba(46,46,46,1)]">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onEdit(entry)}
                          className="text-notion-light-muted hover:text-blue-600 dark:hover:text-blue-400 p-1.5 rounded hover:bg-notion-light-hover dark:hover:bg-notion-dark-hover transition-colors h-8 w-8"
                          title="Edit Task"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                            />
                          </svg>
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
    </div>
  );
};
