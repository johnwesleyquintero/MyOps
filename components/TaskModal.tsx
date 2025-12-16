
import React, { useState, useEffect, useMemo } from 'react';
import { TaskEntry, PriorityLevel, StatusLevel } from '../types';
import { DEFAULT_PROJECTS, PRIORITIES, STATUSES, PRIORITY_COLORS, STATUS_COLORS } from '../constants';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (entry: TaskEntry) => Promise<void>;
  onDelete: (entry: TaskEntry) => Promise<void>;
  initialData?: TaskEntry | null;
  isSubmitting: boolean;
  entries: TaskEntry[]; // Required for dependencies
}

export const TaskModal: React.FC<TaskModalProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  onDelete,
  initialData, 
  isSubmitting,
  entries 
}) => {
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
    status: 'Backlog',
    dependencies: []
  });
  
  const [isCustomProject, setIsCustomProject] = useState<boolean>(false);
  const [showDeps, setShowDeps] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({ ...initialData, dependencies: initialData.dependencies || [] });
        const isStandard = DEFAULT_PROJECTS.includes(initialData.project);
        setIsCustomProject(!isStandard);
        if (initialData.dependencies && initialData.dependencies.length > 0) {
            setShowDeps(true);
        }
      } else {
        resetForm();
      }
    }
  }, [isOpen, initialData]);

  const resetForm = () => {
    setFormData({
      id: '',
      date: getLocalDate(),
      description: '',
      project: DEFAULT_PROJECTS[0],
      priority: 'Medium',
      status: 'Backlog',
      dependencies: []
    });
    setIsCustomProject(false);
    setShowDeps(false);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!formData.description || !formData.project) return;
    await onSubmit(formData);
    onClose();
  };

  const handleDelete = async () => {
    if (initialData && window.confirm("Are you sure you want to delete this task?")) {
      await onDelete(initialData);
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      handleSubmit();
    }
    if (e.key === 'Escape') {
      onClose();
    }
  };

  const toggleDependency = (id: string) => {
    setFormData(prev => {
        const current = prev.dependencies || [];
        if (current.includes(id)) {
            return { ...prev, dependencies: current.filter(d => d !== id) };
        } else {
            return { ...prev, dependencies: [...current, id] };
        }
    });
  };

  // Potential dependencies: All tasks except self
  const potentialDeps = useMemo(() => {
    return entries.filter(e => e.id !== formData.id && e.status !== 'Done');
  }, [entries, formData.id]);

  if (!isOpen) return null;

  const isEditing = !!initialData;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity">
      <div 
        className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] animate-scale-in"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-3">
             <div className={`w-2 h-8 rounded-full ${isEditing ? 'bg-amber-500' : 'bg-indigo-600'}`}></div>
             <h2 className="text-lg font-bold text-slate-800">
               {isEditing ? 'Edit Task' : 'New Task'}
             </h2>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
          <div className="flex flex-col gap-6">
            
            {/* Description (Main Input) */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex justify-between">
                Description
                <span className="text-[10px] font-normal text-slate-400">⌘+Enter to save</span>
              </label>
              <textarea
                required
                rows={3}
                placeholder="What needs to be done?"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-slate-700 placeholder-slate-400 font-sans resize-none"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                onKeyDown={handleKeyDown}
                autoFocus
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {/* Date */}
               <div>
                 <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Due Date</label>
                 <input
                    type="date"
                    required
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-700"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  />
               </div>

               {/* Project */}
               <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex justify-between">
                      Project
                      <button type="button" onClick={() => setIsCustomProject(!isCustomProject)} className="text-[10px] underline text-indigo-500 hover:text-indigo-700">
                          {isCustomProject ? 'Select List' : 'Custom Type'}
                      </button>
                  </label>
                  {isCustomProject ? (
                      <input
                          type="text"
                          required
                          placeholder="Project Name..."
                          className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-700"
                          value={formData.project}
                          onChange={(e) => setFormData({ ...formData, project: e.target.value })}
                      />
                  ) : (
                      <select
                          className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-700"
                          value={formData.project}
                          onChange={(e) => setFormData({ ...formData, project: e.target.value })}
                      >
                        {DEFAULT_PROJECTS.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                  )}
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Priority */}
                <div>
                   <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Priority</label>
                   <div className="flex bg-slate-100 p-1 rounded-lg gap-1">
                      {PRIORITIES.map(p => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setFormData({ ...formData, priority: p })}
                          className={`flex-1 py-1.5 text-[10px] font-bold rounded-md transition-all ${formData.priority === p ? 'bg-white shadow-sm ring-1 ring-black/5 ' + PRIORITY_COLORS[p].split(' ')[1] : 'text-slate-400 hover:text-slate-600 hover:bg-slate-200/50'}`}
                        >
                          {p}
                        </button>
                      ))}
                   </div>
                </div>

                {/* Status */}
                <div>
                   <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Status</label>
                   <div className="flex bg-slate-100 p-1 rounded-lg gap-1">
                      {STATUSES.map(s => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setFormData({ ...formData, status: s })}
                          className={`flex-1 py-1.5 text-[10px] font-bold rounded-md transition-all ${formData.status === s ? 'bg-white shadow-sm ring-1 ring-black/5 ' + STATUS_COLORS[s].split(' ')[1] : 'text-slate-400 hover:text-slate-600 hover:bg-slate-200/50'}`}
                        >
                          {s}
                        </button>
                      ))}
                   </div>
                </div>
            </div>

            {/* Dependency Section */}
            <div className="border-t border-slate-100 pt-4">
                <button 
                    type="button" 
                    onClick={() => setShowDeps(!showDeps)}
                    className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider hover:text-indigo-600 mb-3"
                >
                    <svg className={`w-4 h-4 transition-transform ${showDeps ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                    Blocking Tasks ({formData.dependencies?.length || 0})
                </button>
                
                {showDeps && (
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-2 max-h-40 overflow-y-auto custom-scrollbar">
                        {potentialDeps.length === 0 ? (
                            <div className="text-xs text-slate-400 p-2 italic">No other active tasks available to link.</div>
                        ) : potentialDeps.map(task => {
                             const isSelected = formData.dependencies?.includes(task.id);
                             return (
                                <div 
                                    key={task.id} 
                                    onClick={() => toggleDependency(task.id)}
                                    className={`flex items-start gap-2 p-2 rounded cursor-pointer transition-colors ${isSelected ? 'bg-white shadow-sm border border-indigo-200' : 'hover:bg-slate-100 border border-transparent'}`}
                                >
                                    <div className={`mt-0.5 w-4 h-4 border rounded flex items-center justify-center transition-colors ${isSelected ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300 bg-white'}`}>
                                        {isSelected && <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>}
                                    </div>
                                    <div className="flex-1">
                                        <p className={`text-xs ${isSelected ? 'text-slate-900 font-medium' : 'text-slate-600'}`}>{task.description}</p>
                                        <p className="text-[10px] text-slate-400">{task.project} • {task.status}</p>
                                    </div>
                                </div>
                             )
                        })}
                    </div>
                )}
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex justify-between items-center">
           {isEditing ? (
             <button 
               type="button"
               onClick={handleDelete}
               className="text-red-500 hover:text-red-700 text-sm font-medium hover:bg-red-50 px-3 py-2 rounded transition-colors flex items-center gap-2"
             >
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
               Delete Task
             </button>
           ) : (
             <div></div> /* Spacer */
           )}
           
           <div className="flex gap-3">
             <button
               type="button"
               onClick={onClose}
               className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
             >
               Cancel
             </button>
             <button
               type="button"
               onClick={() => handleSubmit()}
               disabled={isSubmitting}
               className={`px-6 py-2 text-sm font-bold text-white rounded-lg shadow-md transition-all ${isEditing ? 'bg-amber-600 hover:bg-amber-700' : 'bg-slate-900 hover:bg-slate-800'} ${isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-lg active:scale-95'}`}
             >
               {isSubmitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Task'}
             </button>
           </div>
        </div>
      </div>
    </div>
  );
};
