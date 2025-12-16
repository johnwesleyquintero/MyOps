import React, { useState, useEffect } from 'react';
import { AppConfig } from '../types';
import { ConnectionSettings } from './settings/ConnectionSettings';
import { BackendCodeView } from './settings/BackendCodeView';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: AppConfig;
  onSave: (config: AppConfig) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, config, onSave }) => {
  const [localConfig, setLocalConfig] = useState<AppConfig>(config);
  const [activeTab, setActiveTab] = useState<'CONFIG' | 'CODE'>('CONFIG');

  useEffect(() => {
    setLocalConfig(config);
  }, [config]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-lg shadow-xl m-4 flex flex-col max-h-[90vh] border border-slate-200 dark:border-slate-700">
        
        {/* Header with Tabs */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
           <h2 className="text-xl font-bold text-slate-900 dark:text-white">System Setup</h2>
           <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
             <button
               onClick={() => setActiveTab('CONFIG')}
               className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${activeTab === 'CONFIG' ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
             >
               CONNECTION
             </button>
             <button
               onClick={() => setActiveTab('CODE')}
               className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${activeTab === 'CODE' ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
             >
               BACKEND CODE
             </button>
           </div>
        </div>
        
        {/* Content Area - Scrollable */}
        <div className="p-6 overflow-y-auto">
          {activeTab === 'CONFIG' ? (
            <ConnectionSettings 
              config={localConfig} 
              onChange={setLocalConfig} 
            />
          ) : (
            <BackendCodeView />
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-b-lg">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(localConfig)}
            className="px-4 py-2 text-sm font-medium text-white bg-slate-900 dark:bg-indigo-600 rounded hover:bg-slate-800 dark:hover:bg-indigo-500 shadow-sm"
          >
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
};