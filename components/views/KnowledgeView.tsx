import React, { useState, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Note } from "../../types";
import { Icon } from "../Icons";
import { useMarkdownEditor } from "../../hooks/useMarkdownEditor";
import { ViewHeader } from "../ViewHeader";

interface KnowledgeViewProps {
  notes: Note[];
  isLoading: boolean;
  onSaveNote: (note: Note, isUpdate: boolean) => Promise<boolean>;
  onDeleteNote: (id: string) => Promise<boolean>;
  initialSelectedNote?: Note | null;
  initialIsCreating?: boolean;
}

export const KnowledgeView: React.FC<KnowledgeViewProps> = ({
  notes,
  isLoading,
  onSaveNote,
  onDeleteNote,
  initialSelectedNote,
  initialIsCreating,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [rawSelectedNote, setRawSelectedNote] = useState<Note | null>(
    initialSelectedNote || null,
  );
  const [isEditing, setIsEditing] = useState(initialIsCreating || false);

  const selectedNote = useMemo(() => {
    if (rawSelectedNote) return rawSelectedNote;
    // When editing/creating and no specific note is selected, we treat it as a new note
    if (isEditing && !rawSelectedNote) return null;
    // Otherwise, default to the first note if available
    return notes.length > 0 && !isLoading ? notes[0] : null;
  }, [rawSelectedNote, isEditing, notes, isLoading]);

  const [editTitle, setEditTitle] = useState(selectedNote?.title || "");
  const [editContent, setEditContent] = useState(selectedNote?.content || "");
  const [editTags, setEditTags] = useState<string[]>(selectedNote?.tags || []);
  const [isCopied, setIsCopied] = useState(false);
  const [prevSelectedNote, setPrevSelectedNote] = useState<Note | null>(null);

  React.useEffect(() => {
    if (initialSelectedNote) {
      setRawSelectedNote(initialSelectedNote);
      setIsEditing(false);
    } else if (initialIsCreating) {
      setRawSelectedNote(null);
      setIsEditing(true);
      setEditTitle("");
      setEditContent("");
      setEditTags([]);
    }
  }, [initialSelectedNote, initialIsCreating]);

  const handleCopyMarkdown = async () => {
    if (!selectedNote) return;

    const markdown = `# ${selectedNote.title}\n\n${selectedNote.content}\n\nTags: ${selectedNote.tags.join(", ")}`;

    try {
      await navigator.clipboard.writeText(markdown);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy markdown: ", err);
    }
  };

  if (selectedNote !== prevSelectedNote) {
    setPrevSelectedNote(selectedNote);
    if (selectedNote && !isEditing) {
      setEditTitle(selectedNote.title);
      setEditContent(selectedNote.content);
      setEditTags(selectedNote.tags);
    } else if (!selectedNote && !isEditing) {
      setEditTitle("");
      setEditContent("");
      setEditTags([]);
    }
  }

  const { textareaRef, applyFormat } = useMarkdownEditor(
    editContent,
    setEditContent,
  );

  const filteredNotes = useMemo(() => {
    return notes.filter(
      (n) =>
        n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())),
    );
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
      // If we were creating a new note, we reset the raw selection
      // so it defaults to the first note in the updated list (the new one)
      if (!rawSelectedNote) {
        setRawSelectedNote(null);
      } else {
        // If we were updating, we update the raw selected note with the new data
        setRawSelectedNote(noteData);
      }
    }
  };

  const handleCreateNew = () => {
    setRawSelectedNote(null);
    setIsEditing(true);
    setEditTitle("");
    setEditContent("");
    setEditTags([]);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
      <ViewHeader
        title="Knowledge Base"
        subTitle="SOPs, playbooks, and strategic documentation"
      >
        <button
          onClick={handleCreateNew}
          className="notion-button notion-button-primary px-6 py-2.5 shadow-sm"
        >
          <Icon.Add size={18} />
          New Document
        </button>
      </ViewHeader>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Sidebar */}
        <div
          className={`w-full lg:w-80 xl:w-96 flex-shrink-0 space-y-4 ${selectedNote || isEditing ? "hidden lg:block" : "block"}`}
        >
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-notion-light-muted dark:text-notion-dark-muted group-focus-within:text-notion-light-text dark:group-focus-within:text-notion-dark-text transition-colors">
              <Icon.Search size={16} />
            </div>
            <input
              type="text"
              placeholder="Search knowledge..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="notion-input w-full pl-11 pr-4 py-2.5 focus:border-notion-light-text/30 dark:focus:border-notion-dark-text/30"
            />
          </div>

          <div className="space-y-1.5 max-h-[calc(100vh-280px)] overflow-y-auto overflow-x-hidden pr-2 custom-scrollbar">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Icon.Ai
                  className="animate-spin text-notion-light-text/30 dark:text-notion-dark-text/30"
                  size={24}
                />
              </div>
            ) : filteredNotes.length === 0 ? (
              <div className="text-center py-12 px-4 bg-notion-light-sidebar dark:bg-notion-dark-sidebar rounded-xl border border-dashed border-notion-light-border dark:border-notion-dark-border">
                <p className="notion-label">No documents found</p>
              </div>
            ) : (
              filteredNotes.map((note) => (
                <button
                  key={note.id}
                  onClick={() => {
                    setRawSelectedNote(note);
                    setIsEditing(false);
                  }}
                  className={`w-full text-left p-3 rounded-xl border transition-all group/item overflow-hidden ${
                    selectedNote?.id === note.id
                      ? "bg-notion-light-sidebar dark:bg-notion-dark-sidebar border-notion-light-text/20 dark:border-notion-dark-text/20"
                      : "bg-notion-light-bg dark:bg-notion-dark-bg border-notion-light-border dark:border-notion-dark-border hover:bg-notion-light-sidebar dark:hover:bg-notion-dark-sidebar"
                  }`}
                >
                  <h3
                    className={`font-bold text-sm truncate pr-2 ${
                      selectedNote?.id === note.id
                        ? "text-notion-light-text dark:text-notion-dark-text"
                        : "text-notion-light-text dark:text-notion-dark-text"
                    }`}
                  >
                    {note.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-1.5 overflow-hidden">
                    <span className="notion-label flex-shrink-0">
                      {note.lastModified &&
                      !isNaN(new Date(note.lastModified).getTime())
                        ? new Date(note.lastModified).toLocaleDateString(
                            undefined,
                            { month: "short", day: "numeric" },
                          )
                        : "Recently"}
                    </span>
                    <div className="flex gap-1 overflow-hidden">
                      {note.tags.slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className="px-1.5 py-0.5 bg-notion-light-sidebar dark:bg-notion-dark-sidebar text-notion-light-muted dark:text-notion-dark-muted rounded text-[9px] font-black uppercase tracking-tighter truncate max-w-[60px]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Content Area */}
        <div
          className={`flex-1 min-w-0 w-full ${!selectedNote && !isEditing ? "hidden lg:block" : "block"}`}
        >
          {selectedNote || isEditing ? (
            <div className="notion-card overflow-hidden shadow-sm">
              {/* Back button for mobile */}
              <button
                onClick={() => {
                  setRawSelectedNote(null);
                  setIsEditing(false);
                }}
                className="lg:hidden flex items-center gap-2 px-6 py-4 text-notion-light-muted hover:text-notion-light-text border-b border-notion-light-border dark:border-notion-dark-border"
              >
                <Icon.Prev size={16} /> Back to Documents
              </button>

              {/* Toolbar */}
              <div className="px-6 py-4 border-b border-notion-light-border dark:border-notion-dark-border flex items-center justify-between bg-notion-light-sidebar/50 dark:bg-notion-dark-sidebar/30">
                <div className="flex items-center gap-4">
                  {isEditing ? (
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      placeholder="Document Title"
                      className="bg-transparent border-none outline-none font-black text-xl text-notion-light-text dark:text-notion-dark-text placeholder:text-notion-light-muted/30 w-full md:w-96"
                    />
                  ) : (
                    <h2 className="font-black text-xl text-notion-light-text dark:text-notion-dark-text uppercase tracking-tight">
                      {selectedNote?.title}
                    </h2>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {isEditing ? (
                    <>
                      <button
                        onClick={() => {
                          setIsEditing(false);
                          if (!selectedNote) setRawSelectedNote(null);
                        }}
                        className="notion-button notion-button-ghost text-xs uppercase tracking-widest"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSave}
                        className="notion-button notion-button-primary px-4 shadow-sm text-xs uppercase tracking-widest"
                      >
                        Save SOP
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={handleCopyMarkdown}
                        className={`p-2 transition-all flex items-center gap-2 ${
                          isCopied
                            ? "text-green-500"
                            : "text-notion-light-muted hover:text-notion-light-text dark:hover:text-notion-dark-text"
                        }`}
                        title="Copy to Markdown"
                      >
                        <Icon.Copy size={18} />
                        {isCopied && (
                          <span className="text-[10px] font-black uppercase tracking-widest animate-in fade-in zoom-in duration-300">
                            Copied!
                          </span>
                        )}
                      </button>
                      <button
                        onClick={() => {
                          if (selectedNote) {
                            setEditTitle(selectedNote.title);
                            setEditContent(selectedNote.content);
                            setEditTags(selectedNote.tags);
                          }
                          setIsEditing(true);
                        }}
                        className="p-2 text-notion-light-muted hover:text-notion-light-text dark:hover:text-notion-dark-text transition-colors"
                        title="Edit Document"
                      >
                        <Icon.Edit size={18} />
                      </button>
                      <button
                        onClick={() =>
                          selectedNote && onDeleteNote(selectedNote.id)
                        }
                        className="p-2 text-notion-light-muted hover:text-red-600 dark:hover:text-red-400 transition-colors"
                        title="Delete Document"
                      >
                        <Icon.Delete size={18} />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Editor/Viewer */}
              <div className="p-4 sm:p-8 min-h-[500px] lg:min-h-[calc(100vh-350px)] flex flex-col">
                {isEditing ? (
                  <div className="space-y-4 flex-1 flex flex-col">
                    {/* Markdown Toolbar */}
                    <div className="flex flex-wrap items-center gap-1 p-1 bg-notion-light-sidebar dark:bg-notion-dark-sidebar rounded-lg w-fit border border-notion-light-border dark:border-notion-dark-border">
                      <button
                        onClick={() => applyFormat("bold")}
                        className="p-1.5 hover:bg-notion-light-bg dark:hover:bg-notion-dark-bg text-notion-light-text dark:text-notion-dark-text rounded transition-all"
                        title="Bold"
                      >
                        <Icon.Bold size={14} />
                      </button>
                      <button
                        onClick={() => applyFormat("italic")}
                        className="p-1.5 hover:bg-notion-light-bg dark:hover:bg-notion-dark-bg text-notion-light-text dark:text-notion-dark-text rounded transition-all"
                        title="Italic"
                      >
                        <Icon.Italic size={14} />
                      </button>
                      <button
                        onClick={() => applyFormat("h1")}
                        className="p-1.5 hover:bg-notion-light-bg dark:hover:bg-notion-dark-bg text-notion-light-text dark:text-notion-dark-text rounded transition-all font-black text-[10px]"
                      >
                        H1
                      </button>
                      <button
                        onClick={() => applyFormat("h2")}
                        className="p-1.5 hover:bg-notion-light-bg dark:hover:bg-notion-dark-bg text-notion-light-text dark:text-notion-dark-text rounded transition-all font-black text-[10px]"
                      >
                        H2
                      </button>
                      <button
                        onClick={() => applyFormat("list")}
                        className="p-1.5 hover:bg-notion-light-bg dark:hover:bg-notion-dark-bg text-notion-light-text dark:text-notion-dark-text rounded transition-all"
                        title="List"
                      >
                        <Icon.List size={14} />
                      </button>
                      <div className="w-px h-3 bg-notion-light-border dark:bg-notion-dark-border mx-1"></div>
                      <button
                        onClick={() => applyFormat("check")}
                        className="p-1.5 hover:bg-notion-light-bg dark:hover:bg-notion-dark-bg text-notion-light-text dark:text-notion-dark-text rounded transition-all"
                        title="Task List"
                      >
                        <Icon.Check size={14} />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 flex-1">
                      {/* Editor */}
                      <div className="space-y-2 flex flex-col">
                        <div className="flex items-center justify-between px-1">
                          <span className="text-[10px] font-black uppercase tracking-widest text-notion-light-muted/50 dark:text-notion-dark-muted/50">
                            Markdown Editor
                          </span>
                        </div>
                        <textarea
                          ref={textareaRef}
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          placeholder="Write your SOP here using markdown..."
                          className="w-full flex-1 min-h-[300px] xl:min-h-0 bg-notion-light-sidebar/20 dark:bg-notion-dark-sidebar/20 rounded-xl p-4 outline-none resize-none font-mono text-sm leading-relaxed text-notion-light-text dark:text-notion-dark-text placeholder:text-notion-light-muted/30 border border-notion-light-border/30 dark:border-notion-dark-border/30 focus:border-notion-light-text/20 dark:focus:border-notion-dark-text/20 transition-all"
                        />
                      </div>

                      {/* Live Preview */}
                      <div className="space-y-2 flex flex-col">
                        <div className="flex items-center justify-between px-1">
                          <span className="text-[10px] font-black uppercase tracking-widest text-notion-light-muted/50 dark:text-notion-dark-muted/50">
                            Live Preview
                          </span>
                        </div>
                        <div className="w-full flex-1 min-h-[300px] xl:min-h-0 overflow-y-auto bg-notion-light-sidebar/10 dark:bg-notion-dark-sidebar/10 rounded-xl p-6 border border-dashed border-notion-light-border dark:border-notion-dark-border markdown-preview">
                          <div className="prose prose-sm dark:prose-invert max-w-none text-notion-light-text dark:text-notion-dark-text leading-relaxed">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                              {editContent || "_No content to preview_"}
                            </ReactMarkdown>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-notion-light-border dark:border-notion-dark-border">
                      <div className="flex items-center gap-2 mb-2">
                        <Icon.Tag
                          size={14}
                          className="text-notion-light-muted"
                        />
                        <span className="notion-label">Tags</span>
                      </div>
                      <input
                        type="text"
                        value={editTags.join(", ")}
                        onChange={(e) =>
                          setEditTags(
                            e.target.value
                              .split(",")
                              .map((t) => t.trim())
                              .filter(Boolean),
                          )
                        }
                        placeholder="e.g. operational, SOP, marketing"
                        className="notion-input w-full px-4 py-2 focus:border-notion-light-text/30 dark:focus:border-notion-dark-text/30"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="max-w-none markdown-preview flex-1">
                    <div className="flex flex-wrap gap-2 mb-8">
                      {selectedNote?.tags.map((tag) => (
                        <span
                          key={tag}
                          className="notion-badge bg-notion-light-sidebar dark:bg-notion-dark-sidebar text-notion-light-muted dark:text-notion-dark-muted border-notion-light-border dark:border-notion-dark-border"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="prose prose-sm dark:prose-invert max-w-none text-notion-light-text dark:text-notion-dark-text leading-relaxed overflow-x-auto">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {selectedNote?.content || "No content available."}
                      </ReactMarkdown>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="h-[600px] flex flex-col items-center justify-center bg-notion-light-sidebar/30 dark:bg-notion-dark-sidebar/10 border border-dashed border-notion-light-border dark:border-notion-dark-border rounded-3xl p-12 text-center">
              <div className="w-16 h-16 bg-notion-light-sidebar dark:bg-notion-dark-sidebar rounded-2xl flex items-center justify-center mb-6 border border-notion-light-border dark:border-notion-dark-border">
                <Icon.Knowledge
                  className="text-notion-light-text/40 dark:text-notion-dark-text/40"
                  size={32}
                />
              </div>
              <h2 className="text-xl font-black text-notion-light-text dark:text-notion-dark-text mb-2 uppercase tracking-tight">
                Select a Document
              </h2>
              <p className="text-notion-light-muted dark:text-notion-dark-muted max-w-xs font-medium text-sm">
                Choose a document from the sidebar to view or edit, or create a
                new operational procedure.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
