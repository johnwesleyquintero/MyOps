import React, { useRef, useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import {
  AppConfig,
  TaskEntry,
  Contact,
  Note,
  VaultEntry,
  OperatorMetrics,
  DecisionEntry,
  MentalStateEntry,
  AssetEntry,
  ReflectionEntry,
  LifeConstraintEntry,
} from "../types";
import { useAiChat } from "../hooks/useAiChat";
import { Icon, iconProps } from "./Icons";
import { Button } from "./ui/Button";
import { toast } from "sonner";

interface AiChatSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  config: AppConfig;
  entries: TaskEntry[];
  contacts: Contact[];
  notes: Note[];
  vaultEntries: VaultEntry[];
  metrics: OperatorMetrics;
  decisions: DecisionEntry[];
  mentalStates: MentalStateEntry[];
  assets: AssetEntry[];
  reflections: ReflectionEntry[];
  lifeConstraints: LifeConstraintEntry[];
  onSaveTransaction: (entry: TaskEntry, isUpdate: boolean) => Promise<boolean>;
  onDeleteTransaction: (entry: TaskEntry) => Promise<boolean>;
  onSaveContact: (contact: Contact, isUpdate: boolean) => Promise<boolean>;
  onSaveNote: (note: Note, isUpdate: boolean) => Promise<boolean>;
  onSaveAsset: (asset: AssetEntry, isUpdate: boolean) => Promise<boolean>;
  onSaveReflection: (
    reflection: ReflectionEntry,
    isUpdate: boolean,
  ) => Promise<boolean>;
}

export const AiChatSidebar: React.FC<AiChatSidebarProps> = ({
  isOpen,
  onClose,
  config,
  entries,
  contacts,
  notes,
  vaultEntries,
  metrics,
  decisions,
  mentalStates,
  assets,
  reflections,
  lifeConstraints,
  onSaveTransaction,
  onDeleteTransaction,
  onSaveContact,
  onSaveNote,
  onSaveAsset,
  onSaveReflection,
}) => {
  const {
    messages,
    inputValue,
    setInputValue,
    isThinking,
    activeTool,
    sendMessage,
    resetChat,
  } = useAiChat({
    config,
    entries,
    contacts,
    notes,
    vaultEntries,
    metrics,
    decisions,
    mentalStates,
    assets,
    reflections,
    lifeConstraints,
    onSaveTransaction,
    onDeleteTransaction,
    onSaveContact,
    onSaveNote,
    onSaveAsset,
    onSaveReflection,
  });

  const [attachments, setAttachments] = useState<string[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen, isThinking]);

  const handleSendMessage = () => {
    if (!inputValue.trim() && attachments.length === 0) return;
    sendMessage(undefined, attachments.length > 0 ? attachments : undefined);
    setAttachments([]);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Message copied", {
      description: "Text content has been copied to your clipboard.",
      icon: <Icon.Copy size={14} />,
    });
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        const blob = items[i].getAsFile();
        if (blob) {
          const reader = new FileReader();
          reader.onload = (event) => {
            if (event.target?.result) {
              setAttachments((prev) => [
                ...prev,
                event.target!.result as string,
              ]);
            }
          };
          reader.readAsDataURL(blob);
        }
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            setAttachments((prev) => [...prev, event.target!.result as string]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-sm z-[60] animate-in fade-in duration-300"
          onClick={onClose}
        />
      )}

      {/* Sidebar Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-[450px] bg-notion-light-bg dark:bg-notion-dark-bg border-l border-notion-light-border dark:border-notion-dark-border shadow-2xl z-[70] transform transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1) flex flex-col ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Header */}
        <div className="h-14 flex items-center justify-between px-6 border-b border-notion-light-border dark:border-notion-dark-border bg-notion-light-sidebar/50 dark:bg-notion-dark-sidebar/50 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div
                className={`w-2.5 h-2.5 rounded-full ${config.geminiApiKey ? "bg-violet-500 shadow-[0_0_10px_rgba(139,92,246,0.5)]" : "bg-purple-600"} animate-pulse`}
              ></div>
              <div className="absolute inset-0 rounded-full bg-violet-500 animate-ping opacity-20"></div>
            </div>
            <h2 className="font-semibold text-notion-light-text dark:text-notion-dark-text tracking-tight flex items-center gap-2">
              WesAI
              <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-notion-light-border dark:bg-notion-dark-border text-notion-light-text/60 dark:text-notion-dark-text/60 font-medium uppercase tracking-wider">
                Neural Link
              </span>
            </h2>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={resetChat}
              className="text-notion-light-text/40 hover:text-notion-light-text dark:text-notion-dark-text/40 dark:hover:text-notion-dark-text group"
              title="Reset Chat"
            >
              <Icon.Reset
                {...iconProps(
                  18,
                  "group-hover:rotate-180 transition-transform duration-500",
                )}
              />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-notion-light-text/40 hover:text-notion-light-text dark:text-notion-dark-text/40 dark:hover:text-notion-dark-text"
            >
              <Icon.Close {...iconProps(18)} />
            </Button>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6 bg-notion-light-bg dark:bg-notion-dark-bg">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2 duration-300 group/msg`}
            >
              <div
                className={`max-w-[90%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm transition-all duration-200 ${
                  msg.role === "user"
                    ? "bg-chatgpt-light-user dark:bg-chatgpt-dark-user text-notion-light-text dark:text-notion-dark-text rounded-br-none border border-chatgpt-light-border dark:border-chatgpt-dark-border hover:shadow-md"
                    : "bg-chatgpt-light-assistant dark:bg-chatgpt-dark-assistant text-notion-light-text dark:text-notion-dark-text rounded-bl-none border border-chatgpt-light-border dark:border-chatgpt-dark-border hover:border-notion-light-text/10 dark:hover:border-notion-dark-text/10"
                }`}
              >
                {msg.role === "model" && (
                  <div className="mb-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-notion-light-text dark:text-notion-dark-text">
                      <div className="p-1 rounded-md bg-chatgpt-light-border dark:bg-chatgpt-dark-border">
                        <Icon.Bot {...iconProps(14, "stroke-[2.5px]")} />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em]">
                        WesAI
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleCopy(msg.text, msg.id)}
                      className="opacity-0 group-hover/msg:opacity-100 p-1 hover:bg-notion-light-border dark:hover:bg-notion-dark-border text-notion-light-text/40 hover:text-notion-light-text dark:text-notion-dark-text/40 dark:hover:text-notion-dark-text"
                      title="Copy as Markdown"
                    >
                      {copiedId === msg.id ? (
                        <Icon.Check {...iconProps(12, "text-green-500")} />
                      ) : (
                        <Icon.Copy {...iconProps(12)} />
                      )}
                    </Button>
                  </div>
                )}
                {msg.role === "model" ? (
                  <div className="prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-chatgpt-light-user dark:prose-pre:bg-chatgpt-dark-user prose-pre:border prose-pre:border-chatgpt-light-border dark:prose-pre:border-chatgpt-dark-border prose-code:text-notion-light-text dark:prose-code:text-notion-dark-text prose-code:bg-chatgpt-light-border dark:prose-code:bg-chatgpt-dark-border prose-code:px-1 prose-code:rounded">
                    <ReactMarkdown
                      components={{
                        p: ({ ...props }) => (
                          <p {...props} className="mb-3 last:mb-0" />
                        ),
                        ul: ({ ...props }) => (
                          <ul
                            {...props}
                            className="list-disc list-inside mb-3 space-y-1"
                          />
                        ),
                        ol: ({ ...props }) => (
                          <ol
                            {...props}
                            className="list-decimal list-inside mb-3 space-y-1"
                          />
                        ),
                        code: ({ ...props }) => (
                          <code
                            {...props}
                            className="px-1.5 py-0.5 rounded font-mono text-[11px] bg-chatgpt-light-border dark:bg-chatgpt-dark-border text-notion-light-text dark:text-notion-dark-text"
                          />
                        ),
                        strong: ({ ...props }) => (
                          <strong
                            {...props}
                            className="font-bold text-notion-light-text dark:text-white"
                          />
                        ),
                      }}
                    >
                      {msg.text}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <div className="whitespace-pre-wrap">{msg.text}</div>
                )}

                {msg.attachments && msg.attachments.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {msg.attachments.map((img, idx) => (
                      <div
                        key={idx}
                        className="relative group overflow-hidden rounded-lg border border-white/10 shadow-inner"
                      >
                        <img
                          src={img}
                          alt="Attachment"
                          className="w-32 h-32 object-cover"
                        />
                        <div className="absolute inset-0 bg-violet-500/10 pointer-events-none mix-blend-overlay"></div>
                        <div className="absolute inset-0 bg-[linear-gradient(transparent_0%,rgba(139,92,246,0.1)_50%,transparent_100%)] bg-[length:100%_4px] animate-[scan_2s_linear_infinite] pointer-events-none"></div>
                      </div>
                    ))}
                  </div>
                )}
                <div
                  className={`text-[10px] mt-2 font-medium opacity-50 ${msg.role === "user" ? "text-right" : "text-notion-light-text/60 dark:text-notion-dark-text/60"}`}
                >
                  {msg.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            </div>
          ))}

          {/* Thinking / Tool Execution Indicator */}
          {isThinking && (
            <div className="flex justify-start animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="bg-chatgpt-light-assistant dark:bg-chatgpt-dark-assistant rounded-2xl rounded-bl-none px-5 py-4 border border-chatgpt-light-border dark:border-chatgpt-dark-border flex items-center gap-3 shadow-sm">
                {activeTool ? (
                  <div className="flex items-center gap-3 text-[11px] text-notion-light-text dark:text-notion-dark-text font-mono font-bold uppercase tracking-widest">
                    <div className="relative">
                      <Icon.Settings {...iconProps(16, "animate-spin")} />
                      <div className="absolute inset-0 bg-notion-light-text/10 dark:bg-notion-dark-text/10 animate-ping rounded-full"></div>
                    </div>
                    <span>Executing {activeTool}...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 h-4">
                    <span
                      className="w-1.5 h-1.5 bg-notion-light-text/40 dark:bg-notion-dark-text/40 rounded-full animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    ></span>
                    <span
                      className="w-1.5 h-1.5 bg-notion-light-text/40 dark:bg-notion-dark-text/40 rounded-full animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    ></span>
                    <span
                      className="w-1.5 h-1.5 bg-notion-light-text/40 dark:bg-notion-dark-text/40 rounded-full animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    ></span>
                  </div>
                )}
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-6 bg-notion-light-bg dark:bg-notion-dark-bg border-t border-notion-light-border dark:border-notion-dark-border">
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {attachments.map((img, idx) => (
                <div key={idx} className="relative group">
                  <img
                    src={img}
                    alt="Preview"
                    className="w-12 h-12 object-cover rounded-lg border border-notion-light-border dark:border-notion-dark-border"
                  />
                  <Button
                    variant="custom"
                    size="icon"
                    onClick={() => removeAttachment(idx)}
                    className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-0.5 shadow-md opacity-0 group-hover:opacity-100 transition-opacity h-4 w-4"
                  >
                    <Icon.Close {...iconProps(10)} />
                  </Button>
                </div>
              ))}
            </div>
          )}

          <div className="relative group flex items-end gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              className="p-2.5 rounded-xl text-notion-light-muted dark:text-notion-dark-muted h-[48px] w-[48px]"
              title="Upload Image"
            >
              <Icon.Add {...iconProps(18)} />
            </Button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              multiple
              className="hidden"
            />
            <div className="relative flex-1">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                onPaste={handlePaste}
                placeholder={
                  config.geminiApiKey ? "Directives..." : "Configure API Key..."
                }
                disabled={!config.geminiApiKey}
                rows={1}
                className="w-full bg-notion-light-sidebar dark:bg-notion-dark-sidebar border border-notion-light-border dark:border-notion-dark-border rounded-xl pl-4 pr-12 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500/50 transition-all duration-300 resize-none custom-scrollbar text-notion-light-text dark:text-notion-dark-text placeholder-notion-light-text/30 dark:placeholder-notion-dark-text/30 disabled:opacity-50 disabled:cursor-not-allowed shadow-inner"
                style={{ minHeight: "48px", maxHeight: "160px" }}
              />
              <Button
                variant="custom"
                size="icon"
                onClick={handleSendMessage}
                disabled={
                  (!inputValue.trim() && attachments.length === 0) ||
                  isThinking ||
                  !config.geminiApiKey
                }
                className="absolute right-2 bottom-2 p-2 bg-notion-light-text dark:bg-notion-dark-text text-white dark:text-notion-dark-bg rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg active:scale-95 h-8 w-8"
              >
                <Icon.Send {...iconProps(16)} />
              </Button>
            </div>
          </div>
          <div className="text-[10px] text-notion-light-text/30 dark:text-notion-dark-text/30 text-center mt-3 flex justify-center items-center gap-3 font-medium uppercase tracking-widest">
            <span className="hover:text-violet-500 transition-colors cursor-default">
              WesAI v2.3
            </span>
            <span className="w-1 h-1 rounded-full bg-notion-light-border dark:bg-notion-dark-border"></span>
            <span className="hover:text-violet-500 transition-colors cursor-default">
              Neural Link Active
            </span>
          </div>
        </div>
      </div>
    </>
  );
};
