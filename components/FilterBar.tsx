import React from "react";
import { STATUSES } from "@/constants";
import { Icon, iconProps } from "./Icons";

interface FilterBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  selectedStatus: string;
  setSelectedStatus: (status: string) => void;
  selectedMonth: string;
  setSelectedMonth: (month: string) => void;
  isAiSortEnabled?: boolean;
  setIsAiSortEnabled?: (v: boolean) => void;
  availableCategories: string[];
}

export const FilterBar: React.FC<FilterBarProps> = ({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  selectedStatus,
  setSelectedStatus,
  selectedMonth,
  setSelectedMonth,
  isAiSortEnabled,
  setIsAiSortEnabled,
  availableCategories,
}) => {
  const handleMonthChange = (direction: "prev" | "next") => {
    if (!selectedMonth) return;
    const date = new Date(`${selectedMonth}-01`); // Force 1st of month to avoid overflow
    date.setMonth(date.getMonth() + (direction === "next" ? 1 : -1));
    const newMonth = date.toISOString().slice(0, 7);
    setSelectedMonth(newMonth);
  };

  const hasActiveFilters =
    searchQuery ||
    selectedCategory ||
    selectedStatus ||
    selectedMonth !== new Date().toISOString().slice(0, 7);

  return (
    <div className="flex flex-col lg:flex-row gap-4 mb-6 bg-notion-light-bg dark:bg-notion-dark-bg p-3 border border-notion-light-border dark:border-notion-dark-border rounded-lg items-center transition-colors">
      {/* Search Input */}
      <div className="flex-[2] w-full relative group">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon.Search
            {...iconProps(
              14,
              "text-notion-light-muted dark:text-notion-dark-muted",
            )}
          />
        </div>
        <input
          id="global-search"
          type="text"
          className="notion-input block w-full pl-9 pr-8"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute inset-y-0 right-0 pr-2 flex items-center text-notion-light-muted hover:text-notion-light-text dark:hover:text-notion-dark-text"
          >
            <Icon.Close {...iconProps(12)} />
          </button>
        )}
      </div>

      {/* Month Navigator Group */}
      <div className="flex items-center w-full lg:w-auto gap-1">
        <button
          onClick={() => handleMonthChange("prev")}
          className="p-2 border border-notion-light-border dark:border-notion-dark-border rounded-l bg-notion-light-sidebar dark:bg-notion-dark-sidebar hover:bg-notion-light-hover dark:hover:bg-notion-dark-hover text-notion-light-muted dark:text-notion-dark-muted transition-colors"
          title="Previous Month"
        >
          <Icon.Prev {...iconProps(16)} />
        </button>
        <input
          type="month"
          className="notion-input block w-full lg:w-32 py-2 border-x-0 rounded-none text-center font-mono"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
        />
        <button
          onClick={() => handleMonthChange("next")}
          className="p-2 border border-notion-light-border dark:border-notion-dark-border rounded-r bg-notion-light-sidebar dark:bg-notion-dark-sidebar hover:bg-notion-light-hover dark:hover:bg-notion-dark-hover text-notion-light-muted dark:text-notion-dark-muted transition-colors"
          title="Next Month"
        >
          <Icon.Next {...iconProps(16)} />
        </button>
      </div>

      {/* AI Sort Toggle */}
      {setIsAiSortEnabled && (
        <button
          onClick={() => setIsAiSortEnabled(!isAiSortEnabled)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded border transition-all w-full lg:w-auto justify-center ${
            isAiSortEnabled
              ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400"
              : "bg-notion-light-sidebar dark:bg-notion-dark-sidebar border-notion-light-border dark:border-notion-dark-border text-notion-light-muted dark:text-notion-dark-muted hover:bg-notion-light-hover dark:hover:bg-notion-dark-hover"
          }`}
          title={isAiSortEnabled ? "Disable AI Sort" : "Enable AI Sort"}
        >
          <Icon.Ai {...iconProps(14, isAiSortEnabled ? "animate-pulse" : "")} />
          <span className="text-[10px] font-bold uppercase tracking-widest">
            AI Sort
          </span>
        </button>
      )}

      <div className="flex gap-2 w-full lg:w-auto">
        {/* Status Dropdown */}
        <div className="flex-1 lg:w-32 relative">
          <select
            className="notion-input block w-full pl-2 pr-7 appearance-none text-xs"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="">Status</option>
            {STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-1.5 text-notion-light-muted">
            <Icon.Down {...iconProps(12)} />
          </div>
        </div>

        {/* Category Dropdown */}
        <div className="flex-1 lg:w-40 relative">
          <select
            className="notion-input block w-full pl-2 pr-7 appearance-none text-xs"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">Project</option>
            {availableCategories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-1.5 text-notion-light-muted">
            <Icon.Down {...iconProps(12)} />
          </div>
        </div>
      </div>

      {/* Clear Button */}
      {hasActiveFilters && (
        <button
          onClick={() => {
            setSearchQuery("");
            setSelectedCategory("");
            setSelectedStatus("");
            setSelectedMonth(new Date().toISOString().slice(0, 7));
          }}
          className="w-full lg:w-auto px-4 py-2 notion-label hover:text-red-600 dark:hover:text-red-400 border border-transparent hover:border-red-200 dark:hover:border-red-900 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-all whitespace-nowrap text-center"
        >
          Reset Filters
        </button>
      )}
    </div>
  );
};
