import React from "react";
import { Icon } from "../Icons";
import { Automation } from "../../types";
import { ViewHeader } from "../ViewHeader";
import {
  MODULE_COLORS,
  AUTOMATION_TEMPLATES,
  BUTTON_STYLES,
} from "@/constants";
import { Button, Spinner } from "../ui";
import { useAutomationLogic } from "@/hooks/useAutomationLogic";

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
  const {
    isModalOpen,
    setIsModalOpen,
    editingAutomation,
    setEditingAutomation,
    handleAdd,
    handleEdit,
    handleUseTemplate,
    handleSubmit,
    handleDeleteClick,
    handleToggleClick,
  } = useAutomationLogic({ onSave, onDelete, onToggle });

  const colors = MODULE_COLORS.automation;
  const aiColors = MODULE_COLORS.ai;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <ViewHeader
        title="Automation Layer"
        subTitle="Smart agentic tasks and event triggers"
      >
        <Button
          variant="custom"
          onClick={handleAdd}
          className={`w-full md:w-auto ${BUTTON_STYLES.base} ${BUTTON_STYLES.padding} ${BUTTON_STYLES.rounded} ${colors.bg} ${colors.text} border ${colors.border} ${colors.hoverBg} mt-2 md:mt-0 group`}
        >
          <Icon.Add
            size={14}
            className="inline-block mr-1 group-hover:rotate-90 transition-transform duration-300"
          />{" "}
          New Trigger
        </Button>
      </ViewHeader>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-notion-light-bg dark:bg-notion-dark-bg border border-notion-light-border dark:border-notion-dark-border rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3
              className={`font-black ${colors.text} flex items-center gap-3 text-xs uppercase tracking-[0.15em]`}
            >
              <div
                className={`p-1.5 ${colors.bg} rounded-lg border ${colors.border}`}
              >
                <Icon.Play size={14} className={colors.text} />
              </div>
              Active Automations
            </h3>
          </div>

          <div className="space-y-4">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <Spinner size="lg" />
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-notion-light-muted dark:text-notion-dark-muted">
                  Syncing...
                </p>
              </div>
            ) : automations.length === 0 ? (
              <div
                className={`text-center py-16 ${colors.lightBg} rounded-2xl border border-dashed ${colors.border}`}
              >
                <div
                  className={`w-12 h-12 ${colors.bg} rounded-2xl flex items-center justify-center mx-auto mb-4 border ${colors.border} opacity-50`}
                >
                  <Icon.Settings size={24} className={colors.text} />
                </div>
                <p className="text-notion-light-muted dark:text-notion-dark-muted text-[11px] font-bold uppercase tracking-widest">
                  No automations found
                </p>
              </div>
            ) : (
              automations.map((auto) => (
                <div
                  key={auto.id}
                  className={`p-4 md:p-5 bg-notion-light-bg dark:bg-notion-dark-bg border border-notion-light-border dark:border-notion-dark-border rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group hover:shadow-md ${colors.border.replace("border-", "hover:border-")} transition-all animate-in fade-in slide-in-from-bottom-2`}
                >
                  <div className="flex items-center gap-4 md:gap-5 w-full sm:w-auto">
                    <div
                      className={`w-10 h-10 md:w-11 md:h-11 ${colors.bg} rounded-xl flex items-center justify-center border ${colors.border} cursor-pointer ${colors.border.replace("border-", "hover:border-")} transition-all shadow-sm group/icon flex-shrink-0`}
                      onClick={() => handleEdit(auto)}
                    >
                      <Icon.Settings
                        size={18}
                        className={`transition-all group-hover/icon:rotate-90 duration-500 ${auto.status === "Active" ? colors.text : "text-notion-light-muted dark:text-notion-dark-muted"}`}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-black text-notion-light-text dark:text-notion-dark-text tracking-tight truncate">
                        {auto.name}
                      </h4>
                      <div className="flex flex-wrap items-center gap-1.5 md:gap-2 mt-1.5">
                        <span
                          className={`text-[9px] md:text-[10px] font-black uppercase tracking-widest ${colors.text} ${colors.bg} px-1.5 py-0.5 rounded truncate max-w-[100px] md:max-w-none`}
                        >
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
                    <Button
                      variant="custom"
                      onClick={() => handleToggleClick(auto.id)}
                      className={`flex-1 sm:flex-none px-4 sm:px-3 py-2 sm:py-1 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all border shadow-sm ${
                        auto.status === "Active"
                          ? `${colors.bg} ${colors.text} border-transparent font-black`
                          : `${colors.lightBg} text-notion-light-muted dark:text-notion-dark-muted border-notion-light-border dark:border-notion-dark-border opacity-60`
                      }`}
                    >
                      {auto.status}
                    </Button>
                    <Button
                      variant="custom"
                      onClick={() => handleDeleteClick(auto.id, auto.name)}
                      className={`p-2 text-notion-light-muted dark:text-notion-dark-muted ${MODULE_COLORS.error.text.replace("text-", "hover:text-")} ${MODULE_COLORS.error.bg.replace("bg-", "hover:bg-")} rounded-xl transition-all sm:opacity-0 sm:group-hover:opacity-100`}
                    >
                      <Icon.Delete size={16} />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="space-y-8">
          <div
            className={`${aiColors.bg} rounded-2xl p-7 text-notion-light-text dark:text-notion-dark-text border ${aiColors.border} shadow-xl relative overflow-hidden group`}
          >
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div
                  className={`p-2 ${aiColors.bg} rounded-xl shadow-lg border ${aiColors.border}`}
                >
                  <Icon.Bot size={20} className={aiColors.text} />
                </div>
                <h3
                  className={`text-xl font-black tracking-tight ${aiColors.text}`}
                >
                  Wes-AI Agentic Mode
                </h3>
              </div>
              <p className="text-notion-light-muted dark:text-notion-dark-muted text-xs font-bold leading-relaxed mb-8 max-w-[80%] uppercase tracking-wider">
                Automations are monitored by Wes-AI to ensure operational
                integrity and system alignment.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div
                  className={`bg-white/40 dark:bg-black/20 backdrop-blur-md rounded-2xl p-5 border ${aiColors.border} shadow-inner group-hover:bg-white/60 dark:group-hover:bg-black/30 transition-all`}
                >
                  <div className={`text-3xl font-black mb-1 ${aiColors.text}`}>
                    {automations.filter((a) => a.status === "Active").length}
                  </div>
                  <div className="text-[9px] font-black uppercase tracking-[0.2em] opacity-50">
                    Active Triggers
                  </div>
                </div>
                <div
                  className={`bg-white/40 dark:bg-black/20 backdrop-blur-md rounded-2xl p-5 border ${aiColors.border} shadow-inner group-hover:bg-white/60 dark:group-hover:bg-black/30 transition-all`}
                >
                  <div className={`text-3xl font-black mb-1 ${aiColors.text}`}>
                    {automations.length}
                  </div>
                  <div className="text-[9px] font-black uppercase tracking-[0.2em] opacity-50">
                    Total Defined
                  </div>
                </div>
              </div>
            </div>
            <div
              className={`absolute -bottom-10 -right-10 w-40 h-40 ${aiColors.text} opacity-5 rounded-full blur-3xl transition-all group-hover:opacity-10`}
            />
          </div>

          <div className="bg-notion-light-bg dark:bg-notion-dark-bg border border-notion-light-border dark:border-notion-dark-border rounded-2xl p-6 shadow-sm">
            <h3
              className={`font-black ${colors.text} mb-6 flex items-center gap-3 text-xs uppercase tracking-[0.15em]`}
            >
              <div
                className={`p-1.5 ${colors.bg} rounded-lg border ${colors.border}`}
              >
                <Icon.Bot size={14} className={colors.text} />
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
                  className={`flex items-center justify-between p-3 rounded-xl border border-transparent ${colors.border.replace("border-", "hover:border-")} ${colors.lightBg.replace("bg-", "hover:bg-")} transition-all group/log`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${colors.dot} shadow-[0_0_8px_rgba(55,53,47,0.3)] dark:shadow-[0_0_8px_rgba(211,211,211,0.3)]`}
                    />
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
          <h3
            className={`font-black ${colors.text} flex items-center gap-3 text-xs uppercase tracking-[0.15em]`}
          >
            <div
              className={`p-1.5 ${colors.bg} rounded-lg border ${colors.border}`}
            >
              <Icon.Add size={14} className={colors.text} />
            </div>
            Ready-to-Deploy Templates
          </h3>
          <span
            className={`text-[9px] font-black text-notion-light-muted dark:text-notion-dark-muted uppercase tracking-widest ${colors.lightBg} px-2 py-1 rounded-md border ${colors.border}`}
          >
            Quick Start
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {AUTOMATION_TEMPLATES.map((template) => (
            <div
              key={template.name}
              className={`bg-notion-light-bg dark:bg-notion-dark-bg border border-notion-light-border dark:border-notion-dark-border rounded-2xl p-5 hover:shadow-xl ${colors.border.replace("border-", "hover:border-")} transition-all duration-300 group flex flex-col justify-between`}
            >
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${template.colors.bg} ${template.colors.text} border ${template.colors.border} group-hover:scale-110 transition-transform`}
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
                <h4
                  className={`text-sm font-black text-notion-light-text dark:text-notion-dark-text mb-2 uppercase tracking-tight ${colors.text.replace("text-", "group-hover:text-")} transition-colors`}
                >
                  {template.name}
                </h4>
                <p className="text-[10px] font-bold text-notion-light-muted dark:text-notion-dark-muted leading-relaxed mb-4">
                  {template.description}
                </p>
              </div>
              <Button
                variant="custom"
                onClick={() => handleUseTemplate(template)}
                className={`w-full py-2 ${colors.lightBg} ${colors.bg.replace("bg-", "hover:bg-")} ${colors.text} text-[10px] font-black uppercase tracking-widest border ${colors.border} rounded-xl transition-all active:scale-95`}
              >
                Use Template
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Simple Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 dark:bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div
            className="absolute inset-0"
            onClick={() => setIsModalOpen(false)}
          />
          <div className="relative bg-notion-light-bg dark:bg-notion-dark-bg border border-notion-light-border dark:border-notion-dark-border rounded-2xl w-full max-w-md shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 overflow-hidden">
            <form onSubmit={handleSubmit}>
              <div
                className={`flex items-center justify-between px-7 py-5 border-b ${colors.border} ${colors.lightBg}`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-1.5 ${colors.bg} rounded-lg border ${colors.border}`}
                  >
                    <Icon.Play size={14} className={colors.text} />
                  </div>
                  <h3
                    className={`text-[11px] font-black ${colors.text} uppercase tracking-[0.2em]`}
                  >
                    {editingAutomation?.id ? "Edit" : "New"} Trigger
                  </h3>
                </div>
                <Button
                  variant="custom"
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className={`p-1.5 text-notion-light-muted dark:text-notion-dark-muted ${colors.text.replace("text-", "hover:text-")} ${colors.bg.replace("bg-", "hover:bg-")} rounded-lg transition-all`}
                >
                  <Icon.Close size={18} />
                </Button>
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
                    className={`w-full bg-notion-light-sidebar dark:bg-notion-dark-sidebar border border-notion-light-border dark:border-notion-dark-border rounded-xl px-5 py-3 text-sm font-bold text-notion-light-text dark:text-notion-dark-text focus:outline-none focus:ring-2 ${colors.border.replace("border-", "focus:border-")}/50 transition-all placeholder:text-notion-light-muted/50`}
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
                      className={`w-full bg-notion-light-sidebar dark:bg-notion-dark-sidebar border border-notion-light-border dark:border-notion-dark-border rounded-xl px-5 py-3 text-sm font-bold text-notion-light-text dark:text-notion-dark-text focus:outline-none focus:ring-2 ${colors.border.replace("border-", "focus:border-")}/50 transition-all placeholder:text-notion-light-muted/50`}
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
                      className={`w-full bg-notion-light-sidebar dark:bg-notion-dark-sidebar border border-notion-light-border dark:border-notion-dark-border rounded-xl px-5 py-3 text-sm font-bold text-notion-light-text dark:text-notion-dark-text focus:outline-none focus:ring-2 ${colors.border.replace("border-", "focus:border-")}/50 transition-all placeholder:text-notion-light-muted/50`}
                      placeholder="e.g. Create Task"
                    />
                  </div>
                </div>
              </div>

              <div
                className={`px-7 py-5 ${colors.lightBg} border-t ${colors.border} flex justify-end gap-3`}
              >
                <Button
                  variant="custom"
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className={`px-5 py-2.5 text-[10px] font-black uppercase tracking-widest text-notion-light-text dark:text-notion-dark-text ${colors.bg.replace("bg-", "hover:bg-")} rounded-xl transition-all`}
                >
                  Cancel
                </Button>
                <Button
                  variant="custom"
                  type="submit"
                  className={`px-6 py-2.5 ${colors.bg} ${colors.text} border ${colors.border} text-[10px] font-black uppercase tracking-[0.15em] rounded-xl transition-all shadow-lg active:scale-95 ${colors.hoverBg}`}
                >
                  {editingAutomation?.id ? "Save Changes" : "Create Trigger"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
