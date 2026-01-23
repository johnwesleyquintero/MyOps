import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Note } from "../../types";
import { Icon } from "../Icons";
import { useMarkdownEditor } from "../../hooks/useMarkdownEditor";
import { useKnowledgeLogic } from "../../hooks/useKnowledgeLogic";
import { ViewHeader } from "../ViewHeader";
import { MODULE_COLORS } from "../../constants/ui";
import { Button, DebouncedInput, Card, Badge } from "../ui";

interface KnowledgeViewProps {
  notes: Note[];
  isLoading: boolean;
  onSaveNote: (note: Note, isUpdate: boolean) => Promise<boolean>;
  onDeleteNote: (id: string) => Promise<boolean>;
  initialSelectedNote?: Note | null;
  initialIsCreating?: boolean;
}

export const KnowledgeView: React.FC<KnowledgeViewProps> = React.memo(
  ({
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
            className={`w-full md:w-auto px-6 py-2 ${colors.bg} ${colors.text} ${colors.border} border rounded-xl font-black text-[10px] uppercase tracking-widest shadow-sm ${colors.hoverBg} transition-all active:scale-95`}
          >
            <Icon.Add
              size={14}
              className="group-hover:rotate-90 transition-transform duration-300"
            />
            New Intelligence
          </Button>
        </ViewHeader>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Sidebar */}
          <div
            className={`w-full lg:w-80 xl:w-96 flex-shrink-0 space-y-4 ${rawSelectedNote || isEditing ? "hidden lg:block" : "block"}`}
          >
            <DebouncedInput
              placeholder="Search knowledge..."
              value={searchQuery}
              onChange={setSearchQuery}
              className={`w-full pl-11 pr-4 py-2.5 rounded-xl border-notion-light-border dark:border-notion-dark-border focus:ring-1 focus:ring-blue-500/30 transition-all`}
              icon={<Icon.Search size={16} className="opacity-40" />}
            />

            <div className="space-y-1.5 max-h-[calc(100vh-280px)] overflow-y-auto overflow-x-hidden pr-2 custom-scrollbar">
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <Icon.Brain
                    className={`animate-spin ${colors.text} opacity-30`}
                    size={24}
                  />
                </div>
              ) : filteredNotes.length === 0 ? (
                <div
                  className={`text-center py-12 px-4 ${colors.lightBg} rounded-xl border border-dashed ${colors.border}`}
                >
                  <Badge
                    variant="ghost"
                    size="sm"
                    className="opacity-60 uppercase tracking-widest font-bold text-[10px]"
                  >
                    No intelligence found
                  </Badge>
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
                    className={`w-full flex-col items-start text-left p-4 rounded-xl border transition-all group/item overflow-hidden ${
                      selectedNote?.id === note.id
                        ? `${colors.bg} ${colors.border} shadow-md scale-[1.02] z-10`
                        : `bg-transparent border-transparent hover:bg-notion-light-hover dark:hover:bg-notion-dark-hover`
                    }`}
                  >
                    <h3
                      className={`font-bold text-sm truncate pr-2 w-full mb-1 ${
                        selectedNote?.id === note.id
                          ? colors.text
                          : "text-notion-light-text dark:text-notion-dark-text"
                      }`}
                    >
                      {note.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1.5 overflow-hidden w-full">
                      <div className="flex items-center gap-1.5 opacity-40">
                        <Icon.Date size={10} />
                        <span className="text-[9px] font-black uppercase tracking-widest">
                          {note.lastModified &&
                          !isNaN(new Date(note.lastModified).getTime())
                            ? new Date(note.lastModified).toLocaleDateString(
                                undefined,
                                { month: "short", day: "numeric" },
                              )
                            : "Recently"}
                        </span>
                      </div>
                      <div className="flex gap-1 overflow-hidden">
                        {note.tags.slice(0, 2).map((tag) => (
                          <Badge
                            variant="custom"
                            key={tag}
                            size="xs"
                            className={`${colors.lightBg} ${colors.text} border ${colors.border} px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest opacity-70`}
                          >
                            {tag}
                          </Badge>
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
              <Card
                padding="none"
                className="overflow-hidden shadow-xl border-none rounded-2xl"
              >
                {/* Back button for mobile */}
                <Button
                  variant="ghost"
                  onClick={() => {
                    setRawSelectedNote(null);
                    setIsEditing(false);
                  }}
                  className={`lg:hidden flex items-center justify-start gap-2 px-6 py-4 border-b ${colors.border} bg-notion-light-sidebar/50 dark:bg-notion-dark-sidebar/50 backdrop-blur-md w-full text-left font-bold relative z-10`}
                >
                  <Icon.ChevronLeft size={16} />{" "}
                  <span className="text-[10px] uppercase tracking-widest font-black">
                    Back to Documents
                  </span>
                </Button>

                {/* Toolbar */}
                <div
                  className={`px-6 py-4 border-b ${colors.border} flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-notion-light-sidebar/30 dark:bg-notion-dark-sidebar/30 backdrop-blur-md`}
                >
                  <div className="flex items-center gap-4 min-w-0">
                    {isEditing ? (
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        placeholder="Document Title"
                        className={`bg-transparent border-none outline-none font-black text-xl ${colors.text} placeholder:opacity-30 w-full focus:ring-0`}
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
                          className="text-[10px] uppercase tracking-widest font-black px-4 py-2 hover:bg-notion-light-hover dark:hover:bg-notion-dark-hover"
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="custom"
                          onClick={handleSave}
                          className={`px-6 py-2 ${colors.bg} ${colors.text} ${colors.border} border rounded-xl shadow-sm text-[10px] uppercase tracking-widest font-black hover:opacity-80 transition-all active:scale-95`}
                        >
                          Sync Intelligence
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={handleCopyMarkdown}
                          className={`w-9 h-9 transition-all flex items-center justify-center rounded-lg ${
                            isCopied
                              ? "bg-green-500/10 text-green-600 dark:text-green-400"
                              : "text-notion-light-muted dark:text-notion-dark-muted hover:bg-notion-light-hover dark:hover:bg-notion-dark-hover"
                          }`}
                          title="Copy to Markdown"
                        >
                          {isCopied ? (
                            <Icon.Check size={18} />
                          ) : (
                            <Icon.Copy size={18} />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            if (selectedNote) {
                              setEditTitle(selectedNote.title);
                              setEditContent(selectedNote.content);
                              setEditTags(selectedNote.tags);
                            }
                            setIsEditing(true);
                          }}
                          className="w-9 h-9 text-notion-light-muted dark:text-notion-dark-muted hover:bg-notion-light-hover dark:hover:bg-notion-dark-hover transition-colors rounded-lg"
                          title="Edit Document"
                        >
                          <Icon.Edit size={18} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            selectedNote &&
                            handleDelete(selectedNote.id, selectedNote.title)
                          }
                          className="w-9 h-9 text-notion-light-muted dark:text-notion-dark-muted hover:bg-red-500/10 hover:text-red-600 transition-colors rounded-lg"
                          title="Delete Document"
                        >
                          <Icon.Delete size={18} />
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                {/* Editor/Viewer */}
                <div className="p-6 sm:p-8 min-h-[500px] lg:min-h-[calc(100vh-350px)] flex flex-col">
                  {isEditing ? (
                    <div className="space-y-6 flex-1 flex flex-col">
                      {/* Markdown Toolbar */}
                      <div
                        className={`flex flex-wrap items-center gap-1 p-1.5 bg-notion-light-sidebar dark:bg-notion-dark-sidebar rounded-xl w-fit border border-notion-light-border dark:border-notion-dark-border shadow-sm`}
                      >
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => applyFormat("bold")}
                          className={`w-8 h-8 hover:bg-notion-light-hover dark:hover:bg-notion-dark-hover ${colors.text} transition-all rounded-lg`}
                          title="Bold"
                        >
                          <Icon.Bold size={14} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => applyFormat("italic")}
                          className={`w-8 h-8 hover:bg-notion-light-hover dark:hover:bg-notion-dark-hover ${colors.text} transition-all rounded-lg`}
                          title="Italic"
                        >
                          <Icon.Italic size={14} />
                        </Button>
                        <div
                          className={`w-px h-4 bg-notion-light-border dark:bg-notion-dark-border mx-1`}
                        ></div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => applyFormat("h1")}
                          className={`w-8 h-8 hover:bg-notion-light-hover dark:hover:bg-notion-dark-hover ${colors.text} transition-all font-black text-[10px] rounded-lg`}
                        >
                          H1
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => applyFormat("h2")}
                          className={`w-8 h-8 hover:bg-notion-light-hover dark:hover:bg-notion-dark-hover ${colors.text} transition-all font-black text-[10px] rounded-lg`}
                        >
                          H2
                        </Button>
                        <div
                          className={`w-px h-4 bg-notion-light-border dark:bg-notion-dark-border mx-1`}
                        ></div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => applyFormat("list")}
                          className={`w-8 h-8 hover:bg-notion-light-hover dark:hover:bg-notion-dark-hover ${colors.text} transition-all rounded-lg`}
                          title="List"
                        >
                          <Icon.List size={14} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => applyFormat("check")}
                          className={`w-8 h-8 hover:bg-notion-light-hover dark:hover:bg-notion-dark-hover ${colors.text} transition-all rounded-lg`}
                          title="Task List"
                        >
                          <Icon.Check size={14} />
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 flex-1">
                        {/* Editor */}
                        <div className="space-y-3 flex flex-col">
                          <div className="flex items-center justify-between px-1">
                            <div className="flex items-center gap-2 opacity-40">
                              <Icon.Edit size={12} />
                              <span className="text-[10px] font-black uppercase tracking-widest">
                                Editor
                              </span>
                            </div>
                          </div>
                          <textarea
                            ref={textareaRef}
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            placeholder="Write your SOP here using markdown..."
                            className={`w-full flex-1 min-h-[400px] xl:min-h-0 bg-notion-light-sidebar/20 dark:bg-notion-dark-sidebar/20 rounded-2xl p-6 outline-none resize-none font-mono text-sm leading-relaxed ${colors.text} placeholder:opacity-30 border border-notion-light-border/50 dark:border-notion-dark-border/50 focus:border-notion-light-border dark:focus:border-notion-dark-border transition-all shadow-inner`}
                          />
                        </div>

                        {/* Live Preview */}
                        <div className="space-y-3 flex flex-col">
                          <div className="flex items-center justify-between px-1">
                            <div className="flex items-center gap-2 opacity-40">
                              <Icon.View size={12} />
                              <span className="text-[10px] font-black uppercase tracking-widest">
                                Live View
                              </span>
                            </div>
                          </div>
                          <div
                            className={`w-full flex-1 min-h-[400px] xl:min-h-0 overflow-y-auto bg-notion-light-bg dark:bg-notion-dark-bg rounded-2xl p-8 border border-dashed border-notion-light-border/50 dark:border-notion-dark-border/50 markdown-preview shadow-sm`}
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

                      <div
                        className={`pt-6 border-t border-notion-light-border dark:border-notion-dark-border`}
                      >
                        <div className="flex items-center gap-2 mb-3 ml-1">
                          <Icon.Tag size={12} className="opacity-40" />
                          <span className="text-[10px] font-black uppercase tracking-widest opacity-40">
                            Classification Tags
                          </span>
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
                          className={`w-full px-4 py-2.5 border border-notion-light-border dark:border-notion-dark-border rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/30 bg-notion-light-bg dark:bg-notion-dark-bg text-notion-light-text dark:text-notion-dark-text transition-all`}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="max-w-none markdown-preview flex-1">
                      <div className="flex flex-wrap gap-2 mb-8">
                        {selectedNote?.tags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="custom"
                            size="xs"
                            className={`${colors.lightBg} ${colors.text} border ${colors.border} px-3 py-1 rounded-lg font-black uppercase tracking-widest text-[9px] shadow-sm`}
                          >
                            {tag}
                          </Badge>
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
              </Card>
            ) : (
              <div
                className={`h-[600px] flex flex-col items-center justify-center bg-notion-light-sidebar/30 dark:bg-notion-dark-sidebar/30 border border-dashed border-notion-light-border dark:border-notion-dark-border rounded-3xl p-12 text-center backdrop-blur-sm animate-in fade-in duration-700`}
              >
                <div
                  className={`w-20 h-20 ${colors.bg} rounded-3xl flex items-center justify-center mb-8 border ${colors.border} shadow-lg`}
                >
                  <Icon.Knowledge
                    className={`${colors.text} opacity-40`}
                    size={40}
                  />
                </div>
                <h2
                  className={`text-2xl font-black ${colors.text} mb-3 uppercase tracking-tight`}
                >
                  Intelligence Repository
                </h2>
                <p className="text-notion-light-muted dark:text-notion-dark-muted max-w-xs font-medium text-sm leading-relaxed">
                  Select an operational document from the network or initiate a
                  new strategic intelligence profile.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  },
);
