import React from "react";
import { Icon, iconProps } from "./Icons";
import { Button } from "./ui/Button";
import { useConfig } from "../hooks/useConfig";
import { useUi } from "../hooks/useUi";

export const Header: React.FC = () => {
  const { config, setConfig } = useConfig();
  const ui = useUi();

  const getTitle = () => {
    switch (ui.activePage) {
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
        <Button
          variant="ghost"
          size="icon"
          onClick={() => ui.setIsSidebarOpen(true)}
          className="lg:hidden text-notion-light-muted dark:text-notion-dark-muted"
          leftIcon={<Icon.Menu {...iconProps(20)} />}
        />

        <h2 className="text-sm font-semibold text-notion-light-text dark:text-notion-dark-text tracking-tight">
          {getTitle()}
        </h2>
      </div>

      <div className="flex items-center gap-2">
        {/* AI Chat Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => ui.setIsAiChatOpen(true)}
          className="hidden sm:flex text-notion-light-muted dark:text-notion-dark-muted font-medium"
          leftIcon={<Icon.Chat {...iconProps(16)} />}
        >
          Ask Wes
        </Button>

        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="text-notion-light-muted dark:text-notion-dark-muted"
          title={
            config.theme === "LIGHT"
              ? "Switch to Dark Mode"
              : "Switch to Light Mode"
          }
          leftIcon={
            config.theme === "LIGHT" ? (
              <Icon.Moon {...iconProps(18)} />
            ) : (
              <Icon.Sun {...iconProps(18)} />
            )
          }
        />

        {/* Global Create Action */}
        <Button
          variant="primary"
          size="sm"
          onClick={ui.openCreate}
          className="hidden sm:flex"
          leftIcon={<Icon.Plus {...iconProps(16)} />}
        >
          Mission
        </Button>
      </div>
    </header>
  );
};
