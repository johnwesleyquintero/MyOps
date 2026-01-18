import React from "react";
import { Icon } from "./Icons";

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const groups = [
    {
      title: "Navigation",
      items: [
        { keys: ["g", "d"], label: "Go to Dashboard" },
        { keys: ["g", "m"], label: "Go to Missions" },
        { keys: ["⌘", "K"], label: "Command Palette" },
      ],
    },
    {
      title: "Actions",
      items: [
        { keys: ["c"], label: "Create Task" },
        { keys: ["/"], label: "Search Missions" },
        { keys: ["?"], label: "Show Help" },
      ],
    },
    {
      title: "General",
      items: [
        { keys: ["Esc"], label: "Close Modal / Cancel" },
        { keys: ["⌘", "Enter"], label: "Save Form" },
      ],
    },
  ];

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/20 dark:bg-black/40 backdrop-blur-[2px] animate-in fade-in duration-300"
      onClick={onClose}
    >
      <div
        className="bg-notion-light-bg dark:bg-notion-dark-bg rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-notion-light-border dark:border-notion-dark-border animate-in zoom-in-95 slide-in-from-bottom-4 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-notion-light-border dark:border-notion-dark-border flex justify-between items-center bg-notion-light-bg dark:bg-notion-dark-bg">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-notion-light-sidebar dark:bg-notion-dark-sidebar rounded-lg border border-notion-light-border dark:border-notion-dark-border">
              <Icon.Missions
                size={14}
                className="text-notion-light-text dark:text-notion-dark-text"
              />
            </div>
            <h3 className="font-black text-notion-light-text dark:text-notion-dark-text text-[12px] uppercase tracking-widest">
              Keyboard Shortcuts
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-notion-light-muted hover:text-notion-light-text dark:hover:text-notion-dark-text hover:bg-notion-light-sidebar dark:hover:bg-notion-dark-sidebar rounded-lg transition-all"
          >
            <Icon.Close size={16} />
          </button>
        </div>

        <div className="p-8 space-y-8">
          {groups.map((group) => (
            <div key={group.title} className="space-y-4">
              <h4 className="text-[10px] font-black text-notion-light-muted dark:text-notion-dark-muted uppercase tracking-[0.2em] border-b border-notion-light-border dark:border-notion-dark-border pb-2">
                {group.title}
              </h4>
              <div className="space-y-4">
                {group.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center group"
                  >
                    <span className="text-sm text-notion-light-text dark:text-notion-dark-text font-bold opacity-80 group-hover:opacity-100 transition-opacity">
                      {item.label}
                    </span>
                    <div className="flex gap-1.5">
                      {item.keys.map((k, kIdx) => (
                        <kbd
                          key={kIdx}
                          className="bg-notion-light-sidebar dark:bg-notion-dark-sidebar border border-notion-light-border dark:border-notion-dark-border rounded-lg px-2.5 py-1 text-[11px] font-black text-notion-light-text dark:text-notion-dark-text min-w-[32px] text-center shadow-sm group-hover:border-notion-light-text/20 dark:group-hover:border-notion-dark-text/20 transition-all"
                        >
                          {k}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="px-6 py-5 bg-notion-light-sidebar dark:bg-notion-dark-sidebar border-t border-notion-light-border dark:border-notion-dark-border">
          <p className="text-[11px] text-notion-light-muted dark:text-notion-dark-muted text-center font-bold tracking-tight">
            Tip: Press{" "}
            <kbd className="px-2 py-0.5 bg-notion-light-bg dark:bg-notion-dark-bg rounded-md border border-notion-light-border dark:border-notion-dark-border font-black mx-1">
              ?
            </kbd>{" "}
            at any time to view this menu.
          </p>
        </div>
      </div>
    </div>
  );
};
