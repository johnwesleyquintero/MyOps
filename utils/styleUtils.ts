import { PROJECT_COLOR_PALETTE } from "@/constants";

const styleCache = new Map<string, string>();

export const getProjectBadgeStyle = (project: string): string => {
  if (styleCache.has(project)) {
    return styleCache.get(project)!;
  }

  const hash = project
    .split("")
    .reduce((acc, char) => char.charCodeAt(0) + acc, 0);
  const style = `inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${PROJECT_COLOR_PALETTE[hash % PROJECT_COLOR_PALETTE.length]}`;

  styleCache.set(project, style);
  return style;
};

/**
 * Converts a Tailwind class string (e.g. "bg-blue-500 text-white")
 * to its hover variants (e.g. "hover:bg-blue-500 hover:text-white").
 */
export const toHover = (classes: string): string => {
  return classes
    .split(" ")
    .filter(Boolean)
    .map((c) => {
      // Don't add hover: to already hover: or other prefixed classes
      if (c.includes(":")) return c;
      return `hover:${c}`;
    })
    .join(" ");
};

/**
 * Converts a Tailwind prefix (bg-, text-, border-) to hover:prefix-
 */
export const prefixToHover = (classes: string): string => {
  return classes.replace(/(bg-|text-|border-)/g, "hover:$1");
};
