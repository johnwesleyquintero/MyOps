
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
       <SummaryCards metrics={metrics} />

       {/* Analytics Grid */}
       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <CashFlowChart entries={entries} />
          <ExpenseCategoryList entries={entries} />
       </div>
       
       <div>
          <div className="flex justify-between items-center mb-4 mt-2">
             <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Immediate Focus</h3>
             <button 
               onClick={() => onNavigate('MISSIONS')}
               className="text-indigo-600 dark:text-indigo-400 text-xs font-bold hover:underline"
             >
               View All Missions &rarr;
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
                <div className="p-8 text-center text-slate-400 text-sm">
                   No immediate tasks. You are clear.
                </div>
             )}
          </div>
       </div>
    </div>
  );
};
