
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
      text: "WesLedger Neural Link established. Awaiting tactical objectives, brother.",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [activeTool, setActiveTool] = useState<string | null>(null);
  
  const chatSession = useRef<Chat | null>(null);

  const startNewSession = useCallback(() => {
    try {
      // Create new instance to ensure we use current API key
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      chatSession.current = ai.chats.create({
        model: 'gemini-3-flash-preview',
        config: {
          systemInstruction: WES_AI_SYSTEM_INSTRUCTION,
          tools: WES_TOOLS,
          temperature: 0.7,
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
        text: "Tactical feed reset. Systems nominal.",
        timestamp: new Date()
      }
    ]);
    startNewSession();
  };

  const executeFunction = async (name: string, args: any): Promise<any> => {
    setActiveTool(name);
    await new Promise(r => setTimeout(r, 600)); // Operational delay for realism

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
          return { result: "success", message: `Mission locked: ${newEntry.description}` };
        
        case 'update_task':
          const target = entries.find(e => e.id === args.id);
          if (!target) return { error: "Mission ID not found in current ledger." };
          const updatedEntry = { ...target, ...args };
          await onSaveTransaction(updatedEntry, true);
          return { result: "success", message: `Objective parameters updated: ${target.description}` };
        
        case 'delete_task':
          const delTarget = entries.find(e => e.id === args.id);
          if (!delTarget) return { error: "Mission ID not found." };
          await onDeleteTransaction(delTarget);
          return { result: "success", message: "Objective purged from mission board." };

        default:
          return { error: "Protocol undefined." };
      }
    } catch (err: any) {
      return { error: `Command failure: ${err.message}` };
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
      
      // Handle tool calls in a loop (agentic behavior)
      let iterations = 0;
      while (response.functionCalls && response.functionCalls.length > 0 && iterations < 5) {
        iterations++;
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

      const textOutput = response.text || "Objective verified.";

      setMessages(prev => [...prev, {
        id: crypto.randomUUID(),
        role: 'model',
        text: textOutput,
        timestamp: new Date()
      }]);

    } catch (error: any) {
      console.error("WesAI Link Failure:", error);
      setMessages(prev => [...prev, {
        id: crypto.randomUUID(),
        role: 'model',
        text: `**System Fault**: Neural connection unstable (${error.message}). Check API integrity.`,
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
