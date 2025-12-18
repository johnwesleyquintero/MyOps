
import React from 'react';
import { Page, AppConfig } from '../types';
import { Icon, iconProps } from './Icons';

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
        className={`w-full flex items-center ${isCollapsed ? 'justify-center px-0' : 'px-4'} py-3 text-sm font-bold rounded-xl transition-all duration-300 ease-out group active:scale-[0.97] ${
          isActive 
            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' 
            : 'text-slate-500 hover:text-slate-200 hover:bg-slate-800/80'
        }`}
      >
        <span className={`${isActive ? 'text-white' : 'text-slate-500 group-hover:text-indigo-400'} flex-shrink-0 transition-colors duration-300`}>
          {icon}
        </span>
        <span className={`ml-3 whitespace-nowrap overflow-hidden transition-all duration-500 ${isCollapsed ? 'max-w-0 opacity-0' : 'max-w-xs opacity-100'}`}>
          {label}
        </span>
        {isActive && !isCollapsed && (
          <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white animate-pulse"></div>
        )}
      </button>
    );
  };

  const widthClass = isOpen ? 'w-64' : (isCollapsed ? 'w-20' : 'w-64');

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden animate-fade-in"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside 
        className={`fixed top-0 left-0 z-50 h-screen bg-slate-950 border-r border-slate-800/50 transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1) lg:translate-x-0 ${isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'} ${widthClass}`}
      >
        
        <div className={`h-24 flex items-center border-b border-slate-800/30 transition-all duration-500 ${isCollapsed ? 'justify-center px-0' : 'px-6'}`}>
           <div className="flex-shrink-0 relative group cursor-pointer" onClick={() => setActivePage('DASHBOARD')}>
             <svg 
               className="w-10 h-10 shadow-2xl shadow-indigo-600/20 group-hover:scale-110 group-active:scale-95 transition-all duration-500" 
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
           
           <div className={`ml-4 overflow-hidden transition-all duration-500 ${isCollapsed ? 'max-w-0 opacity-0' : 'max-w-xs opacity-100'}`}>
             <h1 className="text-white font-black tracking-tighter text-xl leading-none">MYOPS</h1>
             <div className="flex items-center gap-2 mt-1.5">
                <span className="text-[9px] text-slate-500 font-mono font-bold uppercase tracking-[0.2em] whitespace-nowrap">v2.3</span>
                <span className={`w-1.5 h-1.5 rounded-full ${config.mode === 'LIVE' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.7)]' : 'bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.5)]'}`}></span>
             </div>
           </div>
        </div>

        <nav className="p-3 space-y-2 mt-6">
          <div className={`px-4 mb-3 text-[9px] font-bold text-slate-600 uppercase tracking-[0.3em] transition-all duration-500 ${isCollapsed ? 'opacity-0 h-0 hidden' : 'opacity-100'}`}>
            Operational
          </div>
          
          <NavItem 
            page="DASHBOARD" 
            label="Command Center" 
            icon={<Icon.Dashboard {...iconProps(22)} />} 
          />
          
          <NavItem 
            page="MISSIONS" 
            label="Mission Control" 
            icon={<Icon.Missions {...iconProps(22)} />} 
          />
        </nav>

        <div className="absolute bottom-0 left-0 w-full bg-slate-950/50 backdrop-blur-md border-t border-slate-800/30">
           {!isCollapsed && (
              <div className="px-7 py-3">
                 <div className="flex items-center gap-2.5">
                    <div className={`w-2 h-2 rounded-full ${config.geminiApiKey ? 'bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.5)] animate-pulse' : 'bg-slate-700'}`}></div>
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">WESAI: {config.geminiApiKey ? 'LINKED' : 'OFFLINE'}</span>
                 </div>
              </div>
           )}

           <div className="hidden lg:flex justify-end px-3 py-1">
              <button 
                 onClick={toggleCollapse}
                 className="p-2 text-slate-600 hover:text-indigo-400 rounded-lg hover:bg-slate-800/50 transition-all duration-300 active:scale-90"
                 title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
              >
                 {isCollapsed ? (
                    <Icon.Next {...iconProps(16)} />
                 ) : (
                    <Icon.Prev {...iconProps(16)} />
                 )}
              </button>
           </div>
           
           <div className="p-3 pb-6">
            <button 
                onClick={() => {
                  onOpenSettings();
                  setIsOpen(false);
                }}
                title={isCollapsed ? "System Configuration" : ''}
                className={`w-full flex items-center ${isCollapsed ? 'justify-center px-0' : 'px-4'} py-3 text-sm font-bold text-slate-500 hover:text-white hover:bg-slate-800/80 rounded-xl transition-all duration-300 group`}
            >
                <span className="flex-shrink-0 group-hover:rotate-45 transition-transform duration-500">
                    <Icon.Settings {...iconProps(22)} />
                </span>
                <span className={`ml-4 whitespace-nowrap overflow-hidden transition-all duration-500 ${isCollapsed ? 'max-w-0 opacity-0' : 'max-w-xs opacity-100'}`}>
                    Configuration
                </span>
            </button>
           </div>
        </div>
      </aside>
    </>
  );
};
