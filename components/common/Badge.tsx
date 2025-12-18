
import React from 'react';
import { PriorityLevel, StatusLevel } from '../../types';
import { PRIORITY_THEME, STATUS_THEME, PROJECT_THEME_BASE } from '../../constants/theme';

interface BadgeProps {
  type: 'priority' | 'status' | 'project';
  value: PriorityLevel | StatusLevel | string;
  className?: string;
  onClick?: () => void;
  showDot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({ type, value, className = "", onClick, showDot = true }) => {
  if (type === 'priority') {
    const theme = PRIORITY_THEME[value as PriorityLevel];
    return (
      <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold border ${theme.bg} ${theme.text} ${theme.border} ${className}`}>
        {showDot && <span className={`w-1.5 h-1.5 rounded-full ${theme.dot}`}></span>}
        {value}
      </div>
    );
  }

  if (type === 'status') {
    const theme = STATUS_THEME[value as StatusLevel];
    return (
      <button 
        onClick={onClick}
        disabled={!onClick}
        className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold border transition-all ${onClick ? 'cursor-pointer hover:ring-2 hover:ring-indigo-100 dark:hover:ring-indigo-900 active:scale-95' : 'cursor-default'} ${theme.bg} ${theme.text} ${theme.border} ${className}`}
      >
        {showDot && <span className={`w-1.5 h-1.5 rounded-full ${theme.dot}`}></span>}
        {value}
      </button>
    );
  }

  // Project Style Logic
  const hash = (value as string).split('').reduce((acc, char) => char.charCodeAt(0) + acc, 0);
  const projectStyle = PROJECT_THEME_BASE[hash % PROJECT_THEME_BASE.length];
  
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${projectStyle} ${className}`}>
      {value}
    </span>
  );
};
