// src/pages/Culture/CultureVideos.jsx
import React, { useState, useEffect, useMemo, useContext } from 'react';
import { LogIn, Search, SlidersHorizontal } from 'lucide-react';
import LiveCard from '../../components/Culture/CultureHome/LiveCard';
import api from '../../axios';
import { UserContext } from '../../contexts/UserContext';
import Swal from 'sweetalert2';

const CultureVideos = () => {
    const { user } = useContext(UserContext);

    const [meetings, setMeetings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedSort, setSelectedSort] = useState('인기순');
    const [selectedLanguage, setSelectedLanguage] = useState('모든 언어');
    const [activeCategory, setActiveCategory] = useState('전체');

    const categories = ['전체', 'K-팝', '해외팀', '리액션', '드림상영', '라이브쇼', '일본', '영국', '미국'];
    const sortOptions = ['인기순', '최신순', '조회순'];
    const languageOptions = ['모든 언어', 'KR → EN', 'EN → KR', 'JP → KR', 'KR'];

    // ✅ 문화 모드 회의 리스트 불러오기
    useEffect(() => {
        const fetchMeetings = async () => {
            setLoading(true);
            try {
                const response = await api.get('/api/meetings/by-mode', {
                    params: {
                        mode: 'C',
                        page: 0,
                        size: 20,
                    },
                });
                setMeetings(response.data.items || []);
                console.log(response.data.items);

                setLoading(false);
            } catch (error) {
                console.error('Failed to fetch meetings:', error);
                setLoading(false);
            }
        };

        fetchMeetings();
    }, []);

    // ✅ 공통: 상태/권한 체크 + 문화모드 전용 참가 함수
    const handleJoinCultureMeeting = async (meetingId, meetingTitle, inviteCode, rawStatus) => {
        // 1) 종료된 회의면 막기 (비즈니스와 동일)
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

            // 🔐 게스트 접근 제한 (원하면 비즈니스와 동일하게 적용)
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

            // ✅ 여기서 비즈니스와 갈라짐: /business/meeting → /culture/live
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

    // 🔎 검색/필터/정렬 (기존 로직 그대로)
    const filteredMeetings = useMemo(() => {
        let filtered = [...meetings];

        if (searchQuery) {
            filtered = filtered.filter((m) => m.title.toLowerCase().includes(searchQuery.toLowerCase()) || m.host_name.toLowerCase().includes(searchQuery.toLowerCase()));
        }

        if (activeCategory !== '전체') {
            filtered = filtered.filter((m) => m.title.includes(activeCategory));
        }

        if (selectedSort === '최신순') {
            filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        } else if (selectedSort === '조회순') {
            filtered.sort((a, b) => (b.participants || 0) - (a.participants || 0));
        }

        return filtered;
    }, [meetings, searchQuery, activeCategory, selectedSort]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <header className="mb-8">
                    <h1 className="text-4xl font-extrabold text-gray-900 mb-2">영상 탐색</h1>
                    <p className="text-gray-600 text-lg">다양한 문화 콘텐츠를 탐색하고 즐겨보세요</p>
                </header>

                {/* Search and Filters */}
                <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
                    {/* Search Bar */}
                    <div className="relative mb-6">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="채널, 크리에이터, 태그 등 검색..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                        />
                    </div>

                    {/* Category Tabs */}
                    <div className="flex items-center gap-3 mb-6 overflow-x-auto pb-2">
                        {categories.map((category) => (
                            <button
                                key={category}
                                onClick={() => setActiveCategory(category)}
                                className={`px-5 py-2 rounded-full font-medium whitespace-nowrap transition-all ${
                                    activeCategory === category ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                {category}
                            </button>
                        ))}
                    </div>

                    {/* Sort and Language Filter */}
                    <div className="flex flex-wrap gap-4">
                        <div className="flex items-center gap-2">
                            <SlidersHorizontal className="w-4 h-4 text-gray-500" />
                            <select
                                value={selectedSort}
                                onChange={(e) => setSelectedSort(e.target.value)}
                                className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 cursor-pointer"
                            >
                                {sortOptions.map((option) => (
                                    <option key={option} value={option}>
                                        {option}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <select
                            value={selectedLanguage}
                            onChange={(e) => setSelectedLanguage(e.target.value)}
                            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 cursor-pointer"
                        >
                            {languageOptions.map((option) => (
                                <option key={option} value={option}>
                                    {option}
                                </option>
                            ))}
                        </select>

                        <button className="ml-auto px-6 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors font-medium">필터</button>
                    </div>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
                    </div>
                )}

                {/* Live Cards Grid */}
                {!loading && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredMeetings.map((meeting, index) => (
                            <LiveCard
                                key={meeting.meetings_id}
                                meeting={meeting}
                                language={meeting.default_lang === 'ko' ? 'KR' : meeting.default_lang.toUpperCase()}
                                index={index}
                                // ✅ 여기서 문화 모드 참가 함수 연결
                                onJoin={() => handleJoinCultureMeeting(meeting.meetings_id, meeting.title, meeting.invite_code, meeting.status)}
                            />
                        ))}
                    </div>
                )}

                {/* Empty State */}
                {!loading && filteredMeetings.length === 0 && (
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
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">검색 결과가 없습니다</h3>
                        <p className="text-gray-500">다른 검색어나 필터를 시도해보세요</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CultureVideos;
