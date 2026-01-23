import { createContext } from "react";
import { useAwareness } from "../hooks/useAwareness";

export type AwarenessContextType = ReturnType<typeof useAwareness>;

export const AwarenessContext = createContext<AwarenessContextType | undefined>(
  undefined,
);
