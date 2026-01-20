import { useState, useCallback, useEffect } from "react";
import { LifeConstraintEntry, AppConfig } from "../types";
import {
  fetchLifeConstraints,
  saveLifeConstraint,
  deleteLifeConstraint,
} from "../services/lifeService";

export const useLifeOps = (
  config: AppConfig,
  showToast: (msg: string, type: "success" | "error" | "info") => void,
) => {
  const [constraints, setConstraints] = useState<LifeConstraintEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadConstraints = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchLifeConstraints(config);
      setConstraints(data);
    } catch (err) {
      showToast("Failed to load life constraints", "error");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [config, showToast]);

  useEffect(() => {
    loadConstraints();
  }, [loadConstraints]);

  const handleSaveConstraint = async (
    entry: LifeConstraintEntry,
    isUpdate: boolean,
  ) => {
    try {
      const saved = await saveLifeConstraint(entry, config, isUpdate);
      setConstraints((prev) => {
        if (isUpdate) {
          return prev.map((c) => (c.id === saved.id ? saved : c));
        }
        return [saved, ...prev];
      });
      showToast(
        isUpdate ? "Constraint updated" : "Constraint added",
        "success",
      );
      return true;
    } catch (err) {
      showToast("Failed to save life constraint", "error");
      console.error(err);
      return false;
    }
  };

  const handleDeleteConstraint = async (id: string) => {
    try {
      await deleteLifeConstraint(id, config);
      setConstraints((prev) => prev.filter((c) => c.id !== id));
      showToast("Constraint removed", "success");
      return true;
    } catch (err) {
      showToast("Failed to delete constraint", "error");
      console.error(err);
      return false;
    }
  };

  return {
    constraints,
    isLoading,
    saveConstraint: handleSaveConstraint,
    deleteConstraint: handleDeleteConstraint,
    refreshConstraints: loadConstraints,
  };
};
