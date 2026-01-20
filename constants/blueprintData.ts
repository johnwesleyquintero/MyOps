import { Page } from "../types";
import { MODULE_COLORS } from "./ui";

export type ModuleStatus = "ACTIVE" | "PARTIAL" | "PENDING";

export interface BlueprintModule {
  id: string;
  pageId?: Page;
  title: string;
  status: ModuleStatus;
  iconKey: string;
  features: string[];
  colorKey: keyof typeof MODULE_COLORS;
}

export const BLUEPRINT_MODULES: BlueprintModule[] = [
  {
    id: "tasks",
    pageId: "MISSIONS",
    title: "Task & Project Management",
    status: "ACTIVE",
    iconKey: "Missions",
    features: [
      "Table / Kanban / Gantt views",
      "Dependencies & blockers",
      "Milestones & priorities",
      "Ritual / Focus Mode toggle",
    ],
    colorKey: "tasks",
  },
  {
    id: "crm",
    pageId: "CRM",
    title: "CRM & Contact Layer",
    status: "ACTIVE",
    iconKey: "Users",
    features: [
      "Contacts / Clients / Vendors",
      "Interaction logs & history",
      "Follow-up reminders",
      "Task-linked networking",
    ],
    colorKey: "crm",
  },
  {
    id: "docs",
    pageId: "KNOWLEDGE",
    title: "Documentation & Intel",
    status: "ACTIVE",
    iconKey: "Docs",
    features: [
      "Markdown notes & SOPs",
      "Rich text formatting",
      "Searchable knowledge base",
      "Tag-based organization",
    ],
    colorKey: "docs",
  },
  {
    id: "analytics",
    pageId: "INSIGHTS",
    title: "Analytics & Insights",
    status: "ACTIVE",
    iconKey: "Analytics",
    features: [
      "Operational velocity charts",
      "Project completion stats",
      "Recharts: bars & pies",
      "Real-time health reports",
    ],
    colorKey: "analytics",
  },
  {
    id: "automation",
    pageId: "AUTOMATION",
    title: "Automation Layer",
    status: "ACTIVE",
    iconKey: "Active",
    features: [
      "Event-driven triggers",
      "Smart agentic workflows",
      "Batch status updates",
      "GAS background syncing",
    ],
    colorKey: "automation",
  },
  {
    id: "vault",
    pageId: "VAULT",
    title: "Secure Vault",
    status: "ACTIVE",
    iconKey: "Vault",
    features: [
      "AES-256 encrypted storage",
      "API tokens & secret keys",
      "One-click copy to clip",
      "Local data sovereignty",
    ],
    colorKey: "vault",
  },
  {
    id: "ai",
    pageId: "WESAI",
    title: "AI Co-Pilot (WesAI)",
    status: "ACTIVE",
    iconKey: "Bot",
    features: [
      "Gemini 3 Flash Powered",
      "Context-aware execution",
      "Create/Update tasks",
      "Conversational strategy",
    ],
    colorKey: "ai",
  },
  {
    id: "sovereign",
    pageId: "DASHBOARD",
    title: "Sovereign Layer",
    status: "ACTIVE",
    iconKey: "Link",
    features: [
      "Google Sheets backend",
      "Offline-friendly",
      "Zero-cost",
      "Multi-tab support",
    ],
    colorKey: "sovereign",
  },
  {
    id: "strategy",
    pageId: "STRATEGY",
    title: "Decision & Strategy",
    status: "ACTIVE",
    iconKey: "Strategy",
    features: [
      "Decision journal logs",
      "Assumption tracking",
      "Strategy vs Tactic separation",
      "Expected outcome reviews",
    ],
    colorKey: "strategy",
  },
  {
    id: "awareness",
    pageId: "AWARENESS",
    title: "Mental State Awareness",
    status: "ACTIVE",
    iconKey: "Activity",
    features: [
      "Energy & clarity tracking",
      "Mindset Briefing widget",
      "Daily check-in rituals",
      "WesAI state coaching",
    ],
    colorKey: "awareness",
  },
  {
    id: "assets",
    pageId: "ASSETS",
    title: "Asset & IP Registry",
    status: "ACTIVE",
    iconKey: "Project",
    features: [
      "SOP & Framework library",
      "Monetization potential score",
      "Code snippet vault",
      "Asset-to-Project links",
    ],
    colorKey: "assets",
  },
  {
    id: "reflection",
    pageId: "REFLECTION",
    title: "Feedback & Reflection",
    status: "ACTIVE",
    iconKey: "History",
    features: [
      "Post-mortem close-outs",
      "Enforced reflection loops",
      "Mistake avoidance logs",
      "Systemization triggers",
    ],
    colorKey: "reflection",
  },
  {
    id: "life",
    pageId: "LIFE",
    title: "Life Ops & Constraints",
    status: "ACTIVE",
    iconKey: "Heart",
    features: [
      "Health & recovery blocks",
      "Personal goal tracking",
      "Family commitments",
      "Energy-based scheduling",
    ],
    colorKey: "life",
  },
  {
    id: "integrations",
    pageId: "INTEGRATIONS",
    title: "Integration Hub",
    status: "ACTIVE",
    iconKey: "Link",
    features: [
      "Slack / WhatsApp / Email hooks",
      "Event-driven triggers",
      "One-click connection testing",
      "Automatic client sync",
    ],
    colorKey: "integrations",
  },
];
