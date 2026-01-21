import { MODULE_COLORS } from "./ui";

export const AUTOMATION_TEMPLATES = [
  {
    name: "Lead-to-Mission",
    trigger: "Webhook",
    action: "Create Task",
    description: "Convert incoming webhooks into active mission tasks.",
    icon: "Zap",
    colors: MODULE_COLORS.crm,
  },
  {
    name: "Vault Sync",
    trigger: "Scheduled",
    action: "Category Update",
    description: "Automatically categorize transactions in your Vault.",
    icon: "Vault",
    colors: MODULE_COLORS.vault,
  },
  {
    name: "Empire Pulse",
    trigger: "Daily 00:00",
    action: "Generate Report",
    description: "Daily automated summary of your empire's performance.",
    icon: "Strategy",
    colors: MODULE_COLORS.strategy,
  },
  {
    name: "AI Co-pilot Sync",
    trigger: "Manual",
    action: "Update Blueprint",
    description: "Sync AI suggestions directly into your Master Blueprint.",
    icon: "Bot",
    colors: MODULE_COLORS.ai,
  },
];
