import { useContext } from "react";
import { AwarenessContext } from "../contexts/AwarenessContext";

export const useAwarenessContext = () => {
  const context = useContext(AwarenessContext);
  if (context === undefined) {
    throw new Error(
      "useAwarenessContext must be used within an AwarenessProvider",
    );
  }
  return context;
};
