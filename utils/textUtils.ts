import React from "react";

// Helper for parsing text nodes to find hashtags
export const processTextWithTags = (text: string) => {
  if (typeof text !== "string") return text;

  const parts = text.split(/(#\w+)/g);
  return parts.map((part, index) => {
    if (part.match(/^#\w+$/)) {
      return React.createElement(
        "span",
        {
          key: index,
          className:
            "inline-block bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300 px-1.5 py-0 rounded text-[10px] font-bold mx-0.5 border border-indigo-100 dark:border-indigo-800",
        },
        part,
      );
    }
    return part;
  });
};
