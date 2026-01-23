import React, { ReactNode, useMemo, useContext } from "react";
import { DataContext } from "./DataContext";
import { useConfig } from "../hooks/useConfig";
import { useNotification } from "../hooks/useNotification";
import { useNotes } from "../hooks/useNotes";
import { useVault } from "../hooks/useVault";
import { useAutomation } from "../hooks/useAutomation";
import { useDecisions } from "../hooks/useDecisions";
import { useAssets } from "../hooks/useAssets";
import { useReflection } from "../hooks/useReflection";
import { useIntegrations } from "../hooks/useIntegrations";
import { useLifeOps } from "../hooks/useLifeOps";
import { useRewardsData } from "../hooks/useRewardsData";
import { useOperatorAnalytics } from "../hooks/useOperatorAnalytics";
import { RewardProvider } from "./RewardProvider";
import { TasksProvider } from "./TasksProvider";
import { TasksContext } from "./TasksContext";
import { CrmProvider } from "./CrmProvider";
import { CrmContext } from "./CrmContext";
import { AwarenessProvider } from "./AwarenessProvider";
import { AwarenessContext } from "./AwarenessContext";

// Inner component to consume individual contexts and provide to DataContext for backward compatibility
const DataContextBridge: React.FC<{ children: ReactNode }> = ({ children }) => {
  const tasks = useContext(TasksContext)!;
  const crm = useContext(CrmContext)!;
  const awareness = useContext(AwarenessContext)!;

  const { config } = useConfig();
  const { showToast } = useNotification();

  const notes = useNotes(config, showToast);
  const vault = useVault(config, showToast);
  const automation = useAutomation(config, showToast);
  const strategy = useDecisions(config, showToast);
  const assets = useAssets(config, showToast);
  const reflections = useReflection(config, showToast);
  const integrations = useIntegrations(config, showToast);
  const lifeOps = useLifeOps(config, showToast);
  const rewards = useRewardsData(config);
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
      rewards,
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
      rewards,
      operatorMetrics,
    ],
  );

  return (
    <DataContext.Provider value={value}>
      <RewardProvider metrics={operatorMetrics}>{children}</RewardProvider>
    </DataContext.Provider>
  );
};

export const DataProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  return (
    <TasksProvider>
      <CrmProvider>
        <AwarenessProvider>
          <DataContextBridge>{children}</DataContextBridge>
        </AwarenessProvider>
      </CrmProvider>
    </TasksProvider>
  );
};
