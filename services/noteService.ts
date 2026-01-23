import { Note, AppConfig } from "../types";
import { NOTES_CACHE_KEY } from "@/constants";
import { fetchFromGas, postToGas } from "../utils/gasUtils";
import { storage } from "../utils/storageUtils";

export const noteService = {
  getNotes: async (config: AppConfig): Promise<Note[]> => {
    if (config.mode === "DEMO") {
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
    }

    return fetchFromGas<Note>(config, "notes");
  },

  saveNote: async (
    note: Note,
    isUpdate: boolean,
    config: AppConfig,
  ): Promise<boolean> => {
    if (config.mode === "DEMO") {
      const notes = await noteService.getNotes(config);
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
    }

    if (!config.gasDeploymentUrl) return false;
    await postToGas(config.gasDeploymentUrl, {
      action: isUpdate ? "update" : "create",
      module: "notes",
      entry: note,
      token: config.apiToken,
    });
    return true;
  },

  deleteNote: async (id: string, config: AppConfig): Promise<boolean> => {
    if (config.mode === "DEMO") {
      const notes = await noteService.getNotes(config);
      const updated = notes.filter((n) => n.id !== id);
      storage.set(NOTES_CACHE_KEY, updated);
      return true;
    }

    if (!config.gasDeploymentUrl) return false;
    await postToGas(config.gasDeploymentUrl, {
      action: "delete",
      module: "notes",
      entry: { id },
      token: config.apiToken,
    });
    return true;
  },
};
