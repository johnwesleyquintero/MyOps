import React from "react";

interface ScoreIndicatorProps {
  label: string;
  score: number;
  maxScore?: number;
  dotColorClass: string;
}

export const ScoreIndicator: React.FC<ScoreIndicatorProps> = ({
  label,
  score,
  maxScore = 5,
  dotColorClass,
}) => (
  <div className="flex flex-col">
    <span className="text-[8px] uppercase tracking-tighter text-notion-light-muted dark:text-notion-dark-muted font-bold">
      {label}
    </span>
    <div className="flex gap-0.5 mt-0.5">
      {Array.from({ length: maxScore }).map((_, i) => (
        <div
          key={i}
          className={`w-2.5 h-1 rounded-full ${
            i < score
              ? dotColorClass
              : "bg-notion-light-border dark:bg-notion-dark-border opacity-30"
          }`}
        ></div>
      ))}
    </div>
  </div>
);
