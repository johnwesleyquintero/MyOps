import React, { useState, useEffect, useCallback } from "react";
import { Icon } from "../Icons";
import { DecisionEntry, AppConfig } from "@/types";
import {
  fetchDecisions,
  addDecision,
  updateDecision,
  deleteDecision,
} from "@/services/strategyService";
import ReactMarkdown from "react-markdown";
import { ViewHeader } from "../ViewHeader";
import { Button } from "../ui/Button";
import { toast } from "sonner";
import { MODULE_COLORS } from "@/constants";

interface StrategyViewProps {
  config: AppConfig;
}

export const StrategyView: React.FC<StrategyViewProps> = ({ config }) => {
  const [decisions, setDecisions] = useState<DecisionEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDecision, setEditingDecision] = useState<DecisionEntry | null>(
    null,
  );

  const colors = MODULE_COLORS.strategy;
  const tacticColors = MODULE_COLORS.sovereign;
  const crmColors = MODULE_COLORS.crm;

  const loadDecisions = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchDecisions(config);
      setDecisions(data);
    } catch (error) {
      console.error("Failed to load decisions", error);
    } finally {
      setIsLoading(false);
    }
  }, [config]);

  useEffect(() => {
    loadDecisions();
  }, [loadDecisions]);

  const handleSave = async (entry: DecisionEntry) => {
    try {
      if (entry.id) {
        await updateDecision(entry, config);
        toast.success("Decision updated");
      } else {
        await addDecision(entry, config);
        toast.success("Decision logged");
      }
      loadDecisions();
      setIsModalOpen(false);
      setEditingDecision(null);
    } catch (error) {
      console.error("Failed to save decision", error);
      toast.error("Failed to save decision");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to abort this decision log?")) {
      try {
        await deleteDecision(id, config);
        loadDecisions();
        toast.success("Decision deleted");
      } catch (error) {
        console.error("Failed to delete decision", error);
        toast.error("Failed to delete decision");
      }
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
          className={`notion-button ${colors.bg.replace("/10", "").replace("/20", "")} text-white w-full sm:w-auto justify-center flex items-center gap-2 hover:opacity-90 transition-all shadow-lg shadow-black/5`}
        >
          <Icon.Add size={18} />
          <span>Log Decision</span>
        </Button>
      </ViewHeader>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div
            className={`animate-spin rounded-full h-8 w-8 border-b-2 ${colors.text}`}
          ></div>
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
            <div
              key={decision.id}
              className={`bg-notion-light-bg dark:bg-notion-dark-bg border border-notion-light-border dark:border-notion-dark-border rounded-2xl p-6 hover:shadow-lg transition-all group ${colors.border.replace("border-", "hover:border-")}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-2 h-2 rounded-full ${decision.status === "PENDING" ? "bg-amber-500" : crmColors.dot}`}
                  ></div>
                  <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">
                    {decision.date}
                  </span>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="custom"
                    onClick={() => {
                      setEditingDecision(decision);
                      setIsModalOpen(true);
                    }}
                    className={`p-1.5 ${colors.hoverBg} rounded-lg text-notion-light-muted dark:text-notion-dark-muted ${colors.text.replace("text-", "hover:text-")}`}
                  >
                    <Icon.Edit size={14} />
                  </Button>
                  <Button
                    variant="custom"
                    onClick={() => handleDelete(decision.id)}
                    className={`p-1.5 ${MODULE_COLORS.error.bg.replace("bg-", "hover:bg-")} ${MODULE_COLORS.error.text.replace("text-", "hover:text-")} rounded-lg text-notion-light-muted dark:text-notion-dark-muted transition-all`}
                  >
                    <Icon.Delete size={14} />
                  </Button>
                </div>
              </div>

              <h3 className="text-lg font-bold text-notion-light-text dark:text-notion-dark-text mb-2">
                <span
                  className={`mr-2 px-1.5 py-0.5 rounded text-[10px] font-black uppercase tracking-tighter ${decision.decisionType === "strategy" ? `${colors.bg} ${colors.text} border ${colors.border}` : `${tacticColors.bg} ${tacticColors.text} border ${tacticColors.border}`}`}
                >
                  {decision.decisionType}
                </span>
                {decision.title}
              </h3>

              <div className="prose prose-sm dark:prose-invert max-w-none line-clamp-3 mb-4 text-sm text-notion-light-muted dark:text-notion-dark-muted">
                <ReactMarkdown>{decision.context}</ReactMarkdown>
              </div>

              {decision.assumptions && decision.assumptions.length > 0 && (
                <div className="mb-4">
                  <span className="text-[10px] font-bold uppercase tracking-widest opacity-40 block mb-1">
                    Assumptions
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {decision.assumptions.map((a, i) => (
                      <span
                        key={i}
                        className="text-[10px] bg-notion-light-sidebar dark:bg-notion-dark-sidebar px-1.5 py-0.5 rounded border border-notion-light-border dark:border-notion-dark-border"
                      >
                        {a}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {decision.actualOutcome && (
                <div
                  className={`mb-4 p-3 ${crmColors.bg} border ${crmColors.border} rounded-xl`}
                >
                  <span
                    className={`text-[10px] font-bold uppercase tracking-widest ${crmColors.text} block mb-1`}
                  >
                    Actual Outcome
                  </span>
                  <p className="text-sm text-notion-light-text dark:text-notion-dark-text italic">
                    {decision.actualOutcome}
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between mt-6 pt-4 border-t border-notion-light-border dark:border-notion-dark-border">
                <div className="flex items-center gap-4">
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-wider opacity-50">
                      Impact
                    </span>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div
                          key={i}
                          className={`w-3 h-1 rounded-full ${i <= decision.impact ? colors.dot : "bg-notion-light-border dark:bg-notion-dark-border"}`}
                        ></div>
                      ))}
                    </div>
                  </div>
                </div>
                <div
                  className={`text-[10px] font-bold px-2 py-0.5 ${colors.bg} ${colors.text} rounded-full uppercase tracking-wider`}
                >
                  {decision.status}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Basic Modal Implementation */}
      {isModalOpen && (
        <DecisionModal
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
          initialData={editingDecision}
        />
      )}
    </div>
  );
};

interface DecisionModalProps {
  onClose: () => void;
  onSave: (entry: DecisionEntry) => void;
  initialData: DecisionEntry | null;
}

const DecisionModal: React.FC<DecisionModalProps> = ({
  onClose,
  onSave,
  initialData,
}) => {
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
      tags: [],
    },
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-notion-light-bg dark:bg-notion-dark-bg w-full max-w-2xl rounded-2xl shadow-2xl border border-notion-light-border dark:border-notion-dark-border overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-notion-light-border dark:border-notion-dark-border flex items-center justify-between bg-notion-light-sidebar dark:bg-notion-dark-sidebar">
          <h2 className="text-lg font-bold text-notion-light-text dark:text-notion-dark-text">
            {initialData ? "Edit Decision Log" : "New Decision Log"}
          </h2>
          <Button
            variant="custom"
            onClick={onClose}
            className="p-2 hover:bg-notion-light-border dark:hover:bg-notion-dark-border rounded-full transition-colors"
          >
            <Icon.Close size={20} />
          </Button>
        </div>

        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest opacity-60">
                Type
              </label>
              <select
                value={formData.decisionType}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    decisionType: e.target.value as "strategy" | "tactic",
                  })
                }
                className="notion-input w-full"
              >
                <option value="tactic">Tactic</option>
                <option value="strategy">Strategy</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest opacity-60">
                Date
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                className="notion-input w-full"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest opacity-60">
                Review Date
              </label>
              <input
                type="date"
                value={formData.reviewDate}
                onChange={(e) =>
                  setFormData({ ...formData, reviewDate: e.target.value })
                }
                className="notion-input w-full"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest opacity-60">
              Title
            </label>
            <input
              type="text"
              placeholder="What are you deciding?"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="notion-input w-full"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest opacity-60">
              Assumptions (Comma separated)
            </label>
            <input
              type="text"
              placeholder="e.g. Market will grow, No new competitors..."
              value={formData.assumptions.join(", ")}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  assumptions: e.target.value
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean),
                })
              }
              className="notion-input w-full"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest opacity-60">
              Context & Options
            </label>
            <textarea
              placeholder="Why are you making this decision? What are the alternatives?"
              value={formData.context}
              onChange={(e) =>
                setFormData({ ...formData, context: e.target.value })
              }
              className="notion-input w-full min-h-[100px] resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest opacity-60">
                Expected Outcome
              </label>
              <textarea
                placeholder="What do you think will happen?"
                value={formData.expectedOutcome}
                onChange={(e) =>
                  setFormData({ ...formData, expectedOutcome: e.target.value })
                }
                className="notion-input w-full min-h-[80px] resize-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest opacity-60">
                Actual Outcome (Review phase)
              </label>
              <textarea
                placeholder="What actually happened?"
                value={formData.actualOutcome}
                onChange={(e) =>
                  setFormData({ ...formData, actualOutcome: e.target.value })
                }
                className="notion-input w-full min-h-[80px] resize-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest opacity-60">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    status: e.target.value as DecisionEntry["status"],
                  })
                }
                className="notion-input w-full"
              >
                <option value="PENDING">Pending</option>
                <option value="COMPLETED">Completed</option>
                <option value="ABORTED">Aborted</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest opacity-60">
                Impact (1-5)
              </label>
              <input
                type="number"
                min="1"
                max="5"
                value={formData.impact}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    impact: (parseInt(e.target.value) ||
                      3) as DecisionEntry["impact"],
                  })
                }
                className="notion-input w-full"
              />
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-notion-light-border dark:border-notion-dark-border flex items-center justify-end gap-3 bg-notion-light-sidebar dark:bg-notion-dark-sidebar">
          <Button
            variant="custom"
            onClick={onClose}
            className="notion-button notion-button-ghost"
          >
            Cancel
          </Button>
          <Button
            variant="custom"
            onClick={() => onSave(formData)}
            className="notion-button notion-button-primary"
            disabled={!formData.title}
          >
            {initialData ? "Update Log" : "Save Decision"}
          </Button>
        </div>
      </div>
    </div>
  );
};
