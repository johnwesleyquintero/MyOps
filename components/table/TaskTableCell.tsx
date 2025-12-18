
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { TaskEntry } from '../../types';
import { formatRelativeDate } from '../../utils/formatUtils';
import { Badge } from '../common/Badge';
import { getDependencyStatus } from '../../utils/taskLogic';
import { processTextWithTags } from '../../utils/textUtils';

interface TaskTableCellProps {
  entry: TaskEntry;
  columnKey: string;
  allEntries: TaskEntry[];
  onEdit: (entry: TaskEntry) => void;
  onStatusUpdate?: (entry: TaskEntry) => void;
  onDescriptionUpdate?: (entry: TaskEntry, newDesc: string) => void;
}

export const TaskTableCell: React.FC<TaskTableCellProps> = ({
  entry,
  columnKey,
  allEntries,
  onEdit,
  onStatusUpdate,
  onDescriptionUpdate
}) => {
  const handleChecklistToggle = (index: number) => {
    if (!onDescriptionUpdate) return;
    const lines = entry.description.split('\n');
    let currentCheckbox = 0;
    const newLines = lines.map(line => {
      const checkboxMatch = line.match(/^(\s*[-*]\s*)\[([ x])\]/);
      if (checkboxMatch) {
        if (currentCheckbox === index) {
          const isChecked = checkboxMatch[2] === 'x';
          currentCheckbox++;
          return line.replace(`[${checkboxMatch[2]}]`, `[${isChecked ? ' ' : 'x'}]`);
        }
        currentCheckbox++;
      }
      return line;
    });
    onDescriptionUpdate(entry, newLines.join('\n'));
  };

  switch (columnKey) {
    case 'date':
      const dateInfo = formatRelativeDate(entry.date);
      return <span className={`font-mono text-xs whitespace-nowrap ${dateInfo.colorClass}`}>{dateInfo.text}</span>;

    case 'description':
      const depStatus = getDependencyStatus(entry, allEntries);
      let checkboxCounter = 0;
      return (
        <div className="flex items-start gap-2">
          <div className={`prose prose-sm max-w-none line-clamp-2 overflow-hidden ${entry.status === 'Done' ? 'opacity-50 line-through text-slate-400 dark:text-slate-500' : 'text-slate-700 dark:text-slate-200'} relative`}>
            <div onClick={() => onEdit(entry)} className="absolute inset-0 cursor-pointer z-0"></div>
            <div className="relative z-10 pointer-events-none">
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                components={{
                  a: ({...props}) => <a {...props} className="text-indigo-600 dark:text-indigo-400 pointer-events-auto cursor-pointer hover:underline" onClick={e => e.stopPropagation()} target="_blank" />,
                  p: ({children, ...props}) => {
                    const processed = React.Children.map(children, child => typeof child === 'string' ? processTextWithTags(child) : child);
                    return <span {...props} className="mr-1 block">{processed}</span>;
                  },
                  input: (props) => {
                    if (props.type === 'checkbox') {
                      const idx = checkboxCounter++;
                      return (
                        <input 
                          type="checkbox" 
                          checked={props.checked} 
                          onChange={() => handleChecklistToggle(idx)}
                          onClick={e => e.stopPropagation()}
                          className="mx-1 mt-0.5 align-middle rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5 cursor-pointer pointer-events-auto"
                        />
                      );
                    }
                    return <input {...props} />;
                  }
                }}
              >
                {entry.description}
              </ReactMarkdown>
            </div>
          </div>
          {depStatus?.blocked && (
            <div className="flex-shrink-0 flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold border bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/30 animate-pulse">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
              <span>{depStatus.blockerCount}</span>
            </div>
          )}
        </div>
      );

    case 'project':
      return <Badge type="project" value={entry.project} />;

    case 'priority':
      return <Badge type="priority" value={entry.priority} />;

    case 'status':
      return <Badge type="status" value={entry.status} onClick={() => onStatusUpdate?.(entry)} />;

    default:
      return null;
  }
};
