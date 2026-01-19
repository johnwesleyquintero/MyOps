import React, { useState } from "react";
import { Icon } from "../Icons";
import { Automation } from "../../types";
import { ViewHeader } from "../ViewHeader";

const AUTOMATION_TEMPLATES = [
  {
    name: "Lead-to-Mission",
    trigger: "Webhook",
    action: "Create Task",
    description: "Convert incoming webhooks into active mission tasks.",
    icon: "Zap",
    color: "blue",
  },
  {
    name: "Vault Sync",
    trigger: "Scheduled",
    action: "Category Update",
    description: "Automatically categorize transactions in your Vault.",
    icon: "Vault",
    color: "emerald",
  },
  {
    name: "Empire Pulse",
    trigger: "Daily 00:00",
    action: "Generate Report",
    description: "Daily automated summary of your empire's performance.",
    icon: "Strategy",
    color: "fuchsia",
  },
  {
    name: "AI Co-pilot Sync",
    trigger: "Manual",
    action: "Update Blueprint",
    description: "Sync AI suggestions directly into your Master Blueprint.",
    icon: "Bot",
    color: "amber",
  },
];

interface AutomationViewProps {
  automations: Automation[];
  isLoading: boolean;
  onSave: (automation: Automation, isUpdate: boolean) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
  onToggle: (id: string) => Promise<boolean>;
}

export const AutomationView: React.FC<AutomationViewProps> = ({
  automations,
  isLoading,
  onSave,
  onDelete,
  onToggle,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAutomation, setEditingAutomation] =
    useState<Partial<Automation> | null>(null);

  const handleAdd = () => {
    setEditingAutomation({
      name: "",
      trigger: "",
      action: "",
      status: "Active",
    });
    setIsModalOpen(true);
  };

  const handleEdit = (auto: Automation) => {
    setEditingAutomation(auto);
    setIsModalOpen(true);
  };

  const handleUseTemplate = (template: (typeof AUTOMATION_TEMPLATES)[0]) => {
    setEditingAutomation({
      name: template.name,
      trigger: template.trigger,
      action: template.action,
      status: "Active",
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingAutomation) {
      const success = await onSave(
        editingAutomation as Automation,
        !!editingAutomation.id,
      );
      if (success) {
        setIsModalOpen(false);
        setEditingAutomation(null);
      }
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <ViewHeader
        title="Automation Layer"
        subTitle="Smart agentic tasks and event triggers"
      >
        <button
          onClick={handleAdd}
          className="w-full md:w-auto px-4 py-2.5 md:py-2 bg-notion-light-sidebar dark:bg-notion-dark-sidebar text-notion-light-text dark:text-notion-dark-text text-[10px] font-black uppercase tracking-widest border border-notion-light-border dark:border-notion-dark-border rounded-xl hover:bg-notion-light-border dark:hover:bg-notion-dark-border transition-all active:scale-95 shadow-sm mt-2 md:mt-0"
        >
          + New Trigger
        </button>
      </ViewHeader>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-notion-light-bg dark:bg-notion-dark-bg border border-notion-light-border dark:border-notion-dark-border rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-black text-notion-light-text dark:text-notion-dark-text flex items-center gap-3 text-xs uppercase tracking-[0.15em]">
              <div className="p-1.5 bg-notion-light-sidebar dark:bg-notion-dark-sidebar rounded-lg border border-notion-light-border dark:border-notion-dark-border">
                <Icon.Play
                  size={14}
                  className="text-notion-light-text dark:text-notion-dark-text"
                />
              </div>
              Active Automations
            </h3>
          </div>

          <div className="space-y-4">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <div className="w-8 h-8 border-4 border-notion-light-sidebar dark:border-notion-dark-sidebar border-t-notion-light-text dark:border-t-notion-dark-text rounded-full animate-spin" />
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-notion-light-muted dark:text-notion-dark-muted">
                  Syncing...
                </p>
              </div>
            ) : automations.length === 0 ? (
              <div className="text-center py-16 bg-notion-light-sidebar dark:bg-notion-dark-sidebar rounded-2xl border border-dashed border-notion-light-border dark:border-notion-dark-border">
                <div className="w-12 h-12 bg-notion-light-bg dark:bg-notion-dark-bg rounded-2xl flex items-center justify-center mx-auto mb-4 border border-notion-light-border dark:border-notion-dark-border opacity-50">
                  <Icon.Settings
                    size={24}
                    className="text-notion-light-muted dark:text-notion-dark-muted"
                  />
                </div>
                <p className="text-notion-light-muted dark:text-notion-dark-muted text-[11px] font-bold uppercase tracking-widest">
                  No automations found
                </p>
              </div>
            ) : (
              automations.map((auto) => (
                <div
                  key={auto.id}
                  className="p-4 md:p-5 bg-notion-light-bg dark:bg-notion-dark-bg border border-notion-light-border dark:border-notion-dark-border rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group hover:shadow-md hover:border-notion-light-text/10 dark:hover:border-notion-dark-text/10 transition-all animate-in fade-in slide-in-from-bottom-2"
                >
                  <div className="flex items-center gap-4 md:gap-5 w-full sm:w-auto">
                    <div
                      className="w-10 h-10 md:w-11 md:h-11 bg-notion-light-sidebar dark:bg-notion-dark-sidebar rounded-xl flex items-center justify-center border border-notion-light-border dark:border-notion-dark-border cursor-pointer hover:border-notion-light-text/30 dark:hover:border-notion-dark-text/30 transition-all shadow-sm group/icon flex-shrink-0"
                      onClick={() => handleEdit(auto)}
                    >
                      <Icon.Settings
                        size={18}
                        className={`transition-all group-hover/icon:rotate-90 duration-500 ${auto.status === "Active" ? "text-notion-light-text dark:text-notion-dark-text" : "text-notion-light-muted dark:text-notion-dark-muted"}`}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-black text-notion-light-text dark:text-notion-dark-text tracking-tight truncate">
                        {auto.name}
                      </h4>
                      <div className="flex flex-wrap items-center gap-1.5 md:gap-2 mt-1.5">
                        <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-notion-light-text dark:text-notion-dark-text bg-notion-light-sidebar dark:bg-notion-dark-sidebar px-1.5 py-0.5 rounded truncate max-w-[100px] md:max-w-none">
                          {auto.trigger}
                        </span>
                        <Icon.Next
                          size={10}
                          className="text-notion-light-muted dark:text-notion-dark-muted opacity-30 flex-shrink-0"
                        />
                        <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-notion-light-text dark:text-notion-dark-text opacity-70 truncate max-w-[100px] md:max-w-none">
                          {auto.action}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 border-notion-light-border dark:border-notion-dark-border pt-3 sm:pt-0">
                    <button
                      onClick={() => onToggle(auto.id)}
                      className={`flex-1 sm:flex-none px-4 sm:px-3 py-2 sm:py-1 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all border shadow-sm ${
                        auto.status === "Active"
                          ? "bg-notion-light-text dark:bg-notion-dark-text text-notion-light-bg dark:text-notion-dark-bg border-transparent"
                          : "bg-notion-light-sidebar dark:bg-notion-dark-sidebar text-notion-light-muted dark:text-notion-dark-muted border-notion-light-border dark:border-notion-dark-border opacity-60"
                      }`}
                    >
                      {auto.status}
                    </button>
                    <button
                      onClick={() => onDelete(auto.id)}
                      className="p-2 text-notion-light-muted hover:text-red-600 dark:hover:text-red-400 hover:bg-red-500/10 dark:hover:bg-red-500/20 rounded-xl transition-all sm:opacity-0 sm:group-hover:opacity-100"
                    >
                      <Icon.Delete size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-notion-light-text dark:bg-notion-dark-text rounded-2xl p-7 text-notion-light-bg dark:text-notion-dark-bg shadow-xl relative overflow-hidden group">
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-notion-light-sidebar dark:bg-notion-dark-sidebar rounded-xl shadow-lg border border-notion-light-border/10 dark:border-notion-dark-border/10">
                  <Icon.Bot
                    size={20}
                    className="text-notion-light-text dark:text-notion-dark-text"
                  />
                </div>
                <h3 className="text-xl font-black tracking-tight">
                  Wes-AI Agentic Mode
                </h3>
              </div>
              <p className="text-notion-light-bg/70 dark:text-notion-dark-bg/70 text-xs font-bold leading-relaxed mb-8 max-w-[80%] uppercase tracking-wider">
                Automations are monitored by Wes-AI to ensure operational
                integrity and system alignment.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 backdrop-blur-md rounded-2xl p-5 border border-white/10 shadow-inner group-hover:bg-white/10 transition-all">
                  <div className="text-3xl font-black mb-1">
                    {automations.filter((a) => a.status === "Active").length}
                  </div>
                  <div className="text-[9px] font-black uppercase tracking-[0.2em] opacity-50">
                    Active Triggers
                  </div>
                </div>
                <div className="bg-white/5 backdrop-blur-md rounded-2xl p-5 border border-white/10 shadow-inner group-hover:bg-white/10 transition-all">
                  <div className="text-3xl font-black mb-1">
                    {automations.length}
                  </div>
                  <div className="text-[9px] font-black uppercase tracking-[0.2em] opacity-50">
                    Total Defined
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-notion-light-bg/10 rounded-full blur-3xl transition-all group-hover:bg-notion-light-bg/20" />
          </div>

          <div className="bg-notion-light-bg dark:bg-notion-dark-bg border border-notion-light-border dark:border-notion-dark-border rounded-2xl p-6 shadow-sm">
            <h3 className="font-black text-notion-light-text dark:text-notion-dark-text mb-6 flex items-center gap-3 text-xs uppercase tracking-[0.15em]">
              <div className="p-1.5 bg-notion-light-sidebar dark:bg-notion-dark-sidebar rounded-lg border border-notion-light-border dark:border-notion-dark-border">
                <Icon.Bot
                  size={14}
                  className="text-notion-light-text dark:text-notion-dark-text"
                />
              </div>
              Recent Executions
            </h3>
            <div className="space-y-4">
              {[
                { log: "Daily Snapshot completed", time: "00:00" },
                { log: "Lead to Task triggered for 'John Doe'", time: "14:23" },
                { log: "Artifact Reward awarded to 'Operator'", time: "09:15" },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 rounded-xl border border-transparent hover:border-notion-light-border dark:hover:border-notion-dark-border hover:bg-notion-light-sidebar dark:hover:bg-notion-dark-sidebar transition-all group/log"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-notion-light-text dark:bg-notion-dark-text shadow-[0_0_8px_rgba(55,53,47,0.3)] dark:shadow-[0_0_8px_rgba(211,211,211,0.3)]" />
                    <p className="text-[11px] font-bold text-notion-light-text dark:text-notion-dark-text opacity-80">
                      {item.log}
                    </p>
                  </div>
                  <span className="text-[9px] font-black text-notion-light-muted dark:text-notion-dark-muted uppercase tracking-tighter opacity-0 group-hover/log:opacity-100 transition-opacity">
                    {item.time}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Template Gallery */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="font-black text-notion-light-text dark:text-notion-dark-text flex items-center gap-3 text-xs uppercase tracking-[0.15em]">
            <div className="p-1.5 bg-notion-light-sidebar dark:bg-notion-dark-sidebar rounded-lg border border-notion-light-border dark:border-notion-dark-border">
              <Icon.Add
                size={14}
                className="text-notion-light-text dark:text-notion-dark-text"
              />
            </div>
            Ready-to-Deploy Templates
          </h3>
          <span className="text-[9px] font-black text-notion-light-muted dark:text-notion-dark-muted uppercase tracking-widest bg-notion-light-sidebar dark:bg-notion-dark-sidebar px-2 py-1 rounded-md border border-notion-light-border dark:border-notion-dark-border">
            Quick Start
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {AUTOMATION_TEMPLATES.map((template) => (
            <div
              key={template.name}
              className="bg-notion-light-bg dark:bg-notion-dark-bg border border-notion-light-border dark:border-notion-dark-border rounded-2xl p-5 hover:shadow-xl hover:border-notion-light-text/10 dark:hover:border-notion-dark-text/10 transition-all duration-300 group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center bg-${template.color}-500/10 text-${template.color}-600 dark:text-${template.color}-400 border border-${template.color}-500/20`}
                  >
                    {template.icon === "Zap" && <Icon.Zap size={18} />}
                    {template.icon === "Vault" && <Icon.Vault size={18} />}
                    {template.icon === "Strategy" && (
                      <Icon.Strategy size={18} />
                    )}
                    {template.icon === "Bot" && <Icon.Bot size={18} />}
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <Icon.Next
                      size={14}
                      className="text-notion-light-muted dark:text-notion-dark-muted"
                    />
                  </div>
                </div>
                <h4 className="text-sm font-black text-notion-light-text dark:text-notion-dark-text mb-2 uppercase tracking-tight">
                  {template.name}
                </h4>
                <p className="text-[10px] font-bold text-notion-light-muted dark:text-notion-dark-muted leading-relaxed mb-4">
                  {template.description}
                </p>
              </div>
              <button
                onClick={() => handleUseTemplate(template)}
                className="w-full py-2 bg-notion-light-sidebar dark:bg-notion-dark-sidebar hover:bg-notion-light-text dark:hover:bg-notion-dark-text hover:text-notion-light-bg dark:hover:text-notion-dark-bg text-notion-light-text dark:text-notion-dark-text text-[10px] font-black uppercase tracking-widest border border-notion-light-border dark:border-notion-dark-border rounded-xl transition-all active:scale-95"
              >
                Use Template
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Simple Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/20 dark:bg-black/40 backdrop-blur-[2px] animate-in fade-in duration-300">
          <div
            className="absolute inset-0"
            onClick={() => setIsModalOpen(false)}
          />
          <div className="relative bg-notion-light-bg dark:bg-notion-dark-bg border border-notion-light-border dark:border-notion-dark-border rounded-2xl w-full max-w-md shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 overflow-hidden">
            <form onSubmit={handleSubmit}>
              <div className="flex items-center justify-between px-7 py-5 border-b border-notion-light-border dark:border-notion-dark-border bg-notion-light-bg dark:bg-notion-dark-bg">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-notion-light-sidebar dark:bg-notion-dark-sidebar rounded-lg border border-notion-light-border dark:border-notion-dark-border">
                    <Icon.Play
                      size={14}
                      className="text-notion-light-text dark:text-notion-dark-text"
                    />
                  </div>
                  <h3 className="text-[11px] font-black text-notion-light-text dark:text-notion-dark-text uppercase tracking-[0.2em]">
                    {editingAutomation?.id ? "Edit" : "New"} Trigger
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 text-notion-light-muted hover:text-notion-light-text dark:hover:text-notion-dark-text hover:bg-notion-light-sidebar dark:hover:bg-notion-dark-sidebar rounded-lg transition-all"
                >
                  <Icon.Close size={18} />
                </button>
              </div>

              <div className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-notion-light-muted dark:text-notion-dark-muted uppercase tracking-[0.15em] ml-1">
                    Automation Name
                  </label>
                  <input
                    required
                    type="text"
                    value={editingAutomation?.name || ""}
                    onChange={(e) =>
                      setEditingAutomation({
                        ...editingAutomation,
                        name: e.target.value,
                      })
                    }
                    className="w-full bg-notion-light-sidebar dark:bg-notion-dark-sidebar border border-notion-light-border dark:border-notion-dark-border rounded-xl px-5 py-3 text-sm font-bold text-notion-light-text dark:text-notion-dark-text focus:outline-none focus:ring-2 focus:ring-notion-light-text/20 dark:focus:ring-notion-dark-text/20 transition-all placeholder:text-notion-light-muted/50"
                    placeholder="e.g. Lead to Task"
                  />
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-notion-light-muted dark:text-notion-dark-muted uppercase tracking-[0.15em] ml-1">
                      Trigger Event
                    </label>
                    <input
                      required
                      type="text"
                      value={editingAutomation?.trigger || ""}
                      onChange={(e) =>
                        setEditingAutomation({
                          ...editingAutomation,
                          trigger: e.target.value,
                        })
                      }
                      className="w-full bg-notion-light-sidebar dark:bg-notion-dark-sidebar border border-notion-light-border dark:border-notion-dark-border rounded-xl px-5 py-3 text-sm font-bold text-notion-light-text dark:text-notion-dark-text focus:outline-none focus:ring-2 focus:ring-notion-light-text/20 dark:focus:ring-notion-dark-text/20 transition-all placeholder:text-notion-light-muted/50"
                      placeholder="e.g. New Lead"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-notion-light-muted dark:text-notion-dark-muted uppercase tracking-[0.15em] ml-1">
                      Resulting Action
                    </label>
                    <input
                      required
                      type="text"
                      value={editingAutomation?.action || ""}
                      onChange={(e) =>
                        setEditingAutomation({
                          ...editingAutomation,
                          action: e.target.value,
                        })
                      }
                      className="w-full bg-notion-light-sidebar dark:bg-notion-dark-sidebar border border-notion-light-border dark:border-notion-dark-border rounded-xl px-5 py-3 text-sm font-bold text-notion-light-text dark:text-notion-dark-text focus:outline-none focus:ring-2 focus:ring-notion-light-text/20 dark:focus:ring-notion-dark-text/20 transition-all placeholder:text-notion-light-muted/50"
                      placeholder="e.g. Create Task"
                    />
                  </div>
                </div>
              </div>

              <div className="px-7 py-5 bg-notion-light-sidebar dark:bg-notion-dark-sidebar border-t border-notion-light-border dark:border-notion-dark-border flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 text-[10px] font-black uppercase tracking-widest text-notion-light-text dark:text-notion-dark-text hover:bg-notion-light-border dark:hover:bg-notion-dark-border rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-notion-light-text dark:bg-notion-dark-text text-notion-light-bg dark:text-notion-dark-bg text-[10px] font-black uppercase tracking-[0.15em] rounded-xl transition-all shadow-lg active:scale-95"
                >
                  {editingAutomation?.id ? "Save Changes" : "Create Trigger"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
