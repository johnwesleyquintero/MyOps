import React from "react";
import { TaskEntry, PriorityLevel, StatusLevel } from "../types";
import { DEFAULT_PROJECTS, PRIORITIES, STATUSES } from "@/constants";
import { CopyIdButton } from "./CopyIdButton";
import { useTaskForm } from "../hooks/useTaskForm";
import { useMarkdownEditor } from "../hooks/useMarkdownEditor";
import { Icon, iconProps } from "./Icons";

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
      <div className="notion-card w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
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
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-notion-light-hover dark:hover:bg-notion-dark-hover rounded text-notion-light-muted transition-colors"
            >
              <Icon.Close {...iconProps(18)} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto p-6 space-y-6"
        >
          {/* Main Content Area */}
          <div className="space-y-4">
            <div className="relative group">
              <textarea
                ref={textareaRef}
                className="w-full bg-transparent text-lg font-medium text-notion-light-text dark:text-notion-dark-text placeholder-notion-light-muted dark:placeholder-notion-dark-muted border-none focus:ring-0 p-0 resize-none min-h-[40px]"
                placeholder="What needs to be done?"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                autoFocus
                rows={1}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = "auto";
                  target.style.height = `${target.scrollHeight}px`;
                }}
              />
            </div>

            <div className="grid grid-cols-2 gap-6 pt-4 border-t border-notion-light-border dark:border-notion-dark-border">
              {/* Project Selection */}
              <div className="space-y-1.5">
                <label className="notion-label">Project</label>
                <div className="relative">
                  <select
                    className="notion-input w-full appearance-none"
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
                  {isCustomProject && (
                    <input
                      type="text"
                      className="notion-input mt-2 w-full"
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
              <div className="space-y-1.5">
                <label className="notion-label">Status</label>
                <select
                  className="notion-input w-full appearance-none"
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
              </div>

              {/* Priority Selection */}
              <div className="space-y-1.5">
                <label className="notion-label">Priority</label>
                <select
                  className="notion-input w-full appearance-none"
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
              </div>

              {/* Date Input */}
              <div className="space-y-1.5">
                <label className="notion-label">Due Date</label>
                <input
                  type="date"
                  className="notion-input w-full"
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
                className="px-3 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-500/10 dark:hover:bg-red-500/20 rounded transition-colors"
              >
                Delete
              </button>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="notion-button notion-button-ghost"
            >
              Cancel
            </button>
            <button
              onClick={() => handleSubmit()}
              disabled={isSubmitting || !formData.description}
              className="notion-button notion-button-primary disabled:opacity-50"
            >
              {isSubmitting
                ? "Saving..."
                : initialData
                  ? "Update Task"
                  : "Create Task"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
