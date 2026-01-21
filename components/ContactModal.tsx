import React, { useState, useEffect } from "react";
import { Contact } from "../types";
import { Icon as Icons } from "./Icons";
import { MODULE_COLORS } from "../constants/ui";
import { Button } from "./ui";

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (contact: Contact, isUpdate: boolean) => Promise<boolean>;
  initialData?: Contact | null;
  isLoading?: boolean;
}

export const ContactModal: React.FC<ContactModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading = false,
}) => {
  const colors = MODULE_COLORS.crm;
  const [formData, setFormData] = useState<Partial<Contact>>({
    name: "",
    email: "",
    phone: "",
    company: "",
    type: "Lead",
    status: "Lead",
    tags: [],
    notes: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        name: "",
        email: "",
        phone: "",
        company: "",
        type: "Lead",
        status: "Lead",
        tags: [],
        notes: "",
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    setIsSubmitting(true);
    try {
      const contactToSave = {
        ...(formData as Contact),
        id: initialData?.id || "",
        createdAt: initialData?.createdAt || new Date().toISOString(),
        lastInteraction:
          initialData?.lastInteraction || new Date().toISOString(),
        interactions: initialData?.interactions || [],
      };
      const success = await onSubmit(contactToSave, !!initialData);
      if (success) {
        onClose();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-0 md:p-4 bg-black/20 dark:bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div
        className="bg-notion-light-bg dark:bg-notion-dark-bg h-full md:h-auto md:rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-notion-light-border dark:border-notion-dark-border animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-notion-light-border dark:border-notion-dark-border flex justify-between items-center bg-notion-light-sidebar/50 dark:bg-notion-dark-sidebar/50">
          <h2 className="text-lg font-bold text-notion-light-text dark:text-notion-dark-text">
            {initialData ? "Edit Intelligence Profile" : "New Network Addition"}
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="hover:bg-notion-light-hover dark:hover:bg-notion-dark-hover"
          >
            <Icons.Close size={20} />
          </Button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-6 space-y-5 overflow-y-auto max-h-[calc(100vh-120px)] md:max-h-none"
        >
          <div className="space-y-4">
            <div>
              <label className="notion-label mb-1.5 block">Full Name</label>
              <input
                type="text"
                required
                className="notion-input w-full"
                placeholder="e.g. John Doe"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="notion-label mb-1.5 block">Email</label>
                <input
                  type="email"
                  className="notion-input w-full text-xs"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="notion-label mb-1.5 block">Phone</label>
                <input
                  type="text"
                  className="notion-input w-full text-xs"
                  placeholder="+1 (555) 000-0000"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                />
              </div>
            </div>

            <div>
              <label className="notion-label mb-1.5 block">
                Company / Organization
              </label>
              <input
                type="text"
                className="notion-input w-full text-xs"
                placeholder="e.g. Acme Corp"
                value={formData.company}
                onChange={(e) =>
                  setFormData({ ...formData, company: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="notion-label mb-1.5 block">
                  Relationship Type
                </label>
                <select
                  className="notion-input w-full text-xs"
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      type: e.target.value as Contact["type"],
                    })
                  }
                >
                  <option value="Lead">Lead</option>
                  <option value="Client">Client</option>
                  <option value="Vendor">Vendor</option>
                  <option value="Partner">Partner</option>
                </select>
              </div>
              <div>
                <label className="notion-label mb-1.5 block">
                  Current Status
                </label>
                <select
                  className="notion-input w-full text-xs"
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status: e.target.value as Contact["status"],
                    })
                  }
                >
                  <option value="Lead">Lead</option>
                  <option value="Active">Active</option>
                  <option value="Completed">Completed</option>
                  <option value="Idle">Idle</option>
                </select>
              </div>
            </div>

            <div>
              <label className="notion-label mb-1.5 block">
                Strategic Notes
              </label>
              <textarea
                className="notion-input w-full min-h-[80px] text-xs resize-none"
                placeholder="Context, goals, or key details..."
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-notion-light-border dark:border-notion-dark-border">
            <Button
              variant="ghost"
              onClick={onClose}
              className={`px-4 py-2 text-xs font-black uppercase tracking-widest text-notion-light-muted hover:${colors.text}`}
              disabled={isSubmitting || isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="custom"
              isLoading={isSubmitting || isLoading}
              className={`px-6 py-2 ${colors.bg} ${colors.text} ${colors.border} border rounded-xl font-black text-xs uppercase tracking-widest shadow-sm ${colors.hoverBg} transition-all active:scale-95`}
            >
              {initialData ? "Update Profile" : "Lock In Contact"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
