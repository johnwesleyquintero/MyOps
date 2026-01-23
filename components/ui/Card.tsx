import React from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean;
  padding?: "none" | "xs" | "sm" | "md" | "lg";
  variant?: "default" | "sidebar" | "glass" | "outline";
}

export const Card: React.FC<CardProps> = React.memo(
  ({
    children,
    className = "",
    hoverEffect = false,
    padding = "md",
    variant = "default",
    ...props
  }) => {
    const baseStyles =
      "rounded-xl overflow-hidden transition-all duration-300 border";

    const variants = {
      default:
        "bg-white dark:bg-notion-dark-sidebar/30 border-notion-light-border dark:border-white/5 shadow-sm",
      sidebar:
        "bg-notion-light-sidebar dark:bg-notion-dark-sidebar border-notion-light-border dark:border-notion-dark-border",
      glass:
        "bg-white/70 dark:bg-notion-dark-bg/70 backdrop-blur-md border-notion-light-border dark:border-notion-dark-border shadow-lg",
      outline:
        "bg-transparent border-notion-light-border dark:border-notion-dark-border",
    };

    const hoverStyles = hoverEffect
      ? "hover:shadow-xl hover:-translate-y-0.5 hover:border-notion-light-text/10 dark:hover:border-white/10"
      : "";

    const paddings = {
      none: "",
      xs: "p-2",
      sm: "p-3 sm:p-4",
      md: "p-5 sm:p-6",
      lg: "p-6 sm:p-8",
    };

    return (
      <div
        className={`${baseStyles} ${variants[variant]} ${hoverStyles} ${paddings[padding]} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  },
);

Card.displayName = "Card";
