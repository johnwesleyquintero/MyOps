import { useCallback } from "react";
import { NotificationAction } from "../types";
import { toast } from "sonner";

export const useNotifications = () => {
  const showToast = useCallback(
    (
      message: string,
      type: "success" | "error" | "info" = "info",
      action?: NotificationAction,
    ) => {
      const toastOptions = action
        ? {
            action: {
              label: action.label,
              onClick: action.onClick,
            },
          }
        : {};

      switch (type) {
        case "success":
          toast.success(message, toastOptions);
          break;
        case "error":
          toast.error(message, toastOptions);
          break;
        case "info":
        default:
          toast(message, toastOptions);
          break;
      }
    },
    [],
  );

  return {
    showToast,
  };
};
