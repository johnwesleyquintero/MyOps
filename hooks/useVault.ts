import { useState, useEffect, useCallback } from "react";
import { VaultEntry, AppConfig } from "../types";
import { vaultService } from "../services/vaultService";

export const useVault = (
  config: AppConfig,
  showToast: (msg: string, type: "success" | "error") => void,
) => {
  const [vaultEntries, setVaultEntries] = useState<VaultEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadVault = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await vaultService.getEntries(config);
      setVaultEntries(data);
    } catch {
      showToast("Failed to load vault", "error");
    } finally {
      setIsLoading(false);
    }
  }, [config, showToast]);

  useEffect(() => {
    loadVault();
  }, [loadVault]);

  const saveVaultEntry = async (entry: VaultEntry, isUpdate: boolean) => {
    try {
      const success = await vaultService.saveEntry(entry, isUpdate, config);
      if (success) {
        await loadVault();
        showToast(isUpdate ? "Vault updated" : "Entry secured", "success");
        return true;
      }
    } catch {
      showToast("Failed to save to vault", "error");
    }
    return false;
  };

  const deleteVaultEntry = async (id: string) => {
    try {
      const success = await vaultService.deleteEntry(id, config);
      if (success) {
        await loadVault();
        showToast("Entry removed from vault", "success");
        return true;
      }
    } catch {
      showToast("Failed to delete vault entry", "error");
    }
    return false;
  };

  return {
    vaultEntries,
    isLoading,
    saveVaultEntry,
    deleteVaultEntry,
    refreshVault: loadVault,
  };
};
