import React from 'react';
import { MetricSummary } from '../types';

interface SummaryCardsProps {
  metrics: MetricSummary;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ metrics }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {/* Backlog */}
      <div className="bg-gradient-to-br from-white to-slate-50 border border-slate-200 rounded-xl p-6 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
        <div className="flex justify-between items-start mb-3">
           <h3 className="text-slate-500 text-[11px] font-bold uppercase tracking-widest">Backlog</h3>
           <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
             <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
               <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
             </svg>
           </div>
        </div>
        <div className="text-3xl font-mono font-bold tracking-tight text-slate-700">
          {metrics.backlog}
        </div>
      </div>
      
      {/* Active / In Progress */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
        <div className="flex justify-between items-start mb-3">
           <h3 className="text-indigo-600/70 text-[11px] font-bold uppercase tracking-widest">Active</h3>
           <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600 group-hover:bg-indigo-100 transition-colors">
             <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
               <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
             </svg>
           </div>
        </div>
        <div className="text-2xl font-mono font-bold text-indigo-600 tracking-tight">
          {metrics.inProgress}
        </div>
      </div>

      {/* Done */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
        <div className="flex justify-between items-start mb-3">
           <h3 className="text-emerald-600/70 text-[11px] font-bold uppercase tracking-widest">Completed</h3>
           <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600 group-hover:bg-emerald-100 transition-colors">
             <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
               <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
             </svg>
           </div>
        </div>
        <div className="text-2xl font-mono font-bold text-emerald-600 tracking-tight">
          {metrics.done}
        </div>
      </div>
    </div>
  );
};