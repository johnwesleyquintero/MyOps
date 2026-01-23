import React, { useMemo } from "react";
import { TaskEntry } from "../types";
import { PRIORITY_DOTS } from "@/constants";
import { getProjectStyle } from "../utils/formatUtils";
import { Card, Badge } from "./ui";

interface GanttChartProps {
  entries: TaskEntry[];
  onEdit: (entry: TaskEntry) => void;
}

export const GanttChart: React.FC<GanttChartProps> = React.memo(
  ({ entries, onEdit }) => {
    // Logic: 14 day rolling window.
    // Start: Today - 3 days.
    // End: Today + 11 days.

    const dates = useMemo(() => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const startDate = new Date(today);
      startDate.setDate(today.getDate() - 3);

      const arr = [];
      for (let i = 0; i < 14; i++) {
        const d = new Date(startDate);
        d.setDate(startDate.getDate() + i);
        arr.push(d);
      }
      return arr;
    }, []); // Static window based on today at mount

    const today = useMemo(() => {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      return d;
    }, []);

    // Group by Project and Date
    const indexedData = useMemo(() => {
      const data: Record<string, Record<string, TaskEntry[]>> = {};
      entries.forEach((e) => {
        if (!data[e.project]) data[e.project] = {};
        if (!data[e.project][e.date]) data[e.project][e.date] = [];
        data[e.project][e.date].push(e);
      });
      return data;
    }, [entries]);

    const projects = useMemo(
      () => Object.keys(indexedData).sort(),
      [indexedData],
    );

    // Helper to check if task is on this date
    const getTaskForDate = (projectName: string, date: Date) => {
      const dateStr = date.toISOString().split("T")[0]; // YYYY-MM-DD
      return indexedData[projectName]?.[dateStr] || [];
    };

    return (
      <Card
        padding="none"
        className="flex flex-col h-[calc(100vh-250px)] transition-colors overflow-hidden"
      >
        {/* Timeline Header */}
        <div className="flex border-b border-notion-light-border dark:border-notion-dark-border bg-notion-light-sidebar/50 dark:bg-notion-dark-sidebar/30 overflow-x-auto custom-scrollbar">
          <div className="w-24 md:w-40 flex-shrink-0 p-3 border-r border-notion-light-border dark:border-notion-dark-border sticky left-0 z-20 bg-notion-light-sidebar dark:bg-notion-dark-sidebar shadow-[4px_0_8px_-4px_rgba(0,0,0,0.1)] flex items-center">
            <Badge variant="ghost" size="xs" className="opacity-60">
              Project
            </Badge>
          </div>
          <div className="flex-1 flex">
            {dates.map((d, i) => {
              const isToday = d.getTime() === today.getTime();
              const isWeekend = d.getDay() === 0 || d.getDay() === 6;
              return (
                <div
                  key={i}
                  className={`flex-1 min-w-[60px] text-center py-2 border-r border-notion-light-border/30 dark:border-notion-dark-border/30 flex flex-col justify-center ${
                    isToday
                      ? "bg-notion-light-text/5 dark:bg-notion-dark-text/5"
                      : isWeekend
                        ? "bg-notion-light-sidebar/30 dark:bg-notion-dark-sidebar/30"
                        : ""
                  }`}
                >
                  <span
                    className={`text-[9px] font-bold uppercase ${
                      isToday
                        ? "text-notion-light-text dark:text-notion-dark-text"
                        : "text-notion-light-muted dark:text-notion-dark-muted"
                    }`}
                  >
                    {d.toLocaleDateString("en-US", { weekday: "short" })}
                  </span>
                  <span
                    className={`text-xs font-medium ${
                      isToday
                        ? "text-notion-light-text dark:text-notion-dark-text underline decoration-2 underline-offset-4 decoration-notion-light-text/30"
                        : "text-notion-light-text dark:text-notion-dark-text"
                    }`}
                  >
                    {d.getDate()}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Timeline Body */}
        <div className="flex-1 overflow-y-auto overflow-x-auto bg-notion-light-bg dark:bg-notion-dark-bg custom-scrollbar">
          {projects.length === 0 ? (
            <div className="flex items-center justify-center h-full text-notion-light-muted dark:text-notion-dark-muted text-sm">
              No active projects
            </div>
          ) : (
            projects.map((proj) => (
              <div
                key={proj}
                className="flex border-b border-notion-light-border/30 dark:border-notion-dark-border/30 min-h-[50px] w-max min-w-full"
              >
                {/* Y-Axis Label */}
                <div className="w-24 md:w-40 flex-shrink-0 p-2 border-r border-notion-light-border dark:border-notion-dark-border flex items-center bg-notion-light-bg dark:bg-notion-dark-bg sticky left-0 z-10 shadow-[4px_0_8px_-4px_rgba(0,0,0,0.1)]">
                  <span
                    className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium border ${getProjectStyle(proj)} truncate`}
                  >
                    {proj}
                  </span>
                </div>

                {/* Grid */}
                <div className="flex-1 flex">
                  {dates.map((d, i) => {
                    const dayTasks = getTaskForDate(proj, d);
                    return (
                      <div
                        key={i}
                        className="flex-1 min-w-[60px] border-r border-notion-light-border/20 dark:border-notion-dark-border/20 p-1 flex flex-col gap-1"
                      >
                        {dayTasks.map((t) => (
                          <div
                            key={t.id}
                            onClick={() => onEdit(t)}
                            className="h-8 bg-notion-light-hover dark:bg-notion-dark-hover border border-notion-light-border dark:border-notion-dark-border rounded px-1.5 flex items-center gap-1.5 cursor-pointer hover:bg-notion-light-sidebar dark:hover:bg-notion-dark-sidebar transition-colors overflow-hidden group"
                          >
                            <div
                              className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${PRIORITY_DOTS[t.priority]}`}
                            />
                            <span className="text-[10px] text-notion-light-text dark:text-notion-dark-text truncate">
                              {t.description.split("\n")[0]}
                            </span>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    );
  },
);
