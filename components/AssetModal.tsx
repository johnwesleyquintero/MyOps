import React, { useState } from "react";
import { AssetEntry } from "../types";
import { Icon, iconProps } from "./Icons";
import { toast } from "sonner";
import { MODULE_COLORS } from "@/constants";

interface AssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (asset: AssetEntry, isUpdate: boolean) => Promise<boolean>;
  initialData?: AssetEntry | null;
}

const ASSET_TYPES = ["Framework", "SOP", "Tool", "Content", "Code"] as const;
const ASSET_STATUSES = ["Draft", "Active", "Archived"] as const;

export const AssetModal: React.FC<AssetModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const [formData, setFormData] = useState<Partial<AssetEntry>>(
    () =>
      initialData || {
        title: "",
        type: "Framework",
        status: "Draft",
        reusabilityScore: 3,
        monetizationPotential: 3,
        notes: "",
        link: "",
      },
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [prevInitialData, setPrevInitialData] = useState(initialData);
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);

  const colors = MODULE_COLORS.assets;

  // Sync form data when initialData or isOpen changes (render-phase sync to avoid cascading renders)
  if (initialData !== prevInitialData || isOpen !== prevIsOpen) {
    setPrevInitialData(initialData);
    setPrevIsOpen(isOpen);
    setFormData(
      initialData || {
        title: "",
        type: "Framework",
        status: "Draft",
        reusabilityScore: 3,
        monetizationPotential: 3,
        notes: "",
        link: "",
      },
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) {
      toast.error("Please provide a title");
      return;
    }

    setIsSubmitting(true);
    const success = await onSave(formData as AssetEntry, !!initialData);
    setIsSubmitting(false);

    if (success) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px] animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-notion-light-bg dark:bg-notion-dark-bg w-full max-w-xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 rounded-2xl border border-notion-light-border dark:border-notion-dark-border">
        {/* Modal Header */}
        <div
          className={`px-6 py-4 border-b ${colors.border} flex items-center justify-between ${colors.lightBg}`}
        >
          <div className="flex items-center gap-3">
            <span className={colors.text}>
              <Icon.Project {...iconProps(18)} />
            </span>
            <h2 className={`text-sm font-semibold ${colors.text}`}>
              {initialData ? "Edit Asset" : "New Asset"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className={`p-1 hover:${colors.bg} rounded-md transition-colors`}
          >
            <Icon.Close {...iconProps(16)} />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-4">
            {/* Title */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-notion-light-muted dark:text-notion-dark-muted">
                Title
              </label>
              <input
                autoFocus
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className={`w-full bg-notion-light-sidebar dark:bg-notion-dark-sidebar border border-notion-light-border dark:border-notion-dark-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:${colors.border} transition-all`}
                placeholder="Asset name..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Type */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-notion-light-muted dark:text-notion-dark-muted">
                  Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      type: e.target.value as AssetEntry["type"],
                    })
                  }
                  className={`w-full bg-notion-light-sidebar dark:bg-notion-dark-sidebar border border-notion-light-border dark:border-notion-dark-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:${colors.border} transition-all appearance-none`}
                >
                  {ASSET_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-notion-light-muted dark:text-notion-dark-muted">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status: e.target.value as AssetEntry["status"],
                    })
                  }
                  className={`w-full bg-notion-light-sidebar dark:bg-notion-dark-sidebar border border-notion-light-border dark:border-notion-dark-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:${colors.border} transition-all appearance-none`}
                >
                  {ASSET_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Reusability Score */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-notion-light-muted dark:text-notion-dark-muted">
                  Reusability (1-5)
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((score) => (
                    <button
                      key={score}
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          reusabilityScore:
                            score as AssetEntry["reusabilityScore"],
                        })
                      }
                      className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                        formData.reusabilityScore === score
                          ? `${colors.bg} ${colors.text} border ${colors.border}`
                          : `bg-notion-light-sidebar dark:bg-notion-dark-sidebar ${colors.hoverBg}`
                      }`}
                    >
                      {score}
                    </button>
                  ))}
                </div>
              </div>

              {/* Monetization Potential */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-notion-light-muted dark:text-notion-dark-muted">
                  Monetization (1-5)
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((score) => (
                    <button
                      key={score}
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          monetizationPotential:
                            score as AssetEntry["monetizationPotential"],
                        })
                      }
                      className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                        formData.monetizationPotential === score
                          ? `${colors.bg} ${colors.text} border ${colors.border}`
                          : `bg-notion-light-sidebar dark:bg-notion-dark-sidebar ${colors.hoverBg}`
                      }`}
                    >
                      {score}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Link */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-notion-light-muted dark:text-notion-dark-muted">
                Reference Link
              </label>
              <div className="relative group">
                <Icon.Link
                  className={`absolute left-3 top-1/2 -translate-y-1/2 text-notion-light-muted group-focus-within:${colors.text} transition-colors`}
                  size={14}
                />
                <input
                  type="url"
                  value={formData.link}
                  onChange={(e) =>
                    setFormData({ ...formData, link: e.target.value })
                  }
                  className={`w-full bg-notion-light-sidebar dark:bg-notion-dark-sidebar border border-notion-light-border dark:border-notion-dark-border rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:${colors.border} transition-all`}
                  placeholder="https://..."
                />
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-notion-light-muted dark:text-notion-dark-muted">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                className={`w-full bg-notion-light-sidebar dark:bg-notion-dark-sidebar border border-notion-light-border dark:border-notion-dark-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:${colors.border} transition-all min-h-[100px] resize-none`}
                placeholder="Describe the asset, how to use it, etc..."
              />
            </div>
          </div>

          <div
            className={`flex items-center justify-end gap-3 pt-4 border-t ${colors.border}`}
          >
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-widest text-notion-light-muted hover:${colors.text} transition-colors`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`flex items-center gap-2 px-6 py-2 ${colors.bg} ${colors.text} border ${colors.border} rounded-xl text-[10px] font-bold uppercase tracking-widest ${colors.hoverBg} transition-all active:scale-95 disabled:opacity-50`}
            >
              {isSubmitting ? (
                <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <Icon.Check size={14} />
              )}
              {initialData ? "Update Asset" : "Create Asset"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
