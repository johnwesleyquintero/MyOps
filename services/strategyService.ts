import { DecisionEntry, AppConfig } from "../types";
import { fetchFromGas, postToGas } from "../utils/gasUtils";
import { storage } from "../utils/storageUtils";

const LOCAL_STORAGE_KEY = "myops_strategy_decisions";

export const fetchDecisions = async (
  config: AppConfig,
): Promise<DecisionEntry[]> => {
  if (config.mode === "DEMO") {
    await new Promise((resolve) => setTimeout(resolve, 50));
    return storage.get<DecisionEntry[]>(LOCAL_STORAGE_KEY, []);
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
    const current = storage.get<DecisionEntry[]>(LOCAL_STORAGE_KEY, []);
    storage.set(LOCAL_STORAGE_KEY, [entryWithId, ...current]);
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
    let current = storage.get<DecisionEntry[]>(LOCAL_STORAGE_KEY, []);
    current = current.map((e) => (e.id === entry.id ? entry : e));
    storage.set(LOCAL_STORAGE_KEY, current);
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
    let current = storage.get<DecisionEntry[]>(LOCAL_STORAGE_KEY, []);
    current = current.filter((e) => e.id !== id);
    storage.set(LOCAL_STORAGE_KEY, current);
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
