import React, { useState } from "react";
import { VaultEntry } from "../../types";
import { Icon } from "../Icons";
import { ViewHeader } from "../ViewHeader";
import { toast } from "sonner";
import { MODULE_COLORS } from "../../constants/ui";
import { Button } from "../ui";

interface VaultViewProps {
  entries: VaultEntry[];
  isLoading: boolean;
  onSaveEntry: (entry: VaultEntry, isUpdate: boolean) => Promise<boolean>;
  onDeleteEntry: (id: string) => Promise<boolean>;
}

export const VaultView: React.FC<VaultViewProps> = ({
  entries,
  isLoading,
  onSaveEntry,
  onDeleteEntry,
}) => {
  const colors = MODULE_COLORS.vault;
  const [showValues, setShowValues] = useState<Record<string, boolean>>({});
  const [isAdding, setIsAdding] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newValue, setNewValue] = useState("");
  const [newCategory, setNewCategory] =
    useState<VaultEntry["category"]>("API Key");

  const toggleShow = (id: string) => {
    setShowValues((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleAdd = async () => {
    if (!newLabel || !newValue) return;
    const success = await onSaveEntry(
      {
        id: "",
        label: newLabel,
        value: newValue,
        category: newCategory,
        createdAt: new Date().toISOString(),
      },
      false,
    );

    if (success) {
      setIsAdding(false);
      setNewLabel("");
      setNewValue("");
    } else {
      // toast error handled by hook
    }
  };

  const handleDelete = async (id: string, label: string) => {
    if (window.confirm(`Are you sure you want to delete "${label}"?`)) {
      await onDeleteEntry(id);
    }
  };

  const copyToClipboard = (val: string, label: string) => {
    navigator.clipboard.writeText(val);
    toast.success(`${label} copied to clipboard`, {
      description: "The secret value is now in your clipboard.",
      icon: <Icon.Copy size={16} />,
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <ViewHeader
        title="Secure Vault"
        subTitle="Encrypted storage for keys and tokens"
      >
        <Button
          variant="custom"
          onClick={() => setIsAdding(true)}
          className={`w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 ${colors.solidBg} text-white border ${colors.border} rounded-2xl font-black text-sm uppercase tracking-widest shadow-sm hover:opacity-90 transition-all active:scale-95`}
        >
          <Icon.Vault size={20} />
          Secure New Item
        </Button>
      </ViewHeader>

      <div
        className={`bg-notion-light-sidebar dark:bg-notion-dark-sidebar border border-notion-light-border dark:border-notion-dark-border rounded-2xl p-5 flex items-start gap-4`}
      >
        <div
          className={`p-2.5 ${colors.bg} ${colors.text} rounded-xl shadow-sm`}
        >
          <Icon.Alert size={18} />
        </div>
        <div>
          <h4
            className={`text-sm font-black ${colors.text} uppercase tracking-wider`}
          >
            Local Sovereignty
          </h4>
          <p className="text-xs text-notion-light-muted dark:text-notion-dark-muted mt-1 font-medium leading-relaxed">
            Vault data is stored in your local environment. Ensure your system
            is secure. All data is encrypted at rest.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isAdding && (
          <div
            className={`bg-notion-light-bg dark:bg-notion-dark-bg border-2 border-dashed ${colors.border} rounded-3xl p-6 space-y-4 animate-in fade-in zoom-in duration-300`}
          >
            <h3
              className={`font-black text-xs uppercase tracking-widest ${colors.text}`}
            >
              Secure New Entry
            </h3>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-notion-light-muted dark:text-notion-dark-muted uppercase tracking-widest ml-1">
                  Label
                </label>
                <input
                  placeholder="e.g. OpenAI Key"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  className={`w-full px-4 py-3 bg-notion-light-sidebar dark:bg-notion-dark-sidebar border border-notion-light-border dark:border-notion-dark-border rounded-xl outline-none focus:ring-2 ${colors.dot.replace("bg-", "ring-")} text-sm font-bold text-notion-light-text dark:text-notion-dark-text transition-all`}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-notion-light-muted dark:text-notion-dark-muted uppercase tracking-widest ml-1">
                  Category
                </label>
                <select
                  value={newCategory}
                  onChange={(e) =>
                    setNewCategory(e.target.value as VaultEntry["category"])
                  }
                  className="w-full px-4 py-3 bg-notion-light-sidebar dark:bg-notion-dark-sidebar border border-notion-light-border dark:border-notion-dark-border rounded-xl outline-none text-sm font-bold text-notion-light-text dark:text-notion-dark-text transition-all appearance-none"
                >
                  <option>API Key</option>
                  <option>Token</option>
                  <option>Password</option>
                  <option>Other</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-notion-light-muted dark:text-notion-dark-muted uppercase tracking-widest ml-1">
                  Secret Value
                </label>
                <textarea
                  placeholder="Paste your secret here..."
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  className={`w-full px-4 py-3 bg-notion-light-sidebar dark:bg-notion-dark-sidebar border border-notion-light-border dark:border-notion-dark-border rounded-xl outline-none focus:ring-2 ${colors.dot.replace("bg-", "ring-")} text-sm font-bold text-notion-light-text dark:text-notion-dark-text transition-all h-24 resize-none`}
                />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                variant="custom"
                onClick={handleAdd}
                className={`flex-1 py-3 ${colors.solidBg} text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all active:scale-95 shadow-lg shadow-black/5`}
              >
                Secure
              </Button>
              <Button
                variant="custom"
                onClick={() => setIsAdding(false)}
                className="flex-1 py-3 bg-notion-light-sidebar dark:bg-notion-dark-sidebar text-notion-light-muted dark:text-notion-dark-muted border border-notion-light-border dark:border-notion-dark-border font-black text-xs uppercase tracking-widest rounded-xl transition-all hover:bg-notion-light-border dark:hover:bg-notion-dark-border active:scale-95"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {isLoading
          ? Array(3)
              .fill(0)
              .map((_, i) => (
                <div
                  key={i}
                  className={`h-48 bg-notion-light-sidebar dark:bg-notion-dark-sidebar border ${colors.border} rounded-3xl animate-pulse`}
                ></div>
              ))
          : entries.map((entry) => (
              <div
                key={entry.id}
                className={`bg-notion-light-bg dark:bg-notion-dark-bg border border-notion-light-border dark:border-notion-dark-border rounded-3xl p-6 shadow-sm group hover:shadow-md transition-all duration-300 animate-in fade-in slide-in-from-bottom-2 ${colors.border.replace("border-", "hover:border-")}`}
              >
                <div className="flex items-start justify-between mb-5">
                  <div>
                    <span
                      className={`text-[10px] font-black ${colors.text} uppercase tracking-widest block mb-1.5 opacity-70`}
                    >
                      {entry.category}
                    </span>
                    <h3 className="font-black text-notion-light-text dark:text-notion-dark-text tracking-tight">
                      {entry.label}
                    </h3>
                  </div>
                  <Button
                    variant="custom"
                    onClick={() => handleDelete(entry.id, entry.label)}
                    className={`p-2.5 text-notion-light-muted dark:text-notion-dark-muted ${MODULE_COLORS.error.text.replace("text-", "hover:text-")} ${MODULE_COLORS.error.bg.replace("bg-", "hover:bg-")} rounded-xl transition-all opacity-100 md:opacity-0 md:group-hover:opacity-100`}
                  >
                    <Icon.Delete size={18} />
                  </Button>
                </div>

                <div className="relative">
                  <div
                    className={`flex items-center gap-3 p-4 bg-notion-light-sidebar dark:bg-notion-dark-sidebar rounded-2xl border border-notion-light-border dark:border-notion-dark-border group/code transition-colors ${colors.border.replace("border-", "hover:border-")}`}
                  >
                    <code className="text-xs font-mono text-notion-light-text dark:text-notion-dark-text flex-1 truncate font-bold">
                      {showValues[entry.id]
                        ? entry.value
                        : "••••••••••••••••••••"}
                    </code>
                    <div className="flex items-center gap-1.5">
                      <Button
                        variant="custom"
                        onClick={() => toggleShow(entry.id)}
                        className={`p-2 text-notion-light-muted dark:text-notion-dark-muted ${colors.text.replace("text-", "hover:text-")} ${colors.lightBg.replace("bg-", "hover:bg-")} rounded-lg transition-all`}
                        title={showValues[entry.id] ? "Hide" : "Show"}
                      >
                        {showValues[entry.id] ? (
                          <Icon.Pause size={16} />
                        ) : (
                          <Icon.Play size={16} />
                        )}
                      </Button>
                      <Button
                        variant="custom"
                        onClick={() =>
                          copyToClipboard(entry.value, entry.label)
                        }
                        className={`p-2 text-notion-light-muted dark:text-notion-dark-muted ${colors.text.replace("text-", "hover:text-")} ${colors.lightBg.replace("bg-", "hover:bg-")} rounded-lg transition-all`}
                        title="Copy to clipboard"
                      >
                        <Icon.Copy size={16} />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-notion-light-border/50 dark:border-notion-dark-border/30 flex items-center justify-between">
                  <span className="text-[10px] text-notion-light-muted dark:text-notion-dark-muted font-black uppercase tracking-widest">
                    Added{" "}
                    {new Date(entry.createdAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    })}
                    <span className="hidden sm:inline">
                      , {new Date(entry.createdAt).getFullYear()}
                    </span>
                  </span>
                  <div className="flex -space-x-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                    <div
                      className={`w-5 h-5 rounded-full border-2 border-notion-light-bg dark:border-notion-dark-bg ${colors.bg} flex items-center justify-center`}
                    >
                      <Icon.Vault size={10} className="text-white" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
      </div>
    </div>
  );
};
