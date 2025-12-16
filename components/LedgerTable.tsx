
import React, { useState, useMemo, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { TaskEntry, PriorityLevel, StatusLevel } from '../types';
import { formatDate, getProjectStyle, PRIORITY_COLORS, STATUS_COLORS } from '../constants';

interface LedgerTableProps {
  entries: TaskEntry[];
  isLoading: boolean;
  onEdit: (entry: TaskEntry) => void;
  onDelete: (entry: TaskEntry) => void;
  onStatusUpdate?: (entry: TaskEntry) => void;
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
  { key: 'date', label: 'Due', visible: true, width: 'w-24' },
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

export const LedgerTable: React.FC<LedgerTableProps> = ({ 
  entries, 
  isLoading, 
  onEdit, 
  onDelete, 
  onStatusUpdate 
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

  if (!isLoading && entries.length === 0) {
    return (
      <div className="w-full p-12 text-center bg-white border border-slate-200 rounded-xl border-dashed">
        <p className="text-slate-900 font-semibold">No tasks found.</p>
        <p className="text-slate-500 text-sm mt-1">Inbox Zero achieved.</p>
      </div>
    );
  }

  const SortHeader = ({ col }: { col: ColumnConfig }) => {
    const isActive = sortConfig.key === col.key;
    const isAsc = sortConfig.direction === 'asc';
    return (
      <th 
        className="px-6 py-3 bg-slate-50 text-xs uppercase tracking-wider font-semibold cursor-pointer group/th select-none hover:bg-slate-100 transition-colors whitespace-nowrap"
        onClick={() => handleSort(col.key)}
      >
        <div className={`flex items-center gap-1.5 ${isActive ? 'text-indigo-600' : 'text-slate-500'}`}>
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
        return <span className="font-mono text-slate-500 whitespace-nowrap text-xs">{formatDate(entry.date)}</span>;
      case 'description':
        return (
          // Added line-clamp-2 to limit vertical height in the table
          <div 
             className={`prose prose-sm max-w-none line-clamp-2 overflow-hidden ${entry.status === 'Done' ? 'opacity-50' : 'text-slate-600'} cursor-pointer hover:text-indigo-900`}
             onClick={() => onEdit(entry)}
             title="Click to view/edit full description"
          >
            <ReactMarkdown 
              components={{
                a: ({node, ...props}) => <a {...props} className="text-indigo-600 pointer-events-none" />, // Disable links in preview to prevent accidental clicks
                p: ({node, ...props}) => <span {...props} className="mr-1" />, // Flatten paragraphs for summary view
                strong: ({node, ...props}) => <strong {...props} className="font-bold text-slate-800" />,
                em: ({node, ...props}) => <em {...props} className="italic text-slate-700" />,
                code: ({node, ...props}) => <code {...props} className="bg-slate-100 text-pink-600 px-1 py-0.5 rounded text-xs font-mono" />,
                h1: ({node, ...props}) => <strong {...props} className="block text-slate-800 font-bold" />,
                h2: ({node, ...props}) => <strong {...props} className="block text-slate-800 font-bold" />,
                ul: ({node, ...props}) => <span {...props} />, // Flatten lists
                li: ({node, ...props}) => <span {...props} className="after:content-[',_'] last:after:content-none" />,
              }}
            >
                {entry.description}
            </ReactMarkdown>
          </div>
        );
      case 'project':
        return (
          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${getProjectStyle(entry.project)}`}>
            {entry.project}
          </span>
        );
      case 'priority':
        return (
          <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold border ${PRIORITY_COLORS[entry.priority] || 'bg-slate-100'}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
            {entry.priority}
          </div>
        );
      case 'status':
        return (
          <button 
            onClick={() => onStatusUpdate && onStatusUpdate(entry)}
            className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border cursor-pointer hover:shadow-sm transition-all active:scale-95 ${STATUS_COLORS[entry.status] || 'bg-slate-100'}`}
            title="Click to cycle status"
          >
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
          Columns
        </button>

        {isConfigOpen && (
          <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-lg shadow-xl overflow-hidden animate-slide-in">
            <div className="bg-slate-50 px-4 py-2 border-b border-slate-100 text-[10px] font-bold uppercase text-slate-500 tracking-wider">Configure View</div>
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
        <div className="overflow-x-auto max-h-[600px] overflow-y-auto custom-scrollbar">
          <table className="min-w-full text-sm text-left relative border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10 shadow-sm">
              <tr>
                {visibleColumns.map(col => <SortHeader key={col.key} col={col} />)}
                <th className="px-6 py-3 w-24 text-right bg-slate-50 text-xs uppercase tracking-wider text-slate-500 font-semibold sticky right-0 shadow-[inset_1px_0_0_0_rgba(226,232,240,0.5)]">Actions</th>
              </tr>
            </thead>
            
            {isLoading ? (
              <TableSkeleton colSpan={visibleColumns.length + 1} />
            ) : (
              <tbody className="divide-y divide-slate-100">
                {sortedEntries.map((entry, idx) => (
                  <tr key={entry.id || `row-${idx}`} className={`group hover:bg-slate-50/80 transition-colors ${entry.status === 'Done' ? 'bg-slate-50/50' : ''}`}>
                    {visibleColumns.map(col => (
                      <td key={`${entry.id}-${col.key}`} className={`px-6 py-3 align-middle ${col.width || ''}`}>
                        {renderCell(entry, col.key)}
                      </td>
                    ))}
                    <td className="px-6 py-3 text-right sticky right-0 bg-white group-hover:bg-slate-50/80 transition-colors shadow-[inset_1px_0_0_0_rgba(241,245,249,1)]">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
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
