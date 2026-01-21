import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from "react";
import { TaskEntry } from "../types";
import { PRIORITY_DOTS } from "@/constants";
import { Icon, iconProps } from "./Icons";
import { Button } from "./ui/Button";
import { useAppContext } from "../contexts/AppContext";

type CommandType = "ACTION" | "NAVIGATION" | "TASK" | "CONTACT" | "NOTE";

interface CommandItem {
  id: string;
  type: CommandType;
  label: string;
  subLabel?: string;
  icon?: React.ReactNode;
  action: () => void;
  meta?: TaskEntry;
}

export const CommandPalette: React.FC = () => {
  const { ui, tasks, crm, notes: notesData } = useAppContext();
  const { entries } = tasks;
  const { contacts } = crm;
  const { notes } = notesData;
  const {
    isCmdPaletteOpen: isOpen,
    setIsCmdPaletteOpen: setIsOpen,
    setActivePage: onNavigate,
    openCreate: onCreate,
    openCreateNote,
    openEdit: onEdit,
    openEditContact: onEditContact,
    openEditNote: onEditNote,
    setShowSettings,
    enterFocus: onToggleFocus,
  } = ui;

  const onSettings = useCallback(
    () => setShowSettings(true),
    [setShowSettings],
  );
  const onClose = useCallback(() => setIsOpen(false), [setIsOpen]);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  const [prevFilteredLength, setPrevFilteredLength] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
    }
  }

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const staticCommands: CommandItem[] = useMemo(
    () => [
      {
        id: "nav-dashboard",
        type: "NAVIGATION",
        label: "Go to Command Center",
        subLabel: "Dashboard & active metrics",
        icon: <Icon.Dashboard {...iconProps(16)} />,
        action: () => onNavigate("DASHBOARD"),
      },
      {
        id: "nav-missions",
        type: "NAVIGATION",
        label: "Go to Mission Control",
        subLabel: "Task management & backlog",
        icon: <Icon.Missions {...iconProps(16)} />,
        action: () => onNavigate("MISSIONS"),
      },
      {
        id: "nav-crm",
        type: "NAVIGATION",
        label: "Go to CRM & Contacts",
        subLabel: "Manage leads and interactions",
        icon: <Icon.Users {...iconProps(16)} />,
        action: () => onNavigate("CRM"),
      },
      {
        id: "nav-automation",
        type: "NAVIGATION",
        label: "Go to Active Agents",
        subLabel: "Automated workflows",
        icon: <Icon.Active {...iconProps(16)} />,
        action: () => onNavigate("AUTOMATION"),
      },
      {
        id: "nav-knowledge",
        type: "NAVIGATION",
        label: "Go to Knowledge Base",
        subLabel: "Notes and documentation",
        icon: <Icon.Docs {...iconProps(16)} />,
        action: () => onNavigate("KNOWLEDGE"),
      },
      {
        id: "nav-vault",
        type: "NAVIGATION",
        label: "Go to Secure Vault",
        subLabel: "Encrypted data & keys",
        icon: <Icon.Vault {...iconProps(16)} />,
        action: () => onNavigate("VAULT"),
      },
      {
        id: "action-new-task",
        type: "ACTION",
        label: "New Mission",
        subLabel: "Create a new task",
        icon: <Icon.Add {...iconProps(16)} />,
        action: () => onCreate(),
      },
      {
        id: "action-new-note",
        type: "ACTION",
        label: "New Note",
        subLabel: "Create a new knowledge entry",
        icon: <Icon.Docs {...iconProps(16)} />,
        action: () => openCreateNote?.(),
      },
      {
        id: "action-settings",
        type: "ACTION",
        label: "System Settings",
        subLabel: "Configure application",
        icon: <Icon.Settings {...iconProps(16)} />,
        action: () => onSettings(),
      },
    ],
    [onNavigate, onCreate, openCreateNote, onSettings],
  );

  const filteredCommands = useMemo(() => {
    const normalize = (s: string) => s.toLowerCase();
    const q = normalize(query);

    const cmds = staticCommands.filter(
      (c) =>
        normalize(c.label).includes(q) ||
        (c.subLabel && normalize(c.subLabel).includes(q)),
    );

    const tasks: CommandItem[] = entries
      .filter(
        (t) =>
          normalize(t.description).includes(q) ||
          normalize(t.project).includes(q),
      )
      .slice(0, 5)
      .map((t) => ({
        id: t.id,
        type: "TASK",
        label: t.description,
        subLabel: `${t.project} • ${t.status}`,
        meta: t,
        action: () => onEdit(t),
      }));

    const contactResults: CommandItem[] = contacts
      .filter(
        (c) =>
          normalize(c.name).includes(q) ||
          (c.company && normalize(c.company).includes(q)),
      )
      .slice(0, 3)
      .map((c) => ({
        id: `contact-${c.id}`,
        type: "CONTACT",
        label: c.name,
        subLabel: c.company || "Individual Contact",
        icon: <Icon.Users {...iconProps(16)} />,
        action: () => {
          onNavigate("CRM");
          if (onEditContact) onEditContact(c);
        },
      }));

    const noteResults: CommandItem[] = notes
      .filter(
        (n) =>
          normalize(n.title).includes(q) || normalize(n.content).includes(q),
      )
      .slice(0, 3)
      .map((n) => ({
        id: `note-${n.id}`,
        type: "NOTE",
        label: n.title,
        subLabel: n.tags[0] || "General Note",
        icon: <Icon.Docs {...iconProps(16)} />,
        action: () => {
          onNavigate("KNOWLEDGE");
          if (onEditNote) onEditNote(n);
        },
      }));

    if (!q) return [...cmds];
    return [...cmds, ...tasks, ...contactResults, ...noteResults];
  }, [
    query,
    staticCommands,
    entries,
    contacts,
    notes,
    onEdit,
    onNavigate,
    onEditContact,
    onEditNote,
  ]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % filteredCommands.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex(
          (prev) =>
            (prev - 1 + filteredCommands.length) % filteredCommands.length,
        );
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          filteredCommands[selectedIndex].action();
          onClose();
        }
      } else if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, filteredCommands, selectedIndex, onClose]);

  if (filteredCommands.length !== prevFilteredLength) {
    setPrevFilteredLength(filteredCommands.length);
    setSelectedIndex(0);
  }

  useEffect(() => {
    if (listRef.current) {
      const selectedEl = listRef.current.children[selectedIndex] as HTMLElement;
      if (selectedEl) {
        selectedEl.scrollIntoView({ block: "nearest" });
      }
    }
  }, [selectedIndex]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-start justify-center pt-[15vh] px-4 bg-black/20 dark:bg-black/40 backdrop-blur-[2px] transition-opacity duration-300 animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="bg-notion-light-bg dark:bg-notion-dark-bg w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden border border-notion-light-border dark:border-notion-dark-border flex flex-col animate-in zoom-in-95 slide-in-from-top-4 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center px-5 py-4 border-b border-notion-light-border dark:border-notion-dark-border bg-notion-light-bg dark:bg-notion-dark-bg">
          <Icon.Search
            size={20}
            className="text-notion-light-muted dark:text-notion-dark-muted mr-4 opacity-70"
          />
          <input
            ref={inputRef}
            type="text"
            className="flex-1 text-[16px] text-notion-light-text dark:text-notion-dark-text placeholder-notion-light-muted/50 dark:placeholder-notion-dark-muted/50 focus:outline-none bg-transparent font-bold"
            placeholder="Search commands, missions, contacts or notes..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="flex gap-2">
            <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-black text-notion-light-muted dark:text-notion-dark-muted bg-notion-light-sidebar dark:bg-notion-dark-sidebar rounded-lg border border-notion-light-border dark:border-notion-dark-border shadow-sm">
              ESC
            </kbd>
          </div>
        </div>

        <div
          ref={listRef}
          className="max-h-[55vh] overflow-y-auto custom-scrollbar p-2 bg-notion-light-bg dark:bg-notion-dark-bg"
        >
          {filteredCommands.length === 0 ? (
            <div className="py-12 text-center">
              <div className="w-12 h-12 bg-notion-light-sidebar dark:bg-notion-dark-sidebar rounded-2xl flex items-center justify-center mx-auto mb-4 border border-notion-light-border dark:border-notion-dark-border">
                <Icon.Search
                  size={24}
                  className="text-notion-light-muted dark:text-notion-dark-muted opacity-30"
                />
              </div>
              <p className="text-[13px] font-bold text-notion-light-muted dark:text-notion-dark-muted">
                No commands found for "{query}"
              </p>
            </div>
          ) : (
            filteredCommands.map((item, index) => (
              <div
                key={item.id}
                onClick={() => {
                  item.action();
                  onClose();
                }}
                className={`flex items-center gap-4 px-4 py-3 rounded-xl cursor-pointer transition-all group ${
                  index === selectedIndex
                    ? "bg-notion-light-sidebar dark:bg-notion-dark-sidebar shadow-sm border border-notion-light-border dark:border-notion-dark-border"
                    : "text-notion-light-text dark:text-notion-dark-text hover:bg-notion-light-sidebar/50 dark:hover:bg-notion-dark-sidebar/50 border border-transparent"
                }`}
              >
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                    index === selectedIndex
                      ? "bg-notion-light-bg dark:bg-notion-dark-bg text-notion-light-text dark:text-notion-dark-text border border-notion-light-border dark:border-notion-dark-border"
                      : "bg-notion-light-sidebar dark:bg-notion-dark-sidebar text-notion-light-muted dark:text-notion-dark-muted"
                  }`}
                >
                  {item.type === "TASK" ? (
                    <div
                      className={`w-2 h-2 rounded-full ${item.meta ? PRIORITY_DOTS[item.meta.priority] : "bg-notion-light-muted"} ${index === selectedIndex ? "ring-4 ring-current/10" : ""}`}
                    />
                  ) : (
                    item.icon
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div
                    className={`text-[14px] font-black truncate ${index === selectedIndex ? "text-notion-light-text dark:text-notion-dark-text" : "text-notion-light-text/80 dark:text-notion-dark-text/80"}`}
                  >
                    {item.label}
                  </div>
                  {item.subLabel && (
                    <div
                      className={`text-[11px] font-bold truncate mt-0.5 ${index === selectedIndex ? "text-notion-light-muted dark:text-notion-dark-muted" : "text-notion-light-muted/60 dark:text-notion-dark-muted/60"}`}
                    >
                      {item.subLabel}
                    </div>
                  )}
                </div>

                {index === selectedIndex && (
                  <div className="flex-shrink-0 text-[10px] font-black opacity-70 uppercase tracking-widest flex items-center gap-1.5 text-notion-light-muted dark:text-notion-dark-muted bg-notion-light-bg dark:bg-notion-dark-bg px-2 py-1 rounded-md border border-notion-light-border dark:border-notion-dark-border shadow-sm">
                    {item.type === "TASK" ||
                    item.type === "CONTACT" ||
                    item.type === "NOTE"
                      ? "Open"
                      : "Run"}
                    <Icon.Next size={10} />
                  </div>
                )}

                {item.type === "TASK" && item.meta?.status !== "Done" && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFocus(item.meta!);
                      onClose();
                    }}
                    className={`ml-1 ${
                      index === selectedIndex
                        ? "text-notion-light-text dark:text-notion-dark-text hover:bg-notion-light-bg dark:hover:bg-notion-dark-bg border border-notion-light-border dark:border-notion-dark-border"
                        : "text-notion-light-muted dark:text-notion-dark-muted hover:text-notion-light-text dark:hover:text-notion-dark-text"
                    }`}
                    title="Enter Focus Mode"
                  >
                    <Icon.Focus size={14} />
                  </Button>
                )}
              </div>
            ))
          )}
        </div>

        <div className="bg-notion-light-sidebar dark:bg-notion-dark-sidebar px-5 py-3 border-t border-notion-light-border dark:border-notion-dark-border text-[10px] text-notion-light-muted dark:text-notion-dark-muted flex justify-between items-center">
          <div className="flex items-center gap-2 font-black uppercase tracking-widest opacity-60">
            <Icon.Vault size={12} />
            <span>Command Palette v1.0</span>
          </div>
          <div className="flex gap-5">
            <span className="flex items-center gap-2">
              <kbd className="font-black bg-notion-light-bg dark:bg-notion-dark-bg border border-notion-light-border dark:border-notion-dark-border rounded-md px-1.5 py-0.5 shadow-sm text-notion-light-text dark:text-notion-dark-text">
                ESC
              </kbd>
              <span className="font-bold uppercase tracking-tighter opacity-70">
                Close
              </span>
            </span>
            <span className="flex items-center gap-2">
              <kbd className="font-black bg-notion-light-bg dark:bg-notion-dark-bg border border-notion-light-border dark:border-notion-dark-border rounded-md px-1.5 py-0.5 shadow-sm text-notion-light-text dark:text-notion-dark-text">
                ↑↓
              </kbd>
              <span className="font-bold uppercase tracking-tighter opacity-70">
                Navigate
              </span>
            </span>
            <span className="flex items-center gap-2">
              <kbd className="font-black bg-notion-light-bg dark:bg-notion-dark-bg border border-notion-light-border dark:border-notion-dark-border rounded-md px-1.5 py-0.5 shadow-sm text-notion-light-text dark:text-notion-dark-text">
                ↵
              </kbd>
              <span className="font-bold uppercase tracking-tighter opacity-70">
                Select
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
