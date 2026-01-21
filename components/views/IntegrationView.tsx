import React, { useState } from "react";
import { Icon } from "../Icons";
import { Integration, IntegrationEvent } from "../../types";
import { ViewHeader } from "../ViewHeader";
import { formatTimeAgo } from "../../utils/formatUtils";
import { MODULE_COLORS } from "@/constants";
import { Button, Spinner } from "../ui";

interface IntegrationViewProps {
  integrations: Integration[];
  isLoading: boolean;
  onSave: (integration: Integration, isUpdate: boolean) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
  onToggle: (id: string) => Promise<boolean>;
  onTest: (id: string) => Promise<boolean>;
  onShowStory: () => void;
}

const EVENT_LABELS: Record<IntegrationEvent, string> = {
  task_created: "Task Created",
  task_completed: "Task Completed",
  milestone_reached: "Milestone Reached",
  reflection_logged: "Reflection Logged",
};

const INTEGRATION_TYPES = [
  {
    type: "Slack",
    icon: "MessageSquare",
    colors: MODULE_COLORS.automation,
  },
  {
    type: "WhatsApp",
    icon: "Phone",
    colors: MODULE_COLORS.crm,
  },
  {
    type: "Email",
    icon: "Mail",
    colors: MODULE_COLORS.report,
  },
  {
    type: "Webhook",
    icon: "Globe",
    colors: MODULE_COLORS.integration,
  },
];

export const IntegrationView: React.FC<IntegrationViewProps> = ({
  integrations,
  isLoading,
  onSave,
  onDelete,
  onToggle,
  onTest,
  onShowStory,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIntegration, setEditingIntegration] =
    useState<Partial<Integration> | null>(null);
  const [isTesting, setIsTesting] = useState<string | null>(null);

  const colors = MODULE_COLORS.integration;

  const crmColors = MODULE_COLORS.crm;

  const handleAdd = () => {
    setEditingIntegration({
      name: "",
      type: "Webhook",
      url: "",
      isEnabled: true,
      events: [],
    });
    setIsModalOpen(true);
  };

  const handleEdit = (integration: Integration) => {
    setEditingIntegration(integration);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingIntegration) {
      const isUpdate = !!editingIntegration.id;
      const success = await onSave(editingIntegration as Integration, isUpdate);
      if (success) {
        setIsModalOpen(false);
        setEditingIntegration(null);
      }
    }
  };

  const handleTest = async (id: string) => {
    setIsTesting(id);
    await onTest(id);
    setIsTesting(null);
  };

  const toggleEvent = (event: IntegrationEvent) => {
    if (!editingIntegration) return;
    const currentEvents = editingIntegration.events || [];
    const newEvents = currentEvents.includes(event)
      ? currentEvents.filter((e) => e !== event)
      : [...currentEvents, event];
    setEditingIntegration({ ...editingIntegration, events: newEvents });
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <ViewHeader
        title="Integration Hub"
        subTitle="Connect MyOps to the outside world. Stay operator-first, while keeping clients in the loop."
      >
        <div className="flex items-center gap-3">
          <Button
            variant="custom"
            onClick={onShowStory}
            leftIcon={<Icon.History size={16} />}
            className={`px-4 py-2 ${MODULE_COLORS.automation.lightBg} ${MODULE_COLORS.automation.text} rounded-lg ${MODULE_COLORS.automation.hoverBg} transition-all font-semibold text-sm border ${MODULE_COLORS.automation.border.split(" ")[0]}/20`}
          >
            Visual Story
          </Button>
          <Button
            variant="custom"
            onClick={handleAdd}
            leftIcon={<Icon.Plus size={16} />}
            className={`px-4 py-2 bg-purple-600 dark:bg-purple-500 hover:bg-purple-700 dark:hover:bg-purple-600 text-white rounded-lg transition-all font-semibold text-sm shadow-sm active:scale-95`}
          >
            Add Integration
          </Button>
        </div>
      </ViewHeader>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Spinner size="lg" />
        </div>
      ) : integrations.length === 0 ? (
        <div className="text-center py-20 bg-notion-light-sidebar dark:bg-notion-dark-sidebar rounded-xl border border-dashed border-notion-light-border dark:border-notion-dark-border">
          <Icon.Zap
            className={`w-12 h-12 mx-auto mb-4 ${colors.text} opacity-20`}
          />
          <h3 className="text-lg font-medium mb-2">No active integrations</h3>
          <p className="text-notion-light-muted dark:text-notion-dark-muted mb-6">
            Push updates to Slack, WhatsApp, or Email automatically.
          </p>
          <Button
            variant="custom"
            onClick={handleAdd}
            leftIcon={<Icon.Plus size={18} />}
            className={`px-6 py-3 bg-purple-600 dark:bg-purple-500 hover:bg-purple-700 dark:hover:bg-purple-600 text-white rounded-xl transition-all font-bold shadow-lg shadow-purple-500/20 active:scale-95`}
          >
            Connect Your First Channel
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {integrations.map((integration) => {
            const typeInfo =
              INTEGRATION_TYPES.find((t) => t.type === integration.type) ||
              INTEGRATION_TYPES[3];
            const IntegrationIcon =
              Icon[typeInfo.icon as keyof typeof Icon] || Icon.Globe;

            return (
              <div
                key={integration.id}
                className="group relative bg-white dark:bg-notion-dark-sidebar border border-notion-light-border dark:border-notion-dark-border rounded-xl p-5 hover:shadow-lg transition-all"
              >
                <div className="flex justify-between items-start mb-4">
                  <div
                    className={`p-2.5 rounded-lg ${typeInfo.colors.lightBg} ${typeInfo.colors.text}`}
                  >
                    <IntegrationIcon size={20} />
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="custom"
                      onClick={() => onToggle(integration.id)}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                        integration.isEnabled
                          ? crmColors.dot
                          : "bg-notion-light-border dark:bg-notion-dark-border"
                      }`}
                    >
                      <span
                        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                          integration.isEnabled
                            ? "translate-x-5"
                            : "translate-x-0.5"
                        }`}
                      />
                    </Button>
                    <div className="relative group/menu">
                      <Button
                        variant="custom"
                        className={`p-1 ${colors.hoverBg} rounded transition-colors text-notion-light-muted`}
                      >
                        <Icon.MoreHorizontal size={16} />
                      </Button>
                      <div
                        className={`absolute right-0 top-full mt-1 hidden group-hover/menu:block z-10 w-32 bg-white dark:bg-notion-dark-sidebar border ${colors.border.split(" ")[0]} rounded-lg shadow-xl overflow-hidden`}
                      >
                        <Button
                          variant="custom"
                          onClick={() => handleEdit(integration)}
                          leftIcon={<Icon.Edit size={14} />}
                          className={`w-full px-4 py-2 text-left justify-start text-sm ${colors.hoverBg} transition-colors`}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="custom"
                          onClick={() => onDelete(integration.id)}
                          leftIcon={<Icon.Trash size={14} />}
                          className={`w-full px-4 py-2 text-left justify-start text-sm ${MODULE_COLORS.error.text} ${MODULE_COLORS.error.bg.replace("bg-", "hover:bg-")} transition-colors`}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                <h3 className="font-semibold text-lg mb-1">
                  {integration.name}
                </h3>
                <p className="text-xs text-notion-light-muted dark:text-notion-dark-muted mb-4 truncate">
                  {integration.url}
                </p>

                <div className="space-y-3">
                  <div className="flex flex-wrap gap-1.5">
                    {integration.events.map((event) => (
                      <span
                        key={event}
                        className={`px-2 py-0.5 ${colors.lightBg} ${colors.text} text-[10px] font-medium rounded-full border ${colors.border.split(" ")[0]}`}
                      >
                        {EVENT_LABELS[event]}
                      </span>
                    ))}
                  </div>

                  <div className="pt-3 border-t border-notion-light-border dark:border-notion-dark-border flex items-center justify-between">
                    <span className="text-[10px] text-notion-light-muted dark:text-notion-dark-muted">
                      {integration.lastTested
                        ? `Tested ${formatTimeAgo(integration.lastTested)}`
                        : "Never tested"}
                    </span>
                    <Button
                      variant="custom"
                      onClick={() => handleTest(integration.id)}
                      isLoading={isTesting === integration.id}
                      leftIcon={<Icon.Zap size={10} />}
                      className={`text-[10px] font-semibold ${colors.text} hover:underline disabled:opacity-50`}
                    >
                      Test Connection
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && editingIntegration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-notion-dark-sidebar w-full max-w-md rounded-2xl shadow-2xl border border-notion-light-border dark:border-notion-dark-border overflow-hidden animate-in zoom-in-95 duration-200">
            <form onSubmit={handleSubmit} className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">
                  {editingIntegration.id
                    ? "Edit Integration"
                    : "New Integration"}
                </h2>
                <Button
                  variant="ghost"
                  size="icon"
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className={`${colors.hoverBg} ${colors.text} rounded-full`}
                >
                  <Icon.X size={20} />
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <label
                    className={`block text-xs font-semibold ${colors.text} uppercase mb-1.5`}
                  >
                    Integration Name
                  </label>
                  <input
                    type="text"
                    required
                    value={editingIntegration.name}
                    onChange={(e) =>
                      setEditingIntegration({
                        ...editingIntegration,
                        name: e.target.value,
                      })
                    }
                    placeholder="e.g. Client Slack Webhook"
                    className={`w-full px-4 py-2.5 bg-notion-light-sidebar dark:bg-notion-dark-border border ${colors.border.split(" ")[0]} rounded-lg focus:ring-2 ${colors.bg.replace("bg-", "ring-")}/20 outline-none transition-all`}
                  />
                </div>

                <div>
                  <label
                    className={`block text-xs font-semibold ${colors.text} uppercase mb-1.5`}
                  >
                    Channel Type
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {INTEGRATION_TYPES.map((t) => {
                      const TIcon =
                        Icon[t.icon as keyof typeof Icon] || Icon.Globe;
                      const isSelected = editingIntegration.type === t.type;
                      return (
                        <Button
                          variant="custom"
                          key={t.type}
                          type="button"
                          onClick={() =>
                            setEditingIntegration({
                              ...editingIntegration,
                              type: t.type as Integration["type"],
                            })
                          }
                          leftIcon={<TIcon size={16} />}
                          className={`px-3 py-2 rounded-lg border text-sm transition-all justify-start ${
                            isSelected
                              ? `${t.colors.lightBg} ${t.colors.border.split(" ")[0]} ${t.colors.text}`
                              : `border-notion-light-border dark:border-notion-dark-border ${colors.hoverBg}`
                          }`}
                        >
                          {t.type}
                        </Button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label
                    className={`block text-xs font-semibold ${colors.text} uppercase mb-1.5`}
                  >
                    Webhook URL / Email Address
                  </label>
                  <input
                    type="text"
                    required
                    value={editingIntegration.url}
                    onChange={(e) =>
                      setEditingIntegration({
                        ...editingIntegration,
                        url: e.target.value,
                      })
                    }
                    placeholder="https://hooks.slack.com/services/..."
                    className={`w-full px-4 py-2.5 bg-notion-light-sidebar dark:bg-notion-dark-border border ${colors.border.split(" ")[0]} rounded-lg focus:ring-2 ${colors.bg.replace("bg-", "ring-")}/20 outline-none transition-all`}
                  />
                </div>

                <div>
                  <label
                    className={`block text-xs font-semibold ${colors.text} uppercase mb-1.5`}
                  >
                    Events to Broadcast
                  </label>
                  <div className="space-y-2">
                    {Object.entries(EVENT_LABELS).map(([event, label]) => {
                      const isSelected = editingIntegration.events?.includes(
                        event as IntegrationEvent,
                      );
                      return (
                        <Button
                          variant="custom"
                          key={event}
                          type="button"
                          onClick={() => toggleEvent(event as IntegrationEvent)}
                          rightIcon={
                            isSelected ? (
                              <Icon.Check size={14} className={colors.text} />
                            ) : undefined
                          }
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border text-sm transition-all ${
                            isSelected
                              ? `${colors.lightBg} ${colors.border.split(" ")[0]}`
                              : `border-notion-light-border dark:border-notion-dark-border ${colors.hoverBg}`
                          }`}
                        >
                          <span className={isSelected ? colors.text : ""}>
                            {label}
                          </span>
                        </Button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2.5 rounded-lg"
                >
                  Cancel
                </Button>
                <Button
                  variant="custom"
                  type="submit"
                  className={`flex-1 px-4 py-2.5 bg-purple-600 dark:bg-purple-500 hover:bg-purple-700 dark:hover:bg-purple-600 text-white rounded-lg transition-all font-semibold shadow-md active:scale-95`}
                >
                  {editingIntegration.id
                    ? "Save Changes"
                    : "Create Integration"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
