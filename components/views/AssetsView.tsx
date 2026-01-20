import React, { useState } from "react";
import { AssetEntry } from "../../types";
import { Icon, iconProps } from "../Icons";
import { ViewHeader } from "../ViewHeader";
import { AssetModal } from "../AssetModal";
import { MODULE_COLORS } from "@/constants";
import { Button } from "../ui/Button";

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
            className={`flex items-center gap-2 px-4 py-2 ${colors.bg} ${colors.text} border ${colors.border} rounded-xl text-[10px] font-bold uppercase tracking-widest ${colors.hoverBg} transition-all active:scale-95 group`}
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
            <div
              key={asset.id}
              className={`group bg-notion-light-bg dark:bg-notion-dark-bg border border-notion-light-border dark:border-notion-dark-border rounded-2xl p-6 hover:shadow-xl transition-all duration-300 flex flex-col hover:${colors.border}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className={`w-10 h-10 rounded-xl ${colors.bg} ${colors.text} flex items-center justify-center border ${colors.border} group-hover:scale-110 transition-transform`}
                >
                  <Icon.Project {...iconProps(20)} />
                </div>
                <div className="flex gap-2">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 bg-notion-light-sidebar dark:bg-notion-dark-sidebar rounded-full uppercase tracking-wider border border-notion-light-border dark:border-notion-dark-border group-hover:${colors.border} transition-colors`}
                  >
                    {asset.type}
                  </span>
                </div>
              </div>

              <h3
                className={`text-sm font-bold text-notion-light-text dark:text-notion-dark-text mb-2 group-hover:${colors.text} transition-colors`}
              >
                {asset.title}
              </h3>

              <p className="text-[11px] text-notion-light-muted dark:text-notion-dark-muted line-clamp-2 mb-6 flex-grow">
                {asset.notes || "No description provided."}
              </p>

              <div
                className={`flex items-center justify-between pt-4 border-t border-notion-light-border dark:border-notion-dark-border group-hover:${colors.border} transition-colors`}
              >
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
                              ? colors.dot
                              : "bg-notion-light-border dark:bg-notion-dark-border opacity-30"
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
                              ? colors.dot
                              : "bg-notion-light-border dark:bg-notion-dark-border opacity-30"
                          }`}
                        ></div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="custom"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(asset.id);
                    }}
                    className="p-1.5 hover:bg-red-500/10 text-red-400 rounded-lg transition-colors"
                  >
                    <Icon.Delete size={14} />
                  </Button>
                  <Button
                    variant="custom"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(asset);
                    }}
                    className={`p-1.5 ${colors.hoverBg} ${colors.text} rounded-lg transition-colors`}
                  >
                    <Icon.Edit size={14} />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
