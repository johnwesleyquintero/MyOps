import { DecisionEntry, AppConfig } from "../types";
import { fetchFromGas, postToGas } from "../utils/gasUtils";

const LOCAL_STORAGE_KEY = "myops_strategy_decisions";

export const fetchDecisions = async (
  config: AppConfig,
): Promise<DecisionEntry[]> => {
  if (config.mode === "DEMO") {
    await new Promise((resolve) => setTimeout(resolve, 50));
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } else {
    return fetchFromGas<DecisionEntry>(config, "strategy");
  }
};

export const addDecision = async (
  entry: DecisionEntry,
  config: AppConfig,
): Promise<DecisionEntry> => {
  const entryWithId = { ...entry, id: entry.id || crypto.randomUUID() };

  if (config.mode === "DEMO") {
    await new Promise((resolve) => setTimeout(resolve, 50));
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    const current = stored ? JSON.parse(stored) : [];
    localStorage.setItem(
      LOCAL_STORAGE_KEY,
      JSON.stringify([entryWithId, ...current]),
    );
  } else {
    if (!config.gasDeploymentUrl) throw new Error("GAS URL not configured");
    await postToGas(config.gasDeploymentUrl, {
      action: "create",
      module: "strategy",
      entry: entryWithId,
      token: config.apiToken,
    });
  }

  return entryWithId;
};

export const updateDecision = async (
  entry: DecisionEntry,
  config: AppConfig,
): Promise<DecisionEntry> => {
  if (config.mode === "DEMO") {
    await new Promise((resolve) => setTimeout(resolve, 50));
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    let current: DecisionEntry[] = stored ? JSON.parse(stored) : [];
    current = current.map((e) => (e.id === entry.id ? entry : e));
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(current));
  } else {
    if (!config.gasDeploymentUrl) throw new Error("GAS URL not configured");
    await postToGas(config.gasDeploymentUrl, {
      action: "update",
      module: "strategy",
      entry,
      token: config.apiToken,
    });
  }
  return entry;
};

export const deleteDecision = async (
  id: string,
  config: AppConfig,
): Promise<void> => {
  if (config.mode === "DEMO") {
    await new Promise((resolve) => setTimeout(resolve, 50));
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    let current: DecisionEntry[] = stored ? JSON.parse(stored) : [];
    current = current.filter((e) => e.id !== id);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(current));
  } else {
    if (!config.gasDeploymentUrl) throw new Error("GAS URL not configured");
    await postToGas(config.gasDeploymentUrl, {
      action: "delete",
      module: "strategy",
      entry: { id },
      token: config.apiToken,
    });
  }
};
