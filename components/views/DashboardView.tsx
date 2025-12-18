
import React, { useMemo } from 'react';
import { TaskEntry, MetricSummary, Page } from '../../types';
import { SummaryCards } from '../SummaryCards';
import { CashFlowChart } from '../analytics/CashFlowChart';
import { ExpenseCategoryList } from '../analytics/ExpenseCategoryList';
import { TaskTable } from '../TaskTable';

interface DashboardViewProps {
  entries: TaskEntry[];
  metrics: MetricSummary;
  isLoading: boolean;
  onEdit: (entry: TaskEntry) => void;
  onDelete: (entry: TaskEntry) => void;
  onStatusUpdate: (entry: TaskEntry) => void;
  onDescriptionUpdate: (entry: TaskEntry, desc: string) => void;
  onFocus: (entry: TaskEntry) => void;
  onDuplicate: (entry: TaskEntry) => void;
  onNavigate: (page: Page) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  entries,
  metrics,
  isLoading,
  onEdit,
  onDelete,
  onStatusUpdate,
  onDescriptionUpdate,
  onFocus,
  onDuplicate,
  onNavigate
}) => {
  const dashboardTasks = useMemo(() => {
    return entries
      .filter(e => e.status !== 'Done')
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 5);
  }, [entries]);

  return (
    <div className="animate-fade-in space-y-8 max-w-7xl mx-auto">
       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
             <div className="text-[10px] font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-[0.2em] mb-1">Operational Overview</div>
             <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
               Command Center
               <span className="text-xs font-mono font-medium text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-800 px-2 py-0.5 rounded uppercase">Sector 7</span>
             </h2>
          </div>
          <div className="flex items-center gap-3">
             <div className="flex flex-col items-end">
                <span className="text-[10px] font-bold text-slate-500 uppercase">System Status</span>
                <span className="text-xs font-bold text-emerald-500 flex items-center gap-1.5">
                   <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                   SYNCED
                </span>
             </div>
          </div>
       </div>

       <SummaryCards metrics={metrics} />

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <CashFlowChart entries={entries} />
          <div className="flex flex-col gap-6">
             <div className="bg-indigo-600 dark:bg-indigo-900/40 rounded-2xl p-6 text-white shadow-lg shadow-indigo-600/20 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                   <svg width="120" height="120" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
                </div>
                <h4 className="text-xs font-bold uppercase tracking-widest opacity-80 mb-2">Priority Missions</h4>
                <div className="text-3xl font-mono font-bold mb-4">{entries.filter(e => e.priority === 'High' && e.status !== 'Done').length}</div>
                <button 
                   onClick={() => onNavigate('MISSIONS')}
                   className="w-full py-2 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-bold uppercase tracking-wider border border-white/20 backdrop-blur-sm transition-all"
                >
                   Review High Priority
                </button>
             </div>
             <ExpenseCategoryList entries={entries} />
          </div>
       </div>
       
       <div className="space-y-4">
          <div className="flex justify-between items-center mt-4">
             <div className="flex items-center gap-2">
                <div className="w-1 h-5 bg-indigo-600 dark:bg-indigo-500 rounded-full"></div>
                <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-[0.2em]">Active Objectives</h3>
             </div>
             <button 
               onClick={() => onNavigate('MISSIONS')}
               className="group text-indigo-600 dark:text-indigo-400 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 hover:translate-x-1 transition-all"
             >
               Access Tactical Board
               <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
             </button>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden">
             <TaskTable 
                entries={dashboardTasks}
                isLoading={isLoading}
                onEdit={onEdit}
                onDelete={onDelete}
                onStatusUpdate={onStatusUpdate}
                onDescriptionUpdate={onDescriptionUpdate}
                onFocus={onFocus}
                onDuplicate={onDuplicate}
                allEntries={entries} 
             />
             {dashboardTasks.length === 0 && !isLoading && (
                <div className="p-16 text-center">
                   <div className="inline-flex p-6 bg-slate-50 dark:bg-slate-800 rounded-full mb-6 border border-slate-100 dark:border-slate-700">
                      <svg className="w-10 h-10 text-slate-300 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                   </div>
                   <h4 className="text-slate-900 dark:text-slate-100 font-bold text-lg">Mission Stack Depleted</h4>
                   <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm mx-auto mt-2">All immediate objectives have been successfully neutralized. Operational tempo normalized.</p>
                </div>
             )}
          </div>
       </div>
    </div>
  );
};
