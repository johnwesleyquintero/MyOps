import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Note } from "../../types";
import { Icon } from "../Icons";
import { useMarkdownEditor } from "../../hooks/useMarkdownEditor";
import { useKnowledgeLogic } from "../../hooks/useKnowledgeLogic";
import { ViewHeader } from "../ViewHeader";
import { MODULE_COLORS } from "../../constants/ui";
import { Button } from "../ui";

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
  const colors = MODULE_COLORS.docs;
  const {
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
  } = useKnowledgeLogic({
    notes,
    isLoading,
    onSaveNote,
    onDeleteNote,
    initialSelectedNote,
    initialIsCreating,
  });

  const { textareaRef, applyFormat } = useMarkdownEditor(
    editContent,
    setEditContent,
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
      <ViewHeader
        title="Knowledge Base"
        subTitle="SOPs, playbooks, and strategic documentation"
      >
        <Button
          variant="custom"
          onClick={handleCreateNew}
          className={`w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 ${colors.bg.replace("/10", "").replace("/20", "")} text-white border ${colors.border} rounded-2xl font-black text-sm uppercase tracking-widest shadow-sm hover:opacity-90 transition-all active:scale-95`}
        >
          <Icon.Add
            size={18}
            className="group-hover:rotate-90 transition-transform duration-300"
          />
          New Document
        </Button>
      </ViewHeader>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Sidebar */}
        <div
          className={`w-full lg:w-80 xl:w-96 flex-shrink-0 space-y-4 ${rawSelectedNote || isEditing ? "hidden lg:block" : "block"}`}
        >
          <div className="relative group">
            <div
              className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-notion-light-muted dark:text-notion-dark-muted group-focus-within:${colors.text} transition-colors`}
            >
              <Icon.Search size={16} />
            </div>
            <input
              type="text"
              placeholder="Search knowledge..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`notion-input w-full pl-11 pr-4 py-2.5 focus:${colors.border}`}
            />
          </div>

          <div className="space-y-1.5 max-h-[calc(100vh-280px)] overflow-y-auto overflow-x-hidden pr-2 custom-scrollbar">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Icon.Ai
                  className={`animate-spin ${colors.text} opacity-30`}
                  size={24}
                />
              </div>
            ) : filteredNotes.length === 0 ? (
              <div
                className={`text-center py-12 px-4 ${colors.lightBg} rounded-xl border border-dashed ${colors.border}`}
              >
                <p className="notion-label">No documents found</p>
              </div>
            ) : (
              filteredNotes.map((note) => (
                <Button
                  variant="custom"
                  key={note.id}
                  onClick={() => {
                    setRawSelectedNote(note);
                    setIsEditing(false);
                  }}
                  className={`w-full flex-col items-start text-left p-3 rounded-xl border transition-all group/item overflow-hidden ${
                    selectedNote?.id === note.id
                      ? `${colors.bg} ${colors.border} shadow-sm`
                      : `bg-transparent border-transparent ${colors.lightBg.replace("bg-", "hover:bg-")}`
                  }`}
                >
                  <h3
                    className={`font-bold text-sm truncate pr-2 w-full ${
                      selectedNote?.id === note.id
                        ? colors.text
                        : "text-notion-light-text dark:text-notion-dark-text"
                    }`}
                  >
                    {note.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-1.5 overflow-hidden w-full">
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
                          className={`px-1.5 py-0.5 ${colors.lightBg} ${colors.text} rounded text-[9px] font-black uppercase tracking-tighter truncate max-w-[60px] opacity-70`}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </Button>
              ))
            )}
          </div>
        </div>

        {/* Content Area */}
        <div
          className={`flex-1 min-w-0 w-full ${!rawSelectedNote && !isEditing ? "hidden lg:block" : "block"}`}
        >
          {rawSelectedNote || isEditing ? (
            <div className="notion-card overflow-hidden shadow-sm">
              {/* Back button for mobile */}
              <Button
                variant="custom"
                onClick={() => {
                  setRawSelectedNote(null);
                  setIsEditing(false);
                }}
                className={`lg:hidden flex items-center justify-start gap-2 px-4 py-4 text-notion-light-muted dark:text-notion-dark-muted ${colors.text.replace("text-", "hover:text-")} border-b ${colors.border} ${colors.bg} active:opacity-70 transition-colors w-full text-left font-bold relative z-10`}
              >
                <Icon.Prev size={16} /> Back to Documents
              </Button>

              {/* Toolbar */}
              <div
                className={`px-4 sm:px-6 py-4 border-b ${colors.border} flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${colors.lightBg}`}
              >
                <div className="flex items-center gap-4 min-w-0">
                  {isEditing ? (
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      placeholder="Document Title"
                      className={`bg-transparent border-none outline-none font-black text-xl ${colors.text} placeholder:opacity-30 w-full`}
                    />
                  ) : (
                    <h2
                      className={`font-black text-xl ${colors.text} uppercase tracking-tight truncate`}
                    >
                      {selectedNote?.title}
                    </h2>
                  )}
                </div>
                <div className="flex items-center gap-2 justify-end">
                  {isEditing ? (
                    <>
                      <Button
                        variant="ghost"
                        onClick={() => {
                          setIsEditing(false);
                          if (!selectedNote) setRawSelectedNote(null);
                        }}
                        className="text-[10px] uppercase tracking-widest px-3 py-2"
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="custom"
                        onClick={handleSave}
                        className={`px-4 py-2 ${colors.bg} ${colors.text} ${colors.border} border rounded-lg shadow-sm text-[10px] uppercase tracking-widest font-black hover:opacity-80 transition-opacity`}
                      >
                        Save SOP
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="custom"
                        onClick={handleCopyMarkdown}
                        className={`p-3 sm:p-2 transition-all flex items-center gap-2 ${
                          isCopied
                            ? MODULE_COLORS.crm.text
                            : `text-notion-light-muted dark:text-notion-dark-muted ${colors.text.replace("text-", "hover:text-")}`
                        }`}
                        title="Copy to Markdown"
                      >
                        <Icon.Copy size={18} />
                        {isCopied && (
                          <span className="text-[10px] font-black uppercase tracking-widest animate-in fade-in zoom-in duration-300">
                            Copied!
                          </span>
                        )}
                      </Button>
                      <Button
                        variant="custom"
                        onClick={() => {
                          if (selectedNote) {
                            setEditTitle(selectedNote.title);
                            setEditContent(selectedNote.content);
                            setEditTags(selectedNote.tags);
                          }
                          setIsEditing(true);
                        }}
                        className={`p-3 sm:p-2 text-notion-light-muted dark:text-notion-dark-muted ${colors.text.replace("text-", "hover:text-")} transition-colors`}
                        title="Edit Document"
                      >
                        <Icon.Edit size={18} />
                      </Button>
                      <Button
                        variant="custom"
                        onClick={() =>
                          selectedNote &&
                          handleDelete(selectedNote.id, selectedNote.title)
                        }
                        className={`p-3 sm:p-2 text-notion-light-muted dark:text-notion-dark-muted ${MODULE_COLORS.error.text.replace("text-", "hover:text-")} transition-colors`}
                        title="Delete Document"
                      >
                        <Icon.Delete size={18} />
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {/* Editor/Viewer */}
              <div className="p-4 sm:p-8 min-h-[500px] lg:min-h-[calc(100vh-350px)] flex flex-col">
                {isEditing ? (
                  <div className="space-y-4 flex-1 flex flex-col">
                    {/* Markdown Toolbar */}
                    <div
                      className={`flex flex-wrap items-center gap-1 p-1 ${colors.lightBg} rounded-lg w-fit border ${colors.border}`}
                    >
                      <Button
                        variant="custom"
                        onClick={() => applyFormat("bold")}
                        className={`p-1.5 ${colors.bg.replace("bg-", "hover:bg-")} ${colors.text} rounded transition-all`}
                        title="Bold"
                      >
                        <Icon.Bold size={14} />
                      </Button>
                      <Button
                        variant="custom"
                        onClick={() => applyFormat("italic")}
                        className={`p-1.5 ${colors.bg.replace("bg-", "hover:bg-")} ${colors.text} rounded transition-all`}
                        title="Italic"
                      >
                        <Icon.Italic size={14} />
                      </Button>
                      <Button
                        variant="custom"
                        onClick={() => applyFormat("h1")}
                        className={`p-1.5 ${colors.bg.replace("bg-", "hover:bg-")} ${colors.text} rounded transition-all font-black text-[10px]`}
                      >
                        H1
                      </Button>
                      <Button
                        variant="custom"
                        onClick={() => applyFormat("h2")}
                        className={`p-1.5 ${colors.bg.replace("bg-", "hover:bg-")} ${colors.text} rounded transition-all font-black text-[10px]`}
                      >
                        H2
                      </Button>
                      <Button
                        variant="custom"
                        onClick={() => applyFormat("list")}
                        className={`p-1.5 ${colors.bg.replace("bg-", "hover:bg-")} ${colors.text} rounded transition-all`}
                        title="List"
                      >
                        <Icon.List size={14} />
                      </Button>
                      <div className={`w-px h-3 ${colors.border} mx-1`}></div>
                      <Button
                        variant="custom"
                        onClick={() => applyFormat("check")}
                        className={`p-1.5 ${colors.bg.replace("bg-", "hover:bg-")} ${colors.text} rounded transition-all`}
                        title="Task List"
                      >
                        <Icon.Check size={14} />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 flex-1">
                      {/* Editor */}
                      <div className="space-y-2 flex flex-col">
                        <div className="flex items-center justify-between px-1">
                          <span
                            className={`text-[10px] font-black uppercase tracking-widest ${colors.text} opacity-50`}
                          >
                            Markdown Editor
                          </span>
                        </div>
                        <textarea
                          ref={textareaRef}
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          placeholder="Write your SOP here using markdown..."
                          className={`w-full flex-1 min-h-[300px] xl:min-h-0 ${colors.bg} rounded-xl p-4 outline-none resize-none font-mono text-sm leading-relaxed ${colors.text} placeholder:opacity-30 border ${colors.border} focus:opacity-100 transition-all`}
                        />
                      </div>

                      {/* Live Preview */}
                      <div className="space-y-2 flex flex-col">
                        <div className="flex items-center justify-between px-1">
                          <span
                            className={`text-[10px] font-black uppercase tracking-widest ${colors.text} opacity-50`}
                          >
                            Live Preview
                          </span>
                        </div>
                        <div
                          className={`w-full flex-1 min-h-[300px] xl:min-h-0 overflow-y-auto ${colors.lightBg} rounded-xl p-6 border border-dashed ${colors.border} markdown-preview`}
                        >
                          <div
                            className={`prose prose-sm dark:prose-invert max-w-none ${colors.text} leading-relaxed`}
                          >
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                              {editContent || "_No content to preview_"}
                            </ReactMarkdown>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className={`pt-4 border-t ${colors.border}`}>
                      <div className="flex items-center gap-2 mb-2">
                        <Icon.Tag size={14} className={colors.text} />
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
                        className={`notion-input w-full px-4 py-2 focus:${colors.border}`}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="max-w-none markdown-preview flex-1">
                    <div className="flex flex-wrap gap-2 mb-8">
                      {selectedNote?.tags.map((tag) => (
                        <span
                          key={tag}
                          className={`px-3 py-1 ${colors.lightBg} ${colors.text} border ${colors.border} rounded-lg text-[10px] font-black uppercase tracking-widest`}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div
                      className={`prose prose-sm dark:prose-invert max-w-none ${colors.text} leading-relaxed overflow-x-auto`}
                    >
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {selectedNote?.content || "No content available."}
                      </ReactMarkdown>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div
              className={`h-[600px] flex flex-col items-center justify-center ${colors.lightBg} border border-dashed ${colors.border} rounded-3xl p-12 text-center`}
            >
              <div
                className={`w-16 h-16 ${colors.bg} rounded-2xl flex items-center justify-center mb-6 border ${colors.border}`}
              >
                <Icon.Knowledge
                  className={`${colors.text} opacity-40`}
                  size={32}
                />
              </div>
              <h2
                className={`text-xl font-black ${colors.text} mb-2 uppercase tracking-tight`}
              >
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
