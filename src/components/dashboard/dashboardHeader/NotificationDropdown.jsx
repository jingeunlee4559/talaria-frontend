import { useEffect, useState } from 'react';
import { FiX, FiBellOff } from 'react-icons/fi';

// 🔄 [수정된 부분] onMarkAllAsRead prop을 받습니다.
const NotificationDropdown = ({ isOpen, onClose, notifications, onNotificationClick, isLoading, onMarkAllAsRead }) => {
    const [visibleCount, setVisibleCount] = useState(4);

    // ✨ [추가된 부분] 읽지 않은 알림이 있는지 확인하는 변수
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

    const renderSkeleton = () =>
        [...Array(3)].map((_, index) => (
            <div key={index} className="flex items-start p-4 animate-pulse">
                <div className="flex-shrink-0 mt-1 w-6 h-6 bg-gray-200 rounded-full"></div>
                <div className="ml-4 flex-grow">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2 mt-2"></div>
                </div>
            </div>
        ));

    return (
        <div className="absolute top-full right-0 mt-3 w-80 md:w-96 bg-white rounded-xl shadow-2xl border border-gray-100 z-20 overflow-hidden animate-fade-in-down">
            {/* 🔄 [수정된 부분] 헤더 구조 변경 및 '모두 읽음' 버튼 추가 */}
            <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-gray-50">
                <h3 className="font-semibold text-lg text-gray-800">알림</h3>
                <div className="flex items-center space-x-3">
                    {/* 읽지 않은 알림이 있을 때만 '모두 읽음' 버튼 표시 */}
                    {hasUnread && !isLoading && (
                        <button onClick={onMarkAllAsRead} className="text-sm font-medium text-purple-600 hover:text-purple-800 transition-colors">
                            모두 읽음
                        </button>
                    )}
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <FiX className="text-xl" />
                    </button>
                </div>
            </div>

            {isLoading ? (
                renderSkeleton()
            ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 text-center">
                    <FiBellOff className="w-10 h-10 text-gray-300 mb-4" />
                    <p className="text-sm font-medium text-gray-500">새로운 알림이 없습니다.</p>
                    <p className="text-xs text-gray-400 mt-1">모든 소식을 확인하셨습니다!</p>
                </div>
            ) : (
                <>
                    <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
                        {notifications.slice(0, visibleCount).map((notification) => (
                            <div
                                key={notification.id}
                                onClick={() => onNotificationClick(notification.id)}
                                className={`flex items-start p-4 transition-colors duration-200 ${notification.status === 'PENDING' ? 'cursor-pointer hover:bg-gray-50' : 'bg-gray-50 opacity-60'}`}
                            >
                                <div className="flex-shrink-0 mt-1 text-2xl">{notification.icon}</div>
                                <div className="ml-4 flex-grow">
                                    <p className="text-sm text-gray-700">{notification.message}</p>
                                    <p className="text-xs text-gray-400 mt-1">{notification.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {visibleCount < notifications.length && (
                        <div className="p-3 text-center border-t border-gray-200 bg-gray-50">
                            <button onClick={handleSeeMore} className="text-sm font-medium text-purple-600 hover:text-purple-800 transition-colors focus:outline-none">
                                더 보기
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default NotificationDropdown;
