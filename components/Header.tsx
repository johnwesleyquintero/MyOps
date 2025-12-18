
import React from 'react';
import { Page } from '../types';
import { Icon, iconProps } from './Icons';

interface HeaderProps {
  activePage: Page;
  onMenuToggle: () => void;
  onOpenCreate: () => void;
  onOpenAiChat: () => void;
}

export const Header: React.FC<HeaderProps> = ({ activePage, onMenuToggle, onOpenCreate, onOpenAiChat }) => {
  const getTitle = () => {
    switch(activePage) {
      case 'DASHBOARD': return 'Command Center';
      case 'MISSIONS': return 'Mission Control';
      default: return 'System';
    }
  };

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 sm:px-8 sticky top-0 z-30 transition-colors duration-300">
      <div className="flex items-center gap-4">
        {/* Mobile Hamburger */}
        <button 
          onClick={onMenuToggle}
          className="lg:hidden p-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <Icon.Menu {...iconProps(22)} />
        </button>

        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">{getTitle()}</h2>
      </div>

      <div className="flex items-center gap-3">
         {/* AI Chat Button */}
         <button 
            onClick={onOpenAiChat}
            className="hidden sm:flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
         >
            <Icon.Chat {...iconProps(16)} />
            Ask Wes
         </button>
         <button 
            onClick={onOpenAiChat}
            className="sm:hidden flex items-center justify-center w-8 h-8 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all"
         >
             <Icon.Chat {...iconProps(18)} />
         </button>

         {/* Quick Action: New Task (Always available) */}
         <button 
            onClick={onOpenCreate}
            className="hidden sm:flex items-center gap-2 bg-slate-900 dark:bg-indigo-600 text-white px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-slate-800 dark:hover:bg-indigo-500 shadow-md hover:shadow-lg active:scale-95 transition-all"
         >
            <Icon.Add {...iconProps(16, "stroke-[3px]")} />
            Quick Task
         </button>
         <button 
            onClick={onOpenCreate}
            className="sm:hidden flex items-center justify-center w-8 h-8 bg-slate-900 dark:bg-indigo-600 text-white rounded-lg shadow-md hover:bg-slate-800 dark:hover:bg-indigo-500"
         >
             <Icon.Add {...iconProps(18, "stroke-[3px]")} />
         </button>
      </div>
    </header>
  );
};
