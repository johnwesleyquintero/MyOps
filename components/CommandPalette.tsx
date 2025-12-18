
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { TaskEntry, Page } from '../types';
import { PRIORITY_DOTS } from '../constants';
import { Icon, iconProps } from './Icons';

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
      label: 'Go to Dashboard',
      icon: <Icon.Dashboard {...iconProps(16)} />,
      action: () => onNavigate('DASHBOARD')
    },
    {
      id: 'nav-missions',
      type: 'NAVIGATION',
      label: 'Go to Mission Control',
      icon: <Icon.Missions {...iconProps(16)} />,
      action: () => onNavigate('MISSIONS')
    },
    {
      id: 'act-create',
      type: 'ACTION',
      label: 'Create New Task',
      subLabel: 'Open creator modal',
      icon: <Icon.Add {...iconProps(16)} />,
      action: () => onCreate()
    },
    {
      id: 'act-settings',
      type: 'ACTION',
      label: 'System Configuration',
      icon: <Icon.Settings {...iconProps(16)} />,
      action: () => onSettings()
    }
  ], [onNavigate, onCreate, onSettings]);

  const filteredCommands = useMemo(() => {
    const normalize = (s: string) => s.toLowerCase();
    const q = normalize(query);

    const cmds = staticCommands.filter(c => 
      normalize(c.label).includes(q) || (c.subLabel && normalize(c.subLabel).includes(q))
    );

    const tasks: CommandItem[] = entries
      .filter(t => normalize(t.description).includes(q) || normalize(t.project).includes(q))
      .slice(0, 10) 
      .map(t => ({
        id: t.id,
        type: 'TASK',
        label: t.description,
        subLabel: `${t.project} • ${t.status}`,
        meta: t,
        action: () => onEdit(t)
      }));

    if (!q) return [...cmds];
    return [...cmds, ...tasks];
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

  useEffect(() => {
    setSelectedIndex(0);
  }, [filteredCommands.length]);

  useEffect(() => {
    if (listRef.current) {
        const selectedEl = listRef.current.children[selectedIndex] as HTMLElement;
        if (selectedEl) {
            selectedEl.scrollIntoView({ block: 'nearest' });
        }
    }
  }, [selectedIndex]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-start justify-center pt-[15vh] px-4 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose}>
      <div 
        className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col animate-scale-in"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center px-4 py-4 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
          <Icon.Search {...iconProps(20, "text-slate-400 dark:text-slate-500 mr-3")} />
          <input 
            ref={inputRef}
            type="text" 
            className="flex-1 text-lg text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none bg-transparent"
            placeholder="Type a command or search..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <div className="flex gap-2">
             <kbd className="hidden sm:inline-block px-2 py-1 text-[10px] font-bold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 font-mono">ESC</kbd>
          </div>
        </div>

        <div 
            ref={listRef}
            className="max-h-[60vh] overflow-y-auto custom-scrollbar p-2 bg-slate-50/50 dark:bg-slate-900/50"
        >
          {filteredCommands.length === 0 ? (
            <div className="py-8 text-center text-slate-400 dark:text-slate-500 text-sm">No results found.</div>
          ) : (
            filteredCommands.map((item, index) => (
              <div
                key={item.id}
                onClick={() => { item.action(); onClose(); }}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-colors group ${
                  index === selectedIndex ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-800'
                }`}
              >
                <div className={`flex-shrink-0 ${index === selectedIndex ? 'text-indigo-200' : 'text-slate-400 dark:text-slate-500'}`}>
                   {item.type === 'TASK' ? (
                      <div className={`w-2.5 h-2.5 rounded-full ${item.meta ? PRIORITY_DOTS[item.meta.priority] : 'bg-slate-400'} ring-2 ring-white/20`} />
                   ) : (
                      item.icon
                   )}
                </div>

                <div className="flex-1 min-w-0">
                   <div className={`text-sm font-medium truncate ${index === selectedIndex ? 'text-white' : 'text-slate-800 dark:text-slate-200'}`}>
                     {item.label}
                   </div>
                   {item.subLabel && (
                     <div className={`text-xs truncate ${index === selectedIndex ? 'text-indigo-200' : 'text-slate-400 dark:text-slate-500'}`}>
                       {item.subLabel}
                     </div>
                   )}
                </div>

                {index === selectedIndex && (
                   <div className="flex-shrink-0 text-[10px] font-bold opacity-80 uppercase tracking-wider flex items-center gap-1">
                      {item.type === 'TASK' ? 'Edit' : 'Run'}
                      <Icon.Next {...iconProps(12)} />
                   </div>
                )}
                
                {item.type === 'TASK' && item.meta?.status !== 'Done' && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onToggleFocus(item.meta);
                            onClose();
                        }}
                        className={`ml-2 p-1.5 rounded transition-all ${
                            index === selectedIndex 
                            ? 'text-indigo-100 hover:bg-indigo-500 hover:text-white' 
                            : 'text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                        title="Enter Focus Mode"
                    >
                        <Icon.Focus {...iconProps(16)} />
                    </button>
                )}
              </div>
            ))
          )}
        </div>
        
        <div className="bg-slate-50 dark:bg-slate-800 px-4 py-2 border-t border-slate-200 dark:border-slate-700 text-[10px] text-slate-400 dark:text-slate-500 flex justify-between">
            <div>
                <span className="font-bold">ProTip:</span> Type task names to jump directly to edit.
            </div>
            <div className="flex gap-3">
                <span className="flex items-center gap-1"><kbd className="font-mono bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded px-1">↑↓</kbd> to navigate</span>
                <span className="flex items-center gap-1"><kbd className="font-mono bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded px-1">↵</kbd> to select</span>
            </div>
        </div>
      </div>
    </div>
  );
};
