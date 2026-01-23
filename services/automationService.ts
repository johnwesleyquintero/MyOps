import { Automation, AppConfig } from "../types";
import { AUTOMATION_CACHE_KEY } from "@/constants";
import { fetchFromGas, postToGas } from "../utils/gasUtils";
import { storage } from "../utils/storageUtils";

export const automationService = {
  getAutomations: async (config: AppConfig): Promise<Automation[]> => {
    if (config.mode === "DEMO") {
      const cached = storage.get<Automation[] | null>(
        AUTOMATION_CACHE_KEY,
        null,
      );
      if (cached) return cached;

      const defaultAutomations: Automation[] = [
        {
          id: "a1",
          name: "Daily Snapshot",
          trigger: "Daily @ 00:00",
          action: "Create Manual Snapshot",
          status: "Active",
        },
        {
          id: "a2",
          name: "Lead to Task",
          trigger: "New CRM Lead",
          action: "Create Follow-up Task",
          status: "Active",
        },
        {
          id: "a3",
          name: "Artifact Reward",
          trigger: "5 Tasks Done",
          action: "Award Random Artifact",
          status: "Active",
        },
      ];
      storage.set(AUTOMATION_CACHE_KEY, defaultAutomations);
      return defaultAutomations;
    }

    return fetchFromGas<Automation>(config, "automations");
  },

  saveAutomation: async (
    automation: Automation,
    isUpdate: boolean,
    config: AppConfig,
  ): Promise<boolean> => {
    if (config.mode === "DEMO") {
      const automations = await automationService.getAutomations(config);
      let updated;
      if (isUpdate) {
        updated = automations.map((a) =>
          a.id === automation.id ? automation : a,
        );
      } else {
        updated = [
          ...automations,
          {
            ...automation,
            id: automation.id || Math.random().toString(36).substr(2, 9),
          },
        ];
      }
      storage.set(AUTOMATION_CACHE_KEY, updated);
      return true;
    }

    if (!config.gasDeploymentUrl) return false;
    await postToGas(config.gasDeploymentUrl, {
      action: isUpdate ? "update" : "create",
      module: "automations",
      entry: automation,
      token: config.apiToken,
    });
    return true;
  },

  deleteAutomation: async (id: string, config: AppConfig): Promise<boolean> => {
    if (config.mode === "DEMO") {
      const automations = await automationService.getAutomations(config);
      const updated = automations.filter((a) => a.id !== id);
      storage.set(AUTOMATION_CACHE_KEY, updated);
      return true;
    }

    if (!config.gasDeploymentUrl) return false;
    await postToGas(config.gasDeploymentUrl, {
      action: "delete",
      module: "automations",
      entry: { id },
      token: config.apiToken,
    });
    return true;
  },
};
