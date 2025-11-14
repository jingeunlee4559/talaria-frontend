import React, { useState, useEffect } from 'react';
import api from '../../../axios';
import ClipCard from './ClipCard';

export default function TodayClipSection() {
    const [clips, setClips] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchClips();
    }, []);

    const fetchClips = async () => {
        try {
            const response = await api.get('/api/meetings/by-mode', {
                params: {
                    mode: 'C',
                    page: 0,
                    size: 20,
                },
            });
            setClips(response.data.items || []);
            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch clips:', error);
            setLoading(false);
        }
    };

    // 언어 코드를 표시 형식으로 변환
    const formatLanguage = (lang) => {
        const languageMap = {
            ko: 'KR',
            korean: 'KR',
            en: 'EN',
            english: 'EN',
            jp: 'JP',
            ja: 'JP',
            japanese: 'JP',
            cn: 'CN',
            chinese: 'CN',
        };
        return languageMap[lang?.toLowerCase()] || lang?.toUpperCase() || 'KR';
    };

    if (loading) {
        return (
            <div className="bg-white py-16 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center">로딩 중...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    {/* 왼쪽 텍스트 영역 */}
                    <div>
                        <h2 className="flex items-center gap-2 sm:gap-3 text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">
                            <span className="text-3xl sm:text-4xl">🔥</span>
                            <span> 오늘의 밈 클립</span>
                        </h2>
                        <p className="text-gray-600 mt-2 text-sm sm:text-base">놓치면 후회할 베스트 클립 모음이에요</p>
                    </div>

                    {/* 오른쪽 버튼 영역 */}
                    <button
                        className="
            w-full sm:w-auto
            inline-flex items-center justify-center
            text-sm sm:text-base
            font-semibold
            text-pink-600 hover:text-pink-700
            bg-pink-50 hover:bg-pink-100
            border border-pink-100
            rounded-full
            px-4 py-2
            transition-colors
            group
        "
                    >
                        전체보기
                        <span className="ml-1 group-hover:translate-x-1 transition-transform">→</span>
                    </button>
                </div>

                {/* Clips Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {clips.slice(0, 3).map((clip, index) => (
                        <ClipCard key={clip.meetings_id} clip={clip} language={formatLanguage(clip.default_lang)} index={index} />
                    ))}
                </div>
            </div>
        </div>
    );
}
