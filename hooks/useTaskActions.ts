import { useCallback, useMemo } from "react";
import {
  TaskEntry,
  NotificationAction,
  MentalStateEntry,
  Page,
} from "../types";
import { STATUSES, RECURRENCE_OPTIONS } from "@/constants";

interface UseTaskActionsProps {
  saveTransaction: (entry: TaskEntry, isUpdate: boolean) => Promise<boolean>;
  showToast: (
    msg: string,
    type: "success" | "error" | "info",
    action?: NotificationAction,
  ) => void;
  mentalStates: MentalStateEntry[];
  setActivePage?: (page: Page) => void;
}

export const useTaskActions = ({
  saveTransaction,
  showToast,
  mentalStates,
  setActivePage,
}: UseTaskActionsProps) => {
  const getXpMultiplier = useCallback(() => {
    const today = new Date().toISOString().split("T")[0];
    const todaysState = mentalStates.find((m) => m.date === today);

    let multiplier = 1;
    if (todaysState) {
      if (todaysState.energy === "high") multiplier += 0.2;
      if (todaysState.clarity === "sharp") multiplier += 0.2;
      if (todaysState.energy === "low") multiplier -= 0.1;
      if (todaysState.clarity === "foggy") multiplier -= 0.1;
    }
    return Math.max(0.5, multiplier); // Ensure multiplier is at least 0.5
  }, [mentalStates]);

  const handleDuplicate = useCallback((entry: TaskEntry): TaskEntry => {
    // Returns a copy ready for the modal
    return {
      ...entry,
      id: "",
      status: "Backlog",
      date: new Date().toISOString().split("T")[0],
      dependencies: [],
    };
  }, []);

  const handleDescriptionUpdate = useCallback(
    async (entry: TaskEntry, newDescription: string) => {
      const updatedEntry = { ...entry, description: newDescription };
      await saveTransaction(updatedEntry, true);
    },
    [saveTransaction],
  );

  const handleStatusUpdate = useCallback(
    async (entry: TaskEntry) => {
      const currentIndex = STATUSES.indexOf(entry.status);
      const nextIndex = (currentIndex + 1) % STATUSES.length;
      const nextStatus = STATUSES[nextIndex];

      // 1. Update the original task
      const multiplier = nextStatus === "Done" ? getXpMultiplier() : 1;
      const baseXP =
        entry.priority === "High"
          ? 150
          : entry.priority === "Medium"
            ? 120
            : 100;
      const xpAwarded =
        nextStatus === "Done" ? Math.round(baseXP * multiplier) : undefined;

      const updatedEntry = { ...entry, status: nextStatus, xpAwarded };
      await saveTransaction(updatedEntry, true);

      // 2. RECURRENCE & REFLECTION LOGIC
      if (nextStatus === "Done") {
        // Reflection Trigger for High Priority
        if (entry.priority === "High" && setActivePage) {
          showToast(`Critical mission complete! Log a reflection?`, "info", {
            label: "Log Now",
            onClick: () => setActivePage("REFLECTION"),
          });
        } else {
          showToast(`Task completed! +${xpAwarded} XP`, "success");
        }

        const desc = entry.description;
        const recurrenceOpt = RECURRENCE_OPTIONS.find(
          (r) => r.tag && desc.includes(r.tag),
        );

        if (recurrenceOpt) {
          const currentDueDate = new Date(entry.date);
          const nextDate = new Date(currentDueDate);

          if (recurrenceOpt.label === "Daily") {
            nextDate.setDate(currentDueDate.getDate() + 1);
          } else if (recurrenceOpt.label === "Weekly") {
            nextDate.setDate(currentDueDate.getDate() + 7);
          } else if (recurrenceOpt.label === "Monthly") {
            nextDate.setMonth(currentDueDate.getMonth() + 1);
          }

          const nextTask: TaskEntry = {
            ...entry,
            id: "",
            date: nextDate.toISOString().split("T")[0],
            status: "Backlog",
            dependencies: [],
          };

          // Small delay to ensure the UI updates first
          setTimeout(async () => {
            await saveTransaction(nextTask, false);
            showToast(
              `Recurring task scheduled for ${nextTask.date}`,
              "success",
            );
          }, 500);
        }
      }
    },
    [saveTransaction, showToast, getXpMultiplier, setActivePage],
  );

  const handleFocusComplete = useCallback(
    async (entry: TaskEntry) => {
      const multiplier = getXpMultiplier();
      const baseXP =
        entry.priority === "High"
          ? 150
          : entry.priority === "Medium"
            ? 120
            : 100;
      const xpAwarded = Math.round(baseXP * multiplier);

      const updatedEntry = { ...entry, status: "Done" as const, xpAwarded };
      await saveTransaction(updatedEntry, true);

      // Reflection Trigger for High Priority
      if (entry.priority === "High" && setActivePage) {
        showToast(`Focus session complete! Log a reflection?`, "info", {
          label: "Log Now",
          onClick: () => setActivePage("REFLECTION"),
        });
      } else {
        showToast(`Focus mission accomplished! +${xpAwarded} XP`, "success");
      }

      // Check recurrence immediately
      const recurrenceOpt = RECURRENCE_OPTIONS.find(
        (r) => r.tag && entry.description.includes(r.tag),
      );
      if (recurrenceOpt) {
        const currentDueDate = new Date(entry.date);
        const nextDate = new Date(currentDueDate);
        if (recurrenceOpt.label === "Daily")
          nextDate.setDate(currentDueDate.getDate() + 1);
        else if (recurrenceOpt.label === "Weekly")
          nextDate.setDate(currentDueDate.getDate() + 7);
        else if (recurrenceOpt.label === "Monthly")
          nextDate.setMonth(currentDueDate.getMonth() + 1);

        const nextTask: TaskEntry = {
          ...entry,
          id: "",
          date: nextDate.toISOString().split("T")[0],
          status: "Backlog",
          dependencies: [],
        };

        // Small delay to ensure the UI updates first
        setTimeout(async () => {
          await saveTransaction(nextTask, false);
          showToast(`Recurring task scheduled for ${nextTask.date}`, "success");
        }, 500);
      }
    },
    [saveTransaction, showToast, getXpMultiplier, setActivePage],
  );

  return useMemo(
    () => ({
      handleDuplicate,
      handleDescriptionUpdate,
      handleStatusUpdate,
      handleFocusComplete,
    }),
    [
      handleDuplicate,
      handleDescriptionUpdate,
      handleStatusUpdate,
      handleFocusComplete,
    ],
  );
};
