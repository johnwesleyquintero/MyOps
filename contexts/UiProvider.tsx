import React, { ReactNode } from "react";
import { UiContext } from "./UiContext";
import { useUiState } from "../hooks/useUiState";

export const UiProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const ui = useUiState();
  return <UiContext.Provider value={ui}>{children}</UiContext.Provider>;
};
