// src/components/Culture/contents/VirtualBgModal.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { VIRTUAL_BG_CATEGORIES } from './VIRTUAL_BG_PRESETS ';

const VirtualBgModal = ({ isOpen, presets, pendingVirtualBgId, onSelectPreset, onApply, onClose }) => {
    const [activeCategory, setActiveCategory] = useState('basic');

    // 선택된 프리셋 기준으로 카테고리 맞춰주기
    useEffect(() => {
        if (!isOpen) return;

        const current = presets.find((p) => p.id === pendingVirtualBgId);
        if (current?.category) {
            setActiveCategory(current.category);
        } else {
            setActiveCategory('basic');
        }
    }, [isOpen, pendingVirtualBgId, presets]);

    // 실제로 사용할 카테고리 목록(해당 프리셋이 있는 카테고리만)
    const categories = useMemo(() => {
        const used = new Set(presets.map((p) => p.category || 'basic'));
        return VIRTUAL_BG_CATEGORIES.filter((c) => used.has(c.id));
    }, [presets]);

    const filteredPresets = useMemo(() => presets.filter((p) => (p.category || 'basic') === activeCategory), [presets, activeCategory]);

    if (!isOpen) return null;

    const handleApplyClick = () => {
        if (onApply) {
            onApply(pendingVirtualBgId);
        }
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="w-[95%] max-w-lg bg-gradient-to-br from-pink-500/95 via-purple-600/95 to-indigo-700/95 rounded-3xl shadow-2xl overflow-hidden">
                {/* 헤더 */}
                <div className="px-5 sm:px-7 py-5 sm:py-6 bg-white/10 backdrop-blur-md border-b border-white/20">
                    <div className="flex items-center justify-between mb-2">
                        <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                            <span className="text-2xl">🎨</span>
                            카메라 배경 설정
                        </h2>
                        <button
                            type="button"
                            onClick={onClose}
                            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 transition-all flex items-center justify-center text-white text-xl font-bold"
                        >
                            ×
                        </button>
                    </div>
                    <p className="text-xs sm:text-sm text-white/90 leading-relaxed">
                        카메라가 켜져 있을 때 인물 뒤에 적용할 배경을 선택하세요.
                        <br />
                        카메라를 끄면 선택한 이미지가 대신 표시됩니다.
                    </p>
                </div>

                {/* 컨텐츠 영역 */}
                <div className="px-5 sm:px-7 py-5 sm:py-6">
                    {/* 카테고리 탭 */}
                    <div className="flex gap-2 mb-5 overflow-x-auto pb-2 scrollbar-hide">
                        {categories.map((cat) => {
                            const isActive = activeCategory === cat.id;
                            return (
                                <button
                                    key={cat.id}
                                    type="button"
                                    onClick={() => setActiveCategory(cat.id)}
                                    className={`px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-300 ${
                                        isActive ? 'bg-white text-pink-600 shadow-lg scale-105' : 'bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm'
                                    }`}
                                >
                                    {cat.label}
                                </button>
                            );
                        })}
                    </div>

                    {/* 프리셋 리스트 */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/30 scrollbar-track-transparent">
                        {filteredPresets.length === 0 && (
                            <div className="col-span-2 sm:col-span-3 text-center text-sm text-white/70 py-10 bg-white/10 rounded-2xl backdrop-blur-sm">
                                <div className="text-4xl mb-2">🎭</div>이 카테고리는 준비 중입니다.
                            </div>
                        )}

                        {filteredPresets.map((preset) => {
                            const isSelected = pendingVirtualBgId === preset.id;
                            const isImage = preset.type === 'image';

                            return (
                                <button
                                    key={preset.id}
                                    type="button"
                                    onClick={() => onSelectPreset && onSelectPreset(preset.id)}
                                    className={`relative rounded-2xl overflow-hidden bg-white/95 backdrop-blur-sm text-left transition-all duration-300 hover:scale-105 hover:shadow-xl group ${
                                        isSelected ? 'ring-4 ring-white shadow-2xl scale-105' : 'hover:ring-2 hover:ring-white/50'
                                    }`}
                                >
                                    {/* 이미지/프리뷰 영역 */}
                                    <div className="relative w-full aspect-video">
                                        <div
                                            className="w-full h-full bg-center bg-cover flex items-center justify-center text-xs text-white font-semibold"
                                            style={
                                                isImage && (preset.thumb || preset.imageUrl)
                                                    ? { backgroundImage: `url(${preset.thumb || preset.imageUrl})` }
                                                    : {
                                                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                      }
                                            }
                                        >
                                            {!isImage && <div className="bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-full">효과 미리보기</div>}
                                        </div>

                                        {/* 선택됨 배지 */}
                                        {isSelected && (
                                            <div className="absolute top-2 right-2 bg-pink-500 text-white text-[10px] sm:text-xs px-2 py-1 rounded-full font-bold shadow-lg flex items-center gap-1">
                                                <span>✓</span>
                                                선택됨
                                            </div>
                                        )}
                                    </div>

                                    {/* 텍스트 영역 */}
                                    <div className="px-3 py-2.5 bg-gradient-to-br from-white to-gray-50">
                                        <div className="flex items-center justify-between gap-1 mb-1">
                                            <span className="text-xs sm:text-sm font-bold text-gray-800 truncate">{preset.label}</span>
                                        </div>
                                        <p className="text-[10px] sm:text-xs text-gray-600 line-clamp-2 leading-relaxed">{preset.description}</p>
                                    </div>

                                    {/* 호버 오버레이 */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-pink-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* 버튼 영역 */}
                <div className="px-5 sm:px-7 py-4 sm:py-5 bg-white/10 backdrop-blur-md border-t border-white/20 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-5 sm:px-6 py-2.5 rounded-full text-sm sm:text-base font-bold bg-white/20 hover:bg-white/30 text-white transition-all duration-300 backdrop-blur-sm"
                    >
                        취소
                    </button>
                    <button
                        type="button"
                        onClick={handleApplyClick}
                        className="px-5 sm:px-6 py-2.5 rounded-full text-sm sm:text-base font-bold bg-white text-pink-600 hover:bg-white/90 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                    >
                        적용하기
                    </button>
                </div>
            </div>

            <style jsx>{`
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                .scrollbar-thin::-webkit-scrollbar {
                    width: 6px;
                }
                .scrollbar-thin::-webkit-scrollbar-track {
                    background: transparent;
                }
                .scrollbar-thin::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.3);
                    border-radius: 3px;
                }
                .scrollbar-thin::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 255, 255, 0.5);
                }
            `}</style>
        </div>
    );
};

export default VirtualBgModal;
