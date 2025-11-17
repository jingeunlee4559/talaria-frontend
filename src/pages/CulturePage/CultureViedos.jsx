// src/pages/Culture/CultureVideos.jsx
import React, { useState, useEffect, useMemo, useContext } from 'react';
import { LogIn, Search, SlidersHorizontal, Filter, X, Sparkles, Flame, TrendingUp, Clock } from 'lucide-react';
import LiveCard from '../../components/Culture/CultureHome/LiveCard';
import Pagination from '../../components/Culture/Pagination';
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
    const [activeCategories, setActiveCategories] = useState([]); // 다중 선택을 위한 배열
    const [showFilters, setShowFilters] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);

    const ITEMS_PER_PAGE = 8;

    // 카테고리 아이콘 매핑
    const categoryIcons = {
        전체: Sparkles,
        'K-밈': '🤣',
        해외밈: '😂',
        음악: '🎵',
        게임: '🎮',
        먹방: '🍜',
        여행: '✈️',
        브이로그: '📹',
        토크: '💬',
        공부: '📚',
    };

    const categories = ['전체', 'K-밈', '해외밈', '음악', '게임', '먹방', '여행', '브이로그', '토크', '공부'];
    const sortOptions = ['인기순', '최신순', '조회순'];
    const languageOptions = ['모든 언어', 'KR → EN', 'EN → KR', 'JP → KR', 'KR'];

    // 카테고리 토글 함수
    const toggleCategory = (category) => {
        if (category === '전체') {
            setActiveCategories([]);
        } else {
            setActiveCategories((prev) => {
                if (prev.includes(category)) {
                    return prev.filter((c) => c !== category);
                } else {
                    return [...prev, category];
                }
            });
        }
    };

    // ✅ 문화 모드 회의 리스트 불러오기
    useEffect(() => {
        const fetchMeetings = async () => {
            setLoading(true);
            try {
                const response = await api.get('/api/meetings/by-mode', {
                    params: {
                        mode: 'C',
                        page: 0,
                        size: 100, // 충분한 데이터 가져오기
                    },
                });

                // 각 미팅에 랜덤 태그 추가
                const allTags = ['K-밈', '해외밈', '음악', '게임', '먹방', '여행', '브이로그', '토크', '공부'];
                const meetingsWithTags = (response.data.items || []).map((meeting) => {
                    // 각 미팅마다 2-4개의 랜덤 태그 생성
                    const numTags = Math.floor(Math.random() * 3) + 2; // 2~4개
                    const shuffled = [...allTags].sort(() => Math.random() - 0.5);
                    const tags = shuffled.slice(0, numTags);

                    return {
                        ...meeting,
                        tags: tags,
                    };
                });

                setMeetings(meetingsWithTags);
                console.log(meetingsWithTags);

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

    // 🔎 검색/필터/정렬
    const filteredMeetings = useMemo(() => {
        let filtered = [...meetings];

        if (searchQuery) {
            filtered = filtered.filter((m) => m.title.toLowerCase().includes(searchQuery.toLowerCase()) || m.host_name.toLowerCase().includes(searchQuery.toLowerCase()));
        }

        // 다중 카테고리 필터링 - 태그 기반
        if (activeCategories.length > 0) {
            filtered = filtered.filter((m) => {
                // 선택된 카테고리 중 하나라도 미팅의 태그에 포함되면 true
                return activeCategories.some((category) => m.tags && m.tags.includes(category));
            });
        }

        if (selectedSort === '최신순') {
            filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        } else if (selectedSort === '조회순') {
            filtered.sort((a, b) => (b.participants || 0) - (a.participants || 0));
        }

        return filtered;
    }, [meetings, searchQuery, activeCategories, selectedSort]);

    // 페이지네이션 계산
    const totalPages = Math.ceil(filteredMeetings.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const currentMeetings = filteredMeetings.slice(startIndex, endIndex);

    // 카테고리 변경 시 페이지 초기화
    useEffect(() => {
        setCurrentPage(1);
    }, [activeCategories, searchQuery, selectedSort]);

    // 필터 초기화
    const resetFilters = () => {
        setSearchQuery('');
        setActiveCategories([]);
        setSelectedSort('인기순');
        setSelectedLanguage('모든 언어');
        setCurrentPage(1);
    };

    const activeFiltersCount = [searchQuery !== '', activeCategories.length > 0, selectedSort !== '인기순', selectedLanguage !== '모든 언어'].filter(Boolean).length;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <header className="mb-8">
                    <h1 className="text-4xl font-extrabold text-gray-900 mb-2">영상 탐색</h1>
                    <p className="text-gray-600 text-lg">다양한 문화 콘텐츠를 탐색하고 즐겨보세요</p>
                </header>

                {/* Search and Filters - 개선된 디자인 */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8 transition-all hover:shadow-xl">
                    {/* Search Bar with Enhanced Design */}
                    <div className="relative mb-6">
                        <div className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400">
                            <Search className="w-5 h-5" />
                        </div>
                        <input
                            type="text"
                            placeholder="채널, 크리에이터, 태그 등 검색..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-14 pr-12 py-4 bg-gray-50 border-2 border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-pink-400 focus:bg-white transition-all text-gray-700 placeholder-gray-400"
                        />
                        {searchQuery && (
                            <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        )}
                    </div>

                    {/* Category Chips with Modern Design - 다중 선택 가능 */}
                    <div className="mb-6">
                        <div className="flex items-center gap-3 mb-4 flex-wrap">
                            <div className="flex items-center gap-2">
                                <div className="w-1 h-6 bg-gradient-to-b from-pink-500 to-purple-500 rounded-full"></div>
                                <span className="text-base font-bold text-gray-800">카테고리</span>
                                {activeCategories.length > 0 && (
                                    <span className="px-2.5 py-0.5 bg-gradient-to-r from-pink-500 to-purple-500 text-white text-xs font-bold rounded-full">{activeCategories.length}개 선택</span>
                                )}
                            </div>
                            {activeCategories.length > 0 && (
                                <button
                                    onClick={() => setActiveCategories([])}
                                    className="flex items-center gap-1 px-3 py-1 bg-pink-50 hover:bg-pink-100 text-pink-600 rounded-full text-xs font-semibold transition-all duration-200 hover:shadow-md"
                                >
                                    <X className="w-3 h-3" />
                                    전체 초기화
                                </button>
                            )}
                        </div>
                        {/* 반응형 그리드 카테고리 */}
                        <div className="flex flex-wrap gap-2.5">
                            {categories.map((category) => {
                                const IconComponent = categoryIcons[category];
                                const isActive = category === '전체' ? activeCategories.length === 0 : activeCategories.includes(category);
                                const isEmoji = typeof IconComponent === 'string';

                                return (
                                    <button
                                        key={category}
                                        onClick={() => toggleCategory(category)}
                                        className={`group relative flex-shrink-0 px-4 py-2.5 rounded-xl font-semibold whitespace-nowrap transition-all duration-300 transform ${
                                            isActive
                                                ? 'bg-gradient-to-r from-pink-500 via-purple-500 to-violet-500 text-white shadow-lg shadow-pink-300/50 scale-105'
                                                : 'bg-white text-gray-700 hover:bg-gradient-to-r hover:from-pink-50 hover:to-purple-50 hover:shadow-md hover:scale-105 border-2 border-gray-200 hover:border-pink-300'
                                        }`}
                                    >
                                        {/* 배경 애니메이션 효과 */}
                                        {isActive && <div className="absolute inset-0 bg-gradient-to-r from-pink-400 to-purple-400 rounded-xl blur-lg opacity-40 -z-10 animate-pulse"></div>}

                                        <div className="flex items-center gap-2">
                                            {isEmoji ? (
                                                <span className="text-base">{IconComponent}</span>
                                            ) : (
                                                <IconComponent className={`w-4 h-4 ${isActive ? 'text-white' : 'text-pink-500 group-hover:text-purple-500'}`} />
                                            )}
                                            <span className="text-sm">{category}</span>
                                        </div>

                                        {/* 활성 상태 인디케이터 */}
                                        {isActive && <div className="absolute -bottom-1.5 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white rounded-full shadow-md"></div>}

                                        {/* 체크마크 아이콘 (전체 제외) */}
                                        {isActive && category !== '전체' && (
                                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center shadow-md">
                                                <svg className="w-3 h-3 text-pink-600" fill="currentColor" viewBox="0 0 20 20">
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Filters Section with Toggle */}
                    <div className="border-t border-gray-100 pt-5">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <Filter className="w-4 h-4 text-gray-500" />
                                <span className="text-sm font-semibold text-gray-700">필터 옵션</span>
                                {activeFiltersCount > 0 && <span className="px-2 py-0.5 bg-pink-100 text-pink-600 text-xs font-bold rounded-full">{activeFiltersCount}</span>}
                            </div>
                            <button onClick={() => setShowFilters(!showFilters)} className="text-sm text-gray-500 hover:text-gray-700 font-medium transition-colors">
                                {showFilters ? '숨기기' : '펼치기'}
                            </button>
                        </div>

                        {/* Collapsible Filter Options */}
                        <div className={`grid gap-4 transition-all duration-300 ${showFilters ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                            <div className="overflow-hidden">
                                <div className="flex flex-wrap gap-3">
                                    {/* Sort Dropdown */}
                                    <div className="flex-1 min-w-[200px]">
                                        <label className="block text-xs font-medium text-gray-600 mb-2">정렬 기준</label>
                                        <div className="relative">
                                            <SlidersHorizontal className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <select
                                                value={selectedSort}
                                                onChange={(e) => setSelectedSort(e.target.value)}
                                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-2 border-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-pink-400 cursor-pointer transition-all text-gray-700 appearance-none"
                                            >
                                                {sortOptions.map((option) => (
                                                    <option key={option} value={option}>
                                                        {option}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    {/* Language Dropdown */}
                                    <div className="flex-1 min-w-[200px]">
                                        <label className="block text-xs font-medium text-gray-600 mb-2">언어</label>
                                        <select
                                            value={selectedLanguage}
                                            onChange={(e) => setSelectedLanguage(e.target.value)}
                                            className="w-full px-4 py-2.5 bg-gray-50 border-2 border-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-pink-400 cursor-pointer transition-all text-gray-700 appearance-none"
                                        >
                                            {languageOptions.map((option) => (
                                                <option key={option} value={option}>
                                                    {option}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Reset Button */}
                                    {activeFiltersCount > 0 && (
                                        <div className="flex items-end">
                                            <button
                                                onClick={resetFilters}
                                                className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-all duration-200 hover:shadow-md flex items-center gap-2"
                                            >
                                                <X className="w-4 h-4" />
                                                초기화
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 결과 개수 표시 */}
                {!loading && filteredMeetings.length > 0 && (
                    <div className="mb-4 flex items-center justify-between">
                        <p className="text-gray-600">
                            총 <span className="font-bold text-pink-600">{filteredMeetings.length}</span>개의 라이브
                        </p>
                        {filteredMeetings.length > ITEMS_PER_PAGE && (
                            <p className="text-sm text-gray-500">
                                {startIndex + 1}-{Math.min(endIndex, filteredMeetings.length)} 표시 중
                            </p>
                        )}
                    </div>
                )}

                {/* Loading State */}
                {loading && (
                    <div className="flex justify-center items-center py-20">
                        <div className="relative">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
                            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                                <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full opacity-20"></div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Live Cards Grid */}
                {!loading && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {currentMeetings.map((meeting, index) => (
                            <LiveCard
                                key={meeting.meetings_id}
                                meeting={meeting}
                                language={meeting.default_lang === 'ko' ? 'KR' : meeting.default_lang.toUpperCase()}
                                index={index}
                                onJoin={() => handleJoinCultureMeeting(meeting.meetings_id, meeting.title, meeting.invite_code, meeting.status, meeting.culture_desc)}
                            />
                        ))}
                    </div>
                )}

                {/* Pagination - 8개 이상일 때만 표시 */}
                {!loading && filteredMeetings.length > ITEMS_PER_PAGE && <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />}

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

            <style jsx>{`
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </div>
    );
};

export default CultureVideos;
