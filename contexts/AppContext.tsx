import { createContext } from "react";
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

export interface AppContextType {
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

export const AppContext = createContext<AppContextType | undefined>(undefined);
