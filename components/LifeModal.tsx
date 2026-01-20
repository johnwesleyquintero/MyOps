import React, { useState } from "react";
import { LifeConstraintEntry } from "../types";
import { Icon, iconProps } from "./Icons";
import { toast } from "sonner";

interface LifeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    constraint: LifeConstraintEntry,
    isUpdate: boolean,
  ) => Promise<boolean>;
  initialData?: LifeConstraintEntry | null;
}

const CATEGORIES = ["Health", "Family", "Personal", "Recovery"] as const;
const ENERGY_LEVELS = ["Low", "Medium", "High"] as const;
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export const LifeModal: React.FC<LifeModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const [formData, setFormData] = useState<Partial<LifeConstraintEntry>>(
    () =>
      initialData || {
        title: "",
        category: "Personal",
        daysOfWeek: [1, 2, 3, 4, 5],
        energyRequirement: "Medium",
        isActive: true,
        startTime: "09:00",
        endTime: "10:00",
        notes: "",
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
        category: "Personal",
        daysOfWeek: [1, 2, 3, 4, 5],
        energyRequirement: "Medium",
        isActive: true,
        startTime: "09:00",
        endTime: "10:00",
        notes: "",
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
    const success = await onSave(
      formData as LifeConstraintEntry,
      !!initialData,
    );
    setIsSubmitting(false);

    if (success) {
      onClose();
    }
  };

  const toggleDay = (day: number) => {
    const current = formData.daysOfWeek || [];
    if (current.includes(day)) {
      setFormData({
        ...formData,
        daysOfWeek: current.filter((d) => d !== day),
      });
    } else {
      setFormData({ ...formData, daysOfWeek: [...current, day].sort() });
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px] animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-notion-light-bg dark:bg-notion-dark-bg w-full max-w-xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 rounded-2xl border border-notion-light-border dark:border-notion-dark-border">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-notion-light-border dark:border-notion-dark-border flex items-center justify-between bg-notion-light-sidebar dark:bg-notion-dark-sidebar">
          <div className="flex items-center gap-3">
            <span className="text-notion-light-muted dark:text-notion-dark-muted">
              <Icon.Heart {...iconProps(18)} />
            </span>
            <h2 className="text-sm font-semibold text-notion-light-text dark:text-notion-dark-text">
              {initialData ? "Edit Constraint" : "New Life Constraint"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-notion-light-border dark:hover:bg-notion-dark-border rounded-md transition-colors"
          >
            <Icon.Close {...iconProps(16)} />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-4">
            {/* Title */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-notion-light-muted dark:text-notion-dark-muted px-1">
                Title
              </label>
              <input
                autoFocus
                type="text"
                placeholder="e.g., Morning Workout, Family Dinner"
                className="w-full px-3 py-2 bg-transparent border border-notion-light-border dark:border-notion-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all text-sm"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Category */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-notion-light-muted dark:text-notion-dark-muted px-1">
                  Category
                </label>
                <select
                  className="w-full px-3 py-2 bg-transparent border border-notion-light-border dark:border-notion-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all text-sm"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      category: e.target
                        .value as LifeConstraintEntry["category"],
                    })
                  }
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Energy */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-notion-light-muted dark:text-notion-dark-muted px-1">
                  Energy Requirement
                </label>
                <select
                  className="w-full px-3 py-2 bg-transparent border border-notion-light-border dark:border-notion-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all text-sm"
                  value={formData.energyRequirement}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      energyRequirement: e.target
                        .value as LifeConstraintEntry["energyRequirement"],
                    })
                  }
                >
                  {ENERGY_LEVELS.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Time Range */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-notion-light-muted dark:text-notion-dark-muted px-1">
                  Start Time (Optional)
                </label>
                <input
                  type="time"
                  className="w-full px-3 py-2 bg-transparent border border-notion-light-border dark:border-notion-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all text-sm"
                  value={formData.startTime || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, startTime: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-notion-light-muted dark:text-notion-dark-muted px-1">
                  End Time (Optional)
                </label>
                <input
                  type="time"
                  className="w-full px-3 py-2 bg-transparent border border-notion-light-border dark:border-notion-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all text-sm"
                  value={formData.endTime || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, endTime: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Days of Week */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-notion-light-muted dark:text-notion-dark-muted px-1">
                Days of Week
              </label>
              <div className="flex justify-between">
                {DAYS.map((day, index) => {
                  const isSelected = formData.daysOfWeek?.includes(index);
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleDay(index)}
                      className={`w-9 h-9 rounded-full text-[10px] font-bold transition-all ${
                        isSelected
                          ? "bg-pink-500 text-white shadow-lg shadow-pink-500/20"
                          : "bg-notion-light-sidebar dark:bg-notion-dark-sidebar border border-notion-light-border dark:border-notion-dark-border text-notion-light-muted"
                      }`}
                    >
                      {day[0]}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-notion-light-muted dark:text-notion-dark-muted px-1">
                Notes
              </label>
              <textarea
                placeholder="Additional details..."
                rows={3}
                className="w-full px-3 py-2 bg-transparent border border-notion-light-border dark:border-notion-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all text-sm resize-none"
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
              />
            </div>
          </div>
        </form>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-notion-light-border dark:border-notion-dark-border bg-notion-light-sidebar dark:bg-notion-dark-sidebar flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-notion-light-text dark:text-notion-dark-text hover:bg-notion-light-border dark:hover:bg-notion-dark-border rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium bg-pink-500 hover:bg-pink-600 text-white rounded-lg shadow-sm shadow-pink-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Icon.Add {...iconProps(16)} />
            )}
            {initialData ? "Update Constraint" : "Add Constraint"}
          </button>
        </div>
      </div>
    </div>
  );
};
