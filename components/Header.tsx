import React from 'react';
import { AppConfig } from '../types';

interface HeaderProps {
  config: AppConfig;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({ config, onOpenSettings }) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-sm backdrop-blur-md bg-white/90">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
           <div className="w-8 h-8 sm:w-9 sm:h-9 bg-indigo-600 text-white flex items-center justify-center rounded-lg font-bold font-mono text-lg sm:text-xl shadow-lg shadow-indigo-600/20">
             M
           </div>
           <div>
             <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 leading-tight">MyOps</h1>
             <div className="hidden xs:flex text-[10px] text-slate-500 uppercase tracking-widest font-semibold items-center gap-2">
                Task OS v2.0
                <span className={`w-2 h-2 rounded-full ${config.mode === 'LIVE' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 'bg-amber-400'}`}></span>
             </div>
           </div>
        </div>
        
        <button 
          onClick={onOpenSettings}
          className="text-slate-600 hover:text-slate-900 text-sm font-medium flex items-center gap-2 px-3 py-2 rounded-md hover:bg-slate-50 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
            <path d="M9.405 1.05c-.413-1.4-2.397-1.4-2.81 0l-.1.34a1.464 1.464 0 0 1-2.105.872l-.31-.17c-1.283-.698-2.686.705-1.987 1.987l.169.311c.446.82.023 1.841-.872 2.105l-.34.1c-1.4.413-1.4 2.397 0 2.81l.34.1a1.464 1.464 0 0 1 .872 2.105l.17.31c-.698 1.283.705 2.686 1.987 1.987l.311-.169a1.464 1.464 0 0 1 2.105.872l.1.34c.413 1.4 2.397 1.4 2.81 0l.1-.34a1.464 1.464 0 0 1 2.105-.872l.31.17c1.283.698 2.686-.705 1.987-1.987l-.169-.311a1.464 1.464 0 0 1 .872-2.105l.34-.1c1.4-.413 1.4-2.397 0-2.81l-.34-.1a1.464 1.464 0 0 1-.872-2.105l.17-.31c.698-1.283-.705-2.686-1.987-1.987l-.311.169a1.464 1.464 0 0 1-2.105-.872l-.1-.34zM8 10.93a2.929 2.929 0 1 1 0-5.86 2.929 2.929 0 0 1 0 5.858z"/>
          </svg>
          <span className="hidden sm:inline">Config</span>
        </button>
      </div>
    </header>
  );
};