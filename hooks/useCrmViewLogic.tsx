import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Contact, Interaction } from "../types";
import { toast } from "sonner";
import { Icon } from "../components/Icons";

interface UseCrmViewLogicProps {
  contacts: Contact[];
  onSaveContact: (contact: Contact, isUpdate: boolean) => Promise<boolean>;
  onDeleteContact: (id: string) => Promise<boolean>;
  onGetInteractions: (contactId: string) => Promise<Interaction[]>;
  onSaveInteraction: (interaction: Interaction) => Promise<boolean>;
  initialSelectedContact?: Contact | null;
}

export const useCrmViewLogic = ({
  contacts,
  onSaveContact,
  onDeleteContact,
  onGetInteractions,
  onSaveInteraction,
  initialSelectedContact,
}: UseCrmViewLogicProps) => {
  const [viewMode, setViewMode] = useState<"LIST" | "TABLE">("LIST");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedContact, setSelectedContact] = useState<Contact | null>(
    initialSelectedContact || null,
  );

  useEffect(() => {
    if (initialSelectedContact) {
      setSelectedContact(initialSelectedContact);
    }
  }, [initialSelectedContact]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [isInteractionModalOpen, setIsInteractionModalOpen] = useState(false);
  const [editingInteraction, setEditingInteraction] =
    useState<Interaction | null>(null);
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [isInteractionsLoading, setIsInteractionsLoading] = useState(false);

  const loadInteractions = useCallback(
    async (contactId: string) => {
      setIsInteractionsLoading(true);
      try {
        const data = await onGetInteractions(contactId);
        setInteractions(
          data.sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
          ),
        );
      } finally {
        setIsInteractionsLoading(false);
      }
    },
    [onGetInteractions],
  );

  useEffect(() => {
    if (selectedContact) {
      loadInteractions(selectedContact.id);
    } else {
      setInteractions([]);
    }
  }, [selectedContact, loadInteractions]);

  const handleSaveInteraction = async (interaction: Interaction) => {
    const success = await onSaveInteraction(interaction);
    if (success && selectedContact) {
      await loadInteractions(selectedContact.id);
      toast.success("Interaction saved", {
        description: `Successfully recorded ${interaction.type.toLowerCase()} for ${selectedContact.name}.`,
      });
    } else if (!success) {
      toast.error("Failed to save interaction", {
        description: "Please check your connection and try again.",
      });
    }
    return success;
  };

  const handleAddInteraction = () => {
    setEditingInteraction(null);
    setIsInteractionModalOpen(true);
  };

  const handleEditInteraction = (interaction: Interaction) => {
    setEditingInteraction(interaction);
    setIsInteractionModalOpen(true);
  };

  const filteredContacts = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return contacts;

    return contacts.filter((c) => {
      const nameMatch = c.name.toLowerCase().includes(query);
      const companyMatch = c.company?.toLowerCase().includes(query);
      const emailMatch = c.email?.toLowerCase().includes(query);
      return nameMatch || companyMatch || emailMatch;
    });
  }, [contacts, searchQuery]);

  const handleAdd = () => {
    setEditingContact(null);
    setIsModalOpen(true);
  };

  const handleEdit = (contact: Contact) => {
    setEditingContact(contact);
    setIsModalOpen(true);
  };

  const handleSave = async (contact: Contact, isUpdate: boolean) => {
    const success = await onSaveContact(contact, isUpdate);
    if (success) {
      if (selectedContact?.id === contact.id) {
        setSelectedContact(contact);
      }
      toast.success(isUpdate ? "Contact updated" : "Contact created", {
        description: `${contact.name} has been saved to your CRM.`,
      });
    } else {
      toast.error("Failed to save contact", {
        description: "Please check your connection and try again.",
      });
    }
    return success;
  };

  const handleDelete = async (contact: Contact) => {
    if (!window.confirm(`Are you sure you want to delete ${contact.name}?`)) {
      return;
    }

    const success = await onDeleteContact(contact.id);
    if (success) {
      if (selectedContact?.id === contact.id) {
        setSelectedContact(null);
      }
      toast.success("Contact deleted", {
        description: `${contact.name} has been removed from your CRM.`,
      });
    } else {
      toast.error("Failed to delete contact", {
        description: "Please check your connection and try again.",
      });
    }
  };

  const getInteractionIcon = (type: Interaction["type"]) => {
    switch (type) {
      case "Call":
        return <Icon.Phone size={12} />;
      case "Email":
        return <Icon.Mail size={12} />;
      case "Message":
        return <Icon.Chat size={12} />;
      case "Meeting":
        return <Icon.Users size={12} />;
      default:
        return <Icon.Chat size={12} />;
    }
  };

  return {
    viewMode,
    setViewMode,
    searchQuery,
    setSearchQuery,
    selectedContact,
    setSelectedContact,
    isModalOpen,
    setIsModalOpen,
    editingContact,
    setEditingContact,
    isInteractionModalOpen,
    setIsInteractionModalOpen,
    editingInteraction,
    setEditingInteraction,
    interactions,
    isInteractionsLoading,
    handleSaveInteraction,
    handleAddInteraction,
    handleEditInteraction,
    filteredContacts,
    handleAdd,
    handleEdit,
    handleSave,
    handleDelete,
    getInteractionIcon,
  };
};
