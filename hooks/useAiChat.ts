
import { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenAI, Chat } from "@google/genai";
import { AppConfig, TaskEntry } from '../types';
import { WES_AI_SYSTEM_INSTRUCTION, WES_TOOLS } from '../constants/aiConfig';

export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

interface UseAiChatProps {
  config: AppConfig;
  entries: TaskEntry[];
  onSaveTransaction: (entry: TaskEntry, isUpdate: boolean) => Promise<boolean>;
  onDeleteTransaction: (entry: TaskEntry) => Promise<boolean>;
}

export const useAiChat = ({ 
  config, 
  entries, 
  onSaveTransaction, 
  onDeleteTransaction 
}: UseAiChatProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init',
      role: 'model',
      text: "WesAI initialized. Systems optimal. What's the directive?",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const chatSession = useRef<Chat | null>(null);

  const initSession = useCallback(() => {
    if (!config.geminiApiKey) return;
    try {
      const ai = new GoogleGenAI({ apiKey: config.geminiApiKey });
      chatSession.current = ai.chats.create({
          model: 'gemini-3-flash-preview',
          config: {
              systemInstruction: WES_AI_SYSTEM_INSTRUCTION,
              tools: WES_TOOLS,
              thinkingConfig: { thinkingBudget: 0 }
          }
      });
    } catch (e) { console.error("Neural initialization failed", e); }
  }, [config.geminiApiKey]);

  useEffect(() => {
    if (config.geminiApiKey) initSession();
  }, [config.geminiApiKey, initSession]);

  const executeTool = async (name: string, args: any) => {
    setActiveTool(name);
    try {
      switch (name) {
        case 'get_tasks':
          return { tasks: entries.map(({ id, description, status, priority, date, project }) => ({ id, description, status, priority, date, project })) };
        case 'create_task':
          const success = await onSaveTransaction({ 
            id: '', description: args.description, project: args.project || 'Inbox', 
            priority: args.priority || 'Medium', status: 'Backlog', 
            date: args.date || new Date().toISOString().split('T')[0], dependencies: [] 
          }, false);
          return success ? { status: "Created successfully" } : { error: "Failed to create" };
        case 'update_task':
          const task = entries.find(e => e.id === args.id);
          if (!task) return { error: "ID not found" };
          const ok = await onSaveTransaction({ ...task, ...args }, true);
          return ok ? { status: "Updated successfully" } : { error: "Failed to update" };
        case 'delete_task':
          const t = entries.find(e => e.id === args.id);
          if (!t) return { error: "ID not found" };
          const delOk = await onDeleteTransaction(t);
          return delOk ? { status: "Deleted successfully" } : { error: "Failed to delete" };
        default: return { error: "Tool not found" };
      }
    } finally { setActiveTool(null); }
  };

  const sendMessage = async () => {
    if (!inputValue.trim() || !chatSession.current) return;
    const prompt = inputValue;
    setInputValue('');
    setMessages(prev => [...prev, { id: crypto.randomUUID(), role: 'user', text: prompt, timestamp: new Date() }]);
    setIsThinking(true);

    try {
      let result = await chatSession.current.sendMessage({ message: prompt });
      while (result.functionCalls?.length) {
        const responses = await Promise.all(result.functionCalls.map(async (call) => ({
          functionResponse: { name: call.name, id: call.id, response: await executeTool(call.name, call.args) }
        })));
        result = await chatSession.current.sendMessage({ message: responses });
      }
      setMessages(prev => [...prev, { id: crypto.randomUUID(), role: 'model', text: result.text || "Directives processed.", timestamp: new Date() }]);
    } catch (err: any) {
      setMessages(prev => [...prev, { id: crypto.randomUUID(), role: 'model', text: `System Error: ${err.message}`, timestamp: new Date() }]);
    } finally { setIsThinking(false); }
  };

  return { messages, inputValue, setInputValue, isThinking, activeTool, sendMessage, resetChat: () => { setMessages([{ id: 'reset', role: 'model', text: "Systems re-zeroed.", timestamp: new Date() }]); initSession(); } };
};
