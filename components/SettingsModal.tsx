import React, { useState, useEffect } from "react";
import { AppConfig } from "../types";
import { ConnectionSettings } from "./settings/ConnectionSettings";
import { RewardSettings } from "./settings/RewardSettings";
import { BackendCodeView } from "./settings/BackendCodeView";
import { MaintenanceSettings } from "./settings/MaintenanceSettings";
import { Button, Card } from "./ui";
import { useConfig } from "../hooks/useConfig";
import { useUi } from "../hooks/useUi";
import { useData } from "../hooks/useData";
import { useNotification } from "../hooks/useNotification";

export const SettingsModal: React.FC = () => {
  const { config, setConfig: onSave } = useConfig();
  const ui = useUi();
  const { showToast } = useNotification();
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-300 p-4">
      <Card
        padding="none"
        className="w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-300 rounded-2xl border-none"
      >
        {/* Header with Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between px-6 py-4 border-b border-notion-light-border dark:border-notion-dark-border bg-notion-light-sidebar/50 dark:bg-notion-dark-sidebar/50 backdrop-blur-md gap-4">
          <h2 className="text-sm font-black text-notion-light-text dark:text-notion-dark-text uppercase tracking-widest">
            Command Center
          </h2>
          <div className="flex bg-notion-light-hover dark:bg-notion-dark-hover rounded-xl p-1 overflow-x-auto">
            <Button
              variant="custom"
              onClick={() => setActiveTab("CONFIG")}
              className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${activeTab === "CONFIG" ? "bg-notion-light-bg dark:bg-notion-dark-bg text-notion-light-text dark:text-notion-dark-text shadow-sm" : "text-notion-light-muted dark:text-notion-dark-muted hover:text-notion-light-text dark:hover:text-notion-dark-text"}`}
            >
              Connectivity
            </Button>
            <Button
              variant="custom"
              onClick={() => setActiveTab("REWARDS")}
              className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${activeTab === "REWARDS" ? "bg-notion-light-bg dark:bg-notion-dark-bg text-notion-light-text dark:text-notion-dark-text shadow-sm" : "text-notion-light-muted dark:text-notion-dark-muted hover:text-notion-light-text dark:hover:text-notion-dark-text"}`}
            >
              Incentives
            </Button>
            <Button
              variant="custom"
              onClick={() => setActiveTab("CODE")}
              className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${activeTab === "CODE" ? "bg-notion-light-bg dark:bg-notion-dark-bg text-notion-light-text dark:text-notion-dark-text shadow-sm" : "text-notion-light-muted dark:text-notion-dark-muted hover:text-notion-light-text dark:hover:text-notion-dark-text"}`}
            >
              Core Engine
            </Button>
            <Button
              variant="custom"
              onClick={() => setActiveTab("MAINTENANCE")}
              className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${activeTab === "MAINTENANCE" ? "bg-notion-light-bg dark:bg-notion-dark-bg text-notion-light-text dark:text-notion-dark-text shadow-sm" : "text-notion-light-muted dark:text-notion-dark-muted hover:text-notion-light-text dark:hover:text-notion-dark-text"}`}
            >
              Operations
            </Button>
          </div>
        </div>

        {/* Content Area - Scrollable */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
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
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-notion-light-border dark:border-notion-dark-border bg-notion-light-sidebar/30 dark:bg-notion-dark-sidebar/30 backdrop-blur-md">
          <Button
            variant="ghost"
            onClick={onClose}
            className="px-6 py-2 text-[10px] font-black uppercase tracking-widest text-notion-light-muted dark:text-notion-dark-muted hover:bg-notion-light-hover dark:hover:bg-notion-dark-hover rounded-xl"
          >
            Abort
          </Button>
          <Button
            variant="custom"
            onClick={() => {
              onSave(localConfig);
              showToast("Intelligence updated successfully", "success");
              onClose();
            }}
            className="px-8 py-2 text-[10px] font-black uppercase tracking-widest bg-indigo-600 text-white border border-indigo-500 rounded-xl shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 transition-all active:scale-95"
          >
            Commit Changes
          </Button>
        </div>
      </Card>
    </div>
  );
};
