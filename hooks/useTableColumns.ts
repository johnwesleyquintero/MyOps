import { useState, useCallback, useMemo, useEffect } from "react";

export type SortKey = string;

export interface ColumnConfig {
  key: string;
  label: string;
  visible: boolean;
  width?: string;
}

export const useTableColumns = <T extends string>(
  defaultColumns: ColumnConfig[],
  storageKey: string,
) => {
  const [columns, setColumns] = useState<ColumnConfig[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        const merged = defaultColumns.map((def) => {
          const savedCol = parsed.find((p: ColumnConfig) => p.key === def.key);
          return savedCol ? { ...def, ...savedCol } : def;
        });
        const ordered = parsed
          .map((p: ColumnConfig) => merged.find((m) => m.key === p.key))
          .filter(Boolean) as ColumnConfig[];
        const missing = defaultColumns.filter(
          (d) => !ordered.find((o) => o.key === d.key),
        );
        return [...ordered, ...missing];
      }
    } catch {
      // Fail silently
    }
    return defaultColumns;
  });

  // If storageKey changes, reset columns from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        const merged = defaultColumns.map((def) => {
          const savedCol = parsed.find((p: ColumnConfig) => p.key === def.key);
          return savedCol ? { ...def, ...savedCol } : def;
        });
        const ordered = parsed
          .map((p: ColumnConfig) => merged.find((m) => m.key === p.key))
          .filter(Boolean) as ColumnConfig[];
        const missing = defaultColumns.filter(
          (d) => !ordered.find((o) => o.key === d.key),
        );
        const nextCols = [...ordered, ...missing];
        const timeoutId = setTimeout(() => setColumns(nextCols), 0);
        return () => clearTimeout(timeoutId);
      } else {
        const timeoutId = setTimeout(() => setColumns(defaultColumns), 0);
        return () => clearTimeout(timeoutId);
      }
    } catch {
      // Fail silently
    }
  }, [storageKey, defaultColumns]);

  // Sync columns to localStorage
  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(columns));
  }, [columns, storageKey]);

  const toggleColumn = useCallback((key: T) => {
    setColumns((prev) =>
      prev.map((c) => (c.key === key ? { ...c, visible: !c.visible } : c)),
    );
  }, []);

  const moveColumn = useCallback((index: number, direction: "up" | "down") => {
    setColumns((prev) => {
      const newCols = [...prev];
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= newCols.length) return prev;
      [newCols[index], newCols[targetIndex]] = [
        newCols[targetIndex],
        newCols[index],
      ];
      return newCols;
    });
  }, []);

  return useMemo(
    () => ({
      columns,
      toggleColumn,
      moveColumn,
    }),
    [columns, toggleColumn, moveColumn],
  );
};
