import React, { useState } from "react";
import { GAS_BACKEND_CODE } from "../../assets/gasSource";
import { toast } from "sonner";
import { Icon } from "../Icons";
import { Button, Card, Badge } from "../ui";

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
    <div className="space-y-6">
      <Card className="p-5 border-l-4 border-l-blue-500/50 bg-blue-50/30 dark:bg-blue-900/10">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-1.5 bg-blue-500/10 rounded-lg text-blue-500">
            <Icon.Terminal size={16} />
          </div>
          <h4 className="font-black text-notion-light-text dark:text-notion-dark-text uppercase tracking-widest text-[10px]">
            Deployment Protocol
          </h4>
        </div>

        <ol className="space-y-3 ml-1 text-[11px] leading-relaxed">
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center bg-blue-500/20 text-blue-500 rounded-full font-bold text-[10px]">
              1
            </span>
            <div>
              <strong className="text-notion-light-text dark:text-notion-dark-text block mb-0.5">
                Initialize Variables
              </strong>
              <span className="text-notion-light-muted dark:text-notion-dark-muted">
                Define{" "}
                <code className="bg-notion-light-bg dark:bg-notion-dark-bg px-1.5 py-0.5 rounded-md border border-notion-light-border dark:border-notion-dark-border font-mono text-[10px]">
                  API_SECRET
                </code>{" "}
                and{" "}
                <code className="bg-notion-light-bg dark:bg-notion-dark-bg px-1.5 py-0.5 rounded-md border border-notion-light-border dark:border-notion-dark-border font-mono text-[10px]">
                  SLACK_WEBHOOK_URL
                </code>{" "}
                at the header.
              </span>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center bg-blue-500/20 text-blue-500 rounded-full font-bold text-[10px]">
              2
            </span>
            <div>
              <strong className="text-notion-light-text dark:text-notion-dark-text block mb-0.5">
                Security Clearance
              </strong>
              <span className="text-notion-light-muted dark:text-notion-dark-muted">
                Execute{" "}
                <code className="bg-notion-light-bg dark:bg-notion-dark-bg px-1.5 py-0.5 rounded-md border border-notion-light-border dark:border-notion-dark-border font-mono text-[10px]">
                  testSlack
                </code>{" "}
                and authorize the system.
                <span className="ml-2 font-bold text-blue-600 dark:text-blue-400">
                  Mandatory authorization required.
                </span>
              </span>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center bg-blue-500/20 text-blue-500 rounded-full font-bold text-[10px]">
              3
            </span>
            <div>
              <strong className="text-notion-light-text dark:text-notion-dark-text block mb-0.5">
                System Deployment
              </strong>
              <span className="text-notion-light-muted dark:text-notion-dark-muted">
                Navigate to{" "}
                <span className="font-bold text-notion-light-text dark:text-notion-dark-text">
                  Deploy &gt; Manage Deployments
                </span>
                . Increment to{" "}
                <span className="font-bold text-notion-light-text dark:text-notion-dark-text">
                  New Version
                </span>{" "}
                and execute.
              </span>
            </div>
          </li>
        </ol>
      </Card>

      <div className="relative group">
        <div className="absolute top-3 right-3 flex items-center gap-3 z-10">
          <Badge
            variant="default"
            className="bg-notion-light-bg/80 dark:bg-notion-dark-bg/80 backdrop-blur-sm border-notion-light-border/50 dark:border-notion-dark-border/50"
          >
            CORE_ENGINE.gs
          </Badge>
          <Button
            onClick={handleCopyCode}
            variant="custom"
            className="rounded-xl px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-black text-[10px] uppercase tracking-widest shadow-lg shadow-blue-500/20 transition-all active:scale-95 flex items-center gap-2"
          >
            {copyFeedback === "Copied!" ? (
              <Icon.Check size={14} />
            ) : (
              <Icon.Copy size={14} />
            )}
            {copyFeedback}
          </Button>
        </div>
        <div className="relative overflow-hidden rounded-2xl border border-notion-light-border dark:border-notion-dark-border shadow-inner">
          <textarea
            readOnly
            className="w-full h-[550px] bg-slate-950 text-slate-300 font-mono text-[11px] p-6 focus:outline-none custom-scrollbar leading-relaxed selection:bg-blue-500/30"
            value={GAS_BACKEND_CODE}
          />
          <div className="absolute inset-0 pointer-events-none border border-white/5 rounded-2xl"></div>
        </div>
      </div>
    </div>
  );
};
