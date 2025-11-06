import { useEffect, useState } from 'react';
import { FiX, FiBellOff, FiCalendar, FiVideo, FiCoffee, FiUsers, FiBriefcase } from 'react-icons/fi';

const NotificationDropdown = ({ isOpen, onClose, notifications, onNotificationClick, isLoading, onMarkAllAsRead }) => {
    const [visibleCount, setVisibleCount] = useState(4);

    const hasUnread = notifications.some((n) => n.status === 'PENDING');

    useEffect(() => {
        if (isOpen) {
            setVisibleCount(4);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSeeMore = () => {
        setVisibleCount((prevCount) => prevCount + 4);
    };

    // 미팅 타입에 따른 아이콘 반환
    const getMeetingIcon = (notification) => {
        const message = notification.message?.toLowerCase() || '';
        const body = notification.body?.toLowerCase() || '';
        const fullText = `${message} ${body}`.toLowerCase();

        // 미팅 타입별 아이콘 매칭
        if (fullText.includes('화상') || fullText.includes('온라인') || fullText.includes('zoom') || fullText.includes('video')) {
            return <FiVideo className="w-5 h-5 text-blue-500" />;
        }
        if (fullText.includes('커피') || fullText.includes('coffee') || fullText.includes('티타임')) {
            return <FiCoffee className="w-5 h-5 text-amber-600" />;
        }
        if (fullText.includes('팀') || fullText.includes('team') || fullText.includes('그룹')) {
            return <FiUsers className="w-5 h-5 text-green-500" />;
        }
        if (fullText.includes('비즈니스') || fullText.includes('업무') || fullText.includes('business')) {
            return <FiBriefcase className="w-5 h-5 text-purple-500" />;
        }

        // 기본 미팅 아이콘
        return <FiCalendar className="w-5 h-5 text-indigo-500" />;
    };

    const renderSkeleton = () =>
        [...Array(3)].map((_, index) => (
            <div key={index} className="flex items-start p-4 animate-pulse">
                <div className="flex-shrink-0 mt-1 w-10 h-10 bg-gray-200 rounded-lg"></div>
                <div className="ml-3 flex-grow">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                </div>
            </div>
        ));

    return (
        <div className="absolute top-full right-0 mt-3 w-80 md:w-96 bg-white rounded-xl shadow-2xl border border-gray-100 z-20 overflow-hidden animate-fade-in-down">
            {/* 헤더 */}
            <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-indigo-50">
                <h3 className="font-bold text-lg text-gray-800">알림</h3>
                <div className="flex items-center space-x-3">
                    {hasUnread && !isLoading && (
                        <button onClick={onMarkAllAsRead} className="text-sm font-medium text-purple-600 hover:text-purple-800 transition-colors px-2 py-1 rounded-md hover:bg-white/50">
                            모두 읽음
                        </button>
                    )}
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 hover:bg-white/50 p-1.5 rounded-md transition-colors">
                        <FiX className="text-xl" />
                    </button>
                </div>
            </div>

            {isLoading ? (
                renderSkeleton()
            ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <FiBellOff className="w-8 h-8 text-gray-300" />
                    </div>
                    <p className="text-sm font-semibold text-gray-600">새로운 알림이 없습니다</p>
                    <p className="text-xs text-gray-400 mt-1">모든 소식을 확인하셨습니다!</p>
                </div>
            ) : (
                <>
                    <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
                        {notifications.slice(0, visibleCount).map((notification) => {
                            const isUnread = notification.status === 'PENDING';

                            return (
                                <div
                                    key={notification.id}
                                    onClick={() => isUnread && onNotificationClick(notification.id)}
                                    className={`flex items-start p-4 transition-all duration-200 ${isUnread ? 'cursor-pointer hover:bg-purple-50/50 bg-white' : 'bg-gray-50 opacity-70'}`}
                                >
                                    {/* 아이콘 영역 */}
                                    <div
                                        className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${
                                            isUnread ? 'bg-gradient-to-br from-purple-100 to-indigo-100' : 'bg-gray-200'
                                        }`}
                                    >
                                        {getMeetingIcon(notification)}
                                    </div>

                                    {/* 콘텐츠 영역 */}
                                    <div className="ml-3 flex-grow min-w-0">
                                        {/* 타이틀 */}
                                        {notification.message && <h4 className={`text-sm font-semibold mb-1 ${isUnread ? 'text-gray-900' : 'text-gray-600'}`}>{notification.message}</h4>}

                                        {/* 바디 */}
                                        {notification.body && <p className={`text-sm leading-relaxed mb-2 ${isUnread ? 'text-gray-700' : 'text-gray-500'}`}>{notification.body}</p>}

                                        {/* 시간 */}
                                        {notification.time && (
                                            <p className="text-xs text-gray-400 flex items-center">
                                                <span className="mr-1">🕐</span>
                                                {notification.time}
                                            </p>
                                        )}
                                    </div>

                                    {/* 읽지 않음 표시 */}
                                    {isUnread && (
                                        <div className="flex-shrink-0 ml-2">
                                            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {visibleCount < notifications.length && (
                        <div className="p-3 text-center border-t border-gray-200 bg-gray-50">
                            <button
                                onClick={handleSeeMore}
                                className="text-sm font-semibold text-purple-600 hover:text-purple-800 transition-colors focus:outline-none px-4 py-1 rounded-md hover:bg-white"
                            >
                                더 보기 ({notifications.length - visibleCount}개 남음)
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default NotificationDropdown;
