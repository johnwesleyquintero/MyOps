import React, { ReactNode } from "react";
import { NotificationContext } from "./NotificationContext";
import { useNotifications } from "../hooks/useNotifications";

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { showToast } = useNotifications();
  return (
    <NotificationContext.Provider value={{ showToast }}>
      {children}
    </NotificationContext.Provider>
  );
};
