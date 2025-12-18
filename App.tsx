
import React, { useState, useEffect } from 'react';
import { TaskEntry, AppConfig, Page } from './types';
import { TaskModal } from './components/TaskModal';
import { SettingsModal } from './components/SettingsModal';
import { ToastContainer } from './components/Toast';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar'; 
import { ShortcutsModal } from './components/ShortcutsModal'; 
import { FocusMode } from './components/FocusMode'; 
import { CommandPalette } from './components/CommandPalette'; 
import { AiChatSidebar } from './components/AiChatSidebar'; 
import { DashboardView } from './components/views/DashboardView';
import { MissionControlView } from './components/views/MissionControlView';

// Hooks
import { useTasks } from './hooks/useTasks';
import { useTaskAnalytics } from './hooks/useTaskAnalytics';
import { useAppConfig } from './hooks/useAppConfig';
import { useNotifications } from './hooks/useNotifications';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'; 
import { useTaskActions } from './hooks/useTaskActions';
import { useMissionControl } from './hooks/useMissionControl';

const App: React.FC = () => {
  const { config, setConfig } = useAppConfig();
  const { notifications, showToast, removeNotification } = useNotifications();

  // Theme Side Effect
  useEffect(() => {
    if (config.theme === 'DARK') {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
  }, [config.theme]);

  // --- UI State ---
  const [activePage, setActivePage] = useState<Page>('DASHBOARD');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); 
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('myops_sidebar_collapsed') === 'true';
    }
    return false;
  });

  const toggleSidebarCollapse = () => {
    setIsSidebarCollapsed(prev => {
      const newState = !prev;
      localStorage.setItem('myops_sidebar_collapsed', String(newState));
      return newState;
    });
  };

  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showShortcuts, setShowShortcuts] = useState<boolean>(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState<boolean>(false);
  const [isCmdPaletteOpen, setIsCmdPaletteOpen] = useState<boolean>(false); 
  const [isAiChatOpen, setIsAiChatOpen] = useState<boolean>(false);
  
  const [editingEntry, setEditingEntry] = useState<TaskEntry | null>(null);
  const [focusedTask, setFocusedTask] = useState<TaskEntry | null>(null); 

  // --- Data & Actions ---
  const { 
    entries, 
    isLoading, 
    isSubmitting, 
    saveTransaction, 
    removeTransaction, 
    bulkRemoveTransactions 
  } = useTasks(config, showToast);

  // Business Logic Hook (Recurrence, Status updates, etc)
  const {
    handleDuplicate: generateDuplicate,
    handleStatusUpdate,
    handleDescriptionUpdate,
    handleFocusComplete
  } = useTaskActions({ saveTransaction, showToast });

  // Mission Control State (View Mode, Filters)
  const missionControl = useMissionControl(entries);
  const { searchQuery, selectedCategory, selectedStatus, selectedMonth } = missionControl;

  // Analytics Hook
  const { filteredEntries, metrics } = useTaskAnalytics({
    entries,
    searchQuery,
    selectedCategory,
    selectedStatus,
    selectedMonth
  });

  // --- Keyboard Shortcuts ---
  useKeyboardShortcuts([
    { key: 'g d', action: () => setActivePage('DASHBOARD') },
    { key: 'g m', action: () => setActivePage('MISSIONS') },
    { 
      key: 'c', 
      action: () => {
        if (!isTaskModalOpen && activePage !== 'FOCUS' && !isCmdPaletteOpen) {
          setEditingEntry(null);
          setIsTaskModalOpen(true);
        }
      } 
    },
    { 
      key: '/', 
      preventDefault: true, 
      action: () => {
        if (activePage === 'FOCUS' || isCmdPaletteOpen) return; 
        if (activePage !== 'MISSIONS') setActivePage('MISSIONS');
        setTimeout(() => {
          const searchInput = document.getElementById('global-search');
          if (searchInput) searchInput.focus();
        }, 50);
      } 
    },
    { 
      key: 'k',
      metaKey: true, 
      preventDefault: true,
      allowInInput: true,
      action: () => {
         if (activePage === 'FOCUS') return;
         setIsCmdPaletteOpen(prev => !prev);
      }
    },
    { key: '?', action: () => setShowShortcuts(prev => !prev) },
  ]);

  // --- Handlers ---
  const handleOpenCreate = () => {
    setEditingEntry(null);
    setIsTaskModalOpen(true);
  };

  const handleOpenAiChat = () => {
    setIsAiChatOpen(true);
  };

  const handleOpenEdit = (entry: TaskEntry) => {
    if (!entry.id) {
      showToast("Entry lacks ID. Cannot edit.", 'error');
      return;
    }
    setEditingEntry(entry);
    setIsTaskModalOpen(true);
  };

  const executeDuplicate = (entry: TaskEntry) => {
    const copy = generateDuplicate(entry);
    setEditingEntry(copy);
    setIsTaskModalOpen(true);
  };

  const handleEnterFocus = (entry: TaskEntry) => {
    setFocusedTask(entry);
    setActivePage('FOCUS');
  };

  const handleExitFocus = () => {
    setFocusedTask(null);
    setActivePage('MISSIONS'); 
  };

  const handleModalSubmit = async (entry: TaskEntry) => {
    const isUpdate = !!editingEntry?.id;
    const success = await saveTransaction(entry, isUpdate);
    if (success) {
      setIsTaskModalOpen(false);
      setEditingEntry(null);
    }
  };

  const handleModalDelete = async (entry: TaskEntry) => {
     await removeTransaction(entry);
     setIsTaskModalOpen(false);
     setEditingEntry(null);
  };

  const handleSaveConfig = (newConfig: AppConfig) => {
    setConfig(newConfig);
    setShowSettings(false);
    showToast('Configuration saved', 'success');
  };

  // If in Focus Mode, render only Focus Component
  if (activePage === 'FOCUS' && focusedTask) {
    return (
        <FocusMode 
            task={focusedTask} 
            onExit={handleExitFocus}
            onUpdate={async (updated) => { await saveTransaction(updated, true); }}
            onComplete={handleFocusComplete}
        />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-300">
      <ToastContainer notifications={notifications} removeNotification={removeNotification} />
      
      {/* Sidebar Navigation */}
      <Sidebar 
        activePage={activePage}
        setActivePage={setActivePage}
        onOpenSettings={() => setShowSettings(true)}
        config={config}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        isCollapsed={isSidebarCollapsed}
        toggleCollapse={toggleSidebarCollapse}
      />

      {/* Main Content Layout */}
      <div 
        className={`transition-all duration-300 ease-in-out ${isSidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'}`}
      >
        <Header 
          activePage={activePage} 
          onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
          onOpenCreate={handleOpenCreate}
          onOpenAiChat={handleOpenAiChat}
        />

        <main className="p-4 sm:p-6 lg:p-8 pb-24">
          
          {/* --- DASHBOARD VIEW --- */}
          {activePage === 'DASHBOARD' && (
            <DashboardView
               entries={entries}
               metrics={metrics}
               isLoading={isLoading}
               onEdit={handleOpenEdit}
               onDelete={handleModalDelete}
               onStatusUpdate={handleStatusUpdate}
               onDescriptionUpdate={handleDescriptionUpdate}
               onFocus={handleEnterFocus}
               onDuplicate={executeDuplicate}
               onNavigate={setActivePage}
            />
          )}

          {/* --- MISSION CONTROL VIEW --- */}
          {activePage === 'MISSIONS' && (
            <MissionControlView
              entries={entries}
              filteredEntries={filteredEntries}
              isLoading={isLoading}
              onEdit={handleOpenEdit}
              onDelete={handleModalDelete}
              onBulkDelete={bulkRemoveTransactions}
              onStatusUpdate={handleStatusUpdate}
              onDescriptionUpdate={handleDescriptionUpdate}
              onFocus={handleEnterFocus}
              onDuplicate={executeDuplicate}
              onAdd={handleOpenCreate}
              {...missionControl}
            />
          )}

        </main>
      </div>

      {/* Overlays */}
      <AiChatSidebar 
        isOpen={isAiChatOpen}
        onClose={() => setIsAiChatOpen(false)}
        config={config}
        entries={entries}
        onSaveTransaction={saveTransaction}
        onDeleteTransaction={removeTransaction}
      />

      <CommandPalette 
        isOpen={isCmdPaletteOpen}
        onClose={() => setIsCmdPaletteOpen(false)}
        entries={entries}
        onNavigate={setActivePage}
        onCreate={handleOpenCreate}
        onEdit={handleOpenEdit}
        onSettings={() => setShowSettings(true)}
        onToggleFocus={handleEnterFocus}
      />

      <TaskModal 
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSubmit={handleModalSubmit}
        onDelete={handleModalDelete}
        onDuplicate={executeDuplicate}
        initialData={editingEntry}
        isSubmitting={isSubmitting}
        entries={entries} 
      />

      <SettingsModal 
        isOpen={showSettings} 
        onClose={() => setShowSettings(false)}
        config={config}
        onSave={handleSaveConfig}
      />

      <ShortcutsModal 
        isOpen={showShortcuts}
        onClose={() => setShowShortcuts(false)}
      />
    </div>
  );
};

export default App;
