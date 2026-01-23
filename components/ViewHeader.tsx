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
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
      <div className="space-y-1.5">
        <h1 className="text-2xl md:text-3xl font-black tracking-tighter text-notion-light-text dark:text-notion-dark-text uppercase leading-none flex items-baseline gap-2">
          {firstWord}
          {remainingWords && (
            <span className="text-notion-light-text/35 dark:text-white/30 uppercase tracking-[0.3em] text-xs md:text-sm font-black">
              {remainingWords}
            </span>
          )}
        </h1>
        <div className="flex items-center gap-2">
          <div className="w-8 h-1 bg-gradient-to-r from-indigo-500 to-transparent rounded-full opacity-60" />
          <p className="text-notion-light-text/70 dark:text-white/60 text-[9px] font-black uppercase tracking-[0.3em]">
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
