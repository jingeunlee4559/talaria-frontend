// src/components/Culture/CultureHome/HotLiveSection.jsx
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
    const [allTags, setAllTags] = useState([]); // 전체 태그 정보

    useEffect(() => {
        fetchAllTags();
        fetchLiveMeetings();
    }, []);

    // ✅ 전체 태그 목록을 가져오는 함수
    const fetchAllTags = async () => {
        try {
            const response = await api.get('/api/tags');
            const tags = response.data || [];

            const sortedTags = tags.filter((tag) => tag.is_active).sort((a, b) => a.display_order - b.display_order);

            setAllTags(sortedTags);
            console.log('Fetched all tags:', sortedTags);
        } catch (error) {
            console.error('Failed to fetch tags:', error);
        }
    };

    // ✅ 각 미팅의 태그를 API에서 가져오는 함수
    const fetchTagsForMeeting = async (userId, meetingId) => {
        try {
            const response = await api.get(`/api/users/${userId}/meetings/${meetingId}/tags`);
            return response.data.map((tag) => tag.tag_name);
        } catch (error) {
            console.error(`Failed to fetch tags for meeting ${meetingId}:`, error);
            return [];
        }
    };

    const fetchLiveMeetings = async () => {
        try {
            const response = await api.get('/api/meetings/by-mode', {
                params: {
                    mode: 'C',
                    page: 0,
                    size: 20,
                },
            });

            const meetingItems = response.data.items || [];

            const meetingsWithTags = await Promise.all(
                meetingItems.map(async (meeting) => {
                    const userId = user?.userId || meeting.host_id;
                    const tags = await fetchTagsForMeeting(userId, meeting.meetings_id);

                    return {
                        ...meeting,
                        tags: tags,
                    };
                }),
            );

            setMeetings(meetingsWithTags);
            console.log('Hot Live meetings with tags:', meetingsWithTags);
            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch meetings:', error);
            console.error('Error response:', error.response?.data);
            console.error('Error status:', error.response?.status);
            setLoading(false);
        }
    };

    const handleJoinCultureMeeting = async (meetingId, meetingTitle, inviteCode, rawStatus) => {
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

            const url = new URL('/culture/live', window.location.origin);
            url.searchParams.set('id', meetingId);
            url.searchParams.set('title', meetingTitle);
            url.searchParams.set('invite', inviteCode);

            window.open(url.toString(), '_blank', 'noopener,noreferrer');
        } catch (error) {
            console.error('문화 라이브 참가 중 오류:', error);

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

    const getViewerCount = () => Math.floor(Math.random() * 2) + 1;

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
                    <div className="flex justify-center items-center py-20">
                        <div className="relative">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
                            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                                <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full opacity-20"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <h2 className="flex items-center gap-2 sm:gap-3 text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">
                            <span className="text-3xl sm:text-4xl">🔥</span>
                            <span>지금 핫한 라이브</span>
                        </h2>
                        <p className="text-gray-600 mt-2 text-sm sm:text-base">실시간으로 진행 중인 인기 스트리밍이에요</p>
                    </div>

                    <button
                        className="w-full sm:w-auto inline-flex items-center justify-center text-sm sm:text-base font-semibold text-pink-600 hover:text-pink-700 bg-pink-50 hover:bg-pink-100 border border-pink-100 rounded-full px-4 py-2 transition-colors group"
                        onClick={() => navigate('/culture/videos')}
                    >
                        전체보기
                        <span className="ml-1 group-hover:translate-x-1 transition-transform">→</span>
                    </button>
                </div>

                <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-6 lg:gap-7">
                    {meetings.slice(0, 3).map((meeting, index) => (
                        <LiveCard
                            key={meeting.meetings_id}
                            meeting={meeting}
                            viewerCount={getViewerCount()}
                            language={formatLanguage(meeting.default_lang)}
                            index={index}
                            allTags={allTags}
                            onJoin={() => handleJoinCultureMeeting(meeting.meetings_id, meeting.title, meeting.invite_code, meeting.status)}
                        />
                    ))}
                </div>

                {meetings.length === 0 && (
                    <div className="text-center py-20">
                        <div className="text-gray-400 mb-4">
                            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                                />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">진행 중인 라이브가 없습니다</h3>
                        <p className="text-gray-500">새로운 라이브가 곧 시작될 예정입니다</p>
                    </div>
                )}
            </div>
        </div>
    );
}
