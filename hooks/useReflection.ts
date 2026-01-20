import { useState, useCallback, useEffect } from "react";
import { ReflectionEntry, AppConfig } from "../types";
import {
  fetchReflections,
  saveReflection,
  deleteReflection,
} from "../services/reflectionService";
import { integrationService } from "../services/integrationService";

export const useReflection = (
  config: AppConfig,
  showToast: (msg: string, type: "success" | "error" | "info") => void,
) => {
  const [reflections, setReflections] = useState<ReflectionEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadReflections = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchReflections(config);
      setReflections(data);
    } catch (err) {
      showToast("Failed to load reflections", "error");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [config, showToast]);

  useEffect(() => {
    loadReflections();
  }, [loadReflections]);

  const handleSaveReflection = async (
    entry: ReflectionEntry,
    isUpdate: boolean,
  ) => {
    try {
      const saved = await saveReflection(entry, config, isUpdate);
      setReflections((prev) => {
        if (isUpdate) {
          return prev.map((r) => (r.id === saved.id ? saved : r));
        }
        return [saved, ...prev];
      });
      showToast(
        isUpdate ? "Reflection archived" : "Reflection captured",
        "success",
      );
      if (!isUpdate) {
        integrationService.sendUpdate("reflection_logged", saved, config);
      }
      return true;
    } catch (err) {
      showToast("Failed to save reflection", "error");
      console.error(err);
      return false;
    }
  };

  const handleDeleteReflection = async (id: string) => {
    try {
      await deleteReflection(id, config);
      setReflections((prev) => prev.filter((r) => r.id !== id));
      showToast("Reflection deleted", "success");
      return true;
    } catch (err) {
      showToast("Failed to delete reflection", "error");
      console.error(err);
      return false;
    }
  };

  return {
    reflections,
    isLoading,
    saveReflection: handleSaveReflection,
    deleteReflection: handleDeleteReflection,
    refreshReflections: loadReflections,
  };
};
