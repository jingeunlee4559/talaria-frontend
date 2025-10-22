import React from 'react';
import { SearchIcon } from './icons/icons'; // 아이콘 경로에 맞게 수정해주세요.

const SearchInput = ({ searchTerm, setSearchTerm, placeholder }) => {
    return (
        <div className="relative w-full max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon className="text-slate-400" />
            </div>
            <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={placeholder}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition shadow-sm"
            />
        </div>
    );
};

export default SearchInput;
