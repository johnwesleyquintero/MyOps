import { TaskEntry } from "../types";

export const sortTasks = (tasks: TaskEntry[]): TaskEntry[] => {
  return [...tasks].sort((a, b) => {
    // 1. Sort by Date (Descending - Newest first)
    const timeA = a.date ? new Date(a.date).getTime() : 0;
    const timeB = b.date ? new Date(b.date).getTime() : 0;

    const isInvalidA = isNaN(timeA) || timeA === 0;
    const isInvalidB = isNaN(timeB) || timeB === 0;

    // If one is invalid, it goes to the bottom
    if (isInvalidA && !isInvalidB) return 1;
    if (!isInvalidA && isInvalidB) return -1;

    // If both are valid, sort descending
    if (!isInvalidA && !isInvalidB && timeB !== timeA) {
      return timeB - timeA;
    }

    // 2. Sort by Priority (High -> Medium -> Low)
    const priorityOrder: Record<string, number> = {
      High: 0,
      Medium: 1,
      Low: 2,
    };
    const prioA = priorityOrder[a.priority as string] ?? 3;
    const prioB = priorityOrder[b.priority as string] ?? 3;

    if (prioA !== prioB) {
      return prioA - prioB;
    }

    // 3. Sort by Status (In Progress -> Backlog -> Done)
    const statusOrder: Record<string, number> = {
      "In Progress": 0,
      Backlog: 1,
      Done: 2,
    };
    const statA = statusOrder[a.status as string] ?? 3;
    const statB = statusOrder[b.status as string] ?? 3;
    return statA - statB;
  });
};
