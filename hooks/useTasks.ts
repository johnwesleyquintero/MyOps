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
  const entriesRef = useRef<TaskEntry[]>(entries);

  useEffect(() => {
    entriesRef.current = entries;
  }, [entries]);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Track operations in flight to avoid race conditions with background refreshes
  const pendingDeletions = useRef<Map<string, ReturnType<typeof setTimeout>>>(
    new Map(),
  );

  // Clean up timeouts on unmount
  useEffect(() => {
    const deletions = pendingDeletions.current;
    return () => {
      deletions.forEach((timeoutId) => clearTimeout(timeoutId));
      deletions.clear();
    };
  }, []);

  // Sync entries to storageUtils
  useEffect(() => {
    if (config.mode === "LIVE" && !isLoading) {
      storage.set(LIVE_CACHE_KEY, entries);
    }
  }, [entries, config.mode, isLoading]);

  const syncState = useCallback((newEntries: TaskEntry[]) => {
    const sorted = sortTasks(newEntries);
    setEntries(sorted);
  }, []);

  const { mode, gasDeploymentUrl, apiToken } = config;

  const loadData = useCallback(
    async (isInitial = false) => {
      if (isInitial) {
        if (mode === "LIVE") {
          const cached = storage.get<TaskEntry[] | null>(LIVE_CACHE_KEY, null);
          if (cached) {
            setEntries(cached);
            setIsLoading(false);
          }
        }
        if (entriesRef.current.length === 0) setIsLoading(true);
      }

      try {
        const data = await fetchTasks({
          mode,
          gasDeploymentUrl,
          apiToken,
        } as AppConfig);
        const visibleData = data.filter(
          (item) => !pendingDeletions.current.has(item.id),
        );
        syncState(visibleData);
      } catch (err: unknown) {
        if (!isInitial || entriesRef.current.length === 0) {
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
    [mode, gasDeploymentUrl, apiToken, showToast, syncState],
  );

  useEffect(() => {
    loadData(true);
  }, [loadData]);

  const saveTransaction = useCallback(
    async (entry: TaskEntry, isUpdate: boolean) => {
      setIsSubmitting(true);
      const originalState = [...entriesRef.current];

      try {
        const optimisticEntry = {
          ...entry,
          id: entry.id || crypto.randomUUID(),
        };

        setEntries((prev) => {
          const nextState = isUpdate
            ? prev.map((e) =>
                e.id === optimisticEntry.id ? optimisticEntry : e,
              )
            : [optimisticEntry, ...prev];
          return sortTasks(nextState);
        });

        if (isUpdate) {
          await updateTask(optimisticEntry, {
            mode,
            gasDeploymentUrl,
            apiToken,
          } as AppConfig);
          showToast("Mission updated", "success");

          if (optimisticEntry.status === "Done") {
            integrationService.sendUpdate("task_completed", optimisticEntry, {
              mode,
              gasDeploymentUrl,
              apiToken,
            } as AppConfig);
          }
        } else {
          const confirmedEntry = await addTask(optimisticEntry, {
            mode,
            gasDeploymentUrl,
            apiToken,
          } as AppConfig);
          setEntries((prev) =>
            prev.map((e) => (e.id === optimisticEntry.id ? confirmedEntry : e)),
          );
          showToast("Mission initialized", "success");
          integrationService.sendUpdate("task_created", confirmedEntry, {
            mode,
            gasDeploymentUrl,
            apiToken,
          } as AppConfig);
        }
        return true;
      } catch (err: unknown) {
        showToast(
          `Error: ${err instanceof Error ? err.message : "Unknown error"}`,
          "error",
        );
        setEntries(originalState);
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [mode, gasDeploymentUrl, apiToken, showToast],
  );

  const removeTransaction = useCallback(
    async (entry: TaskEntry) => {
      if (!entry.id) return false;
      const originalState = [...entriesRef.current];

      // Optimistic Delete
      setEntries((prev) => {
        const nextState = prev.filter((e) => e.id !== entry.id);
        return sortTasks(nextState);
      });

      const performDelete = async () => {
        try {
          await deleteTask(entry.id!, {
            mode,
            gasDeploymentUrl,
            apiToken,
          } as AppConfig);
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
          showToast("Restoration complete", "success");
        },
      });

      return true;
    },
    [mode, gasDeploymentUrl, apiToken, showToast],
  );

  const bulkRemoveTransactions = useCallback(
    async (entriesToDelete: TaskEntry[]) => {
      if (entriesToDelete.length === 0) return;
      setIsLoading(true);
      try {
        const ids = new Set(entriesToDelete.map((e) => e.id));
        setEntries((prev) => {
          const nextState = prev.filter((e) => !ids.has(e.id));
          return sortTasks(nextState);
        });

        for (const entry of entriesToDelete) {
          if (entry.id)
            await deleteTask(entry.id, {
              mode,
              gasDeploymentUrl,
              apiToken,
            } as AppConfig);
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
    [mode, gasDeploymentUrl, apiToken, showToast, loadData],
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
