import React, { lazy } from "react";
import { useConfig } from "../hooks/useConfig";
import { useNotification } from "../hooks/useNotification";
import { useUi } from "../hooks/useUi";
import { useData } from "../hooks/useData";
import { useTaskActions } from "../hooks/useTaskActions";
import { useTaskAnalytics } from "../hooks/useTaskAnalytics";
import { useMissionControl } from "../hooks/useMissionControl";

// Lazy-loaded views
const DashboardView = lazy(() =>
  import("./views/DashboardView").then((m) => ({
    default: m.DashboardView,
  })),
);
const MissionControlView = lazy(() =>
  import("./views/MissionControlView").then((m) => ({
    default: m.MissionControlView,
  })),
);
const BlueprintView = lazy(() =>
  import("./views/BlueprintView").then((m) => ({
    default: m.BlueprintView,
  })),
);
const CrmView = lazy(() =>
  import("./views/CrmView").then((m) => ({ default: m.CrmView })),
);
const KnowledgeView = lazy(() =>
  import("./views/KnowledgeView").then((m) => ({
    default: m.KnowledgeView,
  })),
);
const InsightsView = lazy(() =>
  import("./views/InsightsView").then((m) => ({
    default: m.InsightsView,
  })),
);
const VaultView = lazy(() =>
  import("./views/VaultView").then((m) => ({
    default: m.VaultView,
  })),
);
const AutomationView = lazy(() =>
  import("./views/AutomationView").then((m) => ({
    default: m.AutomationView,
  })),
);
const ReportView = lazy(() =>
  import("./views/ReportView").then((m) => ({
    default: m.ReportView,
  })),
);
const StrategyView = lazy(() =>
  import("./views/StrategyView").then((m) => ({
    default: m.StrategyView,
  })),
);
const AwarenessView = lazy(() =>
  import("./views/AwarenessView").then((m) => ({
    default: m.AwarenessView,
  })),
);
const WesAiView = lazy(() =>
  import("./views/WesAiView").then((m) => ({
    default: m.WesAiView,
  })),
);
const AssetsView = lazy(() =>
  import("./views/AssetsView").then((m) => ({
    default: m.AssetsView,
  })),
);
const ReflectionView = lazy(() =>
  import("./views/ReflectionView").then((m) => ({
    default: m.ReflectionView,
  })),
);
const IntegrationView = lazy(() =>
  import("./views/IntegrationView").then((m) => ({
    default: m.IntegrationView,
  })),
);
const IntegrationStoryView = lazy(() =>
  import("./views/IntegrationStoryView").then((m) => ({
    default: m.IntegrationStoryView,
  })),
);
const LifeView = lazy(() =>
  import("./views/LifeView").then((m) => ({ default: m.LifeView })),
);

export const ViewRenderer: React.FC = React.memo(() => {
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

  switch (ui.activePage) {
    case "DASHBOARD":
      return (
        <DashboardView
          entries={entries}
          metrics={globalMetrics}
          operatorMetrics={operatorMetrics}
          mentalStates={awareness.mentalStates}
          decisions={strategy.decisions}
          reflections={reflections.reflections}
          isLoading={isLoading}
          onEdit={ui.openEdit}
          onDelete={removeTransaction}
          onStatusUpdate={taskActions.handleStatusUpdate}
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
      return (
        <BlueprintView
          onNavigate={ui.setActivePage}
          onOpenSettings={() => ui.setShowSettings(true)}
        />
      );
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
      return (
        <StrategyView
          config={config}
          decisions={strategy.decisions}
          isLoading={strategy.isLoading}
          onSave={strategy.saveDecision}
          onDelete={strategy.deleteDecision}
        />
      );
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
        <IntegrationStoryView onBack={() => ui.setActivePage("INTEGRATIONS")} />
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
      return (
        <AwarenessView
          history={awareness.mentalStates}
          isLoading={awareness.isLoading}
          onSave={awareness.saveMentalState}
        />
      );
    case "FOCUS":
      // Fallback if accessed without a focused task
      ui.setActivePage("MISSIONS");
      return null;
    default:
      return null;
  }
});

ViewRenderer.displayName = "ViewRenderer";
