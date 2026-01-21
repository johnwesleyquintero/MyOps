import React from "react";
import { Page } from "../types";
import { Icon, iconProps } from "./Icons";
import { MODULE_COLORS } from "../constants/ui";
import { Button } from "./ui/Button";
import { NAVIGATION_CONFIG } from "../constants/navigation";
import { useAppContext } from "../contexts/AppContext";

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
    <Button
      variant="ghost"
      onClick={() => {
        setActivePage(page);
        setIsOpen(false);
      }}
      title={isCollapsed ? label : ""}
      className={`w-full justify-start ${isCollapsed ? "justify-center px-0" : "px-3"} py-1.5 text-sm rounded transition-all duration-150 group ${
        isActive
          ? "bg-notion-light-hover dark:bg-notion-dark-hover text-notion-light-text dark:text-notion-dark-text font-medium shadow-sm"
          : "text-notion-light-muted dark:text-notion-dark-muted hover:text-notion-light-text dark:hover:text-notion-dark-text"
      }`}
      leftIcon={
        <span
          className={`${isActive ? "text-notion-light-text dark:text-notion-dark-text" : "text-notion-light-muted dark:text-notion-dark-muted group-hover:text-notion-light-text dark:group-hover:text-notion-dark-text"} flex-shrink-0 transition-colors duration-150`}
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
};

export const Sidebar: React.FC = () => {
  const { ui } = useAppContext();
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
          className={`h-14 flex items-center justify-between transition-all duration-300 ${isCollapsed ? "px-0" : "px-4"}`}
        >
          <div
            className={`flex items-center gap-2 cursor-pointer group ${isCollapsed ? "w-full justify-center" : ""}`}
            onClick={() => setActivePage("DASHBOARD")}
          >
            <div className="relative flex-shrink-0">
              <img
                src="/favicon.svg"
                alt="MyOps Logo"
                className="w-8 h-8 rounded-lg shadow-sm group-hover:scale-110 transition-transform duration-300"
              />
              <div
                className={`absolute -top-1 -right-1 w-2.5 h-2.5 ${MODULE_COLORS.sovereign.dot} border-2 border-notion-light-sidebar dark:border-notion-dark-sidebar rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]`}
              ></div>
            </div>
            {!isCollapsed && (
              <div className="flex flex-col animate-fade-in">
                <h1 className="text-notion-light-text dark:text-notion-dark-text font-black tracking-tighter text-base leading-none">
                  MyOps
                </h1>
                <p className="text-[9px] text-notion-light-muted dark:text-notion-dark-muted font-bold uppercase tracking-widest mt-0.5 whitespace-nowrap">
                  Master Solo VA
                </p>
              </div>
            )}
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleCollapse}
            className={`hidden lg:flex text-notion-light-text/40 hover:text-notion-light-text dark:text-notion-dark-text/40 dark:hover:text-notion-dark-text rounded-md ${
              isCollapsed
                ? "absolute -right-3 top-4 bg-notion-light-sidebar dark:bg-notion-dark-sidebar border border-notion-light-border dark:border-notion-dark-border shadow-sm z-50"
                : ""
            }`}
            title={isCollapsed ? "Expand" : "Collapse"}
          >
            {isCollapsed ? (
              <Icon.Next {...iconProps(12)} />
            ) : (
              <Icon.Prev {...iconProps(12)} />
            )}
          </Button>
        </div>

        {/* Quick Action Button - "OP" Upgrade */}
        {!isCollapsed && (
          <div className="px-4 mb-4 mt-2">
            <Button
              variant="primary"
              size="sm"
              onClick={() => setActivePage("MISSIONS")}
              className="w-full bg-notion-light-text dark:bg-notion-dark-text text-white dark:text-black hover:opacity-90 rounded-lg py-2 group"
              leftIcon={
                <Icon.Add
                  {...iconProps(14)}
                  className="group-hover:rotate-90 transition-transform duration-300"
                />
              }
            >
              New Mission
            </Button>
          </div>
        )}

        <nav className="px-2 pt-2 pb-20 space-y-0.5 mt-1 overflow-y-auto max-h-[calc(100vh-140px)] custom-scrollbar pr-1">
          {NAVIGATION_CONFIG.map((category, catIndex) => (
            <React.Fragment key={category.title}>
              <div
                className={`px-3 mb-2 flex items-center gap-2 text-[10px] font-bold text-notion-light-text/30 dark:text-notion-dark-text/30 uppercase tracking-[0.2em] transition-all duration-300 ${catIndex > 0 ? "mt-6" : ""} ${isCollapsed ? "opacity-0 h-0 hidden" : "opacity-100"}`}
              >
                <span className="flex-shrink-0">{category.title}</span>
                <div className="flex-1 h-[1px] bg-notion-light-border/50 dark:bg-notion-dark-border/20"></div>
              </div>

              {category.items.map((item) =>
                renderNavItem(item.page, item.label, item.icon),
              )}
            </React.Fragment>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 w-full bg-notion-light-sidebar dark:bg-notion-dark-sidebar border-t border-notion-light-border dark:border-notion-dark-border">
          <div className="p-2 pb-4">
            <Button
              variant="ghost"
              onClick={() => {
                setShowSettings(true);
                setIsOpen(false);
              }}
              title={isCollapsed ? "System Configuration" : ""}
              className={`w-full justify-start ${isCollapsed ? "px-0 justify-center" : "px-3"} py-2 text-sm font-medium text-notion-light-text/60 dark:text-notion-dark-text/60 hover:text-notion-light-text dark:hover:text-notion-dark-text rounded-lg group`}
              leftIcon={
                <span className="flex-shrink-0 group-hover:rotate-45 transition-transform duration-500">
                  <Icon.Settings {...iconProps(18)} />
                </span>
              }
            >
              <span
                className={`ml-3 whitespace-nowrap overflow-hidden transition-all duration-300 ${isCollapsed ? "max-w-0 opacity-0" : "max-w-xs opacity-100"}`}
              >
                System Settings
              </span>
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
};
