import { useMemo } from 'react';
import { TaskEntry, MetricSummary } from '../types';

interface UseLedgerAnalyticsProps {
  entries: TaskEntry[];
  searchQuery: string;
  selectedCategory: string; // "Project"
  selectedMonth: string;
}

export const useLedgerAnalytics = ({
  entries,
  searchQuery,
  selectedCategory,
  selectedMonth,
}: UseLedgerAnalyticsProps) => {
  
  const filteredEntries = useMemo(() => {
    return entries.filter(entry => {
      const matchesSearch = entry.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesProject = selectedCategory ? entry.project === selectedCategory : true;
      let matchesMonth = true;
      if (selectedMonth) {
        matchesMonth = entry.date.startsWith(selectedMonth);
      }
      return matchesSearch && matchesProject && matchesMonth;
    });
  }, [entries, searchQuery, selectedCategory, selectedMonth]);

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