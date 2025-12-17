
import { useState, useMemo } from 'react';
import { TaskEntry } from '../types';
import { DEFAULT_PROJECTS } from '../constants';

export type ViewMode = 'TABLE' | 'KANBAN' | 'GANTT';

export const useMissionControl = (entries: TaskEntry[]) => {
  const [viewMode, setViewMode] = useState<ViewMode>('TABLE');
  
  // Filter States
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<string>('');

  // Computed: Available Categories (including custom ones found in data)
  const availableCategories = useMemo(() => {
    const custom = entries.map(e => e.project).filter(c => !DEFAULT_PROJECTS.includes(c));
    return [...DEFAULT_PROJECTS, ...Array.from(new Set(custom))];
  }, [entries]);

  return {
    viewMode,
    setViewMode,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    selectedStatus,
    setSelectedStatus,
    selectedMonth,
    setSelectedMonth,
    availableCategories
  };
};
