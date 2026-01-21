import React, { useState, useMemo } from "react";
import { Note } from "../types";
import { toast } from "sonner";
import { Icon } from "../components/Icons";

interface UseKnowledgeLogicProps {
  notes: Note[];
  isLoading: boolean;
  onSaveNote: (note: Note, isUpdate: boolean) => Promise<boolean>;
  onDeleteNote: (id: string) => Promise<boolean>;
  initialSelectedNote?: Note | null;
  initialIsCreating?: boolean;
}

export const useKnowledgeLogic = ({
  notes,
  isLoading,
  onSaveNote,
  onDeleteNote,
  initialSelectedNote,
  initialIsCreating,
}: UseKnowledgeLogicProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [rawSelectedNote, setRawSelectedNote] = useState<Note | null>(
    initialSelectedNote || null,
  );
  const [isEditing, setIsEditing] = useState(initialIsCreating || false);
  const [isCopied, setIsCopied] = useState(false);

  // Editor states initialized directly or synced via props
  const [editTitle, setEditTitle] = useState(initialSelectedNote?.title || "");
  const [editContent, setEditContent] = useState(
    initialSelectedNote?.content || "",
  );
  const [editTags, setEditTags] = useState<string[]>(
    initialSelectedNote?.tags || [],
  );

  // Track props for syncing without useEffect
  const [prevInitialNoteId, setPrevInitialNoteId] = useState(
    initialSelectedNote?.id,
  );
  const [prevIsCreating, setPrevIsCreating] = useState(initialIsCreating);

  // Derived state: the note currently being viewed
  const selectedNote = useMemo(() => {
    if (rawSelectedNote) return rawSelectedNote;
    if (isEditing && !rawSelectedNote) return null;
    if (typeof window !== "undefined" && window.innerWidth < 1024) return null;
    return notes.length > 0 && !isLoading ? notes[0] : null;
  }, [rawSelectedNote, isEditing, notes, isLoading]);

  // Handle selection change from outside or internal state
  const handleSelectNote = (note: Note | null) => {
    setRawSelectedNote(note);
    setIsEditing(false);
    if (note) {
      setEditTitle(note.title);
      setEditContent(note.content);
      setEditTags(note.tags);
    } else {
      setEditTitle("");
      setEditContent("");
      setEditTags([]);
    }
  };

  const handleCreateNew = () => {
    setRawSelectedNote(null);
    setIsEditing(true);
    setEditTitle("");
    setEditContent("");
    setEditTags([]);
  };

  // Sync state if props change (replaces useEffect that caused lint errors)
  if (initialSelectedNote?.id !== prevInitialNoteId) {
    setPrevInitialNoteId(initialSelectedNote?.id);
    if (initialSelectedNote) {
      handleSelectNote(initialSelectedNote);
    }
  }

  if (initialIsCreating !== prevIsCreating) {
    setPrevIsCreating(initialIsCreating);
    if (initialIsCreating) {
      handleCreateNew();
    }
  }

  const filteredNotes = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return notes;

    return notes.filter((n) => {
      const titleMatch = n.title.toLowerCase().includes(query);
      const contentMatch = n.content.toLowerCase().includes(query);
      const tagsMatch = n.tags.some((t) => t.toLowerCase().includes(query));
      return titleMatch || contentMatch || tagsMatch;
    });
  }, [notes, searchQuery]);

  const handleSave = async () => {
    const noteData: Note = {
      id: selectedNote?.id || "",
      title: editTitle || "Untitled Note",
      content: editContent,
      tags: editTags,
      lastModified: new Date().toISOString(),
      createdAt: selectedNote?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isFavorite: selectedNote?.isFavorite,
    };

    const success = await onSaveNote(noteData, !!selectedNote);
    if (success) {
      setIsEditing(false);
      if (!rawSelectedNote) {
        setRawSelectedNote(null);
      } else {
        setRawSelectedNote(noteData);
      }
      toast.success(selectedNote ? "Note updated" : "Note created", {
        description: `"${noteData.title}" has been saved to your knowledge base.`,
        icon: React.createElement(Icon.Missions, { size: 14 }),
      });
    } else {
      toast.error("Failed to save note");
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      const success = await onDeleteNote(id);
      if (success) {
        setRawSelectedNote(null);
        toast.success("Note deleted", {
          description: `"${title}" has been removed.`,
          icon: React.createElement(Icon.Delete, { size: 14 }),
        });
      } else {
        toast.error("Failed to delete note");
      }
    }
  };

  const handleCopyMarkdown = async () => {
    if (!selectedNote) return;
    const markdown = `# ${selectedNote.title}\n\n${selectedNote.content}\n\nTags: ${selectedNote.tags.join(", ")}`;
    try {
      await navigator.clipboard.writeText(markdown);
      setIsCopied(true);
      toast.success("Document copied", {
        description: "Note content copied as Markdown.",
        icon: React.createElement(Icon.Copy, { size: 14 }),
      });
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy markdown: ", err);
    }
  };

  return {
    searchQuery,
    setSearchQuery,
    rawSelectedNote,
    setRawSelectedNote,
    isEditing,
    setIsEditing,
    selectedNote,
    editTitle,
    setEditTitle,
    editContent,
    setEditContent,
    editTags,
    setEditTags,
    isCopied,
    filteredNotes,
    handleSave,
    handleDelete,
    handleCreateNew,
    handleCopyMarkdown,
  };
};
