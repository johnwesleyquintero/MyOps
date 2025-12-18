
import { useState, useCallback, useEffect, useRef } from 'react';
import { TaskEntry, AppConfig, NotificationAction } from '../types';
import { fetchTasks, addTask, updateTask, deleteTask } from '../services/taskService';

const LIVE_CACHE_KEY = 'myops_live_data_v1';

export const useTasks = (
  config: AppConfig, 
  showToast: (msg: string, type: 'success' | 'error' | 'info', action?: NotificationAction) => void
) => {
  const [entries, setEntries] = useState<TaskEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Track operations in flight to avoid race conditions with background refreshes
  const pendingDeletions = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const syncState = useCallback((newEntries: TaskEntry[]) => {
    const sorted = [...newEntries].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    setEntries(sorted);
    if (config.mode === 'LIVE') {
        localStorage.setItem(LIVE_CACHE_KEY, JSON.stringify(sorted));
    }
  }, [config.mode]);

  const loadData = useCallback(async (isInitial = false) => {
    if (isInitial) {
       if (config.mode === 'LIVE') {
          const cached = localStorage.getItem(LIVE_CACHE_KEY);
          if (cached) {
            try {
              setEntries(JSON.parse(cached));
              setIsLoading(false);
            } catch (e) { console.warn("Cache corrupted"); }
          }
       }
       if (entries.length === 0) setIsLoading(true);
    }

    try {
      const data = await fetchTasks(config);
      const visibleData = data.filter(item => !pendingDeletions.current.has(item.id));
      syncState(visibleData);
    } catch (err: any) {
      if (!isInitial || entries.length === 0) {
          showToast(err.message || 'Sync failed.', 'error');
      }
      console.error("Task sync error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [config, showToast, entries.length, syncState]);

  useEffect(() => {
    loadData(true);
  }, [config.mode, config.gasDeploymentUrl]);

  const saveTransaction = async (entry: TaskEntry, isUpdate: boolean) => {
    setIsSubmitting(true);
    const originalState = [...entries];
    
    // Optimistic Update
    const optimisticEntry = { ...entry, id: entry.id || crypto.randomUUID() };
    const nextState = isUpdate 
        ? entries.map(e => e.id === optimisticEntry.id ? optimisticEntry : e)
        : [optimisticEntry, ...entries];
    
    syncState(nextState);

    try {
      if (isUpdate) {
        await updateTask(optimisticEntry, config);
        showToast('Mission updated', 'success');
      } else {
        const confirmedEntry = await addTask(optimisticEntry, config);
        // Swap temp with confirmed if needed (though IDs are usually stable UUIDs here)
        setEntries(prev => prev.map(e => e.id === optimisticEntry.id ? confirmedEntry : e));
        showToast('Mission initialized', 'success');
      }
      return true;
    } catch (err: any) {
      showToast(`Error: ${err.message}`, 'error');
      setEntries(originalState);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeTransaction = async (entry: TaskEntry) => {
    if (!entry.id) return false;
    const originalState = [...entries];

    // Optimistic Delete
    syncState(entries.filter(e => e.id !== entry.id));

    const performDelete = async () => {
       try {
         await deleteTask(entry.id, config);
         pendingDeletions.current.delete(entry.id);
       } catch (err: any) {
         setEntries(originalState);
         pendingDeletions.current.delete(entry.id);
         showToast(`Abortion failed: ${err.message}`, 'error');
       }
    };

    const timeoutId = setTimeout(performDelete, 4500);
    pendingDeletions.current.set(entry.id, timeoutId);

    showToast('Mission aborted', 'info', {
      label: 'Undo',
      onClick: () => {
        const timer = pendingDeletions.current.get(entry.id);
        if (timer) clearTimeout(timer);
        pendingDeletions.current.delete(entry.id);
        syncState(originalState);
        showToast('Restoration complete', 'success');
      }
    });

    return true;
  };

  const bulkRemoveTransactions = async (entriesToDelete: TaskEntry[]) => {
    if (entriesToDelete.length === 0) return;
    setIsLoading(true);
    try {
      const ids = new Set(entriesToDelete.map(e => e.id));
      syncState(entries.filter(e => !ids.has(e.id)));
      for (const entry of entriesToDelete) {
        if (entry.id) await deleteTask(entry.id, config);
      }
      showToast(`Purged ${entriesToDelete.length} missions`, 'success');
    } catch (err: any) {
      showToast(`Bulk error: ${err.message}`, 'error');
      await loadData();
    } finally {
      setIsLoading(false);
    }
  };

  return {
    entries,
    isLoading,
    isSubmitting,
    loadData,
    saveTransaction,
    removeTransaction,
    bulkRemoveTransactions
  };
};
