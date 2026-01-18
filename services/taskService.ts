import { TaskEntry, AppConfig } from "../types";
import { LOCAL_STORAGE_KEY } from "@/constants";
import { getMockData } from "./mockFactory";
import { fetchFromGas, postToGas } from "../utils/gasUtils";

export const fetchTasks = async (config: AppConfig): Promise<TaskEntry[]> => {
  if (config.mode === "DEMO") {
    // Minimal delay for responsiveness check
    await new Promise((resolve) => setTimeout(resolve, 50));
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!stored) {
      const initialData = getMockData();
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(initialData));
      return initialData;
    }
    return JSON.parse(stored);
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
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    let current: TaskEntry[] = stored ? JSON.parse(stored) : [];
    current = current.map((e) => (e.id === entry.id ? entry : e));
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(current));
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
  entry: TaskEntry,
  config: AppConfig,
): Promise<void> => {
  if (config.mode === "DEMO") {
    await new Promise((resolve) => setTimeout(resolve, 50));
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    let current: TaskEntry[] = stored ? JSON.parse(stored) : [];
    current = current.filter((e) => e.id !== entry.id);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(current));
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
