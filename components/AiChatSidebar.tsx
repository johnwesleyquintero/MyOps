import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { GoogleGenAI, Chat } from "@google/genai";
import { AppConfig, TaskEntry } from '../types';
import { WES_AI_SYSTEM_INSTRUCTION, WES_TOOLS } from '../constants/aiConfig';

interface AiChatSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  config: AppConfig;
  entries: TaskEntry[];
  onSaveTransaction: (entry: TaskEntry, isUpdate: boolean) => Promise<boolean>;
  onDeleteTransaction: (entry: TaskEntry) => Promise<boolean>;
}

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export const AiChatSidebar: React.FC<AiChatSidebarProps> = ({ 
    isOpen, 
    onClose, 
    config, 
    entries,
    onSaveTransaction,
    onDeleteTransaction
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init',
      role: 'model',
      text: "Systems online, brother. I'm connected to the mission board. What's the move?",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [activeTool, setActiveTool] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatSession = useRef<Chat | null>(null);

  const startNewSession = () => {
      if (!config.geminiApiKey) return;
      try {
        const ai = new GoogleGenAI({ apiKey: config.geminiApiKey });
        chatSession.current = ai.chats.create({
            model: 'gemini-2.5-flash',
            config: {
                systemInstruction: WES_AI_SYSTEM_INSTRUCTION,
                tools: WES_TOOLS,
            }
        });
      } catch (e) {
        console.error("Failed to initialize WesAI", e);
      }
  };

  // Initialize Chat Session
  useEffect(() => {
    if (!config.geminiApiKey) {
        setMessages(prev => {
            if (prev.find(m => m.id === 'error-key')) return prev;
            return [...prev, {
                id: 'error-key',
                role: 'model',
                text: "⚠️ **Neural Link Offline**: Please add your **Gemini API Key** in Settings to activate WesAI.",
                timestamp: new Date()
            }];
        });
        chatSession.current = null;
        return;
    }

    startNewSession();
  }, [config.geminiApiKey]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen, isThinking]);

  // --- Reset Logic ---
  const handleReset = () => {
    setMessages([
        {
          id: crypto.randomUUID(),
          role: 'model',
          text: "Systems re-initialized. Ready for orders.",
          timestamp: new Date()
        }
    ]);
    startNewSession();
  };

  // --- Tool Execution Logic ---

  const executeFunction = async (name: string, args: any): Promise<any> => {
      setActiveTool(name);
      
      // Artificial delay for "Thinking" feel and to allow UI to update
      await new Promise(r => setTimeout(r, 800));

      try {
          switch (name) {
              case 'get_tasks':
                  return { tasks: entries.map(e => ({ id: e.id, desc: e.description, status: e.status, priority: e.priority, date: e.date, project: e.project })) };
              
              case 'create_task':
                  const newEntry: TaskEntry = {
                      id: '', // Hook handles ID generation
                      description: args.description,
                      project: args.project || 'Inbox',
                      priority: args.priority || 'Medium',
                      status: 'Backlog',
                      date: args.date || new Date().toISOString().split('T')[0],
                      dependencies: []
                  };
                  await onSaveTransaction(newEntry, false);
                  return { result: "success", message: `Created task: ${newEntry.description}` };
              
              case 'update_task':
                  const target = entries.find(e => e.id === args.id);
                  if (!target) return { error: "Task ID not found" };
                  
                  const updatedEntry = { ...target, ...args };
                  await onSaveTransaction(updatedEntry, true);
                  return { result: "success", message: `Updated task: ${target.description}` };
              
              case 'delete_task':
                  const delTarget = entries.find(e => e.id === args.id);
                  if (!delTarget) return { error: "Task ID not found" };
                  
                  await onDeleteTransaction(delTarget);
                  return { result: "success", message: "Task deleted." };

              default:
                  return { error: "Unknown function" };
          }
      } catch (err: any) {
          return { error: err.message };
      } finally {
          setActiveTool(null);
      }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
    if (!chatSession.current) return;

    const userText = inputValue;
    setInputValue('');
    
    setMessages(prev => [...prev, {
        id: crypto.randomUUID(),
        role: 'user',
        text: userText,
        timestamp: new Date()
    }]);
    
    setIsThinking(true);

    try {
        let result = await chatSession.current.sendMessage({ message: userText });
        
        // Loop for handling multiple function calls (multi-turn)
        while (result.functionCalls && result.functionCalls.length > 0) {
            const toolResponses = [];
            
            for (const call of result.functionCalls) {
                console.log(`[WesAI] Calling Tool: ${call.name}`, call.args);
                const functionResponse = await executeFunction(call.name, call.args);
                
                toolResponses.push({
                    functionResponse: {
                        name: call.name,
                        id: call.id,
                        response: functionResponse
                    }
                });
            }

            // Send tool output back to model
            result = await chatSession.current.sendMessage({ message: toolResponses });
        }

        const responseText = result.text;
        
        setMessages(prev => [...prev, {
            id: crypto.randomUUID(),
            role: 'model',
            text: responseText || "Mission updated.",
            timestamp: new Date()
        }]);

    } catch (error: any) {
        setMessages(prev => [...prev, {
            id: crypto.randomUUID(),
            role: 'model',
            text: `**System Error**: ${error.message}`,
            timestamp: new Date()
        }]);
    } finally {
        setIsThinking(false);
        setActiveTool(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
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
                <div className={`w-2 h-2 rounded-full ${config.geminiApiKey ? 'bg-indigo-500 animate-pulse' : 'bg-red-500'}`}></div>
                <h2 className="font-bold text-slate-800 dark:text-slate-100 tracking-tight">WesAI <span className="text-slate-400 font-normal">Neural Link</span></h2>
            </div>
            <div className="flex items-center gap-1">
                <button 
                    onClick={handleReset}
                    className="p-2 text-slate-400 hover:text-indigo-500 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                    title="Reset Chat"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                </button>
                <button 
                    onClick={onClose}
                    className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
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
                        {msg.role === 'model' ? (
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
                                <svg className="w-3 h-3 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
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
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim() || isThinking || !config.geminiApiKey}
                    className="absolute right-2 bottom-2 p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
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