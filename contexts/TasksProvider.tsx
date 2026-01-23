import React, { ReactNode } from "react";
import { TasksContext } from "./TasksContext";
import { useTasks } from "../hooks/useTasks";
import { useConfig } from "../hooks/useConfig";
import { useNotification } from "../hooks/useNotification";

export const TasksProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { config } = useConfig();
  const { showToast } = useNotification();
  const tasks = useTasks(config, showToast);

  return (
    <TasksContext.Provider value={tasks}>{children}</TasksContext.Provider>
  );
};
