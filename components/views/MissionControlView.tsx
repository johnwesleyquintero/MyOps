import React, { useState } from "react";
import { TaskEntry } from "../../types";
import { ViewMode } from "../../hooks/useMissionControl";
import { generateAndDownloadCSV } from "../../utils/exportUtils";
import { FilterBar } from "../FilterBar";
import { TaskTable } from "../TaskTable";
import { KanbanBoard } from "../KanbanBoard";
import { GanttChart } from "../GanttChart";
import { ConfirmationModal } from "../ConfirmationModal";

interface MissionControlViewProps {
  entries: TaskEntry[];
  filteredEntries: TaskEntry[];
  isLoading: boolean;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  searchQuery: string;
  setSearchQuery: (s: string) => void;
  selectedCategory: string;
  setSelectedCategory: (s: string) => void;
  selectedStatus: string;
  setSelectedStatus: (s: string) => void;
  selectedMonth: string;
  setSelectedMonth: (s: string) => void;
  isAiSortEnabled: boolean;
  setIsAiSortEnabled: (v: boolean) => void;
  availableCategories: string[];
  onEdit: (entry: TaskEntry) => void;
  onDelete: (entry: TaskEntry) => void;
  onBulkDelete: (entries: TaskEntry[]) => Promise<void>;
  onStatusUpdate: (entry: TaskEntry) => void;
  onDescriptionUpdate: (entry: TaskEntry, desc: string) => void;
  onFocus: (entry: TaskEntry) => void;
  onDuplicate: (entry: TaskEntry) => void;
  onAdd: () => void;
}

export const MissionControlView: React.FC<MissionControlViewProps> = ({
  entries,
  filteredEntries,
  isLoading,
  viewMode,
  setViewMode,
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  selectedStatus,
  setSelectedStatus,
  selectedMonth,
  setSelectedMonth,
  isAiSortEnabled,
  setIsAiSortEnabled,
  availableCategories,
  onEdit,
  onDelete,
  onBulkDelete,
  onStatusUpdate,
  onDescriptionUpdate,
  onFocus,
  onDuplicate,
  onAdd,
}) => {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [transitioning, setTransitioning] = useState<boolean>(false);

  // Trigger a brief transition state when view changes
  const handleViewChange = (newMode: ViewMode) => {
    if (newMode === viewMode) return;
    setTransitioning(true);
    setTimeout(() => {
      setViewMode(newMode);
      setTransitioning(false);
    }, 50);
  };

  const executeBulkDelete = async () => {
    setIsProcessing(true);
    await onBulkDelete(filteredEntries);
    setIsProcessing(false);
    setIsDeleteModalOpen(false);
  };

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        {/* Notion-style View Tabs */}
        <div className="flex items-center gap-1">
          {(["TABLE", "KANBAN", "GANTT"] as ViewMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => handleViewChange(mode)}
              className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${viewMode === mode ? "bg-notion-light-hover dark:bg-notion-dark-hover text-notion-light-text dark:text-notion-dark-text" : "text-notion-light-muted dark:text-notion-dark-muted hover:bg-notion-light-hover dark:hover:bg-notion-dark-hover"}`}
            >
              {mode.charAt(0) + mode.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 self-end md:self-auto">
          {viewMode === "TABLE" && filteredEntries.length > 0 && (
            <button
              onClick={() => setIsDeleteModalOpen(true)}
              className="notion-button notion-button-ghost text-red-600 dark:text-red-400"
              title="Clear View"
            >
              CLEAR
            </button>
          )}
          <button
            onClick={() => generateAndDownloadCSV(filteredEntries)}
            className="notion-button notion-button-ghost"
            title="Export CSV"
          >
            EXPORT
          </button>
        </div>
      </div>

      <FilterBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        selectedStatus={selectedStatus}
        setSelectedStatus={setSelectedStatus}
        selectedMonth={selectedMonth}
        setSelectedMonth={setSelectedMonth}
        isAiSortEnabled={isAiSortEnabled}
        setIsAiSortEnabled={setIsAiSortEnabled}
        availableCategories={availableCategories}
      />

      {/* View Transition Wrapper */}
      <div
        className={`transition-all duration-300 ${transitioning ? "opacity-0 scale-[0.99] translate-y-1" : "opacity-100 scale-100 translate-y-0 animate-view-switch"}`}
      >
        {viewMode === "TABLE" && (
          <TaskTable
            entries={filteredEntries}
            isLoading={isLoading}
            onEdit={onEdit}
            onDelete={onDelete}
            onStatusUpdate={onStatusUpdate}
            onDescriptionUpdate={onDescriptionUpdate}
            onFocus={onFocus}
            onDuplicate={onDuplicate}
            allEntries={entries}
          />
        )}

        {viewMode === "KANBAN" && (
          <KanbanBoard
            entries={filteredEntries}
            onEdit={onEdit}
            onStatusUpdate={onStatusUpdate}
            onAdd={onAdd}
            onFocus={onFocus}
            onDuplicate={onDuplicate}
            allEntries={entries}
          />
        )}

        {viewMode === "GANTT" && (
          <GanttChart entries={filteredEntries} onEdit={onEdit} />
        )}
      </div>

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={executeBulkDelete}
        title="Clear Current View"
        confirmText="Delete All"
        isLoading={isProcessing}
      >
        <p>
          Delete {filteredEntries.length} tasks visible in the current view?
        </p>
      </ConfirmationModal>
    </div>
  );
};
