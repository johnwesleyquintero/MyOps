
import React, { useMemo } from 'react';
import { TaskEntry, AppConfig } from './types';
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
import { useTaskActions } from './hooks/useTaskActions';
import { useMissionControl } from './hooks/useMissionControl';
import { useUiState } from './hooks/useUiState';
import { useTheme } from './hooks/useTheme';
import { useAppShortcuts } from './hooks/useAppShortcuts';

const App: React.FC = () => {
  const { config, setConfig } = useAppConfig();
  const { notifications, showToast, removeNotification } = useNotifications();
  
  useTheme(config.theme);
  const ui = useUiState();

  const { 
    entries, 
    isLoading, 
    isSubmitting, 
    saveTransaction, 
    removeTransaction, 
    bulkRemoveTransactions 
  } = useTasks(config, showToast);

  const taskActions = useTaskActions({ saveTransaction, showToast });
  const missionControl = useMissionControl(entries);
  
  const { filteredEntries, metrics } = useTaskAnalytics({
    entries,
    searchQuery: missionControl.searchQuery,
    selectedCategory: missionControl.selectedCategory,
    selectedStatus: missionControl.selectedStatus,
    selectedMonth: missionControl.selectedMonth
  });

  useAppShortcuts({
    activePage: ui.activePage,
    isTaskModalOpen: ui.isTaskModalOpen,
    isCmdPaletteOpen: ui.isCmdPaletteOpen,
    setActivePage: ui.setActivePage,
    openCreate: ui.openCreate,
    setIsCmdPaletteOpen: ui.setIsCmdPaletteOpen,
    setShowShortcuts: ui.setShowShortcuts
  });

  const handleModalSubmit = async (entry: TaskEntry) => {
    const success = await saveTransaction(entry, !!ui.editingEntry?.id);
    if (success) {
      ui.setIsTaskModalOpen(false);
      ui.setEditingEntry(null);
    }
  };

  const handleSaveConfig = (newConfig: AppConfig) => {
    setConfig(newConfig);
    ui.setShowSettings(false);
    showToast('Core systems recalibrated', 'success');
  };

  if (ui.activePage === 'FOCUS' && ui.focusedTask) {
    return (
        <FocusMode 
            task={ui.focusedTask} 
            onExit={ui.exitFocus}
            onUpdate={async (u) => { await saveTransaction(u, true); }}
            onComplete={taskActions.handleFocusComplete}
        />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-indigo-100 dark:selection:bg-indigo-900 transition-colors duration-300">
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

      <div className={`transition-all duration-300 ease-in-out ${ui.isSidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'}`}>
        <Header 
          activePage={ui.activePage} 
          onMenuToggle={() => ui.setIsSidebarOpen(!ui.isSidebarOpen)}
          onOpenCreate={ui.openCreate}
          onOpenAiChat={() => ui.setIsAiChatOpen(true)}
        />

        <main className="p-4 sm:p-6 lg:p-8 pb-24">
          {ui.activePage === 'DASHBOARD' && (
            <DashboardView
               entries={entries}
               metrics={metrics}
               isLoading={isLoading}
               onEdit={ui.openEdit}
               onDelete={removeTransaction}
               onStatusUpdate={taskActions.handleStatusUpdate}
               onDescriptionUpdate={taskActions.handleDescriptionUpdate}
               onFocus={ui.enterFocus}
               onDuplicate={(e) => { ui.setEditingEntry(taskActions.handleDuplicate(e)); ui.setIsTaskModalOpen(true); }}
               onNavigate={ui.setActivePage}
            />
          )}

          {ui.activePage === 'MISSIONS' && (
            <MissionControlView
              entries={entries}
              filteredEntries={filteredEntries}
              isLoading={isLoading}
              onEdit={ui.openEdit}
              onDelete={removeTransaction}
              onBulkDelete={bulkRemoveTransactions}
              onStatusUpdate={taskActions.handleStatusUpdate}
              onDescriptionUpdate={taskActions.handleDescriptionUpdate}
              onFocus={ui.enterFocus}
              onDuplicate={(e) => { ui.setEditingEntry(taskActions.handleDuplicate(e)); ui.setIsTaskModalOpen(true); }}
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

      <CommandPalette 
        isOpen={ui.isCmdPaletteOpen}
        onClose={() => ui.setIsCmdPaletteOpen(false)}
        entries={entries}
        onNavigate={ui.setActivePage}
        onCreate={ui.openCreate}
        onEdit={ui.openEdit}
        onSettings={() => ui.setShowSettings(true)}
        onToggleFocus={ui.enterFocus}
      />

      <TaskModal 
        isOpen={ui.isTaskModalOpen}
        onClose={() => ui.setIsTaskModalOpen(false)}
        onSubmit={handleModalSubmit}
        onDelete={removeTransaction}
        onDuplicate={(e) => ui.setEditingEntry(taskActions.handleDuplicate(e))}
        initialData={ui.editingEntry}
        isSubmitting={isSubmitting}
        entries={entries} 
      />

      <SettingsModal 
        isOpen={ui.showSettings} 
        onClose={() => ui.setShowSettings(false)}
        config={config}
        onSave={handleSaveConfig}
      />

      <ShortcutsModal isOpen={ui.showShortcuts} onClose={() => ui.setShowShortcuts(false)} />
    </div>
  );
};

export default App;
