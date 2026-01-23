import React, { useState, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { TaskEntry, PriorityLevel, StatusLevel } from "../types";
import { PRIORITIES, STATUSES } from "@/constants";
import { CopyIdButton } from "./CopyIdButton";
import { useTaskForm } from "../hooks/useTaskForm";
import { useMarkdownEditor } from "../hooks/useMarkdownEditor";
import { Icon } from "./Icons";
import { Button, Card, Badge } from "./ui";
import { toast } from "sonner";
import { useUi } from "../hooks/useUi";
import { useData } from "../hooks/useData";

export const TaskModal: React.FC = React.memo(() => {
  const ui = useUi();
  const { tasks, strategy } = useData();
  const {
    entries,
    saveTransaction: saveEntry,
    removeTransaction: deleteEntry,
    isSubmitting,
  } = tasks;
  const { decisions: decisionEntries } = strategy;
  const {
    isTaskModalOpen: isOpen,
    setIsTaskModalOpen,
    editingEntry: initialData,
  } = ui;

  const onClose = () => setIsTaskModalOpen(false);

  const onSubmit = async (entry: TaskEntry) => {
    await saveEntry(entry, !!initialData);
  };

  const onDelete = async (entry: TaskEntry) => {
    await deleteEntry(entry);
  };

  const {
    formData,
    setFormData,
    isCustomProject,
    setIsCustomProject,
    availableProjects,
    showDeps,
    setShowDeps,
    potentialDeps,
    toggleDependency,
  } = useTaskForm(initialData, entries, decisionEntries);

  const [depSearch, setDepSearch] = useState("");
  const filteredPotentialDeps = useMemo(() => {
    return potentialDeps.filter(
      (dep) =>
        dep.description.toLowerCase().includes(depSearch.toLowerCase()) ||
        dep.project.toLowerCase().includes(depSearch.toLowerCase()),
    );
  }, [potentialDeps, depSearch]);

  const [copiedMd, setCopiedMd] = useState(false);

  const handleCopyMarkdown = async () => {
    const md = `### ${formData.description}\n\n- **Project:** ${formData.project}\n- **Priority:** ${formData.priority}\n- **Status:** ${formData.status}\n- **Due Date:** ${formData.date || "N/A"}`;
    try {
      await navigator.clipboard.writeText(md);
      setCopiedMd(true);
      toast.success("Markdown copied to clipboard");
      setTimeout(() => setCopiedMd(false), 2000);
    } catch {
      toast.error("Failed to copy markdown");
    }
  };

  const { textareaRef } = useMarkdownEditor(formData.description, (newText) =>
    setFormData({ ...formData, description: newText }),
  );

  const handleSubmit = async (e?: React.FormEvent | React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!formData.description || !formData.project) return;
    await onSubmit(formData);
    onClose();
  };

  const handleDelete = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (
      initialData &&
      window.confirm("Are you sure you want to delete this task?")
    ) {
      await onDelete(initialData);
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      handleSubmit();
    }
    if (e.key === "Escape") {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300"
      onKeyDown={handleKeyDown}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <Card
        padding="none"
        className="w-full max-w-4xl shadow-2xl flex flex-col h-full md:h-auto md:max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-300 rounded-2xl border-none"
      >
        {/* Modal Header */}
        <div className="px-4 md:px-6 py-3 md:py-4 border-b border-notion-light-border dark:border-notion-dark-border flex items-center justify-between bg-notion-light-sidebar/50 dark:bg-notion-dark-sidebar/50 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-3 md:gap-4 min-w-0">
            <div className="p-2 bg-notion-light-bg dark:bg-notion-dark-bg rounded-lg shadow-sm border border-notion-light-border dark:border-notion-dark-border shrink-0">
              <Icon.Add
                size={16}
                className="text-notion-light-text dark:text-notion-dark-text"
              />
            </div>
            <div className="min-w-0">
              <h2 className="text-[12px] md:text-sm font-bold text-notion-light-text dark:text-notion-dark-text uppercase tracking-widest truncate">
                {initialData ? "Mission intelligence" : "New Tactical Mission"}
              </h2>
              {initialData && (
                <div className="flex items-center gap-2 mt-0.5 md:mt-1">
                  <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest opacity-40">
                    UID:
                  </span>
                  <CopyIdButton
                    id={initialData.id}
                    className="text-[9px] md:text-[10px] font-mono opacity-40 hover:opacity-100 transition-opacity"
                  />
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-3 shrink-0">
            {initialData && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCopyMarkdown}
                className="w-8 h-8 md:w-9 md:h-9 text-notion-light-muted hover:bg-notion-light-hover dark:hover:bg-notion-dark-hover transition-all rounded-lg"
                title="Copy Task as Markdown"
              >
                {copiedMd ? (
                  <Icon.Check size={16} className="text-green-500" />
                ) : (
                  <Icon.Copy size={16} />
                )}
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="w-8 h-8 md:w-9 md:h-9 text-notion-light-muted hover:bg-notion-light-hover dark:hover:bg-notion-dark-hover transition-all rounded-lg"
            >
              <Icon.Close size={18} />
            </Button>
          </div>
        </div>

        {/* Modal Body */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 flex flex-col min-h-0 overflow-hidden"
        >
          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
            {/* Main Content Area: Editor & Preview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 min-h-[350px]">
              {/* Left: Editor */}
              <div className="flex flex-col space-y-3 md:space-y-4">
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2 opacity-40">
                    <Icon.Edit size={12} />
                    <span className="text-[10px] font-black uppercase tracking-widest">
                      Mission Description
                    </span>
                  </div>
                  <Badge
                    variant="outline"
                    size="xs"
                    className="font-mono scale-90 opacity-40 border-none"
                  >
                    MARKDOWN
                  </Badge>
                </div>
                <div className="flex-1 relative group bg-notion-light-sidebar/20 dark:bg-notion-dark-sidebar/20 rounded-2xl p-4 md:p-6 border border-notion-light-border/50 dark:border-notion-dark-border/50 focus-within:border-notion-light-border dark:focus-within:border-notion-dark-border transition-all flex flex-col min-h-[200px] md:min-h-[250px] shadow-inner">
                  <textarea
                    ref={textareaRef}
                    className="w-full flex-1 bg-transparent text-sm text-notion-light-text dark:text-notion-dark-text placeholder:text-notion-light-text/50 dark:placeholder:text-white/40 border-none focus:ring-0 p-0 resize-none font-mono leading-relaxed"
                    placeholder="Describe the mission objective... Support Markdown."
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    autoFocus
                  />
                </div>
              </div>

              {/* Right: Preview */}
              <div className="flex flex-col space-y-3 md:space-y-4">
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2 opacity-40">
                    <Icon.View size={12} />
                    <span className="text-[10px] font-black uppercase tracking-widest">
                      Tactical Preview
                    </span>
                  </div>
                  <Badge
                    variant="outline"
                    size="xs"
                    className="font-mono scale-90 opacity-40 border-none"
                  >
                    LIVE
                  </Badge>
                </div>
                <div className="flex-1 markdown-preview bg-notion-light-bg dark:bg-notion-dark-bg rounded-2xl p-4 md:p-6 border border-dashed border-notion-light-border/30 dark:border-notion-dark-border/30 min-h-[200px] md:min-h-[250px] shadow-sm">
                  {formData.description ? (
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {formData.description}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center">
                      <span className="text-notion-light-text/50 dark:text-white/40 italic text-xs font-medium">
                        Waiting for mission details...
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Fixed Metadata Area */}
          <div className="shrink-0 p-4 md:p-8 border-t border-notion-light-border/50 dark:border-notion-dark-border/50 bg-notion-light-sidebar/20 dark:bg-notion-dark-sidebar/20 backdrop-blur-sm">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
              {/* Project Selection */}
              <div className="space-y-2 md:space-y-3 col-span-2 md:col-span-1">
                <div className="flex items-center gap-2 mb-1 md:mb-1.5 ml-1">
                  <Icon.Folder size={12} className="opacity-40" />
                  <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest opacity-40">
                    Project / Sector
                  </span>
                </div>
                <div className="relative">
                  <select
                    className="w-full border border-notion-light-border dark:border-notion-dark-border rounded-xl pl-3 md:pl-4 pr-10 py-2 md:py-2.5 appearance-none text-[11px] md:text-xs font-bold focus:outline-none focus:ring-1 focus:ring-blue-500/30 bg-notion-light-bg dark:bg-notion-dark-bg text-notion-light-text dark:text-notion-dark-text transition-all cursor-pointer shadow-sm"
                    value={isCustomProject ? "custom" : formData.project}
                    onChange={(e) => {
                      if (e.target.value === "custom") {
                        setIsCustomProject(true);
                        setFormData({ ...formData, project: "" });
                      } else {
                        setIsCustomProject(false);
                        setFormData({ ...formData, project: e.target.value });
                      }
                    }}
                  >
                    {availableProjects.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                    <option value="custom">+ New Project</option>
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-notion-light-muted opacity-40">
                    <Icon.ChevronDown size={14} />
                  </div>
                  {isCustomProject && (
                    <input
                      type="text"
                      className="mt-2 md:mt-3 w-full border border-notion-light-border dark:border-notion-dark-border rounded-xl px-3 md:px-4 py-2 md:py-2.5 text-[11px] md:text-xs font-bold focus:outline-none focus:ring-1 focus:ring-blue-500/30 bg-notion-light-bg dark:bg-notion-dark-bg text-notion-light-text dark:text-notion-dark-text transition-all shadow-sm"
                      placeholder="Project name..."
                      value={formData.project}
                      onChange={(e) =>
                        setFormData({ ...formData, project: e.target.value })
                      }
                      autoFocus
                    />
                  )}
                </div>
              </div>

              {/* Status Selection */}
              <div className="space-y-2 md:space-y-3">
                <div className="flex items-center gap-2 mb-1 md:mb-1.5 ml-1">
                  <Icon.Activity size={12} className="opacity-40" />
                  <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest opacity-40">
                    Status
                  </span>
                </div>
                <div className="relative">
                  <select
                    className="w-full border border-notion-light-border dark:border-notion-dark-border rounded-xl pl-3 md:pl-4 pr-10 py-2 md:py-2.5 appearance-none text-[11px] md:text-xs font-bold focus:outline-none focus:ring-1 focus:ring-blue-500/30 bg-notion-light-bg dark:bg-notion-dark-bg text-notion-light-text dark:text-notion-dark-text transition-all cursor-pointer shadow-sm"
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: e.target.value as StatusLevel,
                      })
                    }
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-notion-light-muted opacity-40">
                    <Icon.ChevronDown size={14} />
                  </div>
                </div>
              </div>

              {/* Priority Selection */}
              <div className="space-y-2 md:space-y-3">
                <div className="flex items-center gap-2 mb-1 md:mb-1.5 ml-1">
                  <Icon.Alert size={12} className="opacity-40" />
                  <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest opacity-40">
                    Threat
                  </span>
                </div>
                <div className="relative">
                  <select
                    className="w-full border border-notion-light-border dark:border-notion-dark-border rounded-xl pl-3 md:pl-4 pr-10 py-2 md:py-2.5 appearance-none text-[11px] md:text-xs font-bold focus:outline-none focus:ring-1 focus:ring-blue-500/30 bg-notion-light-bg dark:bg-notion-dark-bg text-notion-light-text dark:text-notion-dark-text transition-all cursor-pointer shadow-sm"
                    value={formData.priority}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        priority: e.target.value as PriorityLevel,
                      })
                    }
                  >
                    {PRIORITIES.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-notion-light-muted opacity-40">
                    <Icon.ChevronDown size={14} />
                  </div>
                </div>
              </div>

              {/* Date Input */}
              <div className="space-y-2 md:space-y-3 col-span-2 md:col-span-1">
                <div className="flex items-center gap-2 mb-1 md:mb-1.5 ml-1">
                  <Icon.Date size={12} className="opacity-40" />
                  <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest opacity-40">
                    Deadline
                  </span>
                </div>
                <input
                  type="date"
                  className="w-full border border-notion-light-border dark:border-notion-dark-border rounded-xl px-3 md:px-4 py-2 md:py-2 appearance-none text-[11px] md:text-xs font-bold focus:outline-none focus:ring-1 focus:ring-blue-500/30 bg-notion-light-bg dark:bg-notion-dark-bg text-notion-light-text dark:text-notion-dark-text transition-all cursor-pointer shadow-sm min-h-[38px] md:min-h-0"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Dependencies Section */}
            <div className="mt-8 pt-8 border-t border-notion-light-border/30 dark:border-notion-dark-border/30">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2.5 ml-1">
                  <div className="p-1.5 bg-indigo-500/10 rounded-lg">
                    <Icon.Link
                      size={14}
                      className="text-indigo-600 dark:text-indigo-400"
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-widest text-notion-light-text dark:text-notion-dark-text">
                      Mission Dependencies
                    </span>
                    <span className="text-[8px] font-medium opacity-40 uppercase tracking-tighter">
                      Link prerequisite tactical operations
                    </span>
                  </div>
                  {formData.dependencies &&
                    formData.dependencies.length > 0 && (
                      <Badge
                        variant="custom"
                        className="bg-indigo-500 text-white border-none text-[8px] px-1.5 py-0.5 rounded-full ml-1"
                      >
                        {formData.dependencies.length}
                      </Badge>
                    )}
                </div>
                <Button
                  variant="ghost"
                  size="xs"
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowDeps(!showDeps);
                  }}
                  className="text-[9px] font-black uppercase tracking-widest opacity-60 hover:opacity-100 bg-notion-light-sidebar/40 dark:bg-notion-dark-sidebar/40 px-3 py-1.5 rounded-lg border border-notion-light-border/50 dark:border-notion-dark-border/50 transition-all"
                >
                  {showDeps ? "Minimize Intel" : "Configure Dependencies"}
                </Button>
              </div>

              {showDeps && (
                <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
                  {/* Dep Search & Filter */}
                  <div className="relative group">
                    <Icon.Search
                      size={12}
                      className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30 group-focus-within:opacity-100 transition-opacity"
                    />
                    <input
                      type="text"
                      placeholder="Search active missions..."
                      value={depSearch}
                      onChange={(e) => setDepSearch(e.target.value)}
                      className="w-full bg-notion-light-sidebar/30 dark:bg-notion-dark-sidebar/30 border border-notion-light-border/50 dark:border-notion-dark-border/50 rounded-xl pl-9 pr-4 py-2 text-[10px] font-bold focus:outline-none focus:ring-1 focus:ring-indigo-500/30 transition-all placeholder:opacity-30"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                    {filteredPotentialDeps.length > 0 ? (
                      filteredPotentialDeps.map((dep) => {
                        const isSelected = formData.dependencies?.includes(
                          dep.id,
                        );
                        return (
                          <button
                            key={dep.id}
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              toggleDependency(dep.id);
                            }}
                            className={`flex items-start gap-3 p-3 rounded-xl border transition-all text-left group relative overflow-hidden ${
                              isSelected
                                ? "bg-indigo-500/5 border-indigo-500/40 ring-1 ring-indigo-500/20"
                                : "bg-notion-light-bg dark:bg-notion-dark-bg border-notion-light-border/40 dark:border-notion-dark-border/40 hover:border-indigo-500/30 hover:bg-indigo-500/[0.02]"
                            }`}
                          >
                            <div
                              className={`mt-0.5 w-4 h-4 rounded-md border flex items-center justify-center transition-all ${
                                isSelected
                                  ? "bg-indigo-500 border-indigo-500 text-white shadow-sm shadow-indigo-500/40"
                                  : "border-notion-light-border dark:border-notion-dark-border group-hover:border-indigo-500/50"
                              }`}
                            >
                              {isSelected && (
                                <Icon.Check size={10} strokeWidth={4} />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2 mb-1">
                                <span className="text-[8px] font-black uppercase tracking-widest opacity-40 truncate">
                                  {dep.project}
                                </span>
                                <Badge
                                  variant="custom"
                                  className={`text-[7px] px-1 rounded-sm font-black ${
                                    dep.status === "Done"
                                      ? "bg-green-500/10 text-green-500"
                                      : dep.status === "In Progress"
                                        ? "bg-blue-500/10 text-blue-500"
                                        : "bg-notion-light-muted/10 text-notion-light-muted opacity-60"
                                  }`}
                                >
                                  {dep.status}
                                </Badge>
                              </div>
                              <p
                                className={`text-[11px] font-bold leading-tight ${
                                  isSelected
                                    ? "text-notion-light-text dark:text-notion-dark-text"
                                    : "text-notion-light-text/70 dark:text-notion-dark-text/70"
                                }`}
                              >
                                {dep.description}
                              </p>
                              <div className="flex items-center gap-2 mt-2">
                                <span
                                  className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded-md ${
                                    dep.priority === "High"
                                      ? "bg-red-500/10 text-red-500"
                                      : dep.priority === "Medium"
                                        ? "bg-amber-500/10 text-amber-500"
                                        : "bg-blue-500/10 text-blue-500"
                                  }`}
                                >
                                  {dep.priority}
                                </span>
                              </div>
                            </div>
                            {isSelected && (
                              <div className="absolute top-0 right-0 w-1 h-full bg-indigo-500" />
                            )}
                          </button>
                        );
                      })
                    ) : (
                      <div className="col-span-full py-10 flex flex-col items-center justify-center bg-notion-light-sidebar/10 dark:bg-notion-dark-sidebar/10 rounded-2xl border border-dashed border-notion-light-border/30 dark:border-notion-dark-border/30">
                        <Icon.Search size={24} className="opacity-10 mb-3" />
                        <p className="text-[10px] font-black opacity-30 uppercase tracking-[0.2em]">
                          {depSearch
                            ? "No matches found"
                            : "No available missions"}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Modal Footer */}
          <div className="px-4 md:px-8 py-4 border-t border-notion-light-border dark:border-notion-dark-border flex items-center justify-between bg-notion-light-sidebar/50 dark:bg-notion-dark-sidebar/50 backdrop-blur-md">
            <div className="flex items-center gap-3">
              {initialData && (
                <Button
                  variant="ghost"
                  onClick={(e) => handleDelete(e)}
                  className="text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-500/10 px-3 md:px-4 py-2"
                >
                  Terminate
                </Button>
              )}
            </div>
            <div className="flex items-center gap-2 md:gap-4">
              <Button
                variant="ghost"
                onClick={onClose}
                className="text-[10px] font-black uppercase tracking-widest text-notion-light-muted dark:text-notion-dark-muted px-4 md:px-6 py-2"
              >
                Stand Down
              </Button>
              <Button
                variant="custom"
                onClick={() => handleSubmit()}
                isLoading={isSubmitting}
                disabled={!formData.description}
                className={`px-6 md:px-8 py-2 bg-indigo-600 text-white border border-indigo-500 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50`}
              >
                {initialData ? "Sync" : "Deploy"}
              </Button>
            </div>
          </div>
        </form>
      </Card>
    </div>
  );
});
