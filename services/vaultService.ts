import { VaultEntry, AppConfig } from "../types";
import { VAULT_CACHE_KEY } from "@/constants";
import { encrypt, decrypt } from "../utils/cryptoUtils";
import { fetchFromGas, postToGas } from "../utils/gasUtils";

export const vaultService = {
  getEntries: async (config: AppConfig): Promise<VaultEntry[]> => {
    let entries: VaultEntry[] = [];

    if (config.mode === "DEMO") {
      const cached = localStorage.getItem(VAULT_CACHE_KEY);
      if (cached) {
        entries = JSON.parse(cached);
      } else {
        entries = [
          {
            id: "v1",
            label: "Gemini API Key",
            category: "API Key",
            value: await encrypt(
              "AIzaSy-MOCK-KEY-12345",
              config.apiToken || "demo-key",
            ),
            createdAt: new Date().toISOString(),
          },
          {
            id: "v2",
            label: "AWS Access Token",
            category: "Token",
            value: await encrypt(
              "AKIA-MOCK-TOKEN-67890",
              config.apiToken || "demo-key",
            ),
            createdAt: new Date().toISOString(),
          },
        ];
        localStorage.setItem(VAULT_CACHE_KEY, JSON.stringify(entries));
      }
    } else {
      entries = await fetchFromGas<VaultEntry>(config, "vault");
    }

    // Decrypt values for the UI (the UI should handle masking)
    return Promise.all(
      entries.map(async (e) => ({
        ...e,
        value: await decrypt(e.value, config.apiToken || "demo-key"),
      })),
    );
  },

  saveEntry: async (
    entry: VaultEntry,
    isUpdate: boolean,
    config: AppConfig,
  ): Promise<boolean> => {
    // Re-encrypt the incoming plain value for storage
    const entryToStore = {
      ...entry,
      value: await encrypt(entry.value, config.apiToken || "demo-key"),
    };

    if (config.mode === "DEMO") {
      let updated;
      if (isUpdate) {
        // Need to read the raw storage to update correctly without double-decrypting/encrypting
        const rawCached = localStorage.getItem(VAULT_CACHE_KEY);
        const rawEntries: VaultEntry[] = rawCached ? JSON.parse(rawCached) : [];
        updated = rawEntries.map((e) =>
          e.id === entryToStore.id ? entryToStore : e,
        );
      } else {
        const rawCached = localStorage.getItem(VAULT_CACHE_KEY);
        const rawEntries: VaultEntry[] = rawCached ? JSON.parse(rawCached) : [];
        updated = [
          ...rawEntries,
          {
            ...entryToStore,
            id: entryToStore.id || Math.random().toString(36).substr(2, 9),
            createdAt: new Date().toISOString(),
          },
        ];
      }
      localStorage.setItem(VAULT_CACHE_KEY, JSON.stringify(updated));
      return true;
    }

    if (!config.gasDeploymentUrl) return false;
    await postToGas(config.gasDeploymentUrl, {
      action: isUpdate ? "update" : "create",
      module: "vault",
      entry: entryToStore,
      token: config.apiToken,
    });
    return true;
  },

  deleteEntry: async (id: string, config: AppConfig): Promise<boolean> => {
    if (config.mode === "DEMO") {
      const rawCached = localStorage.getItem(VAULT_CACHE_KEY);
      const rawEntries: VaultEntry[] = rawCached ? JSON.parse(rawCached) : [];
      const updated = rawEntries.filter((e) => e.id !== id);
      localStorage.setItem(VAULT_CACHE_KEY, JSON.stringify(updated));
      return true;
    }

    if (!config.gasDeploymentUrl) return false;
    await postToGas(config.gasDeploymentUrl, {
      action: "delete",
      module: "vault",
      entry: { id },
      token: config.apiToken,
    });
    return true;
  },
};
