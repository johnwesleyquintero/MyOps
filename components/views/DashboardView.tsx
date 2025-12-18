
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
    <div className="animate-fade-in space-y-6">
       <div className="flex justify-between items-end mb-2">
          <div>
             <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Command Deck</h2>
             <p className="text-sm text-slate-500 dark:text-slate-400">Tactical overview of active missions.</p>
          </div>
          <div className="bg-white dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-[10px] font-mono font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 shadow-sm">
             Systems Nominal
          </div>
       </div>

       <SummaryCards metrics={metrics} />

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <CashFlowChart entries={entries} />
          <ExpenseCategoryList entries={entries} />
       </div>
       
       <div className="space-y-4">
          <div className="flex justify-between items-center mt-2">
             <div className="flex items-center gap-2">
                <div className="w-2 h-4 bg-indigo-600 rounded-full"></div>
                <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Mission Briefing</h3>
             </div>
             <button 
               onClick={() => onNavigate('MISSIONS')}
               className="text-indigo-600 dark:text-indigo-400 text-xs font-bold hover:underline flex items-center gap-1 group"
             >
               Mission Control 
               <svg className="w-3 h-3 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
             </button>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
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
                <div className="p-12 text-center">
                   <div className="inline-flex p-4 bg-slate-50 dark:bg-slate-800 rounded-full mb-4">
                      <svg className="w-8 h-8 text-slate-300 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                   </div>
                   <h4 className="text-slate-900 dark:text-slate-100 font-bold">Protocol Complete</h4>
                   <p className="text-slate-500 dark:text-slate-400 text-sm">No immediate focus required.</p>
                </div>
             )}
          </div>
       </div>
    </div>
  );
};
