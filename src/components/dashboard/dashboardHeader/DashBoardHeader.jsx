import React, { useEffect, useRef, useState } from 'react';
import { FiMenu, FiBell, FiCheckCircle, FiMessageSquare, FiAlertTriangle } from 'react-icons/fi';
import NotificationDropdown from './NotificationDropdown';
import ProfileDropdown from './ProfileDropdown';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import axios from '../../../axios';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

const DashBoardHeader = ({ setIsMobileSidebarOpen }) => {
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const notificationRef = useRef(null);
    const profileRef = useRef(null);
    const navigate = useNavigate();

    const iconMap = {
        MEETING: <FiCheckCircle className="text-green-500" />,
        INFO: <FiMessageSquare className="text-blue-500" />,
        SERVER_MAINTENANCE: <FiAlertTriangle className="text-yellow-500" />,
        ERROR: <FiAlertTriangle className="text-red-500" />,
        PROFILE_UPDATE: <FiBell className="text-gray-500" />,
        DEFAULT: <FiBell className="text-gray-500" />,
    };

    const sortNotifications = (notificationsArray) => {
        return [...notificationsArray].sort((a, b) => {
            if (a.status === 'PENDING' && b.status === 'SEEN') return -1;
            if (a.status === 'SEEN' && b.status === 'PENDING') return 1;
            return new Date(b.createdAt) - new Date(a.createdAt);
        });
    };

    useEffect(() => {
        const fetchNotifications = async () => {
            setIsLoading(true);
            try {
                const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
                if (!loggedInUser || !loggedInUser.userId) {
                    console.error('사용자 ID를 찾을 수 없습니다.');
                    return;
                }

                const userId = loggedInUser.userId;
                const response = await axios.get(`/api/users/${userId}/alerts`);
                console.log(response, 'Dfsfsdddddddddd');
                const processedNotifications = response.data.items.map((noti) => {
                    // 🔽 [수정된 부분] 🔽
                    // 디버깅을 위해 서버에서 실제로 어떤 alertType 값을 보내주는지 확인합니다.
                    // 브라우저 개발자 도구(F12)의 콘솔 탭에서 이 로그를 확인해 보세요.
                    console.log('서버 응답 alertType:', noti.Type);

                    return {
                        id: noti.id,
                        // 이 부분의 noti.alertType이 iconMap의 키와 일치해야 합니다.
                        icon: iconMap[noti.type] || iconMap['DEFAULT'],
                        message: noti.title,
                        body: noti.body,
                        time: formatDistanceToNow(new Date(noti.created_at), { addSuffix: true, locale: ko }),
                        createdAt: noti.created_at,
                        status: noti.status,
                    };
                });

                console.log(processedNotifications, 'Dfsfsd');
                console.log(response, 'Dfsfsdddddddddd');

                setNotifications(sortNotifications(processedNotifications));
            } catch (error) {
                console.error('알림을 불러오는 중 오류가 발생했습니다:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchNotifications();
    }, []);

    const handleNotificationClick = async (notificationId) => {
        const clickedNotification = notifications.find((n) => n.id === notificationId);
        if (!clickedNotification || clickedNotification.status === 'SEEN') {
            return;
        }

        const originalNotifications = [...notifications];
        const updatedNotifications = notifications.map((n) => (n.id === notificationId ? { ...n, status: 'SEEN' } : n));
        setNotifications(sortNotifications(updatedNotifications));

        try {
            const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
            const userId = loggedInUser?.userId;
            if (!userId) {
                throw new Error('사용자 정보를 찾을 수 없습니다.');
            }
            await axios.patch(`/api/users/${userId}/alerts/${notificationId}/seen`);
            console.log(`알림 ${notificationId}를 읽음 처리했습니다.`);
        } catch (error) {
            console.error('알림 읽음 처리 중 오류 발생:', error);
            console.log(`알림 ${notificationId} 선택`);
            setNotifications(originalNotifications);
            Swal.fire('오류', '알림을 읽음 처리하는 데 실패했습니다.', 'error');
        }
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setIsNotificationOpen(false);
            }
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setIsProfileOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleProfileClick = () => {
        setIsProfileOpen((prev) => !prev);
    };

    const unreadCount = notifications.filter((n) => n.status === 'PENDING').length;

    // 로그아웃 핸들러 (내용 생략)
    const handleLogout = async () => {};

    return (
        <header className="sticky top-0 bg-white shadow-md z-10">
            <div className="flex items-center justify-between p-4">
                <button className="md:hidden text-gray-500 focus:outline-none" onClick={() => setIsMobileSidebarOpen(true)}>
                    <FiMenu className="text-2xl" />
                </button>

                <div className="flex items-center space-x-4 ml-auto">
                    <div className="relative" ref={notificationRef}>
                        <button className="relative" onClick={() => setIsNotificationOpen((prev) => !prev)}>
                            <FiBell className="text-xl text-gray-600 hover:text-purple-600 transition-colors" />
                            {unreadCount > 0 && (
                                <span className="absolute -top-1 -right-1 flex h-4 w-4">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-4 w-4 bg-purple-500 justify-center items-center text-white text-xs">{unreadCount}</span>
                                </span>
                            )}
                        </button>
                        <NotificationDropdown
                            isOpen={isNotificationOpen}
                            onClose={() => setIsNotificationOpen(false)}
                            notifications={notifications}
                            isLoading={isLoading}
                            onNotificationClick={handleNotificationClick}
                        />
                    </div>
                    <div className="relative" ref={profileRef}>
                        <button
                            onClick={handleProfileClick}
                            className="w-9 h-9 rounded-full overflow-hidden border-2 border-gray-200 hover:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition"
                        >
                            <img src="https://placehold.co/100x100/E2E8F0/4A5568?text=U" alt="User Profile" className="w-full h-full object-cover" />
                        </button>
                        <ProfileDropdown isOpen={isProfileOpen} onLogout={handleLogout} />
                    </div>
                </div>
            </div>
        </header>
    );
};

export default DashBoardHeader;
