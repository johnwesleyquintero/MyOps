
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { TaskEntry, Page } from '../types';
import { PRIORITY_DOTS } from '../constants';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  entries: TaskEntry[];
  onNavigate: (page: Page) => void;
  onCreate: () => void;
  onEdit: (entry: TaskEntry) => void;
  onSettings: () => void;
  onToggleFocus: (entry: TaskEntry) => void;
}

type CommandType = 'ACTION' | 'NAVIGATION' | 'TASK';

interface CommandItem {
  id: string;
  type: CommandType;
  label: string;
  subLabel?: string;
  icon?: React.ReactNode;
  action: () => void;
  meta?: any;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  entries,
  onNavigate,
  onCreate,
  onEdit,
  onSettings,
  onToggleFocus
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const staticCommands: CommandItem[] = useMemo(() => [
    {
      id: 'nav-dashboard',
      type: 'NAVIGATION',
      label: 'Navigate: Command Deck',
      icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>,
      action: () => onNavigate('DASHBOARD')
    },
    {
      id: 'nav-missions',
      type: 'NAVIGATION',
      label: 'Navigate: Mission Control',
      icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>,
      action: () => onNavigate('MISSIONS')
    },
    {
      id: 'act-create',
      type: 'ACTION',
      label: 'Initialize Mission',
      subLabel: 'Add new objective to ledger',
      icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>,
      action: () => onCreate()
    },
    {
      id: 'act-settings',
      type: 'ACTION',
      label: 'System Protocols',
      subLabel: 'Configure server link & AI',
      icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>,
      action: () => onSettings()
    }
  ], [onNavigate, onCreate, onSettings]);

  const filteredCommands = useMemo(() => {
    const q = query.toLowerCase();
    const actions = staticCommands.filter(c => c.label.toLowerCase().includes(q) || (c.subLabel && c.subLabel.toLowerCase().includes(q)));
    const tasks = entries
      .filter(t => t.description.toLowerCase().includes(q) || t.project.toLowerCase().includes(q))
      .slice(0, 15)
      .map(t => ({
        id: t.id,
        type: 'TASK' as CommandType,
        label: t.description,
        subLabel: `${t.project} • ${t.status}`,
        meta: t,
        action: () => onEdit(t)
      }));
    return [...actions, ...tasks];
  }, [query, staticCommands, entries, onEdit]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % filteredCommands.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          filteredCommands[selectedIndex].action();
          onClose();
        }
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, filteredCommands, selectedIndex, onClose]);

  useEffect(() => { setSelectedIndex(0); }, [filteredCommands.length]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-start justify-center pt-[12vh] px-4 bg-slate-950/40 backdrop-blur-md" onClick={onClose}>
      <div 
        className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col animate-scale-in"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center px-6 py-5 border-b border-slate-100 dark:border-slate-800">
          <svg className="w-5 h-5 text-indigo-500 mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input 
            ref={inputRef}
            type="text" 
            className="flex-1 text-xl text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none bg-transparent font-sans"
            placeholder="Awaiting command..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </div>

        <div ref={listRef} className="max-h-[60vh] overflow-y-auto custom-scrollbar p-2">
          {filteredCommands.length === 0 ? (
            <div className="py-12 text-center text-slate-400 dark:text-slate-600 font-mono text-sm">NO RESULTS IN DATABASE</div>
          ) : (
            filteredCommands.map((item, index) => {
              const isSelected = index === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={() => { item.action(); onClose(); }}
                  className={`flex items-center gap-4 px-4 py-3 rounded-xl cursor-pointer transition-all ${isSelected ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 translate-x-1' : 'text-slate-700 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                >
                  <div className={`flex-shrink-0 ${isSelected ? 'text-white' : 'text-slate-400 dark:text-slate-500'}`}>
                    {item.type === 'TASK' ? (
                       <div className={`w-3 h-3 rounded-full ${item.meta ? PRIORITY_DOTS[item.meta.priority] : 'bg-slate-400'} border-2 border-white/20`} />
                    ) : (item.icon)}
                  </div>
                  <div className="flex-1 min-w-0">
                     <div className={`text-sm font-bold truncate ${isSelected ? 'text-white' : 'text-slate-800 dark:text-slate-200'}`}>{item.label}</div>
                     {item.subLabel && <div className={`text-[10px] uppercase tracking-wider truncate mt-0.5 ${isSelected ? 'text-indigo-100/70' : 'text-slate-500'}`}>{item.subLabel}</div>}
                  </div>
                  {item.type === 'TASK' && isSelected && item.meta?.status !== 'Done' && (
                    <button onClick={(e) => { e.stopPropagation(); onToggleFocus(item.meta); onClose(); }} className="p-2 bg-indigo-500 hover:bg-indigo-400 rounded-lg transition-all" title="Focus Mission">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
        
        <div className="bg-slate-50 dark:bg-slate-800/50 px-6 py-3 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-500 font-mono flex justify-between uppercase tracking-widest">
            <div className="flex gap-4">
                <span className="flex items-center gap-2"><kbd className="bg-white dark:bg-slate-700 px-1.5 rounded border border-slate-300 dark:border-slate-600">↑↓</kbd> NAVIGATE</span>
                <span className="flex items-center gap-2"><kbd className="bg-white dark:bg-slate-700 px-1.5 rounded border border-slate-300 dark:border-slate-600">↵</kbd> EXECUTE</span>
            </div>
            <span>v2.3 ALPHA OPERATOR LINK</span>
        </div>
      </div>
    </div>
  );
};
