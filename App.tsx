
import React, { useState, useMemo, useEffect } from 'react';
import { TaskEntry, AppConfig, Page } from './types';
import { SummaryCards } from './components/SummaryCards';
import { TaskTable } from './components/TaskTable';
import { KanbanBoard } from './components/KanbanBoard';
import { GanttChart } from './components/GanttChart';
import { TaskModal } from './components/TaskModal';
import { SettingsModal } from './components/SettingsModal';
import { FilterBar } from './components/FilterBar';
import { ToastContainer } from './components/Toast';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar'; 
import { ConfirmationModal } from './components/ConfirmationModal';
import { ShortcutsModal } from './components/ShortcutsModal'; 
import { useTasks } from './hooks/useTasks';
import { useTaskAnalytics } from './hooks/useTaskAnalytics';
import { useAppConfig } from './hooks/useAppConfig';
import { useNotifications } from './hooks/useNotifications';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'; 
import { generateAndDownloadCSV } from './utils/exportUtils';
import { DEFAULT_PROJECTS, STATUSES } from './constants';

type ViewMode = 'TABLE' | 'KANBAN' | 'GANTT';

const App: React.FC = () => {
  const { config, setConfig } = useAppConfig();
  const { notifications, showToast, removeNotification } = useNotifications();

  // Navigation State
  const [activePage, setActivePage] = useState<Page>('DASHBOARD');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobile Toggle
  
  // Desktop Sidebar Collapse State (Persisted)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('myops_sidebar_collapsed') === 'true';
    }
    return false;
  });

  const toggleSidebarCollapse = () => {
    setIsSidebarCollapsed(prev => {
      const newState = !prev;
      localStorage.setItem('myops_sidebar_collapsed', String(newState));
      return newState;
    });
  };

  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showShortcuts, setShowShortcuts] = useState<boolean>(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState<boolean>(false);
  const [editingEntry, setEditingEntry] = useState<TaskEntry | null>(null);
  
  // Mission Control State
  const [viewMode, setViewMode] = useState<ViewMode>('TABLE');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<string>('');

  // --- Keyboard Shortcuts Integration ---
  useKeyboardShortcuts([
    // Navigation
    { key: 'g d', action: () => setActivePage('DASHBOARD') },
    { key: 'g m', action: () => setActivePage('MISSIONS') },
    
    // Actions
    { 
      key: 'c', 
      action: () => {
        if (!isTaskModalOpen) {
          setEditingEntry(null);
          setIsTaskModalOpen(true);
        }
      } 
    },
    { 
      key: '/', 
      preventDefault: true, 
      action: () => {
        // Switch to Missions view if not there, then focus
        if (activePage !== 'MISSIONS') setActivePage('MISSIONS');
        // Small timeout to allow render if page changed
        setTimeout(() => {
          const searchInput = document.getElementById('global-search');
          if (searchInput) searchInput.focus();
        }, 50);
      } 
    },
    { 
      key: 'k',
      metaKey: true,
      preventDefault: true,
      allowInInput: true,
      action: () => {
         if (activePage !== 'MISSIONS') setActivePage('MISSIONS');
         setTimeout(() => {
           const searchInput = document.getElementById('global-search');
           if (searchInput) searchInput.focus();
         }, 50);
      }
    },
    { key: '?', action: () => setShowShortcuts(prev => !prev) },
  ]);

  const { 
    entries, 
    isLoading, 
    isSubmitting, 
    saveTransaction, 
    removeTransaction, 
    bulkRemoveTransactions 
  } = useTasks(config, showToast);

  const { filteredEntries, metrics } = useTaskAnalytics({
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

  // Derived: High Priority / Due Soon tasks for Dashboard
  const dashboardTasks = useMemo(() => {
    // Show tasks that are NOT done, sorted by date
    return entries
      .filter(e => e.status !== 'Done')
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 5); // Top 5
  }, [entries]);

  // Handlers
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
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <ToastContainer notifications={notifications} removeNotification={removeNotification} />
      
      {/* Sidebar Navigation */}
      <Sidebar 
        activePage={activePage}
        setActivePage={setActivePage}
        onOpenSettings={() => setShowSettings(true)}
        config={config}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        isCollapsed={isSidebarCollapsed}
        toggleCollapse={toggleSidebarCollapse}
      />

      {/* Main Content Layout - Dynamic Padding based on collapse state */}
      <div 
        className={`transition-all duration-300 ease-in-out ${isSidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'}`}
      >
        <Header 
          activePage={activePage} 
          onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
          onOpenCreate={handleOpenCreate}
        />

        <main className="p-4 sm:p-6 lg:p-8 pb-24">
          
          {/* --- DASHBOARD VIEW --- */}
          {activePage === 'DASHBOARD' && (
            <div className="animate-fade-in space-y-8">
               <SummaryCards metrics={metrics} />
               
               <div>
                  <div className="flex justify-between items-center mb-4">
                     <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Immediate Focus</h3>
                     <button 
                       onClick={() => setActivePage('MISSIONS')}
                       className="text-indigo-600 text-xs font-bold hover:underline"
                     >
                       View All Missions &rarr;
                     </button>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                     <TaskTable 
                        entries={dashboardTasks}
                        isLoading={isLoading}
                        onEdit={handleOpenEdit}
                        onDelete={handleModalDelete}
                        onStatusUpdate={handleStatusUpdate}
                     />
                     {dashboardTasks.length === 0 && !isLoading && (
                        <div className="p-8 text-center text-slate-400 text-sm">
                           No immediate tasks. You are clear.
                        </div>
                     )}
                  </div>
               </div>
            </div>
          )}

          {/* --- MISSION CONTROL VIEW --- */}
          {activePage === 'MISSIONS' && (
            <div className="animate-fade-in">
               <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                 {/* Tabs */}
                 <div className="flex bg-slate-200/50 p-1 rounded-lg self-start">
                   <button 
                     onClick={() => setViewMode('TABLE')}
                     className={`px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all ${viewMode === 'TABLE' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                   >
                     Table
                   </button>
                   <button 
                     onClick={() => setViewMode('KANBAN')}
                     className={`px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all ${viewMode === 'KANBAN' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                   >
                     Kanban
                   </button>
                   <button 
                     onClick={() => setViewMode('GANTT')}
                     className={`px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all ${viewMode === 'GANTT' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                   >
                     Gantt
                   </button>
                 </div>

                 {/* Action Buttons */}
                 <div className="flex items-center gap-2 self-end md:self-auto">
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

               {viewMode === 'TABLE' && (
                 <TaskTable 
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
                   onAdd={handleOpenCreate}
                 />
               )}

               {viewMode === 'GANTT' && (
                 <GanttChart 
                    entries={filteredEntries}
                    onEdit={handleOpenEdit}
                 />
               )}
            </div>
          )}

        </main>
      </div>

      {/* Modals */}
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

      <ShortcutsModal 
        isOpen={showShortcuts}
        onClose={() => setShowShortcuts(false)}
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
