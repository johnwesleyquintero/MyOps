import React, { useState } from "react";
import { LifeConstraintEntry } from "../../types";
import { Icon, iconProps } from "../Icons";
import { ViewHeader } from "../ViewHeader";
import { LifeModal } from "../LifeModal";
import { Button } from "../ui/Button";
import { MODULE_COLORS } from "@/constants";

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

  const colors = MODULE_COLORS.life;

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
        return `${MODULE_COLORS.energy_high.text} ${MODULE_COLORS.energy_high.lightBg} ${MODULE_COLORS.energy_high.border.split(" ")[0]}`;
      case "Medium":
        return `${MODULE_COLORS.energy_medium.text} ${MODULE_COLORS.energy_medium.lightBg} ${MODULE_COLORS.energy_medium.border.split(" ")[0]}`;
      case "Low":
        return `${MODULE_COLORS.energy_low.text} ${MODULE_COLORS.energy_low.lightBg} ${MODULE_COLORS.energy_low.border.split(" ")[0]}`;
      default:
        return "text-notion-light-muted bg-notion-light-muted/10 border-notion-light-border";
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
        <Button
          variant="custom"
          className={`flex items-center gap-2 px-4 py-2 ${colors.bg} ${colors.text} ${colors.border} border rounded-xl text-[10px] font-bold uppercase tracking-widest ${colors.hoverBg} transition-all active:scale-95 shadow-sm`}
          onClick={handleCreate}
        >
          <Icon.Add size={14} />
          Add Constraint
        </Button>
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
            <Icon.Heart size={32} className={`${colors.text} opacity-20`} />
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
              className={`group relative bg-white dark:bg-notion-dark-sidebar p-6 rounded-2xl border border-notion-light-border dark:border-notion-dark-border ${colors.hoverBg} transition-all hover:shadow-xl flex flex-col gap-4 cursor-pointer`}
              onClick={() => handleEdit(constraint)}
            >
              <div className="flex items-start justify-between">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-widest ${colors.text} flex items-center gap-1.5`}
                    >
                      {getCategoryIcon(constraint.category)}
                      {constraint.category}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${getEnergyColor(constraint.energyRequirement)}`}
                    >
                      {constraint.energyRequirement} Energy
                    </span>
                  </div>
                  <h3
                    className={`text-sm font-bold text-notion-light-text dark:text-notion-dark-text ${colors.text.replace("text-", "group-hover:text-")} transition-colors`}
                  >
                    {constraint.title}
                  </h3>
                </div>
                <Button
                  variant="custom"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm("Remove this constraint?"))
                      onDelete(constraint.id);
                  }}
                  className={`opacity-0 group-hover:opacity-100 p-1.5 ${MODULE_COLORS.error.bg} ${MODULE_COLORS.error.text} rounded-md transition-all text-notion-light-muted dark:text-notion-dark-muted ${MODULE_COLORS.error.text.replace("text-", "hover:text-")} ${MODULE_COLORS.error.bg.replace("bg-", "hover:bg-")}`}
                >
                  <Icon.Delete {...iconProps(14)} />
                </Button>
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
                          ? `${colors.bg} ${colors.text} ${colors.border} shadow-sm`
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
