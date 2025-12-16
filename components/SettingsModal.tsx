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
      <div className="bg-white w-full max-w-2xl rounded-lg shadow-xl m-4 flex flex-col max-h-[90vh]">
        
        {/* Header with Tabs */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
           <h2 className="text-xl font-bold text-slate-900">System Setup</h2>
           <div className="flex bg-slate-100 rounded-lg p-1">
             <button
               onClick={() => setActiveTab('CONFIG')}
               className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${activeTab === 'CONFIG' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
             >
               CONNECTION
             </button>
             <button
               onClick={() => setActiveTab('CODE')}
               className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${activeTab === 'CODE' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
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
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50 rounded-b-lg">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(localConfig)}
            className="px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded hover:bg-slate-800 shadow-sm"
          >
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
};