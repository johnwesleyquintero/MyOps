import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { TaskEntry, PriorityLevel, StatusLevel } from "../types";
import { PRIORITIES, STATUSES } from "@/constants";
import { CopyIdButton } from "./CopyIdButton";
import { useTaskForm } from "../hooks/useTaskForm";
import { useMarkdownEditor } from "../hooks/useMarkdownEditor";
import { Icon } from "./Icons";
import { Button, Card, Badge } from "./ui";
import { toast } from "sonner";
import { useUi } from "../hooks/useUi";
import { useData } from "../hooks/useData";

export const TaskModal: React.FC = React.memo(() => {
  const ui = useUi();
  const { tasks, strategy } = useData();
  const {
    entries,
    saveTransaction: saveEntry,
    removeTransaction: deleteEntry,
    isSubmitting,
  } = tasks;
  const { decisions: decisionEntries } = strategy;
  const {
    isTaskModalOpen: isOpen,
    setIsTaskModalOpen,
    editingEntry: initialData,
  } = ui;

  const onClose = () => setIsTaskModalOpen(false);

  const onSubmit = async (entry: TaskEntry) => {
    await saveEntry(entry, !!initialData);
  };

  const onDelete = async (entry: TaskEntry) => {
    await deleteEntry(entry);
  };

  const {
    formData,
    setFormData,
    isCustomProject,
    setIsCustomProject,
    availableProjects,
  } = useTaskForm(initialData, entries, decisionEntries);

  const [copiedMd, setCopiedMd] = useState(false);

  const handleCopyMarkdown = async () => {
    const md = `### ${formData.description}\n\n- **Project:** ${formData.project}\n- **Priority:** ${formData.priority}\n- **Status:** ${formData.status}\n- **Due Date:** ${formData.date || "N/A"}`;
    try {
      await navigator.clipboard.writeText(md);
      setCopiedMd(true);
      toast.success("Markdown copied to clipboard");
      setTimeout(() => setCopiedMd(false), 2000);
    } catch {
      toast.error("Failed to copy markdown");
    }
  };

  const { textareaRef } = useMarkdownEditor(formData.description, (newText) =>
    setFormData({ ...formData, description: newText }),
  );

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!formData.description || !formData.project) return;
    await onSubmit(formData);
    onClose();
  };

  const handleDelete = async () => {
    if (
      initialData &&
      window.confirm("Are you sure you want to delete this task?")
    ) {
      await onDelete(initialData);
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      handleSubmit();
    }
    if (e.key === "Escape") {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300"
      onKeyDown={handleKeyDown}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <Card
        padding="none"
        className="w-full max-w-4xl shadow-2xl flex flex-col h-full md:h-auto md:max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-300 rounded-2xl border-none"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-notion-light-border dark:border-notion-dark-border flex items-center justify-between bg-notion-light-sidebar/50 dark:bg-notion-dark-sidebar/50 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-notion-light-bg dark:bg-notion-dark-bg rounded-lg shadow-sm border border-notion-light-border dark:border-notion-dark-border">
              <Icon.Add
                size={16}
                className="text-notion-light-text dark:text-notion-dark-text"
              />
            </div>
            <div>
              <h2 className="text-sm font-bold text-notion-light-text dark:text-notion-dark-text uppercase tracking-widest">
                {initialData ? "Mission intelligence" : "New Tactical Mission"}
              </h2>
              {initialData && (
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-40">
                    UID:
                  </span>
                  <CopyIdButton
                    id={initialData.id}
                    className="text-[10px] font-mono opacity-40 hover:opacity-100 transition-opacity"
                  />
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            {initialData && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCopyMarkdown}
                className="w-9 h-9 text-notion-light-muted hover:bg-notion-light-hover dark:hover:bg-notion-dark-hover transition-all rounded-lg"
                title="Copy Task as Markdown"
              >
                {copiedMd ? (
                  <Icon.Check size={16} className="text-green-500" />
                ) : (
                  <Icon.Copy size={16} />
                )}
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="w-9 h-9 text-notion-light-muted hover:bg-notion-light-hover dark:hover:bg-notion-dark-hover transition-all rounded-lg"
            >
              <Icon.Close size={18} />
            </Button>
          </div>
        </div>

        {/* Modal Body */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 flex flex-col min-h-0 overflow-hidden"
        >
          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
            {/* Main Content Area: Editor & Preview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 min-h-[350px]">
              {/* Left: Editor */}
              <div className="flex flex-col space-y-4">
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2 opacity-40">
                    <Icon.Edit size={12} />
                    <span className="text-[10px] font-black uppercase tracking-widest">
                      Mission Description
                    </span>
                  </div>
                  <Badge
                    variant="outline"
                    size="xs"
                    className="font-mono scale-90 opacity-40 border-none"
                  >
                    MARKDOWN
                  </Badge>
                </div>
                <div className="flex-1 relative group bg-notion-light-sidebar/20 dark:bg-notion-dark-sidebar/20 rounded-2xl p-6 border border-notion-light-border/50 dark:border-notion-dark-border/50 focus-within:border-notion-light-border dark:focus-within:border-notion-dark-border transition-all flex flex-col min-h-[250px] shadow-inner">
                  <textarea
                    ref={textareaRef}
                    className="w-full flex-1 bg-transparent text-sm text-notion-light-text dark:text-notion-dark-text placeholder:opacity-30 border-none focus:ring-0 p-0 resize-none font-mono leading-relaxed"
                    placeholder="Describe the mission objective... Support Markdown."
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    autoFocus
                  />
                </div>
              </div>

              {/* Right: Preview */}
              <div className="flex flex-col space-y-4">
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2 opacity-40">
                    <Icon.View size={12} />
                    <span className="text-[10px] font-black uppercase tracking-widest">
                      Tactical Preview
                    </span>
                  </div>
                  <Badge
                    variant="outline"
                    size="xs"
                    className="font-mono scale-90 opacity-40 border-none"
                  >
                    LIVE
                  </Badge>
                </div>
                <div className="flex-1 markdown-preview bg-notion-light-bg dark:bg-notion-dark-bg rounded-2xl p-6 border border-dashed border-notion-light-border/30 dark:border-notion-dark-border/30 min-h-[250px] shadow-sm">
                  {formData.description ? (
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {formData.description}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center">
                      <span className="text-notion-light-muted/30 dark:text-notion-dark-muted/30 italic text-xs font-medium">
                        Waiting for mission details...
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Fixed Metadata Area */}
          <div className="shrink-0 p-8 border-t border-notion-light-border/50 dark:border-notion-dark-border/50 bg-notion-light-sidebar/20 dark:bg-notion-dark-sidebar/20 backdrop-blur-sm">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {/* Project Selection */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-1.5 ml-1">
                  <Icon.Folder size={12} className="opacity-40" />
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-40">
                    Project / Sector
                  </span>
                </div>
                <div className="relative">
                  <select
                    className="w-full border border-notion-light-border dark:border-notion-dark-border rounded-xl pl-4 pr-10 py-2.5 appearance-none text-xs font-bold focus:outline-none focus:ring-1 focus:ring-blue-500/30 bg-notion-light-bg dark:bg-notion-dark-bg text-notion-light-text dark:text-notion-dark-text transition-all cursor-pointer shadow-sm"
                    value={isCustomProject ? "custom" : formData.project}
                    onChange={(e) => {
                      if (e.target.value === "custom") {
                        setIsCustomProject(true);
                        setFormData({ ...formData, project: "" });
                      } else {
                        setIsCustomProject(false);
                        setFormData({ ...formData, project: e.target.value });
                      }
                    }}
                  >
                    {availableProjects.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                    <option value="custom">+ New Project</option>
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-notion-light-muted opacity-40">
                    <Icon.ChevronDown size={14} />
                  </div>
                  {isCustomProject && (
                    <input
                      type="text"
                      className="mt-3 w-full border border-notion-light-border dark:border-notion-dark-border rounded-xl px-4 py-2.5 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-blue-500/30 bg-notion-light-bg dark:bg-notion-dark-bg text-notion-light-text dark:text-notion-dark-text transition-all shadow-sm"
                      placeholder="Project name..."
                      value={formData.project}
                      onChange={(e) =>
                        setFormData({ ...formData, project: e.target.value })
                      }
                      autoFocus
                    />
                  )}
                </div>
              </div>

              {/* Status Selection */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-1.5 ml-1">
                  <Icon.Activity size={12} className="opacity-40" />
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-40">
                    Mission Status
                  </span>
                </div>
                <div className="relative">
                  <select
                    className="w-full border border-notion-light-border dark:border-notion-dark-border rounded-xl pl-4 pr-10 py-2.5 appearance-none text-xs font-bold focus:outline-none focus:ring-1 focus:ring-blue-500/30 bg-notion-light-bg dark:bg-notion-dark-bg text-notion-light-text dark:text-notion-dark-text transition-all cursor-pointer shadow-sm"
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: e.target.value as StatusLevel,
                      })
                    }
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-notion-light-muted opacity-40">
                    <Icon.ChevronDown size={14} />
                  </div>
                </div>
              </div>

              {/* Priority Selection */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-1.5 ml-1">
                  <Icon.Alert size={12} className="opacity-40" />
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-40">
                    Threat Level
                  </span>
                </div>
                <div className="relative">
                  <select
                    className="w-full border border-notion-light-border dark:border-notion-dark-border rounded-xl pl-4 pr-10 py-2.5 appearance-none text-xs font-bold focus:outline-none focus:ring-1 focus:ring-blue-500/30 bg-notion-light-bg dark:bg-notion-dark-bg text-notion-light-text dark:text-notion-dark-text transition-all cursor-pointer shadow-sm"
                    value={formData.priority}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        priority: e.target.value as PriorityLevel,
                      })
                    }
                  >
                    {PRIORITIES.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-notion-light-muted opacity-40">
                    <Icon.ChevronDown size={14} />
                  </div>
                </div>
              </div>

              {/* Date Input */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-1.5 ml-1">
                  <Icon.Date size={12} className="opacity-40" />
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-40">
                    Deadline
                  </span>
                </div>
                <input
                  type="date"
                  className="w-full border border-notion-light-border dark:border-notion-dark-border rounded-xl px-4 py-2 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-blue-500/30 bg-notion-light-bg dark:bg-notion-dark-bg text-notion-light-text dark:text-notion-dark-text transition-all cursor-pointer shadow-sm"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                />
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="px-8 py-4 border-t border-notion-light-border dark:border-notion-dark-border flex items-center justify-between bg-notion-light-sidebar/50 dark:bg-notion-dark-sidebar/50 backdrop-blur-md">
            <div className="flex items-center gap-3">
              {initialData && (
                <Button
                  variant="ghost"
                  onClick={handleDelete}
                  className="text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-500/10 px-4 py-2"
                >
                  Terminate Mission
                </Button>
              )}
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={onClose}
                className="text-[10px] font-black uppercase tracking-widest text-notion-light-muted dark:text-notion-dark-muted px-6 py-2"
              >
                Stand Down
              </Button>
              <Button
                variant="custom"
                onClick={() => handleSubmit()}
                isLoading={isSubmitting}
                disabled={!formData.description}
                className={`px-8 py-2 bg-indigo-600 text-white border border-indigo-500 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50`}
              >
                {initialData ? "Sync Intelligence" : "Execute Deployment"}
              </Button>
            </div>
          </div>
        </form>
      </Card>
    </div>
  );
});
