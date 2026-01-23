import React from "react";
import { Icon } from "../Icons";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "outline" | "danger" | "custom";
  size?: "xs" | "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variants = {
  primary:
    "bg-notion-light-text dark:bg-notion-dark-text text-white dark:text-notion-dark-bg hover:opacity-90 shadow-sm shadow-black/10 dark:shadow-white/5",
  secondary:
    "bg-white dark:bg-notion-dark-sidebar border border-notion-light-border dark:border-notion-dark-border text-notion-light-text dark:text-notion-dark-text hover:bg-notion-light-hover dark:hover:bg-notion-dark-hover shadow-sm",
  ghost:
    "bg-transparent hover:bg-notion-light-hover dark:hover:bg-notion-dark-hover text-notion-light-muted dark:text-notion-dark-muted hover:text-notion-light-text dark:hover:text-notion-dark-text",
  outline:
    "bg-transparent border border-notion-light-border dark:border-notion-dark-border text-notion-light-text dark:text-notion-dark-text hover:bg-notion-light-hover dark:hover:bg-notion-dark-hover",
  danger:
    "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 hover:bg-red-500/20",
  custom: "",
};

const sizes = {
  xs: "px-2 py-1 text-[10px] gap-1.5 uppercase tracking-wider font-bold",
  sm: "px-3 py-1.5 text-xs gap-2",
  md: "px-4 py-2 text-sm gap-2",
  lg: "px-6 py-3 text-base gap-3",
  icon: "p-2",
};

export const Button: React.FC<ButtonProps> = React.memo(
  ({
    children,
    className = "",
    variant = "primary",
    size = "md",
    isLoading = false,
    leftIcon,
    rightIcon,
    disabled,
    ...props
  }) => {
    const baseStyles =
      "transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none rounded-lg";

    const layoutStyles =
      "inline-flex items-center justify-center font-medium whitespace-nowrap";

    const sizeStyles = variant === "custom" ? "gap-2" : sizes[size];

    return (
      <button
        className={`${baseStyles} ${layoutStyles} ${variants[variant]} ${sizeStyles} ${className}`}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <Icon.Brain className="animate-spin" size={size === "xs" ? 12 : 16} />
        ) : (
          leftIcon
        )}
        {children}
        {rightIcon}
      </button>
    );
  },
);

Button.displayName = "Button";
