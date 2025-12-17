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

  // Track pending deletions to prevent them from reappearing during background fetches
  const pendingDeletions = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const loadData = useCallback(async () => {
    // 1. FAST PATH: Load from Cache immediately (Live Mode)
    // This implements "Stale-While-Revalidate" strategy
    if (config.mode === 'LIVE') {
       const cached = localStorage.getItem(LIVE_CACHE_KEY);
       if (cached) {
         try {
           const parsed = JSON.parse(cached);
           setEntries(parsed);
           setIsLoading(false); // Render immediately, don't wait for network
         } catch (e) {
           console.warn("Corrupt local cache", e);
         }
       }
    }

    // Only show loading spinner if we have NO data at all
    if (config.mode === 'LIVE' && !localStorage.getItem(LIVE_CACHE_KEY)) {
        setIsLoading(true);
    } else if (config.mode === 'DEMO') {
        setIsLoading(true);
    }

    try {
      // 2. SLOW PATH: Network Fetch (Background Sync)
      const data = await fetchTasks(config);
      
      const visibleData = data.filter(item => !pendingDeletions.current.has(item.id));

      const sorted = [...visibleData].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      setEntries(sorted);

      // Update Cache with fresh server data
      if (config.mode === 'LIVE') {
        localStorage.setItem(LIVE_CACHE_KEY, JSON.stringify(sorted));
      }
      
    } catch (err: any) {
      // If we have cached data, suppress the error to a console log or subtle toast
      // so we don't block the user from working with cached data.
      if (config.mode === 'LIVE' && localStorage.getItem(LIVE_CACHE_KEY)) {
          console.error("Background sync failed:", err);
          // Optional: showToast('Offline: Using cached data', 'info'); 
      } else {
          showToast(err.message || 'Failed to load tasks.', 'error');
      }
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
      // Optimistic Update: Update UI & Cache immediately
      setEntries(prev => {
        let updated;
        if (isUpdate) {
            updated = prev.map(e => e.id === entry.id ? entry : e);
        } else {
            updated = [...prev, entry]; // ID might be temp, but fine for display
        }
        const sorted = updated.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        
        // Persist optimistic state to cache immediately
        if (config.mode === 'LIVE') {
            localStorage.setItem(LIVE_CACHE_KEY, JSON.stringify(sorted));
        }
        return sorted;
      });

      if (isUpdate) {
        await updateTask(entry, config);
        showToast('Task updated', 'success');
      } else {
        const newEntry = await addTask(entry, config);
        
        // Re-update state with the server-confirmed entry (e.g. valid ID)
        setEntries(prev => {
           // Replace the optimistically added entry (which might have had temp ID or missing fields)
           // Actually, addTask returns the full object with ID.
           // Since we don't easily know which one was the temp one without a temp-id tracking system,
           // we'll just append. (In a perfect system we'd swap the ID).
           // For simplicity in this lightweight app, the optimistic add above is visually fine.
           // To ensure data consistency, we update the cache again with the returned value.
           
           // Simple strategy: Just ensure the newEntry is in the list. 
           // Since we already added 'entry' optimistically, and 'newEntry' usually has the same content + ID.
           // We might technically have a duplicate if we don't filter.
           // A safer bet for this specific lightweight implementation is to rely on background sync next time,
           // OR purely rely on the optimistic update if IDs align.
           
           // For now, let's trust the optimistic update we did above for visual speed,
           // and the background re-fetch will eventually clean up any ID discrepancies if we re-loaded.
           // But to be cleaner, let's update the cache one last time.
           const updated = [...prev.filter(e => e.id !== entry.id), newEntry];
           const sorted = updated.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
           if (config.mode === 'LIVE') localStorage.setItem(LIVE_CACHE_KEY, JSON.stringify(sorted));
           return sorted;
        });
        showToast('Task added', 'success');
      }
      
      return true;
    } catch (err: any) {
      showToast(`Error saving task: ${err.message}`, 'error');
      await loadData(); // Revert on error
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeTransaction = async (entry: TaskEntry) => {
    if (!entry.id) return false;

    // Optimistic Delete
    setEntries(current => {
        const updated = current.filter(e => e.id !== entry.id);
        // Update cache immediately
        if (config.mode === 'LIVE') localStorage.setItem(LIVE_CACHE_KEY, JSON.stringify(updated));
        return updated;
    });

    const performDelete = async () => {
       try {
         await deleteTask(entry.id, config);
         pendingDeletions.current.delete(entry.id);
       } catch (err: any) {
         // Revert UI on failure
         setEntries(prev => {
            const restored = [...prev, entry].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
            if (config.mode === 'LIVE') localStorage.setItem(LIVE_CACHE_KEY, JSON.stringify(restored));
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
           const sorted = restored.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
           if (config.mode === 'LIVE') localStorage.setItem(LIVE_CACHE_KEY, JSON.stringify(sorted));
           return sorted;
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
      const idsToDelete = new Set(entriesToDelete.map(e => e.id));
      setEntries(prev => {
          const updated = prev.filter(e => !idsToDelete.has(e.id));
          if (config.mode === 'LIVE') localStorage.setItem(LIVE_CACHE_KEY, JSON.stringify(updated));
          return updated;
      });

      let deletedCount = 0;
      for (const entry of entriesToDelete) {
        if (entry.id) {
          await deleteTask(entry.id, config);
          deletedCount++;
        }
      }
      showToast(`Deleted ${deletedCount} tasks`, 'success');
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