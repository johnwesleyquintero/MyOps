import React, { useState, useRef, useEffect } from "react";
import { ViewHeader } from "../ViewHeader";
import { Icon, iconProps } from "../Icons";
import { Button } from "../ui/Button";
import { toast } from "sonner";
import { useAiChat } from "../../hooks/useAiChat";
import { MODULE_COLORS } from "../../constants/ui";
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
} from "../../types";
import ReactMarkdown from "react-markdown";

interface WesAiViewProps {
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

export const WesAiView: React.FC<WesAiViewProps> = ({
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
  const colors = MODULE_COLORS.ai;
  const crmColors = MODULE_COLORS.crm;
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const {
    messages,
    inputValue,
    setInputValue,
    isThinking,
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
  const [isDragging, setIsDragging] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isThinking]);

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

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files) {
      Array.from(files).forEach((file) => {
        if (file.type.startsWith("image/")) {
          const reader = new FileReader();
          reader.onload = (event) => {
            if (event.target?.result) {
              setAttachments((prev) => [
                ...prev,
                event.target!.result as string,
              ]);
            }
          };
          reader.readAsDataURL(file);
        }
      });
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div
      className={`flex flex-col h-[calc(100vh-180px)] transition-all duration-300 ${isDragging ? "scale-[0.99] opacity-70" : ""}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {isDragging && (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center ${colors.bg.replace("10", "20")} backdrop-blur-sm border-4 border-dashed ${colors.border.split(" ")[0]} rounded-3xl pointer-events-none`}
        >
          <div className="bg-white dark:bg-notion-dark-sidebar p-8 rounded-2xl shadow-2xl flex flex-col items-center gap-4 animate-bounce">
            <Icon.Add {...iconProps(48, colors.text)} />
            <span
              className={`text-xl font-black uppercase tracking-widest ${colors.text}`}
            >
              Drop to Analyze
            </span>
          </div>
        </div>
      )}

      <ViewHeader
        title="WesAI Co-Pilot"
        subTitle="Advanced tactical intelligence and visual analysis"
      >
        <Button
          variant="custom"
          onClick={resetChat}
          className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest ${colors.bg} ${colors.text} hover:opacity-80 transition-all active:scale-95`}
          title="Reset Neural Link"
        >
          RESET
        </Button>
      </ViewHeader>

      <div className="flex-1 overflow-y-auto pr-2 mb-4 custom-scrollbar space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[90%] sm:max-w-[80%] rounded-2xl p-4 transition-all duration-200 group/msg ${
                msg.role === "user"
                  ? "bg-chatgpt-light-user dark:bg-chatgpt-dark-user text-notion-light-text dark:text-notion-dark-text border border-chatgpt-light-border dark:border-chatgpt-dark-border shadow-sm hover:shadow-md"
                  : `bg-chatgpt-light-assistant dark:bg-chatgpt-dark-assistant text-notion-light-text dark:text-notion-dark-text border border-chatgpt-light-border dark:border-chatgpt-dark-border shadow-sm`
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 opacity-60 text-[10px] font-bold uppercase tracking-widest">
                  {msg.role === "model" && (
                    <Icon.Ai {...iconProps(12, colors.text)} />
                  )}
                  {msg.role === "model" ? "WesAI" : "Operator"} •{" "}
                  {msg.timestamp.toLocaleTimeString()}
                </div>
                {msg.role === "model" && (
                  <Button
                    variant="custom"
                    onClick={() => handleCopy(msg.text, msg.id)}
                    className="opacity-0 group-hover/msg:opacity-100 p-1 hover:bg-notion-light-border dark:hover:bg-notion-dark-border rounded transition-all text-notion-light-text/40 hover:text-notion-light-text dark:text-notion-dark-text/40 dark:hover:text-notion-dark-text"
                    title="Copy as Markdown"
                  >
                    {copiedId === msg.id ? (
                      <Icon.Check {...iconProps(12, crmColors.text)} />
                    ) : (
                      <Icon.Copy {...iconProps(12)} />
                    )}
                  </Button>
                )}
              </div>

              <div className="text-sm leading-relaxed prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-chatgpt-light-user dark:prose-pre:bg-chatgpt-dark-user prose-pre:border prose-pre:border-chatgpt-light-border dark:prose-pre:border-chatgpt-dark-border prose-code:text-notion-light-text dark:prose-code:text-notion-dark-text prose-code:bg-chatgpt-light-border dark:prose-code:bg-chatgpt-dark-border prose-code:px-1 prose-code:rounded">
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
                        className={`font-bold ${colors.text.split(" ")[0]} dark:text-white`}
                      />
                    ),
                  }}
                >
                  {msg.text}
                </ReactMarkdown>
              </div>

              {msg.attachments && msg.attachments.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {msg.attachments.map((img, idx) => (
                    <div
                      key={idx}
                      className={`relative group overflow-hidden rounded-lg border ${colors.border} shadow-inner`}
                    >
                      <img
                        src={img}
                        alt="Attachment"
                        className="w-32 h-32 sm:w-48 sm:h-48 object-cover"
                      />
                      <div
                        className={`absolute inset-0 ${colors.bg} pointer-events-none mix-blend-overlay`}
                      ></div>
                      <div
                        className={`absolute inset-0 bg-[linear-gradient(transparent_0%,rgba(139,92,246,0.1)_50%,transparent_100%)] bg-[length:100%_4px] animate-[scan_2s_linear_infinite] pointer-events-none`}
                      ></div>
                      <div className="absolute top-2 right-2 flex gap-1">
                        <div
                          className={`w-1.5 h-1.5 ${colors.dot} rounded-full animate-pulse`}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {isThinking && (
          <div className="flex justify-start">
            <div className="bg-chatgpt-light-assistant dark:bg-chatgpt-dark-assistant border border-chatgpt-light-border dark:border-chatgpt-dark-border rounded-2xl p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5 h-4 items-center">
                  <div className="w-1.5 h-1.5 bg-notion-light-text/40 dark:bg-notion-dark-text/40 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-1.5 h-1.5 bg-notion-light-text/40 dark:bg-notion-dark-text/40 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-1.5 h-1.5 bg-notion-light-text/40 dark:bg-notion-dark-text/40 rounded-full animate-bounce"></div>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-notion-light-text/60 dark:text-notion-dark-text/60">
                  WesAI is thinking...
                </span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="bg-notion-light-sidebar dark:bg-notion-dark-sidebar border border-notion-light-border dark:border-notion-dark-border rounded-2xl p-4 shadow-lg">
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {attachments.map((img, idx) => (
              <div key={idx} className="relative group">
                <img
                  src={img}
                  alt="Preview"
                  className="w-20 h-20 object-cover rounded-lg border border-notion-light-border dark:border-notion-dark-border"
                />
                <Button
                  variant="custom"
                  onClick={() => removeAttachment(idx)}
                  className={`absolute -top-2 -right-2 ${MODULE_COLORS.error.bg.replace("/10", "").replace("/20", "")} text-white rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity`}
                >
                  <Icon.Close {...iconProps(12)} />
                </Button>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-end gap-3">
          <Button
            variant="custom"
            onClick={() => fileInputRef.current?.click()}
            className={`p-2.5 rounded-xl ${colors.hoverBg} ${colors.text} flex-shrink-0 transition-colors`}
            title="Upload Image"
          >
            <Icon.Add {...iconProps(20)} />
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            multiple
            className="hidden"
          />
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onPaste={handlePaste}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="Send a directive, or paste an image..."
            className="flex-1 bg-transparent border-none focus:ring-0 resize-none py-2 text-sm max-h-32 custom-scrollbar"
            rows={1}
          />
          <Button
            variant="custom"
            onClick={handleSendMessage}
            disabled={
              (!inputValue.trim() && attachments.length === 0) ||
              isThinking ||
              !config.geminiApiKey
            }
            className={`p-3 ${colors.text.replace("text-", "bg-").split(" ")[0]} text-white rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg active:scale-95 flex-shrink-0`}
          >
            <Icon.Send {...iconProps(20)} />
          </Button>
        </div>
        <div className="mt-2 text-[10px] opacity-40 text-center font-medium hidden sm:block">
          PRO TIP: You can paste images directly from your clipboard (Ctrl+V) or
          drop them here.
        </div>
      </div>
    </div>
  );
};
