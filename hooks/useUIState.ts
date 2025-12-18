
import { useState } from 'react';
import { Page, TaskEntry } from '../types';

export const useUIState = () => {
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

  const toggleSidebarCollapse = () => {
    setIsSidebarCollapsed(prev => {
      const newState = !prev;
      localStorage.setItem('myops_sidebar_collapsed', String(newState));
      return newState;
    });
  };

  const openEdit = (entry: TaskEntry) => {
    setEditingEntry(entry);
    setIsTaskModalOpen(true);
  };

  const openCreate = () => {
    setEditingEntry(null);
    setIsTaskModalOpen(true);
  };

  const enterFocus = (entry: TaskEntry) => {
    setFocusedTask(entry);
    setActivePage('FOCUS');
  };

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
    openEdit, openCreate, enterFocus
  };
};
