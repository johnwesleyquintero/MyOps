import { TaskEntry } from '../types';

export const getMockData = (): TaskEntry[] => {
  const entries: TaskEntry[] = [];
  const today = new Date();

  // Helper to create date
  const dateOffset = (days: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
  };

  entries.push({ 
    id: 't-1', 
    date: dateOffset(0), 
    description: 'Finalize Q3 System Architecture', 
    project: 'Strategy', 
    priority: 'High', 
    status: 'In Progress',
    createdAt: new Date().toISOString() 
  });

  entries.push({ 
    id: 't-2', 
    date: dateOffset(2), 
    description: 'Draft "Sovereign Stack" article', 
    project: 'Content', 
    priority: 'Medium', 
    status: 'Backlog',
    createdAt: new Date().toISOString() 
  });

  entries.push({ 
    id: 't-3', 
    date: dateOffset(-1), 
    description: 'Update Vercel Environment Variables', 
    project: 'Development', 
    priority: 'High', 
    status: 'Done',
    createdAt: new Date().toISOString() 
  });

  entries.push({ 
    id: 't-4', 
    date: dateOffset(5), 
    description: 'Review operational costs', 
    project: 'Operations', 
    priority: 'Low', 
    status: 'Backlog',
    createdAt: new Date().toISOString() 
  });

  entries.push({ 
    id: 't-5', 
    date: dateOffset(0), 
    description: 'Workout - Zone 2 Cardio', 
    project: 'Health', 
    priority: 'Medium', 
    status: 'In Progress',
    createdAt: new Date().toISOString() 
  });

  return entries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};