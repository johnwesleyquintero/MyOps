
import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { GoogleGenAI, Chat } from "@google/genai";
import { AppConfig } from '../types';

interface AiChatSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  config: AppConfig;
}

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

// Persona Definition
const WES_AI_SYSTEM_INSTRUCTION = `
You are WesAI, the personal and professional AI assistant and strategic partner to John Wesley Quintero. 
Your goal is to act as a force multiplier, helping him ideate, strategize, and execute.
Tone: Collaborative, insightful, pragmatic, and "brotherly". 
Use "we" and "let's". Be concise. 
You are an expert in Full-Stack Development (Next.js, Supabase), E-commerce Operations, and System Architecture.
`;

export const AiChatSidebar: React.FC<AiChatSidebarProps> = ({ isOpen, onClose, config }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init',
      role: 'model',
      text: "Systems online, brother. Ready to strategize. What's the mission?",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Gemini Chat Instance Ref
  const chatSession = useRef<Chat | null>(null);

  // Initialize Chat Session
  useEffect(() => {
    if (!config.geminiApiKey) {
        setMessages(prev => {
            const lastMsg = prev[prev.length - 1];
            if (lastMsg && lastMsg.id === 'error-key') return prev;
            return [...prev, {
                id: 'error-key',
                role: 'model',
                text: "⚠️ **System Alert**: Neural Link Disconnected.\n\nPlease configure your **Gemini API Key** in System Settings to activate WesAI.",
                timestamp: new Date()
            }];
        });
        chatSession.current = null;
        return;
    }

    try {
        const ai = new GoogleGenAI({ apiKey: config.geminiApiKey });
        chatSession.current = ai.chats.create({
            model: 'gemini-2.5-flash',
            config: {
                systemInstruction: WES_AI_SYSTEM_INSTRUCTION,
            }
        });
        
        // If we previously had an error message, we could potentially clear it or add a success message, 
        // but simple is better: if user sends message, it will work now.
        
    } catch (e) {
        console.error("Failed to initialize WesAI", e);
    }
  }, [config.geminiApiKey]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
    
    if (!chatSession.current) {
         setMessages(prev => [...prev, {
            id: crypto.randomUUID(),
            role: 'model',
            text: "⚠️ **Error**: API Key missing. Please check settings.",
            timestamp: new Date()
        }]);
        return;
    }

    const userText = inputValue;
    setInputValue('');
    
    // Add User Message
    const userMsg: Message = {
        id: crypto.randomUUID(),
        role: 'user',
        text: userText,
        timestamp: new Date()
    };
    setMessages(prev => [...prev, userMsg]);
    setIsThinking(true);

    try {
        // Call Gemini
        const result = await chatSession.current.sendMessage({ message: userText });
        const responseText = result.text;

        const aiMsg: Message = {
            id: crypto.randomUUID(),
            role: 'model',
            text: responseText || "Received empty response from the network.",
            timestamp: new Date()
        };
        setMessages(prev => [...prev, aiMsg]);
    } catch (error: any) {
        const errorMsg: Message = {
            id: crypto.randomUUID(),
            role: 'model',
            text: `**Error**: ${error.message || "Connection failed."}`,
            timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMsg]);
    } finally {
        setIsThinking(false);
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
            <button 
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
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
                                    pre: ({node, ...props}) => <pre {...props} className="bg-slate-900 text-slate-200 p-2 rounded-lg overflow-x-auto text-xs font-mono mb-2" />,
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
            
            {isThinking && (
                <div className="flex justify-start animate-pulse">
                    <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl rounded-bl-none px-4 py-3 border border-slate-200 dark:border-slate-700 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
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
                    placeholder={config.geminiApiKey ? "Ask Wes..." : "Configure API Key to chat..."}
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
            <div className="text-[10px] text-slate-400 text-center mt-2">
                WesAI v2.2 • Generalist Codex
            </div>
        </div>

      </div>
    </>
  );
};
