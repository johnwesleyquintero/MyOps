import { useState, useCallback, useEffect, useMemo } from "react";
import { AssetEntry, AppConfig } from "../types";
import { fetchAssets, saveAsset, deleteAsset } from "../services/assetService";

export const useAssets = (
  config: AppConfig,
  showToast: (msg: string, type: "success" | "error" | "info") => void,
) => {
  const [assets, setAssets] = useState<AssetEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadAssets = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchAssets(config);
      setAssets(data);
    } catch (err) {
      showToast("Failed to load assets", "error");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [config, showToast]);

  useEffect(() => {
    loadAssets();
  }, [loadAssets]);

  const handleSaveAsset = useCallback(
    async (entry: AssetEntry, isUpdate: boolean) => {
      try {
        const saved = await saveAsset(entry, config, isUpdate);
        setAssets((prev) => {
          if (isUpdate) {
            return prev.map((a) => (a.id === saved.id ? saved : a));
          }
          return [saved, ...prev];
        });
        showToast(isUpdate ? "Asset updated" : "Asset created", "success");
        return true;
      } catch (err) {
        showToast("Failed to save asset", "error");
        console.error(err);
        return false;
      }
    },
    [config, showToast],
  );

  const handleDeleteAsset = useCallback(
    async (id: string) => {
      try {
        await deleteAsset(id, config);
        setAssets((prev) => prev.filter((a) => a.id !== id));
        showToast("Asset deleted", "success");
        return true;
      } catch (err) {
        showToast("Failed to delete asset", "error");
        console.error(err);
        return false;
      }
    },
    [config, showToast],
  );

  return useMemo(
    () => ({
      assets,
      isLoading,
      saveAsset: handleSaveAsset,
      deleteAsset: handleDeleteAsset,
      refreshAssets: loadAssets,
    }),
    [assets, isLoading, handleSaveAsset, handleDeleteAsset, loadAssets],
  );
};
