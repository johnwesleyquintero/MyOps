
import React, { useState, useMemo } from 'react';
import { TaskEntry, AppConfig, StatusLevel } from './types';
import { SummaryCards } from './components/SummaryCards';
import { LedgerTable } from './components/LedgerTable';
import { TaskModal } from './components/TaskModal'; // New Modal Component
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

const App: React.FC = () => {
  const { config, setConfig } = useAppConfig();
  const { notifications, showToast, removeNotification } = useNotifications();

  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState<boolean>(false);
  const [editingEntry, setEditingEntry] = useState<TaskEntry | null>(null);
  
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
           <div className="flex items-center justify-between mb-4">
               <div className="flex items-center gap-4">
                 <h2 className="text-xl font-bold text-slate-800 tracking-tight">Active Tasks</h2>
                 
                 {/* Primary Add Button */}
                 <button 
                   onClick={handleOpenCreate}
                   className="flex items-center gap-2 bg-slate-900 text-white px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-slate-800 hover:shadow-lg active:scale-95 transition-all shadow-md"
                 >
                   <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                     <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                   </svg>
                   New Task
                 </button>
               </div>

               <div className="flex gap-2">
                 {filteredEntries.length > 0 && (
                   <button 
                     onClick={() => setIsDeleteModalOpen(true)}
                     className="text-red-600 border border-red-200 bg-white px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider hover:bg-red-50"
                   >
                     Clear View
                   </button>
                 )}
                 <button 
                    onClick={() => generateAndDownloadCSV(filteredEntries)}
                    className="text-slate-600 border border-slate-200 bg-white px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider hover:bg-slate-50"
                 >
                    Export
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

           <LedgerTable 
             entries={filteredEntries} 
             isLoading={isLoading} 
             onEdit={handleOpenEdit}
             onDelete={handleModalDelete} // We can technically use handleModalDelete logic or just direct remove. Keeping direct remove for the table row trash icon.
             onStatusUpdate={handleStatusUpdate}
           />
        </div>
      </main>

      {/* The Unified Task Modal */}
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
