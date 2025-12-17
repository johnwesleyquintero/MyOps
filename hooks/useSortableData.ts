
import { useState, useMemo } from 'react';
import { TaskEntry, PriorityLevel, StatusLevel } from '../types';

export type SortKey = 'date' | 'description' | 'project' | 'priority' | 'status';
export type SortDirection = 'asc' | 'desc';

export const useSortableData = (items: TaskEntry[], config = { key: 'date' as SortKey, direction: 'asc' as SortDirection }) => {
  const [sortConfig, setSortConfig] = useState(config);

  const sortedItems = useMemo(() => {
    const sortableItems = [...items];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        let comparison = 0;
        switch (sortConfig.key) {
          case 'date':
            comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
            break;
          case 'priority':
            const pRanks: Record<PriorityLevel, number> = { 'High': 0, 'Medium': 1, 'Low': 2 };
            comparison = (pRanks[a.priority] ?? 99) - (pRanks[b.priority] ?? 99);
            break;
          case 'status':
            const sRanks: Record<StatusLevel, number> = { 'Backlog': 0, 'In Progress': 1, 'Done': 2 };
            comparison = (sRanks[a.status] ?? 99) - (sRanks[b.status] ?? 99);
            break;
          default:
            const valA = String(a[sortConfig.key] || '').toLowerCase();
            const valB = String(b[sortConfig.key] || '').toLowerCase();
            if (valA < valB) comparison = -1;
            if (valA > valB) comparison = 1;
        }
        return sortConfig.direction === 'asc' ? comparison : -comparison;
      });
    }
    return sortableItems;
  }, [items, sortConfig]);

  const requestSort = (key: SortKey) => {
    let direction: SortDirection = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  return { items: sortedItems, requestSort, sortConfig };
};
