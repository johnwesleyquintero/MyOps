import { TaskEntry, AppConfig } from "../types";
import { LOCAL_STORAGE_KEY } from "@/constants";
import { getMockData } from "./mockFactory";
import { storage } from "../utils/storageUtils";
import { executeServiceAction } from "./baseService";

export const fetchTasks = async (config: AppConfig): Promise<TaskEntry[]> => {
  return executeServiceAction({
    module: "tasks",
    config,
    actionName: "fetch",
    demoLogic: () => {
      const stored = storage.get<TaskEntry[] | null>(LOCAL_STORAGE_KEY, null);
      if (!stored) {
        const initialData = getMockData();
        storage.set(LOCAL_STORAGE_KEY, initialData);
        return initialData;
      }
      return stored;
    },
  });
};

export const addTask = async (
  entry: TaskEntry,
  config: AppConfig,
): Promise<TaskEntry> => {
  const entryWithId = { ...entry, id: entry.id || crypto.randomUUID() };

  return executeServiceAction({
    module: "tasks",
    config,
    actionName: "create",
    entry: entryWithId,
    demoLogic: () => {
      const current = storage.get<TaskEntry[]>(LOCAL_STORAGE_KEY, []);
      storage.set(LOCAL_STORAGE_KEY, [entryWithId, ...current]);
      return entryWithId;
    },
  });
};

export const updateTask = async (
  entry: TaskEntry,
  config: AppConfig,
): Promise<void> => {
  return executeServiceAction({
    module: "tasks",
    config,
    actionName: "update",
    entry,
    demoLogic: () => {
      let current = storage.get<TaskEntry[]>(LOCAL_STORAGE_KEY, []);
      current = current.map((e) => (e.id === entry.id ? entry : e));
      storage.set(LOCAL_STORAGE_KEY, current);
    },
  });
};

export const deleteTask = async (
  entryOrId: string | TaskEntry,
  config: AppConfig,
): Promise<void> => {
  const id = typeof entryOrId === "string" ? entryOrId : entryOrId.id;
  const entry =
    typeof entryOrId === "string" ? ({ id } as TaskEntry) : entryOrId;

  return executeServiceAction({
    module: "tasks",
    config,
    actionName: "delete",
    entry,
    demoLogic: () => {
      let current = storage.get<TaskEntry[]>(LOCAL_STORAGE_KEY, []);
      current = current.filter((e) => e.id !== id);
      storage.set(LOCAL_STORAGE_KEY, current);
    },
  });
};
