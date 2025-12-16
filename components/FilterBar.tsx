
import React from 'react';
import { STATUSES } from '../constants';

interface FilterBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  selectedStatus: string;
  setSelectedStatus: (status: string) => void;
  selectedMonth: string;
  setSelectedMonth: (month: string) => void;
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
  availableCategories
}) => {

  const handleMonthChange = (direction: 'prev' | 'next') => {
    if (!selectedMonth) return;
    const date = new Date(`${selectedMonth}-01`); // Force 1st of month to avoid overflow
    date.setMonth(date.getMonth() + (direction === 'next' ? 1 : -1));
    const newMonth = date.toISOString().slice(0, 7);
    setSelectedMonth(newMonth);
  };

  const hasActiveFilters = searchQuery || selectedCategory || selectedStatus || (selectedMonth !== new Date().toISOString().slice(0, 7));

  return (
    <div className="flex flex-col lg:flex-row gap-4 mb-6 bg-white p-4 border border-slate-200 rounded-lg shadow-sm items-center">
      
      {/* Search Input */}
      <div className="flex-[2] w-full relative group">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="h-4 w-4 text-slate-400 group-focus-within:text-slate-600 transition-colors" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          id="global-search"
          type="text"
          className="block w-full pl-10 pr-8 py-2 border border-slate-300 rounded-md leading-5 bg-slate-50 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-slate-800 focus:ring-1 focus:ring-slate-800 sm:text-sm transition-all"
          placeholder="Search descriptions... (/)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button 
            onClick={() => setSearchQuery('')}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Month Navigator Group */}
      <div className="flex items-center w-full lg:w-auto gap-1">
        <button 
          onClick={() => handleMonthChange('prev')}
          className="p-2 border border-slate-300 rounded-l-md bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors"
          title="Previous Month"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <input 
          type="month"
          className="block w-full lg:w-32 px-2 py-2 text-base border-y border-slate-300 focus:outline-none focus:border-slate-500 sm:text-sm bg-white text-slate-700 font-mono text-center rounded-none z-10"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
        />
        <button 
          onClick={() => handleMonthChange('next')}
          className="p-2 border border-slate-300 rounded-r-md bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors"
          title="Next Month"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <div className="flex gap-2 w-full lg:w-auto">
        {/* Status Dropdown */}
        <div className="w-1/2 lg:w-32 relative">
            <select
            className="block w-full pl-3 pr-8 py-2 text-base border border-slate-300 focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800 sm:text-sm rounded-md bg-slate-50 appearance-none transition-all"
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
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
            </div>
        </div>

        {/* Category Dropdown */}
        <div className="w-1/2 lg:w-40 relative">
            <select
            className="block w-full pl-3 pr-8 py-2 text-base border border-slate-300 focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800 sm:text-sm rounded-md bg-slate-50 appearance-none transition-all"
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
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
            </div>
        </div>
      </div>

      {/* Clear Button */}
      {hasActiveFilters && (
         <button
           onClick={() => { 
             setSearchQuery(''); 
             setSelectedCategory(''); 
             setSelectedStatus('');
             setSelectedMonth(new Date().toISOString().slice(0, 7)); 
           }}
           className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-red-600 border border-transparent hover:border-red-200 hover:bg-red-50 rounded transition-all whitespace-nowrap"
         >
           Reset
         </button>
      )}
    </div>
  );
};
