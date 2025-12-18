
import React, { useState, useEffect, useRef } from 'react';
import { TaskEntry } from '../types';
import { useTableColumns, ColumnConfig, SortKey } from '../hooks/useTableColumns';
import { useSortableData } from '../hooks/useSortableData';
import { CopyIdButton } from './CopyIdButton';
import { TaskTableCell } from './table/TaskTableCell';
import { getDependencyStatus } from '../utils/taskLogic';

interface TaskTableProps {
  entries: TaskEntry[];
  isLoading: boolean;
  onEdit: (entry: TaskEntry) => void;
  onDelete: (entry: TaskEntry) => void;
  onStatusUpdate?: (entry: TaskEntry) => void;
  onDescriptionUpdate?: (entry: TaskEntry, newDesc: string) => void;
  onFocus: (entry: TaskEntry) => void;
  onDuplicate: (entry: TaskEntry) => void; 
  allEntries?: TaskEntry[]; 
}

const DEFAULT_COLUMNS: ColumnConfig[] = [
  { key: 'date', label: 'Due', visible: true, width: 'w-32' },
  { key: 'description', label: 'Mission', visible: true, width: 'min-w-[300px]' },
  { key: 'project', label: 'Project', visible: true, width: 'w-32' },
  { key: 'priority', label: 'Priority', visible: true, width: 'w-28' },
  { key: 'status', label: 'Status', visible: true, width: 'w-32' },
];

const STORAGE_KEY = 'myops_column_config_v1';

export const TaskTable: React.FC<TaskTableProps> = ({ 
  entries, 
  isLoading, 
  onEdit, 
  onStatusUpdate,
  onDescriptionUpdate,
  onFocus,
  allEntries = []
}) => {
  const { columns, toggleColumn } = useTableColumns(DEFAULT_COLUMNS, STORAGE_KEY);
  const { items: sortedEntries, requestSort, sortConfig } = useSortableData(entries);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const configRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (configRef.current && !configRef.current.contains(e.target as Node)) setIsConfigOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!isLoading && entries.length === 0) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl border-dashed">
        <h3 className="text-slate-900 dark:text-slate-100 font-bold text-lg">Deck Clear</h3>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Standby for next mission orders.</p>
      </div>
    );
  }

  const visibleColumns = columns.filter(c => c.visible);

  return (
    <div className="relative">
      <div className="absolute -top-10 right-0 z-20" ref={configRef}>
        <button onClick={() => setIsConfigOpen(!isConfigOpen)} className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white shadow-sm">
          Display
        </button>
        {isConfigOpen && (
          <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl overflow-hidden z-50">
            <div className="bg-slate-50 dark:bg-slate-700 px-4 py-2 border-b border-slate-100 dark:border-slate-600 text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">Interface Mapping</div>
            <div className="max-h-60 overflow-y-auto py-1">
              {columns.map(col => (
                <div key={col.key} className="flex items-center gap-2 px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-700">
                  <input type="checkbox" checked={col.visible} onChange={() => toggleColumn(col.key)} className="rounded border-slate-300 text-indigo-600 h-4 w-4 cursor-pointer" />
                  <span className="text-sm text-slate-700 dark:text-slate-300">{col.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
        <div className="overflow-x-auto max-h-[650px] overflow-y-auto custom-scrollbar">
          <table className="min-w-full text-sm text-left relative border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-10">
              <tr>
                {visibleColumns.map(col => {
                  const isActive = sortConfig.key === col.key;
                  return (
                    <th key={col.key} className="px-6 py-3 text-[11px] uppercase tracking-widest font-bold text-slate-500 dark:text-slate-400 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700" onClick={() => requestSort(col.key)}>
                      <div className={`flex items-center gap-1.5 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : ''}`}>
                        {col.label}
                      </div>
                    </th>
                  );
                })}
                <th className="px-6 py-3 w-16 sticky right-0"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {sortedEntries.map(entry => (
                <tr key={entry.id} className={`group hover:bg-slate-50/80 dark:hover:bg-slate-800/80 transition-colors ${entry.status === 'Done' ? 'opacity-70' : ''}`}>
                  {visibleColumns.map(col => (
                    <td key={col.key} className={`px-6 py-3 align-middle ${col.width || ''}`}>
                      <TaskTableCell 
                        entry={entry} 
                        columnKey={col.key} 
                        allEntries={allEntries} 
                        onEdit={onEdit} 
                        onStatusUpdate={onStatusUpdate} 
                        onDescriptionUpdate={onDescriptionUpdate}
                      />
                    </td>
                  ))}
                  <td className="px-6 py-3 text-right sticky right-0 bg-white dark:bg-slate-900 group-hover:bg-slate-50/80 dark:group-hover:bg-slate-800/80">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all">
                      <CopyIdButton id={entry.id} className="text-slate-400 hover:text-indigo-600 p-1.5 rounded" />
                      {entry.status !== 'Done' && (
                        <button onClick={() => onFocus(entry)} className="text-slate-400 hover:text-indigo-600 p-1.5 rounded" title="Deep Focus">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        </button>
                      )}
                      <button onClick={() => onEdit(entry)} className="text-slate-400 hover:text-indigo-600 p-1.5 rounded">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
