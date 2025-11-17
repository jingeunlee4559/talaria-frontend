// src/components/Culture/Pagination.jsx
import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    // 페이지 번호 배열 생성 (최대 5개 페이지 번호 표시)
    const getPageNumbers = () => {
        const pages = [];
        const maxVisible = 5;

        if (totalPages <= maxVisible) {
            // 전체 페이지가 5개 이하면 모두 표시
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            // 현재 페이지 기준으로 앞뒤 2개씩 표시
            let start = Math.max(1, currentPage - 2);
            let end = Math.min(totalPages, currentPage + 2);

            // 시작이 1이면 끝을 더 늘림
            if (start === 1) {
                end = Math.min(totalPages, maxVisible);
            }

            // 끝이 마지막이면 시작을 더 당김
            if (end === totalPages) {
                start = Math.max(1, totalPages - maxVisible + 1);
            }

            for (let i = start; i <= end; i++) {
                pages.push(i);
            }
        }

        return pages;
    };

    const pageNumbers = getPageNumbers();

    if (totalPages <= 1) return null;

    return (
        <div className="flex justify-center items-center gap-2 mt-12 mb-8">
            {/* 첫 페이지로 */}
            <button
                onClick={() => onPageChange(1)}
                disabled={currentPage === 1}
                className={`p-2 rounded-lg transition-all duration-200 ${
                    currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gradient-to-r hover:from-pink-500 hover:to-purple-500 hover:text-white hover:shadow-lg'
                }`}
                aria-label="첫 페이지"
            >
                <ChevronsLeft className="w-5 h-5" />
            </button>

            {/* 이전 페이지 */}
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`p-2 rounded-lg transition-all duration-200 ${
                    currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gradient-to-r hover:from-pink-500 hover:to-purple-500 hover:text-white hover:shadow-lg'
                }`}
                aria-label="이전 페이지"
            >
                <ChevronLeft className="w-5 h-5" />
            </button>

            {/* 페이지 번호들 */}
            <div className="flex items-center gap-1">
                {pageNumbers.map((page) => (
                    <button
                        key={page}
                        onClick={() => onPageChange(page)}
                        className={`min-w-[40px] h-10 px-3 rounded-lg font-medium transition-all duration-200 ${
                            currentPage === page ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg shadow-pink-200 scale-110' : 'text-gray-700 hover:bg-gray-100 hover:shadow-md'
                        }`}
                    >
                        {page}
                    </button>
                ))}
            </div>

            {/* 다음 페이지 */}
            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`p-2 rounded-lg transition-all duration-200 ${
                    currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gradient-to-r hover:from-pink-500 hover:to-purple-500 hover:text-white hover:shadow-lg'
                }`}
                aria-label="다음 페이지"
            >
                <ChevronRight className="w-5 h-5" />
            </button>

            {/* 마지막 페이지로 */}
            <button
                onClick={() => onPageChange(totalPages)}
                disabled={currentPage === totalPages}
                className={`p-2 rounded-lg transition-all duration-200 ${
                    currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gradient-to-r hover:from-pink-500 hover:to-purple-500 hover:text-white hover:shadow-lg'
                }`}
                aria-label="마지막 페이지"
            >
                <ChevronsRight className="w-5 h-5" />
            </button>

            {/* 페이지 정보 */}
            <div className="ml-4 text-sm text-gray-600 font-medium">
                <span className="text-pink-600">{currentPage}</span> / {totalPages}
            </div>
        </div>
    );
};

export default Pagination;
