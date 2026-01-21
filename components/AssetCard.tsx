import React from "react";
import { AssetEntry } from "../types";
import { Icon, iconProps } from "./Icons";
import { Button } from "./ui";
import { ScoreIndicator } from "./ScoreIndicator";

interface AssetCardProps {
  asset: AssetEntry;
  colors: {
    bg: string;
    text: string;
    border: string;
    hoverBg: string;
    dot: string;
  };
  onEdit: (asset: AssetEntry) => void;
  onDelete: (id: string) => Promise<boolean>;
}

export const AssetCard: React.FC<AssetCardProps> = React.memo(
  ({ asset, colors, onEdit, onDelete }) => {
    const handleDeleteClick = async (e: React.MouseEvent) => {
      e.stopPropagation();
      await onDelete(asset.id);
    };

    const handleEditClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      onEdit(asset);
    };

    return (
      <div
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
            <ScoreIndicator
              label="Reusability"
              score={asset.reusabilityScore}
              dotColorClass={colors.dot}
            />
            <ScoreIndicator
              label="Potential"
              score={asset.monetizationPotential}
              dotColorClass={colors.dot}
            />
          </div>

          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="custom"
              onClick={handleDeleteClick}
              className="p-1.5 hover:bg-purple-500/10 text-purple-400 rounded-lg transition-colors"
            >
              <Icon.Delete size={14} />
            </Button>
            <Button
              variant="custom"
              onClick={handleEditClick}
              className={`p-1.5 ${colors.hoverBg} ${colors.text} rounded-lg transition-colors`}
            >
              <Icon.Edit size={14} />
            </Button>
          </div>
        </div>
      </div>
    );
  },
);
