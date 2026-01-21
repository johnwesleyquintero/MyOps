import { useState, useMemo, useCallback } from "react";

export type SortDirection = "asc" | "desc";

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

        // Specialized sorting for specific fields if they exist
        if (key === "date" || key === "createdAt") {
          const rawA = a[key];
          const rawB = b[key];
          const valA = rawA
            ? new Date(rawA as string | number | Date).getTime()
            : 0;
          const valB = rawB
            ? new Date(rawB as string | number | Date).getTime()
            : 0;

          const isInvalidA = isNaN(valA) || valA === 0;
          const isInvalidB = isNaN(valB) || valB === 0;

          if (isInvalidA && isInvalidB) {
            comparison = 0;
          } else if (isInvalidA) {
            comparison = -1;
          } else if (isInvalidB) {
            comparison = 1;
          } else {
            comparison = valA - valB;
          }

          // Secondary sort for tasks
          if (
            comparison === 0 &&
            a &&
            typeof a === "object" &&
            "priority" in a &&
            "status" in a
          ) {
            const itemA = a as { priority: string; status: string };
            const itemB = b as { priority: string; status: string };
            const pRanks: Record<string, number> = {
              High: 0,
              Medium: 1,
              Low: 2,
            };
            const pA = pRanks[itemA.priority] ?? 99;
            const pB = pRanks[itemB.priority] ?? 99;
            if (pA !== pB) {
              comparison = pB - pA;
            } else {
              const sRanks: Record<string, number> = {
                "In Progress": 0,
                Backlog: 1,
                Done: 2,
              };
              const sA = sRanks[itemA.status] ?? 99;
              const sB = sRanks[itemB.status] ?? 99;
              comparison = sB - sA;
            }
          }
        } else if (key === "priority") {
          const itemA = a as unknown as { priority: string };
          const itemB = b as unknown as { priority: string };
          const pRanks: Record<string, number> = {
            High: 0,
            Medium: 1,
            Low: 2,
          };
          comparison =
            (pRanks[itemA.priority] ?? 99) - (pRanks[itemB.priority] ?? 99);
        } else if (key === "status") {
          const itemA = a as unknown as { status: string };
          const itemB = b as unknown as { status: string };
          const sRanks: Record<string, number> = {
            Backlog: 0,
            "In Progress": 1,
            Done: 2,
            Active: 0,
            Lead: 1,
            Idle: 2,
            Completed: 3,
          };
          comparison =
            (sRanks[itemA.status] ?? 99) - (sRanks[itemB.status] ?? 99);
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
