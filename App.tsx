
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
import { FocusMode } from './components/FocusMode'; 
import { CommandPalette } from './components/CommandPalette'; // Import CommandPalette
import { CashFlowChart } from './components/analytics/CashFlowChart';
import { ExpenseCategoryList } from './components/analytics/ExpenseCategoryList';
import { useTasks } from './hooks/useTasks';
import { useTaskAnalytics } from './hooks/useTaskAnalytics';
import { useAppConfig } from './hooks/useAppConfig';
import { useNotifications } from './hooks/useNotifications';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'; 
import { generateAndDownloadCSV } from './utils/exportUtils';
import { DEFAULT_PROJECTS, STATUSES, RECURRENCE_OPTIONS } from './constants';

type ViewMode = 'TABLE' | 'KANBAN' | 'GANTT';

const App: React.FC = () => {
  const { config, setConfig } = useAppConfig();
  const { notifications, showToast, removeNotification } = useNotifications();

  // Theme Side Effect
  useEffect(() => {
    if (config.theme === 'DARK') {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
  }, [config.theme]);

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
  const [isCmdPaletteOpen, setIsCmdPaletteOpen] = useState<boolean>(false); // Command Palette State
  const [editingEntry, setEditingEntry] = useState<TaskEntry | null>(null);
  const [focusedTask, setFocusedTask] = useState<TaskEntry | null>(null); // State for Deep Work
  
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
        if (!isTaskModalOpen && activePage !== 'FOCUS' && !isCmdPaletteOpen) {
          setEditingEntry(null);
          setIsTaskModalOpen(true);
        }
      } 
    },
    { 
      key: '/', 
      preventDefault: true, 
      action: () => {
        if (activePage === 'FOCUS' || isCmdPaletteOpen) return; 
        if (activePage !== 'MISSIONS') setActivePage('MISSIONS');
        setTimeout(() => {
          const searchInput = document.getElementById('global-search');
          if (searchInput) searchInput.focus();
        }, 50);
      } 
    },
    { 
      key: 'k',
      metaKey: true, // Cmd+K / Ctrl+K
      preventDefault: true,
      allowInInput: true,
      action: () => {
         if (activePage === 'FOCUS') return;
         setIsCmdPaletteOpen(prev => !prev);
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

  const handleDuplicate = (entry: TaskEntry) => {
    const copy: TaskEntry = {
        ...entry,
        id: '', 
        status: 'Backlog', 
        date: new Date().toISOString().split('T')[0], 
        dependencies: [] 
    };
    setEditingEntry(copy);
    setIsTaskModalOpen(true);
  };

  const handleEnterFocus = (entry: TaskEntry) => {
    setFocusedTask(entry);
    setActivePage('FOCUS');
  };

  const handleExitFocus = () => {
    setFocusedTask(null);
    setActivePage('MISSIONS'); 
  };

  const handleModalSubmit = async (entry: TaskEntry) => {
    const isUpdate = !!editingEntry?.id;
    const success = await saveTransaction(entry, isUpdate);
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

  // Direct Update Handler for Interactive Markdown (Checkboxes)
  const handleDescriptionUpdate = async (entry: TaskEntry, newDescription: string) => {
    const updatedEntry = { ...entry, description: newDescription };
    // Pass true for isUpdate, and trigger save without toast if preferred, or with toast.
    // We use the existing saveTransaction which handles optimistic UI.
    await saveTransaction(updatedEntry, true);
  };

  const handleStatusUpdate = async (entry: TaskEntry) => {
    const currentIndex = STATUSES.indexOf(entry.status);
    const nextIndex = (currentIndex + 1) % STATUSES.length;
    const nextStatus = STATUSES[nextIndex];
    
    // 1. Update the original task
    const updatedEntry = { ...entry, status: nextStatus };
    await saveTransaction(updatedEntry, true);

    // 2. RECURRENCE LOGIC
    if (nextStatus === 'Done') {
        const desc = entry.description;
        const recurrenceOpt = RECURRENCE_OPTIONS.find(r => r.tag && desc.includes(r.tag));
        
        if (recurrenceOpt) {
            const currentDueDate = new Date(entry.date);
            let nextDate = new Date(currentDueDate);
            
            if (recurrenceOpt.label === 'Daily') {
                nextDate.setDate(currentDueDate.getDate() + 1);
            } else if (recurrenceOpt.label === 'Weekly') {
                nextDate.setDate(currentDueDate.getDate() + 7);
            } else if (recurrenceOpt.label === 'Monthly') {
                nextDate.setMonth(currentDueDate.getMonth() + 1);
            }

            const nextTask: TaskEntry = {
                ...entry,
                id: '', 
                date: nextDate.toISOString().split('T')[0],
                status: 'Backlog',
                dependencies: [] 
            };

            setTimeout(async () => {
                await saveTransaction(nextTask, false);
                showToast(`Recurring task scheduled for ${nextTask.date}`, 'success');
            }, 500);
        }
    }
  };

  const handleFocusComplete = async (entry: TaskEntry) => {
    const updatedEntry = { ...entry, status: 'Done' as const };
    await saveTransaction(updatedEntry, true);
    
    const recurrenceOpt = RECURRENCE_OPTIONS.find(r => r.tag && entry.description.includes(r.tag));
    if (recurrenceOpt) {
         const currentDueDate = new Date(entry.date);
         let nextDate = new Date(currentDueDate);
         if (recurrenceOpt.label === 'Daily') nextDate.setDate(currentDueDate.getDate() + 1);
         else if (recurrenceOpt.label === 'Weekly') nextDate.setDate(currentDueDate.getDate() + 7);
         else if (recurrenceOpt.label === 'Monthly') nextDate.setMonth(currentDueDate.getMonth() + 1);

         const nextTask: TaskEntry = {
            ...entry,
            id: '', 
            date: nextDate.toISOString().split('T')[0],
            status: 'Backlog',
            dependencies: []
         };
         await saveTransaction(nextTask, false);
         showToast(`Recurring task scheduled for ${nextTask.date}`, 'success');
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

  // If in Focus Mode, render only Focus Component
  if (activePage === 'FOCUS' && focusedTask) {
    return (
        <FocusMode 
            task={focusedTask} 
            onExit={handleExitFocus}
            onUpdate={async (updated) => { await saveTransaction(updated, true); }}
            onComplete={handleFocusComplete}
        />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-300">
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
            <div className="animate-fade-in space-y-6">
               <SummaryCards metrics={metrics} />

               {/* Analytics Grid */}
               <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <CashFlowChart entries={entries} />
                  <ExpenseCategoryList entries={entries} />
               </div>
               
               <div>
                  <div className="flex justify-between items-center mb-4 mt-2">
                     <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Immediate Focus</h3>
                     <button 
                       onClick={() => setActivePage('MISSIONS')}
                       className="text-indigo-600 dark:text-indigo-400 text-xs font-bold hover:underline"
                     >
                       View All Missions &rarr;
                     </button>
                  </div>
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
                     <TaskTable 
                        entries={dashboardTasks}
                        isLoading={isLoading}
                        onEdit={handleOpenEdit}
                        onDelete={handleModalDelete}
                        onStatusUpdate={handleStatusUpdate}
                        onDescriptionUpdate={handleDescriptionUpdate}
                        onFocus={handleEnterFocus}
                        onDuplicate={handleDuplicate}
                        allEntries={entries} 
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
                 <div className="flex bg-slate-200/50 dark:bg-slate-800 p-1 rounded-lg self-start">
                   <button 
                     onClick={() => setViewMode('TABLE')}
                     className={`px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all ${viewMode === 'TABLE' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                   >
                     Table
                   </button>
                   <button 
                     onClick={() => setViewMode('KANBAN')}
                     className={`px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all ${viewMode === 'KANBAN' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                   >
                     Kanban
                   </button>
                   <button 
                     onClick={() => setViewMode('GANTT')}
                     className={`px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all ${viewMode === 'GANTT' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                   >
                     Gantt
                   </button>
                 </div>

                 {/* Action Buttons */}
                 <div className="flex items-center gap-2 self-end md:self-auto">
                   {viewMode === 'TABLE' && filteredEntries.length > 0 && (
                     <button 
                       onClick={() => setIsDeleteModalOpen(true)}
                       className="p-2 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900 bg-white dark:bg-slate-800 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                       title="Clear View"
                     >
                       <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                     </button>
                   )}
                   <button 
                      onClick={() => generateAndDownloadCSV(filteredEntries)}
                      className="p-2 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
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
                   onDescriptionUpdate={handleDescriptionUpdate}
                   onFocus={handleEnterFocus}
                   onDuplicate={handleDuplicate}
                   allEntries={entries}
                 />
               )}

               {viewMode === 'KANBAN' && (
                 <KanbanBoard
                   entries={filteredEntries}
                   onEdit={handleOpenEdit}
                   onStatusUpdate={handleStatusUpdate}
                   onAdd={handleOpenCreate}
                   onFocus={handleEnterFocus}
                   onDuplicate={handleDuplicate}
                   allEntries={entries}
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

      {/* Overlays */}
      <CommandPalette 
        isOpen={isCmdPaletteOpen}
        onClose={() => setIsCmdPaletteOpen(false)}
        entries={entries}
        onNavigate={setActivePage}
        onCreate={handleOpenCreate}
        onEdit={handleOpenEdit}
        onSettings={() => setShowSettings(true)}
        onToggleFocus={handleEnterFocus}
      />

      <TaskModal 
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSubmit={handleModalSubmit}
        onDelete={handleModalDelete}
        onDuplicate={handleDuplicate}
        initialData={editingEntry}
        isSubmitting={isSubmitting}
        entries={entries} 
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
