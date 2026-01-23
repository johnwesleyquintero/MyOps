import React from "react";
import { Icon, iconProps } from "./Icons";
import { Button, Card } from "./ui";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  children: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  children,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isLoading = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px] transition-opacity animate-in fade-in duration-200">
      <Card
        padding="none"
        className="max-w-md w-full overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-notion-light-border dark:border-notion-dark-border flex items-center gap-3 bg-notion-light-sidebar/50 dark:bg-notion-dark-sidebar/30">
          <div className="w-8 h-8 rounded-full bg-red-500/10 dark:bg-red-500/20 flex items-center justify-center flex-shrink-0">
            <Icon.Alert {...iconProps(18, "text-red-600 dark:text-red-400")} />
          </div>
          <h3 className="text-sm font-semibold text-notion-light-text dark:text-notion-dark-text">
            {title}
          </h3>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          <div className="text-sm text-notion-light-text dark:text-notion-dark-text leading-relaxed">
            {children}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 flex items-center justify-end gap-3 border-t border-notion-light-border dark:border-notion-dark-border bg-notion-light-sidebar/50 dark:bg-notion-dark-sidebar/30">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            disabled={isLoading}
            className="px-4"
          >
            {cancelText}
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={onConfirm}
            isLoading={isLoading}
            className="px-4 font-semibold"
          >
            {isLoading ? "Processing..." : confirmText}
          </Button>
        </div>
      </Card>
    </div>
  );
};
