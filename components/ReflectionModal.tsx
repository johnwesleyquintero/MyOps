import React, { useState } from "react";
import { ReflectionEntry } from "../types";
import { Icon, iconProps } from "./Icons";
import { toast } from "sonner";
import { MODULE_COLORS } from "../constants/ui";
import { Button } from "./ui";

interface ReflectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (reflection: ReflectionEntry, isUpdate: boolean) => Promise<boolean>;
  initialData?: ReflectionEntry | null;
}

const REFLECTION_TYPES = [
  "Post-Mortem",
  "Weekly",
  "Monthly",
  "Mistake Log",
] as const;

export const ReflectionModal: React.FC<ReflectionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const colors = MODULE_COLORS.reflection;
  const [formData, setFormData] = useState<Partial<ReflectionEntry>>(
    () =>
      initialData || {
        title: "",
        date: new Date().toISOString().split("T")[0],
        type: "Post-Mortem",
        content: "",
        learnings: [],
        actionItems: [],
      },
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [prevInitialData, setPrevInitialData] = useState(initialData);
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);

  // Sync form data when initialData or isOpen changes
  if (initialData !== prevInitialData || isOpen !== prevIsOpen) {
    setPrevInitialData(initialData);
    setPrevIsOpen(isOpen);
    setFormData(
      initialData || {
        title: "",
        date: new Date().toISOString().split("T")[0],
        type: "Post-Mortem",
        content: "",
        learnings: [],
        actionItems: [],
      },
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) {
      toast.error("Please provide a title");
      return;
    }

    setIsSubmitting(true);
    const success = await onSave(formData as ReflectionEntry, !!initialData);
    setIsSubmitting(false);

    if (success) {
      onClose();
    }
  };

  const addListEntry = (field: "learnings" | "actionItems") => {
    const current = formData[field] || [];
    setFormData({ ...formData, [field]: [...current, ""] });
  };

  const updateListEntry = (
    field: "learnings" | "actionItems",
    index: number,
    value: string,
  ) => {
    const current = [...(formData[field] || [])];
    current[index] = value;
    setFormData({ ...formData, [field]: current });
  };

  const removeListEntry = (
    field: "learnings" | "actionItems",
    index: number,
  ) => {
    const current = (formData[field] || []).filter((_, i) => i !== index);
    setFormData({ ...formData, [field]: current });
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px] animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-notion-light-bg dark:bg-notion-dark-bg w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200 rounded-2xl border border-notion-light-border dark:border-notion-dark-border">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-notion-light-border dark:border-notion-dark-border flex items-center justify-between bg-notion-light-sidebar dark:bg-notion-dark-sidebar">
          <div className="flex items-center gap-3">
            <span className="text-notion-light-muted dark:text-notion-dark-muted">
              <Icon.History {...iconProps(18)} />
            </span>
            <h2 className="text-sm font-semibold text-notion-light-text dark:text-notion-dark-text">
              {initialData ? "Edit Reflection" : "New Reflection"}
            </h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="hover:bg-notion-light-border dark:hover:bg-notion-dark-border"
          >
            <Icon.Close {...iconProps(16)} />
          </Button>
        </div>

        {/* Modal Body */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto p-6 space-y-6"
        >
          <div className="grid grid-cols-2 gap-4">
            {/* Title */}
            <div className="col-span-2 space-y-1.5">
              <label className="text-xs font-medium text-notion-light-muted dark:text-notion-dark-muted px-1">
                Reflection Title
              </label>
              <input
                autoFocus
                type="text"
                placeholder="What are we reflecting on?"
                className={`w-full px-3 py-2 bg-transparent border border-notion-light-border dark:border-notion-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:focus:border-indigo-400 transition-all text-sm`}
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
              />
            </div>

            {/* Date */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-notion-light-muted dark:text-notion-dark-muted px-1">
                Date
              </label>
              <input
                type="date"
                className={`w-full px-3 py-2 bg-transparent border border-notion-light-border dark:border-notion-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:focus:border-indigo-400 transition-all text-sm`}
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
              />
            </div>

            {/* Type */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-notion-light-muted dark:text-notion-dark-muted px-1">
                Type
              </label>
              <select
                className={`w-full px-3 py-2 bg-transparent border border-notion-light-border dark:border-notion-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:focus:border-indigo-400 transition-all text-sm`}
                value={formData.type}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    type: e.target.value as ReflectionEntry["type"],
                  })
                }
              >
                {REFLECTION_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Content / Narrative */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-notion-light-muted dark:text-notion-dark-muted px-1 flex items-center gap-2">
              Narrative & Observations
            </label>
            <textarea
              placeholder="Deep dive into what happened..."
              rows={4}
              className={`w-full px-3 py-2 bg-transparent border border-notion-light-border dark:border-notion-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:focus:border-indigo-400 transition-all text-sm resize-none`}
              value={formData.content}
              onChange={(e) =>
                setFormData({ ...formData, content: e.target.value })
              }
            />
          </div>

          {/* Learnings List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <label className="text-xs font-medium text-notion-light-muted dark:text-notion-dark-muted">
                Key Learnings
              </label>
              <Button
                type="button"
                variant="ghost"
                size="xs"
                onClick={() => addListEntry("learnings")}
                className={`font-semibold ${colors.text} hover:opacity-80`}
                leftIcon={<Icon.Plus {...iconProps(10)} />}
              >
                Add Learning
              </Button>
            </div>
            <div className="space-y-2">
              {(formData.learnings || []).map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Insight..."
                    className={`flex-1 px-3 py-1.5 bg-transparent border border-notion-light-border dark:border-notion-dark-border rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all text-xs`}
                    value={item}
                    onChange={(e) =>
                      updateListEntry("learnings", index, e.target.value)
                    }
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeListEntry("learnings", index)}
                    className={`text-notion-light-muted ${MODULE_COLORS.error.text}`}
                  >
                    <Icon.Close {...iconProps(12)} />
                  </Button>
                </div>
              ))}
              {(!formData.learnings || formData.learnings.length === 0) && (
                <p className="text-[11px] text-notion-light-muted dark:text-notion-dark-muted/50 italic px-1">
                  No learnings recorded yet.
                </p>
              )}
            </div>
          </div>

          {/* Action Items List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <label className="text-xs font-medium text-notion-light-muted dark:text-notion-dark-muted">
                Action Items (Future Prevention/Optimization)
              </label>
              <Button
                type="button"
                variant="ghost"
                size="xs"
                onClick={() => addListEntry("actionItems")}
                className={`font-semibold ${colors.text} hover:opacity-80`}
                leftIcon={<Icon.Plus {...iconProps(10)} />}
              >
                Add Action
              </Button>
            </div>
            <div className="space-y-2">
              {(formData.actionItems || []).map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Next step..."
                    className={`flex-1 px-3 py-1.5 bg-transparent border border-notion-light-border dark:border-notion-dark-border rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all text-xs`}
                    value={item}
                    onChange={(e) =>
                      updateListEntry("actionItems", index, e.target.value)
                    }
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeListEntry("actionItems", index)}
                    className="text-notion-light-muted hover:text-red-500"
                  >
                    <Icon.Close {...iconProps(12)} />
                  </Button>
                </div>
              ))}
              {(!formData.actionItems || formData.actionItems.length === 0) && (
                <p className="text-[11px] text-notion-light-muted dark:text-notion-dark-muted/50 italic px-1">
                  No action items defined.
                </p>
              )}
            </div>
          </div>
        </form>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-notion-light-border dark:border-notion-dark-border bg-notion-light-sidebar dark:bg-notion-dark-sidebar flex items-center justify-end gap-3">
          <Button
            variant="ghost"
            onClick={onClose}
            className={`px-4 py-2 text-sm font-medium text-notion-light-text dark:text-notion-dark-text hover:${colors.lightBg}`}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="custom"
            isLoading={isSubmitting}
            leftIcon={!isSubmitting && <Icon.Active {...iconProps(16)} />}
            className={`px-4 py-2 text-sm font-medium ${colors.bg} ${colors.text} ${colors.border} border rounded-lg shadow-sm hover:opacity-80 active:scale-95`}
          >
            {initialData ? "Update Reflection" : "Archive Reflection"}
          </Button>
        </div>
      </div>
    </div>
  );
};
