
import React, { useMemo } from 'react';
import { TaskEntry, StatusLevel } from '../types';
import { KanbanCard } from './kanban/KanbanCard';

interface KanbanBoardProps {
  entries: TaskEntry[];
  onEdit: (entry: TaskEntry) => void;
  onStatusUpdate: (entry: TaskEntry) => void;
  onAdd: () => void;
  onFocus: (entry: TaskEntry) => void; 
  onDuplicate: (entry: TaskEntry) => void; 
  allEntries?: TaskEntry[];
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({ entries, onEdit, onAdd, onFocus, onDuplicate, allEntries = [] }) => {
  
  const columns = useMemo(() => {
    const cols: Record<StatusLevel, TaskEntry[]> = {
      'Backlog': [],
      'In Progress': [],
      'Done': []
    };
    entries.forEach(e => {
      if (cols[e.status]) {
        cols[e.status].push(e);
      } else {
        cols['Backlog'].push(e);
      }
    });
    return cols;
  }, [entries]);

  const getDependencyStatus = (entry: TaskEntry) => {
    if (!entry.dependencies || entry.dependencies.length === 0) return null;
    const blockerCount = entry.dependencies.filter(depId => {
        const depTask = allEntries.find(e => e.id === depId);
        return depTask && depTask.status !== 'Done';
    }).length;
    return { count: entry.dependencies.length, blocked: blockerCount > 0, blockerCount };
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 overflow-x-auto pb-4 h-[calc(100vh-250px)]">
      {(['Backlog', 'In Progress', 'Done'] as StatusLevel[]).map(status => (
        <div key={status} className={`flex-1 min-w-[300px] flex flex-col rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden bg-slate-50/30 dark:bg-slate-900/10`}>
          <div className="p-3 flex justify-between items-center bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700">
             <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-700 dark:text-slate-200 text-xs uppercase tracking-widest">{status}</h3>
                <span className="bg-white dark:bg-slate-700 px-2 py-0.5 rounded-full text-[10px] font-mono text-slate-500 border border-slate-200 dark:border-slate-600">{columns[status].length}</span>
             </div>
             <button onClick={onAdd} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-400 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
             </button>
          </div>
          <div className="flex-1 p-3 overflow-y-auto custom-scrollbar space-y-3">
             {columns[status].map(task => (
                <KanbanCard 
                    key={task.id}
                    task={task}
                    onEdit={onEdit}
                    onFocus={onFocus}
                    onDuplicate={onDuplicate}
                    isDone={status === 'Done'}
                    dependencyStatus={getDependencyStatus(task)}
                />
             ))}
             {columns[status].length === 0 && (
                <button onClick={onAdd} className="w-full py-8 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg group hover:border-indigo-300 dark:hover:border-indigo-500 transition-all">
                  <span className="text-xs text-slate-400 group-hover:text-indigo-600">New Mission</span>
                </button>
             )}
          </div>
        </div>
      ))}
    </div>
  );
};
