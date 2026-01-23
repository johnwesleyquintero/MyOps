import React, { useState } from "react";
import { Interaction } from "../types";
import { Icon as Icons } from "./Icons";
import { MODULE_COLORS } from "../constants/ui";
import { Button, Card } from "./ui";

interface InteractionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (interaction: Interaction) => Promise<boolean>;
  contactId: string;
  initialData?: Interaction | null;
}

export const InteractionModal: React.FC<InteractionModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  contactId,
  initialData,
}) => {
  const colors = MODULE_COLORS.crm;
  const [formData, setFormData] = useState<Partial<Interaction>>({
    type: "Call",
    notes: "",
    date: new Date().toISOString().split("T")[0],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [prevInitialData, setPrevInitialData] = useState(initialData);
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);

  if (initialData !== prevInitialData || isOpen !== prevIsOpen) {
    setPrevInitialData(initialData);
    setPrevIsOpen(isOpen);
    if (initialData) {
      setFormData({
        type: initialData.type,
        notes: initialData.notes,
        date: initialData.date.split("T")[0],
      });
    } else {
      setFormData({
        type: "Call",
        notes: "",
        date: new Date().toISOString().split("T")[0],
      });
    }
  }

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.notes) return;

    setIsSubmitting(true);
    try {
      const interactionToSave: Interaction = {
        id: initialData?.id || Math.random().toString(36).substr(2, 9),
        contactId,
        type: (formData.type as Interaction["type"]) || "Call",
        notes: formData.notes || "",
        date: formData.date || new Date().toISOString(),
      };
      const success = await onSubmit(interactionToSave);
      if (success) {
        onClose();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
      <Card
        padding="none"
        className="shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300 rounded-2xl border-none"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className={`px-6 py-4 border-b border-notion-light-border dark:border-notion-dark-border flex justify-between items-center bg-notion-light-sidebar/50 dark:bg-notion-dark-sidebar/50 backdrop-blur-md`}
        >
          <h2 className="text-sm font-bold text-notion-light-text dark:text-notion-dark-text uppercase tracking-widest">
            {initialData ? "Interaction Intelligence" : "New Interaction Log"}
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="hover:bg-notion-light-hover dark:hover:bg-notion-dark-hover transition-colors"
          >
            <Icons.Close size={18} />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5 ml-1">
                <Icons.Activity size={12} className="opacity-40" />
                <span className="text-[10px] font-black uppercase tracking-widest opacity-40">
                  Interaction Type
                </span>
              </div>
              <select
                className="w-full border border-notion-light-border dark:border-notion-dark-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/30 bg-notion-light-bg dark:bg-notion-dark-bg text-notion-light-text dark:text-notion-dark-text appearance-none cursor-pointer transition-all shadow-sm"
                value={formData.type}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    type: e.target.value as Interaction["type"],
                  })
                }
              >
                <option value="Call">Voice Comms</option>
                <option value="Email">Digital Correspondence</option>
                <option value="Message">Direct Message</option>
                <option value="Meeting">Strategic Session</option>
                <option value="Other">Miscellaneous</option>
              </select>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1.5 ml-1">
                <Icons.Calendar size={12} className="opacity-40" />
                <span className="text-[10px] font-black uppercase tracking-widest opacity-40">
                  Deployment Date
                </span>
              </div>
              <input
                type="date"
                required
                className="w-full border border-notion-light-border dark:border-notion-dark-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/30 bg-notion-light-bg dark:bg-notion-dark-bg text-notion-light-text dark:text-notion-dark-text transition-all shadow-sm"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
              />
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1.5 ml-1">
                <Icons.Notes size={12} className="opacity-40" />
                <span className="text-[10px] font-black uppercase tracking-widest opacity-40">
                  Intelligence Notes
                </span>
              </div>
              <textarea
                required
                className="w-full border border-notion-light-border dark:border-notion-dark-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/30 bg-notion-light-bg dark:bg-notion-dark-bg text-notion-light-text dark:text-notion-dark-text min-h-[140px] resize-none transition-all shadow-sm"
                placeholder="What strategic intelligence was gathered?"
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-notion-light-border dark:border-notion-dark-border">
            <Button
              variant="ghost"
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-[10px] font-black uppercase tracking-widest text-notion-light-muted dark:text-notion-dark-muted hover:bg-notion-light-hover dark:hover:bg-notion-dark-hover rounded-xl"
            >
              Abort
            </Button>
            <Button
              variant="custom"
              type="submit"
              isLoading={isSubmitting}
              disabled={!formData.notes}
              className={`px-8 py-2 ${colors.bg} ${colors.text} ${colors.border} border rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-blue-500/10 ${colors.hoverBg} transition-all active:scale-95 disabled:opacity-50`}
            >
              {initialData ? "Sync Intelligence" : "Log Deployment"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
