import React from "react";
import { Page } from "../types";
import { Icon } from "./Icons";
import { Button } from "./ui/Button";
import { NAVIGATION_CONFIG } from "../constants/navigation";
import { useUi } from "../hooks/useUi";

interface NavItemProps {
  page: Page;
  label: string;
  icon: React.ReactNode;
  activePage: Page;
  setActivePage: (page: Page) => void;
  setIsOpen: (isOpen: boolean) => void;
  isCollapsed: boolean;
}

const NavItem: React.FC<NavItemProps> = React.memo(
  ({
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
      <Button
        variant="ghost"
        onClick={() => {
          setActivePage(page);
          setIsOpen(false);
        }}
        title={isCollapsed ? label : ""}
        className={`w-full justify-start ${isCollapsed ? "justify-center px-0" : "px-3"} py-2 text-sm rounded-xl transition-all duration-300 group relative ${
          isActive
            ? "bg-indigo-600/10 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 font-bold shadow-[inset_0_0_0_1px_rgba(79,70,229,0.2)]"
            : "text-notion-light-muted dark:text-notion-dark-muted hover:text-notion-light-text dark:hover:text-notion-dark-text hover:bg-notion-light-hover/50 dark:hover:bg-notion-dark-hover/50"
        }`}
        leftIcon={
          <span
            className={`${isActive ? "text-indigo-600 dark:text-indigo-400 scale-110 drop-shadow-[0_0_8px_rgba(79,70,229,0.4)]" : "text-notion-light-muted dark:text-notion-dark-muted group-hover:text-notion-light-text dark:group-hover:text-notion-dark-text"} flex-shrink-0 transition-all duration-300`}
          >
            {icon}
          </span>
        }
      >
        <span
          className={`ml-3 whitespace-nowrap overflow-hidden transition-all duration-500 ${isCollapsed ? "max-w-0 opacity-0" : "max-w-xs opacity-100"}`}
        >
          {label}
        </span>
        {isActive && !isCollapsed && (
          <div className="absolute left-0 top-2 bottom-2 w-1 bg-indigo-600 dark:bg-indigo-500 rounded-full shadow-[0_0_10px_rgba(79,70,229,0.8)]" />
        )}
      </Button>
    );
  },
);

NavItem.displayName = "NavItem";

export const Sidebar: React.FC = React.memo(() => {
  const ui = useUi();
  const {
    activePage,
    setActivePage,
    setShowSettings,
    isSidebarOpen: isOpen,
    setIsSidebarOpen: setIsOpen,
    isSidebarCollapsed: isCollapsed,
    toggleSidebarCollapse: toggleCollapse,
  } = ui;

  const widthClass = isOpen ? "w-60" : isCollapsed ? "w-16" : "w-60";

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-[1px] z-40 lg:hidden animate-fade-in"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-50 h-screen bg-notion-light-sidebar dark:bg-notion-dark-sidebar border-r border-notion-light-border dark:border-notion-dark-border transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] lg:translate-x-0 ${isOpen ? "translate-x-0 shadow-2xl shadow-black/40" : "-translate-x-full"} ${widthClass}`}
      >
        <div
          className={`h-16 flex items-center transition-all duration-500 ${isCollapsed ? "px-0 justify-center" : "px-5 justify-between"}`}
        >
          <div
            className={`flex items-center gap-3 overflow-hidden ${isCollapsed ? "justify-center" : ""}`}
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-700 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 flex-shrink-0 animate-pulse-slow">
              <Icon.Logo size={20} className="drop-shadow-sm" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col">
                <span className="font-black text-sm tracking-tighter whitespace-nowrap text-notion-light-text dark:text-notion-dark-text uppercase leading-none">
                  MyOps
                </span>
                <span className="text-[9px] font-black text-indigo-500 dark:text-indigo-400 tracking-[0.2em] uppercase mt-0.5 opacity-80">
                  Command <span className="opacity-40">v0.9</span>
                </span>
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleCollapse}
            className={`hidden lg:flex h-8 w-8 text-notion-light-muted dark:text-notion-dark-muted hover:text-notion-light-text dark:hover:text-notion-dark-text hover:bg-notion-light-hover/80 dark:hover:bg-notion-dark-hover/80 rounded-lg transition-all duration-300 ${isCollapsed ? "absolute -right-4 top-4 bg-white dark:bg-notion-dark-sidebar border border-notion-light-border dark:border-notion-dark-border shadow-md z-[60]" : ""}`}
            leftIcon={
              <Icon.ChevronLeft
                size={14}
                className={`transition-transform duration-500 ${isCollapsed ? "rotate-180" : ""}`}
              />
            }
          />
        </div>

        <nav className="px-3 py-6 flex flex-col gap-1 overflow-y-auto h-[calc(100vh-140px)] scrollbar-hide">
          {NAVIGATION_CONFIG.map((group) => (
            <div key={group.title} className="mb-6 last:mb-0">
              {!isCollapsed && (
                <div className="px-3 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-notion-light-muted dark:text-notion-dark-muted">
                    {group.title}
                  </span>
                </div>
              )}
              <div className="space-y-0.5">
                {group.items.map((item) => (
                  <NavItem
                    key={item.page}
                    page={item.page}
                    label={item.label}
                    icon={item.icon}
                    activePage={activePage}
                    setActivePage={setActivePage}
                    setIsOpen={setIsOpen}
                    isCollapsed={isCollapsed}
                  />
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div
          className={`p-2 border-t border-notion-light-border dark:border-notion-dark-border space-y-0.5 flex flex-col ${isCollapsed ? "items-center" : ""}`}
        >
          <Button
            variant="ghost"
            onClick={() => setShowSettings(true)}
            title={isCollapsed ? "Settings" : ""}
            className={`w-full justify-start ${isCollapsed ? "justify-center px-0" : "px-3"} py-1.5 text-sm text-notion-light-muted dark:text-notion-dark-muted hover:text-notion-light-text dark:hover:text-notion-dark-text rounded-lg transition-all duration-150 group`}
            leftIcon={
              <span className="flex-shrink-0">
                <Icon.Settings size={18} />
              </span>
            }
          >
            <span
              className={`ml-2.5 whitespace-nowrap overflow-hidden transition-all duration-300 ${isCollapsed ? "max-w-0 opacity-0" : "max-w-xs opacity-100"}`}
            >
              Settings
            </span>
          </Button>
        </div>
      </aside>
    </>
  );
});
