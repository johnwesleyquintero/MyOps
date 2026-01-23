import { useState, useMemo, useCallback } from "react";

export type SortDirection = "asc" | "desc";

const PRIORITY_RANKS: Record<string, number> = {
  High: 0,
  Medium: 1,
  Low: 2,
};

const STATUS_RANKS: Record<string, number> = {
  Backlog: 0,
  "In Progress": 1,
  Done: 2,
  Active: 0,
  Lead: 1,
  Idle: 2,
  Completed: 3,
};

const getTimestamp = (val: unknown): number => {
  if (!val) return 0;
  const ts = new Date(val as string | number | Date).getTime();
  return isNaN(ts) ? 0 : ts;
};

export const useSortableData = <T>(
  items: T[],
  config: { key: keyof T; direction: SortDirection } = {
    key: "date" as keyof T,
    direction: "desc" as SortDirection,
  },
) => {
  const [sortConfig, setSortConfig] = useState(config);

  const sortedItems = useMemo(() => {
    const sortableItems = [...items];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        let comparison = 0;
        const key = sortConfig.key;

        if (key === "date" || key === "createdAt") {
          const valA = getTimestamp(a[key]);
          const valB = getTimestamp(b[key]);

          if (valA === 0 && valB === 0) {
            comparison = 0;
          } else if (valA === 0) {
            comparison = -1;
          } else if (valB === 0) {
            comparison = 1;
          } else {
            comparison = valA - valB;
          }

          // Secondary sort for tasks/entries with priority and status
          if (comparison === 0 && a && typeof a === "object") {
            const itemA = a as Record<string, unknown>;
            const itemB = b as Record<string, unknown>;

            if ("priority" in itemA && "status" in itemB) {
              const pA = PRIORITY_RANKS[itemA.priority as string] ?? 99;
              const pB = PRIORITY_RANKS[itemB.priority as string] ?? 99;
              if (pA !== pB) {
                comparison = pB - pA;
              } else {
                const sA = STATUS_RANKS[itemA.status as string] ?? 99;
                const sB = STATUS_RANKS[itemB.status as string] ?? 99;
                comparison = sB - sA;
              }
            }
          }
        } else if (key === "priority") {
          const itemA = a as Record<string, unknown>;
          const itemB = b as Record<string, unknown>;
          comparison =
            (PRIORITY_RANKS[itemA.priority as string] ?? 99) -
            (PRIORITY_RANKS[itemB.priority as string] ?? 99);
        } else if (key === "status") {
          const itemA = a as Record<string, unknown>;
          const itemB = b as Record<string, unknown>;
          comparison =
            (STATUS_RANKS[itemA.status as string] ?? 99) -
            (STATUS_RANKS[itemB.status as string] ?? 99);
        } else {
          const valA = String(a[key] || "").toLowerCase();
          const valB = String(b[key] || "").toLowerCase();
          if (valA < valB) comparison = -1;
          if (valA > valB) comparison = 1;
        }

        return sortConfig.direction === "asc" ? comparison : -comparison;
      });
    }
    return sortableItems;
  }, [items, sortConfig]);

  const requestSort = useCallback(
    (key: keyof T) => {
      let direction: SortDirection = "asc";
      if (sortConfig.key === key && sortConfig.direction === "asc") {
        direction = "desc";
      }
      setSortConfig({ key, direction });
    },
    [sortConfig],
  );

  return useMemo(
    () => ({ items: sortedItems, requestSort, sortConfig }),
    [sortedItems, requestSort, sortConfig],
  );
};
