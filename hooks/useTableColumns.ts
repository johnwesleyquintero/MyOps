import { useState, useCallback, useMemo, useEffect } from "react";
import { storage } from "../utils/storageUtils";

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
  const loadColumns = useCallback(() => {
    const saved = storage.get<ColumnConfig[] | null>(storageKey, null);
    if (saved) {
      const merged = defaultColumns.map((def) => {
        const savedCol = saved.find((p: ColumnConfig) => p.key === def.key);
        return savedCol ? { ...def, ...savedCol } : def;
      });
      const ordered = saved
        .map((p: ColumnConfig) => merged.find((m) => m.key === p.key))
        .filter(Boolean) as ColumnConfig[];
      const missing = defaultColumns.filter(
        (d) => !ordered.find((o) => o.key === d.key),
      );
      return [...ordered, ...missing];
    }
    return defaultColumns;
  }, [storageKey, defaultColumns]);

  const [columns, setColumns] = useState<ColumnConfig[]>(loadColumns);

  // If storageKey changes, reset columns
  useEffect(() => {
    setColumns(loadColumns());
  }, [loadColumns]);

  // Sync columns to storage
  useEffect(() => {
    storage.set(storageKey, columns);
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
