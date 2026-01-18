import { useState, useEffect, useCallback } from "react";
import { Note, AppConfig } from "../types";
import { noteService } from "../services/noteService";

export const useNotes = (
  config: AppConfig,
  showToast: (msg: string, type: "success" | "error") => void,
) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadNotes = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await noteService.getNotes(config);
      setNotes(data);
    } catch {
      showToast("Failed to load notes", "error");
    } finally {
      setIsLoading(false);
    }
  }, [config, showToast]);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  const saveNote = async (note: Note, isUpdate: boolean) => {
    try {
      const success = await noteService.saveNote(note, isUpdate, config);
      if (success) {
        await loadNotes();
        showToast(isUpdate ? "Note saved" : "Note created", "success");
        return true;
      }
    } catch {
      showToast("Failed to save note", "error");
    }
    return false;
  };

  const deleteNote = async (id: string) => {
    try {
      const success = await noteService.deleteNote(id, config);
      if (success) {
        await loadNotes();
        showToast("Note deleted", "success");
        return true;
      }
    } catch {
      showToast("Failed to delete note", "error");
    }
    return false;
  };

  return {
    notes,
    isLoading,
    saveNote,
    deleteNote,
    refreshNotes: loadNotes,
  };
};
