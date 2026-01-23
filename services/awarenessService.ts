import { MentalStateEntry, AppConfig } from "../types";
import { storage } from "../utils/storageUtils";
import { executeServiceAction } from "./baseService";

const LOCAL_STORAGE_KEY = "myops_mental_state";

export const fetchMentalStates = async (
  config: AppConfig,
): Promise<MentalStateEntry[]> => {
  return executeServiceAction({
    module: "awareness",
    config,
    actionName: "fetch",
    demoLogic: () => storage.get<MentalStateEntry[]>(LOCAL_STORAGE_KEY, []),
  });
};

export const saveMentalState = async (
  entry: MentalStateEntry,
  config: AppConfig,
): Promise<MentalStateEntry> => {
  const entryWithId = { ...entry, id: entry.id || crypto.randomUUID() };

  return executeServiceAction({
    module: "awareness",
    config,
    actionName: "create", // The GAS side usually handles update-if-exists for daily logs
    entry: entryWithId,
    demoLogic: () => {
      const current = storage.get<MentalStateEntry[]>(LOCAL_STORAGE_KEY, []);

      // 1 per day constraint
      const existingIndex = current.findIndex((e) => e.date === entry.date);
      let updated: MentalStateEntry[];
      if (existingIndex >= 0) {
        updated = [...current];
        updated[existingIndex] = entryWithId;
      } else {
        updated = [entryWithId, ...current];
      }

      storage.set(LOCAL_STORAGE_KEY, updated);
      return entryWithId;
    },
  });
};
