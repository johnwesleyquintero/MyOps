import { Note, AppConfig } from "../types";
import { NOTES_CACHE_KEY } from "@/constants";
import { storage } from "../utils/storageUtils";
import { executeServiceAction } from "./baseService";

export const noteService = {
  getNotes: async (config: AppConfig): Promise<Note[]> => {
    return executeServiceAction({
      module: "notes",
      config,
      actionName: "fetch",
      demoLogic: () => {
        const cached = storage.get<Note[] | null>(NOTES_CACHE_KEY, null);
        if (cached) return cached;

        const mockNotes: Note[] = [
          {
            id: "n1",
            title: "Project Alpha SOP",
            content:
              "# Project Alpha SOP\n\n1. Initialize repository\n2. Setup CI/CD\n3. Configure monitoring",
            tags: ["SOP", "Technical"],
            lastModified: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            isFavorite: true,
          },
          {
            id: "n2",
            title: "Marketing Strategy 2024",
            content:
              "# Marketing Strategy\n\n- Focus on SEO\n- Increase social presence\n- Weekly newsletters",
            tags: ["Marketing", "Strategy"],
            lastModified: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ];
        storage.set(NOTES_CACHE_KEY, mockNotes);
        return mockNotes;
      },
    });
  },

  saveNote: async (
    note: Note,
    isUpdate: boolean,
    config: AppConfig,
  ): Promise<boolean> => {
    return executeServiceAction({
      module: "notes",
      config,
      actionName: isUpdate ? "update" : "create",
      entry: note,
      demoLogic: () => {
        const notes = storage.get<Note[]>(NOTES_CACHE_KEY, []);
        let updated;
        if (isUpdate) {
          updated = notes.map((n) =>
            n.id === note.id
              ? {
                  ...note,
                  lastModified: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                }
              : n,
          );
        } else {
          updated = [
            ...notes,
            {
              ...note,
              id: note.id || Math.random().toString(36).substr(2, 9),
              lastModified: new Date().toISOString(),
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ];
        }
        storage.set(NOTES_CACHE_KEY, updated);
        return true;
      },
    });
  },

  deleteNote: async (id: string, config: AppConfig): Promise<boolean> => {
    return executeServiceAction({
      module: "notes",
      config,
      actionName: "delete",
      entry: { id },
      demoLogic: () => {
        const notes = storage.get<Note[]>(NOTES_CACHE_KEY, []);
        const updated = notes.filter((n) => n.id !== id);
        storage.set(NOTES_CACHE_KEY, updated);
        return true;
      },
    });
  },
};
