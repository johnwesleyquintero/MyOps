import React from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
}

export const Card: React.FC<CardProps> = ({
  children,
  className = "",
  hoverEffect = false,
  padding = "md",
  ...props
}) => {
  const baseStyles =
    "bg-white dark:bg-notion-dark-sidebar border border-notion-light-border dark:border-notion-dark-border rounded-2xl overflow-hidden";

  const hoverStyles = hoverEffect
    ? "hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
    : "";

  const paddings = {
    none: "",
    sm: "p-3 sm:p-4",
    md: "p-5 sm:p-6",
    lg: "p-6 sm:p-8",
  };

  return (
    <div
      className={`${baseStyles} ${hoverStyles} ${paddings[padding]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
