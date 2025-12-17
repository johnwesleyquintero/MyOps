import { useMemo, useState, useEffect } from 'react';
import { TaskEntry, MetricSummary } from '../types';

interface UseTaskAnalyticsProps {
  entries: TaskEntry[];
  searchQuery: string;
  selectedCategory: string; // "Project"
  selectedStatus: string;
  selectedMonth: string;
}

// Internal debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}

export const useTaskAnalytics = ({
  entries,
  searchQuery,
  selectedCategory,
  selectedStatus,
  selectedMonth,
}: UseTaskAnalyticsProps) => {
  
  // Debounce the search query to prevent stuttering on rapid typing
  const debouncedSearch = useDebounce(searchQuery, 300);

  const filteredEntries = useMemo(() => {
    return entries.filter(entry => {
      const matchesSearch = entry.description.toLowerCase().includes(debouncedSearch.toLowerCase());
      const matchesProject = selectedCategory ? entry.project === selectedCategory : true;
      const matchesStatus = selectedStatus ? entry.status === selectedStatus : true;
      let matchesMonth = true;
      if (selectedMonth) {
        matchesMonth = entry.date.startsWith(selectedMonth);
      }
      return matchesSearch && matchesProject && matchesStatus && matchesMonth;
    });
  }, [entries, debouncedSearch, selectedCategory, selectedStatus, selectedMonth]);

  const metrics: MetricSummary = useMemo(() => {
    return filteredEntries.reduce((acc, curr) => {
      return {
        total: acc.total + 1,
        backlog: curr.status === 'Backlog' ? acc.backlog + 1 : acc.backlog,
        inProgress: curr.status === 'In Progress' ? acc.inProgress + 1 : acc.inProgress,
        done: curr.status === 'Done' ? acc.done + 1 : acc.done
      };
    }, { total: 0, backlog: 0, inProgress: 0, done: 0 });
  }, [filteredEntries]);

  return {
    filteredEntries,
    metrics
  };
};