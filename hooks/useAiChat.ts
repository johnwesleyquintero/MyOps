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
const MAX_HISTORY_LENGTH = 50; // Keep only last 50 messages
const TOOL_CACHE_TTL = 30000; // 30 seconds cache for read-only tools

interface StoredMessage extends Omit<Message, "timestamp"> {
  timestamp: string;
}

interface ToolCacheEntry {
  data: unknown;
  timestamp: number;
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
        // Ensure history is pruned on load
        const pruned = parsed.slice(-MAX_HISTORY_LENGTH);
        return pruned.map((msg) => ({
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

  // Persist messages with pruning
  useEffect(() => {
    const prunedMessages = messages.slice(-MAX_HISTORY_LENGTH);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prunedMessages));
  }, [messages]);

  const [inputValue, setInputValue] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const chatSession = useRef<Chat | null>(null);
  const toolCache = useRef<Record<string, ToolCacheEntry>>({});
  const lastMessageTime = useRef<number>(0);

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

  // Helper for mapping data to tool responses (minimizes token usage)
  const mapTask = (t: TaskEntry) => ({
    id: t.id,
    description: t.description,
    status: t.status,
    priority: t.priority,
    date: t.date,
    project: t.project,
  });

  const mapContact = (c: Contact) => ({
    id: c.id,
    name: c.name,
    company: c.company,
    type: c.type,
    email: c.email,
  });

  const executeTool = useCallback(
    async (name: string, args: Record<string, unknown>) => {
      setActiveTool(name);

      // Check cache for read-only tools
      const readOnlyTools = [
        "get_vault_entries",
        "get_insights",
        "get_artifact_recommendations",
        "get_tasks",
        "search_tasks",
        "get_contacts",
        "search_contacts",
        "get_notes",
        "get_decisions",
        "get_mental_state",
        "get_assets",
        "get_reflections",
        "get_life_constraints",
        "get_operator_summary",
      ];

      if (readOnlyTools.includes(name)) {
        const cached = toolCache.current[name];
        if (cached && Date.now() - cached.timestamp < TOOL_CACHE_TTL) {
          setActiveTool(null);
          return cached.data;
        }
      }

      const updateCache = (data: unknown) => {
        if (readOnlyTools.includes(name)) {
          toolCache.current[name] = { data, timestamp: Date.now() };
        } else {
          // Invalidate related caches on write operations
          if (name.includes("task")) delete toolCache.current["get_tasks"];
          if (name.includes("contact"))
            delete toolCache.current["get_contacts"];
          if (name.includes("note")) delete toolCache.current["get_notes"];
          if (name.includes("asset")) delete toolCache.current["get_assets"];
          if (name.includes("reflection"))
            delete toolCache.current["get_reflections"];
          // Always invalidate summary on any write
          delete toolCache.current["get_operator_summary"];
          delete toolCache.current["get_insights"];
        }
        return data;
      };

      try {
        switch (name) {
          case "get_vault_entries":
            return updateCache({
              entries: vaultEntries.map(
                ({ id, label, category, lastAccessed }) => ({
                  id,
                  label,
                  category,
                  lastAccessed,
                }),
              ),
            });
          case "get_insights":
            return updateCache({ metrics });
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
            return updateCache({
              unlockedCount: artifacts.length - locked.length,
              totalCount: artifacts.length,
              lockedArtifacts: locked.map((a) => ({
                name: a.name,
                condition: a.condition,
                missing: a.target - a.progress,
              })),
            });
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

            return updateCache({
              focused,
              mentalState: currentMentalState,
              activeConstraints,
            });
          }

          case "get_tasks":
            return updateCache({
              tasks: entries.map(mapTask),
            });
          case "search_tasks": {
            const query = ((args.query as string) || "").toLowerCase();
            const project = ((args.project as string) || "").toLowerCase();
            const status = ((args.status as string) || "").toLowerCase();

            const filtered = entries.filter((t) => {
              const matchQuery =
                !query || t.description.toLowerCase().includes(query);
              const matchProject =
                !project || t.project.toLowerCase().includes(project);
              const matchStatus =
                !status || t.status.toLowerCase().includes(status);
              return matchQuery && matchProject && matchStatus;
            });

            return updateCache({
              tasks: filtered.slice(0, 10).map(mapTask),
              totalFound: filtered.length,
            });
          }
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
            return updateCache(
              success
                ? { status: "Created successfully" }
                : { error: "Failed to create" },
            );
          }
          case "update_task": {
            const task = entries.find((e) => e.id === args.id);
            if (!task) return { error: "ID not found" };
            const ok = await onSaveTransaction(
              { ...task, ...args } as TaskEntry,
              true,
            );
            return updateCache(
              ok
                ? { status: "Updated successfully" }
                : { error: "Failed to update" },
            );
          }
          case "delete_task": {
            const t = entries.find((e) => e.id === args.id);
            if (!t) return { error: "ID not found" };
            const delOk = await onDeleteTransaction(t);
            return updateCache(
              delOk
                ? { status: "Deleted successfully" }
                : { error: "Failed to delete" },
            );
          }
          case "get_contacts":
            return updateCache({
              contacts: contacts.map(mapContact),
            });
          case "search_contacts": {
            const query = ((args.query as string) || "").toLowerCase();
            const filtered = contacts.filter(
              (c) =>
                c.name.toLowerCase().includes(query) ||
                c.company.toLowerCase().includes(query),
            );
            return updateCache({
              contacts: filtered.slice(0, 10).map(mapContact),
              totalFound: filtered.length,
            });
          }
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
            return updateCache(
              contactSuccess
                ? { status: "Contact created" }
                : { error: "Failed to create contact" },
            );
          }
          case "get_notes":
            return updateCache({
              notes: notes.map((n) => ({
                id: n.id,
                title: n.title,
                tags: n.tags,
                updatedAt: n.updatedAt,
              })),
            });
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
            return updateCache(
              noteSuccess
                ? { status: "Note created" }
                : { error: "Failed to create note" },
            );
          }
          case "get_decisions":
            return updateCache({
              decisions: decisions.map((d) => ({
                id: d.id,
                date: d.date,
                title: d.title,
                decisionType: d.decisionType,
                status: d.status,
                impact: d.impact,
                reviewDate: d.reviewDate,
              })),
            });
          case "get_mental_state": {
            const today = new Date().toISOString().split("T")[0];
            const latest =
              mentalStates.find((m) => m.date === today) || mentalStates[0];
            return updateCache(
              latest
                ? {
                    date: latest.date,
                    energy: latest.energy,
                    clarity: latest.clarity,
                    isToday: latest.date === today,
                  }
                : {
                    error:
                      "No mental state data available. Suggest the user perform a check-in.",
                  },
            );
          }
          case "get_assets":
            return updateCache({
              assets: assets.map((a) => ({
                id: a.id,
                title: a.title,
                type: a.type,
                status: a.status,
                reusabilityScore: a.reusabilityScore,
                monetizationPotential: a.monetizationPotential,
              })),
            });
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
            return updateCache(
              assetSuccess
                ? { status: "Asset created" }
                : { error: "Failed to create asset" },
            );
          }
          case "get_reflections":
            return updateCache({
              reflections: reflections.map((r) => ({
                id: r.id,
                date: r.date,
                title: r.title,
                type: r.type,
              })),
            });
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
            return updateCache(
              reflectionSuccess
                ? { status: "Reflection created" }
                : { error: "Failed to create reflection" },
            );
          }
          case "get_life_constraints":
            return updateCache({
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
            });
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

            return updateCache({
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
            });
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

      // Simple rate limiting: 2 seconds between messages
      const now = Date.now();
      if (now - lastMessageTime.current < 2000) {
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: "model",
            text: "Whoa, brother! Systems cooling down. Give me a second to process.",
            timestamp: new Date(),
          },
        ]);
        return;
      }
      lastMessageTime.current = now;

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
