import React, { useState, useEffect } from 'react';
import api from '../../../axios';
import LiveCard from './LiveCard';

export default function HotLiveSection() {
    const [meetings, setMeetings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLiveMeetings();
    }, []);

    const fetchLiveMeetings = async () => {
        try {
            const response = await api.get('/api/meetings/by-mode', {
                params: {
                    mode: 'C', // Culture 모드
                    page: 0,
                    size: 20,
                },
            });
            setMeetings(response.data.items || []);
            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch meetings:', error);
            console.error('Error response:', error.response?.data);
            console.error('Error status:', error.response?.status);
            setLoading(false);
        }
    };

    // 랜덤 시청자 수 생성 (실제로는 API에서 받아야 함)
    const getViewerCount = () => Math.floor(Math.random() * 3000) + 500;

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
            <div className="bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 py-16 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center">로딩 중...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    {/* 왼쪽 텍스트 영역 */}
                    <div>
                        <h2 className="flex items-center gap-2 sm:gap-3 text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">
                            <span className="text-3xl sm:text-4xl">🔥</span>
                            <span>지금 핫한 라이브</span>
                        </h2>
                        <p className="text-gray-600 mt-2 text-sm sm:text-base">실시간으로 진행 중인 인기 스트리밍이에요</p>
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

                {/* Live Cards - GRID (스크롤 X) */}
                <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {meetings.map((meeting, index) => (
                        <LiveCard key={meeting.meetings_id} meeting={meeting} viewerCount={getViewerCount()} language={formatLanguage(meeting.default_lang)} index={index} />
                    ))}
                </div>
            </div>
        </div>
    );
}
