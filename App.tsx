import React, { Suspense, lazy } from "react";
import { Header } from "./components/Header";
import { Sidebar } from "./components/Sidebar";
import { Toaster } from "sonner";
import { Spinner } from "./components/ui/Spinner";
import { useConfig } from "./hooks/useConfig";
import { useNotification } from "./hooks/useNotification";
import { useTasksContext } from "./hooks/useTasksContext";
import { useAwarenessContext } from "./hooks/useAwarenessContext";
import { useUi } from "./hooks/useUi";
import { ViewRenderer } from "./components/ViewRenderer";
import { useTaskActions } from "./hooks/useTaskActions";

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

// Hooks
import { useTheme } from "./hooks/useTheme";
import { useAppShortcuts } from "./hooks/useAppShortcuts";

const App: React.FC = () => {
  const { config } = useConfig();
  const { showToast } = useNotification();
  const ui = useUi();
  const tasks = useTasksContext();
  const awareness = useAwarenessContext();

  useTheme(config.theme);

  const { saveTransaction } = tasks;

  const taskActions = useTaskActions({
    saveTransaction,
    showToast,
    mentalStates: awareness.mentalStates,
    setActivePage: ui.setActivePage,
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
          mentalStates={awareness.mentalStates}
          isHudMode={ui.isHudMode}
          onExit={() => {
            ui.exitFocus();
            showToast("Focus Mode Disengaged", "info");
          }}
          onUpdate={async (u) => {
            await saveTransaction(u, true);
          }}
          onComplete={async (u) => {
            await taskActions.handleFocusComplete(u);
          }}
        />
      </Suspense>
    );
  }

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
            <ViewRenderer />
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
