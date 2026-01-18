import { useState, useEffect, useCallback } from "react";
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

  const saveContact = async (contact: Contact, isUpdate: boolean) => {
    try {
      const success = await crmService.saveContact(contact, isUpdate, config);
      if (success) {
        await loadContacts();
        showToast(isUpdate ? "Contact updated" : "Contact created", "success");
        return true;
      }
    } catch {
      showToast("Failed to save contact", "error");
    }
    return false;
  };

  const getInteractions = async (contactId: string) => {
    try {
      return await crmService.getInteractions(contactId, config);
    } catch {
      showToast("Failed to load interactions", "error");
      return [];
    }
  };

  const saveInteraction = async (interaction: Interaction) => {
    try {
      const success = await crmService.saveInteraction(interaction, config);
      if (success) {
        showToast("Interaction logged", "success");
        return true;
      }
    } catch {
      showToast("Failed to log interaction", "error");
    }
    return false;
  };

  return {
    contacts,
    isLoading,
    saveContact,
    getInteractions,
    saveInteraction,
    refreshContacts: loadContacts,
  };
};
