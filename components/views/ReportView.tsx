import React, { useState } from "react";
import { Icon, iconProps } from "../Icons";
import { ViewHeader } from "../ViewHeader";
import { Button } from "../ui/Button";
import { toast } from "sonner";
import reportData from "../../code-check-report.json";
import { MODULE_COLORS } from "@/constants";

interface CheckResult {
  name: string;
  command: string;
  success: boolean;
  stdout: string;
  stderr: string;
  combinedOutput: string;
}

interface ReportData {
  results: CheckResult[];
}

export const ReportView: React.FC = () => {
  const [report] = useState<ReportData | null>(reportData as ReportData);
  const [loading] = useState(false);
  const [error] = useState<string | null>(
    reportData
      ? null
      : "Report data not found. Run 'npm run check:json' first.",
  );
  const [copied, setCopied] = useState(false);

  const generateMarkdown = () => {
    if (!report) return "";

    let md = "# Code Check Report\n\n";
    md += `Generated on: ${new Date().toLocaleString()}\n\n`;

    report.results.forEach((res) => {
      md += `## ${res.name}\n`;
      md += `- **Status**: ${res.success ? "✅ PASS" : "❌ FAIL"}\n`;
      md += `- **Command**: \`${res.command}\`\n\n`;
      md += "### Output\n";
      md += "```bash\n";
      // eslint-disable-next-line no-control-regex
      md += res.combinedOutput.replace(/\x1b\[\d+m/g, ""); // Strip ANSI codes
      md += "\n```\n\n";
    });

    return md;
  };

  const handleCopyMd = () => {
    const md = generateMarkdown();
    navigator.clipboard.writeText(md);
    setCopied(true);
    toast.success("Report copied", {
      description: "Markdown has been copied to your clipboard.",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-notion-light-text dark:border-notion-dark-text"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`p-8 text-center bg-notion-light-sidebar dark:bg-notion-dark-sidebar rounded-2xl border ${MODULE_COLORS.error.border}`}
      >
        <Icon.Alert
          className={`mx-auto mb-4 ${MODULE_COLORS.error.text}`}
          size={32}
        />
        <h3 className="text-lg font-bold text-notion-light-text dark:text-notion-dark-text mb-2">
          Error Loading Report
        </h3>
        <p className="text-notion-light-muted dark:text-notion-dark-muted mb-4">
          {error}
        </p>
        <Button
          variant="custom"
          onClick={() => window.location.reload()}
          className="notion-button notion-button-danger mx-auto"
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <ViewHeader
        title="Code Intelligence"
        subTitle="Automated codebase health and architecture report"
      >
        <Button
          variant="custom"
          onClick={handleCopyMd}
          className={`notion-button w-full sm:w-auto justify-center transition-all ${
            copied
              ? `${MODULE_COLORS.crm.bg} ${MODULE_COLORS.crm.border} ${MODULE_COLORS.crm.text}`
              : "notion-button-ghost border border-notion-light-border dark:border-notion-dark-border"
          }`}
        >
          {copied ? (
            <>
              <Icon.Check {...iconProps(14)} />
              COPIED!
            </>
          ) : (
            <>
              <Icon.Copy {...iconProps(14)} />
              COPY
            </>
          )}
        </Button>
      </ViewHeader>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {report?.results.map((res, idx) => (
          <div
            key={idx}
            className={`p-4 rounded-2xl border transition-all duration-300 ${
              res.success
                ? `bg-notion-light-bg dark:bg-notion-dark-bg ${MODULE_COLORS.crm.border}`
                : `bg-notion-light-bg dark:bg-notion-dark-bg ${MODULE_COLORS.error.border}`
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black uppercase tracking-widest opacity-40 text-notion-light-text dark:text-notion-dark-text">
                Check Unit
              </span>
              {res.success ? (
                <Icon.Completed className={MODULE_COLORS.crm.text} size={16} />
              ) : (
                <Icon.Alert className={MODULE_COLORS.error.text} size={16} />
              )}
            </div>
            <h3 className="text-sm font-bold text-notion-light-text dark:text-notion-dark-text">
              {res.name}
            </h3>
            <code className="text-[10px] block mt-1 opacity-60 font-mono text-notion-light-text dark:text-notion-dark-text">
              {res.command}
            </code>
          </div>
        ))}
      </div>

      <div className="space-y-6">
        {report?.results.map((res, idx) => (
          <div
            key={idx}
            className="bg-notion-light-sidebar dark:bg-notion-dark-sidebar rounded-2xl border border-notion-light-border dark:border-notion-dark-border overflow-hidden"
          >
            <div className="px-5 py-3 border-b border-notion-light-border dark:border-notion-dark-border flex items-center justify-between bg-notion-light-bg dark:bg-notion-dark-bg">
              <div className="flex items-center gap-3">
                <div
                  className={`w-2 h-2 rounded-full ${res.success ? MODULE_COLORS.crm.dot : `${MODULE_COLORS.error.dot} animate-pulse`}`}
                ></div>
                <h3 className="text-xs font-bold text-notion-light-text dark:text-notion-dark-text uppercase tracking-wider">
                  {res.name} Output
                </h3>
              </div>
              <span
                className={`text-[9px] font-black px-2 py-0.5 rounded-full ${
                  res.success
                    ? `${MODULE_COLORS.crm.bg} ${MODULE_COLORS.crm.text} border ${MODULE_COLORS.crm.border}`
                    : `${MODULE_COLORS.error.bg} ${MODULE_COLORS.error.text} border ${MODULE_COLORS.error.border}`
                }`}
              >
                {res.success ? "PASSED" : "FAILED"}
              </span>
            </div>
            <div className="p-5 font-mono text-[11px] leading-relaxed overflow-x-auto max-h-[400px] custom-scrollbar bg-black/5 dark:bg-black/20">
              <pre className="text-notion-light-text dark:text-notion-dark-text whitespace-pre-wrap">
                {/* eslint-disable-next-line no-control-regex */}
                {res.combinedOutput.replace(/\x1b\[\d+m/g, "")}
              </pre>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
