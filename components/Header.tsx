import React from 'react';
import { Page } from '../types';

interface HeaderProps {
  activePage: Page;
  onMenuToggle: () => void;
  onOpenCreate: () => void;
}

export const Header: React.FC<HeaderProps> = ({ activePage, onMenuToggle, onOpenCreate }) => {
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
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">{getTitle()}</h2>
      </div>

      <div className="flex items-center gap-3">
         {/* Quick Action: New Task (Always available) */}
         <button 
            onClick={onOpenCreate}
            className="hidden sm:flex items-center gap-2 bg-slate-900 dark:bg-indigo-600 text-white px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-slate-800 dark:hover:bg-indigo-500 shadow-md hover:shadow-lg active:scale-95 transition-all"
         >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
               <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Quick Task
         </button>
         <button 
            onClick={onOpenCreate}
            className="sm:hidden flex items-center justify-center w-8 h-8 bg-slate-900 dark:bg-indigo-600 text-white rounded-lg shadow-md hover:bg-slate-800 dark:hover:bg-indigo-500"
         >
             <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
               <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
         </button>
      </div>
    </header>
  );
};