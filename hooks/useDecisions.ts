import { useState, useEffect, useCallback, useMemo } from "react";
import { DecisionEntry, AppConfig } from "../types";
import {
  fetchDecisions,
  addDecision,
  updateDecision,
  deleteDecision as deleteDecisionService,
} from "../services/strategyService";

export const useDecisions = (
  config: AppConfig,
  showToast: (msg: string, type: "success" | "error" | "info") => void,
) => {
  const [decisions, setDecisions] = useState<DecisionEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchDecisions(config);
      setDecisions(data);
    } catch (e) {
      console.error("Failed to load decisions", e);
      showToast("Failed to load decisions", "error");
    } finally {
      setIsLoading(false);
    }
  }, [config, showToast]);

  useEffect(() => {
    load();
  }, [load]);

  const saveDecision = useCallback(
    async (entry: DecisionEntry) => {
      try {
        if (entry.id) {
          const updated = await updateDecision(entry, config);
          setDecisions((prev) =>
            prev.map((d) => (d.id === updated.id ? updated : d)),
          );
          showToast("Decision updated", "success");
          return updated;
        } else {
          const created = await addDecision(entry, config);
          setDecisions((prev) => [created, ...prev]);
          showToast("Decision logged", "success");
          return created;
        }
      } catch (error) {
        console.error("Failed to save decision", error);
        showToast("Failed to save decision", "error");
        throw error;
      }
    },
    [config, showToast],
  );

  const deleteDecision = useCallback(
    async (id: string) => {
      try {
        await deleteDecisionService(id, config);
        setDecisions((prev) => prev.filter((d) => d.id !== id));
        showToast("Decision deleted", "success");
      } catch (error) {
        console.error("Failed to delete decision", error);
        showToast("Failed to delete decision", "error");
        throw error;
      }
    },
    [config, showToast],
  );

  return useMemo(
    () => ({
      decisions,
      isLoading,
      reload: load,
      saveDecision,
      deleteDecision,
    }),
    [decisions, isLoading, load, saveDecision, deleteDecision],
  );
};
