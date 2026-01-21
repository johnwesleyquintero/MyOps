import React, { useState } from "react";
import { TaskEntry } from "../../types";
import { ViewMode } from "../../hooks/useMissionControl";
import {
  generateAndDownloadCSV,
  generateMarkdownTable,
} from "../../utils/exportUtils";
import { prefixToHover } from "@/utils/styleUtils";
import { FilterBar } from "../FilterBar";
import { TaskTable } from "../TaskTable";
import { KanbanBoard } from "../KanbanBoard";
import { GanttChart } from "../GanttChart";
import { ConfirmationModal } from "../ConfirmationModal";
import { ViewHeader } from "../ViewHeader";
import { Icon, iconProps } from "../Icons";
import { toast } from "sonner";
import { useTableColumns, ColumnConfig } from "../../hooks/useTableColumns";
import { COLUMN_CONFIG_KEY } from "../../constants/storage";
import { ColumnConfigDropdown } from "../ColumnConfigDropdown";
import { MODULE_COLORS } from "@/constants";
import { Button } from "../ui";

const MISSION_CONTROL_COLUMNS: ColumnConfig[] = [
  { key: "date", label: "Date", visible: true, width: "w-32" },
  {
    key: "description",
    label: "Mission Description",
    visible: true,
    width: "min-w-[400px]",
  },
  { key: "project", label: "Project", visible: true, width: "w-40" },
  { key: "priority", label: "Priority", visible: true, width: "w-32" },
  { key: "status", label: "Status", visible: true, width: "w-32" },
];

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

export const MissionControlView: React.FC<MissionControlViewProps> = React.memo(
  ({
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
    const [copiedMd, setCopiedMd] = useState<boolean>(false);

    const { columns, toggleColumn } = useTableColumns(
      MISSION_CONTROL_COLUMNS,
      COLUMN_CONFIG_KEY,
    );

    const handleCopyMarkdown = async () => {
      if (filteredEntries.length === 0) {
        toast.error("No missions to copy");
        return;
      }

      const mdTable = generateMarkdownTable(filteredEntries);
      try {
        await navigator.clipboard.writeText(mdTable);
        setCopiedMd(true);
        toast.success("Missions copied to clipboard as Markdown table");
        setTimeout(() => setCopiedMd(false), 2000);
      } catch (err) {
        console.error("Failed to copy:", err);
        toast.error("Failed to copy to clipboard");
      }
    };

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
      toast.success("View cleared", {
        description: `${filteredEntries.length} missions have been removed.`,
        icon: <Icon.Delete size={14} />,
      });
    };

    return (
      <div className="animate-fade-in">
        <ViewHeader
          title="Mission Control"
          subTitle="Manage and track your active missions and tasks"
        >
          <div className="flex flex-wrap items-center gap-2 mt-2 md:mt-0">
            {viewMode === "TABLE" && filteredEntries.length > 0 && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsDeleteModalOpen(true)}
                className={`${MODULE_COLORS.error.text} ${prefixToHover(MODULE_COLORS.error.bg)} transition-colors`}
                title="Clear View"
              >
                <Icon.Delete {...iconProps(16)} />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => generateAndDownloadCSV(filteredEntries)}
              className={`${prefixToHover(MODULE_COLORS.tasks.text)} ${prefixToHover(MODULE_COLORS.tasks.bg)} transition-colors`}
              title="Export CSV"
            >
              <Icon.Download {...iconProps(16)} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCopyMarkdown}
              className={`${prefixToHover(MODULE_COLORS.tasks.text)} ${prefixToHover(MODULE_COLORS.tasks.bg)} transition-colors`}
              title="Copy as Markdown Table"
            >
              {copiedMd ? (
                <Icon.Check {...iconProps(16, MODULE_COLORS.crm.text)} />
              ) : (
                <Icon.Copy {...iconProps(16)} />
              )}
            </Button>
            {viewMode === "TABLE" && (
              <ColumnConfigDropdown
                columns={columns}
                toggleColumn={toggleColumn}
                className={`${prefixToHover(MODULE_COLORS.tasks.text)} ${prefixToHover(MODULE_COLORS.tasks.bg)} transition-colors`}
              />
            )}
          </div>
        </ViewHeader>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          {/* Notion-style View Tabs */}
          <div className="flex items-center gap-1 bg-notion-light-sidebar/50 dark:bg-notion-dark-sidebar/30 p-1 rounded-lg w-full md:w-auto">
            {(["TABLE", "KANBAN", "GANTT"] as ViewMode[]).map((mode) => (
              <Button
                variant="custom"
                key={mode}
                onClick={() => handleViewChange(mode)}
                className={`flex-1 md:flex-none px-3 py-1.5 text-xs md:text-sm font-medium rounded transition-all ${
                  viewMode === mode
                    ? "bg-notion-light-bg dark:bg-notion-dark-bg text-notion-light-text dark:text-notion-dark-text shadow-sm"
                    : "text-notion-light-muted dark:text-notion-dark-muted hover:bg-notion-light-hover dark:hover:bg-notion-dark-hover"
                }`}
              >
                {mode.charAt(0) + mode.slice(1).toLowerCase()}
              </Button>
            ))}
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
              externalColumns={columns}
              externalToggleColumn={toggleColumn}
              showConfigGear={false}
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
  },
);
