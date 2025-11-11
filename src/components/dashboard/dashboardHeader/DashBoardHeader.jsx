import React, { useContext, useEffect, useRef, useState, useCallback } from 'react';
import { FiMenu, FiBell, FiCheckCircle, FiMessageSquare, FiAlertTriangle } from 'react-icons/fi';
import NotificationDropdown from './NotificationDropdown';
import ProfileDropdown from './ProfileDropdown';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import api from '../../../axios';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import { UserContext } from '../../../contexts/UserContext';

const DashBoardHeader = ({ setIsMobileSidebarOpen }) => {
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const notificationRef = useRef(null);
    const profileRef = useRef(null);
    const navigate = useNavigate();

    // ✅ 1. UserContext에서 안정적인 user 상태를 가져옵니다.
    const { user, setUser } = useContext(UserContext);

    // ✅ 2. Context의 user 객체를 기반으로 프로필 정보를 동적으로 생성합니다.
    const userInitial = user?.email ? user.email[0].toUpperCase() : 'U';
    const profileImageUrl = `https://placehold.co/100x100/E2E8F0/4A5568?text=${userInitial}`;

    const iconMap = {
        MEETING: <FiCheckCircle className="text-green-500" />,
        INFO: <FiMessageSquare className="text-blue-500" />,
        SERVER_MAINTENANCE: <FiAlertTriangle className="text-yellow-500" />,
        ERROR: <FiAlertTriangle className="text-red-500" />,
        PROFILE_UPDATE: <FiBell className="text-gray-500" />,
        DEFAULT: <FiBell className="text-gray-500" />,
    };

    // ✅ useCallback으로 감싸 불필요한 재생성을 방지합니다.
    const sortNotifications = useCallback((notificationsArray) => {
        return [...notificationsArray].sort((a, b) => {
            if (a.status === 'PENDING' && b.status === 'SEEN') return -1;
            if (a.status === 'SEEN' && b.status === 'PENDING') return 1;
            return new Date(b.createdAt) - new Date(a.createdAt);
        });
    }, []);

    // ✅ 3. user.userId가 변경될 때만 API를 호출하도록 의존성 배열을 수정하여 무한 루프를 해결했습니다.
    useEffect(() => {
        const fetchNotifications = async () => {
            if (!user || !user.userId) {
                console.error('사용자 ID를 찾을 수 없어 알림을 불러올 수 없습니다.');
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            try {
                const userId = user.userId;
                const response = await api.get(`/api/users/${userId}/alerts`);

                const processedNotifications = response.data.items.map((noti) => ({
                    id: noti.id,
                    icon: iconMap[noti.type] || iconMap['DEFAULT'],
                    message: noti.title,
                    body: noti.body,
                    time: formatDistanceToNow(new Date(noti.created_at), { addSuffix: true, locale: ko }),
                    createdAt: noti.created_at,
                    status: noti.status,
                }));
                console.log(processedNotifications, 'alertsdfsdfsdfdssdfsdf');

                setNotifications(sortNotifications(processedNotifications));
            } catch (error) {
                console.error('알림을 불러오는 중 오류가 발생했습니다:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchNotifications();
    }, [user?.userId, sortNotifications]); // user.userId가 변경될 때만 재실행됩니다.

    const unreadCount = notifications.filter((n) => n.status === 'PENDING').length;

    // ✅ 4. 핸들러 함수들을 useCallback으로 감싸 성능을 최적화했습니다.
    const handleNotificationClick = useCallback(
        async (notificationId) => {
            const clickedNotification = notifications.find((n) => n.id === notificationId);
            if (!clickedNotification || clickedNotification.status === 'SEEN' || !user?.userId) {
                return;
            }

            const originalNotifications = [...notifications];
            const updatedNotifications = notifications.map((n) => (n.id === notificationId ? { ...n, status: 'SEEN' } : n));
            setNotifications(sortNotifications(updatedNotifications));

            try {
                await api.patch(`/api/users/${user.userId}/alerts/${notificationId}/seen`);
            } catch (error) {
                console.error('알림 읽음 처리 중 오류 발생:', error);
                setNotifications(originalNotifications); // 실패 시 원래 상태로 복구
                Swal.fire('오류', '알림을 읽음 처리하는 데 실패했습니다.', 'error');
            }
        },
        [notifications, user?.userId, sortNotifications],
    );

    const handleMarkAllAsRead = useCallback(async () => {
        if (unreadCount === 0 || !user?.userId) return;

        const originalNotifications = [...notifications];
        const updatedNotifications = notifications.map((n) => ({ ...n, status: 'SEEN' }));
        setNotifications(sortNotifications(updatedNotifications));

        try {
            await api.patch(`/api/users/${user.userId}/alerts/seen`);
        } catch (error) {
            console.error('전체 알림 읽음 처리 중 오류 발생:', error);
            setNotifications(originalNotifications);
            Swal.fire('오류', '전체 알림을 읽음 처리하는 데 실패했습니다.', 'error');
        }
    }, [unreadCount, notifications, user?.userId, sortNotifications]);

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

    const handleLogout = useCallback(async () => {
        const result = await Swal.fire({
            title: '로그아웃 하시겠습니까?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#8B5CF6',
            cancelButtonColor: '#d33',
            confirmButtonText: '네, 로그아웃 할게요',
            cancelButtonText: '취소',
        });

        if (result.isConfirmed) {
            try {
                await api.post('/api/users/logout', {}, { withCredentials: true });
                localStorage.removeItem('loggedInUser');
                sessionStorage.removeItem('loggedInUser');
                setUser(null);
                navigate('/');
                await Swal.fire('로그아웃 완료!', '성공적으로 로그아웃되었습니다.', 'success');
            } catch (error) {
                console.error('로그아웃 오류:', error);
                Swal.fire('오류', '로그아웃 중 문제가 발생했습니다.', 'error');
            }
        }
    }, [navigate, setUser]);

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
                            onMarkAllAsRead={handleMarkAllAsRead}
                        />
                    </div>
                    <div className="relative" ref={profileRef}>
                        <button
                            onClick={handleProfileClick}
                            className="w-9 h-9 rounded-full overflow-hidden border-2 border-gray-200 hover:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition"
                        >
                            <img src={profileImageUrl} alt="User Profile" className="w-full h-full object-cover" />
                        </button>
                        <ProfileDropdown isOpen={isProfileOpen} onLogout={handleLogout} />
                    </div>
                </div>
            </div>
        </header>
    );
};

export default DashBoardHeader;
