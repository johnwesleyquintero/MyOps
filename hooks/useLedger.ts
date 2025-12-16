import { useState, useCallback, useEffect, useRef } from 'react';
import { TaskEntry, AppConfig, NotificationAction } from '../types';
import { fetchTasks, addTask, updateTask, deleteTask } from '../services/ledgerService';

export const useLedger = (
  config: AppConfig, 
  showToast: (msg: string, type: 'success' | 'error' | 'info', action?: NotificationAction) => void
) => {
  const [entries, setEntries] = useState<TaskEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Track pending deletions to prevent them from reappearing during background fetches
  // and to allow cancellation (Undo)
  const pendingDeletions = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchTasks(config);
      
      // Filter out items that are currently pending deletion
      // This ensures that if a background refresh happens while the "Undo" toast is visible,
      // the item doesn't pop back into existence.
      const visibleData = data.filter(item => !pendingDeletions.current.has(item.id));

      // Sort: backlog first, then by date
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

    // 1. Optimistic UI Update: Remove immediately from view
    setEntries(current => current.filter(e => e.id !== entry.id));

    // 2. Schedule the actual API call
    const performDelete = async () => {
       try {
         await deleteTask(entry.id, config);
         // Only remove from pending set if it was successfully deleted
         pendingDeletions.current.delete(entry.id);
         // We don't need to reload data here, the UI is already correct
       } catch (err: any) {
         // If API fails, revert the UI change
         setEntries(prev => {
            const restored = [...prev, entry].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
            return restored;
         });
         pendingDeletions.current.delete(entry.id);
         showToast(`Failed to delete: ${err.message}`, 'error');
       }
    };

    // 3. Set timer for 4.5 seconds (Toast is usually 5s for actions)
    const timeoutId = setTimeout(performDelete, 4500);
    
    // 4. Track this deletion
    pendingDeletions.current.set(entry.id, timeoutId);

    // 5. Show Undo Toast
    showToast('Task deleted', 'info', {
      label: 'Undo',
      onClick: () => {
        // Cancel the timer
        const timer = pendingDeletions.current.get(entry.id);
        if (timer) clearTimeout(timer);
        
        // Remove from pending tracking
        pendingDeletions.current.delete(entry.id);

        // Restore to UI
        setEntries(prev => {
           const restored = [...prev, entry];
           // Re-sort to maintain order
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