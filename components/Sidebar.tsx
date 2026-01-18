import React from "react";
import { Page, AppConfig } from "../types";
import { Icon, iconProps } from "./Icons";

interface SidebarProps {
  activePage: Page;
  setActivePage: (page: Page) => void;
  onOpenSettings: () => void;
  config: AppConfig;
  isOpen: boolean; // Mobile open state
  setIsOpen: (isOpen: boolean) => void;
  isCollapsed: boolean; // Desktop collapsed state
  toggleCollapse: () => void;
}

interface NavItemProps {
  page: Page;
  label: string;
  icon: React.ReactNode;
  activePage: Page;
  setActivePage: (page: Page) => void;
  setIsOpen: (isOpen: boolean) => void;
  isCollapsed: boolean;
}

const NavItem: React.FC<NavItemProps> = ({
  page,
  label,
  icon,
  activePage,
  setActivePage,
  setIsOpen,
  isCollapsed,
}) => {
  const isActive = activePage === page;
  return (
    <button
      onClick={() => {
        setActivePage(page);
        setIsOpen(false);
      }}
      title={isCollapsed ? label : ""}
      className={`w-full flex items-center ${isCollapsed ? "justify-center px-0" : "px-3"} py-1.5 text-sm rounded transition-all duration-150 group active:scale-[0.98] ${
        isActive
          ? "bg-notion-light-hover dark:bg-notion-dark-hover text-notion-light-text dark:text-notion-dark-text font-medium shadow-sm"
          : "text-notion-light-muted dark:text-notion-dark-muted hover:bg-notion-light-hover/60 dark:hover:bg-notion-dark-hover/60 hover:text-notion-light-text dark:hover:text-notion-dark-text"
      }`}
    >
      <span
        className={`${isActive ? "text-notion-light-text dark:text-notion-dark-text" : "text-notion-light-muted dark:text-notion-dark-muted group-hover:text-notion-light-text dark:group-hover:text-notion-dark-text"} flex-shrink-0 transition-colors duration-150`}
      >
        {icon}
      </span>
      <span
        className={`ml-2.5 whitespace-nowrap overflow-hidden transition-all duration-300 ${isCollapsed ? "max-w-0 opacity-0" : "max-w-xs opacity-100"}`}
      >
        {label}
      </span>
    </button>
  );
};

export const Sidebar: React.FC<SidebarProps> = ({
  activePage,
  setActivePage,
  onOpenSettings,
  config,
  isOpen,
  setIsOpen,
  isCollapsed,
  toggleCollapse,
}) => {
  const widthClass = isOpen ? "w-60" : isCollapsed ? "w-16" : "w-60";

  const renderNavItem = (page: Page, label: string, icon: React.ReactNode) => (
    <NavItem
      page={page}
      label={label}
      icon={icon}
      activePage={activePage}
      setActivePage={setActivePage}
      setIsOpen={setIsOpen}
      isCollapsed={isCollapsed}
    />
  );

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-[1px] z-40 lg:hidden animate-fade-in"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-50 h-screen bg-notion-light-sidebar dark:bg-notion-dark-sidebar border-r border-notion-light-border dark:border-notion-dark-border transition-all duration-300 ease-in-out lg:translate-x-0 ${isOpen ? "translate-x-0 shadow-xl" : "-translate-x-full"} ${widthClass}`}
      >
        <div
          className={`h-14 flex items-center transition-all duration-300 ${isCollapsed ? "justify-center px-0" : "px-4"}`}
        >
          <div
            className="flex-shrink-0 relative group cursor-pointer flex items-center gap-2"
            onClick={() => setActivePage("DASHBOARD")}
          >
            <img
              src="/favicon.svg"
              alt="MyOps Logo"
              className="w-8 h-8 rounded-lg shadow-sm group-hover:scale-110 transition-transform duration-300"
            />
            <h1
              className={`text-notion-light-text dark:text-notion-dark-text font-bold tracking-tight text-sm leading-none transition-all duration-300 ${isCollapsed ? "max-w-0 opacity-0" : "max-w-xs opacity-100"}`}
            >
              MyOps
            </h1>
          </div>
        </div>

        <nav className="px-2 py-4 space-y-0.5 mt-2 overflow-y-auto max-h-[calc(100vh-100px)] scrollbar-hide">
          <div
            className={`px-3 mb-2 text-[10px] font-bold text-notion-light-text/40 dark:text-notion-dark-text/40 uppercase tracking-[0.2em] transition-all duration-300 ${isCollapsed ? "opacity-0 h-0 hidden" : "opacity-100"}`}
          >
            Operational
          </div>

          {renderNavItem(
            "DASHBOARD",
            "Command Center",
            <Icon.Dashboard {...iconProps(18)} />,
          )}

          {renderNavItem(
            "MISSIONS",
            "Mission Control",
            <Icon.Missions {...iconProps(18)} />,
          )}

          {renderNavItem(
            "CRM",
            "CRM & Contacts",
            <Icon.Users {...iconProps(18)} />,
          )}

          {renderNavItem(
            "AUTOMATION",
            "Active Agents",
            <Icon.Active {...iconProps(18)} />,
          )}

          <div
            className={`px-3 mb-2 mt-6 text-[10px] font-bold text-notion-light-text/40 dark:text-notion-dark-text/40 uppercase tracking-[0.2em] transition-all duration-300 ${isCollapsed ? "opacity-0 h-0 hidden" : "opacity-100"}`}
          >
            Intelligence
          </div>

          {renderNavItem(
            "KNOWLEDGE",
            "Knowledge Base",
            <Icon.Docs {...iconProps(18)} />,
          )}

          {renderNavItem(
            "INSIGHTS",
            "Insights & XP",
            <Icon.Analytics {...iconProps(18)} />,
          )}

          {renderNavItem(
            "WESAI",
            "WesAI Co-Pilot",
            <Icon.Ai {...iconProps(18)} />,
          )}

          {renderNavItem(
            "AWARENESS",
            "Mental State",
            <Icon.Strategy {...iconProps(18)} />,
          )}

          {renderNavItem(
            "VAULT",
            "Secure Vault",
            <Icon.Vault {...iconProps(18)} />,
          )}

          <div
            className={`px-3 mb-2 mt-6 text-[10px] font-bold text-notion-light-text/40 dark:text-notion-dark-text/40 uppercase tracking-[0.2em] transition-all duration-300 ${isCollapsed ? "opacity-0 h-0 hidden" : "opacity-100"}`}
          >
            Strategy
          </div>

          {renderNavItem(
            "BLUEPRINT",
            "Master Blueprint",
            <Icon.Blueprint {...iconProps(18)} />,
          )}

          {renderNavItem(
            "STRATEGY",
            "Decision Journal",
            <Icon.Strategy {...iconProps(18)} />,
          )}

          <div
            className={`px-3 mb-2 mt-6 text-[10px] font-bold text-notion-light-text/40 dark:text-notion-dark-text/40 uppercase tracking-[0.2em] transition-all duration-300 ${isCollapsed ? "opacity-0 h-0 hidden" : "opacity-100"}`}
          >
            Reporting
          </div>

          {renderNavItem(
            "REPORT",
            "Health Report",
            <Icon.Report {...iconProps(18)} />,
          )}
        </nav>

        <div className="absolute bottom-0 left-0 w-full bg-notion-light-sidebar dark:bg-notion-dark-sidebar border-t border-notion-light-border dark:border-notion-dark-border">
          {!isCollapsed && (
            <div className="px-5 py-3">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-1.5 h-1.5 rounded-full ${config.geminiApiKey ? "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)] animate-pulse" : "bg-notion-light-border dark:bg-notion-dark-border"}`}
                ></div>
                <span className="text-[9px] font-bold text-notion-light-text/40 dark:text-notion-dark-text/40 uppercase tracking-widest">
                  WESAI: {config.geminiApiKey ? "LINKED" : "OFFLINE"}
                </span>
              </div>
            </div>
          )}

          <div className="hidden lg:flex justify-end px-3 py-1">
            <button
              onClick={toggleCollapse}
              className="p-1.5 text-notion-light-text/40 hover:text-notion-light-text dark:text-notion-dark-text/40 dark:hover:text-notion-dark-text rounded-md hover:bg-notion-light-border dark:hover:bg-notion-dark-border transition-all duration-200 active:scale-90"
              title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              {isCollapsed ? (
                <Icon.Next {...iconProps(14)} />
              ) : (
                <Icon.Prev {...iconProps(14)} />
              )}
            </button>
          </div>

          <div className="p-2 pb-4">
            <button
              onClick={() => {
                onOpenSettings();
                setIsOpen(false);
              }}
              title={isCollapsed ? "System Configuration" : ""}
              className={`w-full flex items-center ${isCollapsed ? "justify-center px-0" : "px-3"} py-2 text-sm font-medium text-notion-light-text/60 dark:text-notion-dark-text/60 hover:text-notion-light-text dark:hover:text-notion-dark-text hover:bg-notion-light-border dark:hover:bg-notion-dark-border rounded-lg transition-all duration-200 group active:scale-[0.98]`}
            >
              <span className="flex-shrink-0 group-hover:rotate-45 transition-transform duration-500">
                <Icon.Settings {...iconProps(18)} />
              </span>
              <span
                className={`ml-3 whitespace-nowrap overflow-hidden transition-all duration-300 ${isCollapsed ? "max-w-0 opacity-0" : "max-w-xs opacity-100"}`}
              >
                Configuration
              </span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
