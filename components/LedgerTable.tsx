import React from 'react';
import { TaskEntry } from '../types';
import { formatDate, getProjectStyle, PRIORITY_COLORS, STATUS_COLORS } from '../constants';

interface LedgerTableProps {
  entries: TaskEntry[];
  isLoading: boolean;
  onEdit: (entry: TaskEntry) => void;
  onDelete: (entry: TaskEntry) => void;
  currency?: string; // Legacy prop, unused
  locale?: string;   // Legacy prop, unused
}

const TableSkeleton = () => (
  <tbody className="divide-y divide-slate-100 animate-pulse">
    {[...Array(5)].map((_, i) => (
      <tr key={i}>
        <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-24"></div></td>
        <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-48 mb-2"></div></td>
        <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-20"></div></td>
        <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-20"></div></td>
        <td className="px-6 py-4"><div className="h-8 bg-slate-100 rounded-full w-8 ml-auto"></div></td>
      </tr>
    ))}
  </tbody>
);

export const LedgerTable: React.FC<LedgerTableProps> = ({ entries, isLoading, onEdit, onDelete }) => {
  
  if (!isLoading && entries.length === 0) {
    return (
      <div className="w-full p-12 text-center bg-white border border-slate-200 rounded-xl border-dashed">
        <p className="text-slate-900 font-semibold">No tasks found.</p>
        <p className="text-slate-500 text-sm mt-1">Inbox Zero achieved. Or you need to add something.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden bg-white border border-slate-200 rounded-xl shadow-sm">
      <div className="overflow-x-auto max-h-[600px] overflow-y-auto custom-scrollbar">
        <table className="min-w-full text-sm text-left relative border-collapse">
          <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 sticky top-0 z-10 shadow-sm">
            <tr>
              <th className="px-6 py-3 w-32 whitespace-nowrap bg-slate-50 text-xs uppercase tracking-wider">Due</th>
              <th className="px-6 py-3 min-w-[200px] bg-slate-50 text-xs uppercase tracking-wider">Task</th>
              <th className="px-6 py-3 w-32 bg-slate-50 text-xs uppercase tracking-wider">Project</th>
              <th className="px-6 py-3 w-28 bg-slate-50 text-xs uppercase tracking-wider">Priority</th>
              <th className="px-6 py-3 w-32 bg-slate-50 text-xs uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 w-24 text-right bg-slate-50 text-xs uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          
          {isLoading ? (
            <TableSkeleton />
          ) : (
            <tbody className="divide-y divide-slate-100">
              {entries.map((entry, idx) => (
                <tr key={entry.id || `row-${idx}`} className={`group hover:bg-slate-50/80 transition-colors ${entry.status === 'Done' ? 'opacity-60 bg-slate-50/50' : ''}`}>
                  <td className="px-6 py-3 font-mono text-slate-500 whitespace-nowrap text-xs">
                    {formatDate(entry.date)}
                  </td>
                  <td className="px-6 py-3 text-slate-900 font-medium align-middle">
                    <div className={entry.status === 'Done' ? 'line-through text-slate-500' : ''}>
                        {entry.description}
                    </div>
                  </td>
                  <td className="px-6 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${getProjectStyle(entry.project)}`}>
                      {entry.project}
                    </span>
                  </td>
                  <td className="px-6 py-3">
                      <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold border ${PRIORITY_COLORS[entry.priority] || 'bg-slate-100'}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                        {entry.priority}
                      </div>
                  </td>
                  <td className="px-6 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${STATUS_COLORS[entry.status] || 'bg-slate-100'}`}>
                      {entry.status}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
                      <button 
                        onClick={() => onEdit(entry)}
                        className="text-slate-400 hover:text-indigo-600 p-1.5 rounded hover:bg-indigo-50 transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                      </button>
                      <button 
                        onClick={() => onDelete(entry)}
                        className="text-slate-400 hover:text-rose-600 p-1.5 rounded hover:bg-rose-50 transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          )}
        </table>
      </div>
    </div>
  );
};