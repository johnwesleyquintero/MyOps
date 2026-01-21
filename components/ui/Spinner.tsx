import React from "react";

interface SpinnerProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  color?: string;
}

const sizes = {
  xs: "w-3 h-3 border",
  sm: "w-4 h-4 border-2",
  md: "w-6 h-6 border-2",
  lg: "w-8 h-8 border-3",
  xl: "w-12 h-12 border-4",
};

export const Spinner: React.FC<SpinnerProps> = ({
  size = "md",
  className = "",
  color = "border-t-notion-light-text dark:border-t-notion-dark-text",
}) => {
  return (
    <div
      className={`
        animate-spin 
        rounded-full 
        border-notion-light-text/10 
        dark:border-notion-dark-text/10 
        ${color} 
        ${sizes[size]} 
        ${className}
      `}
    />
  );
};
