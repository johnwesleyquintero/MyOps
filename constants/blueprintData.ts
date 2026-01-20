import { Page } from "../types";

export interface BlueprintModule {
  id: string;
  pageId?: Page;
  title: string;
  status: "ACTIVE" | "PARTIAL" | "PENDING";
  iconKey: string;
  features: string[];
  color: string;
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
    color: "indigo",
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
    color: "emerald",
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
    color: "amber",
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
    color: "rose",
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
    color: "cyan",
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
    color: "slate",
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
    color: "violet",
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
    color: "blue",
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
    color: "fuchsia",
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
    color: "orange",
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
    color: "lime",
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
    color: "teal",
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
    color: "pink",
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
    color: "purple",
  },
];
