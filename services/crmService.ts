import { Contact, Interaction, AppConfig } from "../types";
import { CRM_CACHE_KEY, INTERACTIONS_CACHE_KEY } from "@/constants";
import { fetchFromGas, postToGas } from "../utils/gasUtils";
import { storage } from "../utils/storageUtils";

export const crmService = {
  getContacts: async (config: AppConfig): Promise<Contact[]> => {
    if (config.mode === "DEMO") {
      const cached = storage.get<Contact[] | null>(CRM_CACHE_KEY, null);
      if (cached) return cached;

      const mockContacts: Contact[] = [
        {
          id: "c1",
          name: "John Doe",
          email: "john@example.com",
          company: "Tech Corp",
          type: "Client",
          status: "Active",
          tags: ["priority", "software"],
          createdAt: new Date().toISOString(),
          lastInteraction: new Date().toISOString(),
          interactions: [],
          notes: "Key client for the next 6 months.",
        },
        {
          id: "c2",
          name: "Jane Smith",
          email: "jane@vendor.com",
          company: "Design Studio",
          type: "Vendor",
          status: "Active",
          tags: ["design", "outsourcing"],
          createdAt: new Date().toISOString(),
          lastInteraction: new Date().toISOString(),
          interactions: [],
        },
      ];
      storage.set(CRM_CACHE_KEY, mockContacts);
      return mockContacts;
    }

    return fetchFromGas<Contact>(config, "contacts");
  },

  saveContact: async (
    contact: Contact,
    isUpdate: boolean,
    config: AppConfig,
  ): Promise<boolean> => {
    if (config.mode === "DEMO") {
      const contacts = await crmService.getContacts(config);
      let updated;
      if (isUpdate) {
        updated = contacts.map((c) => (c.id === contact.id ? contact : c));
      } else {
        updated = [
          ...contacts,
          {
            ...contact,
            id: contact.id || Math.random().toString(36).substr(2, 9),
          },
        ];
      }
      storage.set(CRM_CACHE_KEY, updated);
      return true;
    }

    if (!config.gasDeploymentUrl) return false;
    await postToGas(config.gasDeploymentUrl, {
      action: isUpdate ? "update" : "create",
      module: "contacts",
      entry: contact,
      token: config.apiToken,
    });
    return true;
  },

  deleteContact: async (id: string, config: AppConfig): Promise<boolean> => {
    if (config.mode === "DEMO") {
      const contacts = await crmService.getContacts(config);
      const updated = contacts.filter((c) => c.id !== id);
      storage.set(CRM_CACHE_KEY, updated);

      // Also cleanup interactions
      const interactions = storage.get<Interaction[]>(
        INTERACTIONS_CACHE_KEY,
        [],
      );
      if (interactions.length > 0) {
        const filteredInteractions = interactions.filter(
          (i) => i.contactId !== id,
        );
        storage.set(INTERACTIONS_CACHE_KEY, filteredInteractions);
      }
      return true;
    }

    if (!config.gasDeploymentUrl) return false;
    await postToGas(config.gasDeploymentUrl, {
      action: "delete",
      module: "contacts",
      id,
      token: config.apiToken,
    });
    return true;
  },

  getInteractions: async (
    contactId: string,
    config: AppConfig,
  ): Promise<Interaction[]> => {
    if (config.mode === "DEMO") {
      const all = storage.get<Interaction[]>(INTERACTIONS_CACHE_KEY, []);
      return all.filter((i) => i.contactId === contactId);
    }

    const all = await fetchFromGas<Interaction>(config, "interactions");
    return all.filter((i) => i.contactId === contactId);
  },

  saveInteraction: async (
    interaction: Interaction,
    config: AppConfig,
  ): Promise<boolean> => {
    if (config.mode === "DEMO") {
      const all = storage.get<Interaction[]>(INTERACTIONS_CACHE_KEY, []);
      let updated;

      if (interaction.id) {
        updated = all.map((i) => (i.id === interaction.id ? interaction : i));
      } else {
        updated = [
          ...all,
          {
            ...interaction,
            id: Math.random().toString(36).substr(2, 9),
          },
        ];
      }

      storage.set(INTERACTIONS_CACHE_KEY, updated);
      return true;
    }

    if (!config.gasDeploymentUrl) return false;
    await postToGas(config.gasDeploymentUrl, {
      action: interaction.id ? "update" : "create",
      module: "interactions",
      entry: interaction,
      token: config.apiToken,
    });
    return true;
  },
};
