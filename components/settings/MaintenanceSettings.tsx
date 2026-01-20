import React from "react";
import {
  TaskEntry,
  Contact,
  Note,
  VaultEntry,
  DecisionEntry,
  MentalStateEntry,
  AssetEntry,
  ReflectionEntry,
  LifeConstraintEntry,
} from "../../types";
import { Icon } from "../Icons";
import { toast } from "sonner";

interface MaintenanceSettingsProps {
  entries: TaskEntry[];
  contacts: Contact[];
  notes: Note[];
  vaultEntries: VaultEntry[];
  decisions: DecisionEntry[];
  mentalStates: MentalStateEntry[];
  assets: AssetEntry[];
  reflections: ReflectionEntry[];
  lifeConstraints: LifeConstraintEntry[];
}

export const MaintenanceSettings: React.FC<MaintenanceSettingsProps> = ({
  entries,
  contacts,
  notes,
  vaultEntries,
  decisions,
  mentalStates,
  assets,
  reflections,
  lifeConstraints,
}) => {
  const handleExport = () => {
    const data = {
      version: "2.5",
      exportDate: new Date().toISOString(),
      payload: {
        tasks: entries,
        contacts,
        notes,
        vault: vaultEntries,
        decisions,
        mentalStates,
        assets,
        reflections,
        lifeConstraints,
      },
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `myops-backup-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success("System Backup Successful", {
      description:
        "A JSON snapshot of your entire operating system has been downloaded.",
      icon: <Icon.Download className="w-4 h-4" />,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-[11px] font-bold text-notion-light-muted dark:text-notion-dark-muted uppercase tracking-wider mb-2">
          System Integrity & Backups
        </label>
        <div className="p-4 bg-notion-light-sidebar dark:bg-notion-dark-sidebar rounded border border-notion-light-border dark:border-notion-dark-border space-y-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-500/10 rounded">
              <Icon.Database className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-notion-light-text dark:text-notion-dark-text">
                Snapshot Export
              </h4>
              <p className="text-xs text-notion-light-muted dark:text-notion-dark-muted mt-1 leading-relaxed">
                Download a complete, human-readable JSON snapshot of your
                missions, CRM, knowledge base, and strategic logs. This is your
                primary "If I disappear for 30 days" recovery file.
              </p>
            </div>
          </div>

          <button
            onClick={handleExport}
            className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-notion-light-text dark:bg-notion-dark-text text-white dark:text-notion-dark-bg rounded text-xs font-bold hover:opacity-90 transition-opacity"
          >
            <Icon.Download className="w-4 h-4" />
            EXPORT FULL SYSTEM SNAPSHOT
          </button>
        </div>
      </div>

      <div className="border-t border-notion-light-border dark:border-notion-dark-border pt-6">
        <label className="block text-[11px] font-bold text-notion-light-muted dark:text-notion-dark-muted uppercase tracking-wider mb-2">
          Operator Recovery Protocol
        </label>
        <div className="p-4 bg-amber-500/5 rounded border border-amber-500/20">
          <p className="text-xs text-notion-light-text dark:text-notion-dark-text leading-relaxed">
            <strong>Creed:</strong> "Version everything — memory is
            documentation."
            <br />
            <br />
            In the event of a catastrophic infrastructure failure (Google
            outage, GAS error), your primary recovery path is to use the{" "}
            <strong>Snapshot Export</strong> above with a fresh Google Sheet
            deployment. All data in MyOps is human-readable and sovereign.
          </p>
        </div>
      </div>
    </div>
  );
};
