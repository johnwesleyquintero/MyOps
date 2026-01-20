import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { TaskEntry, PriorityLevel, StatusLevel } from "../types";
import { DEFAULT_PROJECTS, PRIORITIES, STATUSES } from "@/constants";
import { CopyIdButton } from "./CopyIdButton";
import { useTaskForm } from "../hooks/useTaskForm";
import { useMarkdownEditor } from "../hooks/useMarkdownEditor";
import { Icon, iconProps } from "./Icons";
import { Button } from "./ui/Button";
import { toast } from "sonner";
import { MODULE_COLORS } from "../constants/ui";

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (entry: TaskEntry) => Promise<void>;
  onDelete: (entry: TaskEntry) => Promise<void | boolean>;
  initialData?: TaskEntry | null;
  isSubmitting: boolean;
  entries: TaskEntry[];
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  onDelete,
  initialData,
  isSubmitting,
  entries,
}) => {
  const { formData, setFormData, isCustomProject, setIsCustomProject } =
    useTaskForm(initialData, entries);

  const successColors = MODULE_COLORS.success;
  const errorColors = MODULE_COLORS.error;

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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px] animate-in fade-in duration-200"
      onKeyDown={handleKeyDown}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="notion-card w-full max-w-4xl shadow-2xl flex flex-col h-full md:h-auto md:max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200 rounded-none md:rounded-2xl">
        {/* Modal Header */}
        <div className="px-4 py-3 border-b border-notion-light-border dark:border-notion-dark-border flex items-center justify-between bg-notion-light-sidebar dark:bg-notion-dark-sidebar">
          <div className="flex items-center gap-3">
            <span className="text-notion-light-muted dark:text-notion-dark-muted">
              <Icon.Add {...iconProps(18)} />
            </span>
            <h2 className="text-sm font-semibold text-notion-light-text dark:text-notion-dark-text">
              {initialData ? "Edit Task" : "New Task"}
            </h2>
            {initialData && (
              <div className="flex items-center gap-1.5 ml-2 pl-3 border-l border-notion-light-border dark:border-notion-dark-border">
                <CopyIdButton
                  id={initialData.id}
                  className="text-xs text-notion-light-muted hover:text-notion-light-text dark:hover:text-notion-dark-text"
                />
                <Button
                  variant="custom"
                  onClick={handleCopyMarkdown}
                  className="p-1 text-notion-light-muted hover:text-notion-light-text dark:hover:text-notion-dark-text transition-colors"
                  title="Copy Task as Markdown"
                >
                  {copiedMd ? (
                    <Icon.Check {...iconProps(14, successColors.text)} />
                  ) : (
                    <Icon.Copy {...iconProps(14)} />
                  )}
                </Button>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="custom"
              onClick={onClose}
              className="p-1.5 hover:bg-notion-light-hover dark:hover:bg-notion-dark-hover rounded text-notion-light-muted transition-colors"
            >
              <Icon.Close {...iconProps(18)} />
            </Button>
          </div>
        </div>

        {/* Modal Body */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 flex flex-col min-h-0 overflow-hidden"
        >
          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
            {/* Main Content Area: Editor & Preview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 min-h-[300px]">
              {/* Left: Editor */}
              <div className="flex flex-col space-y-3">
                <div className="flex items-center justify-between">
                  <label className="notion-label">Description (Markdown)</label>
                  <span className="text-[10px] text-notion-light-muted dark:text-notion-dark-muted font-mono">
                    Editor
                  </span>
                </div>
                <div className="flex-1 relative group bg-notion-light-sidebar/30 dark:bg-notion-dark-sidebar/30 rounded-lg p-3 border border-notion-light-border/50 dark:border-notion-dark-border/50 focus-within:border-notion-light-border dark:focus-within:border-notion-dark-border transition-colors flex flex-col min-h-[200px]">
                  <textarea
                    ref={textareaRef}
                    className="w-full flex-1 bg-transparent text-sm text-notion-light-text dark:text-notion-dark-text placeholder-notion-light-muted dark:placeholder-notion-dark-muted border-none focus:ring-0 p-0 resize-none font-mono leading-relaxed"
                    placeholder="What needs to be done? Support Markdown..."
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    autoFocus
                  />
                </div>
              </div>

              {/* Right: Preview */}
              <div className="flex flex-col space-y-3">
                <div className="flex items-center justify-between">
                  <label className="notion-label">Preview</label>
                  <span className="text-[10px] text-notion-light-muted dark:text-notion-dark-muted font-mono">
                    Live View
                  </span>
                </div>
                <div className="flex-1 markdown-preview bg-notion-light-sidebar/10 dark:bg-notion-dark-sidebar/10 rounded-lg p-4 border border-notion-light-border/30 dark:border-notion-dark-border/30 min-h-[200px]">
                  {formData.description ? (
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {formData.description}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <span className="text-notion-light-muted/50 dark:text-notion-dark-muted/50 italic text-xs">
                      No content to preview...
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Fixed Metadata Area */}
          <div className="shrink-0 p-6 border-t border-notion-light-border/50 dark:border-notion-dark-border/50 bg-notion-light-bg/50 dark:bg-notion-dark-bg/50 backdrop-blur-sm">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {/* Project Selection */}
              <div className="space-y-2">
                <label className="notion-label flex items-center gap-1.5">
                  <Icon.Folder {...iconProps(12)} /> Project
                </label>
                <div className="relative">
                  <select
                    className="notion-input w-full appearance-none pr-8 text-xs"
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
                    {DEFAULT_PROJECTS.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                    <option value="custom">+ New Project</option>
                  </select>
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-notion-light-muted">
                    <Icon.ChevronDown {...iconProps(12)} />
                  </div>
                  {isCustomProject && (
                    <input
                      type="text"
                      className="notion-input mt-2 w-full text-xs"
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
              <div className="space-y-2">
                <label className="notion-label flex items-center gap-1.5">
                  <Icon.Clock {...iconProps(12)} /> Status
                </label>
                <div className="relative">
                  <select
                    className="notion-input w-full appearance-none pr-8 text-xs"
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
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-notion-light-muted">
                    <Icon.ChevronDown {...iconProps(12)} />
                  </div>
                </div>
              </div>

              {/* Priority Selection */}
              <div className="space-y-2">
                <label className="notion-label flex items-center gap-1.5">
                  <Icon.Flag {...iconProps(12)} /> Priority
                </label>
                <div className="relative">
                  <select
                    className="notion-input w-full appearance-none pr-8 text-xs"
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
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-notion-light-muted">
                    <Icon.ChevronDown {...iconProps(12)} />
                  </div>
                </div>
              </div>

              {/* Date Input */}
              <div className="space-y-2">
                <label className="notion-label flex items-center gap-1.5">
                  <Icon.Calendar {...iconProps(12)} /> Due Date
                </label>
                <input
                  type="date"
                  className="notion-input w-full text-xs"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                />
              </div>
            </div>
          </div>
        </form>

        {/* Modal Footer */}
        <div className="px-4 py-3 border-t border-notion-light-border dark:border-notion-dark-border flex items-center justify-between bg-notion-light-sidebar dark:bg-notion-dark-sidebar">
          <div className="flex items-center gap-2">
            {initialData && (
              <button
                type="button"
                onClick={handleDelete}
                className={`px-3 py-1.5 text-xs font-medium ${errorColors.text} ${errorColors.hoverBg} rounded transition-colors`}
              >
                Delete
              </button>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="custom"
              type="button"
              onClick={onClose}
              className="notion-button notion-button-ghost"
            >
              Cancel
            </Button>
            <Button
              variant="custom"
              onClick={() => handleSubmit()}
              disabled={isSubmitting || !formData.description}
              className="notion-button notion-button-primary disabled:opacity-50"
            >
              {isSubmitting
                ? "Saving..."
                : initialData
                  ? "Update Task"
                  : "Create Task"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
