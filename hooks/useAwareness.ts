import { useState, useEffect, useCallback, useMemo } from "react";
import { MentalStateEntry, AppConfig } from "../types";
import {
  fetchMentalStates,
  saveMentalState as saveMentalStateService,
} from "../services/awarenessService";

export const useAwareness = (config: AppConfig) => {
  const [mentalStates, setMentalStates] = useState<MentalStateEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchMentalStates(config);
      setMentalStates(data);
    } catch (e) {
      console.error("Failed to load mental states", e);
    } finally {
      setIsLoading(false);
    }
  }, [config]);

  useEffect(() => {
    load();
  }, [load]);

  const saveMentalState = useCallback(
    async (entry: MentalStateEntry) => {
      try {
        const saved = await saveMentalStateService(entry, config);
        setMentalStates((prev) => {
          const filtered = prev.filter((e) => e.date !== saved.date);
          return [saved, ...filtered];
        });
        return saved;
      } catch (e) {
        console.error("Failed to save mental state", e);
        throw e;
      }
    },
    [config],
  );

  return useMemo(
    () => ({ mentalStates, isLoading, reload: load, saveMentalState }),
    [mentalStates, isLoading, load, saveMentalState],
  );
};
