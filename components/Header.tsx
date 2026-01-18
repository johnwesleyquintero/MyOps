import React from "react";
import { Page, AppConfig } from "../types";
import { Icon, iconProps } from "./Icons";

interface HeaderProps {
  activePage: Page;
  onMenuToggle: () => void;
  onOpenCreate: () => void;
  onOpenAiChat: () => void;
  config: AppConfig;
  setConfig: (config: AppConfig) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activePage,
  onMenuToggle,
  onOpenCreate,
  onOpenAiChat,
  config,
  setConfig,
}) => {
  const getTitle = () => {
    switch (activePage) {
      case "DASHBOARD":
        return "Command Center";
      case "MISSIONS":
        return "Mission Control";
      case "CRM":
        return "CRM & Contacts";
      case "KNOWLEDGE":
        return "Knowledge Base";
      case "INSIGHTS":
        return "Operational Insights";
      case "VAULT":
        return "Secure Vault";
      case "AUTOMATION":
        return "Automation Engine";
      case "BLUEPRINT":
        return "System Blueprint";
      default:
        return "System";
    }
  };

  const toggleTheme = () => {
    setConfig({
      ...config,
      theme: config.theme === "LIGHT" ? "DARK" : "LIGHT",
    });
  };

  return (
    <header className="h-14 bg-notion-light-bg dark:bg-notion-dark-bg border-b border-notion-light-border dark:border-notion-dark-border flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30 transition-colors duration-200">
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger */}
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-1.5 text-notion-light-muted dark:text-notion-dark-muted hover:bg-notion-light-hover dark:hover:bg-notion-dark-hover rounded transition-colors"
        >
          <Icon.Menu {...iconProps(20)} />
        </button>

        <h2 className="text-sm font-semibold text-notion-light-text dark:text-notion-dark-text tracking-tight">
          {getTitle()}
        </h2>
      </div>

      <div className="flex items-center gap-2">
        {/* AI Chat Button */}
        <button
          onClick={onOpenAiChat}
          className="hidden sm:flex items-center gap-2 text-notion-light-muted dark:text-notion-dark-muted hover:bg-notion-light-hover dark:hover:bg-notion-dark-hover px-2 py-1.5 rounded text-xs font-medium transition-all"
        >
          <Icon.Chat {...iconProps(16)} />
          Ask Wes
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-1.5 text-notion-light-muted dark:text-notion-dark-muted hover:bg-notion-light-hover dark:hover:bg-notion-dark-hover rounded transition-colors"
          title={
            config.theme === "LIGHT"
              ? "Switch to Dark Mode"
              : "Switch to Light Mode"
          }
        >
          {config.theme === "LIGHT" ? (
            <Icon.Moon {...iconProps(18)} />
          ) : (
            <Icon.Sun {...iconProps(18)} />
          )}
        </button>

        <div className="w-[1px] h-4 bg-notion-light-border dark:bg-notion-dark-border mx-1" />

        {/* Quick Action: New Task */}
        <button
          onClick={onOpenCreate}
          className="notion-button notion-button-primary"
        >
          <Icon.Add {...iconProps(14, "stroke-[3px]")} />
          <span className="hidden xs:inline">New</span>
        </button>
      </div>
    </header>
  );
};
