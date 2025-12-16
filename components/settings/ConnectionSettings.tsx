import React from 'react';
import { AppConfig } from '../../types';

interface ConnectionSettingsProps {
  config: AppConfig;
  onChange: (config: AppConfig) => void;
}

export const ConnectionSettings: React.FC<ConnectionSettingsProps> = ({ config, onChange }) => {
  return (
    <div className="space-y-6">
      <div className="border-t border-slate-200 pt-4">
        <label className="block text-sm font-semibold text-slate-700 mb-2">Operation Mode</label>
        <div className="flex gap-4">
          <button
            onClick={() => onChange({ ...config, mode: 'DEMO' })}
            className={`flex-1 py-3 px-4 rounded text-sm font-medium border transition-all ${config.mode === 'DEMO' ? 'bg-slate-900 text-white border-slate-900 shadow-md' : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'}`}
          >
            Demo (Local)
          </button>
          <button
            onClick={() => onChange({ ...config, mode: 'LIVE' })}
            className={`flex-1 py-3 px-4 rounded text-sm font-medium border transition-all ${config.mode === 'LIVE' ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'}`}
          >
            Live (Google Sheets)
          </button>
        </div>
        <p className="text-xs text-slate-500 mt-2">
          {config.mode === 'DEMO' 
            ? "Data is stored in your browser's LocalStorage. Good for testing." 
            : "Data is synced with your sovereign Google Sheet."}
        </p>
      </div>

      {config.mode === 'LIVE' && (
        <div className="space-y-4 p-4 bg-slate-50 rounded border border-slate-200">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">GAS Web App URL</label>
            <input
              type="text"
              placeholder="https://script.google.com/macros/s/..."
              className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
              value={config.gasDeploymentUrl}
              onChange={(e) => onChange({ ...config, gasDeploymentUrl: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">API Secret Token</label>
            <input
              type="password"
              placeholder="e.g. secret-key-123"
              className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 font-mono"
              value={config.apiToken || ''}
              onChange={(e) => onChange({ ...config, apiToken: e.target.value })}
            />
            <p className="text-xs text-slate-500 mt-1">
              Must match the <code>API_SECRET</code> variable in your Google Apps Script.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};