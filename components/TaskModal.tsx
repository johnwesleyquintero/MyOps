
import React, { useRef, useState } from 'react';
import { TaskEntry } from '../types';
import { CopyIdButton } from './CopyIdButton';
import { useTaskForm } from '../hooks/useTaskForm';
import { TaskDescription } from './task-modal/TaskDescription';
import { TaskMeta } from './task-modal/TaskMeta';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (entry: TaskEntry) => Promise<void>;
  onDelete: (entry: TaskEntry) => Promise<void>;
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
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [descriptionCopied, setDescriptionCopied] = useState(false);
  
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

  const handleCopyDescription = () => {
    if (!formData.description) return;
    navigator.clipboard.writeText(formData.description);
    setDescriptionCopied(true);
    setTimeout(() => setDescriptionCopied(false), 2000);
  };

  const handleSubmit = async () => {
    if (!formData.description || !formData.project) return;
    await onSubmit(formData);
    onClose();
  };

  const handleFormat = (type: 'bold' | 'italic' | 'list' | 'link' | 'code') => {
    if (isPreviewMode) return;
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = formData.description;
    const selection = text.substring(start, end);
    let before = text.substring(0, start);
    let after = text.substring(end);
    let insert = '';
    let cursorOffset = 0;

    switch (type) {
      case 'bold': insert = `**${selection || 'bold text'}**`; cursorOffset = 2 + (selection.length || 9); break;
      case 'italic': insert = `_${selection || 'italic text'}_`; cursorOffset = 1 + (selection.length || 11); break;
      case 'code': insert = `\`${selection || 'code'}\``; cursorOffset = 1 + (selection.length || 4); break;
      case 'link': insert = `[${selection || 'link text'}](url)`; cursorOffset = 1 + (selection.length || 9); break;
      case 'list': 
        const isStartOfLine = start === 0 || text[start - 1] === '\n';
        const prefix = isStartOfLine ? '- ' : '\n- ';
        insert = `${prefix}${selection || 'item'}`; cursorOffset = prefix.length + (selection.length || 4); 
        break;
    }

    setFormData({ ...formData, description: before + insert + after });
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + cursorOffset, start + cursorOffset);
    }, 0);
  };

  if (!isOpen) return null;

  const isEditing = !!initialData;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh] border border-slate-200 dark:border-slate-800 animate-scale-in">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
             <div className={`w-2 h-8 rounded-full ${isEditing ? 'bg-amber-500' : 'bg-indigo-600'}`}></div>
             <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 tracking-tight">
               {isEditing ? 'UPDATE OBJECTIVE' : 'INITIALIZE MISSION'}
             </h2>
          </div>
          <div className="flex items-center gap-3">
             {!isEditing && (
                <div className="relative">
                  <button onClick={() => setShowTemplates(!showTemplates)} className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/20 px-3 py-2 rounded-lg hover:bg-indigo-100 transition-colors uppercase tracking-widest">
                    Library
                  </button>
                  {showTemplates && (
                    <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden">
                       <div className="p-3 bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-700 text-[10px] font-bold uppercase text-slate-500 flex justify-between">
                         <span>Templates</span>
                         <button onClick={saveAsTemplate} className="text-indigo-600">+ SAVE CURRENT</button>
                       </div>
                       <div className="max-h-60 overflow-y-auto">
                         {templates.map(t => (
                           <div key={t.id} onClick={() => loadTemplate(t)} className="p-3 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer border-b border-slate-50 dark:border-slate-800 group flex justify-between">
                             <div>
                               <div className="text-sm font-medium text-slate-800 dark:text-slate-200">{t.name}</div>
                               <div className="text-[10px] text-slate-400">{t.project}</div>
                             </div>
                             <button onClick={(e) => { e.stopPropagation(); deleteTemplate(t.id); }} className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100">×</button>
                           </div>
                         ))}
                       </div>
                    </div>
                  )}
                </div>
             )}
             <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
             </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 flex flex-col gap-6">
          <TaskDescription 
            value={formData.description} 
            onChange={(val) => setFormData({ ...formData, description: val })}
            isPreview={isPreviewMode}
            setIsPreview={setIsPreviewMode}
            onFormat={handleFormat}
            onSave={handleSubmit}
            textareaRef={textareaRef}
          />
          <TaskMeta 
            formData={formData} 
            setFormData={setFormData}
            isCustomProject={isCustomProject}
            setIsCustomProject={setIsCustomProject}
            currentRecurrence={currentRecurrence}
            onRecurrenceChange={handleRecurrenceChange}
          />

          <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
            <button type="button" onClick={() => setShowDeps(!showDeps)} className="flex items-center gap-2 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3 hover:text-indigo-500 transition-colors">
              <svg className={`w-3 h-3 transition-transform ${showDeps ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" /></svg>
              Blocking Dependencies ({formData.dependencies?.length || 0})
            </button>
            {showDeps && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto p-1 custom-scrollbar">
                {potentialDeps.map(task => (
                  <div key={task.id} onClick={() => toggleDependency(task.id)} className={`p-2 rounded-lg border text-xs cursor-pointer transition-all ${formData.dependencies?.includes(task.id) ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300' : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-500 hover:border-slate-300'}`}>
                    {task.description.slice(0, 50)}...
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
          <div className="flex gap-2">
            {isEditing && (
              <>
                <button onClick={() => onDelete(formData)} className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-widest border border-transparent hover:border-red-100 transition-all">ABORT MISSION</button>
                <button onClick={() => onDuplicate(formData)} className="text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-widest border border-transparent hover:border-slate-200 transition-all">DUPLICATE</button>
              </>
            )}
          </div>
          <div className="flex gap-3">
             <button onClick={onClose} className="px-5 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white uppercase tracking-widest transition-colors">Cancel</button>
             <button onClick={handleSubmit} disabled={isSubmitting} className={`px-8 py-2 text-xs font-bold text-white rounded-lg shadow-lg uppercase tracking-widest transition-all ${isEditing ? 'bg-amber-600 hover:bg-amber-700' : 'bg-slate-900 dark:bg-indigo-600 hover:shadow-indigo-500/20'} ${isSubmitting ? 'opacity-50' : 'active:scale-95'}`}>
               {isSubmitting ? '...' : isEditing ? 'UPDATE LEDGER' : 'COMMENCE MISSION'}
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};
