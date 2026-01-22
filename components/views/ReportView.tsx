import React, { useState } from "react";
import { Icon } from "../Icons";
import { ViewHeader } from "../ViewHeader";
import { Button, Card } from "../ui";
import { toast } from "sonner";
import reportData from "../../code-check-report.json";
import { MODULE_COLORS } from "@/constants";
import { EmpirePulseReport } from "../analytics/EmpirePulseReport";
import { useEmpirePulse } from "../../hooks/useEmpirePulse";

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

export const ReportView: React.FC = React.memo(() => {
  const [activeTab, setActiveTab] = useState<"pulse" | "code">("pulse");
  const pulseData = useEmpirePulse();
  const [report] = useState<ReportData | null>(reportData as ReportData);
  const [loading] = useState(false);
  const [error] = useState<string | null>(
    reportData
      ? null
      : "Report data not found. Run 'npm run check:json' first.",
  );
  const [, setCopied] = useState(false);

  const generateMarkdown = () => {
    if (activeTab === "pulse") {
      let md = `# 🛡️ EMPIRE PULSE REPORT\n\n`;
      md += `> *Operational Intelligence Briefing for ${new Date().toLocaleDateString()}*\n\n`;

      md += `## 🤖 Commander's Briefing\n${pulseData.commanderBriefing}\n\n`;

      md += `## 📊 Core Metrics\n`;
      md += `- **Strategic Accuracy**: \`${pulseData.overallAccuracy}%\` (${pulseData.calibrationTrend.toUpperCase()})\n`;
      md += `- **Operational Streak**: \`${pulseData.activeStreak} Days\` 🔥\n`;
      md += `- **Peak State Sessions**: \`${pulseData.peakStateSessions}\` ⚡\n`;
      md += `- **Total XP**: \`${pulseData.totalXp}\` 🏆\n\n`;

      md += `## 🎯 Decision Calibration\n`;
      md += `- **Avg Confidence**: \`${pulseData.decisionInsights.avgConfidence}%\`\n`;
      md += `- **Calibration Gap**: \`${pulseData.decisionInsights.calibrationGap}%\` (${pulseData.decisionInsights.calibrationGap < 15 ? "SYNCED" : "OFFSET"})\n`;
      md += `- **High Impact Decisions**: \`${pulseData.decisionInsights.highImpact}\` / \`${pulseData.decisionInsights.total}\` total\n\n`;

      if (pulseData.topProject) {
        md += `## 🚩 Top Theater: ${pulseData.topProject.name.toUpperCase()}\n`;
        md += `- **Momentum Score**: \`${pulseData.topProject.momentum}\`\n`;
        md += `- **Theater Accuracy**: \`${pulseData.topProject.accuracy}%\`\n`;
        md += `- **Peak Multiplier**: \`${pulseData.topProject.peakStateMultiplier}x\`\n`;
        md += `- **Completion Rate**: \`${pulseData.topProject.completionRate}%\`\n\n`;
      }

      md += `## ⚠️ Risk Assessment\n`;
      md += `- **Stagnant Theaters**: \`${pulseData.projectsAtRisk}\` ${pulseData.projectsAtRisk > 0 ? "🔴" : "🟢"}\n`;
      md += `- **System Status**: \`${pulseData.projectsAtRisk > 0 ? "ENGAGEMENT REQUIRED" : "OPTIMAL"}\`\n\n`;

      md += `--- \n*Generated via MyOps Command Center*`;
      return md;
    }

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

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <ViewHeader
        title="Intelligence Reports"
        subTitle="Operational briefings and system diagnostics"
      >
        <div className="flex items-center gap-2">
          <div className="flex bg-black/5 dark:bg-white/5 p-1 rounded-xl border border-notion-light-border dark:border-white/10">
            <button
              onClick={() => setActiveTab("pulse")}
              className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                activeTab === "pulse"
                  ? "bg-indigo-500 text-white shadow-lg"
                  : "text-notion-light-muted dark:text-white/40 hover:text-notion-light-text dark:hover:text-white/60"
              }`}
            >
              Empire Pulse
            </button>
            <button
              onClick={() => setActiveTab("code")}
              className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                activeTab === "code"
                  ? "bg-indigo-500 text-white shadow-lg"
                  : "text-notion-light-muted dark:text-white/40 hover:text-notion-light-text dark:hover:text-white/60"
              }`}
            >
              Code Health
            </button>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopyMd}
            className="flex items-center gap-2 text-notion-light-text dark:text-notion-dark-text"
          >
            <Icon.Copy size={14} />
            <span className="text-[10px] font-black uppercase tracking-widest">
              Copy MD
            </span>
          </Button>
        </div>
      </ViewHeader>

      {activeTab === "pulse" ? (
        <EmpirePulseReport data={pulseData} />
      ) : (
        <div className="space-y-6">
          {error ? (
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
                variant="danger"
                onClick={() => window.location.reload()}
                className="mx-auto"
              >
                Retry
              </Button>
            </div>
          ) : (
            report?.results.map((res, i) => (
              <Card
                key={i}
                className={`overflow-hidden border-l-4 ${
                  res.success ? "border-l-emerald-500" : "border-l-rose-500"
                }`}
              >
                <div className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-lg ${
                          res.success
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-500"
                            : "bg-rose-500/10 text-rose-600 dark:text-rose-500"
                        }`}
                      >
                        {res.success ? (
                          <Icon.Completed size={20} />
                        ) : (
                          <Icon.Alert size={20} />
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-notion-light-text dark:text-white">
                          {res.name}
                        </h3>
                        <p className="text-[10px] font-bold text-notion-light-muted dark:text-white/40 uppercase tracking-widest">
                          {res.command}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        res.success
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-500"
                          : "bg-rose-500/10 text-rose-600 dark:text-rose-500"
                      }`}
                    >
                      {res.success ? "Passed" : "Failed"}
                    </span>
                  </div>
                  <div className="bg-black/5 dark:bg-black/40 border border-notion-light-border dark:border-white/5 rounded-xl p-4 font-mono text-xs text-notion-light-text/70 dark:text-white/60 overflow-x-auto whitespace-pre">
                    {/* eslint-disable-next-line no-control-regex */}
                    {res.combinedOutput.replace(/\x1b\[\d+m/g, "")}
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
});
