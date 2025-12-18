
import { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
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
      text: "Systems online, brother. I'm connected to the mission board. What's the move?",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [activeTool, setActiveTool] = useState<string | null>(null);
  
  const chatSession = useRef<Chat | null>(null);

  const startNewSession = () => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      chatSession.current = ai.chats.create({
        model: 'gemini-3-flash-preview',
        config: {
          systemInstruction: WES_AI_SYSTEM_INSTRUCTION,
          tools: WES_TOOLS,
        }
      });
    } catch (e) {
      console.error("Failed to initialize WesAI", e);
    }
  };

  useEffect(() => {
    startNewSession();
  }, []);

  const resetChat = () => {
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

  const executeFunction = async (name: string, args: any): Promise<any> => {
    setActiveTool(name);
    await new Promise(r => setTimeout(r, 600));

    try {
      switch (name) {
        case 'get_tasks':
          return { tasks: entries.map(e => ({ id: e.id, desc: e.description, status: e.status, priority: e.priority, date: e.date, project: e.project })) };
        
        case 'create_task':
          const newEntry: TaskEntry = {
            id: '',
            description: args.description,
            project: args.project || 'Inbox',
            priority: args.priority || 'Medium',
            status: 'Backlog',
            date: args.date || new Date().toISOString().split('T')[0],
            dependencies: []
          };
          await onSaveTransaction(newEntry, false);
          return { result: "success", message: `Created: ${newEntry.description}` };
        
        case 'update_task':
          const target = entries.find(e => e.id === args.id);
          if (!target) return { error: "ID not found" };
          const updatedEntry = { ...target, ...args };
          await onSaveTransaction(updatedEntry, true);
          return { result: "success", message: `Updated: ${target.description}` };
        
        case 'delete_task':
          const delTarget = entries.find(e => e.id === args.id);
          if (!delTarget) return { error: "ID not found" };
          await onDeleteTransaction(delTarget);
          return { result: "success", message: "Task deleted." };

        default:
          return { error: "Unknown tool" };
      }
    } catch (err: any) {
      return { error: err.message };
    } finally {
      setActiveTool(null);
    }
  };

  const sendMessage = async () => {
    if (!inputValue.trim() || !chatSession.current) return;

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
      let response: GenerateContentResponse = await chatSession.current.sendMessage({ message: userText });
      
      while (response.functionCalls && response.functionCalls.length > 0) {
        const functionResponses = response.functionCalls.map(async (call) => {
          const result = await executeFunction(call.name, call.args);
          return {
            id: call.id,
            name: call.name,
            response: result
          };
        });
        
        const results = await Promise.all(functionResponses);
        response = await chatSession.current.sendMessage({ message: { parts: results.map(r => ({ functionResponse: r })) } as any });
      }

      setMessages(prev => [...prev, {
        id: crypto.randomUUID(),
        role: 'model',
        text: response.text || "Confirmed.",
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

  return {
    messages,
    inputValue,
    setInputValue,
    isThinking,
    activeTool,
    sendMessage,
    resetChat
  };
};
