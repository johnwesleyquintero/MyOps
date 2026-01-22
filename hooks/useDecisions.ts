import { useState, useEffect, useCallback, useMemo } from "react";
import { DecisionEntry, AppConfig } from "../types";
import {
  fetchDecisions,
  addDecision,
  updateDecision,
  deleteDecision as deleteDecisionService,
} from "../services/strategyService";
import { toast } from "sonner";

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

  const saveDecision = useCallback(
    async (entry: DecisionEntry) => {
      try {
        if (entry.id) {
          await updateDecision(entry, config);
          toast.success("Decision updated");
        } else {
          await addDecision(entry, config);
          toast.success("Decision logged");
        }
        await load();
      } catch (error) {
        console.error("Failed to save decision", error);
        toast.error("Failed to save decision");
        throw error;
      }
    },
    [config, load],
  );

  const deleteDecision = useCallback(
    async (id: string) => {
      try {
        await deleteDecisionService(id, config);
        await load();
        toast.success("Decision deleted");
      } catch (error) {
        console.error("Failed to delete decision", error);
        toast.error("Failed to delete decision");
        throw error;
      }
    },
    [config, load],
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
