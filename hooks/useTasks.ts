
import { useState, useCallback, useEffect, useRef } from 'react';
import { TaskEntry, AppConfig, NotificationAction } from '../types';
import { fetchTasks, addTask, updateTask, deleteTask } from '../services/taskService';

export const useTasks = (
  config: AppConfig, 
  showToast: (msg: string, type: 'success' | 'error' | 'info', action?: NotificationAction) => void
) => {
  const [entries, setEntries] = useState<TaskEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Track pending deletions to prevent them from reappearing during background fetches
  const pendingDeletions = useRef<Map<string, NodeJS.Timeout>>(new Map());

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchTasks(config);
      
      const visibleData = data.filter(item => !pendingDeletions.current.has(item.id));

      const sorted = [...visibleData].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      setEntries(sorted);
    } catch (err: any) {
      showToast(err.message || 'Failed to load tasks.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [config, showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const saveTransaction = async (entry: TaskEntry, isUpdate: boolean) => {
    setIsSubmitting(true);
    try {
      if (isUpdate) {
        await updateTask(entry, config);
        showToast('Task updated', 'success');
      } else {
        await addTask(entry, config);
        showToast('Task added', 'success');
      }
      await loadData();
      return true;
    } catch (err: any) {
      showToast(`Error saving task: ${err.message}`, 'error');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeTransaction = async (entry: TaskEntry) => {
    if (!entry.id) return false;

    setEntries(current => current.filter(e => e.id !== entry.id));

    const performDelete = async () => {
       try {
         await deleteTask(entry.id, config);
         pendingDeletions.current.delete(entry.id);
       } catch (err: any) {
         setEntries(prev => {
            const restored = [...prev, entry].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
            return restored;
         });
         pendingDeletions.current.delete(entry.id);
         showToast(`Failed to delete: ${err.message}`, 'error');
       }
    };

    const timeoutId = setTimeout(performDelete, 4500);
    pendingDeletions.current.set(entry.id, timeoutId);

    showToast('Task deleted', 'info', {
      label: 'Undo',
      onClick: () => {
        const timer = pendingDeletions.current.get(entry.id);
        if (timer) clearTimeout(timer);
        
        pendingDeletions.current.delete(entry.id);

        setEntries(prev => {
           const restored = [...prev, entry];
           return restored.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        });
        
        showToast('Deletion undone', 'success');
      }
    });

    return true;
  };

  const bulkRemoveTransactions = async (entriesToDelete: TaskEntry[]) => {
    if (entriesToDelete.length === 0) return;
    setIsLoading(true);
    try {
      let deletedCount = 0;
      for (const entry of entriesToDelete) {
        if (entry.id) {
          await deleteTask(entry.id, config);
          deletedCount++;
        }
      }
      showToast(`Deleted ${deletedCount} tasks`, 'success');
      await loadData();
    } catch (err: any) {
      showToast(`Error: ${err.message}`, 'error');
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
