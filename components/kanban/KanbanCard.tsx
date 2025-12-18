
import React from 'react';
import { TaskEntry } from '../../types';
import { PRIORITY_DOTS } from '../../constants';
import { formatRelativeDate, getProjectStyle } from '../../utils/formatUtils';
import { CopyIdButton } from '../CopyIdButton';

interface KanbanCardProps {
  task: TaskEntry;
  onEdit: (entry: TaskEntry) => void;
  onFocus: (entry: TaskEntry) => void;
  onDuplicate: (entry: TaskEntry) => void;
  isDone?: boolean;
  dependencyStatus: { count: number; blocked: boolean; blockerCount: number } | null;
}

export const KanbanCard: React.FC<KanbanCardProps> = ({ 
  task, 
  onEdit, 
  onFocus, 
  onDuplicate, 
  isDone, 
  dependencyStatus 
}) => {
  const getTags = (desc: string) => {
    const matches = desc.match(/#\w+/g);
    return matches || [];
  };

  const tags = getTags(task.description);

  return (
    <div 
      onClick={() => onEdit(task)}
      className={`bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-indigo-400 dark:hover:border-indigo-500 cursor-pointer transition-all duration-300 ease-out group active:scale-[0.97] relative overflow-hidden ${isDone ? 'opacity-60 grayscale hover:grayscale-0 hover:opacity-100' : ''}`}
    >
      {/* Decorative accent for high priority */}
      {task.priority === 'High' && (
        <div className="absolute top-0 left-0 w-1 h-full bg-rose-500/50"></div>
      )}

      <div className="flex justify-between items-start mb-3">
        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider border ${getProjectStyle(task.project)}`}>
          {task.project}
        </span>
        <div className="flex gap-2 items-center">
            {dependencyStatus && (
                 <div 
                    className={`flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-bold border transition-colors ${dependencyStatus.blocked ? 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/30' : 'bg-slate-50 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700'}`}
                    title={dependencyStatus.blocked ? "Blocked by dependency" : "Dependencies"}
                >
                    <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                    {dependencyStatus.blocked && <span>{dependencyStatus.blockerCount}</span>}
                </div>
            )}
            <div className={`w-2.5 h-2.5 rounded-full ${PRIORITY_DOTS[task.priority]} ring-4 ring-white/50 dark:ring-slate-800/50`} />
        </div>
      </div>
      
      <p className={`text-sm text-slate-800 dark:text-slate-100 font-semibold mb-4 line-clamp-2 leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors ${isDone ? 'line-through text-slate-500' : ''}`}>
        {task.description.split('\n')[0]}
      </p>

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {tags.map((tag, i) => (
            <span key={i} className="px-2 py-0.5 bg-indigo-50/50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 text-[9px] font-bold rounded-md border border-indigo-100/50 dark:border-indigo-800/30">
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-1.5 text-slate-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            <span className={`text-[10px] font-mono font-bold tracking-tight ${formatRelativeDate(task.date).colorClass}`}>
              {formatRelativeDate(task.date).text}
            </span>
        </div>
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-300">
            <CopyIdButton id={task.id} className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md" />
            <button onClick={(e) => { e.stopPropagation(); onDuplicate(task); }} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors" title="Duplicate">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" /></svg>
            </button>
            {!isDone && (
                <button onClick={(e) => { e.stopPropagation(); onFocus(task); }} className="p-1.5 text-slate-400 hover:text-indigo-600 bg-slate-50 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-md transition-all shadow-sm active:scale-90" title="Focus Mode">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                </button>
            )}
        </div>
      </div>
    </div>
  );
};
