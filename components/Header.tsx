import React, { useMemo, useCallback } from "react";
import { Icon, iconProps } from "./Icons";
import { Button } from "./ui/Button";
import { useConfig } from "../hooks/useConfig";
import { useUi } from "../hooks/useUi";

export const Header: React.FC = React.memo(() => {
  const { config, setConfig } = useConfig();
  const ui = useUi();

  const title = useMemo(() => {
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
  }, [ui.activePage]);

  const toggleTheme = useCallback(() => {
    setConfig((prev) => ({
      ...prev,
      theme: prev.theme === "LIGHT" ? "DARK" : "LIGHT",
    }));
  }, [setConfig]);

  return (
    <header className="h-16 bg-white/80 dark:bg-notion-dark-bg/80 backdrop-blur-xl border-b border-notion-light-border/50 dark:border-notion-dark-border/50 flex items-center justify-between px-6 sm:px-8 sticky top-0 z-30 transition-all duration-500 shadow-sm">
      <div className="flex items-center gap-4">
        {/* Mobile Hamburger */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => ui.setIsSidebarOpen(true)}
          className="lg:hidden text-notion-light-muted dark:text-notion-dark-muted hover:text-notion-light-text dark:hover:text-notion-dark-text rounded-xl bg-notion-light-hover/30 dark:bg-notion-dark-hover/30"
          leftIcon={<Icon.Menu {...iconProps(20)} />}
        />

        <div className="flex items-center gap-3">
          <div className="hidden sm:block h-6 w-px bg-notion-light-border dark:bg-notion-dark-border/40 mx-1 opacity-50" />
          <h2 className="text-[11px] font-black text-notion-light-text dark:text-notion-dark-text tracking-[0.25em] uppercase opacity-80">
            {title}
          </h2>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* AI Chat Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => ui.setIsAiChatOpen(true)}
          className="hidden md:flex text-notion-light-muted dark:text-notion-dark-muted font-black uppercase tracking-[0.2em] text-[9px] hover:text-indigo-600 dark:hover:text-indigo-400 rounded-xl hover:bg-indigo-600/5 transition-all py-1.5 px-4 border border-transparent hover:border-indigo-600/10"
          leftIcon={
            <Icon.Chat
              size={14}
              className="text-indigo-600 dark:text-indigo-400"
            />
          }
        >
          Wes Interface
        </Button>

        <div className="h-5 w-px bg-notion-light-border dark:bg-notion-dark-border/40 mx-2 opacity-30" />

        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="h-9 w-9 text-notion-light-muted dark:text-notion-dark-muted hover:text-amber-500 dark:hover:text-amber-400 rounded-xl hover:bg-amber-500/5 transition-all"
          title={
            config.theme === "LIGHT"
              ? "Switch to Dark Mode"
              : "Switch to Light Mode"
          }
          leftIcon={
            config.theme === "LIGHT" ? (
              <Icon.Moon size={18} />
            ) : (
              <Icon.Sun size={18} />
            )
          }
        />

        {/* Global Create Action */}
        <Button
          variant="primary"
          size="sm"
          onClick={ui.openCreate}
          className="hidden sm:flex font-black uppercase tracking-[0.2em] text-[9px] ml-2 px-6 py-2 rounded-xl shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/40 transition-all active:scale-95 border-none bg-gradient-to-r from-indigo-600 to-violet-600"
        >
          New Mission
        </Button>
      </div>
    </header>
  );
});
