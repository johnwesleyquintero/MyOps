
import React, { useState, useEffect } from 'react';
import { TaskEntry } from '../../types';
import { ViewMode } from '../../hooks/useMissionControl';
import { generateAndDownloadCSV } from '../../utils/exportUtils';
import { FilterBar } from '../FilterBar';
import { TaskTable } from '../TaskTable';
import { KanbanBoard } from '../KanbanBoard';
import { GanttChart } from '../GanttChart';
import { ConfirmationModal } from '../ConfirmationModal';

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
  availableCategories,
  onEdit,
  onDelete,
  onBulkDelete,
  onStatusUpdate,
  onDescriptionUpdate,
  onFocus,
  onDuplicate,
  onAdd
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
       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
         {/* Tabs with micro-interactions */}
         <div className="flex bg-slate-200/50 dark:bg-slate-800/80 p-1 rounded-xl self-start border border-slate-200/50 dark:border-slate-700/50">
           {(['TABLE', 'KANBAN', 'GANTT'] as ViewMode[]).map((mode) => (
             <button 
               key={mode}
               onClick={() => handleViewChange(mode)}
               className={`px-5 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all duration-300 ease-out active:scale-95 ${viewMode === mode ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm ring-1 ring-slate-200 dark:ring-slate-600' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-300/30 dark:hover:bg-slate-700/50'}`}
             >
               {mode.charAt(0) + mode.slice(1).toLowerCase()}
             </button>
           ))}
         </div>

         {/* Action Buttons */}
         <div className="flex items-center gap-2 self-end md:self-auto">
           {viewMode === 'TABLE' && filteredEntries.length > 0 && (
             <button 
               onClick={() => setIsDeleteModalOpen(true)}
               className="p-2.5 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900 bg-white dark:bg-slate-900 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-all hover:shadow-sm active:scale-90"
               title="Clear View"
             >
               <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
             </button>
           )}
           <button 
              onClick={() => generateAndDownloadCSV(filteredEntries)}
              className="p-2.5 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all hover:shadow-sm active:scale-90"
              title="Export CSV"
           >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
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
         availableCategories={availableCategories}
       />

       {/* View Transition Wrapper */}
       <div className={`transition-all duration-300 ${transitioning ? 'opacity-0 scale-[0.99] translate-y-1' : 'opacity-100 scale-100 translate-y-0 animate-view-switch'}`}>
         {viewMode === 'TABLE' && (
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

         {viewMode === 'KANBAN' && (
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

         {viewMode === 'GANTT' && (
           <GanttChart 
              entries={filteredEntries}
              onEdit={onEdit}
           />
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
        <p>Delete {filteredEntries.length} tasks visible in the current view?</p>
      </ConfirmationModal>
    </div>
  );
};
