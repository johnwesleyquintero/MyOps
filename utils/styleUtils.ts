import { PROJECT_COLOR_PALETTE } from "@/constants";

export const getProjectBadgeStyle = (project: string): string => {
  const hash = project
    .split("")
    .reduce((acc, char) => char.charCodeAt(0) + acc, 0);
  return `inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${PROJECT_COLOR_PALETTE[hash % PROJECT_COLOR_PALETTE.length]}`;
};
