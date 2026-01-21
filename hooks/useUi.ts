import { useContext } from "react";
import { UiContext } from "../contexts/UiContext";

export const useUi = () => {
  const context = useContext(UiContext);
  if (context === undefined) {
    throw new Error("useUi must be used within a UiProvider");
  }
  return context;
};
