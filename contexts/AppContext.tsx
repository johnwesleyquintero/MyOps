import React, { createContext, useContext, ReactNode } from "react";
import { useAppConfig } from "../hooks/useAppConfig";
import { useNotifications } from "../hooks/useNotifications";
import { useUiState } from "../hooks/useUiState";
import { useTasks } from "../hooks/useTasks";
import { useCrm } from "../hooks/useCrm";
import { useNotes } from "../hooks/useNotes";
import { useVault } from "../hooks/useVault";
import { useAutomation } from "../hooks/useAutomation";
import { useAwareness } from "../hooks/useAwareness";
import { useDecisions } from "../hooks/useDecisions";
import { useAssets } from "../hooks/useAssets";
import { useReflection } from "../hooks/useReflection";
import { useIntegrations } from "../hooks/useIntegrations";
import { useLifeOps } from "../hooks/useLifeOps";
import { useOperatorAnalytics } from "../hooks/useOperatorAnalytics";
import { AppConfig, NotificationAction } from "../types";

interface AppContextType {
  config: AppConfig;
  setConfig: (config: AppConfig) => void;
  showToast: (
    msg: string,
    type: "success" | "error" | "info",
    action?: NotificationAction,
  ) => void;
  ui: ReturnType<typeof useUiState>;
  tasks: ReturnType<typeof useTasks>;
  crm: ReturnType<typeof useCrm>;
  notes: ReturnType<typeof useNotes>;
  vault: ReturnType<typeof useVault>;
  automation: ReturnType<typeof useAutomation>;
  awareness: ReturnType<typeof useAwareness>;
  strategy: ReturnType<typeof useDecisions>;
  assets: ReturnType<typeof useAssets>;
  reflections: ReturnType<typeof useReflection>;
  integrations: ReturnType<typeof useIntegrations>;
  lifeOps: ReturnType<typeof useLifeOps>;
  operatorMetrics: ReturnType<typeof useOperatorAnalytics>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { config, setConfig } = useAppConfig();
  const { showToast } = useNotifications();
  const ui = useUiState();

  const crm = useCrm(config, showToast);
  const notes = useNotes(config, showToast);
  const vault = useVault(config, showToast);
  const automation = useAutomation(config, showToast);
  const awareness = useAwareness(config);
  const strategy = useDecisions(config);
  const assets = useAssets(config, showToast);
  const reflections = useReflection(config, showToast);
  const integrations = useIntegrations(config, showToast);
  const lifeOps = useLifeOps(config, showToast);
  const tasks = useTasks(config, showToast);
  const operatorMetrics = useOperatorAnalytics(tasks.entries);

  return (
    <AppContext.Provider
      value={{
        config,
        setConfig,
        showToast,
        ui,
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
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};
