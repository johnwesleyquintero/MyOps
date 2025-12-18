
import React from 'react';
import { TaskEntry, AppConfig, Page } from '../../types';
import { TaskModal } from '../TaskModal';
import { SettingsModal } from '../SettingsModal';
import { ShortcutsModal } from '../ShortcutsModal';
import { CommandPalette } from '../CommandPalette';

interface ModalManagerProps {
  ui: any; // Simplified for brevity, should use UIState type
  config: AppConfig;
  entries: TaskEntry[];
  isSubmitting: boolean;
  onModalSubmit: (entry: TaskEntry) => Promise<void>;
  onModalDelete: (entry: TaskEntry) => Promise<void>;
  onDuplicate: (entry: TaskEntry) => void;
  onSaveConfig: (config: AppConfig) => void;
  onNavigate: (page: Page) => void;
}

export const ModalManager: React.FC<ModalManagerProps> = ({
  ui,
  config,
  entries,
  isSubmitting,
  onModalSubmit,
  onModalDelete,
  onDuplicate,
  onSaveConfig,
  onNavigate
}) => {
  return (
    <>
      <CommandPalette 
        isOpen={ui.isCmdPaletteOpen}
        onClose={() => ui.setIsCmdPaletteOpen(false)}
        entries={entries}
        onNavigate={onNavigate}
        onCreate={ui.openCreate}
        onEdit={ui.openEdit}
        onSettings={() => ui.setShowSettings(true)}
        onToggleFocus={ui.enterFocus}
      />

      <TaskModal 
        isOpen={ui.isTaskModalOpen}
        onClose={() => ui.setIsTaskModalOpen(false)}
        onSubmit={onModalSubmit}
        onDelete={onModalDelete}
        onDuplicate={onDuplicate}
        initialData={ui.editingEntry}
        isSubmitting={isSubmitting}
        entries={entries} 
      />

      <SettingsModal 
        isOpen={ui.showSettings} 
        onClose={() => ui.setShowSettings(false)}
        config={config}
        onSave={onSaveConfig}
      />

      <ShortcutsModal 
        isOpen={ui.showShortcuts}
        onClose={() => ui.setShowShortcuts(false)}
      />
    </>
  );
};
