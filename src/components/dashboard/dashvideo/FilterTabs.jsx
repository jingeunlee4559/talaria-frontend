import React from 'react';

const FilterTabs = ({ filters, activeFilter, setActiveFilter }) => {
    return (
        <nav className="flex space-x-1 sm:space-x-2 bg-gray-100 p-1.5 rounded-lg w-full overflow-x-auto">
            {filters.map((filter) => (
                <button
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className={`
                        flex-1 sm:flex-none px-4 sm:px-5 py-2 rounded-md text-sm sm:text-base font-semibold transition-all duration-300 ease-in-out whitespace-nowrap
                        ${activeFilter === filter ? 'bg-white text-violet-700 shadow-sm' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-200/50'}
                    `}
                >
                    {filter}
                </button>
            ))}
        </nav>
    );
};

export default FilterTabs;
