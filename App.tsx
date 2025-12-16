
import React, { useState, useMemo } from 'react';
import { TaskEntry, AppConfig, StatusLevel } from './types';
import { SummaryCards } from './components/SummaryCards';
import { LedgerTable } from './components/LedgerTable';
import { KanbanBoard } from './components/KanbanBoard'; // New Component
import { GanttChart } from './components/GanttChart';   // New Component
import { TaskModal } from './components/TaskModal';
import { SettingsModal } from './components/SettingsModal';
import { FilterBar } from './components/FilterBar';
import { ToastContainer } from './components/Toast';
import { Header } from './components/Header';
import { ConfirmationModal } from './components/ConfirmationModal';
import { useLedger } from './hooks/useLedger';
import { useLedgerAnalytics } from './hooks/useLedgerAnalytics';
import { useAppConfig } from './hooks/useAppConfig';
import { useNotifications } from './hooks/useNotifications';
import { generateAndDownloadCSV } from './utils/exportUtils';
import { DEFAULT_PROJECTS, STATUSES } from './constants';

type ViewMode = 'TABLE' | 'KANBAN' | 'GANTT';

const App: React.FC = () => {
  const { config, setConfig } = useAppConfig();
  const { notifications, showToast, removeNotification } = useNotifications();

  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState<boolean>(false);
  const [editingEntry, setEditingEntry] = useState<TaskEntry | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('TABLE');
  
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<string>('');

  const { 
    entries, 
    isLoading, 
    isSubmitting, 
    saveTransaction, 
    removeTransaction, 
    bulkRemoveTransactions 
  } = useLedger(config, showToast);

  const { filteredEntries, metrics } = useLedgerAnalytics({
    entries,
    searchQuery,
    selectedCategory,
    selectedStatus,
    selectedMonth
  });

  const availableCategories = useMemo(() => {
    const custom = entries.map(e => e.project).filter(c => !DEFAULT_PROJECTS.includes(c));
    return [...DEFAULT_PROJECTS, ...Array.from(new Set(custom))];
  }, [entries]);

  // Handlers for Modal
  const handleOpenCreate = () => {
    setEditingEntry(null);
    setIsTaskModalOpen(true);
  };

  const handleOpenEdit = (entry: TaskEntry) => {
    if (!entry.id) {
      showToast("Entry lacks ID. Cannot edit.", 'error');
      return;
    }
    setEditingEntry(entry);
    setIsTaskModalOpen(true);
  };

  const handleModalSubmit = async (entry: TaskEntry) => {
    const success = await saveTransaction(entry, !!editingEntry);
    if (success) {
      setIsTaskModalOpen(false);
      setEditingEntry(null);
    }
  };

  const handleModalDelete = async (entry: TaskEntry) => {
     await removeTransaction(entry);
     setIsTaskModalOpen(false);
     setEditingEntry(null);
  };

  // Inline status cycling handler (Quick Action)
  const handleStatusUpdate = async (entry: TaskEntry) => {
    const currentIndex = STATUSES.indexOf(entry.status);
    const nextIndex = (currentIndex + 1) % STATUSES.length;
    const nextStatus = STATUSES[nextIndex];
    
    const updatedEntry = { ...entry, status: nextStatus };
    await saveTransaction(updatedEntry, true);
  };

  const executeBulkDelete = async () => {
    await bulkRemoveTransactions(filteredEntries);
    setIsDeleteModalOpen(false);
  };

  const handleSaveConfig = (newConfig: AppConfig) => {
    setConfig(newConfig);
    setShowSettings(false);
    showToast('Configuration saved', 'success');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-20">
      <ToastContainer notifications={notifications} removeNotification={removeNotification} />
      <Header config={config} onOpenSettings={() => setShowSettings(true)} />

      <main className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 py-6">
        <SummaryCards metrics={metrics} />
        
        {/* Main Content Area */}
        <div className="mt-8">
           <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
               <div className="flex items-center gap-4">
                 <h2 className="text-xl font-bold text-slate-800 tracking-tight">Mission Control</h2>
                 
                 {/* View Tabs */}
                 <div className="flex bg-slate-200/50 p-1 rounded-lg">
                   <button 
                     onClick={() => setViewMode('TABLE')}
                     className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all ${viewMode === 'TABLE' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                   >
                     Table
                   </button>
                   <button 
                     onClick={() => setViewMode('KANBAN')}
                     className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all ${viewMode === 'KANBAN' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                   >
                     Kanban
                   </button>
                   <button 
                     onClick={() => setViewMode('GANTT')}
                     className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all ${viewMode === 'GANTT' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                   >
                     Gantt
                   </button>
                 </div>
               </div>

               <div className="flex items-center gap-2">
                 <button 
                   onClick={handleOpenCreate}
                   className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-slate-800 hover:shadow-lg active:scale-95 transition-all shadow-md"
                 >
                   <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                     <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                   </svg>
                   New Task
                 </button>

                 {viewMode === 'TABLE' && filteredEntries.length > 0 && (
                   <button 
                     onClick={() => setIsDeleteModalOpen(true)}
                     className="p-2 text-red-600 border border-red-200 bg-white rounded-lg hover:bg-red-50 transition-colors"
                     title="Clear View"
                   >
                     <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                   </button>
                 )}
                 <button 
                    onClick={() => generateAndDownloadCSV(filteredEntries)}
                    className="p-2 text-slate-600 border border-slate-200 bg-white rounded-lg hover:bg-slate-50 transition-colors"
                    title="Export CSV"
                 >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
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

           {/* View Switcher */}
           {viewMode === 'TABLE' && (
             <LedgerTable 
               entries={filteredEntries} 
               isLoading={isLoading} 
               onEdit={handleOpenEdit}
               onDelete={handleModalDelete}
               onStatusUpdate={handleStatusUpdate}
             />
           )}

           {viewMode === 'KANBAN' && (
             <KanbanBoard
               entries={filteredEntries}
               onEdit={handleOpenEdit}
               onStatusUpdate={handleStatusUpdate}
             />
           )}

           {viewMode === 'GANTT' && (
             <GanttChart 
                entries={filteredEntries}
                onEdit={handleOpenEdit}
             />
           )}
        </div>
      </main>

      <TaskModal 
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSubmit={handleModalSubmit}
        onDelete={handleModalDelete}
        initialData={editingEntry}
        isSubmitting={isSubmitting}
      />

      <SettingsModal 
        isOpen={showSettings} 
        onClose={() => setShowSettings(false)}
        config={config}
        onSave={handleSaveConfig}
      />

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={executeBulkDelete}
        title="Clear Current View"
        confirmText="Delete All"
        isLoading={isLoading}
      >
        <p>Delete {filteredEntries.length} tasks visible in the current view?</p>
      </ConfirmationModal>
    </div>
  );
};

export default App;
