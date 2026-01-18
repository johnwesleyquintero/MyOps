import { useState, useEffect, useCallback } from "react";
import { DecisionEntry, AppConfig } from "../types";
import { fetchDecisions } from "../services/strategyService";

export const useDecisions = (config: AppConfig) => {
  const [decisions, setDecisions] = useState<DecisionEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchDecisions(config);
      setDecisions(data);
    } catch (e) {
      console.error("Failed to load decisions", e);
    } finally {
      setIsLoading(false);
    }
  }, [config]);

  useEffect(() => {
    load();
  }, [load]);

  return { decisions, isLoading, reload: load };
};
