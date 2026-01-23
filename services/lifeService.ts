import { LifeConstraintEntry, AppConfig } from "../types";
import { LIFE_OPS_STORAGE_KEY } from "../constants/storage";
import { fetchFromGas, postToGas } from "../utils/gasUtils";
import { storage } from "../utils/storageUtils";

export const fetchLifeConstraints = async (
  config: AppConfig,
): Promise<LifeConstraintEntry[]> => {
  if (config.mode === "DEMO") {
    await new Promise((resolve) => setTimeout(resolve, 50));
    return storage.get<LifeConstraintEntry[]>(LIFE_OPS_STORAGE_KEY, []);
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
    let current = storage.get<LifeConstraintEntry[]>(LIFE_OPS_STORAGE_KEY, []);

    if (isUpdate) {
      current = current.map((e) => (e.id === entryWithId.id ? entryWithId : e));
    } else {
      current = [entryWithId, ...current];
    }

    storage.set(LIFE_OPS_STORAGE_KEY, current);
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
    const current = storage.get<LifeConstraintEntry[]>(
      LIFE_OPS_STORAGE_KEY,
      [],
    );
    const updated = current.filter((e) => e.id !== id);
    storage.set(LIFE_OPS_STORAGE_KEY, updated);
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
