import React from "react";

interface ViewHeaderProps {
  title: string;
  subTitle: string;
  children?: React.ReactNode;
}

export const ViewHeader: React.FC<ViewHeaderProps> = ({
  title,
  subTitle,
  children,
}) => {
  const words = title.split(" ");
  const firstWord = words[0];
  const remainingWords = words.slice(1).join(" ");

  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
      <div className="space-y-2">
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-notion-light-text dark:text-notion-dark-text uppercase leading-none flex items-baseline gap-3">
          {firstWord}
          {remainingWords && (
            <span className="opacity-10 uppercase tracking-[0.3em] text-xl md:text-2xl font-black">
              {remainingWords}
            </span>
          )}
        </h1>
        <div className="flex items-center gap-3">
          <div className="w-12 h-1 bg-gradient-to-r from-indigo-500 to-transparent rounded-full opacity-40" />
          <p className="text-notion-light-muted dark:text-notion-dark-muted text-[10px] font-black uppercase tracking-[0.3em] opacity-60">
            {subTitle}
          </p>
        </div>
      </div>
      {children && (
        <div className="flex items-center gap-2 bg-notion-light-sidebar/40 dark:bg-notion-dark-sidebar/30 backdrop-blur-md px-2 py-1.5 rounded-2xl border border-notion-light-border/40 dark:border-notion-dark-border/20 shadow-sm transition-all hover:border-notion-light-border/60 dark:hover:border-notion-dark-border/40">
          {children}
        </div>
      )}
    </div>
  );
};
