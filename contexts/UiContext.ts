import { createContext } from "react";
import { useUiState } from "../hooks/useUiState";

export type UiContextType = ReturnType<typeof useUiState>;

export const UiContext = createContext<UiContextType | undefined>(undefined);
