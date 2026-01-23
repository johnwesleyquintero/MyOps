import { TaskEntry, AppConfig } from "../types";
import { LOCAL_STORAGE_KEY } from "@/constants";
import { getMockData } from "./mockFactory";
import { fetchFromGas, postToGas } from "../utils/gasUtils";
import { storage } from "../utils/storageUtils";

export const fetchTasks = async (config: AppConfig): Promise<TaskEntry[]> => {
  if (config.mode === "DEMO") {
    // Minimal delay for responsiveness check
    await new Promise((resolve) => setTimeout(resolve, 50));
    const stored = storage.get<TaskEntry[] | null>(LOCAL_STORAGE_KEY, null);
    if (!stored) {
      const initialData = getMockData();
      storage.set(LOCAL_STORAGE_KEY, initialData);
      return initialData;
    }
    return stored;
  } else {
    return fetchFromGas<TaskEntry>(config, "tasks");
  }
};

export const addTask = async (
  entry: TaskEntry,
  config: AppConfig,
): Promise<TaskEntry> => {
  const entryWithId = { ...entry, id: entry.id || crypto.randomUUID() };

  if (config.mode === "DEMO") {
    await new Promise((resolve) => setTimeout(resolve, 50));
    const current = storage.get<TaskEntry[]>(LOCAL_STORAGE_KEY, []);
    storage.set(LOCAL_STORAGE_KEY, [entryWithId, ...current]);
  } else {
    if (!config.gasDeploymentUrl) throw new Error("GAS URL not configured");
    await postToGas(config.gasDeploymentUrl, {
      action: "create",
      module: "tasks",
      entry: entryWithId,
      token: config.apiToken,
    });
  }

  return entryWithId;
};

export const updateTask = async (
  entry: TaskEntry,
  config: AppConfig,
): Promise<void> => {
  if (config.mode === "DEMO") {
    await new Promise((resolve) => setTimeout(resolve, 50));
    let current = storage.get<TaskEntry[]>(LOCAL_STORAGE_KEY, []);
    current = current.map((e) => (e.id === entry.id ? entry : e));
    storage.set(LOCAL_STORAGE_KEY, current);
  } else {
    if (!config.gasDeploymentUrl) throw new Error("GAS URL not configured");
    await postToGas(config.gasDeploymentUrl, {
      action: "update",
      module: "tasks",
      entry,
      token: config.apiToken,
    });
  }
};

export const deleteTask = async (
  entryOrId: string | TaskEntry,
  config: AppConfig,
): Promise<void> => {
  const id = typeof entryOrId === "string" ? entryOrId : entryOrId.id;
  const entry =
    typeof entryOrId === "string" ? ({ id } as TaskEntry) : entryOrId;

  if (config.mode === "DEMO") {
    await new Promise((resolve) => setTimeout(resolve, 50));
    let current = storage.get<TaskEntry[]>(LOCAL_STORAGE_KEY, []);
    current = current.filter((e) => e.id !== id);
    storage.set(LOCAL_STORAGE_KEY, current);
  } else {
    if (!config.gasDeploymentUrl) throw new Error("GAS URL not configured");
    await postToGas(config.gasDeploymentUrl, {
      action: "delete",
      module: "tasks",
      entry,
      token: config.apiToken,
    });
  }
};
