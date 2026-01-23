import { Contact, Interaction, AppConfig } from "../types";
import { CRM_CACHE_KEY, INTERACTIONS_CACHE_KEY } from "@/constants";
import { storage } from "../utils/storageUtils";
import { executeServiceAction } from "./baseService";

export const crmService = {
  getContacts: async (config: AppConfig): Promise<Contact[]> => {
    return executeServiceAction({
      module: "contacts",
      config,
      actionName: "fetch",
      demoLogic: () => {
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
      },
    });
  },

  saveContact: async (
    contact: Contact,
    isUpdate: boolean,
    config: AppConfig,
  ): Promise<boolean> => {
    try {
      await executeServiceAction({
        module: "contacts",
        config,
        actionName: isUpdate ? "update" : "create",
        entry: contact,
        demoLogic: async () => {
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
          return contact;
        },
      });
      return true;
    } catch {
      return false;
    }
  },

  deleteContact: async (id: string, config: AppConfig): Promise<boolean> => {
    try {
      await executeServiceAction({
        module: "contacts",
        config,
        actionName: "delete",
        entry: { id },
        demoLogic: async () => {
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
          return { id };
        },
      });
      return true;
    } catch {
      return false;
    }
  },

  getInteractions: async (
    contactId: string,
    config: AppConfig,
  ): Promise<Interaction[]> => {
    return executeServiceAction({
      module: "interactions",
      config,
      actionName: "fetch",
      demoLogic: () => {
        const interactions = storage.get<Interaction[]>(
          INTERACTIONS_CACHE_KEY,
          [],
        );
        return interactions.filter((i) => i.contactId === contactId);
      },
    });
  },

  saveInteraction: async (
    interaction: Interaction,
    config: AppConfig,
  ): Promise<boolean> => {
    try {
      const isUpdate = !!interaction.id;
      await executeServiceAction({
        module: "interactions",
        config,
        actionName: isUpdate ? "update" : "create",
        entry: interaction,
        demoLogic: () => {
          const interactions = storage.get<Interaction[]>(
            INTERACTIONS_CACHE_KEY,
            [],
          );
          let updated;
          if (isUpdate) {
            updated = interactions.map((i) =>
              i.id === interaction.id ? interaction : i,
            );
          } else {
            updated = [
              ...interactions,
              {
                ...interaction,
                id: Math.random().toString(36).substr(2, 9),
              },
            ];
          }
          storage.set(INTERACTIONS_CACHE_KEY, updated);
          return interaction;
        },
      });
      return true;
    } catch {
      return false;
    }
  },
};
