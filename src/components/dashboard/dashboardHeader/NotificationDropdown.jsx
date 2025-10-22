import { useEffect, useState } from 'react';
import { FiX } from 'react-icons/fi';

const NotificationDropdown = ({ isOpen, onClose, notifications }) => {
    const [visibleCount, setVisibleCount] = useState(4);

    // 드롭다운이 열릴 때마다 표시되는 아이템 수를 4개로 초기화합니다.
    useEffect(() => {
        if (isOpen) {
            setVisibleCount(4);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSeeMore = () => {
        setVisibleCount((prevCount) => prevCount + 4);
    };

    return (
        <div className="absolute top-full right-0 mt-3 w-80 md:w-96 bg-white rounded-xl shadow-2xl border border-gray-100 z-20 overflow-hidden animate-fade-in-down">
            <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-gray-50">
                <h3 className="font-semibold text-lg text-gray-800">알림</h3>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                    <FiX className="text-xl" />
                </button>
            </div>

            <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
                {/* visibleCount 만큼만 알림을 잘라서 보여줍니다. */}
                {notifications.slice(0, visibleCount).map((notification) => (
                    <div key={notification.id} className="flex items-start p-4 hover:bg-gray-50 transition-colors duration-200 cursor-pointer">
                        <div className="flex-shrink-0 mt-1 text-2xl">{notification.icon}</div>
                        <div className="ml-4 flex-grow">
                            <p className="text-sm text-gray-700">{notification.message}</p>
                            <p className="text-xs text-gray-400 mt-1">{notification.time}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* 보여줄 알림이 더 있는 경우에만 '더 보기' 버튼을 표시합니다. */}
            {visibleCount < notifications.length && (
                <div className="p-3 text-center border-t border-gray-200 bg-gray-50">
                    <button onClick={handleSeeMore} className="text-sm font-medium text-purple-600 hover:text-purple-800 transition-colors focus:outline-none">
                        더 보기
                    </button>
                </div>
            )}
        </div>
    );
};

export default NotificationDropdown;
