
import { TaskEntry, NotificationAction } from '../types';
import { RECURRENCE_OPTIONS } from '../constants';
import { getNextStatus } from '../utils/taskLogic';

interface UseTaskActionsProps {
  saveTransaction: (entry: TaskEntry, isUpdate: boolean) => Promise<boolean>;
  showToast: (msg: string, type: 'success' | 'error' | 'info', action?: NotificationAction) => void;
}

export const useTaskActions = ({ saveTransaction, showToast }: UseTaskActionsProps) => {

  const handleDuplicate = (entry: TaskEntry): TaskEntry => {
    return {
        ...entry,
        id: '', 
        status: 'Backlog', 
        date: new Date().toISOString().split('T')[0], 
        dependencies: [] 
    };
  };

  const handleDescriptionUpdate = async (entry: TaskEntry, newDescription: string) => {
    const updatedEntry = { ...entry, description: newDescription };
    await saveTransaction(updatedEntry, true);
  };

  const handleStatusUpdate = async (entry: TaskEntry) => {
    const nextStatus = getNextStatus(entry.status);
    
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
                showToast(`Recurring mission scheduled for ${nextTask.date}`, 'success');
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
         showToast(`Recurring mission scheduled for ${nextTask.date}`, 'success');
    }
  };

  return {
    handleDuplicate,
    handleDescriptionUpdate,
    handleStatusUpdate,
    handleFocusComplete
  };
};
