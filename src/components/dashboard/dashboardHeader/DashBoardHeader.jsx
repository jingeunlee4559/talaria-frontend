import React, { useEffect, useRef, useState } from 'react';
import { FiMenu, FiBell, FiCheckCircle, FiMessageSquare, FiAlertTriangle } from 'react-icons/fi';
import NotificationDropdown from './NotificationDropdown';
import ProfileDropdown from './ProfileDropdown';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

// setIsMobileSidebarOpen 함수를 props로 받아옵니다.
const DashBoardHeader = ({ setIsMobileSidebarOpen }) => {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const notificationRef = useRef(null);
  const profileRef = useRef(null);
  const navigate = useNavigate();


const notifications = [
        { id: 1, icon: <FiCheckCircle className="text-green-500" />, message: '프로필 사진이 성공적으로 변경되었습니다.', time: '방금 전' },
        { id: 2, icon: <FiMessageSquare className="text-blue-500" />, message: '이수진님께서 "프로젝트A"에 댓글을 남겼습니다.', time: '10분 전' },
        { id: 3, icon: <FiAlertTriangle className="text-red-500" />, message: 'API 요청 한도를 초과했습니다. 사용량을 확인해주세요.', time: '1시간 전' },
        { id: 4, icon: <FiCheckCircle className="text-green-500" />, message: "새로운 팀 멤버 '박지훈'님이 초대되었습니다.", time: '3시간 전' },
        { id: 5, icon: <FiMessageSquare className="text-blue-500" />, message: '마케팅팀으로부터 새로운 공지사항이 있습니다.', time: '어제' },
        { id: 6, icon: <FiAlertTriangle className="text-yellow-500" />, message: '이번 주 주간 보고서 제출 기한이 오늘까지입니다.', time: '어제' },
        { id: 7, icon: <FiCheckCircle className="text-green-500" />, message: '새로운 버전(v2.1.0)이 릴리즈되었습니다.', time: '2일 전' },
        { id: 8, icon: <FiMessageSquare className="text-blue-500" />, message: '최영희님께서 회의 초대를 보냈습니다: "분기 실적 리뷰"', time: '2일 전' },
        { id: 9, icon: <FiAlertTriangle className="text-yellow-500" />, message: '서버 점검이 내일 새벽 2시에 예정되어 있습니다.', time: '3일 전' },
        { id: 10, icon: <FiCheckCircle className="text-green-500" />, message: '구독 플랜이 성공적으로 갱신되었습니다.', time: '지난 주' },
        { id: 11, icon: <FiMessageSquare className="text-blue-500" />, message: "친구 요청: '김철수'님", time: '지난 주' },
        { id: 12, icon: <FiAlertTriangle className="text-red-500" />, message: '보안 경고: 알 수 없는 기기에서 로그인이 감지되었습니다.', time: '지난 주' },
        { id: 13, icon: <FiCheckCircle className="text-green-500" />, message: '데이터베이스 백업이 완료되었습니다.', time: '2주 전' },
        { id: 14, icon: <FiMessageSquare className="text-blue-500" />, message: '새로운 기능 "다크 모드"를 사용해보세요.', time: '한 달 전' },
    ];

      const parseRelativeTime = (timeString) => {
        if (timeString.includes('방금')) return 0;
        const minutesMatch = timeString.match(/(\d+)분 전/);
        if (minutesMatch) return parseInt(minutesMatch[1]);
        const hoursMatch = timeString.match(/(\d+)시간 전/);
        if (hoursMatch) return parseInt(hoursMatch[1]) * 60;
        if (timeString === '어제') return 1 * 24 * 60;
        const daysMatch = timeString.match(/(\d+)일 전/);
        if (daysMatch) return parseInt(daysMatch[1]) * 24 * 60;
        if (timeString === '지난 주') return 7 * 24 * 60;
        const weeksMatch = timeString.match(/(\d+)주 전/);
        if (weeksMatch) return parseInt(weeksMatch[1]) * 7 * 24 * 60;
        if (timeString === '한 달 전') return 30 * 24 * 60;
        return Infinity; // 알 수 없는 형식은 맨 뒤로 보냅니다.
    };

    // 알림 데이터를 시간순으로 정렬합니다.
    const sortedNotifications = [...notifications].sort((a, b) => {
        return parseRelativeTime(a.time) - parseRelativeTime(b.time);
    });

    // 알림창 외부를 클릭했을 때 닫히도록 하는 로직
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
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

const handleLogout = () => {
  Swal.fire({
    title: '로그아웃 하시겠습니까?',
    text: "현재 세션이 종료됩니다.",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#8B5CF6',
    cancelButtonColor: '#d33',
    confirmButtonText: '네, 로그아웃 할게요',
    cancelButtonText: '취소'
  }).then((result) => {
      if(result.isConfirmed){
          Swal.fire('로그아웃 완료!', '성공적으로 로그아웃되었습니다.', 'success');
          navigate('/');
      }
  });
}

        const handleProfileClick = () => {
        setIsProfileOpen(prev => !prev);
    };


    return (
      <header className="sticky top-0 bg-white shadow-md z-10">
  <div className="flex items-center justify-between p-4">
    {/* 좌측: 모바일 메뉴 버튼 */}
    <button
      className="md:hidden text-gray-500 focus:outline-none"
      onClick={() => setIsMobileSidebarOpen(true)}
    >
      <FiMenu className="text-2xl" />
    </button>

    {/* 우측: 알림 + 프로필 */}
    <div className="flex items-center space-x-4 ml-auto">
      {/* 알림 아이콘 */}
      <div className="relative" ref={notificationRef}>
        <button 
          className="relative"
          onClick={() => setIsNotificationOpen(prev => !prev)}
        >
          <FiBell className="text-xl text-gray-600 hover:text-purple-600 transition-colors" />
          {notifications.length > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-purple-500 justify-center items-center text-white text-xs">
                {notifications.length}
              </span>
            </span>
          )}
        </button>
        <NotificationDropdown 
          isOpen={isNotificationOpen} 
          onClose={() => setIsNotificationOpen(false)}
          notifications={sortedNotifications}
        />
      </div>

      {/* 프로필 아이콘 */}
      <div className="relative" ref={profileRef}>
        <button 
          onClick={handleProfileClick}
          className="w-9 h-9 rounded-full overflow-hidden border-2 border-gray-200 hover:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition"
        >
          <img 
            src="https://placehold.co/100x100/E2E8F0/4A5568?text=U"
            alt="User Profile" 
            className="w-full h-full object-cover"
          />
        </button>
        <ProfileDropdown isOpen={isProfileOpen} onLogout={handleLogout} />
      </div>
    </div>
  </div>
</header>
    );
}
export default DashBoardHeader;

