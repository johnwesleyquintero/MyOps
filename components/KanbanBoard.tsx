
import React, { useMemo } from 'react';
import { TaskEntry, StatusLevel } from '../types';
import { formatRelativeDate } from '../utils/formatUtils';
import { Badge } from './common/Badge';
import { CopyIdButton } from './CopyIdButton';
import { getDependencyStatus, extractTags } from '../utils/taskLogic';

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
    const cols: Record<StatusLevel, TaskEntry[]> = { 'Backlog': [], 'In Progress': [], 'Done': [] };
    entries.forEach(e => cols[e.status]?.push(e));
    return cols;
  }, [entries]);

  return (
    <div className="flex flex-col md:flex-row gap-6 overflow-x-auto pb-4 h-[calc(100vh-250px)]">
      {(['Backlog', 'In Progress', 'Done'] as StatusLevel[]).map(status => (
        <KanbanColumn 
          key={status} title={status} tasks={columns[status]} 
          colorClass={status === 'Backlog' ? 'border-t-slate-400' : status === 'Done' ? 'border-t-emerald-500' : 'border-t-indigo-500'} 
          onEdit={onEdit} onAdd={onAdd} onFocus={onFocus} allEntries={allEntries} 
        />
      ))}
    </div>
  );
};

const KanbanColumn: React.FC<{ title: string; tasks: TaskEntry[]; colorClass: string; onEdit: (e: TaskEntry) => void; onAdd: () => void; onFocus: (e: TaskEntry) => void; allEntries: TaskEntry[] }> = ({ title, tasks, colorClass, onEdit, onAdd, onFocus, allEntries }) => (
  <div className={`flex-1 min-w-[300px] flex flex-col rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 shadow-sm overflow-hidden border-t-4 ${colorClass}`}>
    <div className="p-3 flex justify-between items-center bg-white/50 dark:bg-slate-900/50 border-b border-slate-200/50 dark:border-slate-700/50">
      <div className="flex items-center gap-2">
         <h3 className="font-bold text-slate-700 dark:text-slate-200 text-sm uppercase tracking-wider">{title}</h3>
         <span className="bg-white dark:bg-slate-700 px-2 py-0.5 rounded-full text-xs font-mono text-slate-500">{tasks.length}</span>
      </div>
      <button onClick={onAdd} className="p-1 hover:bg-slate-200/50 rounded text-slate-400 hover:text-slate-600 transition-colors">
         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
      </button>
    </div>
    <div className="flex-1 p-3 overflow-y-auto custom-scrollbar space-y-3">
      {tasks.map(task => {
        const dep = getDependencyStatus(task, allEntries);
        const tags = extractTags(task.description);
        return (
          <div key={task.id} onClick={() => onEdit(task)} className={`bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm hover:border-indigo-300 transition-all cursor-pointer group ${title === 'Done' ? 'opacity-70 grayscale' : dep?.blocked ? 'border-rose-200' : ''}`}>
            <div className="flex justify-between items-start mb-2">
              <Badge type="project" value={task.project} />
              <Badge type="priority" value={task.priority} showDot={true} />
            </div>
            <p className="text-sm text-slate-800 dark:text-slate-100 font-medium mb-3 line-clamp-3">{task.description}</p>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {tags.map((tag, i) => <span key={i} className="px-1.5 py-0.5 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300 text-[9px] font-bold rounded">{tag}</span>)}
              </div>
            )}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className={`text-[10px] font-mono ${formatRelativeDate(task.date).colorClass}`}>{formatRelativeDate(task.date).text}</span>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <CopyIdButton id={task.id} className="p-1 text-slate-400 hover:text-indigo-600" />
                  {title !== 'Done' && <button onClick={(e) => { e.stopPropagation(); onFocus(task); }} className="p-1 text-slate-400 hover:text-indigo-600"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg></button>}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  </div>
);
