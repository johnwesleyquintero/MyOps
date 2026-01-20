import { LifeConstraintEntry, AppConfig } from "../types";
import { LIFE_OPS_STORAGE_KEY } from "../constants/storage";
import { fetchFromGas, postToGas } from "../utils/gasUtils";

export const fetchLifeConstraints = async (
  config: AppConfig,
): Promise<LifeConstraintEntry[]> => {
  if (config.mode === "DEMO") {
    await new Promise((resolve) => setTimeout(resolve, 50));
    const stored = localStorage.getItem(LIFE_OPS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } else {
    return fetchFromGas<LifeConstraintEntry>(config, "life_ops");
  }
};

export const saveLifeConstraint = async (
  entry: LifeConstraintEntry,
  config: AppConfig,
  isUpdate: boolean,
): Promise<LifeConstraintEntry> => {
  const entryWithId = {
    ...entry,
    id:
      entry.id ||
      (typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : Math.random().toString(36).substring(2, 11)),
    createdAt: entry.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  if (config.mode === "DEMO") {
    await new Promise((resolve) => setTimeout(resolve, 50));
    const stored = localStorage.getItem(LIFE_OPS_STORAGE_KEY);
    let current: LifeConstraintEntry[] = stored ? JSON.parse(stored) : [];

    if (isUpdate) {
      current = current.map((e) => (e.id === entryWithId.id ? entryWithId : e));
    } else {
      current = [entryWithId, ...current];
    }

    localStorage.setItem(LIFE_OPS_STORAGE_KEY, JSON.stringify(current));
  } else {
    if (!config.gasDeploymentUrl) throw new Error("GAS URL not configured");
    await postToGas(config.gasDeploymentUrl, {
      action: isUpdate ? "update" : "create",
      module: "life_ops",
      entry: entryWithId,
      token: config.apiToken,
    });
  }

  return entryWithId;
};

export const deleteLifeConstraint = async (
  id: string,
  config: AppConfig,
): Promise<void> => {
  if (config.mode === "DEMO") {
    await new Promise((resolve) => setTimeout(resolve, 50));
    const stored = localStorage.getItem(LIFE_OPS_STORAGE_KEY);
    let current: LifeConstraintEntry[] = stored ? JSON.parse(stored) : [];
    current = current.filter((e) => e.id !== id);
    localStorage.setItem(LIFE_OPS_STORAGE_KEY, JSON.stringify(current));
  } else {
    if (!config.gasDeploymentUrl) throw new Error("GAS URL not configured");
    await postToGas(config.gasDeploymentUrl, {
      action: "delete",
      module: "life_ops",
      entry: { id },
      token: config.apiToken,
    });
  }
};
