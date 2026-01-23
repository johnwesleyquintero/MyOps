import { createContext } from "react";
import { TasksContextType } from "./TasksContext";
import { CrmContextType } from "./CrmContext";
import { AwarenessContextType } from "./AwarenessContext";
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

export interface DataContextType {
  tasks: TasksContextType;
  crm: CrmContextType;
  awareness: AwarenessContextType;
  notes: ReturnType<typeof useNotes>;
  vault: ReturnType<typeof useVault>;
  automation: ReturnType<typeof useAutomation>;
  strategy: ReturnType<typeof useDecisions>;
  assets: ReturnType<typeof useAssets>;
  reflections: ReturnType<typeof useReflection>;
  integrations: ReturnType<typeof useIntegrations>;
  lifeOps: ReturnType<typeof useLifeOps>;
  rewards: ReturnType<typeof useRewardsData>;
  operatorMetrics: ReturnType<typeof useOperatorAnalytics>;
}

export const DataContext = createContext<DataContextType | undefined>(
  undefined,
);
