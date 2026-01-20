import React from "react";
import { AppConfig } from "../../types";
import { Icon } from "../Icons";
import { Button } from "../ui";

interface ConnectionSettingsProps {
  config: AppConfig;
  onChange: (config: AppConfig) => void;
}

export const ConnectionSettings: React.FC<ConnectionSettingsProps> = ({
  config,
  onChange,
}) => {
  return (
    <div className="space-y-6">
      {/* Theme Setting */}
      <div>
        <label className="block text-[11px] font-bold text-notion-light-muted dark:text-notion-dark-muted uppercase tracking-wider mb-2">
          Interface Theme
        </label>
        <div className="flex gap-4">
          <Button
            onClick={() => onChange({ ...config, theme: "LIGHT" })}
            variant="custom"
            className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium border transition-all ${
              config.theme === "LIGHT"
                ? "bg-notion-light-hover dark:bg-notion-dark-hover text-notion-light-text dark:text-notion-dark-text border-notion-light-border dark:border-notion-dark-border ring-1 ring-notion-light-border dark:ring-notion-dark-border shadow-sm"
                : "bg-notion-light-bg dark:bg-notion-dark-bg text-notion-light-muted dark:text-notion-dark-muted border-notion-light-border dark:border-notion-dark-border hover:bg-notion-light-hover dark:hover:bg-notion-dark-hover"
            }`}
            leftIcon={<Icon.Sun className="w-4 h-4" />}
          >
            Light
          </Button>
          <Button
            onClick={() => onChange({ ...config, theme: "DARK" })}
            variant="custom"
            className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium border transition-all ${
              config.theme === "DARK"
                ? "bg-notion-light-hover dark:bg-notion-dark-hover text-notion-light-text dark:text-notion-dark-text border-notion-light-border dark:border-notion-dark-border ring-1 ring-notion-light-border dark:ring-notion-dark-border shadow-sm"
                : "bg-notion-light-bg dark:bg-notion-dark-bg text-notion-light-muted dark:text-notion-dark-muted border-notion-light-border dark:border-notion-dark-border hover:bg-notion-light-hover dark:hover:bg-notion-dark-hover"
            }`}
            leftIcon={<Icon.Moon className="w-4 h-4" />}
          >
            Dark
          </Button>
        </div>
      </div>

      <div className="border-t border-notion-light-border dark:border-notion-dark-border pt-6">
        <label className="block text-[11px] font-bold text-notion-light-muted dark:text-notion-dark-muted uppercase tracking-wider mb-2">
          Operation Mode
        </label>
        <div className="flex gap-4">
          <Button
            onClick={() => onChange({ ...config, mode: "DEMO" })}
            variant="custom"
            className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium border transition-all ${
              config.mode === "DEMO"
                ? "bg-notion-light-text text-white border-notion-light-text dark:bg-notion-dark-text dark:text-black shadow-md"
                : "bg-notion-light-bg dark:bg-notion-dark-bg text-notion-light-muted dark:text-notion-dark-muted border-notion-light-border dark:border-notion-dark-border hover:bg-notion-light-hover dark:hover:bg-notion-dark-hover"
            }`}
          >
            Demo (Local)
          </Button>
          <Button
            onClick={() => onChange({ ...config, mode: "LIVE" })}
            variant="custom"
            className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium border transition-all ${
              config.mode === "LIVE"
                ? "bg-blue-600 text-white border-blue-600 shadow-md"
                : "bg-notion-light-bg dark:bg-notion-dark-bg text-notion-light-muted dark:text-notion-dark-muted border-notion-light-border dark:border-notion-dark-border hover:bg-notion-light-hover dark:hover:bg-notion-dark-hover"
            }`}
          >
            Live (Google Sheets)
          </Button>
        </div>
        <p className="text-xs text-notion-light-muted dark:text-notion-dark-muted mt-2">
          {config.mode === "DEMO"
            ? "Data is stored in your browser's LocalStorage. Good for testing."
            : "Data is synced with your sovereign Google Sheet."}
        </p>
      </div>

      {config.mode === "LIVE" && (
        <div className="space-y-4 p-4 bg-notion-light-sidebar dark:bg-notion-dark-sidebar rounded border border-notion-light-border dark:border-notion-dark-border">
          <div>
            <label className="block text-xs font-semibold text-notion-light-text dark:text-notion-dark-text mb-1">
              GAS Web App URL
            </label>
            <input
              type="text"
              placeholder="https://script.google.com/macros/s/..."
              className="w-full border border-notion-light-border dark:border-notion-dark-border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/30 bg-notion-light-bg dark:bg-notion-dark-bg text-notion-light-text dark:text-notion-dark-text"
              value={config.gasDeploymentUrl}
              onChange={(e) =>
                onChange({ ...config, gasDeploymentUrl: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-notion-light-text dark:text-notion-dark-text mb-1">
              API Secret Token
            </label>
            <input
              type="password"
              placeholder="e.g. secret-key-123"
              className="w-full border border-notion-light-border dark:border-notion-dark-border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/30 font-mono bg-notion-light-bg dark:bg-notion-dark-bg text-notion-light-text dark:text-notion-dark-text"
              value={config.apiToken || ""}
              onChange={(e) =>
                onChange({ ...config, apiToken: e.target.value })
              }
            />
            <p className="text-[10px] text-notion-light-muted dark:text-notion-dark-muted mt-1 italic">
              Must match the{" "}
              <code className="bg-notion-light-hover dark:bg-notion-dark-hover px-1 rounded">
                API_SECRET
              </code>{" "}
              variable in your Google Apps Script.
            </p>
          </div>
        </div>
      )}

      {/* AI Configuration */}
      <div className="border-t border-notion-light-border dark:border-notion-dark-border pt-6">
        <label className="block text-[11px] font-bold text-notion-light-muted dark:text-notion-dark-muted uppercase tracking-wider mb-4">
          Neural Link (AI)
        </label>
        <div className="p-4 bg-notion-light-sidebar dark:bg-notion-dark-sidebar rounded border border-notion-light-border dark:border-notion-dark-border">
          <div>
            <label className="block text-xs font-semibold text-notion-light-text dark:text-notion-dark-text mb-1">
              Gemini API Key
            </label>
            <input
              type="password"
              placeholder="AIzaSy..."
              className="w-full border border-notion-light-border dark:border-notion-dark-border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/30 font-mono bg-notion-light-bg dark:bg-notion-dark-bg text-notion-light-text dark:text-notion-dark-text"
              value={config.geminiApiKey || ""}
              onChange={(e) =>
                onChange({ ...config, geminiApiKey: e.target.value })
              }
            />
            <p className="text-xs text-notion-light-muted dark:text-notion-dark-muted mt-2">
              Required for WesAI functionality. Your key is stored locally in
              your browser.
              <br />
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1 mt-1"
              >
                Get a free key from Google AI Studio
                <Icon.External className="w-3 h-3" />
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
