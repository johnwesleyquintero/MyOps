import React, { useState, useEffect } from 'react';
import { TaskEntry, PriorityLevel, StatusLevel } from '../types';
import { DEFAULT_PROJECTS, PRIORITIES, STATUSES, PRIORITY_COLORS } from '../constants';

interface TransactionFormProps {
  onSubmit: (entry: TaskEntry) => Promise<void>;
  isSubmitting: boolean;
  initialData?: TaskEntry | null;
  onCancelEdit?: () => void;
}

export const TransactionForm: React.FC<TransactionFormProps> = ({ 
  onSubmit, 
  isSubmitting, 
  initialData, 
  onCancelEdit 
}) => {
  
  // Helper for local date string YYYY-MM-DD
  const getLocalDate = (offsetDays: number = 0) => {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  };

  const [formData, setFormData] = useState<TaskEntry>({
    id: '',
    date: getLocalDate(),
    description: '',
    project: DEFAULT_PROJECTS[0],
    priority: 'Medium',
    status: 'Backlog'
  });
  
  const [isCustomProject, setIsCustomProject] = useState<boolean>(false);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
      const isStandard = DEFAULT_PROJECTS.includes(initialData.project);
      setIsCustomProject(!isStandard);
    } else {
      resetForm();
    }
  }, [initialData]);

  const resetForm = () => {
    setFormData({
      id: '',
      date: getLocalDate(),
      description: '',
      project: DEFAULT_PROJECTS[0],
      priority: 'Medium',
      status: 'Backlog'
    });
    setIsCustomProject(false);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!formData.description || !formData.project) return;
    await onSubmit(formData);
    if (!initialData) resetForm();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      handleSubmit();
    }
  };

  const setDateOffset = (days: number) => {
    setFormData(prev => ({ ...prev, date: getLocalDate(days) }));
  };

  const toggleProjectMode = () => {
    setIsCustomProject(!isCustomProject);
    if (isCustomProject) {
       setFormData(prev => ({ ...prev, project: DEFAULT_PROJECTS[0] }));
    } else {
       setFormData(prev => ({ ...prev, project: '' }));
    }
  };

  const isEditing = !!initialData;

  // Theme Logic
  const theme = {
    bg: 'bg-white',
    border: isEditing ? 'border-amber-200' : 'border-slate-200',
    btn: isEditing ? 'bg-amber-600 hover:bg-amber-700' : 'bg-slate-900 hover:bg-slate-800',
    ring: 'focus:ring-slate-200',
    inputBorder: 'focus:border-slate-500'
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className={`relative border rounded-xl p-5 mb-6 transition-all duration-300 ${theme.bg} ${theme.border} shadow-sm`}
    >
      {isEditing && (
        <div className="mb-4 text-xs font-bold text-amber-700 uppercase tracking-wide flex justify-between items-center border-b border-amber-200 pb-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
            <span>Editing Task</span>
          </div>
          <button type="button" onClick={onCancelEdit} className="text-amber-600 hover:text-amber-900 text-[10px] bg-white px-2 py-1 rounded border border-amber-200">Cancel</button>
        </div>
      )}

      <div className="flex flex-col gap-5">
        
        {/* Row 1: Description & Date */}
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-[3]">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex justify-between">
              Task Description
              <span className="hidden sm:inline text-[9px] text-slate-300 font-normal normal-case">⌘+Enter to save</span>
            </label>
            <input
              type="text"
              required
              placeholder="What needs to be done?"
              className={`w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-4 transition-all shadow-sm text-slate-700 placeholder-slate-400 ${theme.inputBorder} ${theme.ring}`}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              onKeyDown={handleKeyDown}
              autoFocus={!isEditing}
            />
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Due Date</label>
              <div className="flex gap-1">
                <button type="button" onClick={() => setDateOffset(0)} className="px-1.5 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-[9px] text-slate-500 font-medium transition-colors">Today</button>
                <button type="button" onClick={() => setDateOffset(1)} className="px-1.5 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-[9px] text-slate-500 font-medium transition-colors">+1d</button>
                <button type="button" onClick={() => setDateOffset(7)} className="px-1.5 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-[9px] text-slate-500 font-medium transition-colors">+1w</button>
              </div>
            </div>
            <input
              type="date"
              required
              className={`w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-4 transition-all shadow-sm text-slate-700 ${theme.inputBorder} ${theme.ring}`}
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            />
          </div>
        </div>

        {/* Row 2: Project, Priority, Status, Button */}
        <div className="flex flex-col lg:flex-row gap-4 items-end">
          
          {/* Project */}
          <div className="flex-1 w-full">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex justify-between">
                Project
                <button type="button" onClick={toggleProjectMode} className="text-[9px] underline text-slate-400 hover:text-slate-600">
                    {isCustomProject ? 'List' : 'Custom'}
                </button>
            </label>
            {isCustomProject ? (
                 <input
                     type="text"
                     required
                     placeholder="Type project..."
                     className={`w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-4 transition-all shadow-sm text-slate-700 ${theme.inputBorder} ${theme.ring}`}
                     value={formData.project}
                     onChange={(e) => setFormData({ ...formData, project: e.target.value })}
                 />
            ) : (
                <div className="relative">
                    <select
                        className={`w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-4 transition-all shadow-sm appearance-none text-slate-700 ${theme.inputBorder} ${theme.ring}`}
                        value={formData.project}
                        onChange={(e) => setFormData({ ...formData, project: e.target.value })}
                    >
                    {DEFAULT_PROJECTS.map(c => (
                        <option key={c} value={c}>{c}</option>
                    ))}
                    </select>
                </div>
            )}
          </div>

          {/* Priority */}
          <div className="flex-1 w-full">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Priority</label>
            <div className="flex bg-slate-100 p-1 rounded-lg">
              {PRIORITIES.map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setFormData({ ...formData, priority: p })}
                  className={`flex-1 py-1.5 text-[10px] font-bold rounded-md transition-all ${formData.priority === p ? 'bg-white shadow-sm ' + PRIORITY_COLORS[p].split(' ')[1] : 'text-slate-400 hover:text-slate-600'}`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Status */}
          <div className="flex-1 w-full">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Status</label>
            <select
                className={`w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-4 transition-all shadow-sm text-slate-700 ${theme.inputBorder} ${theme.ring}`}
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as StatusLevel })}
            >
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full lg:w-auto h-[38px] text-white font-bold tracking-wide uppercase px-6 rounded-lg text-xs disabled:opacity-50 transition-all shadow-md hover:shadow-lg active:scale-95 ${theme.btn}`}
          >
            {isSubmitting ? '...' : isEditing ? 'Update' : 'Add Task'}
          </button>
        </div>
      </div>
    </form>
  );
};