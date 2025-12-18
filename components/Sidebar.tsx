
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
        className={`w-full flex items-center ${isCollapsed ? 'justify-center px-2' : 'px-4'} py-3 text-sm font-medium rounded-lg transition-all duration-200 group ${
          isActive 
            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20' 
            : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'
        }`}
      >
        <span className={`${isActive ? 'text-white' : 'text-slate-500 group-hover:text-white'} flex-shrink-0`}>
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
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside 
        className={`fixed top-0 left-0 z-50 h-screen bg-slate-900 border-r border-slate-800 transition-all duration-300 ease-in-out lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'} ${widthClass}`}
      >
        
        <div className={`h-20 flex items-center border-b border-slate-800 transition-all duration-300 ${isCollapsed ? 'justify-center px-0' : 'px-6'}`}>
           <div className="flex-shrink-0 relative group">
             <svg 
               className="w-9 h-9 shadow-lg shadow-slate-900/50 group-hover:scale-105 transition-transform duration-300" 
               viewBox="0 0 512 512" 
               fill="none" 
               xmlns="http://www.w3.org/2000/svg"
             >
                <defs>
                  <linearGradient id="sysGradient" x1="0" y1="0" x2="512" y2="512" gradientUnits="userSpaceOnUse">
                    <stop offset="0" stopColor="#334155" />
                    <stop offset="1" stopColor="#0f172a" />
                  </linearGradient>
                  <linearGradient id="accentGradient" x1="0" y1="0" x2="512" y2="512" gradientUnits="userSpaceOnUse">
                    <stop offset="0" stopColor="#6366f1" />
                    <stop offset="1" stopColor="#4338ca" />
                  </linearGradient>
                </defs>
                <rect width="512" height="512" rx="128" fill="url(#sysGradient)" />
                <g transform="translate(106, 106)">
                  <rect x="0" y="0" width="80" height="300" rx="50" fill="#f1f5f9" />
                  <rect x="220" y="0" width="80" height="300" rx="50" fill="#f1f5f9" />
                  <path d="M40 180 L150 280 L260 180" stroke="url(#accentGradient)" strokeWidth="45" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="150" cy="50" r="40" fill="url(#accentGradient)" stroke="white" strokeOpacity="0.15" strokeWidth="6" />
                </g>
             </svg>
           </div>
           
           <div className={`ml-3 overflow-hidden transition-all duration-300 ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
             <h1 className="text-white font-bold tracking-tight leading-none text-lg">MyOps</h1>
             <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest whitespace-nowrap">v2.3</span>
                <span className={`w-1.5 h-1.5 rounded-full ${config.mode === 'LIVE' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-amber-400'}`}></span>
             </div>
           </div>
        </div>

        <nav className="p-3 space-y-2 mt-4">
          <div className={`px-4 mb-2 text-[10px] font-bold text-slate-600 uppercase tracking-widest transition-opacity duration-300 ${isCollapsed ? 'opacity-0 h-0 hidden' : 'opacity-100'}`}>
            Main Menu
          </div>
          
          <NavItem 
            page="DASHBOARD" 
            label="Dashboard" 
            icon={
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            } 
          />
          
          <NavItem 
            page="MISSIONS" 
            label="Mission Control" 
            icon={
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            } 
          />
        </nav>

        <div className="absolute bottom-0 left-0 w-full bg-slate-900 border-t border-slate-800">
           {!isCollapsed && (
              <div className="px-6 py-2">
                 <div className="flex items-center gap-2 mb-2">
                    <span className={`w-1.5 h-1.5 rounded-full ${config.geminiApiKey ? 'bg-indigo-400 animate-pulse' : 'bg-slate-600'}`}></span>
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">WesAI: {config.geminiApiKey ? 'Linked' : 'Offline'}</span>
                 </div>
              </div>
           )}

           <div className="hidden lg:flex justify-end p-2">
              <button 
                 onClick={toggleCollapse}
                 className="p-1.5 text-slate-500 hover:text-white rounded-md hover:bg-slate-800 transition-colors"
                 title={isCollapsed ? "Expand" : "Collapse"}
              >
                 {isCollapsed ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>
                 ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" /></svg>
                 )}
              </button>
           </div>
           
           <div className="p-3">
            <button 
                onClick={() => {
                onOpenSettings();
                setIsOpen(false);
                }}
                title={isCollapsed ? "System Config" : ''}
                className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'px-4'} py-3 text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all`}
            >
                <span className="flex-shrink-0">
                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                </span>
                <span className={`ml-3 whitespace-nowrap overflow-hidden transition-all duration-300 ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
                    System Config
                </span>
            </button>
           </div>
        </div>
      </aside>
    </>
  );
};
