import React, { useState, useRef, useEffect } from "react";
import { Icon, iconProps } from "./Icons";
import { ColumnConfig, SortKey } from "../hooks/useTableColumns";

interface ColumnConfigDropdownProps {
  columns: ColumnConfig[];
  toggleColumn: (key: SortKey) => void;
  className?: string;
  label?: string;
}

export const ColumnConfigDropdown: React.FC<ColumnConfigDropdownProps> = ({
  columns,
  toggleColumn,
  className = "p-1 hover:bg-notion-light-hover dark:hover:bg-notion-dark-hover rounded transition-colors",
  label,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={className}
        title="Display Columns"
      >
        <div className="flex items-center gap-2">
          <Icon.Settings
            {...iconProps(
              14,
              "text-notion-light-muted dark:text-notion-dark-muted",
            )}
          />
          {label && (
            <span className="text-[10px] font-black uppercase tracking-widest">
              {label}
            </span>
          )}
        </div>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-48 bg-notion-light-bg dark:bg-notion-dark-bg border border-notion-light-border dark:border-notion-dark-border rounded-xl shadow-xl z-50 p-2 animate-in fade-in zoom-in-95 duration-100">
          <div className="text-[10px] font-bold text-notion-light-muted dark:text-notion-dark-muted uppercase tracking-wider px-2 py-2 border-b border-notion-light-border dark:border-notion-dark-border mb-1">
            Display Columns
          </div>
          <div className="max-h-60 overflow-y-auto">
            {columns.map((col) => (
              <label
                key={col.key}
                className="flex items-center gap-2 px-2 py-2 hover:bg-notion-light-sidebar dark:hover:bg-notion-dark-sidebar rounded-lg cursor-pointer transition-colors group"
              >
                <input
                  type="checkbox"
                  checked={col.visible}
                  onChange={() => toggleColumn(col.key)}
                  className="w-3.5 h-3.5 rounded border-notion-light-border dark:border-notion-dark-border text-blue-600 focus:ring-0 focus:ring-offset-0 bg-transparent"
                />
                <span className="text-xs font-medium text-notion-light-text dark:text-notion-dark-text group-hover:text-notion-light-text dark:group-hover:text-notion-dark-text">
                  {col.label}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
