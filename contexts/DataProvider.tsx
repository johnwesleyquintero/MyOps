import React, { ReactNode, useMemo } from "react";
import { DataContext } from "./DataContext";
import { useConfig } from "../hooks/useConfig";
import { useNotification } from "../hooks/useNotification";
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
import { RewardProvider } from "./RewardProvider";

export const DataProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { config } = useConfig();
  const { showToast } = useNotification();

  const crm = useCrm(config, showToast);
  const notes = useNotes(config, showToast);
  const vault = useVault(config, showToast);
  const automation = useAutomation(config, showToast);
  const awareness = useAwareness(config, showToast);
  const strategy = useDecisions(config, showToast);
  const assets = useAssets(config, showToast);
  const reflections = useReflection(config, showToast);
  const integrations = useIntegrations(config, showToast);
  const lifeOps = useLifeOps(config, showToast);
  const tasks = useTasks(config, showToast);
  const operatorMetrics = useOperatorAnalytics(
    tasks.entries,
    awareness.mentalStates,
  );

  const value = useMemo(
    () => ({
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
    <DataContext.Provider value={value}>
      <RewardProvider metrics={operatorMetrics}>{children}</RewardProvider>
    </DataContext.Provider>
  );
};
