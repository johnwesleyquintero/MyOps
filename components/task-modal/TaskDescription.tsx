
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { processTextWithTags } from '../../utils/textUtils';

interface TaskDescriptionProps {
  value: string;
  onChange: (val: string) => void;
  isPreview: boolean;
  setIsPreview: (val: boolean) => void;
  onFormat: (type: 'bold' | 'italic' | 'list' | 'link' | 'code') => void;
  onSave: () => void;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
}

export const TaskDescription: React.FC<TaskDescriptionProps> = ({
  value,
  onChange,
  isPreview,
  setIsPreview,
  onFormat,
  onSave,
  textareaRef
}) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      onSave();
    }
  };

  const ToolbarButton = ({ type, icon, label }: { type: any, icon: React.ReactNode, label: string }) => (
    <button 
      type="button" 
      onClick={() => onFormat(type)} 
      className="p-1.5 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors"
      title={label}
    >
      {icon}
    </button>
  );

  return (
    <div className="flex flex-col gap-2 flex-1">
      <div className="flex justify-between items-center">
        <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-2">
          Mission Intel
        </label>
        <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5">
          <button 
            type="button"
            onClick={() => setIsPreview(false)}
            className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${!isPreview ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
          >
            EDIT
          </button>
          <button 
            type="button"
            onClick={() => setIsPreview(true)}
            className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${isPreview ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
          >
            PREVIEW
          </button>
        </div>
      </div>

      <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-950 focus-within:ring-2 focus-within:ring-indigo-500/30 transition-all shadow-sm flex flex-col min-h-[350px]">
        {!isPreview && (
          <div className="flex items-center gap-1 p-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
            <ToolbarButton type="bold" label="Bold" icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 4h8a4 4 0 014 4 4 4 0 01-4 4H6V4zm0 8h9a4 4 0 014 4 4 4 4 0 01-4 4H6v-8z" /></svg>} />
            <ToolbarButton type="italic" label="Italic" icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16" /></svg>} />
            <ToolbarButton type="list" label="List" icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>} />
            <ToolbarButton type="code" label="Code" icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>} />
            <div className="ml-auto text-[9px] text-slate-400 px-2 font-mono hidden sm:block">⌘+ENTER TO SAVE</div>
          </div>
        )}

        {isPreview ? (
          <div className="w-full h-full p-4 bg-white dark:bg-slate-950 text-sm text-slate-700 dark:text-slate-300 overflow-y-auto prose prose-sm dark:prose-invert max-w-none custom-scrollbar">
            {value ? (
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                components={{
                  p: ({children}) => {
                    const processed = React.Children.map(children, child => typeof child === 'string' ? processTextWithTags(child) : child);
                    return <p className="mb-2 last:mb-0">{processed}</p>;
                  },
                  input: (props) => <input type="checkbox" checked={props.checked} readOnly className="mx-1 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5" />
                }}
              >
                {value}
              </ReactMarkdown>
            ) : (
              <span className="text-slate-400 italic font-mono text-xs">Awaiting mission details...</span>
            )}
          </div>
        ) : (
          <textarea
            ref={textareaRef}
            required
            placeholder="Document the mission parameters, checklist, and strategic notes..."
            className="w-full flex-1 bg-transparent border-none px-4 py-3 text-sm focus:ring-0 text-slate-800 dark:text-slate-100 placeholder-slate-400 font-sans resize-none leading-relaxed custom-scrollbar"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
          />
        )}
      </div>
    </div>
  );
};
