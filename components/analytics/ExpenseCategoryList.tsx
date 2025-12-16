import React, { useMemo } from 'react';
import { LedgerEntry } from '../../types';
import { formatCurrency } from '../../constants';
import { calculateTopExpenses } from '../../utils/analyticsUtils';

interface ExpenseCategoryListProps {
  entries: LedgerEntry[];
  currency: string;
  locale: string;
}

export const ExpenseCategoryList: React.FC<ExpenseCategoryListProps> = ({ entries, currency, locale }) => {
  const categoryData = useMemo(() => calculateTopExpenses(entries), [entries]);

  return (
    <div className="bg-white border border-slate-200 rounded p-5 shadow-sm">
       <h3 className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-4">Top Expenses</h3>
       <div className="space-y-3">
           {categoryData.length === 0 ? (
               <div className="text-sm text-slate-400 italic">No expenses in this view</div>
           ) : categoryData.map((item) => (
               <div key={item.cat}>
                   <div className="flex justify-between text-sm mb-1">
                       <span className="font-medium text-slate-700">{item.cat}</span>
                       <span className="font-mono text-slate-600">{formatCurrency(item.val, currency, locale)}</span>
                   </div>
                   <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                       <div 
                          className="bg-slate-800 h-1.5 rounded-full" 
                          style={{ width: `${item.pct}%` }}
                       ></div>
                   </div>
               </div>
           ))}
       </div>
    </div>
  );
};