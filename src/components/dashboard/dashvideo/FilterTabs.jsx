import React from 'react';

const FilterTabs = ({ filters, activeFilter, setActiveFilter }) => {
  return (
    <div className="flex space-x-2 border-b border-slate-200">
      {filters.map(filter => {
        const isActive = activeFilter === filter;
        return (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-4 py-2 text-sm font-semibold rounded-t-md focus:outline-none transition-colors
              ${isActive
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-slate-500 hover:text-slate-700'
              }`}
          >
            {filter}
          </button>
        );
      })}
    </div>
  );
};

export default FilterTabs;