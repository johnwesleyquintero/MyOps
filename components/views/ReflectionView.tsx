import React, { useState } from "react";
import { ReflectionEntry } from "../../types";
import { Icon, iconProps } from "../Icons";
import { ViewHeader } from "../ViewHeader";
import { ReflectionModal } from "../ReflectionModal";
import { Button } from "../ui";
import { MODULE_COLORS } from "@/constants";

interface ReflectionViewProps {
  reflections: ReflectionEntry[];
  isLoading: boolean;
  onSave: (reflection: ReflectionEntry, isUpdate: boolean) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
}

export const ReflectionView: React.FC<ReflectionViewProps> = ({
  reflections,
  isLoading,
  onSave,
  onDelete,
}) => {
  const [filter, setFilter] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReflection, setEditingReflection] =
    useState<ReflectionEntry | null>(null);

  const handleCreate = () => {
    setEditingReflection(null);
    setIsModalOpen(true);
  };

  const handleEdit = (reflection: ReflectionEntry) => {
    setEditingReflection(reflection);
    setIsModalOpen(true);
  };

  const filteredReflections = reflections.filter(
    (r) =>
      r.title.toLowerCase().includes(filter.toLowerCase()) ||
      r.type.toLowerCase().includes(filter.toLowerCase()) ||
      r.content.toLowerCase().includes(filter.toLowerCase()),
  );

  const colors = MODULE_COLORS.reflection;
  const aiColors = MODULE_COLORS.ai;
  const crmColors = MODULE_COLORS.crm;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <ViewHeader
        title="Feedback & Reflection"
        subTitle="Close the loop on missions and capture mistake avoidance logs"
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <Icon.Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-notion-light-muted dark:text-notion-dark-muted"
              size={14}
            />
            <input
              type="text"
              placeholder="Search reflections..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="pl-9 pr-4 py-2 bg-notion-light-sidebar dark:bg-notion-dark-sidebar border border-notion-light-border dark:border-notion-dark-border rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-notion-light-text/20 transition-all w-64"
            />
          </div>
          <Button
            variant="custom"
            className={`flex items-center gap-2 px-4 py-2 ${colors.bg.replace("500/10", "500").replace("500/20", "500")} text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:opacity-90 transition-all active:scale-95 shadow-lg shadow-teal-500/20`}
            onClick={handleCreate}
          >
            <Icon.Add size={14} />
            New Reflection
          </Button>
        </div>
      </ViewHeader>

      <ReflectionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={onSave}
        initialData={editingReflection}
      />

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-64 bg-notion-light-sidebar dark:bg-notion-dark-sidebar animate-pulse rounded-2xl border border-notion-light-border dark:border-notion-dark-border"
            ></div>
          ))}
        </div>
      ) : filteredReflections.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-notion-light-sidebar dark:bg-notion-dark-sidebar rounded-3xl border border-dashed border-notion-light-border dark:border-notion-dark-border">
          <div className="w-16 h-16 bg-notion-light-bg dark:bg-notion-dark-bg rounded-2xl flex items-center justify-center mb-4 shadow-sm">
            <Icon.History size={32} className="opacity-20" />
          </div>
          <h3 className="text-sm font-bold text-notion-light-text dark:text-notion-dark-text">
            No reflections found
          </h3>
          <p className="text-xs text-notion-light-muted dark:text-notion-dark-muted mt-1">
            Capture learnings from your completed projects.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReflections.map((reflection) => (
            <div
              key={reflection.id}
              className={`group relative bg-notion-light-sidebar dark:bg-notion-dark-sidebar p-6 rounded-2xl border border-notion-light-border dark:border-notion-dark-border ${colors.border.replace("border-", "hover:border-").split(" ")[0]} transition-all hover:shadow-xl ${colors.bg.replace("bg-", "hover:shadow-").split("/")[0]}/5 flex flex-col gap-4 cursor-pointer`}
              onClick={() => handleEdit(reflection)}
            >
              <div className="flex items-start justify-between">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-widest ${colors.text}`}
                    >
                      {reflection.type}
                    </span>
                    <span className="text-[10px] text-notion-light-muted dark:text-notion-dark-muted">
                      {reflection.date}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-notion-light-text dark:text-notion-dark-text line-clamp-1">
                    {reflection.title}
                  </h3>
                </div>
                <Button
                  variant="custom"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm("Delete this reflection?"))
                      onDelete(reflection.id);
                  }}
                  className={`opacity-0 group-hover:opacity-100 p-1.5 ${MODULE_COLORS.error.bg.replace("bg-", "hover:bg-")} text-notion-light-muted ${MODULE_COLORS.error.text.replace("text-", "hover:text-")} rounded-md transition-all`}
                >
                  <Icon.Delete {...iconProps(14)} />
                </Button>
              </div>

              <p className="text-xs text-notion-light-muted dark:text-notion-dark-muted line-clamp-3 leading-relaxed">
                {reflection.content}
              </p>

              {(reflection.learnings?.length > 0 ||
                reflection.actionItems?.length > 0) && (
                <div className="pt-4 border-t border-notion-light-border dark:border-notion-dark-border mt-auto flex flex-col gap-3">
                  {reflection.learnings?.length > 0 && (
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[10px] font-semibold text-notion-light-muted dark:text-notion-dark-muted flex items-center gap-1.5">
                        <Icon.Active
                          size={10}
                          className={crmColors.text.split(" ")[0]}
                        />
                        LEARNINGS
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {reflection.learnings.slice(0, 2).map((l, i) => (
                          <span
                            key={i}
                            className={`px-2 py-0.5 ${crmColors.bg} ${crmColors.text} rounded-full text-[9px] font-medium border ${crmColors.border} max-w-full truncate`}
                          >
                            {l}
                          </span>
                        ))}
                        {reflection.learnings.length > 2 && (
                          <span className="text-[9px] text-notion-light-muted">
                            +{reflection.learnings.length - 2} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {reflection.actionItems?.length > 0 && (
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[10px] font-semibold text-notion-light-muted dark:text-notion-dark-muted flex items-center gap-1.5">
                        <Icon.Bot
                          size={10}
                          className={aiColors.text.split(" ")[0]}
                        />
                        ACTION ITEMS
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {reflection.actionItems.slice(0, 2).map((a, i) => (
                          <span
                            key={i}
                            className={`px-2 py-0.5 ${aiColors.bg} ${aiColors.text} rounded-full text-[9px] font-medium border ${aiColors.border} max-w-full truncate`}
                          >
                            {a}
                          </span>
                        ))}
                        {reflection.actionItems.length > 2 && (
                          <span className="text-[9px] text-notion-light-muted">
                            +{reflection.actionItems.length - 2} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
