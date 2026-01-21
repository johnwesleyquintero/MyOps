import { TaskEntry } from "../types";

export const sortTasks = (tasks: TaskEntry[]): TaskEntry[] => {
  // Pre-calculate sort values to avoid repeated parsing inside the sort loop
  const prepared = tasks.map((t) => ({
    task: t,
    time: t.date ? new Date(t.date).getTime() : 0,
  }));

  prepared.sort((a, b) => {
    // 1. Sort by Date (Descending - Newest first)
    const timeA = a.time;
    const timeB = b.time;

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
    const prioA = priorityOrder[a.task.priority as string] ?? 3;
    const prioB = priorityOrder[b.task.priority as string] ?? 3;

    if (prioA !== prioB) {
      return prioA - prioB;
    }

    // 3. Sort by Status (In Progress -> Backlog -> Done)
    const statusOrder: Record<string, number> = {
      "In Progress": 0,
      Backlog: 1,
      Done: 2,
    };
    const statA = statusOrder[a.task.status as string] ?? 3;
    const statB = statusOrder[b.task.status as string] ?? 3;
    return statA - statB;
  });

  return prepared.map((p) => p.task);
};
