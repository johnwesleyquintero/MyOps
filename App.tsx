import React, { useState, useMemo } from 'react';
import { TaskEntry, AppConfig } from './types';
import { SummaryCards } from './components/SummaryCards';
import { LedgerTable } from './components/LedgerTable';
import { TransactionForm } from './components/TransactionForm';
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
import { DEFAULT_PROJECTS } from './constants';

const App: React.FC = () => {
  const { config, setConfig } = useAppConfig();
  const { notifications, showToast, removeNotification } = useNotifications();

  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [editingEntry, setEditingEntry] = useState<TaskEntry | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
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
    selectedMonth
  });

  const availableCategories = useMemo(() => {
    const custom = entries.map(e => e.project).filter(c => !DEFAULT_PROJECTS.includes(c));
    return [...DEFAULT_PROJECTS, ...Array.from(new Set(custom))];
  }, [entries]);

  const handleFormSubmit = async (entry: TaskEntry) => {
    const success = await saveTransaction(entry, !!editingEntry);
    if (success && editingEntry) {
      setEditingEntry(null);
    }
  };

  const handleEditClick = (entry: TaskEntry) => {
    if (!entry.id) {
      showToast("Entry lacks ID. Cannot edit.", 'error');
      return;
    }
    setEditingEntry(entry);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteClick = async (entry: TaskEntry) => {
    if (window.confirm(`Delete task "${entry.description}"?`)) {
      await removeTransaction(entry);
    }
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
        
        <TransactionForm 
          onSubmit={handleFormSubmit} 
          isSubmitting={isSubmitting} 
          initialData={editingEntry}
          onCancelEdit={() => setEditingEntry(null)}
        />

        <div className="mt-8">
           <div className="flex items-center justify-between mb-4">
               <h2 className="text-xl font-bold text-slate-800 tracking-tight">Active Tasks</h2>
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
             selectedMonth={selectedMonth}
             setSelectedMonth={setSelectedMonth}
             availableCategories={availableCategories}
           />

           <LedgerTable 
             entries={filteredEntries} 
             isLoading={isLoading} 
             onEdit={handleEditClick}
             onDelete={handleDeleteClick}
           />
        </div>
      </main>

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