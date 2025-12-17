
import React from 'react';
import { AppConfig } from '../../types';

interface ConnectionSettingsProps {
  config: AppConfig;
  onChange: (config: AppConfig) => void;
}

export const ConnectionSettings: React.FC<ConnectionSettingsProps> = ({ config, onChange }) => {
  return (
    <div className="space-y-6">
      {/* Theme Setting */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Interface Theme</label>
        <div className="flex gap-4">
          <button
            onClick={() => onChange({ ...config, theme: 'LIGHT' })}
            className={`flex-1 py-3 px-4 rounded text-sm font-medium border transition-all ${config.theme === 'LIGHT' ? 'bg-indigo-50 text-indigo-700 border-indigo-200 ring-1 ring-indigo-200 dark:bg-indigo-900/50 dark:text-indigo-300 dark:border-indigo-700' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
          >
            <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                Light
            </span>
          </button>
          <button
            onClick={() => onChange({ ...config, theme: 'DARK' })}
            className={`flex-1 py-3 px-4 rounded text-sm font-medium border transition-all ${config.theme === 'DARK' ? 'bg-indigo-50 text-indigo-700 border-indigo-200 ring-1 ring-indigo-200 dark:bg-slate-700 dark:text-indigo-300 dark:border-indigo-500' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
          >
             <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                Dark
             </span>
          </button>
        </div>
      </div>

      <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Operation Mode</label>
        <div className="flex gap-4">
          <button
            onClick={() => onChange({ ...config, mode: 'DEMO' })}
            className={`flex-1 py-3 px-4 rounded text-sm font-medium border transition-all ${config.mode === 'DEMO' ? 'bg-slate-900 text-white border-slate-900 shadow-md dark:bg-white dark:text-slate-900' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
          >
            Demo (Local)
          </button>
          <button
            onClick={() => onChange({ ...config, mode: 'LIVE' })}
            className={`flex-1 py-3 px-4 rounded text-sm font-medium border transition-all ${config.mode === 'LIVE' ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
          >
            Live (Google Sheets)
          </button>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
          {config.mode === 'DEMO' 
            ? "Data is stored in your browser's LocalStorage. Good for testing." 
            : "Data is synced with your sovereign Google Sheet."}
        </p>
      </div>

      {config.mode === 'LIVE' && (
        <div className="space-y-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded border border-slate-200 dark:border-slate-700">
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">GAS Web App URL</label>
            <input
              type="text"
              placeholder="https://script.google.com/macros/s/..."
              className="w-full border border-slate-300 dark:border-slate-600 rounded px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
              value={config.gasDeploymentUrl}
              onChange={(e) => onChange({ ...config, gasDeploymentUrl: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">API Secret Token</label>
            <input
              type="password"
              placeholder="e.g. secret-key-123"
              className="w-full border border-slate-300 dark:border-slate-600 rounded px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 font-mono bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
              value={config.apiToken || ''}
              onChange={(e) => onChange({ ...config, apiToken: e.target.value })}
            />
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Must match the <code>API_SECRET</code> variable in your Google Apps Script.
            </p>
          </div>
        </div>
      )}

      {/* AI Configuration */}
      <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">Neural Link (AI)</label>
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded border border-slate-200 dark:border-slate-700">
            <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Gemini API Key</label>
                <input
                    type="password"
                    placeholder="AIzaSy..."
                    className="w-full border border-slate-300 dark:border-slate-600 rounded px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 font-mono bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                    value={config.geminiApiKey || ''}
                    onChange={(e) => onChange({ ...config, geminiApiKey: e.target.value })}
                />
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                    Required for WesAI functionality. Your key is stored locally in your browser.
                    <br />
                    <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1 mt-1">
                        Get a free key from Google AI Studio
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                    </a>
                </p>
            </div>
        </div>
      </div>
    </div>
  );
};
