import React from "react";
import { Contact, Interaction } from "../../types";
import { Icon } from "../Icons";
import { Button, Spinner } from "../ui";
import { ContactModal } from "../ContactModal";
import { InteractionModal } from "../InteractionModal";
import { ViewHeader } from "../ViewHeader";
import { ContactTable } from "../ContactTable";
import { MODULE_COLORS, CONTACT_TYPE_COLORS } from "@/constants";
import { useCrmViewLogic } from "@/hooks/useCrmViewLogic";
import { prefixToHover } from "@/utils/styleUtils";

interface CrmViewProps {
  contacts: Contact[];
  isLoading: boolean;
  onSaveContact: (contact: Contact, isUpdate: boolean) => Promise<boolean>;
  onDeleteContact: (id: string) => Promise<boolean>;
  onGetInteractions: (contactId: string) => Promise<Interaction[]>;
  onSaveInteraction: (interaction: Interaction) => Promise<boolean>;
  initialSelectedContact?: Contact | null;
}

export const CrmView: React.FC<CrmViewProps> = React.memo(
  ({
    contacts,
    isLoading,
    onSaveContact,
    onDeleteContact,
    onGetInteractions,
    onSaveInteraction,
    initialSelectedContact,
  }) => {
    const {
      viewMode,
      setViewMode,
      searchQuery,
      setSearchQuery,
      selectedContact,
      setSelectedContact,
      isModalOpen,
      setIsModalOpen,
      editingContact,
      isInteractionModalOpen,
      setIsInteractionModalOpen,
      editingInteraction,
      interactions,
      isInteractionsLoading,
      handleSaveInteraction,
      handleAddInteraction,
      handleEditInteraction,
      filteredContacts,
      handleAdd,
      handleEdit,
      handleDelete,
      handleSave,
      getInteractionIcon,
    } = useCrmViewLogic({
      contacts,
      onSaveContact,
      onDeleteContact,
      onGetInteractions,
      onSaveInteraction,
      initialSelectedContact,
    });

    const crmColors = MODULE_COLORS.crm;

    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <ViewHeader
          title="CRM & Contacts"
          subTitle="Manage your network and interaction logs"
        >
          <Button
            variant="custom"
            onClick={handleAdd}
            className={`w-full md:w-auto px-6 py-3 ${crmColors.solidBg} text-white border ${crmColors.border} rounded-2xl font-black text-sm uppercase tracking-widest shadow-sm hover:opacity-90 group transition-all active:scale-95`}
            leftIcon={
              <Icon.Add
                size={16}
                className="group-hover:rotate-90 transition-transform duration-300"
              />
            }
          >
            New Contact
          </Button>
        </ViewHeader>

        <div className="flex items-center gap-1 bg-notion-light-sidebar/50 dark:bg-notion-dark-sidebar/30 p-1 rounded-lg w-fit">
          {(["LIST", "TABLE"] as const).map((mode) => (
            <Button
              variant="custom"
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-all ${
                viewMode === mode
                  ? "bg-notion-light-bg dark:bg-notion-dark-bg text-notion-light-text dark:text-notion-dark-text shadow-sm"
                  : "text-notion-light-muted dark:text-notion-dark-muted hover:bg-notion-light-hover dark:hover:bg-notion-dark-hover"
              }`}
            >
              {mode === "LIST" ? "Grid" : "Table"}
            </Button>
          ))}
        </div>

        {viewMode === "LIST" ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contact List */}
            <div
              className={`lg:col-span-1 space-y-5 ${selectedContact ? "hidden lg:block" : "block"}`}
            >
              <div className="relative group">
                <div
                  className={`absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-notion-light-muted dark:text-notion-dark-muted group-focus-within:${crmColors.text} transition-colors`}
                >
                  <Icon.Search size={16} />
                </div>
                <input
                  type="text"
                  placeholder="Search contacts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`notion-input block w-full pl-11 pr-4 focus:${crmColors.border}`}
                />
              </div>

              <div className="space-y-3 max-h-[65vh] overflow-y-auto pr-2 custom-scrollbar">
                {isLoading ? (
                  Array(3)
                    .fill(0)
                    .map((_, i) => (
                      <div
                        key={i}
                        className={`h-20 ${crmColors.lightBg} rounded animate-pulse`}
                      ></div>
                    ))
                ) : filteredContacts.length > 0 ? (
                  filteredContacts.map((contact) => (
                    <Button
                      variant="custom"
                      key={contact.id}
                      onClick={() => setSelectedContact(contact)}
                      className={`w-full flex flex-col items-stretch text-left p-4 notion-card transition-all duration-300 group !justify-start !items-start ${
                        selectedContact?.id === contact.id
                          ? `${crmColors.bg} ${crmColors.border} shadow-md translate-x-1`
                          : `hover:${crmColors.lightBg} hover:border-notion-light-text/10 dark:hover:border-notion-dark-text/10 hover:shadow-sm`
                      }`}
                    >
                      <div className="flex items-start justify-between w-full">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded flex items-center justify-center text-sm font-bold shadow-sm transition-colors ${
                              selectedContact?.id === contact.id
                                ? `${crmColors.dot} text-white`
                                : `${crmColors.lightBg} ${crmColors.text} border ${crmColors.border}`
                            }`}
                          >
                            {contact.name.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <h3
                              className={`text-sm font-bold truncate ${selectedContact?.id === contact.id ? crmColors.text : "text-notion-light-text dark:text-notion-dark-text"} group-hover:${crmColors.text} transition-colors`}
                            >
                              {contact.name}
                            </h3>
                            <p className="notion-label truncate">
                              {contact.company || "Individual"}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm border flex-shrink-0 ${CONTACT_TYPE_COLORS[contact.type as keyof typeof CONTACT_TYPE_COLORS]}`}
                        >
                          {contact.type}
                        </span>
                      </div>
                      <div
                        className={`mt-4 pt-3 border-t ${crmColors.border} opacity-50 flex items-center gap-4 text-[10px] text-notion-light-muted dark:text-notion-dark-muted`}
                      >
                        <div className="flex items-center gap-1.5">
                          <Icon.Chat size={12} className="opacity-70" />
                          {contact.status}
                        </div>
                        <div
                          className={`w-1 h-1 rounded-full ${crmColors.dot} opacity-30`}
                        ></div>
                        <div className="flex items-center gap-1.5">
                          <Icon.Date size={12} className="opacity-70" />
                          {new Date(contact.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </Button>
                  ))
                ) : (
                  <div
                    className={`text-center py-16 ${crmColors.lightBg} rounded border-2 border-dashed ${crmColors.border}`}
                  >
                    <div
                      className={`inline-flex p-4 ${crmColors.text} opacity-20 mb-3 bg-white dark:bg-notion-dark-bg rounded-full shadow-inner`}
                    >
                      <Icon.Users size={32} />
                    </div>
                    <p className="notion-label">No contacts found</p>
                  </div>
                )}
              </div>
            </div>

            {/* Contact Detail / Activity */}
            <div
              className={`lg:col-span-2 ${!selectedContact ? "hidden lg:block" : "block"}`}
            >
              {selectedContact ? (
                <div className="notion-card overflow-hidden min-h-[70vh] flex flex-col shadow-xl animate-in zoom-in-95 duration-300">
                  {/* Back button for mobile */}
                  <Button
                    variant="ghost"
                    onClick={() => setSelectedContact(null)}
                    className={`lg:hidden justify-start gap-2 px-4 py-3 text-notion-light-muted dark:text-notion-dark-muted ${prefixToHover(crmColors.text)} border-b ${crmColors.border} ${crmColors.bg} active:opacity-70 transition-colors w-full text-left font-bold relative z-10`}
                    leftIcon={<Icon.Prev size={16} />}
                  >
                    Back to Contacts
                  </Button>

                  {/* Profile Header */}
                  <div
                    className={`p-6 md:p-10 border-b ${crmColors.border} ${crmColors.lightBg} relative overflow-hidden`}
                  >
                    <div
                      className={`absolute top-0 right-0 w-64 h-64 ${crmColors.text} opacity-5 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none`}
                    ></div>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                      <div className="flex items-center gap-4 md:gap-8">
                        <div
                          className={`w-16 h-16 md:w-20 md:h-20 ${crmColors.dot} text-white rounded flex items-center justify-center text-2xl md:text-3xl font-bold shadow-xl border-4 border-white dark:border-notion-dark-bg ring-1 ${crmColors.border} flex-shrink-0`}
                        >
                          {selectedContact.name.charAt(0)}
                        </div>
                        <div>
                          <h2
                            className={`text-xl md:text-2xl font-black ${crmColors.text} tracking-tight`}
                          >
                            {selectedContact.name}
                          </h2>
                          <div className="flex flex-wrap items-center gap-2 md:gap-3 mt-1.5">
                            <span
                              className={`text-[12px] md:text-[13px] font-bold text-notion-light-muted dark:text-notion-dark-muted ${crmColors.bg} px-2 py-0.5 md:px-2.5 md:py-1 rounded border ${crmColors.border} shadow-sm truncate max-w-[150px] md:max-w-none`}
                            >
                              {selectedContact.company ||
                                "Independent Operator"}
                            </span>
                            <div
                              className={`hidden xs:block w-1.5 h-1.5 rounded-full ${crmColors.dot} opacity-30`}
                            ></div>
                            <span
                              className={`text-[9px] md:text-[10px] font-bold px-2 py-0.5 md:px-3 md:py-1 rounded-full uppercase tracking-wider shadow-sm border ${CONTACT_TYPE_COLORS[selectedContact.type as keyof typeof CONTACT_TYPE_COLORS]}`}
                            >
                              {selectedContact.type}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 md:gap-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(selectedContact)}
                          className={`flex-1 md:flex-none ${crmColors.bg} text-notion-light-muted dark:text-notion-dark-muted ${prefixToHover(crmColors.text)} ${prefixToHover(crmColors.border)} border ${crmColors.border} rounded transition-all shadow-sm hover:shadow-md group`}
                          leftIcon={
                            <Icon.Edit
                              size={18}
                              className="group-hover:scale-110 transition-transform"
                            />
                          }
                        >
                          <span className="md:hidden text-xs font-bold uppercase tracking-widest">
                            Edit
                          </span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(selectedContact)}
                          className={`flex-1 md:flex-none ${crmColors.bg} text-notion-light-muted dark:text-notion-dark-muted ${prefixToHover(MODULE_COLORS.error.text)} ${prefixToHover(MODULE_COLORS.error.border)} border ${crmColors.border} rounded transition-all shadow-sm hover:shadow-md group`}
                          leftIcon={
                            <Icon.Delete
                              size={18}
                              className="group-hover:scale-110 group-hover:rotate-12 transition-transform"
                            />
                          }
                        >
                          <span className="md:hidden text-xs font-bold uppercase tracking-widest">
                            Delete
                          </span>
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5 mt-8 md:mt-10 relative z-10">
                      <div
                        className={`flex items-center gap-4 p-3 md:p-4 ${crmColors.bg} border ${crmColors.border} rounded hover:${crmColors.border} transition-colors shadow-sm overflow-hidden group`}
                      >
                        <div
                          className={`p-2 md:p-2.5 ${crmColors.lightBg} ${crmColors.text} rounded border ${crmColors.border} flex-shrink-0 group-hover:scale-110 transition-transform`}
                        >
                          <Icon.Chat size={16} />
                        </div>
                        <div className="overflow-hidden">
                          <p className="notion-label mb-0.5">Primary Email</p>
                          <p
                            className={`text-[13px] md:text-[14px] font-bold ${crmColors.text} truncate`}
                          >
                            {selectedContact.email || "N/A"}
                          </p>
                        </div>
                      </div>
                      <div
                        className={`flex items-center gap-4 p-3 md:p-4 ${crmColors.bg} border ${crmColors.border} rounded hover:${crmColors.border} transition-colors shadow-sm overflow-hidden group`}
                      >
                        <div
                          className={`p-2 md:p-2.5 ${crmColors.lightBg} ${crmColors.text} rounded border ${crmColors.border} flex-shrink-0 group-hover:scale-110 transition-transform`}
                        >
                          <Icon.Add size={16} />
                        </div>
                        <div className="overflow-hidden">
                          <p className="notion-label mb-0.5">Phone Number</p>
                          <p
                            className={`text-[13px] md:text-[14px] font-bold ${crmColors.text} truncate`}
                          >
                            {selectedContact.phone || "N/A"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Interaction Log Section */}
                  <div
                    className={`flex-1 p-6 md:p-10 ${crmColors.bg} border-t ${crmColors.border}`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                      <h3 className="notion-label uppercase tracking-[0.2em]">
                        Interaction Log
                      </h3>
                      <Button
                        variant="ghost"
                        onClick={handleAddInteraction}
                        className={`w-full sm:w-auto text-[11px] md:text-[12px] font-bold ${crmColors.text} ${crmColors.hoverBg} ${crmColors.bg} px-4 py-2.5 md:px-3 md:py-1.5 rounded border ${crmColors.border} shadow-sm group`}
                        leftIcon={
                          <Icon.Add
                            size={14}
                            className="group-hover:rotate-90 transition-transform duration-300"
                          />
                        }
                      >
                        Log Interaction
                      </Button>
                    </div>

                    <div className="space-y-8 relative">
                      <div
                        className={`absolute left-[13px] top-2 bottom-2 w-0.5 ${crmColors.border} opacity-50`}
                      ></div>

                      {isInteractionsLoading ? (
                        <div className="flex justify-center py-8">
                          <Spinner size="md" />
                        </div>
                      ) : interactions.length > 0 ? (
                        interactions.map((interaction) => (
                          <div
                            key={interaction.id}
                            className="relative pl-10 group/item"
                          >
                            <div
                              className={`absolute left-0 top-1 w-7 h-7 ${crmColors.dot} text-white rounded-full flex items-center justify-center z-10 border-4 border-white dark:border-notion-dark-bg shadow-lg group-hover/item:scale-110 transition-transform`}
                            >
                              {getInteractionIcon(interaction.type)}
                            </div>
                            <div
                              className={`p-5 ${crmColors.lightBg} rounded border ${crmColors.border} group-hover/item:shadow-md group-hover/item:${crmColors.border} transition-all`}
                            >
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                  <span
                                    className={`text-[14px] font-bold ${crmColors.text}`}
                                  >
                                    {interaction.type}
                                  </span>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() =>
                                      handleEditInteraction(interaction)
                                    }
                                    className={`opacity-0 group-hover/item:opacity-100 h-6 w-6 hover:${crmColors.bg} rounded text-notion-light-muted hover:${crmColors.text} transition-all`}
                                  >
                                    <Icon.Edit size={12} />
                                  </Button>
                                </div>
                                <span
                                  className={`notion-label ${crmColors.bg} px-2 py-0.5 rounded border ${crmColors.border}`}
                                >
                                  {new Date(
                                    interaction.date,
                                  ).toLocaleDateString()}
                                </span>
                              </div>
                              <p
                                className={`text-[14px] ${crmColors.text} opacity-80 leading-relaxed whitespace-pre-wrap`}
                              >
                                {interaction.notes}
                              </p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="relative pl-10 py-8 text-center">
                          <p className="notion-label">
                            No interactions logged yet
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  className={`h-full flex flex-col items-center justify-center ${crmColors.lightBg} border-2 border-dashed ${crmColors.border} rounded p-16 text-center animate-in fade-in duration-700`}
                >
                  <div
                    className={`w-20 h-20 ${crmColors.bg} border ${crmColors.border} shadow-xl rounded flex items-center justify-center text-notion-light-muted dark:text-notion-dark-muted mb-8 opacity-20 transform -rotate-6`}
                  >
                    <Icon.Users size={40} />
                  </div>
                  <h2
                    className={`text-lg font-black ${crmColors.text} mb-3 tracking-tight`}
                  >
                    No Contact Selected
                  </h2>
                  <p className="text-sm text-notion-light-muted dark:text-notion-dark-muted max-w-[280px] leading-relaxed">
                    Select a high-value contact from your network to access
                    their full intelligence profile and interaction history.
                  </p>
                  <div className="mt-10 flex gap-3">
                    <div
                      className={`w-2 h-2 rounded-full ${crmColors.dot} opacity-20`}
                    ></div>
                    <div
                      className={`w-2 h-2 rounded-full ${crmColors.dot} opacity-40`}
                    ></div>
                    <div
                      className={`w-2 h-2 rounded-full ${crmColors.dot} opacity-20`}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="h-[75vh] animate-in fade-in zoom-in-95 duration-500">
            <ContactTable
              contacts={filteredContacts}
              isLoading={isLoading}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onSelect={(contact) => {
                setSelectedContact(contact);
                setViewMode("LIST");
              }}
              selectedContactId={selectedContact?.id}
            />
          </div>
        )}

        <ContactModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleSave}
          initialData={editingContact}
          isLoading={isLoading}
        />

        {selectedContact && (
          <InteractionModal
            isOpen={isInteractionModalOpen}
            onClose={() => setIsInteractionModalOpen(false)}
            onSubmit={handleSaveInteraction}
            contactId={selectedContact.id}
            initialData={editingInteraction}
          />
        )}
      </div>
    );
  },
);
