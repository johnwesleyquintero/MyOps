
import React, { useEffect, useMemo } from 'react';
import { TaskEntry, AppConfig } from './types';
import { ToastContainer } from './components/Toast';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar'; 
import { FocusMode } from './components/FocusMode'; 
import { AiChatSidebar } from './components/AiChatSidebar'; 
import { DashboardView } from './components/views/DashboardView';
import { MissionControlView } from './components/views/MissionControlView';
import { ModalManager } from './components/modals/ModalManager';

// Hooks
import { useTasks } from './hooks/useTasks';
import { useTaskAnalytics } from './hooks/useTaskAnalytics';
import { useAppConfig } from './hooks/useAppConfig';
import { useNotifications } from './hooks/useNotifications';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'; 
import { useTaskActions } from './hooks/useTaskActions';
import { useMissionControl } from './hooks/useMissionControl';
import { useUIState } from './hooks/useUIState';

const App: React.FC = () => {
  const { config, setConfig } = useAppConfig();
  const { notifications, showToast, removeNotification } = useNotifications();
  const ui = useUIState();

  // Optimized Theme Sync
  useEffect(() => {
    const isDark = config.theme === 'DARK';
    document.documentElement.classList.toggle('dark', isDark);
    document.body.classList.toggle('dark', isDark);
  }, [config.theme]);

  const { 
    entries, 
    isLoading, 
    isSubmitting, 
    saveTransaction, 
    removeTransaction, 
    bulkRemoveTransactions 
  } = useTasks(config, showToast);

  const { 
    handleDuplicate: generateDuplicate, 
    handleStatusUpdate, 
    handleDescriptionUpdate, 
    handleFocusComplete 
  } = useTaskActions({ saveTransaction, showToast });

  const missionControl = useMissionControl(entries);
  const { searchQuery, selectedCategory, selectedStatus, selectedMonth } = missionControl;
  
  const { filteredEntries, metrics } = useTaskAnalytics({ 
    entries, 
    searchQuery, 
    selectedCategory, 
    selectedStatus, 
    selectedMonth 
  });

  // Global Shortcuts
  useKeyboardShortcuts([
    { key: 'g d', action: () => ui.setActivePage('DASHBOARD') },
    { key: 'g m', action: () => ui.setActivePage('MISSIONS') },
    { key: 'c', action: () => !ui.isTaskModalOpen && ui.activePage !== 'FOCUS' && !ui.isCmdPaletteOpen && ui.openCreate() },
    { key: '/', preventDefault: true, action: () => {
        if (ui.activePage === 'FOCUS' || ui.isCmdPaletteOpen) return; 
        if (ui.activePage !== 'MISSIONS') ui.setActivePage('MISSIONS');
        setTimeout(() => document.getElementById('global-search')?.focus(), 50);
      } 
    },
    { key: 'k', metaKey: true, preventDefault: true, allowInInput: true, action: () => ui.activePage !== 'FOCUS' && ui.setIsCmdPaletteOpen(prev => !prev) },
    { key: '?', action: () => ui.setShowShortcuts(prev => !prev) },
  ]);

  const executeDuplicate = (entry: TaskEntry) => {
    const copy = generateDuplicate(entry);
    ui.setEditingEntry(copy);
    ui.setIsTaskModalOpen(true);
  };

  const handleModalSubmit = async (entry: TaskEntry) => {
    if (await saveTransaction(entry, !!ui.editingEntry?.id)) {
      ui.setIsTaskModalOpen(false);
      ui.setEditingEntry(null);
    }
  };

  const handleModalDelete = async (entry: TaskEntry) => {
     await removeTransaction(entry);
     ui.setIsTaskModalOpen(false);
     ui.setEditingEntry(null);
  };

  const handleSaveConfig = (newConfig: AppConfig) => {
    setConfig(newConfig);
    ui.setShowSettings(false);
    showToast('System configuration synced.', 'success');
  };

  if (ui.activePage === 'FOCUS' && ui.focusedTask) {
    return (
      <FocusMode 
        task={ui.focusedTask} 
        onExit={() => ui.setActivePage('MISSIONS')} 
        onUpdate={e => saveTransaction(e, true)} 
        onComplete={handleFocusComplete} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-500">
      <ToastContainer notifications={notifications} removeNotification={removeNotification} />
      
      <Sidebar 
        activePage={ui.activePage} 
        setActivePage={ui.setActivePage} 
        onOpenSettings={() => ui.setShowSettings(true)}
        config={config} 
        isOpen={ui.isSidebarOpen} 
        setIsOpen={ui.setIsSidebarOpen} 
        isCollapsed={ui.isSidebarCollapsed} 
        toggleCollapse={ui.toggleSidebarCollapse}
      />

      <div className={`transition-all duration-300 ease-in-out min-h-screen flex flex-col ${ui.isSidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'}`}>
        <Header 
          activePage={ui.activePage} 
          onMenuToggle={() => ui.setIsSidebarOpen(!ui.isSidebarOpen)} 
          onOpenCreate={ui.openCreate} 
          onOpenAiChat={() => ui.setIsAiChatOpen(true)} 
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-24 max-w-[1600px] mx-auto w-full">
          {ui.activePage === 'DASHBOARD' && (
            <DashboardView 
              entries={entries} 
              metrics={metrics} 
              isLoading={isLoading} 
              onEdit={ui.openEdit} 
              onDelete={handleModalDelete} 
              onStatusUpdate={handleStatusUpdate} 
              onDescriptionUpdate={handleDescriptionUpdate} 
              onFocus={ui.enterFocus} 
              onDuplicate={executeDuplicate} 
              onNavigate={ui.setActivePage} 
            />
          )}
          {ui.activePage === 'MISSIONS' && (
            <MissionControlView 
              entries={entries} 
              filteredEntries={filteredEntries} 
              isLoading={isLoading} 
              onEdit={ui.openEdit} 
              onDelete={handleModalDelete} 
              onBulkDelete={bulkRemoveTransactions} 
              onStatusUpdate={handleStatusUpdate} 
              onDescriptionUpdate={handleDescriptionUpdate} 
              onFocus={ui.enterFocus} 
              onDuplicate={executeDuplicate} 
              onAdd={ui.openCreate} 
              {...missionControl} 
            />
          )}
        </main>
      </div>

      <AiChatSidebar 
        isOpen={ui.isAiChatOpen} 
        onClose={() => ui.setIsAiChatOpen(false)} 
        config={config} 
        entries={entries} 
        onSaveTransaction={saveTransaction} 
        onDeleteTransaction={removeTransaction} 
      />
      
      <ModalManager 
        ui={ui} 
        config={config} 
        entries={entries} 
        isSubmitting={isSubmitting} 
        onModalSubmit={handleModalSubmit} 
        onModalDelete={handleModalDelete} 
        onDuplicate={executeDuplicate} 
        onSaveConfig={handleSaveConfig} 
        onNavigate={ui.setActivePage} 
      />
    </div>
  );
};

export default App;
