import { useEffect, useState, useRef } from "react";

interface ShortcutConfig {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean; // Cmd on Mac
  shiftKey?: boolean;
  action: () => void;
  preventDefault?: boolean;
  allowInInput?: boolean; // If true, triggers even when typing in text fields (e.g. Cmd+Enter)
}

export const useKeyboardShortcuts = (shortcuts: ShortcutConfig[]) => {
  const [lastKey, setLastKey] = useState<string | null>(null);
  const lastKeyTime = useRef<number>(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 1. Check if user is typing in an input/textarea
      const target = e.target as HTMLElement;
      const isInput =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable;

      const currentTime = new Date().getTime();
      const isSequence = lastKey && currentTime - lastKeyTime.current < 1000; // 1 second window for sequences

      // Iterate through defined shortcuts
      shortcuts.forEach((config) => {
        // Match Modifiers
        const ctrlMatch = !!config.ctrlKey === e.ctrlKey;
        const metaMatch = !!config.metaKey === e.metaKey;
        const shiftMatch = !!config.shiftKey === e.shiftKey;

        // Match Key
        // We accept special syntax like "g then d" handled by local state,
        // or standard keys
        let keyMatch = false;

        // Check for sequence definitions (e.g. key: "g d")
        if (config.key.includes(" ")) {
          const [first, second] = config.key.split(" ");
          if (
            isSequence &&
            lastKey === first &&
            e.key.toLowerCase() === second
          ) {
            keyMatch = true;
          }
        } else {
          if (e.key.toLowerCase() === config.key.toLowerCase()) {
            keyMatch = true;
          }
        }

        // Execution Guard
        if (keyMatch && ctrlMatch && metaMatch && shiftMatch) {
          // If in input, only allow if explicitly allowed (usually modifiers)
          if (isInput && !config.allowInInput) {
            return;
          }

          if (config.preventDefault) e.preventDefault();
          config.action();

          // Reset sequence
          setLastKey(null);
        }
      });

      // Track key for sequences (only letters, ignoring modifiers)
      if (!isInput && e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
        setLastKey(e.key.toLowerCase());
        lastKeyTime.current = currentTime;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [shortcuts, lastKey]);
};
