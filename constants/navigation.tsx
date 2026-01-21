import React from "react";
import { Page } from "../types";
import { Icon, iconProps } from "../components/Icons";

export interface NavItemConfig {
  page: Page;
  label: string;
  icon: React.ReactNode;
}

export interface NavCategory {
  title: string;
  items: NavItemConfig[];
}

export const NAVIGATION_CONFIG: NavCategory[] = [
  {
    title: "Operational",
    items: [
      {
        page: "DASHBOARD",
        label: "Command Center",
        icon: <Icon.Dashboard {...iconProps(18)} />,
      },
      {
        page: "MISSIONS",
        label: "Mission Control",
        icon: <Icon.Missions {...iconProps(18)} />,
      },
      {
        page: "CRM",
        label: "CRM & Contacts",
        icon: <Icon.Users {...iconProps(18)} />,
      },
      {
        page: "AUTOMATION",
        label: "Active Agents",
        icon: <Icon.Active {...iconProps(18)} />,
      },
      {
        page: "INTEGRATIONS",
        label: "Integration Hub",
        icon: <Icon.Link {...iconProps(18)} />,
      },
    ],
  },
  {
    title: "Intelligence",
    items: [
      {
        page: "KNOWLEDGE",
        label: "Knowledge Base",
        icon: <Icon.Docs {...iconProps(18)} />,
      },
      {
        page: "INSIGHTS",
        label: "Insights & XP",
        icon: <Icon.Analytics {...iconProps(18)} />,
      },
      {
        page: "WESAI",
        label: "WesAI Co-Pilot",
        icon: <Icon.Ai {...iconProps(18)} />,
      },
      {
        page: "ASSETS",
        label: "Asset Registry",
        icon: <Icon.Project {...iconProps(18)} />,
      },
      {
        page: "REFLECTION",
        label: "Reflection Logs",
        icon: <Icon.History {...iconProps(18)} />,
      },
      {
        page: "AWARENESS",
        label: "Mental State",
        icon: <Icon.Activity {...iconProps(18)} />,
      },
      {
        page: "VAULT",
        label: "Secure Vault",
        icon: <Icon.Vault {...iconProps(18)} />,
      },
    ],
  },
  {
    title: "Strategy",
    items: [
      {
        page: "BLUEPRINT",
        label: "Master Blueprint",
        icon: <Icon.Blueprint {...iconProps(18)} />,
      },
      {
        page: "LIFE",
        label: "Life Ops",
        icon: <Icon.Heart {...iconProps(18)} />,
      },
      {
        page: "STRATEGY",
        label: "Decision Journal",
        icon: <Icon.Strategy {...iconProps(18)} />,
      },
    ],
  },
  {
    title: "Reporting",
    items: [
      {
        page: "REPORT",
        label: "Reporting",
        icon: <Icon.Report {...iconProps(18)} />,
      },
    ],
  },
];
