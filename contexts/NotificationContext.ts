import { createContext } from "react";
import { NotificationAction } from "../types";

export interface NotificationContextType {
  showToast: (
    msg: string,
    type: "success" | "error" | "info",
    action?: NotificationAction,
  ) => void;
}

export const NotificationContext = createContext<
  NotificationContextType | undefined
>(undefined);
