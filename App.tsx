import React, { Suspense, lazy } from "react";
import { Header } from "./components/Header";
import { Sidebar } from "./components/Sidebar";
import { Toaster } from "sonner";
import { Spinner } from "./components/ui/Spinner";
import { useConfig } from "./hooks/useConfig";
import { useNotification } from "./hooks/useNotification";
import { useUi } from "./hooks/useUi";
import { useData } from "./hooks/useData";

// Lazy-loaded components
const TaskModal = lazy(() =>
  import("./components/TaskModal").then((m) => ({ default: m.TaskModal })),
);
const SettingsModal = lazy(() =>
  import("./components/SettingsModal").then((m) => ({
    default: m.SettingsModal,
  })),
);
const ShortcutsModal = lazy(() =>
  import("./components/ShortcutsModal").then((m) => ({
    default: m.ShortcutsModal,
  })),
);
const FocusMode = lazy(() =>
  import("./components/FocusMode").then((m) => ({ default: m.FocusMode })),
);
const CommandPalette = lazy(() =>
  import("./components/CommandPalette").then((m) => ({
    default: m.CommandPalette,
  })),
);
const AiChatSidebar = lazy(() =>
  import("./components/AiChatSidebar").then((m) => ({
    default: m.AiChatSidebar,
  })),
);

// Lazy-loaded views
const DashboardView = lazy(() =>
  import("./components/views/DashboardView").then((m) => ({
    default: m.DashboardView,
  })),
);
const MissionControlView = lazy(() =>
  import("./components/views/MissionControlView").then((m) => ({
    default: m.MissionControlView,
  })),
);
const BlueprintView = lazy(() =>
  import("./components/views/BlueprintView").then((m) => ({
    default: m.BlueprintView,
  })),
);
const CrmView = lazy(() =>
  import("./components/views/CrmView").then((m) => ({ default: m.CrmView })),
);
const KnowledgeView = lazy(() =>
  import("./components/views/KnowledgeView").then((m) => ({
    default: m.KnowledgeView,
  })),
);
const InsightsView = lazy(() =>
  import("./components/views/InsightsView").then((m) => ({
    default: m.InsightsView,
  })),
);
const VaultView = lazy(() =>
  import("./components/views/VaultView").then((m) => ({
    default: m.VaultView,
  })),
);
const AutomationView = lazy(() =>
  import("./components/views/AutomationView").then((m) => ({
    default: m.AutomationView,
  })),
);
const ReportView = lazy(() =>
  import("./components/views/ReportView").then((m) => ({
    default: m.ReportView,
  })),
);
const StrategyView = lazy(() =>
  import("./components/views/StrategyView").then((m) => ({
    default: m.StrategyView,
  })),
);
const AwarenessView = lazy(() =>
  import("./components/views/AwarenessView").then((m) => ({
    default: m.AwarenessView,
  })),
);
const WesAiView = lazy(() =>
  import("./components/views/WesAiView").then((m) => ({
    default: m.WesAiView,
  })),
);
const AssetsView = lazy(() =>
  import("./components/views/AssetsView").then((m) => ({
    default: m.AssetsView,
  })),
);
const ReflectionView = lazy(() =>
  import("./components/views/ReflectionView").then((m) => ({
    default: m.ReflectionView,
  })),
);
const IntegrationView = lazy(() =>
  import("./components/views/IntegrationView").then((m) => ({
    default: m.IntegrationView,
  })),
);
const IntegrationStoryView = lazy(() =>
  import("./components/views/IntegrationStoryView").then((m) => ({
    default: m.IntegrationStoryView,
  })),
);
const LifeView = lazy(() =>
  import("./components/views/LifeView").then((m) => ({ default: m.LifeView })),
);

// Hooks
import { useTaskAnalytics } from "./hooks/useTaskAnalytics";
import { useTaskActions } from "./hooks/useTaskActions";
import { useMissionControl } from "./hooks/useMissionControl";
import { useTheme } from "./hooks/useTheme";
import { useAppShortcuts } from "./hooks/useAppShortcuts";

const App: React.FC = () => {
  const { config } = useConfig();
  const { showToast } = useNotification();
  const ui = useUi();
  const {
    tasks,
    crm,
    notes,
    vault,
    automation,
    awareness,
    strategy,
    assets,
    reflections,
    integrations,
    lifeOps,
    operatorMetrics,
  } = useData();

  useTheme(config.theme);

  const { entries, isLoading, saveTransaction, removeTransaction } = tasks;

  const taskActions = useTaskActions({
    saveTransaction,
    showToast,
    mentalStates: awareness.mentalStates,
    setActivePage: ui.setActivePage,
  });
  const missionControl = useMissionControl(entries);

  const { filteredEntries, globalMetrics } = useTaskAnalytics({
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

  if (ui.activePage === "FOCUS" && ui.focusedTask) {
    return (
      <Suspense
        fallback={
          <div className="flex items-center justify-center h-screen bg-notion-dark-bg">
            <Spinner size="lg" />
          </div>
        }
      >
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
      </Suspense>
    );
  }

  const renderActiveView = () => {
    switch (ui.activePage) {
      case "DASHBOARD":
        return (
          <DashboardView
            entries={entries}
            metrics={globalMetrics}
            operatorMetrics={operatorMetrics}
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
        );
      case "MISSIONS":
        return (
          <MissionControlView
            entries={entries}
            filteredEntries={filteredEntries}
            isLoading={isLoading}
            onEdit={ui.openEdit}
            onDelete={removeTransaction}
            onBulkDelete={tasks.bulkRemoveTransactions}
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
        );
      case "BLUEPRINT":
        return <BlueprintView onNavigate={ui.setActivePage} />;
      case "CRM":
        return (
          <CrmView
            contacts={crm.contacts}
            isLoading={crm.isLoading}
            onSaveContact={crm.saveContact}
            onDeleteContact={crm.deleteContact}
            onGetInteractions={crm.getInteractions}
            onSaveInteraction={crm.saveInteraction}
            initialSelectedContact={ui.editingContact}
          />
        );
      case "KNOWLEDGE":
        return (
          <KnowledgeView
            notes={notes.notes}
            isLoading={notes.isLoading}
            onSaveNote={notes.saveNote}
            onDeleteNote={notes.deleteNote}
            initialSelectedNote={ui.editingNote}
            initialIsCreating={ui.isCreatingNote}
          />
        );
      case "INSIGHTS":
        return (
          <InsightsView
            entries={entries}
            metrics={operatorMetrics}
            notes={notes.notes}
            contacts={crm.contacts}
            vaultEntries={vault.vaultEntries}
          />
        );
      case "VAULT":
        return (
          <VaultView
            entries={vault.vaultEntries}
            isLoading={vault.isLoading}
            onSaveEntry={vault.saveVaultEntry}
            onDeleteEntry={vault.deleteVaultEntry}
          />
        );
      case "AUTOMATION":
        return (
          <AutomationView
            automations={automation.automations}
            isLoading={automation.isLoading}
            onSave={automation.saveAutomation}
            onDelete={automation.deleteAutomation}
            onToggle={automation.toggleAutomation}
          />
        );
      case "REPORT":
        return <ReportView />;
      case "STRATEGY":
        return <StrategyView config={config} />;
      case "ASSETS":
        return (
          <AssetsView
            assets={assets.assets}
            isLoading={assets.isLoading}
            onSave={assets.saveAsset}
            onDelete={assets.deleteAsset}
          />
        );
      case "REFLECTION":
        return (
          <ReflectionView
            reflections={reflections.reflections}
            isLoading={reflections.isLoading}
            onSave={reflections.saveReflection}
            onDelete={reflections.deleteReflection}
          />
        );
      case "INTEGRATIONS":
        return (
          <IntegrationView
            integrations={integrations.integrations}
            isLoading={integrations.isLoading}
            onSave={integrations.saveIntegration}
            onDelete={integrations.deleteIntegration}
            onToggle={integrations.toggleIntegration}
            onTest={integrations.testConnection}
            onShowStory={() => ui.setActivePage("STORY")}
          />
        );
      case "STORY":
        return (
          <IntegrationStoryView
            onBack={() => ui.setActivePage("INTEGRATIONS")}
          />
        );
      case "LIFE":
        return (
          <LifeView
            constraints={lifeOps.constraints}
            isLoading={lifeOps.isLoading}
            onSave={lifeOps.saveConstraint}
            onDelete={lifeOps.deleteConstraint}
          />
        );
      case "WESAI":
        return (
          <WesAiView
            config={config}
            entries={entries}
            contacts={crm.contacts}
            notes={notes.notes}
            vaultEntries={vault.vaultEntries}
            metrics={operatorMetrics}
            decisions={strategy.decisions}
            mentalStates={awareness.mentalStates}
            assets={assets.assets}
            reflections={reflections.reflections}
            lifeConstraints={lifeOps.constraints}
            onSaveTransaction={saveTransaction}
            onDeleteTransaction={removeTransaction}
            onSaveContact={crm.saveContact}
            onSaveNote={notes.saveNote}
            onSaveAsset={assets.saveAsset}
            onSaveReflection={reflections.saveReflection}
          />
        );
      case "AWARENESS":
        return <AwarenessView config={config} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-notion-bg text-notion-text font-sans selection:bg-violet-100 dark:selection:bg-violet-900/30 transition-colors duration-200">
      <Sidebar />

      <div
        className={`transition-all duration-300 ease-in-out ${ui.isSidebarCollapsed ? "lg:pl-16" : "lg:pl-60"}`}
      >
        <Header />

        <main className="p-4 sm:p-6 lg:p-8 pb-24 bg-notion-bg scrollbar-thin scrollbar-thumb-notion-border">
          <Suspense
            fallback={
              <div className="flex items-center justify-center py-20">
                <Spinner size="lg" />
              </div>
            }
          >
            {renderActiveView()}
          </Suspense>
        </main>
      </div>

      <Suspense fallback={null}>
        <AiChatSidebar />
        <CommandPalette />
        <TaskModal />
        <SettingsModal />
        <ShortcutsModal />
      </Suspense>
      <Toaster
        theme={config.theme === "DARK" ? "dark" : "light"}
        position="bottom-right"
      />
    </div>
  );
};

export default App;
