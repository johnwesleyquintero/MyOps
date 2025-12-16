
import React, { useMemo } from 'react';
import { TaskEntry } from '../../types';
import { calculateTopExpenses } from '../../utils/analyticsUtils';

interface ExpenseCategoryListProps {
  entries: TaskEntry[];
  currency?: string;
  locale?: string;
}

export const ExpenseCategoryList: React.FC<ExpenseCategoryListProps> = ({ entries }) => {
  // Using calculateTopExpenses to get top projects by volume
  const categoryData = useMemo(() => calculateTopExpenses(entries), [entries]);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm transition-colors duration-300">
       <h3 className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider mb-4">Top Projects</h3>
       <div className="space-y-3">
           {categoryData.length === 0 ? (
               <div className="text-sm text-slate-400 dark:text-slate-500 italic">No activity in this view</div>
           ) : categoryData.map((item) => (
               <div key={item.cat}>
                   <div className="flex justify-between text-sm mb-1">
                       <span className="font-medium text-slate-700 dark:text-slate-200">{item.cat}</span>
                       <span className="font-mono text-slate-600 dark:text-slate-400">{item.val} tasks</span>
                   </div>
                   <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                       <div 
                          className="bg-slate-800 dark:bg-indigo-500 h-1.5 rounded-full transition-all duration-500" 
                          style={{ width: `${item.pct}%` }}
                       ></div>
                   </div>
               </div>
           ))}
       </div>
    </div>
  );
};
