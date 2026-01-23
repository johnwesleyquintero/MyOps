import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Contact, Interaction } from "../types";
import { Icon } from "../components/Icons";
import { toast } from "sonner";
import { generateContactMarkdownTable } from "@/utils/exportUtils";

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
  const [copiedMd, setCopiedMd] = useState(false);

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

  const handleCopyMarkdown = useCallback(async () => {
    if (filteredContacts.length === 0) {
      toast.error("No contacts to copy");
      return;
    }

    const mdTable = generateContactMarkdownTable(filteredContacts);
    try {
      await navigator.clipboard.writeText(mdTable);
      setCopiedMd(true);
      toast.success("Contacts copied to clipboard as Markdown table");
      setTimeout(() => setCopiedMd(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
      toast.error("Failed to copy to clipboard");
    }
  }, [filteredContacts]);

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
      setInteractions([]); // Clear existing interactions before loading new ones
      loadInteractions(selectedContact.id);
    } else {
      setInteractions([]);
    }
  }, [selectedContact, loadInteractions]);

  const handleSaveInteraction = useCallback(
    async (interaction: Interaction) => {
      const success = await onSaveInteraction(interaction);
      if (success && selectedContact) {
        await loadInteractions(selectedContact.id);
      }
      return success;
    },
    [onSaveInteraction, selectedContact, loadInteractions],
  );

  const handleAddInteraction = useCallback(() => {
    setEditingInteraction(null);
    setIsInteractionModalOpen(true);
  }, []);

  const handleEditInteraction = useCallback((interaction: Interaction) => {
    setEditingInteraction(interaction);
    setIsInteractionModalOpen(true);
  }, []);

  const handleAdd = useCallback(() => {
    setEditingContact(null);
    setIsModalOpen(true);
  }, []);

  const handleEdit = useCallback((contact: Contact) => {
    setEditingContact(contact);
    setIsModalOpen(true);
  }, []);

  const handleSave = useCallback(
    async (contact: Contact, isUpdate: boolean) => {
      const success = await onSaveContact(contact, isUpdate);
      if (success) {
        if (selectedContact?.id === contact.id) {
          setSelectedContact(contact);
        }
      }
      return success;
    },
    [onSaveContact, selectedContact],
  );

  const handleDelete = useCallback(
    async (contact: Contact) => {
      if (!window.confirm(`Are you sure you want to delete ${contact.name}?`)) {
        return;
      }

      const success = await onDeleteContact(contact.id);
      if (success) {
        if (selectedContact?.id === contact.id) {
          setSelectedContact(null);
        }
      }
    },
    [onDeleteContact, selectedContact],
  );

  const getInteractionIcon = useCallback((type: Interaction["type"]) => {
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
  }, []);

  return useMemo(
    () => ({
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
      copiedMd,
      handleCopyMarkdown,
    }),
    [
      viewMode,
      searchQuery,
      selectedContact,
      isModalOpen,
      editingContact,
      isInteractionModalOpen,
      editingInteraction,
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
      copiedMd,
      handleCopyMarkdown,
    ],
  );
};
