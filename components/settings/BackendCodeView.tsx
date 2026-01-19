import React, { useState } from "react";
import { GAS_BACKEND_CODE } from "../../assets/gasSource";
import { toast } from "sonner";
import { Icon } from "../Icons";

export const BackendCodeView: React.FC = () => {
  const [copyFeedback, setCopyFeedback] = useState<string>("Copy Code");

  const handleCopyCode = () => {
    navigator.clipboard.writeText(GAS_BACKEND_CODE);
    setCopyFeedback("Copied!");
    toast.success("Backend code copied", {
      description: "Paste this into your Google Apps Script editor.",
      icon: <Icon.Copy size={14} />,
    });
    setTimeout(() => setCopyFeedback("Copy Code"), 2000);
  };

  return (
    <div>
      <div className="bg-notion-light-hover dark:bg-notion-dark-hover border border-notion-light-border dark:border-notion-dark-border p-4 rounded-lg mb-6 text-xs space-y-3">
        <h4 className="font-bold text-notion-light-text dark:text-notion-dark-text uppercase tracking-wider text-[10px]">
          Deployment Checklist
        </h4>
        <ol className="list-decimal list-inside space-y-1.5 ml-1 text-notion-light-muted dark:text-notion-dark-muted">
          <li>
            <strong className="text-notion-light-text dark:text-notion-dark-text">
              Set Variables:
            </strong>{" "}
            Update{" "}
            <code className="bg-notion-light-bg dark:bg-notion-dark-bg px-1 rounded border border-notion-light-border dark:border-notion-dark-border">
              API_SECRET
            </code>{" "}
            and{" "}
            <code className="bg-notion-light-bg dark:bg-notion-dark-bg px-1 rounded border border-notion-light-border dark:border-notion-dark-border">
              SLACK_WEBHOOK_URL
            </code>{" "}
            at the top.
          </li>
          <li>
            <strong className="text-notion-light-text dark:text-notion-dark-text">
              Authorize Slack:
            </strong>{" "}
            Select the{" "}
            <code className="bg-notion-light-bg dark:bg-notion-dark-bg px-1 rounded border border-notion-light-border dark:border-notion-dark-border">
              testSlack
            </code>{" "}
            function in the editor toolbar and click <strong>Run</strong>.{" "}
            <br />
            <span className="ml-5 font-bold text-blue-600 dark:text-blue-400">
              You MUST accept the permissions popup.
            </span>
          </li>
          <li>
            <strong className="text-notion-light-text dark:text-notion-dark-text">
              Deploy New Version:
            </strong>{" "}
            Go to <strong>Deploy &gt; Manage Deployments</strong>. Click the
            pencil icon (Edit), select <strong>New Version</strong>, and click{" "}
            <strong>Deploy</strong>.
          </li>
          <li>
            <strong className="text-notion-light-text dark:text-notion-dark-text">
              Copy URL:
            </strong>{" "}
            Ensure the Web App URL hasn't changed.
          </li>
        </ol>
      </div>

      <div className="relative group">
        <div className="absolute top-2 right-2 flex gap-2">
          <span className="text-[10px] font-bold text-notion-light-muted dark:text-notion-dark-muted py-1 px-2 bg-notion-light-bg dark:bg-notion-dark-bg border border-notion-light-border dark:border-notion-dark-border rounded">
            Code.gs
          </span>
          <button
            onClick={handleCopyCode}
            className="text-[10px] font-bold bg-notion-light-text dark:bg-notion-dark-text text-white dark:text-black px-3 py-1 rounded hover:opacity-90 transition-all shadow-sm"
          >
            {copyFeedback}
          </button>
        </div>
        <textarea
          readOnly
          className="w-full h-[500px] bg-notion-light-sidebar dark:bg-notion-dark-sidebar text-notion-light-text dark:text-notion-dark-text font-mono text-xs p-4 rounded-lg border border-notion-light-border dark:border-notion-dark-border focus:outline-none custom-scrollbar leading-relaxed"
          value={GAS_BACKEND_CODE}
        />
      </div>
    </div>
  );
};
