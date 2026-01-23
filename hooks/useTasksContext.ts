import { useContext } from "react";
import { TasksContext } from "../contexts/TasksContext";

export const useTasksContext = () => {
  const context = useContext(TasksContext);
  if (context === undefined) {
    throw new Error("useTasksContext must be used within a TasksProvider");
  }
  return context;
};
