
import { useState, useRef, useEffect, useCallback } from 'react';
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
      text: "Systems online, brother. WesLedger core initialized. Ready for the next objective.",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [activeTool, setActiveTool] = useState<string | null>(null);
  
  const chatSession = useRef<Chat | null>(null);

  const startNewSession = useCallback(() => {
    try {
      // Ensure we use the latest API key from env
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      chatSession.current = ai.chats.create({
        model: 'gemini-3-flash-preview',
        config: {
          systemInstruction: WES_AI_SYSTEM_INSTRUCTION,
          tools: WES_TOOLS,
        }
      });
    } catch (e) {
      console.error("Failed to initialize WesAI Neural Link", e);
    }
  }, []);

  useEffect(() => {
    startNewSession();
  }, [startNewSession]);

  const resetChat = () => {
    setMessages([
      {
        id: crypto.randomUUID(),
        role: 'model',
        text: "Neural Link re-established. Tactical feed reset.",
        timestamp: new Date()
      }
    ]);
    startNewSession();
  };

  const executeFunction = async (name: string, args: any): Promise<any> => {
    setActiveTool(name);
    // Visual feedback for "operator-grade" feeling
    await new Promise(r => setTimeout(r, 400));

    try {
      switch (name) {
        case 'get_tasks':
          return { tasks: entries.map(e => ({ id: e.id, desc: e.description, status: e.status, priority: e.priority, date: e.date, project: e.project })) };
        
        case 'create_task':
          const newEntry: TaskEntry = {
            id: crypto.randomUUID(),
            description: args.description,
            project: args.project || 'Inbox',
            priority: args.priority || 'Medium',
            status: 'Backlog',
            date: args.date || new Date().toISOString().split('T')[0],
            dependencies: []
          };
          await onSaveTransaction(newEntry, false);
          return { result: "success", message: `Mission added: ${newEntry.description}` };
        
        case 'update_task':
          const target = entries.find(e => e.id === args.id);
          if (!target) return { error: "Mission ID not found in current ledger." };
          const updatedEntry = { ...target, ...args };
          await onSaveTransaction(updatedEntry, true);
          return { result: "success", message: `Mission updated: ${target.description}` };
        
        case 'delete_task':
          const delTarget = entries.find(e => e.id === args.id);
          if (!delTarget) return { error: "Mission ID not found." };
          await onDeleteTransaction(delTarget);
          return { result: "success", message: "Mission purged from ledger." };

        default:
          return { error: "Protocol not found." };
      }
    } catch (err: any) {
      return { error: `Command execution failed: ${err.message}` };
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
      // Correct usage of @google/genai SDK
      let response: GenerateContentResponse = await chatSession.current.sendMessage({ message: userText });
      
      // Handle potential tool calls in a loop for chain-of-thought
      while (response.functionCalls && response.functionCalls.length > 0) {
        const functionResponses = await Promise.all(
          response.functionCalls.map(async (call) => ({
            id: call.id,
            name: call.name,
            response: await executeFunction(call.name, call.args)
          }))
        );
        
        response = await chatSession.current.sendMessage({ 
          message: { parts: functionResponses.map(r => ({ functionResponse: r })) } as any 
        });
      }

      // response.text is a getter property
      const textOutput = response.text || "Objective confirmed.";

      setMessages(prev => [...prev, {
        id: crypto.randomUUID(),
        role: 'model',
        text: textOutput,
        timestamp: new Date()
      }]);

    } catch (error: any) {
      console.error("WesAI Communication Error:", error);
      setMessages(prev => [...prev, {
        id: crypto.randomUUID(),
        role: 'model',
        text: `**Neural Link Error**: ${error.message}. Please check system config.`,
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
