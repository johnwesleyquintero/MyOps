
import React, { useMemo } from 'react';
import { TaskEntry } from '../types';
import { getProjectStyle, PRIORITY_DOTS } from '../constants';

interface GanttChartProps {
  entries: TaskEntry[];
  onEdit: (entry: TaskEntry) => void;
}

export const GanttChart: React.FC<GanttChartProps> = ({ entries, onEdit }) => {
  // Logic: 14 day rolling window.
  // Start: Today - 3 days.
  // End: Today + 11 days.
  
  const today = new Date();
  today.setHours(0,0,0,0);
  
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - 3);

  const dates = useMemo(() => {
    const arr = [];
    for (let i = 0; i < 14; i++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);
      arr.push(d);
    }
    return arr;
  }, []); // Static window based on today

  // Group by Project
  const groupedData = useMemo(() => {
    const groups: Record<string, TaskEntry[]> = {};
    entries.forEach(e => {
        // Only include items relevant to the window for cleaner view? 
        // Or show all projects, but only tasks in window.
        if (!groups[e.project]) groups[e.project] = [];
        groups[e.project].push(e);
    });
    return groups;
  }, [entries]);

  const projects = Object.keys(groupedData).sort();

  // Helper to check if task is on this date
  const getTaskForDate = (taskList: TaskEntry[], date: Date) => {
    const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
    return taskList.filter(t => t.date === dateStr);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col h-[calc(100vh-250px)]">
       {/* Timeline Header */}
       <div className="flex border-b border-slate-200 bg-slate-50">
          <div className="w-40 flex-shrink-0 p-4 border-r border-slate-200 font-bold text-xs text-slate-500 uppercase tracking-wider bg-slate-50 sticky left-0 z-10">
            Project
          </div>
          <div className="flex-1 flex overflow-hidden">
             {dates.map((d, i) => {
               const isToday = d.getTime() === today.getTime();
               const isWeekend = d.getDay() === 0 || d.getDay() === 6;
               return (
                 <div 
                    key={i} 
                    className={`flex-1 min-w-[60px] text-center py-3 border-r border-slate-100 flex flex-col justify-center ${isToday ? 'bg-indigo-50' : isWeekend ? 'bg-slate-50/50' : 'bg-white'}`}
                 >
                    <span className={`text-[10px] font-bold uppercase ${isToday ? 'text-indigo-600' : 'text-slate-400'}`}>
                      {d.toLocaleDateString('en-US', { weekday: 'short' })}
                    </span>
                    <span className={`text-xs font-mono font-bold ${isToday ? 'text-indigo-700' : 'text-slate-600'}`}>
                      {d.getDate()}
                    </span>
                 </div>
               );
             })}
          </div>
       </div>

       {/* Timeline Body */}
       <div className="flex-1 overflow-y-auto custom-scrollbar">
          {projects.length === 0 ? (
             <div className="flex items-center justify-center h-full text-slate-400 text-sm">No active projects in this view</div>
          ) : (
            projects.map(proj => (
              <div key={proj} className="flex border-b border-slate-100 min-h-[60px]">
                 {/* Y-Axis Label */}
                 <div className="w-40 flex-shrink-0 p-3 border-r border-slate-200 flex items-center bg-white sticky left-0 z-10">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold border ${getProjectStyle(proj)}`}>
                        {proj}
                    </span>
                 </div>

                 {/* Grid */}
                 <div className="flex-1 flex relative">
                    {/* Background Grid Lines */}
                    <div className="absolute inset-0 flex pointer-events-none">
                       {dates.map((d, i) => {
                          const isToday = d.getTime() === today.getTime();
                          const isWeekend = d.getDay() === 0 || d.getDay() === 6;
                          return (
                            <div 
                                key={i} 
                                className={`flex-1 min-w-[60px] border-r border-slate-50 ${isToday ? 'bg-indigo-50/20' : isWeekend ? 'bg-slate-50/30' : ''}`}
                            />
                          );
                       })}
                    </div>

                    {/* Task Markers */}
                    <div className="flex w-full z-0">
                        {dates.map((d, i) => {
                           const tasksOnDay = getTaskForDate(groupedData[proj], d);
                           return (
                             <div key={i} className="flex-1 min-w-[60px] p-1 flex flex-col gap-1 items-center justify-center">
                                {tasksOnDay.map(task => (
                                   <button
                                     key={task.id}
                                     onClick={() => onEdit(task)}
                                     className={`w-full text-left p-1 rounded border shadow-sm text-[9px] leading-tight truncate hover:z-20 hover:scale-105 transition-all ${
                                        task.status === 'Done' ? 'bg-emerald-50 border-emerald-200 text-emerald-700 opacity-60' : 
                                        task.priority === 'High' ? 'bg-rose-50 border-rose-200 text-rose-700' :
                                        'bg-white border-slate-200 text-slate-700'
                                     }`}
                                     title={task.description}
                                   >
                                     <div className={`w-1.5 h-1.5 rounded-full inline-block mr-1 ${PRIORITY_DOTS[task.priority]}`}></div>
                                     {task.description}
                                   </button>
                                ))}
                             </div>
                           )
                        })}
                    </div>
                 </div>
              </div>
            ))
          )}
       </div>
    </div>
  );
};
