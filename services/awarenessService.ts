import { MentalStateEntry, AppConfig } from "../types";
import { fetchFromGas, postToGas } from "../utils/gasUtils";

const LOCAL_STORAGE_KEY = "myops_mental_state";

export const fetchMentalStates = async (
  config: AppConfig,
): Promise<MentalStateEntry[]> => {
  if (config.mode === "DEMO") {
    await new Promise((resolve) => setTimeout(resolve, 50));
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } else {
    return fetchFromGas<MentalStateEntry>(config, "awareness");
  }
};

export const saveMentalState = async (
  entry: MentalStateEntry,
  config: AppConfig,
): Promise<MentalStateEntry> => {
  const entryWithId = { ...entry, id: entry.id || crypto.randomUUID() };

  if (config.mode === "DEMO") {
    await new Promise((resolve) => setTimeout(resolve, 50));
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    const current: MentalStateEntry[] = stored ? JSON.parse(stored) : [];

    // 1 per day constraint
    const existingIndex = current.findIndex((e) => e.date === entry.date);
    let updated: MentalStateEntry[];
    if (existingIndex >= 0) {
      updated = [...current];
      updated[existingIndex] = entryWithId;
    } else {
      updated = [entryWithId, ...current];
    }

    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  } else {
    if (!config.gasDeploymentUrl) throw new Error("GAS URL not configured");
    await postToGas(config.gasDeploymentUrl, {
      action: "create", // The GAS side usually handles update-if-exists for daily logs
      module: "awareness",
      entry: entryWithId,
      token: config.apiToken,
    });
  }

  return entryWithId;
};
