// TabButtons.js
import React from 'react';

// 상위 탭 버튼
export const TabButton = ({ title, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`
            py-2.5 px-5 rounded-lg text-sm font-semibold     // 1. 패딩과 둥근 모서리 적용
            transition-all duration-300 ease-in-out
            transform focus:outline-none 
            focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2
            whitespace-nowrap 

            ${
                isActive
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/40' // 2. '슈퍼노바' 활성 (Pop 없음)
                    : 'text-slate-500 hover:text-slate-800' // 3. 기존의 깔끔한 비활성 상태 유지
            }
        `}
    >
        {title}
    </button>
);

// 하위 탭 버튼
export const SubTabButton = ({ title, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`
            px-4 py-1.5 rounded-lg text-sm font-semibold 
            transition-all duration-300 ease-in-out
            transform focus:outline-none 
            focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2

            ${
                isActive
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/40 scale-105' // 1. 활성 상태
                    : 'bg-white text-slate-500 hover:text-slate-800 hover:bg-slate-50 border border-slate-200' // 2. 비활성 상태
            }
        `}
    >
        {title}
    </button>
);
