// src/components/Culture/contents/BackgroundThemeSelector.jsx
import React, { useState } from 'react';
import { Palette, X } from 'lucide-react';
import { BACKGROUND_THEMES, THEME_CATEGORIES } from './backgroundThemes';

const BackgroundThemeSelector = ({ currentTheme, onThemeChange, onClose }) => {
    const [selectedCategory, setSelectedCategory] = useState('basic');

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-2 sm:p-4 animate-fade-in">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl h-[95vh] sm:h-auto sm:max-h-[90vh] flex flex-col overflow-hidden animate-scale-in">
                {/* Header - 고정 */}
                <div className="flex-shrink-0 bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2 sm:gap-3">
                            <Palette className="w-5 h-5 sm:w-6 sm:h-6" />
                            <h2 className="text-lg sm:text-2xl font-bold">배경 테마 선택</h2>
                        </div>
                        <button onClick={onClose} className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors flex-shrink-0">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    <p className="text-xs sm:text-sm text-white/90">라이브 분위기에 맞는 배경을 선택하세요! 모든 시청자에게 동일하게 보입니다.</p>
                </div>

                {/* Category Tabs - 고정, 스크롤 가능 */}
                <div className="flex-shrink-0 px-3 sm:px-6 py-3 sm:py-4 border-b border-gray-200 bg-gray-50">
                    <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                        {Object.entries(THEME_CATEGORIES).map(([key, category]) => (
                            <button
                                key={key}
                                onClick={() => setSelectedCategory(key)}
                                className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-full font-semibold text-xs sm:text-sm transition-all whitespace-nowrap flex-shrink-0 ${
                                    selectedCategory === key
                                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg scale-105'
                                        : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                                }`}
                            >
                                <span className="text-base sm:text-lg">{category.icon}</span>
                                <span className="hidden sm:inline">{category.name}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Theme Grid - 스크롤 영역 */}
                <div className="flex-1 overflow-y-auto p-3 sm:p-6 min-h-0">
                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                        {Object.entries(BACKGROUND_THEMES)
                            .filter(([_, theme]) => theme.category === selectedCategory)
                            .map(([themeId, theme]) => {
                                const isSelected = currentTheme === themeId;

                                return (
                                    <button
                                        key={themeId}
                                        onClick={() => onThemeChange(themeId)}
                                        className={`group relative overflow-hidden rounded-2xl transition-all duration-300 ${
                                            isSelected ? 'ring-4 ring-purple-600 scale-105 shadow-2xl' : 'hover:scale-105 hover:shadow-xl'
                                        }`}
                                        style={{ aspectRatio: '16/9' }}
                                    >
                                        {/* 테마 프리뷰 */}
                                        <div
                                            className="absolute inset-0 transition-transform duration-300 group-hover:scale-110"
                                            style={{
                                                background: theme.gradient,
                                            }}
                                        >
                                            {/* 배경 이미지 */}
                                            {theme.imageUrl && (
                                                <div
                                                    className="absolute inset-0 opacity-30 bg-cover bg-center"
                                                    style={{
                                                        backgroundImage: `url(${theme.imageUrl})`,
                                                    }}
                                                />
                                            )}

                                            {/* 파티클 프리뷰 */}
                                            <div className="absolute inset-0 flex items-center justify-center opacity-60">
                                                <span className="text-2xl sm:text-3xl lg:text-4xl">
                                                    {theme.effects?.includes('stars')
                                                        ? '⭐'
                                                        : theme.effects?.includes('sakura') || theme.effects?.includes('sakuraFall')
                                                        ? '🌸'
                                                        : theme.effects?.includes('snow')
                                                        ? '❄️'
                                                        : theme.effects?.includes('leaves')
                                                        ? '🍂'
                                                        : theme.effects?.includes('flowers')
                                                        ? '🌺'
                                                        : theme.effects?.includes('lanterns')
                                                        ? '🏮'
                                                        : theme.effects?.includes('sun')
                                                        ? '☀️'
                                                        : theme.effects?.includes('waves')
                                                        ? '🌊'
                                                        : theme.effects?.includes('dragon')
                                                        ? '🐉'
                                                        : theme.effects?.includes('castle')
                                                        ? '🏰'
                                                        : theme.effects?.includes('bubbles')
                                                        ? '🫧'
                                                        : '✨'}
                                                </span>
                                            </div>
                                        </div>

                                        {/* 선택 표시 */}
                                        {isSelected && (
                                            <div className="absolute top-2 right-2 sm:top-3 sm:right-3 w-6 h-6 sm:w-8 sm:h-8 bg-white rounded-full flex items-center justify-center shadow-lg z-10">
                                                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                            </div>
                                        )}

                                        {/* 테마 이름 */}
                                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 sm:p-4">
                                            <p className="text-white font-bold text-xs sm:text-sm text-center drop-shadow-lg">{theme.name}</p>
                                        </div>

                                        {/* 호버 효과 */}
                                        <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors duration-300" />
                                    </button>
                                );
                            })}
                    </div>
                </div>

                {/* Footer - 고정 */}
                <div className="flex-shrink-0 px-3 sm:px-6 py-3 sm:py-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <p className="text-xs sm:text-sm text-gray-600 text-center sm:text-left">💡 테마는 실시간으로 모든 참가자에게 동기화됩니다</p>
                    <button
                        onClick={onClose}
                        className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full font-semibold hover:shadow-lg transition-all hover:scale-105 flex-shrink-0"
                    >
                        완료
                    </button>
                </div>
            </div>

            <style>{`
                @keyframes fade-in {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }
                @keyframes scale-in {
                    from {
                        opacity: 0;
                        transform: scale(0.9);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1);
                    }
                }
                .animate-fade-in {
                    animation: fade-in 0.2s ease-out;
                }
                .animate-scale-in {
                    animation: scale-in 0.3s ease-out;
                }
                .scrollbar-thin::-webkit-scrollbar {
                    width: 6px;
                    height: 6px;
                }
                .scrollbar-thin::-webkit-scrollbar-track {
                    background: #f1f5f9;
                    border-radius: 10px;
                }
                .scrollbar-thin::-webkit-scrollbar-thumb {
                    background: #cbd5e1;
                    border-radius: 10px;
                }
                .scrollbar-thin::-webkit-scrollbar-thumb:hover {
                    background: #94a3b8;
                }
            `}</style>
        </div>
    );
};

export default BackgroundThemeSelector;
