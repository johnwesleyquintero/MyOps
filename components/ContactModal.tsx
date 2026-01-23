import React, { useState } from "react";
import { Contact } from "../types";
import { Icon as Icons } from "./Icons";
import { MODULE_COLORS } from "../constants/ui";
import { Button, Card } from "./ui";

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

  const [prevInitialData, setPrevInitialData] = useState(initialData);
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);

  if (initialData !== prevInitialData || isOpen !== prevIsOpen) {
    setPrevInitialData(initialData);
    setPrevIsOpen(isOpen);
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
  }

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
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/20 dark:bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
      <Card
        padding="none"
        className="shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-300 rounded-2xl border-none"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-notion-light-border dark:border-notion-dark-border flex justify-between items-center bg-notion-light-sidebar/50 dark:bg-notion-dark-sidebar/50 backdrop-blur-md">
          <h2 className="text-sm font-bold text-notion-light-text dark:text-notion-dark-text uppercase tracking-widest">
            {initialData ? "Intelligence Profile" : "New Network Entry"}
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

        <form
          onSubmit={handleSubmit}
          className="p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-120px)] md:max-h-none"
        >
          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5 ml-1">
                <Icons.Users size={12} className="opacity-40" />
                <span className="text-[10px] font-black uppercase tracking-widest opacity-40">
                  Full Name
                </span>
              </div>
              <input
                type="text"
                required
                className="w-full border border-notion-light-border dark:border-notion-dark-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/30 bg-notion-light-bg dark:bg-notion-dark-bg text-notion-light-text dark:text-notion-dark-text transition-all shadow-sm"
                placeholder="e.g. John Doe"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5 ml-1">
                  <Icons.Mail size={12} className="opacity-40" />
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-40">
                    Email Address
                  </span>
                </div>
                <input
                  type="email"
                  className="w-full border border-notion-light-border dark:border-notion-dark-border rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500/30 bg-notion-light-bg dark:bg-notion-dark-bg text-notion-light-text dark:text-notion-dark-text transition-all shadow-sm"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1.5 ml-1">
                  <Icons.Phone size={12} className="opacity-40" />
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-40">
                    Phone Line
                  </span>
                </div>
                <input
                  type="text"
                  className="w-full border border-notion-light-border dark:border-notion-dark-border rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500/30 bg-notion-light-bg dark:bg-notion-dark-bg text-notion-light-text dark:text-notion-dark-text transition-all shadow-sm"
                  placeholder="+1 (555) 000-0000"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1.5 ml-1">
                <Icons.Company size={12} className="opacity-40" />
                <span className="text-[10px] font-black uppercase tracking-widest opacity-40">
                  Operational Entity
                </span>
              </div>
              <input
                type="text"
                className="w-full border border-notion-light-border dark:border-notion-dark-border rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500/30 bg-notion-light-bg dark:bg-notion-dark-bg text-notion-light-text dark:text-notion-dark-text transition-all shadow-sm"
                placeholder="e.g. Acme Corp"
                value={formData.company}
                onChange={(e) =>
                  setFormData({ ...formData, company: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5 ml-1">
                  <Icons.Tag size={12} className="opacity-40" />
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-40">
                    Classification
                  </span>
                </div>
                <select
                  className="w-full border border-notion-light-border dark:border-notion-dark-border rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500/30 bg-notion-light-bg dark:bg-notion-dark-bg text-notion-light-text dark:text-notion-dark-text appearance-none cursor-pointer transition-all shadow-sm"
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
                <div className="flex items-center gap-2 mb-1.5 ml-1">
                  <Icons.Activity size={12} className="opacity-40" />
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-40">
                    Deployment Status
                  </span>
                </div>
                <select
                  className="w-full border border-notion-light-border dark:border-notion-dark-border rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500/30 bg-notion-light-bg dark:bg-notion-dark-bg text-notion-light-text dark:text-notion-dark-text appearance-none cursor-pointer transition-all shadow-sm"
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
              <div className="flex items-center gap-2 mb-1.5 ml-1">
                <Icons.Notes size={12} className="opacity-40" />
                <span className="text-[10px] font-black uppercase tracking-widest opacity-40">
                  Intelligence Briefing
                </span>
              </div>
              <textarea
                className="w-full border border-notion-light-border dark:border-notion-dark-border rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500/30 bg-notion-light-bg dark:bg-notion-dark-bg text-notion-light-text dark:text-notion-dark-text min-h-[120px] resize-none transition-all shadow-sm"
                placeholder="Operational context, strategic goals, or key details..."
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
              />
            </div>
          </div>

          <div className="pt-6 flex justify-end gap-3 border-t border-notion-light-border dark:border-notion-dark-border">
            <Button
              variant="ghost"
              onClick={onClose}
              className="px-6 py-2 text-[10px] font-black uppercase tracking-widest text-notion-light-muted dark:text-notion-dark-muted hover:bg-notion-light-hover dark:hover:bg-notion-dark-hover rounded-xl"
              disabled={isSubmitting || isLoading}
            >
              Abort
            </Button>
            <Button
              type="submit"
              variant="custom"
              isLoading={isSubmitting || isLoading}
              className={`px-8 py-2 ${colors.bg} ${colors.text} ${colors.border} border rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-blue-500/10 ${colors.hoverBg} transition-all active:scale-95`}
            >
              {initialData ? "Sync Intelligence" : "Execute Deployment"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
