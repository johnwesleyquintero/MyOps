import React from "react";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "outline" | "ghost" | "custom";
  size?: "sm" | "md";
}

export const Badge: React.FC<BadgeProps> = React.memo(
  ({
    children,
    className = "",
    variant = "default",
    size = "md",
    ...props
  }) => {
    const baseStyles =
      "inline-flex items-center justify-center font-bold uppercase tracking-wider rounded-full";

    const variants = {
      default:
        "bg-notion-light-sidebar dark:bg-notion-dark-sidebar text-notion-light-muted dark:text-notion-dark-muted border border-notion-light-border dark:border-notion-dark-border",
      outline:
        "bg-transparent border border-notion-light-border dark:border-notion-dark-border text-notion-light-muted dark:text-notion-dark-muted",
      ghost:
        "bg-transparent text-notion-light-muted dark:text-notion-dark-muted",
      custom: "",
    };

    const sizes = {
      sm: "px-1.5 py-0.5 text-[9px]",
      md: "px-2.5 py-1 text-[10px]",
    };

    return (
      <span
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {children}
      </span>
    );
  },
);

Badge.displayName = "Badge";
