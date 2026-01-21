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
        className={`w-full justify-start ${isCollapsed ? "justify-center px-0" : "px-3"} py-1.5 text-sm rounded transition-all duration-150 group ${
          isActive
            ? "bg-notion-hover text-notion-text font-medium shadow-sm"
            : "text-notion-muted hover:text-notion-text"
        }`}
        leftIcon={
          <span
            className={`${isActive ? "text-notion-text" : "text-notion-muted group-hover:text-notion-text"} flex-shrink-0 transition-colors duration-150`}
          >
            {icon}
          </span>
        }
      >
        <span
          className={`ml-2.5 whitespace-nowrap overflow-hidden transition-all duration-300 ${isCollapsed ? "max-w-0 opacity-0" : "max-w-xs opacity-100"}`}
        >
          {label}
        </span>
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
        className={`fixed top-0 left-0 z-50 h-screen bg-notion-sidebar border-r border-notion-border transition-all duration-300 ease-in-out lg:translate-x-0 ${isOpen ? "translate-x-0 shadow-xl" : "-translate-x-full"} ${widthClass}`}
      >
        <div
          className={`h-14 flex items-center justify-between transition-all duration-300 ${isCollapsed ? "px-0" : "px-4"}`}
        >
          <div
            className={`flex items-center gap-3 overflow-hidden ${isCollapsed ? "justify-center w-full" : ""}`}
          >
            <div className="w-8 h-8 rounded bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white shadow-sm flex-shrink-0">
              <Icon.Logo size={18} />
            </div>
            {!isCollapsed && (
              <span className="font-bold text-sm tracking-tight whitespace-nowrap text-notion-text">
                MyOps <span className="text-[10px] opacity-40 ml-1">v0.8</span>
              </span>
            )}
          </div>
          {!isCollapsed && (
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleCollapse}
              className="hidden lg:flex text-notion-muted hover:bg-notion-hover"
            >
              <Icon.ChevronLeft size={16} />
            </Button>
          )}
          {isCollapsed && (
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleCollapse}
              className="hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white dark:bg-notion-sidebar border border-notion-border shadow-sm items-center justify-center text-notion-muted z-50 hover:text-violet-500 transition-colors"
            >
              <Icon.ChevronRight size={12} />
            </Button>
          )}
        </div>

        <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto custom-scrollbar">
          {NAVIGATION_CONFIG.map((group) => (
            <div key={group.title} className="mb-6 last:mb-0">
              {!isCollapsed && (
                <div className="px-3 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-notion-muted">
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
          className={`p-2 border-t border-notion-border space-y-0.5 ${isCollapsed ? "items-center" : ""}`}
        >
          <Button
            variant="ghost"
            onClick={() => setShowSettings(true)}
            className={`w-full justify-start ${isCollapsed ? "justify-center px-0" : "px-3"} py-1.5 text-sm text-notion-muted hover:text-notion-text rounded transition-colors group`}
            leftIcon={<Icon.Settings size={18} />}
          >
            <span
              className={`ml-2.5 overflow-hidden transition-all duration-300 ${isCollapsed ? "max-w-0 opacity-0" : "max-w-xs opacity-100"}`}
            >
              Settings
            </span>
          </Button>
        </div>
      </aside>
    </>
  );
});
