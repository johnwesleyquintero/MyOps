import { useState, useEffect, useCallback } from "react";
import { Integration, AppConfig } from "../types";
import { integrationService } from "../services/integrationService";

export const useIntegrations = (
  config: AppConfig,
  showToast: (message: string, type: "success" | "error" | "info") => void,
) => {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadIntegrations = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await integrationService.getIntegrations(config);
      setIntegrations(data);
    } catch {
      showToast("Failed to load integrations", "error");
    } finally {
      setIsLoading(false);
    }
  }, [config, showToast]);

  useEffect(() => {
    loadIntegrations();
  }, [loadIntegrations]);

  const saveIntegration = async (
    integration: Integration,
    isUpdate: boolean,
  ) => {
    try {
      const success = await integrationService.saveIntegration(
        integration,
        isUpdate,
        config,
      );
      if (success) {
        showToast(
          isUpdate ? "Integration updated" : "Integration created",
          "success",
        );
        loadIntegrations();
        return true;
      }
    } catch {
      showToast("Failed to save integration", "error");
    }
    return false;
  };

  const deleteIntegration = async (id: string) => {
    try {
      const success = await integrationService.deleteIntegration(id, config);
      if (success) {
        showToast("Integration deleted", "success");
        loadIntegrations();
        return true;
      }
    } catch {
      showToast("Failed to delete integration", "error");
    }
    return false;
  };

  const toggleIntegration = async (id: string) => {
    const integration = integrations.find((i) => i.id === id);
    if (!integration) return false;

    const updated = { ...integration, isEnabled: !integration.isEnabled };
    return saveIntegration(updated, true);
  };

  const testConnection = async (id: string) => {
    const integration = integrations.find((i) => i.id === id);
    if (!integration) return false;

    showToast(`Testing connection to ${integration.name}...`, "info");
    try {
      const success = await integrationService.testConnection(integration);
      if (success) {
        const updated = {
          ...integration,
          lastTested: new Date().toISOString(),
        };
        await saveIntegration(updated, true);
        showToast("Connection successful!", "success");
        return true;
      } else {
        showToast("Connection failed", "error");
      }
    } catch {
      showToast("Connection test error", "error");
    }
    return false;
  };

  return {
    integrations,
    isLoading,
    saveIntegration,
    deleteIntegration,
    toggleIntegration,
    testConnection,
    refresh: loadIntegrations,
  };
};
