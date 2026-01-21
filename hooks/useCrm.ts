import { useState, useEffect, useCallback, useMemo } from "react";
import { Contact, Interaction, AppConfig } from "../types";
import { crmService } from "../services/crmService";

export const useCrm = (
  config: AppConfig,
  showToast: (msg: string, type: "success" | "error") => void,
) => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadContacts = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await crmService.getContacts(config);
      setContacts(data);
    } catch {
      showToast("Failed to load contacts", "error");
    } finally {
      setIsLoading(false);
    }
  }, [config, showToast]);

  useEffect(() => {
    loadContacts();
  }, [config.mode, loadContacts]);

  const saveContact = useCallback(
    async (contact: Contact, isUpdate: boolean) => {
      try {
        const success = await crmService.saveContact(contact, isUpdate, config);
        if (success) {
          await loadContacts();
          showToast(
            isUpdate ? "Contact updated" : "Contact created",
            "success",
          );
          return true;
        }
      } catch {
        showToast("Failed to save contact", "error");
      }
      return false;
    },
    [config, loadContacts, showToast],
  );

  const getInteractions = useCallback(
    async (contactId: string) => {
      try {
        return await crmService.getInteractions(contactId, config);
      } catch {
        showToast("Failed to load interactions", "error");
        return [];
      }
    },
    [config, showToast],
  );

  const saveInteraction = useCallback(
    async (interaction: Interaction) => {
      try {
        const isUpdate = !!interaction.id;
        const success = await crmService.saveInteraction(interaction, config);
        if (success) {
          showToast(
            isUpdate ? "Interaction updated" : "Interaction logged",
            "success",
          );
          return true;
        }
      } catch {
        showToast("Failed to save interaction", "error");
      }
      return false;
    },
    [config, showToast],
  );

  const deleteContact = useCallback(
    async (id: string) => {
      try {
        const success = await crmService.deleteContact(id, config);
        if (success) {
          await loadContacts();
          showToast("Contact deleted", "success");
          return true;
        }
      } catch {
        showToast("Failed to delete contact", "error");
      }
      return false;
    },
    [config, loadContacts, showToast],
  );

  return useMemo(
    () => ({
      contacts,
      isLoading,
      saveContact,
      deleteContact,
      getInteractions,
      saveInteraction,
      refreshContacts: loadContacts,
    }),
    [
      contacts,
      isLoading,
      saveContact,
      deleteContact,
      getInteractions,
      saveInteraction,
      loadContacts,
    ],
  );
};
