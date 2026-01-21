import React, { useState, useMemo, useCallback } from "react";
import { AssetEntry } from "../../types";
import { Icon } from "../Icons";
import { ViewHeader } from "../ViewHeader";
import { AssetModal } from "../AssetModal";
import { MODULE_COLORS } from "@/constants";
import { Button } from "../ui";
import { AssetCard } from "../AssetCard";

interface AssetsViewProps {
  assets: AssetEntry[];
  isLoading: boolean;
  onSave: (asset: AssetEntry, isUpdate: boolean) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
}

export const AssetsView: React.FC<AssetsViewProps> = ({
  assets,
  isLoading,
  onSave,
  onDelete,
}) => {
  const [filter, setFilter] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<AssetEntry | null>(null);

  const colors = MODULE_COLORS.assets;

  const handleCreate = useCallback(() => {
    setEditingAsset(null);
    setIsModalOpen(true);
  }, []);

  const handleEdit = useCallback((asset: AssetEntry) => {
    setEditingAsset(asset);
    setIsModalOpen(true);
  }, []);

  const filteredAssets = useMemo(() => {
    return assets.filter(
      (a) =>
        a.title.toLowerCase().includes(filter.toLowerCase()) ||
        a.type.toLowerCase().includes(filter.toLowerCase()),
    );
  }, [assets, filter]);

  const handleDeleteClick = useCallback(
    async (assetId: string): Promise<boolean> => {
      try {
        const success = await onDelete(assetId);
        if (!success) {
          console.error("Failed to delete asset.");
        }
        return success;
      } catch (error) {
        console.error("Error deleting asset:", error);
        return false;
      }
    },
    [onDelete],
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <ViewHeader
        title="Asset & IP Registry"
        subTitle="Catalog and track your digital frameworks and SOPs"
      >
        <div className="flex items-center gap-3">
          <div className="relative group">
            <Icon.Search
              className={`absolute left-3 top-1/2 -translate-y-1/2 text-notion-light-muted dark:text-notion-dark-muted group-focus-within:${colors.text} transition-colors`}
              size={14}
            />
            <input
              type="text"
              placeholder="Search assets..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className={`pl-9 pr-4 py-2 bg-notion-light-sidebar dark:bg-notion-dark-sidebar border border-notion-light-border dark:border-notion-dark-border rounded-xl text-xs focus:outline-none focus:ring-1 focus:${colors.border} transition-all w-64`}
            />
          </div>
          <Button
            variant="custom"
            className={`flex items-center gap-2 px-4 py-2 ${colors.bg.replace("/10", "").replace("/20", "")} text-white border ${colors.border} rounded-xl text-[10px] font-bold uppercase tracking-widest hover:opacity-90 transition-all active:scale-95 group`}
            onClick={handleCreate}
          >
            <Icon.Add
              size={14}
              className="group-hover:rotate-90 transition-transform duration-300"
            />
            New Asset
          </Button>
        </div>
      </ViewHeader>

      <AssetModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={onSave}
        initialData={editingAsset}
      />

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className={`h-48 ${colors.lightBg} animate-pulse rounded-2xl border ${colors.border}`}
            ></div>
          ))}
        </div>
      ) : filteredAssets.length === 0 ? (
        <div
          className={`flex flex-col items-center justify-center py-20 ${colors.lightBg} rounded-3xl border border-dashed ${colors.border}`}
        >
          <div
            className={`w-16 h-16 ${colors.bg} rounded-2xl flex items-center justify-center mb-4 shadow-sm border ${colors.border}`}
          >
            <Icon.Project size={32} className={`${colors.text} opacity-20`} />
          </div>
          <h3 className={`text-sm font-bold ${colors.text}`}>
            No assets found
          </h3>
          <p className="text-xs text-notion-light-muted dark:text-notion-dark-muted mt-1">
            Start cataloging your frameworks and code snippets.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAssets.map((asset) => (
            <AssetCard
              key={asset.id}
              asset={asset}
              colors={colors}
              onEdit={handleEdit}
              onDelete={handleDeleteClick}
            />
          ))}
        </div>
      )}
    </div>
  );
};
