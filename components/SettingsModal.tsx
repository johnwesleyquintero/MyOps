import React, { useState, useEffect } from "react";
import {
  AppConfig,
  TaskEntry,
  Contact,
  Note,
  VaultEntry,
  DecisionEntry,
  MentalStateEntry,
  AssetEntry,
  ReflectionEntry,
  LifeConstraintEntry,
} from "../types";
import { ConnectionSettings } from "./settings/ConnectionSettings";
import { BackendCodeView } from "./settings/BackendCodeView";
import { MaintenanceSettings } from "./settings/MaintenanceSettings";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: AppConfig;
  onSave: (config: AppConfig) => void;
  // Data for backup
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

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onSave,
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
  const [localConfig, setLocalConfig] = useState<AppConfig>(config);
  const [activeTab, setActiveTab] = useState<"CONFIG" | "CODE" | "MAINTENANCE">(
    "CONFIG",
  );

  useEffect(() => {
    setLocalConfig(config);
  }, [config]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px] animate-in fade-in duration-200">
      <div className="bg-notion-light-bg dark:bg-notion-dark-bg w-full max-w-2xl rounded-lg shadow-2xl m-4 flex flex-col max-h-[90vh] border border-notion-light-border dark:border-notion-dark-border animate-in zoom-in-95 duration-200">
        {/* Header with Tabs */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-notion-light-border dark:border-notion-dark-border bg-notion-light-sidebar dark:bg-notion-dark-sidebar">
          <h2 className="text-sm font-semibold text-notion-light-text dark:text-notion-dark-text">
            Settings
          </h2>
          <div className="flex bg-notion-light-hover dark:bg-notion-dark-hover rounded p-0.5">
            <button
              onClick={() => setActiveTab("CONFIG")}
              className={`px-3 py-1 text-[10px] font-bold rounded transition-all ${activeTab === "CONFIG" ? "bg-notion-light-bg dark:bg-notion-dark-bg text-notion-light-text dark:text-notion-dark-text shadow-sm" : "text-notion-light-muted dark:text-notion-dark-muted hover:text-notion-light-text dark:hover:text-notion-dark-text"}`}
            >
              CONNECTION
            </button>
            <button
              onClick={() => setActiveTab("CODE")}
              className={`px-3 py-1 text-[10px] font-bold rounded transition-all ${activeTab === "CODE" ? "bg-notion-light-bg dark:bg-notion-dark-bg text-notion-light-text dark:text-notion-dark-text shadow-sm" : "text-notion-light-muted dark:text-notion-dark-muted hover:text-notion-light-text dark:hover:text-notion-dark-text"}`}
            >
              BACKEND CODE
            </button>
            <button
              onClick={() => setActiveTab("MAINTENANCE")}
              className={`px-3 py-1 text-[10px] font-bold rounded transition-all ${activeTab === "MAINTENANCE" ? "bg-notion-light-bg dark:bg-notion-dark-bg text-notion-light-text dark:text-notion-dark-text shadow-sm" : "text-notion-light-muted dark:text-notion-dark-muted hover:text-notion-light-text dark:hover:text-notion-dark-text"}`}
            >
              MAINTENANCE
            </button>
          </div>
        </div>

        {/* Content Area - Scrollable */}
        <div className="p-6 overflow-y-auto custom-scrollbar">
          {activeTab === "CONFIG" ? (
            <ConnectionSettings
              config={localConfig}
              onChange={setLocalConfig}
            />
          ) : activeTab === "CODE" ? (
            <BackendCodeView />
          ) : (
            <MaintenanceSettings
              entries={entries}
              contacts={contacts}
              notes={notes}
              vaultEntries={vaultEntries}
              decisions={decisions}
              mentalStates={mentalStates}
              assets={assets}
              reflections={reflections}
              lifeConstraints={lifeConstraints}
            />
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-notion-light-border dark:border-notion-dark-border bg-notion-light-sidebar dark:bg-notion-dark-sidebar rounded-b-lg">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-notion-light-muted hover:text-notion-light-text dark:hover:text-notion-dark-text transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(localConfig)}
            className="px-4 py-1.5 text-xs font-semibold bg-notion-light-text dark:bg-notion-dark-text text-white dark:text-notion-dark-bg rounded hover:opacity-90 transition-opacity"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};
