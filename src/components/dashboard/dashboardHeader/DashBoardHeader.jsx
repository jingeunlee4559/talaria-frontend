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

                const processedNotifications = response.data.items.map((noti) => ({
                    id: noti.id,
                    icon: iconMap[noti.type] || iconMap['DEFAULT'],
                    message: noti.title,
                    body: noti.body,
                    time: formatDistanceToNow(new Date(noti.created_at), { addSuffix: true, locale: ko }),
                    createdAt: noti.created_at,
                    status: noti.status,
                }));

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
            setNotifications(originalNotifications); // 오류 발생 시 원래 상태로 롤백
            Swal.fire('오류', '알림을 읽음 처리하는 데 실패했습니다.', 'error');
        }
    };

    // ✨ [추가된 부분] 전체 읽음 처리 핸들러
    const handleMarkAllAsRead = async () => {
        if (unreadCount === 0) return; // 읽지 않은 알림이 없으면 함수 종료

        const originalNotifications = [...notifications]; // 롤백을 위해 원래 상태 저장
        // UI를 즉시 업데이트 (Optimistic UI Update)
        const updatedNotifications = notifications.map((n) => ({ ...n, status: 'SEEN' }));
        setNotifications(sortNotifications(updatedNotifications));

        try {
            const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
            const userId = loggedInUser?.userId;
            if (!userId) {
                throw new Error('사용자 정보를 찾을 수 없습니다.');
            }
            // 🚨 참고: 백엔드 API 주소는 `/api/users/${userId}/alerts/seen`으로 가정했습니다.
            // 만약 주소가 다르다면 이 부분을 수정해주세요.
            await axios.patch(`/api/users/${userId}/alerts/seen`);
            console.log('모든 알림을 읽음 처리했습니다.');
        } catch (error) {
            console.error('전체 알림 읽음 처리 중 오류 발생:', error);
            setNotifications(originalNotifications); // 오류 발생 시 원래 상태로 롤백
            Swal.fire('오류', '전체 알림을 읽음 처리하는 데 실패했습니다.', 'error');
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

    const handleLogout = async () => {
        const result = await Swal.fire({
            title: '로그아웃 하시겠습니까?',
            text: '현재 세션이 종료됩니다.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#8B5CF6',
            cancelButtonColor: '#d33',
            confirmButtonText: '네, 로그아웃 할게요',
            cancelButtonText: '취소',
        });

        if (result.isConfirmed) {
            try {
                // ✅ 서버에 로그아웃 요청 보내기
                await axios.post('/api/users/logout', {}, { withCredentials: true });

                // ✅ 클라이언트에 저장된 로그인 정보 삭제
                sessionStorage.removeItem('loggedInUser'); // sessionStorage 사용 시
                localStorage.removeItem('loggedInUser'); // localStorage 사용 시 필요하면 함께 삭제

                await Swal.fire('로그아웃 완료!', '성공적으로 로그아웃되었습니다.', 'success');

                // ✅ 로그인 페이지로 이동
                navigate('/');
            } catch (error) {
                console.error('로그아웃 오류:', error);
                Swal.fire('오류', '로그아웃 중 문제가 발생했습니다.', 'error');
            }
        }
    };

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
                            onMarkAllAsRead={handleMarkAllAsRead} // ✨ [추가된 부분] props 전달
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
