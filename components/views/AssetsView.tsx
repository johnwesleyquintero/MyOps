import React, { useState } from "react";
import { AssetEntry } from "../../types";
import { Icon, iconProps } from "../Icons";
import { ViewHeader } from "../ViewHeader";
import { AssetModal } from "../AssetModal";

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

  const handleCreate = () => {
    setEditingAsset(null);
    setIsModalOpen(true);
  };

  const handleEdit = (asset: AssetEntry) => {
    setEditingAsset(asset);
    setIsModalOpen(true);
  };

  const filteredAssets = assets.filter(
    (a) =>
      a.title.toLowerCase().includes(filter.toLowerCase()) ||
      a.type.toLowerCase().includes(filter.toLowerCase()),
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <ViewHeader
        title="Asset & IP Registry"
        subTitle="Catalog and track your digital frameworks and SOPs"
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <Icon.Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-notion-light-muted dark:text-notion-dark-muted"
              size={14}
            />
            <input
              type="text"
              placeholder="Search assets..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="pl-9 pr-4 py-2 bg-notion-light-sidebar dark:bg-notion-dark-sidebar border border-notion-light-border dark:border-notion-dark-border rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-notion-light-text/20 transition-all w-64"
            />
          </div>
          <button
            className="flex items-center gap-2 px-4 py-2 bg-notion-light-text dark:bg-notion-dark-text text-notion-light-bg dark:text-notion-dark-bg rounded-xl text-[10px] font-bold uppercase tracking-widest hover:opacity-90 transition-all active:scale-95"
            onClick={handleCreate}
          >
            <Icon.Add size={14} />
            New Asset
          </button>
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
              className="h-48 bg-notion-light-sidebar dark:bg-notion-dark-sidebar animate-pulse rounded-2xl border border-notion-light-border dark:border-notion-dark-border"
            ></div>
          ))}
        </div>
      ) : filteredAssets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-notion-light-sidebar dark:bg-notion-dark-sidebar rounded-3xl border border-dashed border-notion-light-border dark:border-notion-dark-border">
          <div className="w-16 h-16 bg-notion-light-bg dark:bg-notion-dark-bg rounded-2xl flex items-center justify-center mb-4 shadow-sm">
            <Icon.Project size={32} className="opacity-20" />
          </div>
          <h3 className="text-sm font-bold text-notion-light-text dark:text-notion-dark-text">
            No assets found
          </h3>
          <p className="text-xs text-notion-light-muted dark:text-notion-dark-muted mt-1">
            Start cataloging your frameworks and code snippets.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAssets.map((asset) => (
            <div
              key={asset.id}
              className="group bg-notion-light-bg dark:bg-notion-dark-bg border border-notion-light-border dark:border-notion-dark-border rounded-2xl p-6 hover:shadow-xl transition-all duration-300 flex flex-col"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-lime-500/10 text-lime-600 dark:text-lime-400 flex items-center justify-center border border-lime-500/20">
                  <Icon.Project {...iconProps(20)} />
                </div>
                <div className="flex gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-notion-light-sidebar dark:bg-notion-dark-sidebar rounded-full uppercase tracking-wider border border-notion-light-border dark:border-notion-dark-border">
                    {asset.type}
                  </span>
                </div>
              </div>

              <h3 className="text-sm font-bold text-notion-light-text dark:text-notion-dark-text mb-2 group-hover:text-lime-600 dark:group-hover:text-lime-400 transition-colors">
                {asset.title}
              </h3>

              <p className="text-[11px] text-notion-light-muted dark:text-notion-dark-muted line-clamp-2 mb-6 flex-grow">
                {asset.notes || "No description provided."}
              </p>

              <div className="flex items-center justify-between pt-4 border-t border-notion-light-border dark:border-notion-dark-border">
                <div className="flex items-center gap-3">
                  <div className="flex flex-col">
                    <span className="text-[8px] uppercase tracking-tighter text-notion-light-muted dark:text-notion-dark-muted font-bold">
                      Reusability
                    </span>
                    <div className="flex gap-0.5 mt-0.5">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div
                          key={i}
                          className={`w-2.5 h-1 rounded-full ${
                            i <= asset.reusabilityScore
                              ? "bg-lime-500"
                              : "bg-notion-light-border dark:bg-notion-dark-border"
                          }`}
                        ></div>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[8px] uppercase tracking-tighter text-notion-light-muted dark:text-notion-dark-muted font-bold">
                      Potential
                    </span>
                    <div className="flex gap-0.5 mt-0.5">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div
                          key={i}
                          className={`w-2.5 h-1 rounded-full ${
                            i <= asset.monetizationPotential
                              ? "bg-emerald-500"
                              : "bg-notion-light-border dark:border-notion-dark-border"
                          }`}
                        ></div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => onDelete(asset.id)}
                    className="p-1.5 hover:bg-red-500/10 hover:text-red-500 rounded-lg transition-colors"
                  >
                    <Icon.Delete size={14} />
                  </button>
                  <button
                    onClick={() => handleEdit(asset)}
                    className="p-1.5 hover:bg-notion-light-sidebar dark:hover:bg-notion-dark-sidebar rounded-lg transition-colors"
                  >
                    <Icon.Edit size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
