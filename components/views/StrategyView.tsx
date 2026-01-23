import React, { useState, useMemo } from "react";
import { Icon } from "../Icons";
import { DecisionEntry, AppConfig } from "@/types";
import ReactMarkdown from "react-markdown";
import { ViewHeader } from "../ViewHeader";
import { Button, Spinner, Badge, Card } from "../ui";
import { MODULE_COLORS } from "@/constants";
import { useAwareness } from "@/hooks/useAwareness";
import { ConfirmationModal } from "../ConfirmationModal";

interface StrategyViewProps {
  config: AppConfig;
  decisions: DecisionEntry[];
  isLoading: boolean;
  onSave: (entry: DecisionEntry) => Promise<DecisionEntry>;
  onDelete: (id: string) => Promise<void>;
}

export const StrategyView: React.FC<StrategyViewProps> = React.memo(
  ({ config, decisions, isLoading, onSave, onDelete }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDecision, setEditingDecision] =
      useState<DecisionEntry | null>(null);
    const [decisionToDelete, setDecisionToDelete] = useState<string | null>(
      null,
    );

    const colors = MODULE_COLORS.strategy;
    const tacticColors = MODULE_COLORS.sovereign;
    const crmColors = MODULE_COLORS.crm;

    const handleSave = async (entry: DecisionEntry) => {
      try {
        await onSave(entry);
        setIsModalOpen(false);
        setEditingDecision(null);
      } catch {
        // Error handling is in the hook
      }
    };

    const handleDelete = async () => {
      if (!decisionToDelete) return;
      try {
        await onDelete(decisionToDelete);
        setDecisionToDelete(null);
      } catch {
        // Error handling is in the hook
      }
    };

    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <ViewHeader
          title="Decision Journal"
          subTitle="Strategy & assumption tracking for the one-man empire."
        >
          <Button
            variant="custom"
            onClick={() => {
              setEditingDecision(null);
              setIsModalOpen(true);
            }}
            className={`inline-flex items-center justify-center gap-2 px-4 py-2 ${colors.solidBg} text-white w-full sm:w-auto font-semibold rounded-xl hover:opacity-90 transition-all shadow-lg shadow-black/5 active:scale-95`}
          >
            <Icon.Add size={18} />
            <span className="text-xs font-black uppercase tracking-widest">
              Log Decision
            </span>
          </Button>
        </ViewHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Spinner size="lg" />
          </div>
        ) : decisions.length === 0 ? (
          <div className="text-center py-20 bg-notion-light-sidebar dark:bg-notion-dark-sidebar rounded-2xl border border-dashed border-notion-light-border dark:border-notion-dark-border">
            <Icon.Strategy
              size={48}
              className={`mx-auto mb-4 ${colors.text} opacity-20`}
            />
            <h3 className="text-lg font-medium text-notion-light-text dark:text-notion-dark-text">
              No decisions logged yet
            </h3>
            <p className="text-sm text-notion-light-muted dark:text-notion-dark-muted mt-1">
              Force clarity before execution. Start your first log.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {decisions.map((decision) => (
              <Card
                key={decision.id}
                hoverEffect
                className={`p-6 group ${colors.border.replace("border-", "hover:border-")}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-2 h-2 rounded-full ${decision.status === "PENDING" ? "bg-indigo-500" : colors.dot}`}
                    ></div>
                    <Badge
                      variant="ghost"
                      size="xs"
                      className="!p-0 opacity-60"
                    >
                      {decision.date}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setEditingDecision(decision);
                        setIsModalOpen(true);
                      }}
                      className={colors.hoverBg}
                    >
                      <Icon.Edit size={14} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDecisionToDelete(decision.id)}
                      className="hover:bg-red-500/10 hover:text-red-500"
                    >
                      <Icon.Delete size={14} />
                    </Button>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-notion-light-text dark:text-notion-dark-text mb-2">
                  <Badge
                    variant="custom"
                    size="xs"
                    className={`mr-2 px-1.5 py-0.5 rounded text-[10px] font-black uppercase tracking-tighter ${decision.decisionType === "strategy" ? `${colors.bg} ${colors.text} border ${colors.border}` : `${tacticColors.bg} ${tacticColors.text} border ${tacticColors.border}`}`}
                  >
                    {decision.decisionType}
                  </Badge>
                  {decision.title}
                </h3>

                <div className="prose prose-sm dark:prose-invert max-w-none line-clamp-3 mb-4 text-sm text-notion-light-muted dark:text-notion-dark-muted">
                  <ReactMarkdown>{decision.context}</ReactMarkdown>
                </div>

                {decision.predictedImpact && (
                  <div className="mb-4 flex items-start gap-2">
                    <Icon.Zap
                      size={14}
                      className={`${colors.text} mt-0.5 opacity-70`}
                    />
                    <p className="text-[11px] font-medium text-notion-light-text dark:text-notion-dark-text italic">
                      {decision.predictedImpact}
                    </p>
                  </div>
                )}

                {decision.assumptions && decision.assumptions.length > 0 && (
                  <div className="mb-4">
                    <Badge
                      variant="ghost"
                      size="xs"
                      className="!p-0 font-black uppercase tracking-[0.2em] opacity-40 mb-1 block"
                    >
                      Assumptions
                    </Badge>
                    <div className="flex flex-wrap gap-1">
                      {decision.assumptions.map((a, i) => (
                        <Badge
                          key={i}
                          variant="outline"
                          size="xs"
                          className="!normal-case !tracking-normal font-medium"
                        >
                          {a}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {decision.actualOutcome && (
                  <div
                    className={`mb-4 p-3 ${crmColors.bg} border ${crmColors.border} rounded-xl`}
                  >
                    <Badge
                      variant="ghost"
                      size="xs"
                      className={`!p-0 font-black uppercase tracking-[0.2em] ${crmColors.text} mb-1 block`}
                    >
                      Actual Outcome
                    </Badge>
                    <p className="text-sm text-notion-light-text dark:text-notion-dark-text italic">
                      {decision.actualOutcome}
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-between mt-6 pt-4 border-t border-notion-light-border dark:border-notion-dark-border">
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col">
                      <Badge
                        variant="ghost"
                        size="xs"
                        className="!p-0 font-black uppercase tracking-[0.2em] opacity-40 mb-1 block"
                      >
                        Impact
                      </Badge>
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <div
                            key={i}
                            className={`w-3 h-1 rounded-full ${i <= decision.impact ? colors.dot : "bg-notion-light-border dark:border-notion-dark-border"}`}
                          ></div>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col">
                      <Badge
                        variant="ghost"
                        size="xs"
                        className="!p-0 font-black uppercase tracking-[0.2em] opacity-40 mb-1 block"
                      >
                        Confidence
                      </Badge>
                      <span className="text-[10px] font-mono font-bold">
                        {decision.confidenceScore || 70}%
                      </span>
                    </div>
                  </div>
                  <Badge
                    variant="custom"
                    size="xs"
                    className={`px-2 py-0.5 ${colors.bg} ${colors.text} rounded-full uppercase tracking-wider font-bold`}
                  >
                    {decision.status}
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Basic Modal Implementation */}
        {isModalOpen && (
          <DecisionModal
            onClose={() => setIsModalOpen(false)}
            onSave={handleSave}
            initialData={editingDecision}
            config={config}
          />
        )}

        <ConfirmationModal
          isOpen={!!decisionToDelete}
          onClose={() => setDecisionToDelete(null)}
          onConfirm={handleDelete}
          title="Delete Decision Log"
          confirmText="Delete"
        >
          Are you sure you want to abort this decision log? This action cannot
          be undone.
        </ConfirmationModal>
      </div>
    );
  },
);

interface DecisionModalProps {
  onClose: () => void;
  onSave: (entry: DecisionEntry) => Promise<void>;
  initialData: DecisionEntry | null;
  config: AppConfig;
}

const DecisionModal: React.FC<DecisionModalProps> = ({
  onClose,
  onSave,
  initialData,
  config,
}) => {
  const { mentalStates } = useAwareness(config);

  const currentBiometrics = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    const todaysState = mentalStates.find((m) => m.date === today);
    return todaysState
      ? {
          energy: todaysState.energy,
          clarity: todaysState.clarity,
        }
      : undefined;
  }, [mentalStates]);

  const [formData, setFormData] = useState<DecisionEntry>(
    initialData || {
      id: "",
      date: new Date().toISOString().split("T")[0],
      title: "",
      context: "",
      options: [],
      decision: "",
      expectedOutcome: "",
      actualOutcome: "",
      assumptions: [],
      decisionType: "tactic",
      reviewDate: "",
      status: "PENDING",
      impact: 3,
      confidenceScore: 70,
      predictedImpact: "",
      tags: [],
    },
  );

  const displayBiometrics = formData.biometricContext || currentBiometrics;

  const handleLocalSave = () => {
    const finalData = {
      ...formData,
      biometricContext: formData.biometricContext || currentBiometrics,
    };
    onSave(finalData);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <Card
        padding="none"
        className="w-full max-w-2xl rounded-2xl shadow-2xl border-none overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]"
      >
        <div className="px-6 py-4 border-b border-notion-light-border dark:border-notion-dark-border flex items-center justify-between bg-notion-light-sidebar/50 dark:bg-notion-dark-sidebar/50 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <div
              className={`p-2 bg-notion-light-bg dark:bg-notion-dark-bg rounded-lg shadow-sm border border-notion-light-border dark:border-notion-dark-border ${MODULE_COLORS.strategy.text}`}
            >
              <Icon.Strategy size={16} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-notion-light-text dark:text-notion-dark-text uppercase tracking-widest">
                {initialData ? "Strategic Intelligence" : "New Decision Log"}
              </h2>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="w-9 h-9 text-notion-light-muted hover:bg-notion-light-hover dark:hover:bg-notion-dark-hover transition-all rounded-lg"
          >
            <Icon.Close size={18} />
          </Button>
        </div>

        <div className="p-8 space-y-8 overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-1.5 ml-1">
                <Icon.Project size={12} className="opacity-40" />
                <span className="text-[10px] font-black uppercase tracking-widest opacity-40">
                  Decision Type
                </span>
              </div>
              <div className="relative">
                <select
                  value={formData.decisionType}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      decisionType: e.target.value as "strategy" | "tactic",
                    })
                  }
                  className="w-full border border-notion-light-border dark:border-notion-dark-border rounded-xl pl-4 pr-10 py-2.5 text-sm font-bold focus:outline-none focus:ring-1 focus:ring-blue-500/30 bg-notion-light-bg dark:bg-notion-dark-bg text-notion-light-text dark:text-notion-dark-text appearance-none cursor-pointer transition-all shadow-sm"
                >
                  <option value="tactic">Tactic</option>
                  <option value="strategy">Strategy</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-notion-light-muted opacity-40">
                  <Icon.ChevronDown size={14} />
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-1.5 ml-1">
                <Icon.Date size={12} className="opacity-40" />
                <span className="text-[10px] font-black uppercase tracking-widest opacity-40">
                  Deployment Date
                </span>
              </div>
              <input
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                className="w-full border border-notion-light-border dark:border-notion-dark-border rounded-xl px-4 py-2 text-sm font-bold focus:outline-none focus:ring-1 focus:ring-blue-500/30 bg-notion-light-bg dark:bg-notion-dark-bg text-notion-light-text dark:text-notion-dark-text transition-all shadow-sm"
              />
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-1.5 ml-1">
                <Icon.History size={12} className="opacity-40" />
                <span className="text-[10px] font-black uppercase tracking-widest opacity-40">
                  Protocol Review
                </span>
              </div>
              <input
                type="date"
                value={formData.reviewDate}
                onChange={(e) =>
                  setFormData({ ...formData, reviewDate: e.target.value })
                }
                className="w-full border border-notion-light-border dark:border-notion-dark-border rounded-xl px-4 py-2 text-sm font-bold focus:outline-none focus:ring-1 focus:ring-blue-500/30 bg-notion-light-bg dark:bg-notion-dark-bg text-notion-light-text dark:text-notion-dark-text transition-all shadow-sm"
              />
            </div>
          </div>

          {displayBiometrics && (
            <div className="bg-indigo-500/5 border border-indigo-500/20 p-4 rounded-2xl flex items-center justify-between animate-in slide-in-from-top-2 duration-300">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-500/10 rounded-xl text-indigo-500 shadow-sm">
                  <Icon.Activity size={18} />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500/60 block">
                    Cognitive Snapshot
                  </span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span
                      className={`text-xs font-black capitalize ${displayBiometrics.energy === "high" ? "text-emerald-500" : displayBiometrics.energy === "low" ? "text-amber-500" : "text-indigo-400"}`}
                    >
                      {displayBiometrics.energy} Energy
                    </span>
                    <span className="w-1 h-1 rounded-full bg-indigo-500/30"></span>
                    <span
                      className={`text-xs font-black capitalize ${displayBiometrics.clarity === "sharp" ? "text-emerald-500" : displayBiometrics.clarity === "foggy" ? "text-amber-500" : "text-indigo-400"}`}
                    >
                      {displayBiometrics.clarity} Clarity
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[9px] text-indigo-500/40 font-black uppercase tracking-tighter block">
                  Timestamp
                </span>
                <span className="text-[10px] font-mono font-bold text-indigo-500/60">
                  REALTIME_SYNC
                </span>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-1.5 ml-1">
              <Icon.Target size={12} className="opacity-40" />
              <span className="text-[10px] font-black uppercase tracking-widest opacity-40">
                Strategic Objective
              </span>
            </div>
            <input
              type="text"
              placeholder="What are you deciding?"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="w-full border border-notion-light-border dark:border-notion-dark-border rounded-xl px-4 py-2.5 text-sm font-bold focus:outline-none focus:ring-1 focus:ring-blue-500/30 bg-notion-light-bg dark:bg-notion-dark-bg text-notion-light-text dark:text-notion-dark-text transition-all shadow-sm"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-1.5 ml-1">
              <Icon.Tag size={12} className="opacity-40" />
              <span className="text-[10px] font-black uppercase tracking-widest opacity-40">
                Core Assumptions (Comma separated)
              </span>
            </div>
            <input
              type="text"
              placeholder="e.g. Market will grow, No new competitors..."
              value={(formData.assumptions || []).join(", ")}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  assumptions: e.target.value
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean),
                })
              }
              className="w-full border border-notion-light-border dark:border-notion-dark-border rounded-xl px-4 py-2.5 text-sm font-bold focus:outline-none focus:ring-1 focus:ring-blue-500/30 bg-notion-light-bg dark:bg-notion-dark-bg text-notion-light-text dark:text-notion-dark-text transition-all shadow-sm"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-1.5 ml-1">
              <Icon.Notes size={12} className="opacity-40" />
              <span className="text-[10px] font-black uppercase tracking-widest opacity-40">
                Intelligence Brief & Alternatives
              </span>
            </div>
            <textarea
              placeholder="Why are you making this decision? What are the alternatives?"
              value={formData.context}
              onChange={(e) =>
                setFormData({ ...formData, context: e.target.value })
              }
              className="w-full border border-notion-light-border dark:border-notion-dark-border rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-1 focus:ring-blue-500/30 bg-notion-light-bg dark:bg-notion-dark-bg text-notion-light-text dark:text-notion-dark-text min-h-[120px] resize-none transition-all shadow-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-1.5 ml-1">
                <Icon.Zap size={12} className="opacity-40" />
                <span className="text-[10px] font-black uppercase tracking-widest opacity-40">
                  Projected Outcome
                </span>
              </div>
              <textarea
                placeholder="What do you think will happen?"
                value={formData.expectedOutcome}
                onChange={(e) =>
                  setFormData({ ...formData, expectedOutcome: e.target.value })
                }
                className="w-full border border-notion-light-border dark:border-notion-dark-border rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-1 focus:ring-blue-500/30 bg-notion-light-bg dark:bg-notion-dark-bg text-notion-light-text dark:text-notion-dark-text min-h-[100px] resize-none transition-all shadow-sm"
              />
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-1.5 ml-1">
                <Icon.Check size={12} className="opacity-40" />
                <span className="text-[10px] font-black uppercase tracking-widest opacity-40">
                  Actual Outcome
                </span>
              </div>
              <textarea
                placeholder="What actually happened?"
                value={formData.actualOutcome}
                onChange={(e) =>
                  setFormData({ ...formData, actualOutcome: e.target.value })
                }
                className="w-full border border-notion-light-border dark:border-notion-dark-border rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-1 focus:ring-blue-500/30 bg-notion-light-bg dark:bg-notion-dark-bg text-notion-light-text dark:text-notion-dark-text min-h-[100px] resize-none transition-all shadow-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 mb-1.5 ml-1">
                  <Icon.Project size={12} className="opacity-40" />
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-40">
                    Impact (1-5)
                  </span>
                </div>
                <span className="text-[10px] font-black text-blue-500">
                  {formData.impact}/5
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="5"
                step="1"
                value={formData.impact}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    impact: (parseInt(e.target.value) ||
                      3) as DecisionEntry["impact"],
                  })
                }
                className="w-full accent-blue-500 h-1.5 bg-notion-light-border dark:bg-notion-dark-border rounded-full appearance-none cursor-pointer"
              />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 mb-1.5 ml-1">
                  <Icon.Activity size={12} className="opacity-40" />
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-40">
                    Confidence Score (1-100%)
                  </span>
                </div>
                <span className="text-[10px] font-black text-indigo-500">
                  {formData.confidenceScore}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={formData.confidenceScore || 70}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    confidenceScore: parseInt(e.target.value),
                  })
                }
                className="w-full accent-indigo-500 h-1.5 bg-notion-light-border dark:bg-notion-dark-border rounded-full appearance-none cursor-pointer"
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-1.5 ml-1">
              <Icon.Terminal size={12} className="opacity-40" />
              <span className="text-[10px] font-black uppercase tracking-widest opacity-40">
                Operational Status
              </span>
            </div>
            <select
              value={formData.status}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  status: e.target.value as DecisionEntry["status"],
                })
              }
              className="w-full border border-notion-light-border dark:border-notion-dark-border rounded-xl px-4 py-2.5 text-sm font-bold focus:outline-none focus:ring-1 focus:ring-blue-500/30 bg-notion-light-bg dark:bg-notion-dark-bg text-notion-light-text dark:text-notion-dark-text appearance-none cursor-pointer transition-all shadow-sm"
            >
              <option value="PENDING">Pending Approval</option>
              <option value="REVIEWED">Post-Mission Review</option>
              <option value="ARCHIVED">Archived intelligence</option>
            </select>
          </div>
        </div>

        <div className="px-8 py-4 border-t border-notion-light-border dark:border-notion-dark-border flex items-center justify-end gap-4 bg-notion-light-sidebar/50 dark:bg-notion-dark-sidebar/50 backdrop-blur-md">
          <Button
            variant="ghost"
            onClick={onClose}
            className="text-[10px] font-black uppercase tracking-widest text-notion-light-muted dark:text-notion-dark-muted px-6 py-2"
          >
            Abort
          </Button>
          <Button
            variant="custom"
            onClick={handleLocalSave}
            className={`px-8 py-2 ${MODULE_COLORS.strategy.solidBg} text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-black/5 hover:opacity-90 transition-all active:scale-95`}
          >
            {initialData ? "Sync Intelligence" : "Execute Deployment"}
          </Button>
        </div>
      </Card>
    </div>
  );
};
