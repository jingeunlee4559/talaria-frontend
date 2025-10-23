// TabButtons.js
import React from 'react';

// 상위 탭 버튼
export const TabButton = ({ title, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`py-3 px-1 text-sm font-semibold transition-colors whitespace-nowrap ${isActive ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
    >
        {title}
    </button>
);

// 하위 탭 버튼
export const SubTabButton = ({ title, isActive, onClick }) => (
    <button onClick={onClick} className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all ${isActive ? 'bg-blue-100 text-blue-700' : 'text-slate-500 hover:bg-slate-100'}`}>
        {title}
    </button>
);
