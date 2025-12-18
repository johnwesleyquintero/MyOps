
import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { TaskEntry } from '../types';
import { DEFAULT_PROJECTS, PRIORITIES, STATUSES, PRIORITY_COLORS, STATUS_COLORS, RECURRENCE_OPTIONS } from '../constants';
import { CopyIdButton } from './CopyIdButton';
import { useTaskForm } from '../hooks/useTaskForm';
import { useMarkdownEditor } from '../hooks/useMarkdownEditor';
import { Icon, iconProps } from './Icons';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (entry: TaskEntry) => Promise<void>;
  onDelete: (entry: TaskEntry) => Promise<void | boolean>;
  onDuplicate: (entry: TaskEntry) => void; 
  initialData?: TaskEntry | null;
  isSubmitting: boolean;
  entries: TaskEntry[]; 
}

export const TaskModal: React.FC<TaskModalProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  onDelete,
  onDuplicate,
  initialData, 
  isSubmitting,
  entries 
}) => {
  const [descCopied, setDescCopied] = useState(false);
  
  const {
    formData, setFormData,
    isCustomProject, setIsCustomProject,
    showDeps, setShowDeps,
    isPreviewMode, setIsPreviewMode,
    templates,
    showTemplates, setShowTemplates,
    currentRecurrence,
    potentialDeps,
    handleRecurrenceChange,
    toggleDependency,
    saveAsTemplate,
    loadTemplate,
    deleteTemplate
  } = useTaskForm(initialData, entries);

  const { textareaRef, applyFormat } = useMarkdownEditor(
    formData.description, 
    (newText) => setFormData({ ...formData, description: newText })
  );

  const handleCopyDescription = () => {
    if (!formData.description) return;
    navigator.clipboard.writeText(formData.description);
    setDescCopied(true);
    setTimeout(() => setDescCopied(false), 2000);
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

  if (!isOpen) return null;

  const isEditing = !!initialData;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity">
      <div 
        className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh] animate-scale-in border border-slate-200 dark:border-slate-800"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
             <div className={`w-2 h-8 rounded-full ${isEditing ? 'bg-amber-500' : 'bg-indigo-600'}`}></div>
             <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
               {isEditing ? 'Edit Task' : 'New Task'}
             </h2>
          </div>
          
          <div className="flex items-center gap-2">
             {!isEditing && (
                 <div className="relative">
                    <button 
                        onClick={() => setShowTemplates(!showTemplates)}
                        className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 px-3 py-1.5 rounded-md transition-colors flex items-center gap-1"
                    >
                        <Icon.Template {...iconProps(14)} />
                        Templates
                    </button>
                    {showTemplates && (
                        <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl z-50 overflow-hidden">
                            <div className="bg-slate-50 dark:bg-slate-900 px-3 py-2 border-b border-slate-100 dark:border-slate-700 text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 flex justify-between items-center">
                                <span>Library</span>
                                <button onClick={saveAsTemplate} className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 hover:underline">
                                    + Save Current
                                </button>
                            </div>
                            <div className="max-h-60 overflow-y-auto">
                                {templates.length === 0 ? (
                                    <div className="p-4 text-center text-xs text-slate-400 italic">No templates.</div>
                                ) : (
                                    templates.map(t => (
                                        <div key={t.id} onClick={() => loadTemplate(t)} className="px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer border-b border-slate-50 dark:border-slate-800 last:border-0 group flex justify-between items-center">
                                            <div>
                                                <div className="text-sm font-medium text-slate-800 dark:text-slate-200">{t.name}</div>
                                                <div className="text-[10px] text-slate-400">{t.project} • {t.priority}</div>
                                            </div>
                                            <button onClick={(e) => { e.stopPropagation(); deleteTemplate(t.id); }} className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-1">
                                                <Icon.Close {...iconProps(12)} />
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                 </div>
             )}

             <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <Icon.Close {...iconProps(20)} />
             </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-white dark:bg-slate-900">
          <div className="flex flex-col gap-6">
            
            <div className="flex flex-col gap-2 flex-1">
               <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">Description</label>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={handleCopyDescription} className={`p-1.5 rounded-md border transition-all flex items-center gap-1.5 ${descCopied ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
                        <span className="text-[10px] font-bold uppercase">{descCopied ? 'Copied' : 'Copy'}</span>
                    </button>
                    <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5">
                        <button type="button" onClick={() => setIsPreviewMode(false)} className={`px-3 py-1 text-[10px] font-bold rounded-md ${!isPreviewMode ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm' : 'text-slate-400'}`}>Write</button>
                        <button type="button" onClick={() => setIsPreviewMode(true)} className={`px-3 py-1 text-[10px] font-bold rounded-md ${isPreviewMode ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm' : 'text-slate-400'}`}>Preview</button>
                    </div>
                  </div>
               </div>

               <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden bg-white dark:bg-slate-900 flex flex-col min-h-[300px]">
                  {!isPreviewMode && (
                    <div className="flex items-center gap-1 p-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                       <button type="button" onClick={() => applyFormat('bold')} className="p-1.5 text-slate-500 hover:text-indigo-600 dark:text-slate-400 rounded transition-colors"><Icon.Bold {...iconProps(14)} /></button>
                       <button type="button" onClick={() => applyFormat('italic')} className="p-1.5 text-slate-500 hover:text-indigo-600 dark:text-slate-400 rounded transition-colors"><Icon.Italic {...iconProps(14)} /></button>
                       <button type="button" onClick={() => applyFormat('list')} className="p-1.5 text-slate-500 hover:text-indigo-600 dark:text-slate-400 rounded transition-colors"><Icon.List {...iconProps(14)} /></button>
                       <button type="button" onClick={() => applyFormat('code')} className="p-1.5 text-slate-500 hover:text-indigo-600 dark:text-slate-400 rounded transition-colors"><Icon.Code {...iconProps(14)} /></button>
                       <div className="flex-1"></div>
                       <span className="text-[9px] text-slate-400 px-2 font-medium">⌘+Enter to save</span>
                    </div>
                  )}

                  {isPreviewMode ? (
                     <div className="w-full min-h-[300px] px-4 py-3 bg-white dark:bg-slate-900 text-sm text-slate-700 dark:text-slate-300 prose prose-sm dark:prose-invert max-w-none">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{formData.description || '_No content..._'}</ReactMarkdown>
                     </div>
                  ) : (
                    <textarea
                      ref={textareaRef}
                      required
                      placeholder="Task details, sub-tasks, or notes..."
                      className="w-full bg-white dark:bg-slate-900 border-none px-4 py-3 text-sm focus:ring-0 text-slate-800 dark:text-slate-100 placeholder-slate-400 font-sans resize-y min-h-[300px] leading-relaxed"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      onKeyDown={handleKeyDown}
                    />
                  )}
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="flex gap-2">
                 <div className="flex-1">
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Due Date</label>
                    <input
                        type="date"
                        required
                        className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-700 dark:text-slate-200 shadow-sm"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    />
                 </div>
                 <div className="w-1/3">
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Repeats</label>
                    <select
                        value={currentRecurrence}
                        onChange={(e) => handleRecurrenceChange(e.target.value)}
                        className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-2 text-sm text-slate-700 dark:text-slate-200 shadow-sm"
                    >
                        {RECURRENCE_OPTIONS.map(opt => <option key={opt.label} value={opt.tag}>{opt.label}</option>)}
                    </select>
                 </div>
               </div>

               <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 flex justify-between">
                      Project
                      <button type="button" onClick={() => setIsCustomProject(!isCustomProject)} className="text-[10px] underline text-indigo-500">
                          {isCustomProject ? 'List' : 'Custom'}
                      </button>
                  </label>
                  {isCustomProject ? (
                      <input
                          type="text" required placeholder="Project Name..."
                          className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-700 dark:text-slate-200"
                          value={formData.project}
                          onChange={(e) => setFormData({ ...formData, project: e.target.value })}
                      />
                  ) : (
                      <select
                          className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-700 dark:text-slate-200"
                          value={formData.project}
                          onChange={(e) => setFormData({ ...formData, project: e.target.value })}
                      >
                        {DEFAULT_PROJECTS.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                  )}
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                   <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Priority</label>
                   <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg gap-1">
                      {PRIORITIES.map(p => (
                        <button key={p} type="button" onClick={() => setFormData({ ...formData, priority: p })}
                          className={`flex-1 py-1.5 text-[10px] font-bold rounded-md transition-all ${formData.priority === p ? 'bg-white dark:bg-slate-700 shadow-sm ring-1 ring-black/5 ' + PRIORITY_COLORS[p].split(' ')[1] : 'text-slate-400'}`}
                        >
                          {p}
                        </button>
                      ))}
                   </div>
                </div>

                <div>
                   <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Status</label>
                   <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg gap-1">
                      {STATUSES.map(s => (
                        <button key={s} type="button" onClick={() => setFormData({ ...formData, status: s })}
                          className={`flex-1 py-1.5 text-[10px] font-bold rounded-md transition-all ${formData.status === s ? 'bg-white dark:bg-slate-700 shadow-sm ring-1 ring-black/5 ' + STATUS_COLORS[s].split(' ')[1] : 'text-slate-400'}`}
                        >
                          {s}
                        </button>
                      ))}
                   </div>
                </div>
            </div>

            <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
                <button type="button" onClick={() => setShowDeps(!showDeps)} className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider hover:text-indigo-600 mb-3">
                    <Icon.Down {...iconProps(14, `transition-transform ${showDeps ? '' : '-rotate-90'}`)} />
                    Blocking Tasks ({formData.dependencies?.length || 0})
                </button>
                {showDeps && (
                    <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 max-h-40 overflow-y-auto custom-scrollbar">
                        {potentialDeps.map(task => {
                             const isSelected = formData.dependencies?.includes(task.id);
                             return (
                                <div key={task.id} onClick={() => toggleDependency(task.id)}
                                    className={`flex items-start gap-2 p-2 rounded cursor-pointer border ${isSelected ? 'bg-white border-indigo-200 shadow-sm dark:bg-slate-700 dark:border-indigo-500' : 'border-transparent hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                                >
                                    <div className={`mt-0.5 w-4 h-4 border rounded flex items-center justify-center ${isSelected ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300 bg-white dark:bg-slate-600 dark:border-slate-500'}`}>
                                        {isSelected && <Icon.Check {...iconProps(12, "text-white")} />}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs font-medium text-slate-700 dark:text-slate-200">{task.description}</p>
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
        <div className="bg-slate-50 dark:bg-slate-800 px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
           {isEditing ? (
             <div className="flex gap-2">
                 <button type="button" onClick={handleDelete} className="text-red-500 hover:text-red-700 text-sm font-medium px-3 py-2 rounded transition-colors flex items-center gap-2">
                    <Icon.Delete {...iconProps(16)} />
                    Delete
                </button>
                <button type="button" onClick={() => onDuplicate(formData)} className="text-slate-500 hover:text-indigo-600 text-sm font-medium px-3 py-2 rounded flex items-center gap-2">
                    <Icon.Copy {...iconProps(16)} />
                    Duplicate
                </button>
                <CopyIdButton id={formData.id} showLabel className="text-slate-500 hover:text-indigo-600 text-sm font-medium px-3 py-2 rounded flex items-center gap-2" />
             </div>
           ) : <div />}
           
           <div className="flex gap-3">
             <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-600 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-600">Cancel</button>
             <button onClick={() => handleSubmit()} disabled={isSubmitting}
               className={`px-6 py-2 text-sm font-bold text-white rounded-lg shadow-md ${isEditing ? 'bg-amber-600 hover:bg-amber-700' : 'bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-500'}`}
             >
               {isSubmitting ? 'Saving...' : isEditing ? 'Update' : 'Create'}
             </button>
           </div>
        </div>
      </div>
    </div>
  );
};
