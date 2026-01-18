import React from "react";
import { TaskEntry } from "../types";

interface AnalyticsProps {
  entries: TaskEntry[];
  currency?: string;
  locale?: string;
}

// For MVP MyOps, we are disabling the chart view to focus on the list.
// Future versions will include Burndown charts.
export const Analytics: React.FC<AnalyticsProps> = () => {
  return null;
};
