import React from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/20/solid';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    const handlePrevious = () => {
        if (currentPage > 1) {
            onPageChange(currentPage - 1);
        }
    };

    const handleNext = () => {
        if (currentPage < totalPages) {
            onPageChange(currentPage + 1);
        }
    };

    const getPageNumbers = () => {
        const pageNumbers = [];
        // 항상 첫 페이지는 표시
        if (totalPages > 0) pageNumbers.push(1);

        // ... (생략 표시) 로직
        if (currentPage > 3) {
            pageNumbers.push('...');
        }

        // 현재 페이지 주변 번호들
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
            if (i > 1 && i < totalPages) {
                pageNumbers.push(i);
            }
        }

        // ... (생략 표시) 로직
        if (currentPage < totalPages - 2) {
            pageNumbers.push('...');
        }

        // 항상 마지막 페이지는 표시 (단, 1페이지가 아닐 경우)
        if (totalPages > 1) pageNumbers.push(totalPages);

        // 중복 제거 (예: totalPages가 5 미만일 때)
        return [...new Set(pageNumbers)];
    };

    const pageNumbers = getPageNumbers();

    if (totalPages <= 1) return null; // 페이지가 1개 이하면 렌더링하지 않음

    return (
        <nav className="flex items-center justify-center my-8" aria-label="Pagination">
            {/* 이전 버튼 */}
            <button
                onClick={handlePrevious}
                disabled={currentPage === 1}
                className="relative inline-flex items-center rounded-lg p-2 text-gray-500 hover:bg-gray-100 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <span className="sr-only">Previous</span>
                <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
            </button>

            {/* 페이지 번호들 */}
            <div className="mx-4 flex items-center space-x-2">
                {pageNumbers.map((page, index) =>
                    page === '...' ? (
                        <span key={`ellipsis-${index}`} className="px-2 py-2 text-gray-500">
                            ...
                        </span>
                    ) : (
                        <button
                            key={page}
                            onClick={() => onPageChange(page)}
                            className={`relative inline-flex items-center rounded-lg px-4 py-2 text-sm font-semibold 
              ${
                  currentPage === page
                      ? 'bg-blue-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600'
                      : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50'
              }`}
                        >
                            {page}
                        </button>
                    ),
                )}
            </div>

            {/* 다음 버튼 */}
            <button
                onClick={handleNext}
                disabled={currentPage === totalPages}
                className="relative inline-flex items-center rounded-lg p-2 text-gray-500 hover:bg-gray-100 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <span className="sr-only">Next</span>
                <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
            </button>
        </nav>
    );
};

export default Pagination;
