import { useKeyboardShortcuts } from "./useKeyboardShortcuts";
import { Page } from "../types";

interface AppShortcutsProps {
  activePage: Page;
  isTaskModalOpen: boolean;
  isCmdPaletteOpen: boolean;
  setActivePage: (page: Page) => void;
  openCreate: () => void;
  setIsCmdPaletteOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  setShowShortcuts: (show: boolean | ((prev: boolean) => boolean)) => void;
}

export const useAppShortcuts = ({
  activePage,
  isTaskModalOpen,
  isCmdPaletteOpen,
  setActivePage,
  openCreate,
  setIsCmdPaletteOpen,
  setShowShortcuts,
}: AppShortcutsProps) => {
  useKeyboardShortcuts([
    { key: "g d", action: () => setActivePage("DASHBOARD") },
    { key: "g m", action: () => setActivePage("MISSIONS") },
    { key: "g r", action: () => setActivePage("REFLECTION") },
    { key: "g l", action: () => setActivePage("LIFE") },
    {
      key: "c",
      action: () => {
        if (!isTaskModalOpen && activePage !== "FOCUS" && !isCmdPaletteOpen) {
          openCreate();
        }
      },
    },
    {
      key: "/",
      preventDefault: true,
      action: () => {
        if (activePage === "FOCUS" || isCmdPaletteOpen) return;
        if (activePage !== "MISSIONS") setActivePage("MISSIONS");
        setTimeout(() => {
          const searchInput = document.getElementById("global-search");
          if (searchInput) searchInput.focus();
        }, 50);
      },
    },
    {
      key: "k",
      ctrlKey: true,
      preventDefault: true,
      allowInInput: true,
      action: () => {
        if (activePage === "FOCUS") return;
        setIsCmdPaletteOpen((prev) => !prev);
      },
    },
    {
      key: "k",
      metaKey: true,
      preventDefault: true,
      allowInInput: true,
      action: () => {
        if (activePage === "FOCUS") return;
        setIsCmdPaletteOpen((prev) => !prev);
      },
    },
    { key: "?", action: () => setShowShortcuts((prev) => !prev) },
  ]);
};
