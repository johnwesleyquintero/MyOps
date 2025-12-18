
import { TaskEntry, StatusLevel } from '../types';
import { STATUSES } from '../constants';

/**
 * Checks if a task is blocked by any unfinished dependencies.
 */
export const getDependencyStatus = (entry: TaskEntry, allEntries: TaskEntry[]) => {
  if (!entry.dependencies || entry.dependencies.length === 0) return null;
  
  const blockerCount = entry.dependencies.filter(depId => {
    const depTask = allEntries.find(e => e.id === depId);
    return depTask && depTask.status !== 'Done';
  }).length;

  return {
    totalCount: entry.dependencies.length,
    blocked: blockerCount > 0,
    blockerCount
  };
};

/**
 * Returns the next status in the cycle.
 */
export const getNextStatus = (currentStatus: StatusLevel): StatusLevel => {
  const currentIndex = STATUSES.indexOf(currentStatus);
  const nextIndex = (currentIndex + 1) % STATUSES.length;
  return STATUSES[nextIndex];
};

/**
 * Extracts hashtags from a description.
 */
export const extractTags = (description: string): string[] => {
  const matches = description.match(/#\w+/g);
  return matches || [];
};
