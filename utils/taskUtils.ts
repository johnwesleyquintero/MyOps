import { TaskEntry } from "../types";
import {
  PRIORITY_RANKS as PRIORITY_ORDER,
  STATUS_RANKS as STATUS_ORDER,
} from "@/constants";

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
    const prioA = PRIORITY_ORDER[a.task.priority as string] ?? 3;
    const prioB = PRIORITY_ORDER[b.task.priority as string] ?? 3;

    if (prioA !== prioB) {
      return prioA - prioB;
    }

    // 3. Sort by Status (In Progress -> Backlog -> Done)
    const statA = STATUS_ORDER[a.task.status as string] ?? 3;
    const statB = STATUS_ORDER[b.task.status as string] ?? 3;
    return statA - statB;
  });

  return prepared.map((p) => p.task);
};
