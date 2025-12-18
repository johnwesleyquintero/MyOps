
import { useState, useCallback } from 'react';
import { Page, TaskEntry } from '../types';

export const useUiState = () => {
  const [activePage, setActivePage] = useState<Page>('DASHBOARD');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('myops_sidebar_collapsed') === 'true';
    }
    return false;
  });

  const [showSettings, setShowSettings] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isCmdPaletteOpen, setIsCmdPaletteOpen] = useState(false);
  const [isAiChatOpen, setIsAiChatOpen] = useState(false);

  const [editingEntry, setEditingEntry] = useState<TaskEntry | null>(null);
  const [focusedTask, setFocusedTask] = useState<TaskEntry | null>(null);

  const toggleSidebarCollapse = useCallback(() => {
    setIsSidebarCollapsed(prev => {
      const newState = !prev;
      localStorage.setItem('myops_sidebar_collapsed', String(newState));
      return newState;
    });
  }, []);

  const openEdit = useCallback((entry: TaskEntry) => {
    setEditingEntry(entry);
    setIsTaskModalOpen(true);
  }, []);

  const openCreate = useCallback(() => {
    setEditingEntry(null);
    setIsTaskModalOpen(true);
  }, []);

  const enterFocus = useCallback((entry: TaskEntry) => {
    setFocusedTask(entry);
    setActivePage('FOCUS');
  }, []);

  const exitFocus = useCallback(() => {
    setFocusedTask(null);
    setActivePage('MISSIONS');
  }, []);

  return {
    activePage, setActivePage,
    isSidebarOpen, setIsSidebarOpen,
    isSidebarCollapsed, toggleSidebarCollapse,
    showSettings, setShowSettings,
    showShortcuts, setShowShortcuts,
    isTaskModalOpen, setIsTaskModalOpen,
    isCmdPaletteOpen, setIsCmdPaletteOpen,
    isAiChatOpen, setIsAiChatOpen,
    editingEntry, setEditingEntry,
    focusedTask, setFocusedTask,
    openEdit, openCreate,
    enterFocus, exitFocus
  };
};
