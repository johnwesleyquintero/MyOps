import { useState, useEffect, useCallback } from "react";
import { MentalStateEntry, AppConfig } from "../types";
import { fetchMentalStates } from "../services/awarenessService";

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

  return { mentalStates, isLoading, reload: load };
};
