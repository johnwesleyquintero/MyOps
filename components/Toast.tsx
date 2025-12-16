
import React, { useEffect } from 'react';
import { Notification } from '../types';

interface ToastContainerProps {
  notifications: Notification[];
  removeNotification: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ notifications, removeNotification }) => {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {notifications.map((note) => (
        <ToastItem key={note.id} note={note} onRemove={() => removeNotification(note.id)} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ note: Notification; onRemove: () => void }> = ({ note, onRemove }) => {
  useEffect(() => {
    // If there is an action (like Undo), we give the user more time (e.g. 5s) vs standard 4s
    const duration = note.action ? 5000 : 4000;
    const timer = setTimeout(() => {
      onRemove();
    }, duration);
    return () => clearTimeout(timer);
  }, [onRemove, note.action]);

  const bgColors = {
    success: 'bg-slate-900 border-slate-700 text-white dark:bg-slate-800 dark:border-slate-600',
    error: 'bg-red-600 border-red-700 text-white dark:bg-red-800 dark:border-red-900',
    info: 'bg-white border-slate-200 text-slate-800 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100'
  };

  const icons = {
    success: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
    ),
    error: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    ),
    info: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    )
  };

  return (
    <div className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded shadow-lg border ${bgColors[note.type]} transition-all animate-slide-in min-w-[300px]`}>
      <div className="flex-shrink-0">
        {icons[note.type]}
      </div>
      <div className="flex-1 text-sm font-medium flex justify-between items-center gap-4">
        <span>{note.message}</span>
        {note.action && (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              note.action?.onClick();
              onRemove(); // Close toast after action
            }}
            className="px-2 py-1 bg-slate-200/20 hover:bg-slate-200/30 rounded text-xs font-bold uppercase tracking-wider border border-transparent hover:border-current transition-all"
          >
            {note.action.label}
          </button>
        )}
      </div>
      {!note.action && (
        <button onClick={onRemove} className="opacity-60 hover:opacity-100 transition-opacity">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      )}
    </div>
  );
};
