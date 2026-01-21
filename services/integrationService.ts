import {
  Integration,
  AppConfig,
  IntegrationEvent,
  TaskEntry,
  ReflectionEntry,
} from "../types";
import { INTEGRATION_CACHE_KEY } from "@/constants";
import { fetchFromGas, postToGas } from "../utils/gasUtils";

export const integrationService = {
  getIntegrations: async (config: AppConfig): Promise<Integration[]> => {
    if (config.mode === "DEMO") {
      const cached = localStorage.getItem(INTEGRATION_CACHE_KEY);
      if (cached) return JSON.parse(cached);

      const defaultIntegrations: Integration[] = [
        {
          id: "int-1",
          name: "Slack Ops Channel",
          type: "Slack",
          url: "https://hooks.slack.com/services/...",
          isEnabled: true,
          events: ["task_completed", "milestone_reached"],
          lastTested: new Date().toISOString(),
        },
        {
          id: "int-2",
          name: "Client WhatsApp",
          type: "WhatsApp",
          url: "https://api.whatsapp.com/send?phone=...",
          isEnabled: false,
          events: ["task_created"],
        },
        {
          id: "int-3",
          name: "Daily Digest Email",
          type: "Email",
          url: "client@example.com",
          isEnabled: true,
          events: ["reflection_logged"],
        },
      ];
      localStorage.setItem(
        INTEGRATION_CACHE_KEY,
        JSON.stringify(defaultIntegrations),
      );
      return defaultIntegrations;
    }

    return fetchFromGas<Integration>(config, "integrations");
  },

  saveIntegration: async (
    integration: Integration,
    isUpdate: boolean,
    config: AppConfig,
  ): Promise<boolean> => {
    if (config.mode === "DEMO") {
      const integrations = await integrationService.getIntegrations(config);
      let updated;
      if (isUpdate) {
        updated = integrations.map((i) =>
          i.id === integration.id ? integration : i,
        );
      } else {
        updated = [
          ...integrations,
          {
            ...integration,
            id:
              integration.id ||
              `int-${Math.random().toString(36).substr(2, 9)}`,
          },
        ];
      }
      localStorage.setItem(INTEGRATION_CACHE_KEY, JSON.stringify(updated));
      return true;
    }

    if (!config.gasDeploymentUrl) return false;
    await postToGas(config.gasDeploymentUrl, {
      action: isUpdate ? "update" : "create",
      module: "integrations",
      entry: integration,
      token: config.apiToken,
    });
    return true;
  },

  deleteIntegration: async (
    id: string,
    config: AppConfig,
  ): Promise<boolean> => {
    if (config.mode === "DEMO") {
      const integrations = await integrationService.getIntegrations(config);
      const updated = integrations.filter((i) => i.id !== id);
      localStorage.setItem(INTEGRATION_CACHE_KEY, JSON.stringify(updated));
      return true;
    }

    if (!config.gasDeploymentUrl) return false;
    await postToGas(config.gasDeploymentUrl, {
      action: "delete",
      module: "integrations",
      entry: { id },
      token: config.apiToken,
    });
    return true;
  },

  testConnection: async (): Promise<boolean> => {
    // In a real app, this would ping the webhook/API
    // For now, we'll simulate a success
    return new Promise((resolve) => setTimeout(() => resolve(true), 1500));
  },

  sendUpdate: async (
    event: IntegrationEvent,
    payload: TaskEntry | ReflectionEntry | Record<string, unknown>,
    config: AppConfig,
  ): Promise<void> => {
    const integrations = await integrationService.getIntegrations(config);
    const activeIntegrations = integrations.filter(
      (i) => i.isEnabled && i.events.includes(event),
    );

    for (const integration of activeIntegrations) {
      // In production, this would call the actual webhook
      if (config.mode === "LIVE" && config.gasDeploymentUrl) {
        await postToGas(config.gasDeploymentUrl, {
          action: "trigger_integration",
          integrationId: integration.id,
          event,
          payload,
          token: config.apiToken,
        });
      }
    }
  },
};
