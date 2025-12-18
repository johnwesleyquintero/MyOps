
import React, { useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { AppConfig, TaskEntry } from '../types';
import { useAiChat } from '../hooks/useAiChat';

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
      {isOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100]" onClick={onClose} />
      )}

      <div className={`fixed top-0 right-0 h-full w-full sm:w-[450px] bg-white dark:bg-slate-950 border-l border-slate-200 dark:border-slate-800 shadow-2xl z-[110] transform transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1) flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
            <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${config.geminiApiKey ? 'bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]' : 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)] animate-pulse'}`}></div>
                <div>
                   <h2 className="font-bold text-slate-800 dark:text-slate-100 text-sm tracking-tight">WesAI Neural Link</h2>
                   <div className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">{config.geminiApiKey ? 'UPLINK ESTABLISHED' : 'LINK OFFLINE'}</div>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <button onClick={resetChat} className="p-2 text-slate-400 hover:text-indigo-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" title="Purge Feed"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6 bg-slate-50/50 dark:bg-slate-950">
            {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                    <div className={`max-w-[90%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm border ${msg.role === 'user' ? 'bg-indigo-600 text-white border-indigo-700 rounded-br-none' : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-800 rounded-bl-none'}`}>
                        {msg.role === 'model' ? (
                            <ReactMarkdown remarkPlugins={[remarkGfm]} components={{
                                p: ({...props}) => <p {...props} className="mb-2 last:mb-0" />,
                                code: ({...props}) => <code {...props} className="bg-slate-100 dark:bg-slate-800 px-1 rounded font-mono text-xs" />,
                                a: ({...props}) => <a {...props} className="text-indigo-500 underline" target="_blank" />
                            }}>{msg.text}</ReactMarkdown>
                        ) : (msg.text)}
                        <div className={`text-[9px] mt-2 font-mono opacity-50 ${msg.role === 'user' ? 'text-indigo-100 text-right' : 'text-slate-500'}`}>{msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    </div>
                </div>
            ))}
            
            {isThinking && (
                <div className="flex justify-start animate-pulse">
                    <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl rounded-bl-none px-5 py-3 border border-indigo-100 dark:border-indigo-800/50 flex items-center gap-3">
                        {activeTool ? (
                            <div className="flex items-center gap-3 text-[10px] text-indigo-600 dark:text-indigo-400 font-mono font-bold uppercase tracking-[0.2em]">
                                <svg className="w-3.5 h-3.5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                {activeTool} in progress
                            </div>
                        ) : (
                            <div className="flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '200ms' }}></span>
                                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '400ms' }}></span>
                            </div>
                        )}
                    </div>
                </div>
            )}
            <div ref={messagesEndRef} />
        </div>

        <div className="p-6 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
            <div className="relative group">
                <textarea 
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={config.geminiApiKey ? "Awaiting orders..." : "API Key required for WesAI..."}
                    disabled={!config.geminiApiKey}
                    className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl pl-5 pr-14 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 resize-none custom-scrollbar text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-700 disabled:opacity-50"
                    style={{ minHeight: '60px', maxHeight: '180px' }}
                />
                <button 
                    onClick={sendMessage}
                    disabled={!inputValue.trim() || isThinking || !config.geminiApiKey}
                    className="absolute right-3 bottom-3 p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-40 transition-all shadow-lg shadow-indigo-600/20"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                </button>
            </div>
            <div className="mt-4 flex justify-between items-center px-2">
                <div className="flex gap-4">
                    <div className="flex items-center gap-1.5">
                        <div className="w-1 h-1 rounded-full bg-indigo-500"></div>
                        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">WesAI v2.3</span>
                    </div>
                </div>
                <div className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Sovereign Data Link</div>
            </div>
        </div>
      </div>
    </>
  );
};
