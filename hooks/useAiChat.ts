import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { GoogleGenAI, Chat, Part } from "@google/genai";
import {
  AppConfig,
  TaskEntry,
  PriorityLevel,
  Contact,
  Note,
  VaultEntry,
  OperatorMetrics,
  DecisionEntry,
  MentalStateEntry,
  AssetEntry,
  ReflectionEntry,
  LifeConstraintEntry,
} from "../types";
import { WES_AI_SYSTEM_INSTRUCTION, WES_TOOLS } from "../constants/aiConfig";

export interface Message {
  id: string;
  role: "user" | "model";
  text: string;
  timestamp: Date;
  attachments?: string[];
}

interface UseAiChatProps {
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

const STORAGE_KEY = "wes_ai_chat_history";

interface StoredMessage extends Omit<Message, "timestamp"> {
  timestamp: string;
}

export const useAiChat = ({
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
}: UseAiChatProps) => {
  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as StoredMessage[];
        return parsed.map((msg) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        }));
      } catch (e) {
        console.error("Failed to load chat history", e);
      }
    }
    return [
      {
        id: "init",
        role: "model",
        text: "WesAI initialized. Systems optimal. What's the directive?",
        timestamp: new Date(),
      },
    ];
  });

  // Persist messages
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

  const [inputValue, setInputValue] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const chatSession = useRef<Chat | null>(null);

  const initSession = useCallback(() => {
    if (!config.geminiApiKey) return;
    try {
      const ai = new GoogleGenAI({ apiKey: config.geminiApiKey });
      chatSession.current = ai.chats.create({
        model: "gemini-3-flash-preview",
        config: {
          systemInstruction: WES_AI_SYSTEM_INSTRUCTION,
          tools: WES_TOOLS,
          thinkingConfig: { thinkingBudget: 0 },
        },
      });
    } catch (e) {
      console.error("Neural initialization failed", e);
    }
  }, [config.geminiApiKey]);

  useEffect(() => {
    if (config.geminiApiKey) initSession();
  }, [config.geminiApiKey, initSession]);

  const executeTool = useCallback(
    async (name: string, args: Record<string, unknown>) => {
      setActiveTool(name);
      try {
        switch (name) {
          case "get_vault_entries":
            return {
              entries: vaultEntries.map(
                ({ id, label, category, lastAccessed }) => ({
                  id,
                  label,
                  category,
                  lastAccessed,
                }),
              ),
            };
          case "get_insights":
            return { metrics };
          case "get_artifact_recommendations": {
            const artifacts = [
              {
                name: "Initiator",
                condition: "Create 5 missions",
                progress: entries.length,
                target: 5,
                isUnlocked: entries.length >= 5,
              },
              {
                name: "Finisher",
                condition: "Complete 10 missions",
                progress: metrics.totalTasksCompleted,
                target: 10,
                isUnlocked: metrics.totalTasksCompleted >= 10,
              },
              {
                name: "Strategist",
                condition: "3+ Active Projects",
                progress: new Set(entries.map((e) => e.project)).size,
                target: 3,
                isUnlocked: new Set(entries.map((e) => e.project)).size >= 3,
              },
              {
                name: "Knowledgeable",
                condition: "Create 5 notes",
                progress: notes.length,
                target: 5,
                isUnlocked: notes.length >= 5,
              },
              {
                name: "Vault Keeper",
                condition: "Store 3 secrets",
                progress: vaultEntries.length,
                target: 3,
                isUnlocked: vaultEntries.length >= 3,
              },
              {
                name: "Dependency",
                condition: "Link 1st dependency",
                progress: entries.some((e) => (e.dependencies?.length ?? 0) > 0)
                  ? 1
                  : 0,
                target: 1,
                isUnlocked: entries.some(
                  (e) => (e.dependencies?.length ?? 0) > 0,
                ),
              },
              {
                name: "Consistent",
                condition: "3-Day Streak",
                progress: metrics.streak,
                target: 3,
                isUnlocked: metrics.streak >= 3,
              },
              {
                name: "Elite Operator",
                condition: "Complete 25 missions",
                progress: metrics.totalTasksCompleted,
                target: 25,
                isUnlocked: metrics.totalTasksCompleted >= 25,
              },
              {
                name: "Networker",
                condition: "Save 5 contacts",
                progress: contacts.length,
                target: 5,
                isUnlocked: contacts.length >= 5,
              },
              {
                name: "High Priority",
                condition: "5 High Priority done",
                progress: entries.filter(
                  (e) => e.priority === "High" && e.status === "Done",
                ).length,
                target: 5,
                isUnlocked:
                  entries.filter(
                    (e) => e.priority === "High" && e.status === "Done",
                  ).length >= 5,
              },
              {
                name: "Veteran",
                condition: "Reach Level 5",
                progress: metrics.level,
                target: 5,
                isUnlocked: metrics.level >= 5,
              },
              {
                name: "Archon",
                condition: "Reach Level 10",
                progress: metrics.level,
                target: 10,
                isUnlocked: metrics.level >= 10,
              },
            ];
            const locked = artifacts.filter((a) => !a.isUnlocked);
            return {
              unlockedCount: artifacts.length - locked.length,
              totalCount: artifacts.length,
              lockedArtifacts: locked.map((a) => ({
                name: a.name,
                condition: a.condition,
                missing: a.target - a.progress,
              })),
            };
          }
          case "get_focused_tasks": {
            const today = new Date().toISOString().split("T")[0];
            const currentMentalState =
              mentalStates.find((m) => m.date === today) || mentalStates[0];
            const activeConstraints = lifeConstraints.filter((c) => c.isActive);

            const focused = entries
              .filter((t) => t.status !== "Done")
              .map((t) => {
                let reason = "";
                let priorityScore = 0;

                if (t.priority === "High") {
                  priorityScore += 3;
                  reason = "High Priority";
                }
                if (t.date < today) {
                  priorityScore += 5;
                  reason = reason ? `${reason} & Overdue` : "Overdue";
                } else if (t.date === today) {
                  priorityScore += 2;
                  reason = reason ? `${reason} & Due Today` : "Due Today";
                }

                // Adjust based on mental state
                if (currentMentalState) {
                  const energyMap = { low: 1, medium: 3, high: 5 };
                  const energyValue = energyMap[currentMentalState.energy] || 3;

                  if (
                    energyValue < 3 &&
                    (t.priority === "High" || t.project === "Strategy")
                  ) {
                    priorityScore -= 2; // Suggest deferring high-energy tasks
                    reason = reason
                      ? `${reason} (High Energy Required)`
                      : "High Energy Required";
                  } else if (energyValue >= 4 && t.priority === "High") {
                    priorityScore += 2; // Prioritize high-impact tasks when energy is high
                    reason = reason
                      ? `${reason} (Optimal Energy for Task)`
                      : "Optimal Energy";
                  }
                }

                if (t.dependencies && t.dependencies.length > 0) {
                  const blocked = t.dependencies.some((depId) => {
                    const dep = entries.find((e) => e.id === depId);
                    return dep && dep.status !== "Done";
                  });
                  if (blocked) {
                    priorityScore -= 4; // Significantly lower if blocked
                    reason = reason ? `${reason} (Blocked)` : "Blocked";
                  } else {
                    priorityScore += 2;
                    reason = reason ? `${reason} (Ready)` : "Ready";
                  }
                }

                return { ...t, priorityScore, reason };
              })
              .sort((a, b) => b.priorityScore - a.priorityScore)
              .slice(0, 5);

            return {
              focused,
              mentalState: currentMentalState,
              activeConstraints,
            };
          }

          case "get_tasks":
            return {
              tasks: entries.map(
                ({ id, description, status, priority, date, project }) => ({
                  id,
                  description,
                  status,
                  priority,
                  date,
                  project,
                }),
              ),
            };
          case "create_task": {
            const success = await onSaveTransaction(
              {
                id: "",
                description: args.description as string,
                project: (args.project as string) || "Inbox",
                priority: (args.priority as PriorityLevel) || "Medium",
                status: "Backlog",
                date:
                  (args.date as string) ||
                  new Date().toISOString().split("T")[0],
                dependencies: [],
              },
              false,
            );
            return success
              ? { status: "Created successfully" }
              : { error: "Failed to create" };
          }
          case "update_task": {
            const task = entries.find((e) => e.id === args.id);
            if (!task) return { error: "ID not found" };
            const ok = await onSaveTransaction(
              { ...task, ...args } as TaskEntry,
              true,
            );
            return ok
              ? { status: "Updated successfully" }
              : { error: "Failed to update" };
          }
          case "delete_task": {
            const t = entries.find((e) => e.id === args.id);
            if (!t) return { error: "ID not found" };
            const delOk = await onDeleteTransaction(t);
            return delOk
              ? { status: "Deleted successfully" }
              : { error: "Failed to delete" };
          }
          case "get_contacts":
            return {
              contacts: contacts.map((c) => ({
                id: c.id,
                name: c.name,
                company: c.company,
                type: c.type,
                email: c.email,
              })),
            };
          case "create_contact": {
            const contactSuccess = await onSaveContact(
              {
                id: "",
                name: args.name as string,
                company: (args.company as string) || "",
                type: args.type as Contact["type"],
                email: (args.email as string) || "",
                status: "Lead",
                tags: [],
                createdAt: new Date().toISOString(),
                lastInteraction: new Date().toISOString(),
                interactions: [],
              },
              false,
            );
            return contactSuccess
              ? { status: "Contact created" }
              : { error: "Failed to create contact" };
          }
          case "get_notes":
            return {
              notes: notes.map((n) => ({
                id: n.id,
                title: n.title,
                tags: n.tags,
                updatedAt: n.updatedAt,
              })),
            };
          case "create_note": {
            const noteSuccess = await onSaveNote(
              {
                id: "",
                title: args.title as string,
                content: args.content as string,
                tags: (args.tags as string[]) || [],
                lastModified: new Date().toISOString(),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              },
              false,
            );
            return noteSuccess
              ? { status: "Note created" }
              : { error: "Failed to create note" };
          }
          case "get_decisions":
            return {
              decisions: decisions.map((d) => ({
                id: d.id,
                date: d.date,
                title: d.title,
                decisionType: d.decisionType,
                status: d.status,
                impact: d.impact,
                reviewDate: d.reviewDate,
              })),
            };
          case "get_mental_state": {
            const today = new Date().toISOString().split("T")[0];
            const latest =
              mentalStates.find((m) => m.date === today) || mentalStates[0];
            return latest
              ? {
                  date: latest.date,
                  energy: latest.energy,
                  clarity: latest.clarity,
                  isToday: latest.date === today,
                }
              : {
                  error:
                    "No mental state data available. Suggest the user perform a check-in.",
                };
          }
          case "get_assets":
            return {
              assets: assets.map((a) => ({
                id: a.id,
                title: a.title,
                type: a.type,
                status: a.status,
                reusabilityScore: a.reusabilityScore,
                monetizationPotential: a.monetizationPotential,
              })),
            };
          case "create_asset": {
            const assetSuccess = await onSaveAsset(
              {
                id: "",
                title: args.title as string,
                type: args.type as AssetEntry["type"],
                status: "Active",
                reusabilityScore: 3,
                monetizationPotential: 3,
                notes: (args.notes as string) || "",
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              },
              false,
            );
            return assetSuccess
              ? { status: "Asset created" }
              : { error: "Failed to create asset" };
          }
          case "get_reflections":
            return {
              reflections: reflections.map((r) => ({
                id: r.id,
                date: r.date,
                title: r.title,
                type: r.type,
              })),
            };
          case "create_reflection": {
            const reflectionSuccess = await onSaveReflection(
              {
                id: "",
                date: new Date().toISOString().split("T")[0],
                title: args.title as string,
                type: args.type as ReflectionEntry["type"],
                content: args.content as string,
                learnings: [],
                actionItems: [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              },
              false,
            );
            return reflectionSuccess
              ? { status: "Reflection created" }
              : { error: "Failed to create reflection" };
          }
          case "get_life_constraints":
            return {
              constraints: lifeConstraints
                .filter((c) => c.isActive)
                .map((c) => ({
                  id: c.id,
                  title: c.title,
                  category: c.category,
                  startTime: c.startTime,
                  endTime: c.endTime,
                  daysOfWeek: c.daysOfWeek,
                  energyRequirement: c.energyRequirement,
                })),
            };
          case "get_operator_summary": {
            const today = new Date().toISOString().split("T")[0];
            const currentMentalState =
              mentalStates.find((m) => m.date === today) || mentalStates[0];
            const activeConstraints = lifeConstraints.filter((c) => c.isActive);
            const taskStats = {
              total: entries.length,
              backlog: entries.filter((e) => e.status === "Backlog").length,
              inProgress: entries.filter((e) => e.status === "In Progress")
                .length,
              done: entries.filter((e) => e.status === "Done").length,
              highPriority: entries.filter(
                (e) => e.priority === "High" && e.status !== "Done",
              ).length,
              overdue: entries.filter(
                (e) => e.date < today && e.status !== "Done",
              ).length,
            };

            return {
              summary: {
                taskStats,
                mentalState: currentMentalState,
                activeConstraints: activeConstraints.map((c) => ({
                  title: c.title,
                  category: c.category,
                })),
                metrics: {
                  xp: metrics.xp,
                  level: metrics.level,
                  streak: metrics.streak,
                },
              },
            };
          }
          default:
            return { error: "Tool not found" };
        }
      } finally {
        setActiveTool(null);
      }
    },
    [
      vaultEntries,
      metrics,
      entries,
      notes,
      contacts,
      onSaveTransaction,
      onDeleteTransaction,
      onSaveContact,
      onSaveNote,
      decisions,
      mentalStates,
      assets,
      onSaveAsset,
      reflections,
      onSaveReflection,
      lifeConstraints,
    ],
  );

  const sendMessage = useCallback(
    async (overrideText?: string, attachments?: string[]) => {
      const textToSend = overrideText !== undefined ? overrideText : inputValue;
      if (!textToSend.trim() && (!attachments || attachments.length === 0))
        return;
      if (!chatSession.current) return;

      const prompt = textToSend;
      if (overrideText === undefined) setInputValue("");

      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "user",
          text: prompt,
          timestamp: new Date(),
          attachments,
        },
      ]);
      setIsThinking(true);

      try {
        // Build message parts for multimodal support
        const messageParts: Part[] = [{ text: prompt }];

        if (attachments && attachments.length > 0) {
          attachments.forEach((base64) => {
            // Remove data:image/xxx;base64, prefix
            const match = base64.match(/^data:([^;]+);base64,(.+)$/);
            if (match) {
              messageParts.push({
                inlineData: {
                  mimeType: match[1],
                  data: match[2],
                },
              });
            }
          });
        }

        let result;
        let retries = 0;
        const maxRetries = 3;

        while (retries < maxRetries) {
          try {
            result = await chatSession.current.sendMessage({
              message: messageParts,
            });
            break;
          } catch (err: unknown) {
            const error = err as { message?: string };
            if (
              error.message?.includes("503") ||
              error.message?.includes("overloaded")
            ) {
              retries++;
              if (retries === maxRetries) throw err;
              await new Promise((resolve) =>
                setTimeout(resolve, 1000 * retries),
              );
              continue;
            }
            throw err;
          }
        }

        if (!result) throw new Error("Failed to get response from WesAI.");

        while (result.functionCalls?.length) {
          const responses = await Promise.all(
            result.functionCalls.map(async (call) => ({
              functionResponse: {
                name: call.name,
                id: call.id,
                response: await executeTool(call.name, call.args),
              },
            })),
          );

          retries = 0;
          while (retries < maxRetries) {
            try {
              result = await chatSession.current.sendMessage({
                message: responses,
              });
              break;
            } catch (err: unknown) {
              const error = err as { message?: string };
              if (
                error.message?.includes("503") ||
                error.message?.includes("overloaded")
              ) {
                retries++;
                if (retries === maxRetries) throw err;
                await new Promise((resolve) =>
                  setTimeout(resolve, 1000 * retries),
                );
                continue;
              }
              throw err;
            }
          }
        }
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: "model",
            text: result.text || "Directives processed.",
            timestamp: new Date(),
          },
        ]);
      } catch (err: unknown) {
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: "model",
            text: `Error: ${err instanceof Error ? err.message : "Failed to process directive."}`,
            timestamp: new Date(),
          },
        ]);
      } finally {
        setIsThinking(false);
      }
    },
    [inputValue, executeTool],
  );

  const resetChat = useCallback(() => {
    setMessages([
      {
        id: "reset",
        role: "model",
        text: "Systems re-zeroed.",
        timestamp: new Date(),
      },
    ]);
    initSession();
  }, [initSession]);

  return useMemo(
    () => ({
      messages,
      inputValue,
      setInputValue,
      isThinking,
      activeTool,
      sendMessage,
      resetChat,
    }),
    [messages, inputValue, isThinking, activeTool, sendMessage, resetChat],
  );
};
