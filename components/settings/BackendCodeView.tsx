
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
      <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-lg mb-6 text-xs space-y-2">
        <h4 className="font-bold text-amber-900 uppercase tracking-wide">Deployment Checklist</h4>
        <ol className="list-decimal list-inside space-y-1 ml-1 text-amber-800/90">
          <li><strong>Set Variables:</strong> Update <code>API_SECRET</code> and <code>SLACK_WEBHOOK_URL</code> at the top.</li>
          <li><strong>Authorize Slack (Critical):</strong> Select the <code>testSlack</code> function in the editor toolbar and click <strong>Run</strong>. <br/><span className="ml-5 font-bold text-amber-900">You MUST accept the permissions popup.</span></li>
          <li><strong>Deploy New Version:</strong> Go to <strong>Deploy &gt; Manage Deployments</strong>. Click the pencil icon (Edit), select <strong>New Version</strong>, and click <strong>Deploy</strong>.</li>
          <li><strong>Copy URL:</strong> Ensure the Web App URL hasn't changed (it shouldn't if you edit the existing deployment).</li>
        </ol>
      </div>

      <div className="relative group">
        <div className="absolute top-2 right-2 flex gap-2">
            <span className="text-[10px] text-slate-500 py-1.5 px-2 bg-slate-800/10 rounded">Code.gs</span>
            <button 
            onClick={handleCopyCode}
            className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded hover:bg-indigo-500 transition-colors shadow-sm"
            >
            {copyFeedback}
            </button>
        </div>
        <textarea
          readOnly
          className="w-full h-[500px] bg-slate-900 text-slate-300 font-mono text-xs p-4 rounded-lg border border-slate-700 focus:outline-none custom-scrollbar leading-relaxed"
          value={GAS_BACKEND_CODE}
        />
      </div>
    </div>
  );
};
