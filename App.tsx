import React from "react";
import { TaskEntry, AppConfig } from "./types";
import { TaskModal } from "./components/TaskModal";
import { SettingsModal } from "./components/SettingsModal";
import { Header } from "./components/Header";
import { Sidebar } from "./components/Sidebar";
import { ShortcutsModal } from "./components/ShortcutsModal";
import { FocusMode } from "./components/FocusMode";
import { CommandPalette } from "./components/CommandPalette";
import { AiChatSidebar } from "./components/AiChatSidebar";
import { Toaster } from "sonner";
import { DashboardView } from "./components/views/DashboardView";
import { MissionControlView } from "./components/views/MissionControlView";
import { BlueprintView } from "./components/views/BlueprintView";
import { CrmView } from "./components/views/CrmView";
import { KnowledgeView } from "./components/views/KnowledgeView";
import { InsightsView } from "./components/views/InsightsView";
import { VaultView } from "./components/views/VaultView";
import { AutomationView } from "./components/views/AutomationView";
import { ReportView } from "./components/views/ReportView";
import { StrategyView } from "./components/views/StrategyView";
import { AwarenessView } from "./components/views/AwarenessView";
import { WesAiView } from "./components/views/WesAiView";

// Hooks
import { useTasks } from "./hooks/useTasks";
import { useTaskAnalytics } from "./hooks/useTaskAnalytics";
import { useAppConfig } from "./hooks/useAppConfig";
import { useNotifications } from "./hooks/useNotifications";
import { useTaskActions } from "./hooks/useTaskActions";
import { useMissionControl } from "./hooks/useMissionControl";
import { useUiState } from "./hooks/useUiState";
import { useTheme } from "./hooks/useTheme";
import { useAppShortcuts } from "./hooks/useAppShortcuts";
import { useCrm } from "./hooks/useCrm";
import { useNotes } from "./hooks/useNotes";
import { useOperatorAnalytics } from "./hooks/useOperatorAnalytics";
import { useVault } from "./hooks/useVault";
import { useAutomation } from "./hooks/useAutomation";
import { useDecisions } from "./hooks/useDecisions";
import { useAwareness } from "./hooks/useAwareness";

const App: React.FC = () => {
  const { config, setConfig } = useAppConfig();
  const { showToast } = useNotifications();

  useTheme(config.theme);
  const ui = useUiState();

  const crm = useCrm(config, showToast);
  const notes = useNotes(config, showToast);
  const vault = useVault(config, showToast);
  const automation = useAutomation(config, showToast);
  const { decisions } = useDecisions(config);
  const { mentalStates } = useAwareness(config);

  const {
    entries,
    isLoading,
    isSubmitting,
    saveTransaction,
    removeTransaction,
    bulkRemoveTransactions,
  } = useTasks(config, showToast);

  const operatorMetrics = useOperatorAnalytics(entries);

  const taskActions = useTaskActions({ saveTransaction, showToast });
  const missionControl = useMissionControl(entries);

  const { filteredEntries, metrics } = useTaskAnalytics({
    entries,
    searchQuery: missionControl.searchQuery,
    selectedCategory: missionControl.selectedCategory,
    selectedStatus: missionControl.selectedStatus,
    selectedMonth: missionControl.selectedMonth,
    isAiSortEnabled: missionControl.isAiSortEnabled,
  });

  useAppShortcuts({
    activePage: ui.activePage,
    isTaskModalOpen: ui.isTaskModalOpen,
    isCmdPaletteOpen: ui.isCmdPaletteOpen,
    setActivePage: ui.setActivePage,
    openCreate: ui.openCreate,
    setIsCmdPaletteOpen: ui.setIsCmdPaletteOpen,
    setShowShortcuts: ui.setShowShortcuts,
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
    showToast("Core systems recalibrated", "success");
  };

  if (ui.activePage === "FOCUS" && ui.focusedTask) {
    return (
      <FocusMode
        task={ui.focusedTask}
        onExit={() => {
          ui.exitFocus();
          showToast("Focus Mode Disengaged", "info");
        }}
        onUpdate={async (u) => {
          await saveTransaction(u, true);
          showToast("Session notes archived", "success");
        }}
        onComplete={async (u) => {
          await taskActions.handleFocusComplete(u);
          showToast("Mission Accomplished", "success");
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-notion-light-bg dark:bg-notion-dark-bg text-notion-light-text dark:text-notion-dark-text font-sans selection:bg-blue-100 dark:selection:bg-blue-900/30 transition-colors duration-200">
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
        className={`transition-all duration-300 ease-in-out ${ui.isSidebarCollapsed ? "lg:pl-16" : "lg:pl-60"}`}
      >
        <Header
          activePage={ui.activePage}
          onMenuToggle={() => ui.setIsSidebarOpen(!ui.isSidebarOpen)}
          onOpenCreate={ui.openCreate}
          onOpenAiChat={() => ui.setIsAiChatOpen(true)}
          config={config}
          setConfig={setConfig}
        />

        <main className="p-4 sm:p-6 lg:p-8 pb-24 bg-notion-light-bg dark:bg-notion-dark-bg scrollbar-thin scrollbar-thumb-notion-light-border dark:scrollbar-thumb-notion-dark-border">
          {ui.activePage === "DASHBOARD" && (
            <DashboardView
              entries={entries}
              metrics={metrics}
              isLoading={isLoading}
              onEdit={ui.openEdit}
              onDelete={removeTransaction}
              onStatusUpdate={taskActions.handleStatusUpdate}
              onDescriptionUpdate={taskActions.handleDescriptionUpdate}
              onFocus={(e) => {
                ui.enterFocus(e);
                showToast("Focus Mode Engaged", "info");
              }}
              onDuplicate={(e) => {
                ui.setEditingEntry(taskActions.handleDuplicate(e));
                ui.setIsTaskModalOpen(true);
                showToast("Mission Cloned", "success");
              }}
              onNavigate={ui.setActivePage}
            />
          )}

          {ui.activePage === "MISSIONS" && (
            <MissionControlView
              entries={entries}
              filteredEntries={filteredEntries}
              isLoading={isLoading}
              onEdit={ui.openEdit}
              onDelete={removeTransaction}
              onBulkDelete={bulkRemoveTransactions}
              onStatusUpdate={taskActions.handleStatusUpdate}
              onDescriptionUpdate={taskActions.handleDescriptionUpdate}
              onFocus={(e) => {
                ui.enterFocus(e);
                showToast("Focus Mode Engaged", "info");
              }}
              onDuplicate={(e) => {
                ui.setEditingEntry(taskActions.handleDuplicate(e));
                ui.setIsTaskModalOpen(true);
                showToast("Mission Cloned", "success");
              }}
              onAdd={ui.openCreate}
              {...missionControl}
            />
          )}

          {ui.activePage === "BLUEPRINT" && <BlueprintView />}

          {ui.activePage === "CRM" && (
            <CrmView
              contacts={crm.contacts}
              isLoading={crm.isLoading}
              onSaveContact={crm.saveContact}
              onGetInteractions={crm.getInteractions}
              onSaveInteraction={crm.saveInteraction}
              initialSelectedContact={ui.editingContact}
            />
          )}

          {ui.activePage === "KNOWLEDGE" && (
            <KnowledgeView
              notes={notes.notes}
              isLoading={notes.isLoading}
              onSaveNote={notes.saveNote}
              onDeleteNote={notes.deleteNote}
              initialSelectedNote={ui.editingNote}
              initialIsCreating={ui.isCreatingNote}
            />
          )}

          {ui.activePage === "INSIGHTS" && (
            <InsightsView
              entries={entries}
              metrics={operatorMetrics}
              notes={notes.notes}
              contacts={crm.contacts}
              vaultEntries={vault.vaultEntries}
            />
          )}

          {ui.activePage === "VAULT" && (
            <VaultView
              entries={vault.vaultEntries}
              isLoading={vault.isLoading}
              onSaveEntry={vault.saveVaultEntry}
              onDeleteEntry={vault.deleteVaultEntry}
            />
          )}

          {ui.activePage === "AUTOMATION" && (
            <AutomationView
              automations={automation.automations}
              isLoading={automation.isLoading}
              onSave={automation.saveAutomation}
              onDelete={automation.deleteAutomation}
              onToggle={automation.toggleAutomation}
            />
          )}

          {ui.activePage === "REPORT" && <ReportView />}
          {ui.activePage === "STRATEGY" && <StrategyView config={config} />}
          {ui.activePage === "WESAI" && (
            <WesAiView
              config={config}
              entries={entries}
              contacts={crm.contacts}
              notes={notes.notes}
              vaultEntries={vault.vaultEntries}
              metrics={operatorMetrics}
              decisions={decisions}
              mentalStates={mentalStates}
              onSaveTransaction={saveTransaction}
              onDeleteTransaction={removeTransaction}
              onSaveContact={crm.saveContact}
              onSaveNote={notes.saveNote}
            />
          )}
          {ui.activePage === "AWARENESS" && <AwarenessView config={config} />}
        </main>
      </div>

      <AiChatSidebar
        isOpen={ui.isAiChatOpen}
        onClose={() => ui.setIsAiChatOpen(false)}
        config={config}
        entries={entries}
        contacts={crm.contacts}
        notes={notes.notes}
        vaultEntries={vault.vaultEntries}
        metrics={operatorMetrics}
        decisions={decisions}
        mentalStates={mentalStates}
        onSaveTransaction={saveTransaction}
        onDeleteTransaction={removeTransaction}
        onSaveContact={crm.saveContact}
        onSaveNote={notes.saveNote}
      />

      <CommandPalette
        isOpen={ui.isCmdPaletteOpen}
        onClose={() => ui.setIsCmdPaletteOpen(false)}
        entries={entries}
        contacts={crm.contacts}
        notes={notes.notes}
        onNavigate={ui.setActivePage}
        onCreate={ui.openCreate}
        onCreateNote={ui.openCreateNote}
        onEdit={ui.openEdit}
        onEditContact={ui.openEditContact}
        onEditNote={(note) => {
          ui.openEditNote(note);
          ui.setIsCmdPaletteOpen(false);
        }}
        onSettings={() => ui.setShowSettings(true)}
        onToggleFocus={(e) => {
          ui.enterFocus(e);
          showToast("Focus Mode Engaged", "info");
        }}
      />

      <TaskModal
        isOpen={ui.isTaskModalOpen}
        onClose={() => ui.setIsTaskModalOpen(false)}
        onSubmit={handleModalSubmit}
        onDelete={removeTransaction}
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
      <Toaster
        position="bottom-right"
        richColors
        theme={config.theme.toLowerCase() as "light" | "dark"}
      />
    </div>
  );
};

export default App;
