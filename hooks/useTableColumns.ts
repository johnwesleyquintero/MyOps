import { useState, useCallback, useMemo } from "react";

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

  const [prevStorageKey, setPrevStorageKey] = useState(storageKey);

  // If storageKey changes, reset columns from localStorage
  if (storageKey !== prevStorageKey) {
    setPrevStorageKey(storageKey);
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
        setColumns([...ordered, ...missing]);
      } else {
        setColumns(defaultColumns);
      }
    } catch {
      // Fail silently
    }
  }

  const saveColumns = useCallback(
    (newCols: ColumnConfig[]) => {
      setColumns(newCols);
      localStorage.setItem(storageKey, JSON.stringify(newCols));
    },
    [storageKey],
  );

  const toggleColumn = useCallback(
    (key: T) => {
      const newCols = columns.map((c) =>
        c.key === key ? { ...c, visible: !c.visible } : c,
      );
      saveColumns(newCols);
    },
    [columns, saveColumns],
  );

  const moveColumn = useCallback(
    (index: number, direction: "up" | "down") => {
      const newCols = [...columns];
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= newCols.length) return;
      [newCols[index], newCols[targetIndex]] = [
        newCols[targetIndex],
        newCols[index],
      ];
      saveColumns(newCols);
    },
    [columns, saveColumns],
  );

  return useMemo(
    () => ({
      columns,
      toggleColumn,
      moveColumn,
    }),
    [columns, toggleColumn, moveColumn],
  );
};
