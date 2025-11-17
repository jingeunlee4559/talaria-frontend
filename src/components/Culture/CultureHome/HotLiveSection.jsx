import React, { useState, useEffect, useContext } from 'react';
import api from '../../../axios';
import LiveCard from './LiveCard';
import { UserContext } from '../../../contexts/UserContext';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

export default function HotLiveSection() {
    const { user } = useContext(UserContext);
    const navigate = useNavigate();
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

    // ✅ 문화 모드 전용 참가 함수 (CultureVideos와 동일)
    const handleJoinCultureMeeting = async (meetingId, meetingTitle, inviteCode, rawStatus) => {
        // 1) 종료된 회의면 막기
        if (rawStatus === 'ENDED') {
            Swal.fire({
                icon: 'info',
                title: '종료된 라이브입니다',
                text: '종료된 라이브는 참여할 수 없고, 첨부 문서만 확인 가능합니다.',
                timer: 1800,
                showConfirmButton: false,
            });
            return;
        }

        try {
            const currentMeeting = meetings.find((m) => m.meetings_id === meetingId);

            // 🔐 게스트 접근 제한
            if (currentMeeting && currentMeeting.user_role === 'GUEST' && currentMeeting.status !== '진행중') {
                Swal.fire({
                    icon: 'warning',
                    title: '참여 불가',
                    text: '게스트는 진행중인 라이브만 참여할 수 있습니다.',
                    timer: 2000,
                    showConfirmButton: false,
                });
                return;
            }

            // ⏱ 호스트가 '예정' 상태 → 'ONGOING'으로 변경
            if (currentMeeting && currentMeeting.status === '예정') {
                const updateData = {
                    title: meetingTitle,
                    status: 'ONGOING',
                    inviteCode,
                    scheduledAt: new Date().toISOString(),
                };

                if (currentMeeting.user_role === 'HOST' && user?.userId) {
                    await api.patch(`/api/users/${user.userId}/meetings/${meetingId}`, updateData);
                }
            }

            // ✅ /culture/live로 이동
            const url = new URL('/culture/live', window.location.origin);
            url.searchParams.set('id', meetingId);
            url.searchParams.set('title', meetingTitle);
            url.searchParams.set('invite', inviteCode);

            window.open(url.toString(), '_blank', 'noopener,noreferrer');
        } catch (error) {
            console.error('문화 라이브 참가 중 오류:', error);

            // 상태 업데이트 실패해도 그냥 입장은 시켜줌
            const url = new URL('/culture/live', window.location.origin);
            url.searchParams.set('id', meetingId);
            url.searchParams.set('title', meetingTitle);
            url.searchParams.set('invite', inviteCode);

            window.open(url.toString(), '_blank', 'noopener,noreferrer');

            Swal.fire({
                icon: 'warning',
                title: '상태 업데이트 실패',
                text: '라이브 상태 업데이트에 실패했지만, 라이브에는 참여할 수 있습니다.',
                timer: 2000,
                showConfirmButton: false,
            });
        }
    };

    // 랜덤 시청자 수 생성 (실제로는 API에서 받아야 함)
    const getViewerCount = () => Math.floor(Math.random() * 2) + 1;

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
                        onClick={() => navigate('/culture/videos')}
                    >
                        전체보기
                        <span className="ml-1 group-hover:translate-x-1 transition-transform">→</span>
                    </button>
                </div>

                {/* Live Cards - GRID */}
                <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8">
                    {meetings.slice(0, 3).map((meeting, index) => (
                        <LiveCard
                            key={meeting.meetings_id}
                            meeting={meeting}
                            viewerCount={getViewerCount()}
                            language={formatLanguage(meeting.default_lang)}
                            index={index}
                            // ✅ 클릭 시 라이브 참가 함수 연결
                            onJoin={() => handleJoinCultureMeeting(meeting.meetings_id, meeting.title, meeting.invite_code, meeting.status)}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
