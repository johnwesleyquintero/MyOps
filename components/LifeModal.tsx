import React, { useState } from "react";
import { LifeConstraintEntry } from "../types";
import { Icon } from "./Icons";
import { toast } from "sonner";
import { MODULE_COLORS } from "../constants/ui";
import { Button, Badge, Card } from "./ui";

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
  const colors = MODULE_COLORS.life;
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <Card
        padding="none"
        className="w-full max-w-xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300 rounded-2xl border-none"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-notion-light-border dark:border-notion-dark-border flex items-center justify-between bg-notion-light-sidebar/50 dark:bg-notion-dark-sidebar/50 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <div
              className={`p-2 ${colors.bg} ${colors.text} rounded-lg shadow-sm border ${colors.border}`}
            >
              <Icon.Heart size={16} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-notion-light-text dark:text-notion-dark-text uppercase tracking-widest">
                {initialData ? "Vital Constraint" : "New Life Parameter"}
              </h2>
              {initialData && (
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-40">
                    Category:
                  </span>
                  <Badge
                    variant="custom"
                    size="xs"
                    className={`${colors.lightBg} ${colors.text} border ${colors.border} rounded-md px-1.5 py-0 text-[8px] font-black uppercase tracking-widest`}
                  >
                    {formData.category}
                  </Badge>
                </div>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="w-9 h-9 text-notion-light-muted hover:bg-notion-light-hover dark:hover:bg-notion-dark-hover transition-all rounded-lg"
          >
            <Icon.Close size={18} />
          </Button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="flex flex-col min-h-0">
          <div className="p-8 space-y-8 overflow-y-auto max-h-[70vh] custom-scrollbar">
            <div className="space-y-6">
              {/* Title */}
              <div>
                <div className="flex items-center gap-2 mb-1.5 ml-1">
                  <Icon.Target size={12} className="opacity-40" />
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-40">
                    Constraint Objective
                  </span>
                </div>
                <input
                  autoFocus
                  type="text"
                  placeholder="e.g., Morning Workout, Family Dinner"
                  className="w-full border border-notion-light-border dark:border-notion-dark-border rounded-xl px-4 py-2.5 text-sm font-bold focus:outline-none focus:ring-1 focus:ring-blue-500/30 bg-notion-light-bg dark:bg-notion-dark-bg text-notion-light-text dark:text-notion-dark-text transition-all shadow-sm"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-8">
                {/* Category */}
                <div>
                  <div className="flex items-center gap-2 mb-1.5 ml-1">
                    <Icon.Tag size={12} className="opacity-40" />
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-40">
                      Sector
                    </span>
                  </div>
                  <div className="relative">
                    <select
                      className="w-full border border-notion-light-border dark:border-notion-dark-border rounded-xl pl-4 pr-10 py-2.5 appearance-none text-xs font-bold focus:outline-none focus:ring-1 focus:ring-blue-500/30 bg-notion-light-bg dark:bg-notion-dark-bg text-notion-light-text dark:text-notion-dark-text transition-all cursor-pointer shadow-sm"
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
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-notion-light-muted opacity-40">
                      <Icon.ChevronDown size={14} />
                    </div>
                  </div>
                </div>

                {/* Energy */}
                <div>
                  <div className="flex items-center gap-2 mb-1.5 ml-1">
                    <Icon.Zap size={12} className="opacity-40" />
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-40">
                      Energy Load
                    </span>
                  </div>
                  <div className="relative">
                    <select
                      className="w-full border border-notion-light-border dark:border-notion-dark-border rounded-xl pl-4 pr-10 py-2.5 appearance-none text-xs font-bold focus:outline-none focus:ring-1 focus:ring-blue-500/30 bg-notion-light-bg dark:bg-notion-dark-bg text-notion-light-text dark:text-notion-dark-text transition-all cursor-pointer shadow-sm"
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
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-notion-light-muted opacity-40">
                      <Icon.ChevronDown size={14} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Time Range */}
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <div className="flex items-center gap-2 mb-1.5 ml-1">
                    <Icon.Clock size={12} className="opacity-40" />
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-40">
                      Window Open
                    </span>
                  </div>
                  <input
                    type="time"
                    className="w-full border border-notion-light-border dark:border-notion-dark-border rounded-xl px-4 py-2.5 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-blue-500/30 bg-notion-light-bg dark:bg-notion-dark-bg text-notion-light-text dark:text-notion-dark-text transition-all cursor-pointer shadow-sm"
                    value={formData.startTime || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, startTime: e.target.value })
                    }
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1.5 ml-1">
                    <Icon.Clock size={12} className="opacity-40" />
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-40">
                      Window Close
                    </span>
                  </div>
                  <input
                    type="time"
                    className="w-full border border-notion-light-border dark:border-notion-dark-border rounded-xl px-4 py-2.5 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-blue-500/30 bg-notion-light-bg dark:bg-notion-dark-bg text-notion-light-text dark:text-notion-dark-text transition-all cursor-pointer shadow-sm"
                    value={formData.endTime || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, endTime: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* Days of Week */}
              <div>
                <div className="flex items-center gap-2 mb-3 ml-1">
                  <Icon.Calendar size={12} className="opacity-40" />
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-40">
                    Operational Schedule
                  </span>
                </div>
                <div className="flex justify-between gap-2">
                  {DAYS.map((day, index) => {
                    const isSelected = formData.daysOfWeek?.includes(index);
                    return (
                      <Button
                        key={day}
                        type="button"
                        variant="custom"
                        onClick={() => toggleDay(index)}
                        className={`flex-1 h-10 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                          isSelected
                            ? `${colors.bg} ${colors.text} ${colors.border} border shadow-lg shadow-rose-500/10`
                            : "bg-notion-light-bg dark:bg-notion-dark-bg border border-notion-light-border dark:border-notion-dark-border text-notion-light-muted opacity-40 hover:opacity-100"
                        }`}
                      >
                        {day[0]}
                      </Button>
                    );
                  })}
                </div>
              </div>

              {/* Notes */}
              <div>
                <div className="flex items-center gap-2 mb-1.5 ml-1">
                  <Icon.Notes size={12} className="opacity-40" />
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-40">
                    Strategic Notes
                  </span>
                </div>
                <textarea
                  placeholder="Additional operational details..."
                  className="w-full border border-notion-light-border dark:border-notion-dark-border rounded-xl px-4 py-2.5 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-blue-500/30 bg-notion-light-bg dark:bg-notion-dark-bg text-notion-light-text dark:text-notion-dark-text min-h-[100px] resize-none transition-all shadow-sm"
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                />
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="px-8 py-4 border-t border-notion-light-border dark:border-notion-dark-border flex items-center justify-end gap-4 bg-notion-light-sidebar/50 dark:bg-notion-dark-sidebar/50 backdrop-blur-md">
            <Button
              variant="ghost"
              onClick={onClose}
              className="text-[10px] font-black uppercase tracking-widest text-notion-light-muted dark:text-notion-dark-muted px-6 py-2"
            >
              Stand Down
            </Button>
            <Button
              type="submit"
              variant="custom"
              isLoading={isSubmitting}
              className={`px-8 py-2 ${colors.bg} ${colors.text} ${colors.border} border rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-rose-500/10 ${colors.hoverBg} transition-all active:scale-95`}
            >
              {initialData ? "Sync Parameter" : "Initialize Constraint"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
