import React, { useState } from 'react';
import { Search, UserPlus, Radio, User, X, Check, Heart, Sparkles, Users, MessageCircle } from 'lucide-react';
import Swal from 'sweetalert2';

const FriendsPage = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('myFriends');
    const [showFriendRequestModal, setShowFriendRequestModal] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [showAddFriendModal, setShowAddFriendModal] = useState(false);
    const [selectedFriend, setSelectedFriend] = useState(null);
    const [newFriendName, setNewFriendName] = useState('');

    const [friends, setFriends] = useState([
        {
            id: 1,
            name: '밀마스터',
            avatar: '🎭',
            status: 'online',
            isLive: true,
            viewers: 2847,
            tags: ['#K-팝', '#리액션'],
            bgColor: 'from-purple-400 to-pink-400',
            followers: 12500,
            bio: 'K-팝 리액션 콘텐츠를 주로 시청해요',
        },
        {
            id: 2,
            name: '글로벌민',
            avatar: '🌍',
            status: 'online',
            isLive: false,
            tags: ['#해외팬', '#영국'],
            bgColor: 'from-blue-400 to-cyan-400',
            followers: 8300,
            bio: '해외팬 관점의 문화 콘텐츠',
        },
        {
            id: 3,
            name: '밍여행자',
            avatar: '✈️',
            status: 'online',
            isLive: true,
            viewers: 987,
            tags: ['#일본', '#문화'],
            bgColor: 'from-pink-400 to-rose-400',
            followers: 5600,
            bio: '여행과 문화 탐방',
        },
        {
            id: 4,
            name: '뮤직러버',
            avatar: '🎵',
            status: 'online',
            isLive: false,
            tags: ['#음악', '#공연'],
            bgColor: 'from-green-400 to-emerald-400',
            followers: 15200,
            bio: '음악과 공연 리뷰',
        },
        {
            id: 5,
            name: '아트크리에이터',
            avatar: '🎨',
            status: 'offline',
            isLive: false,
            tags: ['#미술', '#전시'],
            bgColor: 'from-amber-400 to-orange-400',
            followers: 9800,
            bio: '미술 전시 큐레이션',
        },
    ]);

    const [friendRequests, setFriendRequests] = useState([
        {
            id: 101,
            name: 'K드라마밍',
            avatar: '📺',
            followers: 12500,
            tags: ['#K-드라마', '#리액션'],
            bgColor: 'from-purple-400 to-pink-400',
            mutualFriends: 3,
        },
        {
            id: 102,
            name: '밍교육자',
            avatar: '🎓',
            followers: 8300,
            tags: ['#교육', '#중어'],
            bgColor: 'from-blue-400 to-cyan-400',
            mutualFriends: 5,
        },
    ]);

    const [recommendedFriends] = useState([
        {
            id: 201,
            name: 'K드라마밍',
            avatar: '📺',
            followers: 12500,
            tags: ['#K-드라마', '#리액션'],
            bgColor: 'from-purple-400 to-pink-400',
            mutualFriends: 3,
            reason: '자주 보는 태그 기반 추천',
        },
        {
            id: 202,
            name: '밍교육자',
            avatar: '🎓',
            followers: 8300,
            tags: ['#교육', '#중어'],
            bgColor: 'from-blue-400 to-cyan-400',
            mutualFriends: 5,
            reason: '해외 문화 콘텐츠 관심',
        },
        {
            id: 203,
            name: '푸드투어',
            avatar: '🍜',
            followers: 18900,
            tags: ['#음식', '#여행'],
            bgColor: 'from-orange-400 to-red-400',
            mutualFriends: 7,
            reason: '여행 콘텐츠 선호',
        },
        {
            id: 204,
            name: '게임스트리머',
            avatar: '🎮',
            followers: 25600,
            tags: ['#게임', '#스트리밍'],
            bgColor: 'from-indigo-400 to-purple-400',
            mutualFriends: 2,
            reason: '라이브 콘텐츠 관심',
        },
    ]);

    const filteredFriends =
        activeTab === 'myFriends'
            ? friends.filter((friend) => friend.name.toLowerCase().includes(searchQuery.toLowerCase()))
            : recommendedFriends.filter((friend) => friend.name.toLowerCase().includes(searchQuery.toLowerCase()));

    const handleAddFriend = () => {
        if (!newFriendName.trim()) {
            Swal.fire({
                icon: 'warning',
                title: '닉네임을 입력해주세요',
                confirmButtonColor: '#8b5cf6',
            });
            return;
        }

        Swal.fire({
            icon: 'success',
            title: '친구 요청 완료',
            text: `${newFriendName}님에게 친구 요청을 보냈습니다`,
            confirmButtonColor: '#8b5cf6',
            timer: 2000,
        });
        setNewFriendName('');
        setShowAddFriendModal(false);
    };

    const handleWatchLive = (friend) => {
        Swal.fire({
            icon: 'info',
            title: `${friend.name}님의 라이브`,
            text: '라이브 방송으로 이동합니다',
            timer: 1500,
            showConfirmButton: false,
        });
    };

    const handleViewProfile = (friend) => {
        setSelectedFriend(friend);
        setShowProfileModal(true);
    };

    const handleAcceptRequest = (requestId) => {
        setFriendRequests(friendRequests.filter((req) => req.id !== requestId));
        Swal.fire({
            icon: 'success',
            title: '친구 추가 완료',
            text: '새로운 친구가 추가되었습니다',
            confirmButtonColor: '#8b5cf6',
            timer: 2000,
        });
    };

    const handleRejectRequest = (requestId) => {
        setFriendRequests(friendRequests.filter((req) => req.id !== requestId));
        Swal.fire({
            icon: 'info',
            title: '요청 거절',
            text: '친구 요청을 거절했습니다',
            confirmButtonColor: '#6b7280',
            timer: 2000,
        });
    };

    const handleSendFriendRequest = (friendId) => {
        Swal.fire({
            icon: 'success',
            title: '친구 요청 완료',
            text: '친구 요청을 보냈습니다',
            confirmButtonColor: '#8b5cf6',
            timer: 2000,
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
            <div className="max-w-5xl mx-auto">
                {/* 헤더 */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">친구</h1>
                            <p className="text-gray-600">함께 문화를 즐길 친구들을 만나보세요</p>
                        </div>
                        <button
                            onClick={() => setShowFriendRequestModal(true)}
                            className="relative flex items-center gap-2 px-4 py-2.5 bg-violet-600 text-white rounded-xl font-semibold hover:bg-violet-700 transition-colors shadow-sm"
                        >
                            <Users size={18} />
                            <span className="hidden sm:inline">친구 요청</span>
                            {friendRequests.length > 0 && (
                                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">{friendRequests.length}</span>
                            )}
                        </button>
                    </div>

                    {/* 검색바 */}
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="친구 검색..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-shadow"
                        />
                    </div>
                </div>

                {/* 탭 */}
                <div className="flex gap-2 mb-6">
                    <button
                        onClick={() => setActiveTab('myFriends')}
                        className={`px-5 py-2.5 rounded-lg font-semibold transition-all ${
                            activeTab === 'myFriends' ? 'bg-violet-600 text-white shadow-sm' : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                        }`}
                    >
                        내 친구
                    </button>
                    <button
                        onClick={() => setActiveTab('recommended')}
                        className={`px-5 py-2.5 rounded-lg font-semibold transition-all ${
                            activeTab === 'recommended' ? 'bg-violet-600 text-white shadow-sm' : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                        }`}
                    >
                        추천 친구
                    </button>
                </div>

                {/* 추천 안내 */}
                {activeTab === 'recommended' && (
                    <div className="mb-6 p-4 bg-violet-50 border border-violet-100 rounded-xl">
                        <p className="text-sm text-violet-900 font-medium flex items-center gap-2">
                            <Sparkles size={16} className="text-violet-600" />
                            나의 관심사와 시청 패턴을 기반으로 추천해요
                        </p>
                    </div>
                )}

                {/* 친구 목록 */}
                <div className="space-y-3">
                    {filteredFriends.map((friend) => (
                        <div key={friend.id} className="bg-white rounded-xl p-4 border border-gray-200 hover:border-violet-300 hover:shadow-md transition-all">
                            <div className="flex items-center gap-4">
                                {/* 아바타 */}
                                <div className="relative flex-shrink-0">
                                    <div className={`w-14 h-14 bg-gradient-to-br ${friend.bgColor} rounded-xl flex items-center justify-center text-2xl`}>{friend.avatar}</div>
                                    {activeTab === 'myFriends' && (
                                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${friend.status === 'online' ? 'bg-green-500' : 'bg-gray-400'}`} />
                                    )}
                                </div>

                                {/* 정보 */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1.5">
                                        <h3 className="text-lg font-bold text-gray-900 truncate">{friend.name}</h3>
                                        {friend.isLive && (
                                            <>
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-500 text-white text-xs font-semibold rounded-md">
                                                    <Radio size={10} />
                                                    LIVE
                                                </span>
                                                <span className="text-sm text-gray-500 flex items-center gap-1">
                                                    <User size={14} />
                                                    {friend.viewers.toLocaleString()}
                                                </span>
                                            </>
                                        )}
                                    </div>
                                    {friend.reason && <p className="text-xs text-violet-600 mb-1.5 font-medium">{friend.reason}</p>}
                                    <div className="flex flex-wrap gap-1.5">
                                        {friend.tags.map((tag, index) => (
                                            <span key={index} className="px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-md">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* 버튼 */}
                                <div className="flex gap-2 flex-shrink-0">
                                    {activeTab === 'myFriends' ? (
                                        <>
                                            {friend.isLive && (
                                                <button
                                                    onClick={() => handleWatchLive(friend)}
                                                    className="px-4 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors text-sm flex items-center gap-1.5"
                                                >
                                                    <Radio size={14} />
                                                    <span className="hidden sm:inline">시청</span>
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleViewProfile(friend)}
                                                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors text-sm"
                                            >
                                                프로필
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button
                                                onClick={() => handleSendFriendRequest(friend.id)}
                                                className="px-4 py-2 bg-violet-600 text-white rounded-lg font-semibold hover:bg-violet-700 transition-colors text-sm flex items-center gap-1.5"
                                            >
                                                <UserPlus size={14} />
                                                추가
                                            </button>
                                            <button
                                                onClick={() => handleViewProfile(friend)}
                                                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors text-sm"
                                            >
                                                프로필
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* 검색 결과 없음 */}
                {filteredFriends.length === 0 && (
                    <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
                        <div className="text-6xl mb-4">🔍</div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">검색 결과가 없습니다</h3>
                        <p className="text-gray-500">다른 검색어를 입력해보세요</p>
                    </div>
                )}

                {/* 플로팅 버튼 */}
                <button
                    onClick={() => setShowAddFriendModal(true)}
                    className="fixed bottom-6 right-6 w-14 h-14 bg-violet-600 text-white rounded-full shadow-lg hover:bg-violet-700 hover:shadow-xl transition-all flex items-center justify-center z-40"
                >
                    <UserPlus size={24} />
                </button>
            </div>

            {/* 친구 추가 모달 */}
            {showAddFriendModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
                        <div className="bg-gradient-to-r from-violet-600 to-purple-600 text-white p-6 rounded-t-2xl">
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-bold flex items-center gap-2">
                                    <UserPlus size={24} />
                                    친구 추가
                                </h2>
                                <button onClick={() => setShowAddFriendModal(false)} className="hover:bg-white/20 p-2 rounded-lg transition-colors">
                                    <X size={20} />
                                </button>
                            </div>
                        </div>
                        <div className="p-6">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">닉네임 또는 ID</label>
                            <input
                                type="text"
                                value={newFriendName}
                                onChange={(e) => setNewFriendName(e.target.value)}
                                placeholder="예) MilMaster123"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent mb-6"
                            />
                            <div className="flex gap-3">
                                <button onClick={handleAddFriend} className="flex-1 py-3 bg-violet-600 text-white rounded-lg font-semibold hover:bg-violet-700 transition-colors">
                                    요청 보내기
                                </button>
                                <button
                                    onClick={() => setShowAddFriendModal(false)}
                                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                                >
                                    취소
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 친구 요청 모달 */}
            {showFriendRequestModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
                        <div className="bg-gradient-to-r from-violet-600 to-purple-600 text-white p-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-bold flex items-center gap-2">
                                    <Users size={24} />
                                    친구 요청
                                </h2>
                                <button onClick={() => setShowFriendRequestModal(false)} className="hover:bg-white/20 p-2 rounded-lg transition-colors">
                                    <X size={20} />
                                </button>
                            </div>
                        </div>
                        <div className="p-6 overflow-y-auto">
                            {friendRequests.length === 0 ? (
                                <div className="text-center py-12">
                                    <div className="text-6xl mb-4">📭</div>
                                    <p className="text-gray-600 font-medium">받은 친구 요청이 없습니다</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {friendRequests.map((request) => (
                                        <div key={request.id} className="p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-violet-300 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-14 h-14 bg-gradient-to-br ${request.bgColor} rounded-xl flex items-center justify-center text-2xl flex-shrink-0`}>
                                                    {request.avatar}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-lg font-bold text-gray-900 mb-1">{request.name}</p>
                                                    <p className="text-sm text-gray-600 mb-2">
                                                        팔로워 {request.followers.toLocaleString()}명 · 공통 친구 {request.mutualFriends}명
                                                    </p>
                                                    <div className="flex gap-1.5 flex-wrap">
                                                        {request.tags.map((tag, idx) => (
                                                            <span key={idx} className="px-2.5 py-1 bg-white text-gray-700 text-xs font-medium rounded-md">
                                                                {tag}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="flex gap-2 flex-shrink-0">
                                                    <button
                                                        onClick={() => handleAcceptRequest(request.id)}
                                                        className="px-4 py-2 bg-violet-600 text-white rounded-lg font-semibold hover:bg-violet-700 transition-colors text-sm flex items-center gap-1.5"
                                                    >
                                                        <Check size={14} />
                                                        수락
                                                    </button>
                                                    <button
                                                        onClick={() => handleRejectRequest(request.id)}
                                                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors text-sm"
                                                    >
                                                        거절
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* 프로필 모달 */}
            {showProfileModal && selectedFriend && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden">
                        <div className={`bg-gradient-to-br ${selectedFriend.bgColor} p-8 text-center relative`}>
                            <button onClick={() => setShowProfileModal(false)} className="absolute top-4 right-4 hover:bg-white/20 p-2 rounded-lg transition-colors text-white">
                                <X size={20} />
                            </button>
                            <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-4xl mx-auto mb-4 border-2 border-white/30">
                                {selectedFriend.avatar}
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2">{selectedFriend.name}</h2>
                            <p className="text-white/90 text-sm">{selectedFriend.bio}</p>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="text-center p-4 bg-gray-50 rounded-xl">
                                    <p className="text-2xl font-bold text-gray-900">{selectedFriend.followers?.toLocaleString() || '0'}</p>
                                    <p className="text-sm text-gray-600 mt-1">팔로워</p>
                                </div>
                                <div className="text-center p-4 bg-gray-50 rounded-xl">
                                    <p className="text-lg font-bold text-gray-900">{selectedFriend.status === 'online' ? '🟢 온라인' : '⚫ 오프라인'}</p>
                                    <p className="text-sm text-gray-600 mt-1">상태</p>
                                </div>
                            </div>
                            <div className="mb-6">
                                <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                                    <Heart size={16} className="text-red-500" />
                                    관심 태그
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {selectedFriend.tags.map((tag, index) => (
                                        <span key={index} className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg font-medium text-sm">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div className="flex gap-3">
                                {selectedFriend.isLive && (
                                    <button
                                        onClick={() => {
                                            handleWatchLive(selectedFriend);
                                            setShowProfileModal(false);
                                        }}
                                        className="flex-1 py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Radio size={18} />
                                        라이브 시청
                                    </button>
                                )}
                                <button
                                    onClick={() => setShowProfileModal(false)}
                                    className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                                >
                                    <MessageCircle size={18} />
                                    메시지
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FriendsPage;
