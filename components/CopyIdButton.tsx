import React, { useState } from "react";
import { toast } from "sonner";
import { Icon } from "./Icons";

interface CopyIdButtonProps {
  id: string;
  className?: string;
  showLabel?: boolean;
}

export const CopyIdButton: React.FC<CopyIdButtonProps> = ({
  id,
  className = "",
  showLabel = false,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    navigator.clipboard.writeText(id);
    setCopied(true);
    toast.success("Task ID copied", {
      description:
        "You can now paste this into WesAI to reference the mission.",
      icon: <Icon.Copy size={14} />,
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className={`transition-all flex items-center gap-2 ${className} ${copied ? "text-notion-light-text dark:text-notion-dark-text" : ""}`}
      title="Copy Task ID for WesAI"
    >
      {copied ? (
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M5 13l4 4L19 7"
          />
        </svg>
      ) : (
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"
          />
        </svg>
      )}
      {showLabel && (
        <span className="text-xs font-medium">
          {copied ? "Copied ID" : "Copy ID"}
        </span>
      )}
    </button>
  );
};
