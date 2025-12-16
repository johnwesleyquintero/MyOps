
import React, { useState, useEffect, useMemo, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { TaskEntry, TaskTemplate } from '../types';
import { DEFAULT_PROJECTS, PRIORITIES, STATUSES, PRIORITY_COLORS, STATUS_COLORS, RECURRENCE_OPTIONS, TEMPLATE_STORAGE_KEY } from '../constants';

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
  const [isPreviewMode, setIsPreviewMode] = useState<boolean>(false);
  
  // Template State
  const [templates, setTemplates] = useState<TaskTemplate[]>([]);
  const [showTemplates, setShowTemplates] = useState<boolean>(false);

  // Load templates on mount
  useEffect(() => {
    const stored = localStorage.getItem(TEMPLATE_STORAGE_KEY);
    if (stored) {
      setTemplates(JSON.parse(stored));
    }
  }, []);

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
    setIsPreviewMode(false);
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

  // --- Template Logic ---
  const saveAsTemplate = () => {
    const name = prompt("Template Name:", formData.description.slice(0, 30));
    if (!name) return;
    
    const newTemplate: TaskTemplate = {
      id: crypto.randomUUID(),
      name,
      description: formData.description,
      project: formData.project,
      priority: formData.priority
    };
    
    const updated = [...templates, newTemplate];
    setTemplates(updated);
    localStorage.setItem(TEMPLATE_STORAGE_KEY, JSON.stringify(updated));
    alert("Template Saved!");
  };

  const loadTemplate = (template: TaskTemplate) => {
    setFormData(prev => ({
      ...prev,
      description: template.description,
      project: template.project,
      priority: template.priority
    }));
    setShowTemplates(false);
  };

  const deleteTemplate = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("Delete this template?")) return;
    const updated = templates.filter(t => t.id !== id);
    setTemplates(updated);
    localStorage.setItem(TEMPLATE_STORAGE_KEY, JSON.stringify(updated));
  };
  // -----------------------

  // --- Recurrence Logic ---
  const handleRecurrenceChange = (tag: string) => {
    // Remove existing tags first
    let cleanDesc = formData.description;
    RECURRENCE_OPTIONS.forEach(opt => {
        if (opt.tag) cleanDesc = cleanDesc.replace(opt.tag, '');
    });
    cleanDesc = cleanDesc.trim();
    
    // Add new tag if selected
    if (tag) {
        setFormData({ ...formData, description: `${cleanDesc} ${tag}` });
    } else {
        setFormData({ ...formData, description: cleanDesc });
    }
  };

  const currentRecurrence = useMemo(() => {
    for (const opt of RECURRENCE_OPTIONS) {
        if (opt.tag && formData.description.includes(opt.tag)) return opt.tag;
    }
    return '';
  }, [formData.description]);
  // ------------------------


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
      case 'bold':
        insert = `**${selection || 'bold text'}**`;
        cursorOffset = 2 + (selection.length || 9);
        break;
      case 'italic':
        insert = `_${selection || 'italic text'}_`;
        cursorOffset = 1 + (selection.length || 11);
        break;
      case 'code':
        insert = `\`${selection || 'code'}\``;
        cursorOffset = 1 + (selection.length || 4);
        break;
      case 'link':
        insert = `[${selection || 'link text'}](url)`;
        cursorOffset = 1 + (selection.length || 9); 
        break;
      case 'list':
        const isStartOfLine = start === 0 || text[start - 1] === '\n';
        const prefix = isStartOfLine ? '- ' : '\n- ';
        insert = `${prefix}${selection || 'list item'}`;
        cursorOffset = prefix.length + (selection.length || 9);
        break;
    }

    const newText = before + insert + after;
    setFormData({ ...formData, description: newText });

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + cursorOffset, start + cursorOffset);
    }, 0);
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

  const potentialDeps = useMemo(() => {
    return entries.filter(e => e.id !== formData.id && e.status !== 'Done');
  }, [entries, formData.id]);

  if (!isOpen) return null;

  const isEditing = !!initialData;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity">
      <div 
        className="bg-white rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh] animate-scale-in"
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
          
          <div className="flex items-center gap-2">
             {/* Template Toggle */}
             {!isEditing && (
                 <div className="relative">
                    <button 
                        onClick={() => setShowTemplates(!showTemplates)}
                        className="text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-md transition-colors flex items-center gap-1"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" /></svg>
                        Templates
                    </button>
                    {showTemplates && (
                        <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-slate-200 rounded-lg shadow-xl z-50 overflow-hidden">
                            <div className="bg-slate-50 px-3 py-2 border-b border-slate-100 text-[10px] font-bold uppercase text-slate-500 flex justify-between items-center">
                                <span>Library</span>
                                <button onClick={saveAsTemplate} className="text-indigo-600 hover:text-indigo-800 hover:underline">
                                    + Save Current
                                </button>
                            </div>
                            <div className="max-h-60 overflow-y-auto">
                                {templates.length === 0 ? (
                                    <div className="p-4 text-center text-xs text-slate-400 italic">No templates saved yet. Fill out the form and click "Save Current".</div>
                                ) : (
                                    templates.map(t => (
                                        <div key={t.id} onClick={() => loadTemplate(t)} className="px-3 py-2 hover:bg-slate-50 cursor-pointer border-b border-slate-50 last:border-0 group flex justify-between items-center">
                                            <div>
                                                <div className="text-sm font-medium text-slate-800">{t.name}</div>
                                                <div className="text-[10px] text-slate-400">{t.project} • {t.priority}</div>
                                            </div>
                                            <button 
                                                onClick={(e) => deleteTemplate(t.id, e)}
                                                className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-1"
                                            >
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                 </div>
             )}

             <button 
                onClick={onClose}
                className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100 transition-colors"
             >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
             </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
          <div className="flex flex-col gap-6">
            
            {/* Description (Main Input with Toolbar) */}
            <div className="flex flex-col gap-2 flex-1">
               <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                    Description
                    <span className="text-[10px] font-normal text-slate-400 normal-case hidden sm:inline">Markdown supported</span>
                  </label>
                  <div className="flex bg-slate-100 rounded-lg p-0.5">
                     <button 
                       type="button"
                       onClick={() => setIsPreviewMode(false)}
                       className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${!isPreviewMode ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                     >
                       Write
                     </button>
                     <button 
                       type="button"
                       onClick={() => setIsPreviewMode(true)}
                       className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${isPreviewMode ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                     >
                       Preview
                     </button>
                  </div>
               </div>

               <div className="border border-slate-200 rounded-lg overflow-hidden bg-white focus-within:ring-2 focus-within:ring-indigo-500/50 focus-within:border-indigo-500 transition-all shadow-sm flex flex-col">
                  {/* Toolbar */}
                  {!isPreviewMode && (
                    <div className="flex items-center gap-1 p-2 border-b border-slate-100 bg-slate-50">
                       <button type="button" onClick={() => handleFormat('bold')} className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded" title="Bold">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 4h8a4 4 0 014 4 4 4 0 01-4 4H6V4zm0 8h9a4 4 0 014 4 4 4 0 01-4 4H6v-8z" /></svg>
                       </button>
                       <button type="button" onClick={() => handleFormat('italic')} className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded" title="Italic">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
                          <span className="sr-only">Italic</span>
                       </button>
                       <button type="button" onClick={() => handleFormat('list')} className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded" title="List">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
                       </button>
                       <button type="button" onClick={() => handleFormat('code')} className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded" title="Code">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
                       </button>
                       <div className="w-px h-5 bg-slate-200 mx-1"></div>
                       <div className="text-[9px] text-slate-400 px-2 font-medium">⌘+Enter to save</div>
                    </div>
                  )}

                  {isPreviewMode ? (
                     <div className="w-full min-h-[300px] px-4 py-3 bg-white text-sm text-slate-700 overflow-y-auto prose prose-sm max-w-none">
                        {formData.description ? (
                          <ReactMarkdown 
                            remarkPlugins={[remarkGfm]}
                            components={{
                              a: ({node, ...props}) => <a {...props} className="text-indigo-600 underline" target="_blank" rel="noopener noreferrer" />,
                              ul: ({node, ...props}) => <ul {...props} className="list-disc list-inside" />,
                              ol: ({node, ...props}) => <ol {...props} className="list-decimal list-inside" />,
                              input: (props) => <input type="checkbox" checked={props.checked} readOnly className="mx-1 mt-0.5 align-middle rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5" />
                            }}
                          >
                             {formData.description}
                          </ReactMarkdown>
                        ) : (
                          <span className="text-slate-400 italic">Nothing to preview...</span>
                        )}
                     </div>
                  ) : (
                    <textarea
                      ref={textareaRef}
                      required
                      rows={12}
                      placeholder="Task details, sub-tasks, or notes..."
                      className="w-full bg-white border-none px-4 py-3 text-sm focus:ring-0 text-slate-800 placeholder-slate-400 font-sans resize-y min-h-[300px] leading-relaxed"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      onKeyDown={handleKeyDown}
                      autoFocus
                    />
                  )}
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {/* Date & Recurrence */}
               <div className="flex gap-2">
                 <div className="flex-1">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Due Date</label>
                    <input
                        type="date"
                        required
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-700 shadow-sm"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    />
                 </div>
                 <div className="w-1/3">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2" title="Automatically recreates task when done">Repeats</label>
                    <select
                        value={currentRecurrence}
                        onChange={(e) => handleRecurrenceChange(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-700 shadow-sm"
                    >
                        {RECURRENCE_OPTIONS.map(opt => (
                            <option key={opt.label} value={opt.tag}>{opt.label}</option>
                        ))}
                    </select>
                 </div>
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
                          className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-700 shadow-sm"
                          value={formData.project}
                          onChange={(e) => setFormData({ ...formData, project: e.target.value })}
                      />
                  ) : (
                      <select
                          className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-700 shadow-sm"
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
             <div className="flex gap-2">
                 <button 
                    type="button"
                    onClick={handleDelete}
                    className="text-red-500 hover:text-red-700 text-sm font-medium hover:bg-red-50 px-3 py-2 rounded transition-colors flex items-center gap-2"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    Delete Task
                </button>
                <button 
                   type="button"
                   onClick={() => onDuplicate(formData)}
                   className="text-slate-500 hover:text-indigo-600 text-sm font-medium hover:bg-indigo-50 px-3 py-2 rounded transition-colors flex items-center gap-2"
                   title="Make a Copy"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" /></svg>
                    Duplicate
                </button>
             </div>
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
