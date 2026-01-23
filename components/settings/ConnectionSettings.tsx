import React, { useState, useEffect } from "react";
import { AppConfig } from "../../types";
import { Icon } from "../Icons";
import { Button } from "../ui";

const DebouncedSettingInput: React.FC<{
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  className?: string;
}> = ({ value, onChange, placeholder, type = "text", className = "" }) => {
  const [localValue, setLocalValue] = useState(value);
  const [prevValue, setPrevValue] = useState(value);

  if (value !== prevValue) {
    setPrevValue(value);
    setLocalValue(value);
  }

  useEffect(() => {
    if (localValue === value) return;
    const timer = setTimeout(() => {
      onChange(localValue);
    }, 500);
    return () => clearTimeout(timer);
  }, [localValue, value, onChange]);

  return (
    <input
      type={type}
      placeholder={placeholder}
      className={`w-full border border-notion-light-border dark:border-notion-dark-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/30 bg-notion-light-bg dark:bg-notion-dark-bg text-notion-light-text dark:text-notion-dark-text transition-all shadow-sm ${className}`}
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
    />
  );
};

interface ConnectionSettingsProps {
  config: AppConfig;
  onChange: (config: AppConfig) => void;
}

export const ConnectionSettings: React.FC<ConnectionSettingsProps> = ({
  config,
  onChange,
}) => {
  return (
    <div className="space-y-8">
      {/* Theme Setting */}
      <div>
        <div className="flex items-center gap-2 mb-3 ml-1">
          <Icon.Sun size={12} className="opacity-40" />
          <span className="text-[10px] font-black uppercase tracking-widest opacity-40">
            Visual Interface Theme
          </span>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Button
            onClick={() => onChange({ ...config, theme: "LIGHT" })}
            variant="custom"
            className={`py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
              config.theme === "LIGHT"
                ? "bg-notion-light-bg dark:bg-notion-dark-bg text-notion-light-text dark:text-notion-dark-text border-notion-light-border dark:border-notion-dark-border shadow-lg shadow-black/5"
                : "bg-transparent text-notion-light-muted dark:text-notion-dark-muted border-notion-light-border dark:border-notion-dark-border hover:bg-notion-light-hover dark:hover:bg-notion-dark-hover"
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Icon.Sun size={14} />
              <span>Solar Mode</span>
            </div>
          </Button>
          <Button
            onClick={() => onChange({ ...config, theme: "DARK" })}
            variant="custom"
            className={`py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
              config.theme === "DARK"
                ? "bg-notion-light-bg dark:bg-notion-dark-bg text-notion-light-text dark:text-notion-dark-text border-notion-light-border dark:border-notion-dark-border shadow-lg shadow-black/5"
                : "bg-transparent text-notion-light-muted dark:text-notion-dark-muted border-notion-light-border dark:border-notion-dark-border hover:bg-notion-light-hover dark:hover:bg-notion-dark-hover"
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Icon.Moon size={14} />
              <span>Lunar Mode</span>
            </div>
          </Button>
        </div>
      </div>

      <div className="border-t border-notion-light-border dark:border-notion-dark-border pt-8">
        <div className="flex items-center gap-2 mb-3 ml-1">
          <Icon.Activity size={12} className="opacity-40" />
          <span className="text-[10px] font-black uppercase tracking-widest opacity-40">
            Operational Protocol
          </span>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Button
            onClick={() => onChange({ ...config, mode: "DEMO" })}
            variant="custom"
            className={`py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
              config.mode === "DEMO"
                ? "bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-500/20"
                : "bg-transparent text-notion-light-muted dark:text-notion-dark-muted border-notion-light-border dark:border-notion-dark-border hover:bg-notion-light-hover dark:hover:bg-notion-dark-hover"
            }`}
          >
            Demo Protocol
          </Button>
          <Button
            onClick={() => onChange({ ...config, mode: "LIVE" })}
            variant="custom"
            className={`py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
              config.mode === "LIVE"
                ? "bg-red-600 text-white border-red-500 shadow-lg shadow-red-500/20"
                : "bg-transparent text-notion-light-muted dark:text-notion-dark-muted border-notion-light-border dark:border-notion-dark-border hover:bg-notion-light-hover dark:hover:bg-notion-dark-hover"
            }`}
          >
            Live Deployment
          </Button>
        </div>
        <p className="text-[10px] text-notion-light-muted dark:text-notion-dark-muted mt-3 italic ml-1">
          {config.mode === "DEMO"
            ? "Simulated environment: Data is strictly local to this device."
            : "Production environment: Real-time synchronization with primary intelligence ledger."}
        </p>
      </div>

      {config.mode === "LIVE" && (
        <div className="space-y-6 p-6 bg-notion-light-sidebar/50 dark:bg-notion-dark-sidebar/50 rounded-2xl border border-notion-light-border dark:border-notion-dark-border backdrop-blur-sm">
          <div>
            <div className="flex items-center gap-2 mb-2 ml-1">
              <Icon.External size={12} className="opacity-40" />
              <span className="text-[10px] font-black uppercase tracking-widest opacity-40">
                Intelligence Endpoint (GAS URL)
              </span>
            </div>
            <DebouncedSettingInput
              placeholder="https://script.google.com/macros/s/..."
              value={config.gasDeploymentUrl}
              onChange={(val) => onChange({ ...config, gasDeploymentUrl: val })}
            />
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2 ml-1">
              <Icon.Lock size={12} className="opacity-40" />
              <span className="text-[10px] font-black uppercase tracking-widest opacity-40">
                Operational Clearance (API Token)
              </span>
            </div>
            <DebouncedSettingInput
              type="password"
              placeholder="Enter secure clearance token..."
              className="font-mono"
              value={config.apiToken || ""}
              onChange={(val) => onChange({ ...config, apiToken: val })}
            />
          </div>
        </div>
      )}

      {/* AI Configuration */}
      <div className="border-t border-notion-light-border dark:border-notion-dark-border pt-8">
        <div className="flex items-center gap-2 mb-3 ml-1">
          <Icon.Brain size={12} className="opacity-40" />
          <span className="text-[10px] font-black uppercase tracking-widest opacity-40">
            Neural Network Configuration
          </span>
        </div>
        <div className="p-6 bg-notion-light-sidebar/50 dark:bg-notion-dark-sidebar/50 rounded-2xl border border-notion-light-border dark:border-notion-dark-border backdrop-blur-sm">
          <div>
            <div className="flex items-center gap-2 mb-2 ml-1">
              <Icon.Key size={12} className="opacity-40" />
              <span className="text-[10px] font-black uppercase tracking-widest opacity-40">
                Neural Link Key (Gemini)
              </span>
            </div>
            <DebouncedSettingInput
              type="password"
              placeholder="AIzaSy..."
              className="font-mono"
              value={config.geminiApiKey || ""}
              onChange={(val) => onChange({ ...config, geminiApiKey: val })}
            />
            <p className="text-[10px] text-notion-light-muted dark:text-notion-dark-muted mt-3 italic">
              Required for autonomous intelligence processing. Keys are
              encrypted locally.
              <br />
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1 mt-2 font-bold"
              >
                Secure key from Google AI Studio
                <Icon.External className="w-3 h-3" />
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
