import React, { ReactNode } from "react";
import { AwarenessContext } from "./AwarenessContext";
import { useAwareness } from "../hooks/useAwareness";
import { useConfig } from "../hooks/useConfig";
import { useNotification } from "../hooks/useNotification";

export const AwarenessProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { config } = useConfig();
  const { showToast } = useNotification();
  const awareness = useAwareness(config, showToast);

  return (
    <AwarenessContext.Provider value={awareness}>
      {children}
    </AwarenessContext.Provider>
  );
};
