import React, { useState } from "react";
import { LifeConstraintEntry } from "../../types";
import { Icon, iconProps } from "../Icons";
import { ViewHeader } from "../ViewHeader";
import { LifeModal } from "../LifeModal";

interface LifeViewProps {
  constraints: LifeConstraintEntry[];
  isLoading: boolean;
  onSave: (
    constraint: LifeConstraintEntry,
    isUpdate: boolean,
  ) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export const LifeView: React.FC<LifeViewProps> = ({
  constraints,
  isLoading,
  onSave,
  onDelete,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingConstraint, setEditingConstraint] =
    useState<LifeConstraintEntry | null>(null);

  const handleCreate = () => {
    setEditingConstraint(null);
    setIsModalOpen(true);
  };

  const handleEdit = (constraint: LifeConstraintEntry) => {
    setEditingConstraint(constraint);
    setIsModalOpen(true);
  };

  const getEnergyColor = (energy: string) => {
    switch (energy) {
      case "High":
        return "text-red-500 bg-red-500/10 border-red-500/20";
      case "Medium":
        return "text-amber-500 bg-amber-500/10 border-amber-500/20";
      case "Low":
        return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
      default:
        return "text-notion-light-muted bg-notion-light-muted/10";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Health":
        return <Icon.Activity size={14} />;
      case "Family":
        return <Icon.Users size={14} />;
      case "Personal":
        return <Icon.Heart size={14} />;
      case "Recovery":
        return <Icon.History size={14} />;
      default:
        return <Icon.Blueprint size={14} />;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <ViewHeader
        title="Life Ops & Constraints"
        subTitle="Manage personal energy, recovery, and non-negotiable commitments"
      >
        <button
          className="flex items-center gap-2 px-4 py-2 bg-pink-500 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-pink-600 transition-all active:scale-95 shadow-lg shadow-pink-500/20"
          onClick={handleCreate}
        >
          <Icon.Add size={14} />
          Add Constraint
        </button>
      </ViewHeader>

      <LifeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={onSave}
        initialData={editingConstraint}
      />

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-48 bg-notion-light-sidebar dark:bg-notion-dark-sidebar animate-pulse rounded-2xl border border-notion-light-border dark:border-notion-dark-border"
            ></div>
          ))}
        </div>
      ) : constraints.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-notion-light-sidebar dark:bg-notion-dark-sidebar rounded-3xl border border-dashed border-notion-light-border dark:border-notion-dark-border">
          <div className="w-16 h-16 bg-notion-light-bg dark:bg-notion-dark-bg rounded-2xl flex items-center justify-center mb-4 shadow-sm">
            <Icon.Heart size={32} className="text-pink-500 opacity-20" />
          </div>
          <h3 className="text-sm font-bold text-notion-light-text dark:text-notion-dark-text">
            No life constraints defined
          </h3>
          <p className="text-xs text-notion-light-muted dark:text-notion-dark-muted mt-1">
            Define your boundaries to optimize your operational schedule.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {constraints.map((constraint) => (
            <div
              key={constraint.id}
              className="group relative bg-notion-light-sidebar dark:bg-notion-dark-sidebar p-6 rounded-2xl border border-notion-light-border dark:border-notion-dark-border hover:border-pink-500/30 transition-all hover:shadow-xl hover:shadow-pink-500/5 flex flex-col gap-4 cursor-pointer"
              onClick={() => handleEdit(constraint)}
            >
              <div className="flex items-start justify-between">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-pink-500 flex items-center gap-1.5">
                      {getCategoryIcon(constraint.category)}
                      {constraint.category}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${getEnergyColor(constraint.energyRequirement)}`}
                    >
                      {constraint.energyRequirement} Energy
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-notion-light-text dark:text-notion-dark-text group-hover:text-pink-500 transition-colors">
                    {constraint.title}
                  </h3>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm("Remove this constraint?"))
                      onDelete(constraint.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/10 text-notion-light-muted hover:text-red-500 rounded-md transition-all"
                >
                  <Icon.Delete {...iconProps(14)} />
                </button>
              </div>

              {constraint.startTime && (
                <div className="flex items-center gap-2 text-xs text-notion-light-muted dark:text-notion-dark-muted bg-notion-light-bg dark:bg-notion-dark-bg/50 px-2.5 py-1.5 rounded-lg w-fit border border-notion-light-border dark:border-notion-dark-border/50">
                  <Icon.History size={12} />
                  <span>
                    {constraint.startTime} - {constraint.endTime || "..."}
                  </span>
                </div>
              )}

              <div className="flex items-center gap-1.5">
                {DAYS.map((day, i) => {
                  const isActive = constraint.daysOfWeek.includes(i);
                  return (
                    <span
                      key={day}
                      className={`text-[9px] font-bold w-5 h-5 flex items-center justify-center rounded-md border ${
                        isActive
                          ? "bg-pink-500 text-white border-pink-500 shadow-sm"
                          : "text-notion-light-muted/30 border-notion-light-border dark:border-notion-dark-border"
                      }`}
                    >
                      {day[0]}
                    </span>
                  );
                })}
              </div>

              {constraint.notes && (
                <p className="text-[11px] text-notion-light-muted dark:text-notion-dark-muted line-clamp-2 italic border-t border-notion-light-border dark:border-notion-dark-border pt-3 mt-1">
                  "{constraint.notes}"
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
