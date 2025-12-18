
import React, { useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { AppConfig, TaskEntry } from '../types';
import { useAiChat } from '../hooks/useAiChat';
import { Icon, iconProps } from './Icons';

interface AiChatSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  config: AppConfig;
  entries: TaskEntry[];
  onSaveTransaction: (entry: TaskEntry, isUpdate: boolean) => Promise<boolean>;
  onDeleteTransaction: (entry: TaskEntry) => Promise<boolean>;
}

export const AiChatSidebar: React.FC<AiChatSidebarProps> = ({ 
    isOpen, 
    onClose, 
    config, 
    entries,
    onSaveTransaction,
    onDeleteTransaction
}) => {
  const {
    messages,
    inputValue,
    setInputValue,
    isThinking,
    activeTool,
    sendMessage,
    resetChat
  } = useAiChat({ config, entries, onSaveTransaction, onDeleteTransaction });
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen, isThinking]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
            className="fixed inset-0 bg-slate-900/20 backdrop-blur-[1px] z-[60]"
            onClick={onClose}
        />
      )}

      {/* Sidebar Drawer */}
      <div className={`fixed top-0 right-0 h-full w-full sm:w-[400px] bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl z-[70] transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-md">
            <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${config.geminiApiKey ? 'bg-indigo-500 animate-pulse-soft' : 'bg-red-500'}`}></div>
                <h2 className="font-bold text-slate-800 dark:text-slate-100 tracking-tight">WesAI <span className="text-slate-400 font-normal">Neural Link</span></h2>
            </div>
            <div className="flex items-center gap-1">
                <button 
                    onClick={resetChat}
                    className="p-2 text-slate-400 hover:text-indigo-500 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                    title="Reset Chat"
                >
                    <Icon.Reset {...iconProps(18)} />
                </button>
                <button 
                    onClick={onClose}
                    className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                >
                    <Icon.Close {...iconProps(18)} />
                </button>
            </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4 bg-white dark:bg-slate-900">
            {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div 
                        className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                            msg.role === 'user' 
                            ? 'bg-indigo-600 text-white rounded-br-none' 
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-bl-none border border-slate-200 dark:border-slate-700'
                        }`}
                    >
                        {msg.role === 'model' && (
                           <div className="mb-2 flex items-center gap-1.5 text-indigo-500 dark:text-indigo-400">
                              <Icon.Bot {...iconProps(14, "stroke-[2.5px]")} />
                              <span className="text-[10px] font-bold uppercase tracking-widest">WesAI</span>
                           </div>
                        )}
                        {msg.role === 'model' ? (
                            <div className="prose prose-sm dark:prose-invert max-w-none">
                              <ReactMarkdown 
                                  components={{
                                      p: ({node, ...props}) => <p {...props} className="mb-2 last:mb-0" />,
                                      ul: ({node, ...props}) => <ul {...props} className="list-disc list-inside mb-2" />,
                                      ol: ({node, ...props}) => <ol {...props} className="list-decimal list-inside mb-2" />,
                                      code: ({node, ...props}) => <code {...props} className="bg-slate-200 dark:bg-slate-900 px-1 py-0.5 rounded font-mono text-xs" />,
                                      strong: ({node, ...props}) => <strong {...props} className="font-bold text-slate-900 dark:text-white" />
                                  }}
                              >
                                  {msg.text}
                              </ReactMarkdown>
                            </div>
                        ) : (
                            msg.text
                        )}
                        <div className={`text-[10px] mt-1 opacity-60 ${msg.role === 'user' ? 'text-indigo-100 text-right' : 'text-slate-400'}`}>
                            {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                    </div>
                </div>
            ))}
            
            {/* Thinking / Tool Execution Indicator */}
            {isThinking && (
                <div className="flex justify-start animate-fade-in">
                    <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl rounded-bl-none px-4 py-3 border border-slate-100 dark:border-slate-800 flex items-center gap-2">
                        {activeTool ? (
                            <div className="flex items-center gap-2 text-xs text-indigo-500 font-mono font-bold uppercase tracking-wider">
                                <Icon.Settings {...iconProps(14, "animate-spin")} />
                                {activeTool}...
                            </div>
                        ) : (
                            <div className="flex items-center gap-1 h-3">
                                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                            </div>
                        )}
                    </div>
                </div>
            )}
            <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
            <div className="relative">
                <textarea 
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={config.geminiApiKey ? "Orders, brother?" : "Configure API Key to chat..."}
                    disabled={!config.geminiApiKey}
                    rows={1}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-4 pr-12 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none custom-scrollbar text-slate-800 dark:text-slate-100 placeholder-slate-400 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ minHeight: '48px', maxHeight: '120px' }}
                />
                <button 
                    onClick={sendMessage}
                    disabled={!inputValue.trim() || isThinking || !config.geminiApiKey}
                    className="absolute right-2 bottom-2 p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                >
                    <Icon.Send {...iconProps(18)} />
                </button>
            </div>
            <div className="text-[10px] text-slate-400 text-center mt-2 flex justify-center gap-2">
                <span>WesAI v2.3</span>
                <span>•</span>
                <span>Function Calling Active</span>
            </div>
        </div>

      </div>
    </>
  );
};
