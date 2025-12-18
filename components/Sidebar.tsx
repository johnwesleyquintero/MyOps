
import React from 'react';
import { Page, AppConfig } from '../types';

interface SidebarProps {
  activePage: Page;
  setActivePage: (page: Page) => void;
  onOpenSettings: () => void;
  config: AppConfig;
  isOpen: boolean; // Mobile open state
  setIsOpen: (isOpen: boolean) => void;
  isCollapsed: boolean; // Desktop collapsed state
  toggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activePage, 
  setActivePage, 
  onOpenSettings,
  config,
  isOpen,
  setIsOpen,
  isCollapsed,
  toggleCollapse
}) => {
  
  const NavItem = ({ page, label, icon }: { page: Page; label: string; icon: React.ReactNode }) => {
    const isActive = activePage === page;
    return (
      <button
        onClick={() => {
          setActivePage(page);
          setIsOpen(false);
        }}
        title={isCollapsed ? label : ''}
        className={`w-full flex items-center ${isCollapsed ? 'justify-center px-2' : 'px-4'} py-3 text-sm font-medium rounded-xl transition-all duration-200 group ${
          isActive 
            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/30 ring-1 ring-white/10' 
            : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
        }`}
      >
        <span className={`${isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'} flex-shrink-0`}>
          {icon}
        </span>
        <span className={`ml-3 whitespace-nowrap overflow-hidden transition-all duration-300 ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
          {label}
        </span>
      </button>
    );
  };

  const widthClass = isOpen ? 'w-64' : (isCollapsed ? 'w-20' : 'w-64');

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={`fixed top-0 left-0 z-50 h-screen bg-slate-950 border-r border-slate-900 transition-all duration-300 ease-in-out lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'} ${widthClass}`}>
        
        <div className={`h-20 flex items-center border-b border-slate-900 transition-all duration-300 ${isCollapsed ? 'justify-center' : 'px-6'}`}>
           <div className="flex-shrink-0 relative group">
             <svg className="w-9 h-9 shadow-lg shadow-indigo-950/20 group-hover:scale-110 transition-transform duration-500" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="512" height="512" rx="128" fill="#1e293b" />
                <path d="M106 106 L256 406 L406 106" stroke="#6366f1" strokeWidth="45" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="256" cy="156" r="40" fill="white" />
             </svg>
           </div>
           
           <div className={`ml-3 overflow-hidden transition-all duration-300 ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
             <h1 className="text-white font-bold tracking-tighter leading-none text-xl">WesLedger</h1>
             <div className="flex items-center gap-2 mt-1">
                <span className="text-[9px] text-slate-500 font-mono uppercase tracking-[0.2em] whitespace-nowrap">v2.3 ALPHA</span>
             </div>
           </div>
        </div>

        <nav className="p-3 space-y-1.5 mt-4">
          <NavItem page="DASHBOARD" label="Command Deck" icon={<svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>} />
          <NavItem page="MISSIONS" label="Mission Control" icon={<svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>} />
        </nav>

        <div className="absolute bottom-0 left-0 w-full bg-slate-950 border-t border-slate-900/50">
           <div className="hidden lg:flex justify-end p-2">
              <button onClick={toggleCollapse} className="p-1.5 text-slate-600 hover:text-white rounded-md hover:bg-slate-900 transition-colors">
                 {isCollapsed ? <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg> : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" /></svg>}
              </button>
           </div>
           
           <div className="p-3">
            <button onClick={() => { onOpenSettings(); setIsOpen(false); }} className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'px-4'} py-3 text-sm font-medium text-slate-500 hover:text-white hover:bg-slate-900 rounded-xl transition-all`}>
                <span className="flex-shrink-0"><svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg></span>
                <span className={`ml-3 whitespace-nowrap overflow-hidden transition-all duration-300 ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>System Protocol</span>
            </button>
           </div>
        </div>
      </aside>
    </>
  );
};
