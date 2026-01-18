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
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
      <div>
        <h1 className="text-3xl font-black tracking-tight text-notion-light-text dark:text-notion-dark-text uppercase">
          {firstWord}{" "}
          {remainingWords && (
            <span className="opacity-50 uppercase tracking-widest text-2xl">
              {remainingWords}
            </span>
          )}
        </h1>
        <p className="text-notion-light-muted dark:text-notion-dark-muted mt-1 text-sm font-medium">
          {subTitle}
        </p>
      </div>
      {children && <div className="flex items-center gap-3">{children}</div>}
    </div>
  );
};
