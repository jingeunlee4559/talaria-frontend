// src/pages/Culture/CultureVideos.jsx
import React, { useState, useEffect, useMemo, useContext, useCallback } from 'react';
import { LogIn, Search, SlidersHorizontal, Filter, X, Sparkles } from 'lucide-react';
import LiveCard from '../../components/Culture/CultureHome/LiveCard';
import Pagination from '../../components/Culture/Pagination';
import api from '../../axios';
import { UserContext } from '../../contexts/UserContext';
import Swal from 'sweetalert2';

// 비밀번호 검증 URL 빌더 (나중에 엔드포인트 바뀌면 여기만 수정)
const buildPasswordCheckUrl = (userId, meetingId) => `/api/users/${userId}/meetings/${meetingId}/check-password`;

const CultureVideos = () => {
    const { user } = useContext(UserContext);

    const [meetings, setMeetings] = useState([]);
    const [loading, setLoading] = useState(true);

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedSort, setSelectedSort] = useState('인기순');
    const [selectedLanguage, setSelectedLanguage] = useState('모든 언어');

    const [activeCategories, setActiveCategories] = useState([]);
    const [showFilters, setShowFilters] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);
    const [categories, setCategories] = useState(['전체']);

    const [allTags, setAllTags] = useState([]);

    const ITEMS_PER_PAGE = 6;

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

    const sortOptions = ['인기순', '최신순', '조회순'];
    const languageOptions = ['모든 언어', 'KR → EN', 'EN → KR', 'JP → KR', 'KR'];

    // ==========================
    // 태그 전체 목록
    // ==========================
    const fetchAllTags = useCallback(async () => {
        try {
            const response = await api.get('/api/tags');
            const tags = response.data || [];

            const sortedTags = tags.filter((tag) => tag.is_active).sort((a, b) => a.display_order - b.display_order);

            setAllTags(sortedTags);

            const categoryNames = sortedTags.map((tag) => tag.tag_name);
            setCategories(['전체', ...categoryNames]);

            console.log('Fetched tags from API:', sortedTags);
            return sortedTags;
        } catch (error) {
            console.error('Failed to fetch tags:', error);
            setCategories(['전체', 'K-밈', '해외밈', '음악', '게임', '먹방', '여행', '브이로그', '토크', '공부']);
            return [];
        }
    }, []);

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

    // ==========================
    // 미팅별 태그 가져오기
    // ==========================
    const fetchTagsForMeeting = async (userId, meetingId) => {
        try {
            const response = await api.get(`/api/users/${userId}/meetings/${meetingId}/tags`);
            return response.data.map((tag) => tag.tag_name);
        } catch (error) {
            console.error(`Failed to fetch tags for meeting ${meetingId}:`, error);
            return [];
        }
    };

    // ==========================
    // 🔥 리스트 갱신 함수 분리 (재사용 가능)
    // ==========================
    const fetchMeetingsData = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get('/api/meetings/by-mode', {
                params: {
                    mode: 'C',
                    page: 0,
                    size: 100,
                },
            });

            const meetingItems = response.data.items || [];

            const meetingsWithTags = await Promise.all(
                meetingItems.map(async (meeting) => {
                    const userIdForTags = user?.userId || meeting.host_id;
                    const tags = await fetchTagsForMeeting(userIdForTags, meeting.meetings_id);
                    return {
                        ...meeting,
                        tags,
                    };
                }),
            );

            setMeetings(meetingsWithTags);
            console.log('✅ Meetings updated:', meetingsWithTags);
        } catch (error) {
            console.error('Failed to fetch meetings:', error);
        } finally {
            setLoading(false);
        }
    }, [user]);

    // 태그 목록 불러오기
    useEffect(() => {
        fetchAllTags();
    }, [fetchAllTags]);

    // ==========================
    // 문화 모드 회의 리스트 + 태그 (최초 로드)
    // ==========================
    useEffect(() => {
        fetchMeetingsData();
    }, [fetchMeetingsData]);

    // ==========================
    // 🔥 PostMessage 리스너 - 자식 창에서 메시지 수신
    // ==========================
    useEffect(() => {
        const handleMessage = (event) => {
            // 보안: 같은 origin에서 온 메시지만 처리
            if (event.origin !== window.location.origin) {
                return;
            }

            const { type, meetingId } = event.data;

            if (type === 'MEETING_ENDED') {
                console.log('🔴 라이브 종료 알림 받음:', meetingId);

                // 토스트 알림
                Swal.fire({
                    icon: 'info',
                    title: '라이브가 종료되었습니다',
                    text: '목록이 자동으로 업데이트됩니다.',
                    timer: 2000,
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                });

                // 🔥 리스트 새로고침
                fetchMeetingsData();
            } else if (type === 'USER_LEFT') {
                console.log('👋 사용자가 라이브에서 나갔습니다:', meetingId);
                // 필요시 리스트 업데이트
                fetchMeetingsData();
            }
        };

        window.addEventListener('message', handleMessage);

        return () => {
            window.removeEventListener('message', handleMessage);
        };
    }, [fetchMeetingsData]);

    // ==========================
    // 🔥 Visibility API - 탭 활성화 시 리스트 갱신
    // ==========================
    useEffect(() => {
        const handleVisibilityChange = () => {
            // 탭이 다시 활성화되었을 때 리스트 갱신
            if (!document.hidden) {
                console.log('👀 탭 활성화 - 리스트 갱신');
                fetchMeetingsData();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [fetchMeetingsData]);

    // ==========================
    // 비공개 비밀번호 모달 상태
    // ==========================
    const [passwordModal, setPasswordModal] = useState({
        open: false,
        meetingId: null,
        meetingTitle: '',
        inviteCode: '',
        status: '',
        cultureDesc: '',
        hostId: null,
    });
    const [passwordInput, setPasswordInput] = useState('');
    const [passwordChecking, setPasswordChecking] = useState(false);
    const [passwordError, setPasswordError] = useState('');

    const openPasswordModal = (meeting) => {
        setPasswordModal({
            open: true,
            meetingId: meeting.meetings_id,
            meetingTitle: meeting.title,
            inviteCode: meeting.invite_code,
            status: meeting.status,
            cultureDesc: meeting.cultureDesc || meeting.description || meeting.cultureDescShort || '',
            hostId: meeting.host_id ?? null,
        });
        setPasswordInput('');
        setPasswordError('');
    };

    const closePasswordModal = () => {
        setPasswordModal((prev) => ({ ...prev, open: false }));
        setPasswordInput('');
        setPasswordError('');
    };

    // ==========================
    // 실제 라이브 방 입장 공통 로직
    // ==========================
    const openCultureLiveRoom = useCallback(
        async (meeting) => {
            const meetingId = meeting.meetings_id;
            const meetingTitle = meeting.title;
            const inviteCode = meeting.invite_code;
            const rawStatus = meeting.status;

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

                // 예정 상태에서 호스트가 들어가는 경우: 상태를 ONGOING으로 업데이트
                if (currentMeeting && currentMeeting.status === '예정' && currentMeeting.user_role === 'HOST' && user?.userId) {
                    const updateData = {
                        title: meetingTitle,
                        status: 'ONGOING',
                        inviteCode,
                        scheduledAt: new Date().toISOString(),
                    };

                    try {
                        await api.patch(`/api/users/${user.userId}/meetings/${meetingId}`, updateData);
                    } catch (e) {
                        console.warn('라이브 상태 업데이트 실패(예정→ONGOING):', e);
                    }
                }

                const url = new URL('/culture/live', window.location.origin);
                url.searchParams.set('id', meetingId);
                url.searchParams.set('title', meetingTitle);
                url.searchParams.set('invite', inviteCode);

                window.open(url.toString(), '_blank', 'noopener,noreferrer');
            } catch (error) {
                console.error('문화 라이브 참가 중 오류:', error);

                const fallbackUrl = new URL('/culture/live', window.location.origin);
                fallbackUrl.searchParams.set('id', meeting.meetings_id);
                fallbackUrl.searchParams.set('title', meeting.title);
                fallbackUrl.searchParams.set('invite', meeting.invite_code);
                window.open(fallbackUrl.toString(), '_blank', 'noopener,noreferrer');

                Swal.fire({
                    icon: 'warning',
                    title: '상태 업데이트 실패',
                    text: '라이브 상태 업데이트에 실패했지만, 라이브에는 참여할 수 있습니다.',
                    timer: 2000,
                    showConfirmButton: false,
                });
            }
        },
        [meetings, user],
    );

    // ==========================
    // 카드 클릭 시 진입 로직
    //  - 비공개 & 호스트가 아니면 → 비밀번호 모달
    //  - 그 외 → 바로 openCultureLiveRoom
    // ==========================
    const handleJoinCultureMeeting = async (meeting) => {
        const isPrivate = meeting.isPrivate ?? meeting.is_private ?? false;

        // 호스트는 비밀번호 없이 바로 입장
        const isHost = user?.userId && meeting.host_id === user.userId;

        if (isPrivate && !isHost) {
            openPasswordModal(meeting);
            return;
        }

        await openCultureLiveRoom(meeting);
    };

    // ==========================
    // 비밀번호 확인 + 입장
    // ==========================
    const handlePasswordConfirm = async () => {
        if (!passwordModal.meetingId) return;

        if (!passwordInput.trim()) {
            setPasswordError('비밀번호를 입력해주세요.');
            return;
        }

        setPasswordChecking(true);
        setPasswordError('');

        try {
            const apiUserId = user?.userId || passwordModal.hostId || 0; // 최소한 path를 맞추기 위해 사용

            const url = buildPasswordCheckUrl(apiUserId, passwordModal.meetingId);
            const res = await api.post(url, { password: passwordInput.trim() });

            const isValid = !!res.data?.valid;

            if (!isValid) {
                setPasswordError('비밀번호가 올바르지 않습니다.');
                return;
            }

            // 비밀번호 통과 → 모달 닫고 입장
            closePasswordModal();

            const targetMeeting = meetings.find((m) => m.meetings_id === passwordModal.meetingId) || null;

            if (targetMeeting) {
                await openCultureLiveRoom(targetMeeting);
            } else {
                // 혹시 못 찾으면 최소한 meetingId/제목만 들고 입장
                await openCultureLiveRoom({
                    meetings_id: passwordModal.meetingId,
                    title: passwordModal.meetingTitle,
                    invite_code: passwordModal.inviteCode,
                    status: passwordModal.status,
                });
            }
        } catch (error) {
            console.error('비밀번호 검증 중 오류:', error);
            Swal.fire({
                icon: 'error',
                title: '입장 실패',
                text: '비밀번호 확인 중 오류가 발생했습니다. 다시 시도해주세요.',
                confirmButtonText: '확인',
            });
        } finally {
            setPasswordChecking(false);
        }
    };

    // ==========================
    // 필터링 / 정렬
    // ==========================
    const filteredMeetings = useMemo(() => {
        let filtered = [...meetings];

        // status가 'ENDED'인 미팅 제외
        filtered = filtered.filter((m) => m.status !== 'ENDED');

        // 검색
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter((m) => m.title.toLowerCase().includes(query) || (m.host_name || '').toLowerCase().includes(query));
        }

        // 카테고리(태그) 필터
        if (activeCategories.length > 0) {
            filtered = filtered.filter((m) => {
                return activeCategories.some((category) => m.tags && m.tags.includes(category));
            });
        }

        // 정렬
        if (selectedSort === '최신순') {
            filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        } else if (selectedSort === '조회순') {
            filtered.sort((a, b) => (b.participants || 0) - (a.participants || 0));
        } else if (selectedSort === '인기순') {
            // 인기순 기준이 따로 없다면 participants 기준으로 정렬
            filtered.sort((a, b) => (b.participants || 0) - (a.participants || 0));
        }

        // 언어 필터 (현재는 UI만, 필요시 조건 추가)
        // if (selectedLanguage !== '모든 언어') { ... }

        return filtered;
    }, [meetings, searchQuery, activeCategories, selectedSort]);

    const totalPages = Math.ceil(filteredMeetings.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const currentMeetings = filteredMeetings.slice(startIndex, endIndex);

    useEffect(() => {
        setCurrentPage(1);
    }, [activeCategories, searchQuery, selectedSort, selectedLanguage]);

    const resetFilters = () => {
        setSearchQuery('');
        setActiveCategories([]);
        setSelectedSort('인기순');
        setSelectedLanguage('모든 언어');
        setCurrentPage(1);
    };

    const activeFiltersCount = [searchQuery !== '', activeCategories.length > 0, selectedSort !== '인기순', selectedLanguage !== '모든 언어'].filter(Boolean).length;

    // 태그의 color_code 가져오기
    const getTagColorCode = (tagName) => {
        const tag = allTags.find((t) => t.tag_name === tagName);
        return tag?.color_code || '#9333EA';
    };

    // hex to rgb 변환 함수
    const hexToRgb = (hex) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result
            ? {
                  r: parseInt(result[1], 16),
                  g: parseInt(result[2], 16),
                  b: parseInt(result[3], 16),
              }
            : { r: 147, g: 51, b: 234 };
    };

    // 아이콘이 없는 카테고리는 기본 이모지 사용
    const getCategoryIcon = (category) => {
        return categoryIcons[category] || '🏷️';
    };

    // ==========================
    // JSX
    // ==========================
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <header className="mb-8">
                    <h1 className="text-4xl font-extrabold text-gray-900 mb-2">영상 탐색</h1>
                    <p className="text-gray-600 text-lg">다양한 문화 콘텐츠를 탐색하고 즐겨보세요</p>
                </header>

                {/* 검색 & 필터 카드 */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8 transition-all hover:shadow-xl">
                    {/* 검색창 */}
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

                    {/* 카테고리 */}
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

                        {/* 카테고리 버튼들 */}
                        <div className="flex flex-wrap gap-2.5">
                            {categories.map((category) => {
                                const IconComponent = getCategoryIcon(category);
                                const isActive = category === '전체' ? activeCategories.length === 0 : activeCategories.includes(category);
                                const isEmoji = typeof IconComponent === 'string';

                                const colorCode = category === '전체' ? '#9333EA' : getTagColorCode(category);
                                const rgb = hexToRgb(colorCode);

                                return (
                                    <button
                                        key={category}
                                        onClick={() => toggleCategory(category)}
                                        style={
                                            isActive
                                                ? {
                                                      backgroundColor: colorCode,
                                                      boxShadow: `0 8px 20px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.4)`,
                                                  }
                                                : {}
                                        }
                                        className={`group relative flex-shrink-0 px-4 py-2.5 rounded-xl font-semibold whitespace-nowrap transition-all duration-300 transform ${
                                            isActive ? 'text-white scale-105' : 'bg-white text-gray-700 hover:bg-gray-50 hover:shadow-md hover:scale-105 border-2 border-gray-200'
                                        }`}
                                    >
                                        {isActive && (
                                            <div
                                                style={{
                                                    backgroundColor: colorCode,
                                                    opacity: 0.4,
                                                }}
                                                className="absolute inset-0 rounded-xl blur-lg -z-10 animate-pulse"
                                            ></div>
                                        )}
                                        <div className="flex items-center gap-2">
                                            {isEmoji ? <span className="text-base">{IconComponent}</span> : <IconComponent className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-500'}`} />}
                                            <span className="text-sm">{category}</span>
                                        </div>
                                        {isActive && <div className="absolute -bottom-1.5 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white rounded-full shadow-md"></div>}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* 정렬/언어 필터 */}
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

                        <div className={`grid gap-4 transition-all duration-300 ${showFilters ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                            <div className="overflow-hidden">
                                <div className="flex flex-wrap gap-3">
                                    {/* 정렬 기준 */}
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

                                    {/* 언어 */}
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

                {/* 결과 카운트 */}
                {!loading && filteredMeetings.length > 0 && (
                    <div className="mb-4 flex items-center justify-between">
                        <p className="text-gray-600">
                            총 <span className="font-bold text-pink-600">{filteredMeetings.length}</span>
                            개의 라이브
                        </p>
                        {filteredMeetings.length > ITEMS_PER_PAGE && (
                            <p className="text-sm text-gray-500">
                                {startIndex + 1}-{Math.min(endIndex, filteredMeetings.length)} 표시 중
                            </p>
                        )}
                    </div>
                )}

                {/* 로딩 */}
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

                {/* 카드 리스트 */}
                {!loading && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
                        {currentMeetings.map((meeting, index) => {
                            const isPrivate = meeting.isPrivate ?? meeting.is_private ?? false;

                            return (
                                <LiveCard
                                    key={meeting.meetings_id}
                                    allTags={allTags}
                                    meeting={meeting}
                                    language={meeting.default_lang === 'ko' ? 'KR' : (meeting.default_lang || 'EN').toUpperCase()}
                                    index={index}
                                    isPrivate={isPrivate}
                                    onJoin={() => handleJoinCultureMeeting(meeting)}
                                />
                            );
                        })}
                    </div>
                )}

                {/* 페이지네이션 */}
                {!loading && filteredMeetings.length > ITEMS_PER_PAGE && <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />}

                {/* 검색 결과 없음 */}
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

            {/* 비공개방 비밀번호 모달 */}
            {passwordModal.open && (
                <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 sm:p-7 relative mx-4">
                        <button onClick={closePasswordModal} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors">
                            <X className="w-5 h-5" />
                        </button>

                        <div className="mb-4">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 text-purple-600 text-xs font-semibold mb-2">
                                <span>🔒 비공개 라이브</span>
                            </div>
                            <h2 className="text-xl font-bold text-gray-900 mb-1">입장 비밀번호를 입력해주세요</h2>
                            <p className="text-sm text-gray-500">
                                <span className="font-semibold text-gray-800">{passwordModal.meetingTitle}</span> 방은 비밀번호가 설정된 비공개 라이브입니다.
                            </p>
                        </div>

                        <div className="mb-4">
                            <label className="block text-xs font-semibold text-gray-700 mb-2">비밀번호</label>
                            <input
                                type="password"
                                value={passwordInput}
                                onChange={(e) => setPasswordInput(e.target.value)}
                                placeholder="방 입장 비밀번호를 입력하세요"
                                className="w-full px-4 py-3 text-sm border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-300 focus:border-purple-500 outline-none transition-all"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handlePasswordConfirm();
                                    }
                                }}
                            />
                            {passwordError && <p className="text-xs text-red-500 mt-2">{passwordError}</p>}
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={handlePasswordConfirm}
                                disabled={passwordChecking}
                                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {passwordChecking ? (
                                    <>
                                        <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                                        </svg>
                                        확인 중...
                                    </>
                                ) : (
                                    <>
                                        <LogIn className="w-4 h-4" />
                                        입장하기
                                    </>
                                )}
                            </button>
                            <button onClick={closePasswordModal} className="px-4 py-3 rounded-2xl border-2 border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-all">
                                취소
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
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
