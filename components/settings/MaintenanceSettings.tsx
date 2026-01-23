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
import { Button } from "../ui";

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
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-2 mb-3 ml-1">
          <Icon.Database size={12} className="opacity-40" />
          <span className="text-[10px] font-black uppercase tracking-widest opacity-40">
            System Integrity & Backups
          </span>
        </div>
        <div className="p-6 bg-notion-light-sidebar/50 dark:bg-notion-dark-sidebar/50 rounded-2xl border border-notion-light-border dark:border-notion-dark-border backdrop-blur-sm space-y-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-500/10 rounded-xl">
              <Icon.Database className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-notion-light-text dark:text-notion-dark-text uppercase tracking-tight">
                Intelligence Snapshot Export
              </h4>
              <p className="text-[11px] text-notion-light-muted dark:text-notion-dark-muted mt-1.5 leading-relaxed italic">
                Generate a comprehensive, human-readable JSON snapshot of all
                mission parameters, network entries, intelligence archives, and
                strategic logs. This serves as your primary sovereign recovery
                protocol.
              </p>
            </div>
          </div>

          <Button
            onClick={handleExport}
            variant="custom"
            className="w-full py-3 bg-blue-600 text-white border border-blue-500 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <Icon.Download size={14} />
            Execute Full System Snapshot
          </Button>
        </div>
      </div>

      <div className="border-t border-notion-light-border dark:border-notion-dark-border pt-8">
        <div className="flex items-center gap-2 mb-3 ml-1">
          <Icon.Activity size={12} className="opacity-40" />
          <span className="text-[10px] font-black uppercase tracking-widest opacity-40">
            Operator Recovery Protocol
          </span>
        </div>
        <div className="p-6 bg-amber-500/5 dark:bg-amber-500/10 rounded-2xl border border-amber-500/20 backdrop-blur-sm">
          <p className="text-[11px] text-notion-light-text dark:text-notion-dark-text leading-relaxed italic">
            <span className="font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest mr-2">
              Operational Creed:
            </span>
            "Version everything — memory is documentation."
            <br />
            <br />
            In the event of a catastrophic infrastructure failure (global
            outages or core engine errors), your primary recovery path is to
            deploy the
            <strong> Intelligence Snapshot</strong> above to a fresh sovereign
            ledger. All data remains human-readable, decentralized, and under
            your absolute control.
          </p>
        </div>
      </div>
    </div>
  );
};
