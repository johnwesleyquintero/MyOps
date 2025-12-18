
import React from 'react';
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
  
  // Theme & State Hooks
  useTheme(config.theme);
  const ui = useUiState();

  // --- Data & Actions ---
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
  const { filteredEntries, metrics } = useTaskAnalytics({
    entries,
    searchQuery: missionControl.searchQuery,
    selectedCategory: missionControl.selectedCategory,
    selectedStatus: missionControl.selectedStatus,
    selectedMonth: missionControl.selectedMonth
  });

  // --- Keyboard Shortcuts Hook ---
  useAppShortcuts({
    activePage: ui.activePage,
    isTaskModalOpen: ui.isTaskModalOpen,
    isCmdPaletteOpen: ui.isCmdPaletteOpen,
    setActivePage: ui.setActivePage,
    openCreate: ui.openCreate,
    setIsCmdPaletteOpen: ui.setIsCmdPaletteOpen,
    setShowShortcuts: ui.setShowShortcuts
  });

  // --- Handlers ---
  const executeDuplicate = (entry: TaskEntry) => {
    const copy = generateDuplicate(entry);
    ui.setEditingEntry(copy);
    ui.setIsTaskModalOpen(true);
  };

  const handleModalSubmit = async (entry: TaskEntry) => {
    const isUpdate = !!ui.editingEntry?.id;
    const success = await saveTransaction(entry, isUpdate);
    if (success) {
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
    showToast('Configuration saved', 'success');
  };

  // Focus Mode Overlay
  if (ui.activePage === 'FOCUS' && ui.focusedTask) {
    return (
        <FocusMode 
            task={ui.focusedTask} 
            onExit={ui.exitFocus}
            onUpdate={async (updated) => { await saveTransaction(updated, true); }}
            onComplete={handleFocusComplete}
        />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-300">
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

      <div 
        className={`transition-all duration-300 ease-in-out ${ui.isSidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'}`}
      >
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
        onDelete={handleModalDelete}
        onDuplicate={executeDuplicate}
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

      <ShortcutsModal 
        isOpen={ui.showShortcuts}
        onClose={() => ui.setShowShortcuts(false)}
      />
    </div>
  );
};

export default App;
