import React from "react";
import { STATUSES } from "@/constants";
import { Icon, iconProps } from "./Icons";
import { Button, DebouncedInput, Badge } from "./ui";

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

export const FilterBar: React.FC<FilterBarProps> = React.memo(
  ({
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
      <div className="flex flex-col lg:flex-row gap-4 mb-6 bg-notion-light-bg dark:bg-notion-dark-bg p-3 border border-notion-light-border dark:border-notion-dark-border rounded-xl items-center shadow-sm transition-all">
        {/* Search Input */}
        <div className="flex-[2] w-full">
          <DebouncedInput
            id="global-search"
            className="w-full rounded-lg"
            placeholder="Search missions..."
            value={searchQuery}
            onChange={setSearchQuery}
          />
        </div>

        {/* Month Navigator Group */}
        <div className="flex items-center w-full lg:w-auto gap-0 bg-notion-light-sidebar dark:bg-notion-dark-sidebar border border-notion-light-border dark:border-notion-dark-border rounded-lg overflow-hidden">
          <Button
            variant="ghost"
            onClick={() => handleMonthChange("prev")}
            className="p-2 border-r border-notion-light-border dark:border-notion-dark-border rounded-none hover:bg-notion-light-hover dark:hover:bg-notion-dark-hover text-notion-light-muted dark:text-notion-dark-muted transition-colors"
            title="Previous Month"
          >
            <Icon.ChevronLeft {...iconProps(16)} />
          </Button>
          <input
            type="month"
            className="block w-full lg:w-32 py-1.5 border-none rounded-none text-center font-mono text-sm bg-transparent focus:outline-none focus:ring-0 text-notion-light-text dark:text-notion-dark-text"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
          />
          <Button
            variant="ghost"
            onClick={() => handleMonthChange("next")}
            className="p-2 border-l border-notion-light-border dark:border-notion-dark-border rounded-none hover:bg-notion-light-hover dark:hover:bg-notion-dark-hover text-notion-light-muted dark:text-notion-dark-muted transition-colors"
            title="Next Month"
          >
            <Icon.Next {...iconProps(16)} />
          </Button>
        </div>

        {/* AI Sort Toggle */}
        {setIsAiSortEnabled && (
          <Button
            variant="ghost"
            onClick={() => setIsAiSortEnabled(!isAiSortEnabled)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all w-full lg:w-auto justify-center ${
              isAiSortEnabled
                ? "bg-violet-50 dark:bg-violet-900/20 border-violet-200 dark:border-violet-800 text-violet-600 dark:text-violet-400"
                : "bg-notion-light-sidebar dark:bg-notion-dark-sidebar border-notion-light-border dark:border-notion-dark-border text-notion-light-muted dark:text-notion-dark-muted hover:bg-notion-light-hover dark:hover:bg-notion-dark-hover"
            }`}
            title={isAiSortEnabled ? "Disable AI Sort" : "Enable AI Sort"}
          >
            <Icon.Brain
              {...iconProps(14, isAiSortEnabled ? "animate-pulse" : "")}
            />
            <Badge
              variant="ghost"
              size="md"
              className="!p-0 bg-transparent text-inherit border-none"
            >
              AI Sort
            </Badge>
          </Button>
        )}

        <div className="flex gap-2 w-full lg:w-auto">
          {/* Status Dropdown */}
          <div className="flex-1 lg:w-32 relative">
            <select
              className="w-full border border-notion-light-border dark:border-notion-dark-border rounded-lg pl-2 pr-7 py-1.5 appearance-none text-xs focus:outline-none focus:ring-1 focus:ring-blue-500/30 bg-notion-light-bg dark:bg-notion-dark-bg text-notion-light-text dark:text-notion-dark-text transition-all"
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
              className="w-full border border-notion-light-border dark:border-notion-dark-border rounded-lg pl-2 pr-7 py-1.5 appearance-none text-xs focus:outline-none focus:ring-1 focus:ring-blue-500/30 bg-notion-light-bg dark:bg-notion-dark-bg text-notion-light-text dark:text-notion-dark-text transition-all"
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
          <Button
            variant="ghost"
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("");
              setSelectedStatus("");
              setSelectedMonth(new Date().toISOString().slice(0, 7));
            }}
            className="w-full lg:w-auto px-4 py-2 hover:text-purple-600 dark:hover:text-purple-400 border border-transparent hover:border-purple-200 dark:hover:border-purple-900 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-all whitespace-nowrap text-center text-xs font-medium"
          >
            Reset Filters
          </Button>
        )}
      </div>
    );
  },
);
