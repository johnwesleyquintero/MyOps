import { useState, useCallback, useEffect } from 'react';
import { TaskEntry, AppConfig } from '../types';
import { fetchTasks, addTask, updateTask, deleteTask } from '../services/ledgerService';

export const useLedger = (
  config: AppConfig, 
  showToast: (msg: string, type: 'success' | 'error' | 'info') => void
) => {
  const [entries, setEntries] = useState<TaskEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchTasks(config);
      // Sort: backlog first, then by date
      const sorted = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
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
    setIsLoading(true); 
    try {
      await deleteTask(entry.id, config);
      showToast('Task deleted', 'info');
      await loadData();
      return true;
    } catch (err: any) {
      showToast(`Error deleting: ${err.message}`, 'error');
      setIsLoading(false);
      return false;
    }
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