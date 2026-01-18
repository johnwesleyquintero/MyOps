import React, { useRef, useEffect } from "react";
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
} from "../types";
import { useAiChat } from "../hooks/useAiChat";
import { Icon, iconProps } from "./Icons";

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
  onSaveTransaction: (entry: TaskEntry, isUpdate: boolean) => Promise<boolean>;
  onDeleteTransaction: (entry: TaskEntry) => Promise<boolean>;
  onSaveContact: (contact: Contact, isUpdate: boolean) => Promise<boolean>;
  onSaveNote: (note: Note, isUpdate: boolean) => Promise<boolean>;
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
  onSaveTransaction,
  onDeleteTransaction,
  onSaveContact,
  onSaveNote,
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
    onSaveTransaction,
    onDeleteTransaction,
    onSaveContact,
    onSaveNote,
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen, isThinking]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
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
                className={`w-2.5 h-2.5 rounded-full ${config.geminiApiKey ? "bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" : "bg-red-500"} animate-pulse`}
              ></div>
              <div className="absolute inset-0 rounded-full bg-blue-500 animate-ping opacity-20"></div>
            </div>
            <h2 className="font-semibold text-notion-light-text dark:text-notion-dark-text tracking-tight flex items-center gap-2">
              WesAI
              <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-notion-light-border dark:bg-notion-dark-border text-notion-light-text/60 dark:text-notion-dark-text/60 font-medium uppercase tracking-wider">
                Neural Link
              </span>
            </h2>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={resetChat}
              className="p-2 text-notion-light-text/40 hover:text-notion-light-text dark:text-notion-dark-text/40 dark:hover:text-notion-dark-text rounded-lg hover:bg-notion-light-hover dark:hover:bg-notion-dark-hover transition-all duration-200 group"
              title="Reset Chat"
            >
              <Icon.Reset
                {...iconProps(
                  18,
                  "group-hover:rotate-180 transition-transform duration-500",
                )}
              />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-notion-light-text/40 hover:text-notion-light-text dark:text-notion-dark-text/40 dark:hover:text-notion-dark-text rounded-lg hover:bg-notion-light-border dark:hover:bg-notion-dark-border transition-all duration-200"
            >
              <Icon.Close {...iconProps(18)} />
            </button>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6 bg-notion-light-bg dark:bg-notion-dark-bg">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2 duration-300`}
            >
              <div
                className={`max-w-[90%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm transition-all duration-200 ${
                  msg.role === "user"
                    ? "bg-notion-light-text dark:bg-notion-dark-text text-white dark:text-notion-dark-bg rounded-br-none hover:shadow-md"
                    : "bg-notion-light-sidebar dark:bg-notion-dark-sidebar text-notion-light-text dark:text-notion-dark-text rounded-bl-none border border-notion-light-border dark:border-notion-dark-border hover:border-notion-light-text/10 dark:hover:border-notion-dark-text/10"
                }`}
              >
                {msg.role === "model" && (
                  <div className="mb-2.5 flex items-center gap-2 text-notion-light-text dark:text-notion-dark-text">
                    <div className="p-1 rounded-md bg-notion-light-border dark:bg-notion-dark-border">
                      <Icon.Bot {...iconProps(14, "stroke-[2.5px]")} />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em]">
                      WesAI
                    </span>
                  </div>
                )}
                {msg.role === "model" ? (
                  <div className="prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-notion-light-bg dark:prose-pre:bg-notion-dark-bg prose-pre:border prose-pre:border-notion-light-border dark:prose-pre:border-notion-dark-border prose-code:text-notion-light-text dark:prose-code:text-notion-dark-text prose-code:bg-notion-light-border dark:prose-code:bg-notion-dark-border prose-code:px-1 prose-code:rounded">
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
                            className="px-1.5 py-0.5 rounded font-mono text-[11px] bg-notion-light-border dark:bg-notion-dark-border text-notion-light-text dark:text-notion-dark-text"
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
              <div className="bg-notion-light-sidebar/50 dark:bg-notion-dark-sidebar/50 rounded-2xl rounded-bl-none px-5 py-4 border border-notion-light-border dark:border-notion-dark-border flex items-center gap-3 shadow-sm">
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
          <div className="relative group">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                config.geminiApiKey
                  ? "Orders, brother?"
                  : "Configure API Key to chat..."
              }
              disabled={!config.geminiApiKey}
              rows={1}
              className="w-full bg-notion-light-sidebar dark:bg-notion-dark-sidebar border border-notion-light-border dark:border-notion-dark-border rounded-xl pl-5 pr-14 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all duration-300 resize-none custom-scrollbar text-notion-light-text dark:text-notion-dark-text placeholder-notion-light-text/30 dark:placeholder-notion-dark-text/30 disabled:opacity-50 disabled:cursor-not-allowed shadow-inner"
              style={{ minHeight: "56px", maxHeight: "160px" }}
            />
            <button
              onClick={sendMessage}
              disabled={
                !inputValue.trim() || isThinking || !config.geminiApiKey
              }
              className="absolute right-2.5 bottom-2.5 p-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-blue-500/20 active:scale-95"
            >
              <Icon.Send {...iconProps(18)} />
            </button>
          </div>
          <div className="text-[10px] text-notion-light-text/30 dark:text-notion-dark-text/30 text-center mt-3 flex justify-center items-center gap-3 font-medium uppercase tracking-widest">
            <span className="hover:text-blue-500 transition-colors cursor-default">
              WesAI v2.3
            </span>
            <span className="w-1 h-1 rounded-full bg-notion-light-border dark:bg-notion-dark-border"></span>
            <span className="hover:text-blue-500 transition-colors cursor-default">
              Neural Link Active
            </span>
          </div>
        </div>
      </div>
    </>
  );
};
