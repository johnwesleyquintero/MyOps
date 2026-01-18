import { useState, useMemo } from "react";
import { TaskEntry, StatusLevel } from "../types";

export type SortKey =
  | "date"
  | "description"
  | "project"
  | "priority"
  | "status";
export type SortDirection = "asc" | "desc";

export const useSortableData = (
  items: TaskEntry[],
  config = { key: "date" as SortKey, direction: "desc" as SortDirection },
) => {
  const [sortConfig, setSortConfig] = useState(config);

  const sortedItems = useMemo(() => {
    const sortableItems = [...items];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
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

            // Secondary sort by Priority then Status if dates are equal
            if (comparison === 0) {
              const pRanks: Record<string, number> = {
                High: 0,
                Medium: 1,
                Low: 2,
              };
              const pA = pRanks[a.priority as string] ?? 99;
              const pB = pRanks[b.priority as string] ?? 99;

              if (pA !== pB) {
                // We want High(0) first when direction is desc.
                // direction=desc => result is -comparison.
                // So if pA=0, pB=1, we want -1.
                // -comparison = -1 => comparison = 1.
                // comparison = pB - pA = 1 - 0 = 1.
                comparison = pB - pA;
              } else {
                const sRanks: Record<string, number> = {
                  "In Progress": 0,
                  Backlog: 1,
                  Done: 2,
                };
                const sA = sRanks[a.status as string] ?? 99;
                const sB = sRanks[b.status as string] ?? 99;
                comparison = sB - sA;
              }
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
    }
    return sortableItems;
  }, [items, sortConfig]);

  const requestSort = (key: SortKey) => {
    let direction: SortDirection = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  return { items: sortedItems, requestSort, sortConfig };
};
