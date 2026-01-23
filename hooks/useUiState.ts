import { useState, useCallback, useMemo } from "react";
import { Page, TaskEntry, Contact, Note } from "../types";
import { SIDEBAR_COLLAPSED_KEY } from "@/constants";
import { storage } from "../utils/storageUtils";

export const useUiState = () => {
  const [activePage, setActivePage] = useState<Page>("DASHBOARD");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    return storage.get<boolean>(SIDEBAR_COLLAPSED_KEY, false);
  });

  const [showSettings, setShowSettings] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isCmdPaletteOpen, setIsCmdPaletteOpen] = useState(false);
  const [isAiChatOpen, setIsAiChatOpen] = useState(false);
  const [isHudMode, setIsHudMode] = useState(() => {
    return storage.get<boolean>("myops_hud_mode", false);
  });

  const [editingEntry, setEditingEntry] = useState<TaskEntry | null>(null);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [isCreatingNote, setIsCreatingNote] = useState(false);
  const [focusedTask, setFocusedTask] = useState<TaskEntry | null>(null);

  const toggleSidebarCollapse = useCallback(() => {
    setIsSidebarCollapsed((prev) => {
      const newState = !prev;
      storage.set(SIDEBAR_COLLAPSED_KEY, newState);
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
    setIsCreatingNote(false);
    setActivePage("KNOWLEDGE");
  }, []);

  const openCreateNote = useCallback(() => {
    setEditingNote(null);
    setIsCreatingNote(true);
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

  const toggleHudMode = useCallback(() => {
    setIsHudMode((prev) => {
      const newState = !prev;
      storage.set("myops_hud_mode", newState);
      return newState;
    });
  }, []);

  return useMemo(
    () => ({
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
      isHudMode,
      toggleHudMode,
      editingEntry,
      setEditingEntry,
      editingContact,
      setEditingContact,
      editingNote,
      setEditingNote,
      isCreatingNote,
      setIsCreatingNote,
      focusedTask,
      setFocusedTask,
      openEdit,
      openCreate,
      openEditContact,
      openEditNote,
      openCreateNote,
      enterFocus,
      exitFocus,
    }),
    [
      activePage,
      isSidebarOpen,
      isSidebarCollapsed,
      toggleSidebarCollapse,
      showSettings,
      showShortcuts,
      isTaskModalOpen,
      isCmdPaletteOpen,
      isAiChatOpen,
      isHudMode,
      toggleHudMode,
      editingEntry,
      editingContact,
      editingNote,
      isCreatingNote,
      focusedTask,
      openEdit,
      openCreate,
      openEditContact,
      openEditNote,
      openCreateNote,
      enterFocus,
      exitFocus,
    ],
  );
};
