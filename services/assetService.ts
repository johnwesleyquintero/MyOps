import { AssetEntry, AppConfig } from "../types";
import { ASSET_STORAGE_KEY } from "../constants/storage";
import { fetchFromGas, postToGas } from "../utils/gasUtils";

export const fetchAssets = async (config: AppConfig): Promise<AssetEntry[]> => {
  if (config.mode === "DEMO") {
    await new Promise((resolve) => setTimeout(resolve, 50));
    const stored = localStorage.getItem(ASSET_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } else {
    return fetchFromGas<AssetEntry>(config, "assets");
  }
};

export const saveAsset = async (
  entry: AssetEntry,
  config: AppConfig,
  isUpdate: boolean,
): Promise<AssetEntry> => {
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
    const stored = localStorage.getItem(ASSET_STORAGE_KEY);
    let current: AssetEntry[] = stored ? JSON.parse(stored) : [];

    if (isUpdate) {
      current = current.map((e) => (e.id === entryWithId.id ? entryWithId : e));
    } else {
      current = [entryWithId, ...current];
    }

    localStorage.setItem(ASSET_STORAGE_KEY, JSON.stringify(current));
  } else {
    if (!config.gasDeploymentUrl) throw new Error("GAS URL not configured");
    await postToGas(config.gasDeploymentUrl, {
      action: isUpdate ? "update" : "create",
      module: "assets",
      entry: entryWithId,
      token: config.apiToken,
    });
  }

  return entryWithId;
};

export const deleteAsset = async (
  id: string,
  config: AppConfig,
): Promise<void> => {
  if (config.mode === "DEMO") {
    await new Promise((resolve) => setTimeout(resolve, 50));
    const stored = localStorage.getItem(ASSET_STORAGE_KEY);
    let current: AssetEntry[] = stored ? JSON.parse(stored) : [];
    current = current.filter((e) => e.id !== id);
    localStorage.setItem(ASSET_STORAGE_KEY, JSON.stringify(current));
  } else {
    if (!config.gasDeploymentUrl) throw new Error("GAS URL not configured");
    await postToGas(config.gasDeploymentUrl, {
      action: "delete",
      module: "assets",
      entry: { id },
      token: config.apiToken,
    });
  }
};
