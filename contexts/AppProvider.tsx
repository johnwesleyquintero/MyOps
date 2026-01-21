import React, { ReactNode, useMemo } from "react";
import { AppContext } from "./AppContext";
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

  const contextValue = useMemo(
    () => ({
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
    }),
    [
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
    ],
  );

  return (
    <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
  );
};
