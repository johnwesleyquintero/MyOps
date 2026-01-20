import React, { useState, useEffect } from "react";
import { Interaction } from "../types";
import { Icon as Icons } from "./Icons";
import { MODULE_COLORS } from "../constants/ui";

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

  useEffect(() => {
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
  }, [initialData, isOpen]);

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
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/20 dark:bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div
        className="bg-notion-light-bg dark:bg-notion-dark-bg rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-notion-light-border dark:border-notion-dark-border animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-notion-light-border dark:border-notion-dark-border flex justify-between items-center bg-notion-light-sidebar/50 dark:bg-notion-dark-sidebar/50">
          <h2 className="text-lg font-bold text-notion-light-text dark:text-notion-dark-text">
            {initialData ? "Edit Interaction" : "Log Interaction"}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-notion-light-hover dark:hover:bg-notion-dark-hover rounded transition-colors"
          >
            <Icons.Close size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="space-y-4">
            <div>
              <label className="notion-label mb-1.5 block">
                Interaction Type
              </label>
              <select
                className="notion-input w-full"
                value={formData.type}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    type: e.target.value as Interaction["type"],
                  })
                }
              >
                <option value="Call">Call</option>
                <option value="Email">Email</option>
                <option value="Message">Message</option>
                <option value="Meeting">Meeting</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="notion-label mb-1.5 block">Date</label>
              <input
                type="date"
                required
                className="notion-input w-full"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
              />
            </div>

            <div>
              <label className="notion-label mb-1.5 block">Notes</label>
              <textarea
                required
                className="notion-input w-full min-h-[120px] py-3 resize-none"
                placeholder="What was discussed?"
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 text-xs font-black uppercase tracking-widest text-notion-light-muted hover:${colors.text} transition-colors`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !formData.notes}
              className={`px-6 py-2 ${colors.bg} ${colors.text} ${colors.border} border rounded-xl font-black text-xs uppercase tracking-widest shadow-sm ${colors.hoverBg} transition-all active:scale-95 disabled:opacity-50`}
            >
              {isSubmitting
                ? initialData
                  ? "Updating..."
                  : "Logging..."
                : "Save Log"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
