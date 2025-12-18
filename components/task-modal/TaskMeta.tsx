
import React from 'react';
import { TaskEntry, PriorityLevel, StatusLevel } from '../../types';
import { DEFAULT_PROJECTS, PRIORITIES, STATUSES, RECURRENCE_OPTIONS } from '../../constants';
import { PRIORITY_THEME, STATUS_THEME } from '../../constants/theme';

interface TaskMetaProps {
  formData: TaskEntry;
  setFormData: (data: TaskEntry) => void;
  isCustomProject: boolean;
  setIsCustomProject: (val: boolean) => void;
  currentRecurrence: string;
  onRecurrenceChange: (tag: string) => void;
}

export const TaskMeta: React.FC<TaskMetaProps> = ({
  formData,
  setFormData,
  isCustomProject,
  setIsCustomProject,
  currentRecurrence,
  onRecurrenceChange
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Due Date & Recurrence */}
      <div className="space-y-4">
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">Target Date</label>
            <input
              type="date"
              required
              className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 transition-all text-slate-700 dark:text-slate-200 shadow-sm"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            />
          </div>
          <div className="w-1/3">
            <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">Cycle</label>
            <select
              value={currentRecurrence}
              onChange={(e) => onRecurrenceChange(e.target.value)}
              className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-2 text-sm focus:outline-none focus:border-indigo-500 transition-all text-slate-700 dark:text-slate-200 shadow-sm"
            >
              {RECURRENCE_OPTIONS.map(opt => (
                <option key={opt.label} value={opt.tag}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2 flex justify-between">
            Project Mapping
            <button type="button" onClick={() => setIsCustomProject(!isCustomProject)} className="text-[9px] underline text-indigo-500 hover:text-indigo-400">
              {isCustomProject ? 'SELECT FROM LIST' : 'CUSTOM PROJECT'}
            </button>
          </label>
          {isCustomProject ? (
            <input
              type="text"
              required
              placeholder="Sovereign Project Name..."
              className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 transition-all text-slate-700 dark:text-slate-200 shadow-sm"
              value={formData.project}
              onChange={(e) => setFormData({ ...formData, project: e.target.value })}
            />
          ) : (
            <select
              className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 transition-all text-slate-700 dark:text-slate-200 shadow-sm"
              value={formData.project}
              onChange={(e) => setFormData({ ...formData, project: e.target.value })}
            >
              {DEFAULT_PROJECTS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          )}
        </div>
      </div>

      {/* Priority & Status */}
      <div className="space-y-4">
        <div>
          <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">Priority Level</label>
          <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl gap-1 border border-slate-200 dark:border-slate-800">
            {PRIORITIES.map(p => (
              <button
                key={p}
                type="button"
                onClick={() => setFormData({ ...formData, priority: p })}
                className={`flex-1 py-2 text-[10px] font-bold rounded-lg transition-all ${formData.priority === p ? 'bg-white dark:bg-slate-700 shadow-sm ' + PRIORITY_THEME[p].text : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">Operational Status</label>
          <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl gap-1 border border-slate-200 dark:border-slate-800">
            {STATUSES.map(s => (
              <button
                key={s}
                type="button"
                onClick={() => setFormData({ ...formData, status: s as StatusLevel })}
                className={`flex-1 py-2 text-[10px] font-bold rounded-lg transition-all ${formData.status === s ? 'bg-white dark:bg-slate-700 shadow-sm ' + STATUS_THEME[s as StatusLevel].text : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
