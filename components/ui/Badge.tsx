import React from "react";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?:
    | "default"
    | "outline"
    | "ghost"
    | "success"
    | "warning"
    | "error"
    | "info"
    | "dot"
    | "custom";
  size?: "xs" | "sm" | "md";
  dotColor?: string;
}

export const Badge: React.FC<BadgeProps> = React.memo(
  ({
    children,
    className = "",
    variant = "default",
    size = "md",
    dotColor,
    ...props
  }) => {
    const baseStyles =
      "inline-flex items-center justify-center font-bold uppercase tracking-widest rounded-md";

    const variants = {
      default:
        "bg-notion-light-sidebar dark:bg-notion-dark-sidebar text-notion-light-muted dark:text-notion-dark-muted border border-notion-light-border dark:border-notion-dark-border",
      outline:
        "bg-transparent border border-notion-light-border dark:border-notion-dark-border text-notion-light-muted dark:text-notion-dark-muted",
      ghost:
        "bg-transparent text-notion-light-muted dark:text-notion-dark-muted",
      success:
        "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20",
      warning:
        "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20",
      error:
        "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20",
      info: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20",
      dot: "bg-notion-light-sidebar dark:bg-notion-dark-sidebar text-notion-light-muted dark:text-notion-dark-muted border border-notion-light-border dark:border-notion-dark-border gap-1.5",
      custom: "",
    };

    const sizes = {
      xs: "px-1 py-0 text-[8px]",
      sm: "px-1.5 py-0.5 text-[9px]",
      md: "px-2.5 py-1 text-[10px]",
    };

    return (
      <span
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {variant === "dot" && (
          <span
            className={`w-1.5 h-1.5 rounded-full ${dotColor || "bg-current opacity-60"}`}
          />
        )}
        {children}
      </span>
    );
  },
);

Badge.displayName = "Badge";
