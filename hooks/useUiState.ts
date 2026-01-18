import { useState, useCallback } from "react";
import { Page, TaskEntry, Contact, Note } from "../types";
import { SIDEBAR_COLLAPSED_KEY } from "@/constants";

export const useUiState = () => {
  const [activePage, setActivePage] = useState<Page>("DASHBOARD");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === "true";
    }
    return false;
  });

  const [showSettings, setShowSettings] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isCmdPaletteOpen, setIsCmdPaletteOpen] = useState(false);
  const [isAiChatOpen, setIsAiChatOpen] = useState(false);

  const [editingEntry, setEditingEntry] = useState<TaskEntry | null>(null);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [focusedTask, setFocusedTask] = useState<TaskEntry | null>(null);

  const toggleSidebarCollapse = useCallback(() => {
    setIsSidebarCollapsed((prev) => {
      const newState = !prev;
      localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(newState));
      return newState;
    });
  }, []);

  const openEdit = useCallback((entry: TaskEntry) => {
    setEditingEntry(entry);
    setIsTaskModalOpen(true);
  }, []);

  const openCreate = useCallback(() => {
    setEditingEntry(null);
    setIsTaskModalOpen(true);
  }, []);

  const openEditContact = useCallback((contact: Contact) => {
    setEditingContact(contact);
    setActivePage("CRM");
  }, []);

  const openEditNote = useCallback((note: Note) => {
    setEditingNote(note);
    setActivePage("KNOWLEDGE");
  }, []);

  const enterFocus = useCallback((entry: TaskEntry) => {
    setFocusedTask(entry);
    setActivePage("FOCUS");
  }, []);

  const exitFocus = useCallback(() => {
    setFocusedTask(null);
    setActivePage("MISSIONS");
  }, []);

  return {
    activePage,
    setActivePage,
    isSidebarOpen,
    setIsSidebarOpen,
    isSidebarCollapsed,
    toggleSidebarCollapse,
    showSettings,
    setShowSettings,
    showShortcuts,
    setShowShortcuts,
    isTaskModalOpen,
    setIsTaskModalOpen,
    isCmdPaletteOpen,
    setIsCmdPaletteOpen,
    isAiChatOpen,
    setIsAiChatOpen,
    editingEntry,
    setEditingEntry,
    editingContact,
    setEditingContact,
    editingNote,
    setEditingNote,
    focusedTask,
    setFocusedTask,
    openEdit,
    openCreate,
    openEditContact,
    openEditNote,
    enterFocus,
    exitFocus,
  };
};
