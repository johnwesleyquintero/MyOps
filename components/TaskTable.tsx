
import React, { useState, useEffect, useRef, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { TaskEntry } from '../types';
import { COLUMN_CONFIG_KEY } from '../constants';
import { Icon, iconProps } from './Icons';
import { getProjectBadgeStyle, PRIORITY_STYLES, PRIORITY_DOT_STYLES, STATUS_STYLES, STATUS_DOT_STYLES } from '../utils/styleUtils';
import { formatRelativeDate } from '../utils/formatUtils';
import { useTableColumns, ColumnConfig, SortKey } from '../hooks/useTableColumns';
import { useSortableData } from '../hooks/useSortableData';
import { processTextWithTags } from '../utils/textUtils';
import { CopyIdButton } from './CopyIdButton';

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

const TableSkeleton = ({ colSpan }: { colSpan: number }) => (
  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 animate-pulse">
    {[...Array(5)].map((_, i) => (
      <tr key={i}>
        <td colSpan={colSpan} className="px-6 py-4">
          <div className="flex gap-4">
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-24"></div>
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-20"></div>
          </div>
        </td>
      </tr>
    ))}
  </tbody>
);

export const TaskTable: React.FC<TaskTableProps> = ({ 
  entries, 
  isLoading, 
  onEdit, 
  onStatusUpdate,
  onDescriptionUpdate,
  onFocus,
  onDuplicate,
  allEntries = []
}) => {
  const { columns, toggleColumn, moveColumn } = useTableColumns(DEFAULT_COLUMNS, COLUMN_CONFIG_KEY);
  const { items: sortedEntries, requestSort, sortConfig } = useSortableData(entries);

  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const configRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (configRef.current && !configRef.current.contains(event.target as Node)) {
        setIsConfigOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getDependencyStatus = useCallback((entry: TaskEntry) => {
      if (!entry.dependencies || entry.dependencies.length === 0) return null;
      const blockers = entry.dependencies.filter(depId => {
          const depTask = allEntries.find(e => e.id === depId);
          return depTask && depTask.status !== 'Done';
      });
      return { blocked: blockers.length > 0, count: blockers.length };
  }, [allEntries]);

  const handleChecklistToggle = useCallback((entry: TaskEntry, checkboxIndex: number) => {
    if (!onDescriptionUpdate) return;
    const lines = entry.description.split('\n');
    let counter = 0;
    const newLines = lines.map(line => {
        const match = line.match(/^(\s*[-*]\s*)\[([ x])\]/);
        if (match) {
            if (counter === checkboxIndex) {
                const newStatus = match[2] === 'x' ? ' ' : 'x';
                counter++;
                return line.replace(`[${match[2]}]`, `[${newStatus}]`);
            }
            counter++;
        }
        return line;
    });
    onDescriptionUpdate(entry, newLines.join('\n'));
  }, [onDescriptionUpdate]);

  const renderCell = (entry: TaskEntry, key: SortKey) => {
    switch(key) {
      case 'date':
        const { text, colorClass } = formatRelativeDate(entry.date);
        return <span className={`font-mono text-[11px] whitespace-nowrap ${colorClass}`}>{text}</span>;
      case 'description':
        const dep = getDependencyStatus(entry);
        let cbIdx = 0;
        return (
          <div className="flex items-start gap-2 max-w-lg relative group/cell">
            <div className={`prose prose-sm max-w-none line-clamp-2 overflow-hidden flex-1 ${entry.status === 'Done' ? 'opacity-50 line-through text-slate-400' : 'text-slate-700 dark:text-slate-200'}`}>
                <div onClick={() => onEdit(entry)} className="absolute inset-0 cursor-pointer z-0"></div>
                <div className="relative z-10 pointer-events-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]} components={{
                        a: ({node, ...props}) => <a {...props} className="text-indigo-600 pointer-events-auto cursor-pointer" onClick={e => e.stopPropagation()} target="_blank" />,
                        p: ({node, children}) => <span className="block">{React.Children.map(children, child => typeof child === 'string' ? processTextWithTags(child) : child)}</span>,
                        input: (props) => props.type === 'checkbox' ? (
                            <input type="checkbox" checked={props.checked} onChange={() => handleChecklistToggle(entry, cbIdx++)} onClick={e => e.stopPropagation()} className="mx-1 mt-0.5 align-middle rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5 cursor-pointer pointer-events-auto" />
                        ) : <input {...props} />
                    }}>{entry.description}</ReactMarkdown>
                </div>
            </div>
            {dep && dep.blocked && (
                <div className="flex-shrink-0 flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold border bg-rose-50 border-rose-100 text-rose-600 dark:bg-rose-900/20 dark:border-rose-900/30">
                    <Icon.Link {...iconProps(10, "mr-0.5")} />
                    {dep.count}
                </div>
            )}
          </div>
        );
      case 'project':
        return <span className={getProjectBadgeStyle(entry.project)}>{entry.project}</span>;
      case 'priority':
        return <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold border ${PRIORITY_STYLES[entry.priority]}`}><span className={`w-1.5 h-1.5 rounded-full ${PRIORITY_DOT_STYLES[entry.priority]}`} />{entry.priority}</div>;
      case 'status':
        return <button onClick={() => onStatusUpdate?.(entry)} className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold border hover:ring-2 hover:ring-indigo-100 dark:hover:ring-indigo-900 transition-all ${STATUS_STYLES[entry.status]}`}><span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT_STYLES[entry.status]}`} />{entry.status}</button>;
      default: return null;
    }
  };

  const visibleColumns = columns.filter(c => c.visible);

  return (
    <div className="relative">
      <div className="absolute -top-10 right-0 z-20" ref={configRef}>
        <button onClick={() => setIsConfigOpen(!isConfigOpen)} className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-xs font-medium text-slate-600 dark:text-slate-300 hover:border-slate-400 transition-all shadow-sm">
          <Icon.Menu {...iconProps(14)} />
          View
        </button>
        {isConfigOpen && (
          <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl overflow-hidden animate-slide-in z-50">
            <div className="bg-slate-50 dark:bg-slate-700 px-4 py-2 border-b border-slate-100 dark:border-slate-600 text-[10px] font-bold uppercase text-slate-500 tracking-wider">Table View</div>
            <div className="max-h-60 overflow-y-auto">
              {columns.map((col, idx) => (
                <div key={col.key} className="flex items-center justify-between px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 group">
                  <div className="flex items-center gap-2">
                    <input type="checkbox" checked={col.visible} onChange={() => toggleColumn(col.key)} className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4 cursor-pointer" />
                    <span className="text-sm text-slate-700 dark:text-slate-300">{col.label}</span>
                  </div>
                  <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => moveColumn(idx, 'up')} disabled={idx === 0} className="p-1 text-slate-400 hover:text-indigo-600 disabled:opacity-30"><Icon.Prev {...iconProps(12)} /></button>
                    <button onClick={() => moveColumn(idx, 'down')} disabled={idx === columns.length - 1} className="p-1 text-slate-400 hover:text-indigo-600 disabled:opacity-30"><Icon.Next {...iconProps(12)} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
        <div className="overflow-x-auto max-h-[600px] overflow-y-auto custom-scrollbar">
          <table className="min-w-full text-sm text-left relative border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-10 shadow-sm">
              <tr>
                {visibleColumns.map(col => (
                  <th key={col.key} className="px-6 py-3 text-[11px] uppercase tracking-widest font-bold text-slate-500 cursor-pointer select-none hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" onClick={() => requestSort(col.key)}>
                    <div className="flex items-center gap-1.5">
                      {col.label}
                      {sortConfig.key === col.key && (
                        <Icon.Down {...iconProps(10, sortConfig.direction === 'asc' ? 'rotate-180 transition-transform' : 'transition-transform')} />
                      )}
                    </div>
                  </th>
                ))}
                <th className="px-6 py-3 w-16 sticky right-0 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-[inset_1px_0_0_0_rgba(226,232,240,0.5)]"></th>
              </tr>
            </thead>
            {isLoading ? <TableSkeleton colSpan={visibleColumns.length + 1} /> : (
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {sortedEntries.map((entry) => (
                  <tr key={entry.id} className={`group hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors ${entry.status === 'Done' ? 'opacity-70' : ''}`}>
                    {visibleColumns.map(col => <td key={col.key} className="px-6 py-3 align-middle">{renderCell(entry, col.key)}</td>)}
                    <td className="px-6 py-3 text-right sticky right-0 bg-white dark:bg-slate-900 group-hover:bg-slate-50/50 dark:group-hover:bg-slate-800/50 shadow-[inset_1px_0_0_0_rgba(241,245,249,1)] dark:shadow-[inset_1px_0_0_0_rgba(15,23,42,1)]">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all">
                        <CopyIdButton id={entry.id} className="text-slate-400 hover:text-indigo-600 p-1 rounded hover:bg-indigo-50 dark:hover:bg-indigo-900/50" />
                        <button onClick={() => onDuplicate(entry)} className="text-slate-400 hover:text-indigo-600 p-1 rounded hover:bg-indigo-50 dark:hover:bg-indigo-900/50" title="Duplicate"><Icon.Copy {...iconProps(14)} /></button>
                        <button onClick={() => onEdit(entry)} className="text-slate-400 hover:text-indigo-600 p-1 rounded hover:bg-indigo-50 dark:hover:bg-indigo-900/50" title="Edit"><Icon.Edit {...iconProps(14)} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            )}
          </table>
        </div>
      </div>
    </div>
  );
};
