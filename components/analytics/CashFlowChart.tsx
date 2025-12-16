
import React, { useMemo } from 'react';
import { TaskEntry } from '../../types';
import { calculateDailyTrend, generateSVGPoints, generateAreaPath } from '../../utils/analyticsUtils';

interface CashFlowChartProps {
  entries: TaskEntry[];
}

export const CashFlowChart: React.FC<CashFlowChartProps> = ({ entries }) => {
  // SVG Geometry Constants
  const width = 600;
  const height = 150;
  const padding = 20;

  // Data Prep
  const chartData = useMemo(() => calculateDailyTrend(entries), [entries]);
  const points = useMemo(() => generateSVGPoints(chartData, width, height, padding), [chartData]);
  const areaPath = useMemo(() => generateAreaPath(points, width, height, padding), [points]);

  return (
    <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm flex flex-col justify-between transition-colors duration-300">
       <div className="flex justify-between items-center mb-4">
           <h3 className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">Task Volume Trend</h3>
           <span className="text-xs text-slate-400 dark:text-slate-500 font-mono">Daily Activity</span>
       </div>
       
       <div className="relative w-full h-[150px] overflow-hidden">
           <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible preserve-3d">
               <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.2"/>
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0"/>
                  </linearGradient>
               </defs>
               
               <path d={areaPath} fill="url(#chartGradient)" />
               
               <polyline 
                  fill="none" 
                  stroke="#10b981" 
                  strokeWidth="2" 
                  points={points} 
                  strokeLinejoin="round" 
                  strokeLinecap="round"
                  className="drop-shadow-sm"
               />
           </svg>
       </div>
       <div className="flex justify-between mt-2 text-[10px] text-slate-400 dark:text-slate-500 font-mono">
          <span>{chartData[0]?.date || '-'}</span>
          <span>{chartData[chartData.length-1]?.date || '-'}</span>
       </div>
    </div>
  );
};
