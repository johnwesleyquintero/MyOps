import React, { useState } from "react";
import { Contact, Interaction } from "../../types";
import { Icon } from "../Icons";

interface CrmViewProps {
  contacts: Contact[];
  isLoading: boolean;
  onSaveContact: (contact: Contact, isUpdate: boolean) => Promise<boolean>;
  onGetInteractions: (contactId: string) => Promise<Interaction[]>;
  onSaveInteraction: (interaction: Interaction) => Promise<boolean>;
}

export const CrmView: React.FC<CrmViewProps> = ({ contacts, isLoading }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  const filteredContacts = contacts.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const typeColors = {
    Client:
      "text-emerald-600 bg-emerald-500/10 dark:bg-emerald-500/20 dark:text-emerald-400 border-emerald-500/20 dark:border-emerald-500/30",
    Lead: "text-purple-600 bg-purple-500/10 dark:bg-purple-500/20 dark:text-purple-400 border-purple-500/20 dark:border-purple-500/30",
    Vendor:
      "text-amber-600 bg-amber-500/10 dark:bg-amber-500/20 dark:text-amber-400 border-amber-500/20 dark:border-amber-500/30",
    Partner:
      "text-rose-600 bg-rose-500/10 dark:bg-rose-500/20 dark:text-rose-400 border-rose-500/20 dark:border-rose-500/30",
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-notion-light-text dark:text-notion-dark-text">
            CRM &{" "}
            <span className="text-notion-light-text/60 dark:text-notion-dark-text/60">
              Contacts
            </span>
          </h1>
          <p className="notion-label mt-1">
            Manage your network and interaction logs
          </p>
        </div>
        <button
          onClick={() => {}}
          className="notion-button notion-button-primary"
        >
          <Icon.Add
            size={16}
            className="group-hover:rotate-90 transition-transform duration-300"
          />
          New Contact
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Contact List */}
        <div className="lg:col-span-1 space-y-5">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-notion-light-muted dark:text-notion-dark-muted group-focus-within:text-notion-light-text dark:group-focus-within:text-notion-dark-text transition-colors">
              <Icon.Search size={16} />
            </div>
            <input
              type="text"
              placeholder="Search contacts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="notion-input block w-full pl-11 pr-4"
            />
          </div>

          <div className="space-y-3 max-h-[65vh] overflow-y-auto pr-2 custom-scrollbar">
            {isLoading ? (
              Array(3)
                .fill(0)
                .map((_, i) => (
                  <div
                    key={i}
                    className="h-20 bg-notion-light-sidebar dark:bg-notion-dark-sidebar rounded animate-pulse"
                  ></div>
                ))
            ) : filteredContacts.length > 0 ? (
              filteredContacts.map((contact) => (
                <button
                  key={contact.id}
                  onClick={() => setSelectedContact(contact)}
                  className={`w-full text-left p-4 notion-card transition-all duration-300 group ${
                    selectedContact?.id === contact.id
                      ? "bg-notion-light-sidebar dark:bg-notion-dark-sidebar border-notion-light-text/30 dark:border-notion-dark-text/30 shadow-md translate-x-1"
                      : "hover:bg-notion-light-sidebar dark:hover:bg-notion-dark-sidebar hover:border-notion-light-text/10 dark:hover:border-notion-dark-text/10 hover:shadow-sm"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded flex items-center justify-center text-sm font-bold shadow-sm transition-colors ${
                          selectedContact?.id === contact.id
                            ? "bg-notion-light-text dark:bg-notion-dark-text text-white dark:text-notion-dark-bg"
                            : "bg-notion-light-sidebar dark:bg-notion-dark-sidebar text-notion-light-text dark:text-notion-dark-text border border-notion-light-border dark:border-notion-dark-border"
                        }`}
                      >
                        {contact.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-notion-light-text dark:text-notion-dark-text group-hover:text-notion-light-text/80 dark:group-hover:text-notion-dark-text/80 transition-colors">
                          {contact.name}
                        </h3>
                        <p className="notion-label">
                          {contact.company || "Individual"}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm border ${typeColors[contact.type]}`}
                    >
                      {contact.type}
                    </span>
                  </div>
                  <div className="mt-4 pt-3 border-t border-notion-light-border/50 dark:border-notion-dark-border/50 flex items-center gap-4 text-[10px] text-notion-light-muted dark:text-notion-dark-muted">
                    <div className="flex items-center gap-1.5">
                      <Icon.Chat size={12} className="opacity-70" />
                      {contact.status}
                    </div>
                    <div className="w-1 h-1 rounded-full bg-notion-light-border dark:bg-notion-dark-border"></div>
                    <div className="flex items-center gap-1.5">
                      <Icon.Date size={12} className="opacity-70" />
                      {new Date(contact.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <div className="text-center py-16 bg-notion-light-sidebar/50 dark:bg-notion-dark-sidebar/30 rounded border-2 border-dashed border-notion-light-border dark:border-notion-dark-border">
                <div className="inline-flex p-4 text-notion-light-muted dark:text-notion-dark-muted opacity-20 mb-3 bg-notion-light-bg dark:bg-notion-dark-bg rounded-full shadow-inner">
                  <Icon.Users size={32} />
                </div>
                <p className="notion-label">No contacts found</p>
              </div>
            )}
          </div>
        </div>

        {/* Contact Detail / Activity */}
        <div className="lg:col-span-2">
          {selectedContact ? (
            <div className="notion-card overflow-hidden min-h-[70vh] flex flex-col shadow-xl animate-in zoom-in-95 duration-300">
              {/* Profile Header */}
              <div className="p-10 border-b border-notion-light-border dark:border-notion-dark-border bg-notion-light-sidebar/30 dark:bg-notion-dark-sidebar/30 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-notion-light-text/5 dark:bg-notion-dark-text/5 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none"></div>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
                  <div className="flex items-center gap-8">
                    <div className="w-20 h-20 bg-notion-light-text dark:bg-notion-dark-text text-white dark:text-notion-dark-bg rounded flex items-center justify-center text-3xl font-bold shadow-xl border-4 border-white dark:border-notion-dark-bg ring-1 ring-notion-light-border dark:ring-notion-dark-border">
                      {selectedContact.name.charAt(0)}
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-notion-light-text dark:text-notion-dark-text tracking-tight">
                        {selectedContact.name}
                      </h2>
                      <div className="flex flex-wrap items-center gap-3 mt-2">
                        <span className="text-[13px] font-bold text-notion-light-muted dark:text-notion-dark-muted bg-notion-light-bg dark:bg-notion-dark-bg px-2.5 py-1 rounded border border-notion-light-border dark:border-notion-dark-border shadow-sm">
                          {selectedContact.company || "Independent Operator"}
                        </span>
                        <div className="w-1.5 h-1.5 rounded-full bg-notion-light-border dark:bg-notion-dark-border"></div>
                        <span
                          className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm border ${typeColors[selectedContact.type]}`}
                        >
                          {selectedContact.type}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button className="p-3 bg-notion-light-bg dark:bg-notion-dark-bg text-notion-light-muted hover:text-notion-light-text dark:hover:text-notion-dark-text hover:border-notion-light-text/30 dark:hover:border-notion-dark-text/30 border border-notion-light-border dark:border-notion-dark-border rounded transition-all shadow-sm hover:shadow-md">
                      <Icon.Edit size={20} />
                    </button>
                    <button className="p-3 bg-notion-light-bg dark:bg-notion-dark-bg text-notion-light-muted hover:text-red-500 hover:border-red-500/50 border border-notion-light-border dark:border-notion-dark-border rounded transition-all shadow-sm hover:shadow-md">
                      <Icon.Delete size={20} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-10 relative z-10">
                  <div className="flex items-center gap-4 p-4 bg-notion-light-bg dark:bg-notion-dark-bg border border-notion-light-border dark:border-notion-dark-border rounded hover:border-notion-light-text/30 dark:hover:border-notion-dark-text/30 transition-colors shadow-sm">
                    <div className="p-2.5 bg-notion-light-sidebar dark:bg-notion-dark-sidebar text-notion-light-text dark:text-notion-dark-text rounded border border-notion-light-border dark:border-notion-dark-border">
                      <Icon.Chat size={16} />
                    </div>
                    <div className="overflow-hidden">
                      <p className="notion-label mb-0.5">Primary Email</p>
                      <p className="text-[14px] font-bold text-notion-light-text dark:text-notion-dark-text truncate">
                        {selectedContact.email || "N/A"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-notion-light-bg dark:bg-notion-dark-bg border border-notion-light-border dark:border-notion-dark-border rounded hover:border-notion-light-text/30 dark:hover:border-notion-dark-text/30 transition-colors shadow-sm">
                    <div className="p-2.5 bg-notion-light-sidebar dark:bg-notion-dark-sidebar text-notion-light-text dark:text-notion-dark-text rounded border border-notion-light-border dark:border-notion-dark-border">
                      <Icon.Add size={16} />
                    </div>
                    <div className="overflow-hidden">
                      <p className="notion-label mb-0.5">Phone Number</p>
                      <p className="text-[14px] font-bold text-notion-light-text dark:text-notion-dark-text truncate">
                        {selectedContact.phone || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Activity Tabs Placeholder */}
              <div className="flex-1 p-10 bg-notion-light-bg dark:bg-notion-dark-bg">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="notion-label uppercase tracking-[0.2em]">
                    Interaction Log
                  </h3>
                  <button className="text-[12px] font-bold text-notion-light-text dark:text-notion-dark-text flex items-center gap-2 hover:bg-notion-light-hover dark:hover:bg-notion-dark-hover transition-colors bg-notion-light-sidebar dark:bg-notion-dark-sidebar px-3 py-1.5 rounded border border-notion-light-border dark:border-notion-dark-border shadow-sm">
                    <Icon.Add size={14} /> Log Interaction
                  </button>
                </div>

                <div className="space-y-8 relative">
                  <div className="absolute left-[13px] top-2 bottom-2 w-0.5 bg-notion-light-border dark:bg-notion-dark-border opacity-50"></div>

                  <div className="relative pl-10 group/item">
                    <div className="absolute left-0 top-1 w-7 h-7 bg-notion-light-text dark:bg-notion-dark-text text-white dark:text-notion-dark-bg rounded-full flex items-center justify-center z-10 border-4 border-white dark:border-notion-dark-bg shadow-lg group-hover/item:scale-110 transition-transform">
                      <Icon.Chat size={12} />
                    </div>
                    <div className="p-5 bg-notion-light-sidebar/40 dark:bg-notion-dark-sidebar/40 rounded border border-notion-light-border dark:border-notion-dark-border group-hover/item:shadow-md group-hover/item:border-notion-light-text/20 dark:group-hover/item:border-notion-dark-text/20 transition-all">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[14px] font-bold text-notion-light-text dark:text-notion-dark-text">
                          Initial Discovery Call
                        </span>
                        <span className="notion-label bg-notion-light-bg dark:bg-notion-dark-bg px-2 py-0.5 rounded border border-notion-light-border dark:border-notion-dark-border">
                          Oct 24, 2023
                        </span>
                      </div>
                      <p className="text-[14px] text-notion-light-muted dark:text-notion-dark-muted leading-relaxed">
                        Discussed project scope and initial requirements for the
                        dashboard migration.
                      </p>
                    </div>
                  </div>

                  <div className="relative pl-10 group/item">
                    <div className="absolute left-0 top-1 w-7 h-7 bg-notion-light-text dark:bg-notion-dark-text text-white dark:text-notion-dark-bg rounded-full flex items-center justify-center z-10 border-4 border-white dark:border-notion-dark-bg shadow-lg group-hover/item:scale-110 transition-transform">
                      <Icon.Docs size={12} />
                    </div>
                    <div className="p-5 bg-notion-light-sidebar/40 dark:bg-notion-dark-sidebar/40 rounded border border-notion-light-border dark:border-notion-dark-border group-hover/item:shadow-md group-hover/item:border-notion-light-text/20 dark:group-hover/item:border-notion-dark-text/20 transition-all">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[14px] font-bold text-notion-light-text dark:text-notion-dark-text">
                          Proposal Sent
                        </span>
                        <span className="notion-label bg-notion-light-bg dark:bg-notion-dark-bg px-2 py-0.5 rounded border border-notion-light-border dark:border-notion-dark-border">
                          Oct 26, 2023
                        </span>
                      </div>
                      <p className="text-[14px] text-notion-light-muted dark:text-notion-dark-muted leading-relaxed">
                        Emailed the full project proposal and timeline
                        estimates.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center bg-notion-light-sidebar/10 dark:bg-notion-dark-sidebar/5 border-2 border-dashed border-notion-light-border dark:border-notion-dark-border rounded p-16 text-center animate-in fade-in duration-700">
              <div className="w-20 h-20 bg-notion-light-bg dark:bg-notion-dark-bg border border-notion-light-border dark:border-notion-dark-border shadow-xl rounded flex items-center justify-center text-notion-light-muted dark:text-notion-dark-muted mb-8 opacity-20 transform -rotate-6">
                <Icon.Users size={40} />
              </div>
              <h2 className="text-lg font-black text-notion-light-text dark:text-notion-dark-text mb-3 tracking-tight">
                No Contact Selected
              </h2>
              <p className="text-sm text-notion-light-muted dark:text-notion-dark-muted max-w-[280px] leading-relaxed">
                Select a high-value contact from your network to access their
                full intelligence profile and interaction history.
              </p>
              <div className="mt-10 flex gap-3">
                <div className="w-2 h-2 rounded-full bg-blue-500/20"></div>
                <div className="w-2 h-2 rounded-full bg-blue-500/40"></div>
                <div className="w-2 h-2 rounded-full bg-blue-500/20"></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
