
import React from 'react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const groups = [
    {
      title: "Navigation",
      items: [
        { keys: ["g", "d"], label: "Go to Dashboard" },
        { keys: ["g", "m"], label: "Go to Missions" },
        { keys: ["⌘", "K"], label: "Command Palette" },
      ]
    },
    {
      title: "Actions",
      items: [
        { keys: ["c"], label: "Create Task" },
        { keys: ["/"], label: "Search Missions" },
        { keys: ["?"], label: "Show Help" },
      ]
    },
    {
      title: "General",
      items: [
        { keys: ["Esc"], label: "Close Modal / Cancel" },
        { keys: ["⌘", "Enter"], label: "Save Form" },
      ]
    }
  ];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div 
        className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 dark:border-slate-800"
        onClick={e => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800">
          <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm uppercase tracking-wide">Keyboard Shortcuts</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
             <span className="sr-only">Close</span>
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        
        <div className="p-6 grid gap-6">
          {groups.map((group) => (
            <div key={group.title}>
              <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">{group.title}</h4>
              <div className="space-y-2">
                {group.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-sm">
                    <span className="text-slate-600 dark:text-slate-300 font-medium">{item.label}</span>
                    <div className="flex gap-1">
                      {item.keys.map((k, kIdx) => (
                        <kbd key={kIdx} className="bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded px-2 py-0.5 text-xs font-mono font-bold text-slate-600 dark:text-slate-300 min-w-[24px] text-center shadow-sm">
                          {k}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
