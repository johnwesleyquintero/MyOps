import React, { useState, useEffect } from "react";
import { AppConfig } from "../types";
import { ConnectionSettings } from "./settings/ConnectionSettings";
import { RewardSettings } from "./settings/RewardSettings";
import { BackendCodeView } from "./settings/BackendCodeView";
import { MaintenanceSettings } from "./settings/MaintenanceSettings";
import { Button } from "./ui/Button";
import { useConfig } from "../hooks/useConfig";
import { useUi } from "../hooks/useUi";
import { useData } from "../hooks/useData";

export const SettingsModal: React.FC = () => {
  const { config, setConfig: onSave } = useConfig();
  const ui = useUi();
  const {
    tasks,
    crm,
    notes: notesData,
    vault,
    strategy,
    awareness,
    assets: assetsData,
    reflections: reflectionsData,
    lifeOps,
  } = useData();

  const { showSettings: isOpen, setShowSettings } = ui;
  const { entries } = tasks;
  const { contacts } = crm;
  const { notes } = notesData;
  const { vaultEntries } = vault;
  const { decisions } = strategy;
  const { mentalStates } = awareness;
  const { assets } = assetsData;
  const { reflections } = reflectionsData;
  const { constraints: lifeConstraints } = lifeOps;

  const onClose = () => setShowSettings(false);

  const [localConfig, setLocalConfig] = useState<AppConfig>(config);
  const [activeTab, setActiveTab] = useState<
    "CONFIG" | "REWARDS" | "CODE" | "MAINTENANCE"
  >("CONFIG");

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
            <Button
              variant="custom"
              onClick={() => setActiveTab("CONFIG")}
              className={`px-3 py-1 text-[10px] font-bold rounded transition-all ${activeTab === "CONFIG" ? "bg-notion-light-bg dark:bg-notion-dark-bg text-notion-light-text dark:text-notion-dark-text shadow-sm" : "text-notion-light-muted dark:text-notion-dark-muted hover:text-notion-light-text dark:hover:text-notion-dark-text"}`}
            >
              CONNECTION
            </Button>
            <Button
              variant="custom"
              onClick={() => setActiveTab("REWARDS")}
              className={`px-3 py-1 text-[10px] font-bold rounded transition-all ${activeTab === "REWARDS" ? "bg-notion-light-bg dark:bg-notion-dark-bg text-notion-light-text dark:text-notion-dark-text shadow-sm" : "text-notion-light-muted dark:text-notion-dark-muted hover:text-notion-light-text dark:hover:text-notion-dark-text"}`}
            >
              REWARDS
            </Button>
            <Button
              variant="custom"
              onClick={() => setActiveTab("CODE")}
              className={`px-3 py-1 text-[10px] font-bold rounded transition-all ${activeTab === "CODE" ? "bg-notion-light-bg dark:bg-notion-dark-bg text-notion-light-text dark:text-notion-dark-text shadow-sm" : "text-notion-light-muted dark:text-notion-dark-muted hover:text-notion-light-text dark:hover:text-notion-dark-text"}`}
            >
              BACKEND CODE
            </Button>
            <Button
              variant="custom"
              onClick={() => setActiveTab("MAINTENANCE")}
              className={`px-3 py-1 text-[10px] font-bold rounded transition-all ${activeTab === "MAINTENANCE" ? "bg-notion-light-bg dark:bg-notion-dark-bg text-notion-light-text dark:text-notion-dark-text shadow-sm" : "text-notion-light-muted dark:text-notion-dark-muted hover:text-notion-light-text dark:hover:text-notion-dark-text"}`}
            >
              MAINTENANCE
            </Button>
          </div>
        </div>

        {/* Content Area - Scrollable */}
        <div className="p-6 overflow-y-auto custom-scrollbar">
          {activeTab === "CONFIG" ? (
            <ConnectionSettings
              config={localConfig}
              onChange={setLocalConfig}
            />
          ) : activeTab === "REWARDS" ? (
            <RewardSettings />
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
          <Button
            variant="custom"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-notion-light-muted hover:text-notion-light-text dark:hover:text-notion-dark-text transition-colors"
          >
            Cancel
          </Button>
          <Button
            variant="custom"
            onClick={() => onSave(localConfig)}
            className="px-4 py-1.5 text-xs font-semibold bg-notion-light-text dark:bg-notion-dark-text text-white dark:text-notion-dark-bg rounded hover:opacity-90 transition-opacity"
          >
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
};
