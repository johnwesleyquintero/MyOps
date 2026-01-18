import { useState, useEffect, useCallback } from "react";
import { Automation, AppConfig } from "../types";
import { automationService } from "../services/automationService";

export const useAutomation = (
  config: AppConfig,
  showToast: (msg: string, type: "success" | "error" | "info") => void,
) => {
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadAutomations = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await automationService.getAutomations(config);
      setAutomations(data);
    } catch {
      showToast("Failed to load automations", "error");
    } finally {
      setIsLoading(false);
    }
  }, [config, showToast]);

  useEffect(() => {
    loadAutomations();
  }, [config.mode, loadAutomations]);

  const saveAutomation = async (automation: Automation, isUpdate: boolean) => {
    try {
      const success = await automationService.saveAutomation(
        automation,
        isUpdate,
        config,
      );
      if (success) {
        await loadAutomations();
        showToast(
          isUpdate ? "Automation updated" : "Trigger established",
          "success",
        );
        return true;
      }
    } catch {
      showToast("Failed to save automation", "error");
    }
    return false;
  };

  const deleteAutomation = async (id: string) => {
    try {
      const success = await automationService.deleteAutomation(id, config);
      if (success) {
        await loadAutomations();
        showToast("Automation decommissioned", "success");
        return true;
      }
    } catch {
      showToast("Failed to delete automation", "error");
    }
    return false;
  };

  const toggleAutomation = async (id: string) => {
    const automation = automations.find((a) => a.id === id);
    if (!automation) return false;

    const updated: Automation = {
      ...automation,
      status: automation.status === "Active" ? "Inactive" : "Active",
    };

    return saveAutomation(updated, true);
  };

  return {
    automations,
    isLoading,
    saveAutomation,
    deleteAutomation,
    toggleAutomation,
    refreshAutomations: loadAutomations,
  };
};
