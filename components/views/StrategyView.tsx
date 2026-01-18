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
      } else {
        await addDecision(entry, config);
      }
      loadDecisions();
      setIsModalOpen(false);
      setEditingDecision(null);
    } catch (error) {
      console.error("Failed to save decision", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to abort this decision log?")) {
      try {
        await deleteDecision(id, config);
        loadDecisions();
      } catch (error) {
        console.error("Failed to delete decision", error);
      }
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-notion-light-text dark:text-notion-dark-text">
            Decision <span className="opacity-70">Journal</span>
          </h1>
          <p className="text-notion-light-muted dark:text-notion-dark-muted mt-1 text-sm">
            Strategy & assumption tracking for the one-man empire.
          </p>
        </div>
        <button
          onClick={() => {
            setEditingDecision(null);
            setIsModalOpen(true);
          }}
          className="notion-button notion-button-primary flex items-center gap-2"
        >
          <Icon.Add size={18} />
          <span>Log Decision</span>
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-notion-light-text dark:border-notion-dark-text"></div>
        </div>
      ) : decisions.length === 0 ? (
        <div className="text-center py-20 bg-notion-light-sidebar dark:bg-notion-dark-sidebar rounded-2xl border border-dashed border-notion-light-border dark:border-notion-dark-border">
          <Icon.Strategy size={48} className="mx-auto mb-4 opacity-20" />
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
              className="bg-notion-light-bg dark:bg-notion-dark-bg border border-notion-light-border dark:border-notion-dark-border rounded-2xl p-6 hover:shadow-lg transition-all group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-2 h-2 rounded-full ${decision.status === "PENDING" ? "bg-amber-500" : "bg-emerald-500"}`}
                  ></div>
                  <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">
                    {decision.date}
                  </span>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => {
                      setEditingDecision(decision);
                      setIsModalOpen(true);
                    }}
                    className="p-1.5 hover:bg-notion-light-sidebar dark:hover:bg-notion-dark-sidebar rounded-lg text-notion-light-muted dark:text-notion-dark-muted"
                  >
                    <Icon.Edit size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(decision.id)}
                    className="p-1.5 hover:bg-rose-500/10 hover:text-rose-500 rounded-lg text-notion-light-muted dark:text-notion-dark-muted"
                  >
                    <Icon.Delete size={14} />
                  </button>
                </div>
              </div>

              <h3 className="text-lg font-bold text-notion-light-text dark:text-notion-dark-text mb-2">
                {decision.title}
              </h3>

              <div className="prose prose-sm dark:prose-invert max-w-none line-clamp-3 mb-4 text-sm text-notion-light-muted dark:text-notion-dark-muted">
                <ReactMarkdown>{decision.context}</ReactMarkdown>
              </div>

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
                          className={`w-3 h-1 rounded-full ${i <= decision.impact ? "bg-fuchsia-500" : "bg-notion-light-border dark:bg-notion-dark-border"}`}
                        ></div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="text-[10px] font-bold px-2 py-0.5 bg-notion-light-sidebar dark:bg-notion-dark-sidebar rounded-full uppercase tracking-wider">
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
          <button
            onClick={onClose}
            className="p-2 hover:bg-notion-light-border dark:hover:bg-notion-dark-border rounded-full transition-colors"
          >
            <Icon.Close size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
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
              Context & Options
            </label>
            <textarea
              placeholder="Why are you making this decision? What are the alternatives?"
              value={formData.context}
              onChange={(e) =>
                setFormData({ ...formData, context: e.target.value })
              }
              className="notion-input w-full min-h-[120px] resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
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
                <option value="REVIEWED">Reviewed</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest opacity-60">
                Impact (1-5)
              </label>
              <input
                type="range"
                min="1"
                max="5"
                value={formData.impact}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    impact: parseInt(e.target.value) as DecisionEntry["impact"],
                  })
                }
                className="w-full h-2 bg-notion-light-border dark:bg-notion-dark-border rounded-lg appearance-none cursor-pointer accent-fuchsia-500"
              />
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-notion-light-border dark:border-notion-dark-border flex items-center justify-end gap-3 bg-notion-light-sidebar dark:bg-notion-dark-sidebar">
          <button
            onClick={onClose}
            className="notion-button notion-button-ghost"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(formData)}
            className="notion-button notion-button-primary"
            disabled={!formData.title}
          >
            Save Decision
          </button>
        </div>
      </div>
    </div>
  );
};
