
import React, { useMemo } from 'react';
import { TaskEntry, StatusLevel } from '../types';
import { PRIORITY_DOTS } from '../constants';
import { formatRelativeDate, getProjectStyle } from '../utils/formatUtils';
import { CopyIdButton } from './CopyIdButton';

interface KanbanBoardProps {
  entries: TaskEntry[];
  onEdit: (entry: TaskEntry) => void;
  onStatusUpdate: (entry: TaskEntry) => void;
  onAdd: () => void;
  onFocus: (entry: TaskEntry) => void; 
  onDuplicate: (entry: TaskEntry) => void; 
  allEntries?: TaskEntry[];
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({ entries, onEdit, onStatusUpdate, onAdd, onFocus, onDuplicate, allEntries = [] }) => {
  
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
        // Fallback for weird statuses, put in Backlog
        cols['Backlog'].push(e);
      }
    });
    return cols;
  }, [entries]);

  return (
    <div className="flex flex-col md:flex-row gap-6 overflow-x-auto pb-4 h-[calc(100vh-250px)]">
      {/* Column 1: Backlog */}
      <KanbanColumn 
        title="Backlog" 
        tasks={columns['Backlog']} 
        colorClass="border-t-4 border-t-slate-400 bg-slate-50 dark:bg-slate-800"
        onEdit={onEdit}
        onAdd={onAdd}
        onFocus={onFocus}
        onDuplicate={onDuplicate}
        allEntries={allEntries}
      />

      {/* Column 2: In Progress */}
      <KanbanColumn 
        title="In Progress" 
        tasks={columns['In Progress']} 
        colorClass="border-t-4 border-t-indigo-500 bg-indigo-50/30 dark:bg-indigo-900/20"
        onEdit={onEdit}
        onAdd={onAdd}
        onFocus={onFocus}
        onDuplicate={onDuplicate}
        allEntries={allEntries}
      />

      {/* Column 3: Done */}
      <KanbanColumn 
        title="Done" 
        tasks={columns['Done']} 
        colorClass="border-t-4 border-t-emerald-500 bg-emerald-50/30 dark:bg-emerald-900/20 opacity-80"
        onEdit={onEdit}
        onAdd={onAdd}
        onFocus={onFocus}
        onDuplicate={onDuplicate}
        isDone
        allEntries={allEntries}
      />
    </div>
  );
};

interface KanbanColumnProps {
  title: string;
  tasks: TaskEntry[];
  colorClass: string;
  onEdit: (entry: TaskEntry) => void;
  onAdd: () => void;
  onFocus: (entry: TaskEntry) => void;
  onDuplicate: (entry: TaskEntry) => void;
  isDone?: boolean;
  allEntries: TaskEntry[];
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({ title, tasks, colorClass, onEdit, onAdd, onFocus, onDuplicate, isDone, allEntries }) => {
  
  const getDependencyStatus = (entry: TaskEntry) => {
      if (!entry.dependencies || entry.dependencies.length === 0) return null;
      
      const blockerCount = entry.dependencies.filter(depId => {
          const depTask = allEntries.find(e => e.id === depId);
          return depTask && depTask.status !== 'Done';
      }).length;

      return {
          count: entry.dependencies.length,
          blocked: blockerCount > 0,
          blockerCount
      };
  };

  const getTags = (desc: string) => {
    const matches = desc.match(/#\w+/g);
    return matches || [];
  };

  return (
    <div className={`flex-1 min-w-[300px] flex flex-col rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden ${colorClass}`}>
      {/* Header */}
      <div className="p-3 flex justify-between items-center bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border-b border-slate-200/50 dark:border-slate-700/50">
        <div className="flex items-center gap-2">
           <h3 className="font-bold text-slate-700 dark:text-slate-200 text-sm uppercase tracking-wider">{title}</h3>
           <span className="bg-white dark:bg-slate-700 px-2 py-0.5 rounded-full text-xs font-mono text-slate-500 dark:text-slate-300 border border-slate-200 dark:border-slate-600 shadow-sm">{tasks.length}</span>
        </div>
        <button 
           onClick={onAdd}
           className="p-1 hover:bg-slate-200/50 dark:hover:bg-slate-700/50 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
           title="Add Task"
        >
           <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 p-3 overflow-y-auto custom-scrollbar space-y-3">
        {tasks.map(task => {
          const depStatus = getDependencyStatus(task);
          const tags = getTags(task.description);
          
          return (
            <div 
              key={task.id}
              onClick={() => onEdit(task)}
              className={`bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-500 cursor-pointer transition-all group active:scale-[0.98] ${isDone ? 'opacity-70 grayscale hover:grayscale-0 hover:opacity-100' : ''}`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold border ${getProjectStyle(task.project)}`}>
                  {task.project}
                </span>
                <div className="flex gap-2 items-center">
                    {depStatus && (
                         <div 
                            className={`flex items-center gap-0.5 px-1 py-0.5 rounded text-[9px] font-bold border ${depStatus.blocked ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-900/30' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700'}`}
                            title={depStatus.blocked ? "Blocked by dependency" : "Dependencies"}
                        >
                            <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                        </div>
                    )}
                    <div 
                      className={`w-2 h-2 rounded-full ${PRIORITY_DOTS[task.priority]}`} 
                      title={`Priority: ${task.priority}`}
                    />
                </div>
              </div>
              
              <p className={`text-sm text-slate-800 dark:text-slate-100 font-medium mb-3 line-clamp-3 ${isDone ? 'line-through text-slate-500' : ''}`}>
                {task.description}
              </p>

              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {tags.map((tag, i) => (
                    <span key={i} className="px-1.5 py-0.5 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300 text-[9px] font-bold rounded border border-indigo-100 dark:border-indigo-800/50">
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-1.5">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" className="text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                    <span className={`text-[10px] font-mono ${formatRelativeDate(task.date).colorClass}`}>
                      {formatRelativeDate(task.date).text}
                    </span>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <CopyIdButton 
                        id={task.id}
                        className="p-1 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded hover:bg-indigo-50 dark:hover:bg-indigo-900/50" 
                    />
                    <button 
                         onClick={(e) => { e.stopPropagation(); onDuplicate(task); }}
                         className="p-1 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded hover:bg-indigo-50 dark:hover:bg-indigo-900/50"
                         title="Duplicate"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" /></svg>
                    </button>
                    {!isDone && (
                        <button 
                            onClick={(e) => { e.stopPropagation(); onFocus(task); }}
                            className="p-1 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded hover:bg-indigo-50 dark:hover:bg-indigo-900/50"
                            title="Focus"
                        >
                             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        </button>
                    )}
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider py-1">Edit</span>
                </div>
              </div>
            </div>
          );
        })}
        {tasks.length === 0 && (
          <button 
             onClick={onAdd}
             className="w-full h-24 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg group hover:border-indigo-300 dark:hover:border-indigo-500 hover:bg-white/50 dark:hover:bg-slate-800/50 transition-all"
          >
            <span className="text-slate-400 group-hover:text-indigo-500 mb-1">
               <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
            </span>
            <span className="text-xs text-slate-400 font-medium group-hover:text-indigo-600 dark:group-hover:text-indigo-400">Create Task</span>
          </button>
        )}
      </div>
    </div>
  );
};
