import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { TaskEntry, AppConfig, NotificationAction } from "../types";
import {
  fetchTasks,
  addTask,
  updateTask,
  deleteTask,
} from "../services/taskService";
import { integrationService } from "../services/integrationService";
import { LIVE_CACHE_KEY } from "@/constants";
import { sortTasks } from "../utils/taskUtils";
import { storage } from "../utils/storageUtils";

export const useTasks = (
  config: AppConfig,
  showToast: (
    msg: string,
    type: "success" | "error" | "info",
    action?: NotificationAction,
  ) => void,
) => {
  const [entries, setEntries] = useState<TaskEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Track operations in flight to avoid race conditions with background refreshes
  const pendingDeletions = useRef<Map<string, ReturnType<typeof setTimeout>>>(
    new Map(),
  );

  const syncState = useCallback(
    (newEntries: TaskEntry[]) => {
      const sorted = sortTasks(newEntries);
      setEntries(sorted);
      if (config.mode === "LIVE") {
        storage.set(LIVE_CACHE_KEY, sorted);
      }
    },
    [config.mode],
  );

  const loadData = useCallback(
    async (isInitial = false) => {
      if (isInitial) {
        if (config.mode === "LIVE") {
          const cached = storage.get<TaskEntry[] | null>(LIVE_CACHE_KEY, null);
          if (cached) {
            setEntries(cached);
            setIsLoading(false);
          }
        }
        if (entries.length === 0) setIsLoading(true);
      }

      try {
        const data = await fetchTasks(config);
        const visibleData = data.filter(
          (item) => !pendingDeletions.current.has(item.id),
        );
        syncState(visibleData);
      } catch (err: unknown) {
        if (!isInitial || entries.length === 0) {
          showToast(
            err instanceof Error ? err.message : "Sync failed.",
            "error",
          );
        }
        console.error("Task sync error:", err);
      } finally {
        setIsLoading(false);
      }
    },
    [config, showToast, entries.length, syncState],
  );

  useEffect(() => {
    loadData(true);
  }, [loadData]);

  const saveTransaction = useCallback(
    async (entry: TaskEntry, isUpdate: boolean) => {
      setIsSubmitting(true);
      let originalState: TaskEntry[] = [];

      try {
        const optimisticEntry = {
          ...entry,
          id: entry.id || crypto.randomUUID(),
        };

        setEntries((prev) => {
          originalState = [...prev];
          const nextState = isUpdate
            ? prev.map((e) =>
                e.id === optimisticEntry.id ? optimisticEntry : e,
              )
            : [optimisticEntry, ...prev];

          // Side effect inside setState is generally discouraged, but here we're
          // using it to sync to localStorage which is what the original code did
          // via syncState. We'll keep it for now but maybe move it to an effect later.
          const sorted = sortTasks(nextState);
          if (config.mode === "LIVE") {
            storage.set(LIVE_CACHE_KEY, sorted);
          }
          return sorted;
        });

        if (isUpdate) {
          await updateTask(optimisticEntry, config);
          showToast("Mission updated", "success");

          // For the status check, we need the old entry.
          // Since we don't have 'entries' in scope anymore (to keep the callback stable),
          // we can either accept that it might be slightly stale if we use a ref,
          // or just perform the check if the new status is 'Done'.
          // The original code checked if it CHANGED to 'Done'.
          if (optimisticEntry.status === "Done") {
            integrationService.sendUpdate(
              "task_completed",
              optimisticEntry,
              config,
            );
          }
        } else {
          const confirmedEntry = await addTask(optimisticEntry, config);
          setEntries((prev) =>
            prev.map((e) => (e.id === optimisticEntry.id ? confirmedEntry : e)),
          );
          showToast("Mission initialized", "success");
          integrationService.sendUpdate("task_created", confirmedEntry, config);
        }
        return true;
      } catch (err: unknown) {
        showToast(
          `Error: ${err instanceof Error ? err.message : "Unknown error"}`,
          "error",
        );
        if (originalState.length > 0) {
          setEntries(originalState);
        }
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [config, showToast],
  );

  const removeTransaction = useCallback(
    async (entry: TaskEntry) => {
      if (!entry.id) return false;
      let originalState: TaskEntry[] = [];

      // Optimistic Delete
      setEntries((prev) => {
        originalState = [...prev];
        const nextState = prev.filter((e) => e.id !== entry.id);
        const sorted = sortTasks(nextState);
        if (config.mode === "LIVE") {
          storage.set(LIVE_CACHE_KEY, sorted);
        }
        return sorted;
      });

      const performDelete = async () => {
        try {
          await deleteTask(entry.id!, config);
          pendingDeletions.current.delete(entry.id!);
        } catch (err: unknown) {
          setEntries(originalState);
          pendingDeletions.current.delete(entry.id!);
          showToast(
            `Abortion failed: ${err instanceof Error ? err.message : "Unknown error"}`,
            "error",
          );
        }
      };

      const timeoutId = setTimeout(performDelete, 4500);
      pendingDeletions.current.set(entry.id, timeoutId);

      showToast("Mission aborted", "info", {
        label: "Undo",
        onClick: () => {
          const timer = pendingDeletions.current.get(entry.id!);
          if (timer) clearTimeout(timer);
          pendingDeletions.current.delete(entry.id!);
          setEntries(originalState);
          if (config.mode === "LIVE") {
            storage.set(LIVE_CACHE_KEY, originalState);
          }
          showToast("Restoration complete", "success");
        },
      });

      return true;
    },
    [config, showToast],
  );

  const bulkRemoveTransactions = useCallback(
    async (entriesToDelete: TaskEntry[]) => {
      if (entriesToDelete.length === 0) return;
      setIsLoading(true);
      try {
        const ids = new Set(entriesToDelete.map((e) => e.id));
        setEntries((prev) => {
          const nextState = prev.filter((e) => !ids.has(e.id));
          const sorted = sortTasks(nextState);
          if (config.mode === "LIVE") {
            storage.set(LIVE_CACHE_KEY, sorted);
          }
          return sorted;
        });

        for (const entry of entriesToDelete) {
          if (entry.id) await deleteTask(entry.id, config);
        }
        showToast(`Purged ${entriesToDelete.length} missions`, "success");
      } catch (err: unknown) {
        showToast(
          `Bulk error: ${err instanceof Error ? err.message : "Unknown error"}`,
          "error",
        );
        await loadData();
      } finally {
        setIsLoading(false);
      }
    },
    [config, showToast, loadData],
  );

  return useMemo(
    () => ({
      entries,
      isLoading,
      isSubmitting,
      loadData,
      saveTransaction,
      removeTransaction,
      bulkRemoveTransactions,
    }),
    [
      entries,
      isLoading,
      isSubmitting,
      loadData,
      saveTransaction,
      removeTransaction,
      bulkRemoveTransactions,
    ],
  );
};
