import React, { useState, useMemo, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { TaskEntry, PriorityLevel, StatusLevel } from '../types';
import { formatRelativeDate, getProjectStyle, PRIORITY_COLORS, PRIORITY_DOTS, STATUS_COLORS } from '../constants';

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
  currency?: string;
  locale?: string;
}

type SortKey = 'date' | 'description' | 'project' | 'priority' | 'status';
type SortDirection = 'asc' | 'desc';

interface ColumnConfig {
  key: SortKey;
  label: string;
  visible: boolean;
  width?: string;
}

const DEFAULT_COLUMNS: ColumnConfig[] = [
  { key: 'date', label: 'Due', visible: true, width: 'w-32' },
  { key: 'description', label: 'Task', visible: true, width: 'min-w-[300px]' },
  { key: 'project', label: 'Project', visible: true, width: 'w-32' },
  { key: 'priority', label: 'Priority', visible: true, width: 'w-28' },
  { key: 'status', label: 'Status', visible: true, width: 'w-32' },
];

const STORAGE_KEY = 'myops_column_config_v1';

const TableSkeleton = ({ colSpan }: { colSpan: number }) => (
  <tbody className="divide-y divide-slate-100 animate-pulse">
    {[...Array(5)].map((_, i) => (
      <tr key={i}>
        <td colSpan={colSpan} className="px-6 py-4">
          <div className="flex gap-4">
            <div className="h-4 bg-slate-200 rounded w-24"></div>
            <div className="h-4 bg-slate-200 rounded w-full"></div>
            <div className="h-4 bg-slate-200 rounded w-20"></div>
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
  onDelete, 
  onStatusUpdate,
  onDescriptionUpdate,
  onFocus,
  onDuplicate,
  allEntries = []
}) => {
  // --- Column Management State ---
  const [columns, setColumns] = useState<ColumnConfig[]>(DEFAULT_COLUMNS);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const configRef = useRef<HTMLDivElement>(null);

  // Load from local storage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const merged = DEFAULT_COLUMNS.map(def => {
          const savedCol = parsed.find((p: ColumnConfig) => p.key === def.key);
          return savedCol ? { ...def, ...savedCol } : def;
        });
        const ordered = parsed.map((p: ColumnConfig) => merged.find(m => m.key === p.key)).filter(Boolean) as ColumnConfig[];
        const missing = DEFAULT_COLUMNS.filter(d => !ordered.find(o => o.key === d.key));
        setColumns([...ordered, ...missing]);
      }
    } catch (e) {
      console.warn("Failed to load column config", e);
    }
  }, []);

  const saveColumns = (newCols: ColumnConfig[]) => {
    setColumns(newCols);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newCols));
  };

  const toggleColumn = (key: SortKey) => {
    const newCols = columns.map(c => c.key === key ? { ...c, visible: !c.visible } : c);
    saveColumns(newCols);
  };

  const moveColumn = (index: number, direction: 'up' | 'down') => {
    const newCols = [...columns];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newCols.length) return;
    [newCols[index], newCols[targetIndex]] = [newCols[targetIndex], newCols[index]];
    saveColumns(newCols);
  };

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (configRef.current && !configRef.current.contains(event.target as Node)) {
        setIsConfigOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- Sorting & Data State ---
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: SortDirection }>({ 
    key: 'date', 
    direction: 'asc' 
  });

  const handleSort = (key: SortKey) => {
    setSortConfig((current) => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const sortedEntries = useMemo(() => {
    if (!entries) return [];
    return [...entries].sort((a, b) => {
      let comparison = 0;
      switch (sortConfig.key) {
        case 'date':
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
        case 'priority':
          const pRanks: Record<PriorityLevel, number> = { 'High': 0, 'Medium': 1, 'Low': 2 };
          comparison = (pRanks[a.priority] ?? 99) - (pRanks[b.priority] ?? 99);
          break;
        case 'status':
          const sRanks: Record<StatusLevel, number> = { 'Backlog': 0, 'In Progress': 1, 'Done': 2 };
          comparison = (sRanks[a.status] ?? 99) - (sRanks[b.status] ?? 99);
          break;
        default:
          const valA = String(a[sortConfig.key] || '').toLowerCase();
          const valB = String(b[sortConfig.key] || '').toLowerCase();
          if (valA < valB) comparison = -1;
          if (valA > valB) comparison = 1;
      }
      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });
  }, [entries, sortConfig]);

  // Dependency Checker
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

  // Checklist Toggle Logic
  const handleChecklistToggle = (entry: TaskEntry, checkboxIndex: number) => {
    if (!onDescriptionUpdate) return;

    const regex = /^(\s*[-*]\s*)\[([ x])\]/gm;
    let match;
    let matchIndex = 0;
    
    // We need to find the Nth checkbox match in the raw string
    // and flip it.
    
    // Reconstruct string manually to avoid tricky regex replace issues with global flag
    const text = entry.description;
    const lines = text.split('\n');
    let currentCheckbox = 0;
    
    const newLines = lines.map(line => {
        const checkboxMatch = line.match(/^(\s*[-*]\s*)\[([ x])\]/);
        if (checkboxMatch) {
            if (currentCheckbox === checkboxIndex) {
                const isChecked = checkboxMatch[2] === 'x';
                const newStatus = isChecked ? ' ' : 'x';
                // Replace only the first occurrence of the bracket part in this line
                // to avoid messing up if they typed weird stuff later in the line
                currentCheckbox++;
                return line.replace(`[${checkboxMatch[2]}]`, `[${newStatus}]`);
            }
            currentCheckbox++;
        }
        return line;
    });

    onDescriptionUpdate(entry, newLines.join('\n'));
  };

  if (!isLoading && entries.length === 0) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-20 bg-white border border-slate-200 rounded-xl border-dashed">
        <div className="bg-slate-50 p-4 rounded-full mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-slate-900 font-bold text-lg">All caught up</h3>
        <p className="text-slate-500 text-sm mt-1 max-w-xs text-center">Your task list is clear. Time to strategize for the next move or enjoy the downtime.</p>
      </div>
    );
  }

  const SortHeader: React.FC<{ col: ColumnConfig }> = ({ col }) => {
    const isActive = sortConfig.key === col.key;
    const isAsc = sortConfig.direction === 'asc';
    return (
      <th 
        className="px-6 py-3 bg-slate-50 text-[11px] uppercase tracking-widest font-bold text-slate-500 cursor-pointer group/th select-none hover:bg-slate-100 transition-colors whitespace-nowrap border-b border-slate-200"
        onClick={() => handleSort(col.key)}
      >
        <div className={`flex items-center gap-1.5 ${isActive ? 'text-indigo-600' : ''}`}>
          {col.label}
          <div className="flex flex-col">
             <svg className={`w-2 h-2 ${isActive && isAsc ? 'text-indigo-600' : 'text-slate-300'} ${!isActive && 'group-hover/th:text-slate-400'}`} fill="currentColor" viewBox="0 0 24 24"><path d="M12 4l-8 8h16l-8-8z" /></svg>
             <svg className={`w-2 h-2 -mt-0.5 ${isActive && !isAsc ? 'text-indigo-600' : 'text-slate-300'} ${!isActive && 'group-hover/th:text-slate-400'}`} fill="currentColor" viewBox="0 0 24 24"><path d="M12 20l8-8H4l8 8z" /></svg>
          </div>
        </div>
      </th>
    );
  };

  const renderCell = (entry: TaskEntry, key: SortKey) => {
    switch(key) {
      case 'date':
        const dateInfo = formatRelativeDate(entry.date);
        return <span className={`font-mono text-xs whitespace-nowrap ${dateInfo.colorClass}`}>{dateInfo.text}</span>;
      case 'description':
        const depStatus = getDependencyStatus(entry);
        
        // Counter for checkboxes in this specific cell render
        let checkboxCounter = 0;

        return (
          <div className="flex items-start gap-2">
            <div 
                className={`prose prose-sm max-w-none line-clamp-2 overflow-hidden ${entry.status === 'Done' ? 'opacity-50 line-through text-slate-400' : 'text-slate-700'} transition-colors relative`}
                title="Click to edit (or click checkboxes)"
            >
                {/* 
                  We handle clicks carefully here. 
                  Checkboxes stopPropagation to allow toggling.
                  The background div handles the "Edit" click.
                */}
                <div onClick={() => onEdit(entry)} className="absolute inset-0 cursor-pointer z-0"></div>

                <div className="relative z-10 pointer-events-none">
                    <ReactMarkdown 
                    remarkPlugins={[remarkGfm]}
                    components={{
                        a: ({node, ...props}) => <a {...props} className="text-indigo-600 pointer-events-auto cursor-pointer hover:underline" onClick={e => e.stopPropagation()} target="_blank" />,
                        p: ({node, ...props}) => <span {...props} className="mr-1" />,
                        strong: ({node, ...props}) => <strong {...props} className="font-bold text-slate-900" />,
                        em: ({node, ...props}) => <em {...props} className="italic text-slate-600" />,
                        code: ({node, ...props}) => <code {...props} className="bg-slate-100 text-slate-600 border border-slate-200 px-1 py-0.5 rounded text-[10px] font-mono" />,
                        ul: ({node, ...props}) => <span {...props} />,
                        li: ({node, ...props}) => <span {...props} className="after:content-[',_'] last:after:content-none" />,
                        // Custom Checkbox Renderer
                        input: (props) => {
                            if (props.type === 'checkbox') {
                                const index = checkboxCounter++;
                                return (
                                    <input 
                                        type="checkbox" 
                                        checked={props.checked} 
                                        onChange={() => handleChecklistToggle(entry, index)}
                                        onClick={(e) => e.stopPropagation()}
                                        className="mx-1 mt-0.5 align-middle rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5 cursor-pointer pointer-events-auto"
                                    />
                                );
                            }
                            return <input {...props} />;
                        }
                    }}
                    >
                        {entry.description}
                    </ReactMarkdown>
                </div>
            </div>
            {depStatus && (
                <div 
                    className={`flex-shrink-0 flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold border ${depStatus.blocked ? 'bg-red-50 text-red-600 border-red-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}
                    title={depStatus.blocked ? `${depStatus.blockerCount} blocking tasks pending` : 'Dependencies cleared'}
                >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                    {depStatus.blocked && <span>{depStatus.blockerCount}</span>}
                </div>
            )}
          </div>
        );
      case 'project':
        return (
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${getProjectStyle(entry.project)}`}>
            {entry.project}
          </span>
        );
      case 'priority':
        return (
          <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold border ${PRIORITY_COLORS[entry.priority] || 'bg-slate-50 border-slate-200 text-slate-500'}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${PRIORITY_DOTS[entry.priority] || 'bg-slate-300'}`}></span>
            {entry.priority}
          </div>
        );
      case 'status':
        return (
          <button 
            onClick={() => onStatusUpdate && onStatusUpdate(entry)}
            className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold border cursor-pointer hover:ring-2 hover:ring-indigo-100 transition-all active:scale-95 ${STATUS_COLORS[entry.status] || 'bg-slate-50'}`}
            title="Click to cycle status"
          >
             {/* Status Dot */}
            <span className={`w-1.5 h-1.5 rounded-full ${
                entry.status === 'Done' ? 'bg-emerald-500' : 
                entry.status === 'In Progress' ? 'bg-indigo-500' : 'bg-slate-400'
            }`}></span>
            {entry.status}
          </button>
        );
      default:
        return null;
    }
  };

  const visibleColumns = columns.filter(c => c.visible);

  return (
    <div className="relative">
      <div className="absolute -top-10 right-0 z-20" ref={configRef}>
        <button
          onClick={() => setIsConfigOpen(!isConfigOpen)}
          className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-md text-xs font-medium text-slate-600 hover:text-slate-900 hover:border-slate-300 shadow-sm transition-all"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
          View
        </button>

        {isConfigOpen && (
          <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-lg shadow-xl overflow-hidden animate-slide-in z-50">
            <div className="bg-slate-50 px-4 py-2 border-b border-slate-100 text-[10px] font-bold uppercase text-slate-500 tracking-wider">Table Columns</div>
            <div className="max-h-60 overflow-y-auto py-1">
              {columns.map((col, idx) => (
                <div key={col.key} className="flex items-center justify-between px-3 py-2 hover:bg-slate-50 group">
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      checked={col.visible}
                      onChange={() => toggleColumn(col.key)}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4 cursor-pointer"
                    />
                    <span className="text-sm text-slate-700">{col.label}</span>
                  </div>
                  <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => moveColumn(idx, 'up')} disabled={idx === 0} className="p-1 text-slate-400 hover:text-indigo-600 disabled:opacity-30"><svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" /></svg></button>
                    <button onClick={() => moveColumn(idx, 'down')} disabled={idx === columns.length - 1} className="p-1 text-slate-400 hover:text-indigo-600 disabled:opacity-30"><svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="overflow-hidden bg-white border border-slate-200 rounded-xl shadow-sm">
        <div className="overflow-x-auto max-h-[650px] overflow-y-auto custom-scrollbar">
          <table className="min-w-full text-sm text-left relative border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10 shadow-sm">
              <tr>
                {visibleColumns.map(col => <SortHeader key={col.key} col={col} />)}
                <th className="px-6 py-3 w-16 text-right bg-slate-50 text-[11px] uppercase tracking-widest text-slate-500 font-bold sticky right-0 shadow-[inset_1px_0_0_0_rgba(226,232,240,0.5)]"></th>
              </tr>
            </thead>
            
            {isLoading ? (
              <TableSkeleton colSpan={visibleColumns.length + 1} />
            ) : (
              <tbody className="divide-y divide-slate-100">
                {sortedEntries.map((entry, idx) => (
                  <tr key={entry.id || `row-${idx}`} className={`group hover:bg-slate-50/80 transition-colors ${entry.status === 'Done' ? 'bg-slate-50/30' : ''}`}>
                    {visibleColumns.map(col => (
                      <td key={`${entry.id}-${col.key}`} className={`px-6 py-3 align-middle ${col.width || ''}`}>
                        {renderCell(entry, col.key)}
                      </td>
                    ))}
                    <td className="px-6 py-3 text-right sticky right-0 bg-white group-hover:bg-slate-50/80 transition-colors shadow-[inset_1px_0_0_0_rgba(241,245,249,1)]">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
                        {entry.status !== 'Done' && (
                            <button onClick={() => onFocus(entry)} className="text-slate-400 hover:text-indigo-600 p-1.5 rounded hover:bg-indigo-50 transition-colors" title="Deep Work Focus">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                            </button>
                        )}
                        <button onClick={() => onDuplicate(entry)} className="text-slate-400 hover:text-indigo-600 p-1.5 rounded hover:bg-indigo-50 transition-colors" title="Duplicate">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" /></svg>
                        </button>
                        <button onClick={() => onEdit(entry)} className="text-slate-400 hover:text-indigo-600 p-1.5 rounded hover:bg-indigo-50 transition-colors" title="Edit Task">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
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
    </div>
  );
};