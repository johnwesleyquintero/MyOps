
import React, { useState } from 'react';
import { GAS_BACKEND_CODE } from '../../assets/gasSource';

export const BackendCodeView: React.FC = () => {
  const [copyFeedback, setCopyFeedback] = useState<string>('Copy Code');

  const handleCopyCode = () => {
    navigator.clipboard.writeText(GAS_BACKEND_CODE);
    setCopyFeedback('Copied!');
    setTimeout(() => setCopyFeedback('Copy Code'), 2000);
  };

  return (
    <div>
      <div className="bg-amber-50 border border-amber-200 text-amber-800 p-3 rounded mb-4 text-xs">
        <strong>Instruction:</strong> Copy the code below and paste it into <code>Code.gs</code> in your Google Sheet's Apps Script editor. <br/>
        Don't forget to update the <code>API_SECRET</code> and optionally the <code>SLACK_WEBHOOK_URL</code> at the top!
      </div>
      <div className="relative">
        <button 
          onClick={handleCopyCode}
          className="absolute top-2 right-2 text-xs bg-slate-800 text-white px-3 py-1.5 rounded hover:bg-slate-700 transition-colors"
        >
          {copyFeedback}
        </button>
        <textarea
          readOnly
          className="w-full h-80 bg-slate-900 text-slate-300 font-mono text-xs p-4 rounded border border-slate-700 focus:outline-none"
          value={GAS_BACKEND_CODE}
        />
      </div>
    </div>
  );
};
