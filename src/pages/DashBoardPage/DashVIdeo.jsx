import React, {useState, useEffect, useMemo } from 'react';
import FilterTabs from '../../components/dashboard/dashvideo/FilterTabs';
import MeetingCard from '../../components/dashboard/dashvideo/MeetingCard';
// import api from '../../axios';
import CustomVideoConference from '../../components/dashboard/dashvideo/CustomVideoUI';
import Pagination from '../../components/Pagination';
import Lobby from '../../components/dashboard/dashvideo/Lobby';
import Swal from 'sweetalert2';

const mockMeetings = [
  { id: 1, title: '10월 2주차 주간 보고 회의', status: '진행중', participants: 3, date: '2025년 10월 2일', time: '오후 2:00' },
  { id: 2, title: '신규 프로젝트 기획 회의', status: '예정', participants: 2, date: '2025년 10월 2일', time: '오후 4:00' },
  { id: 3, title: '디자인 시스템 리뷰 및 피드백', status: '예정', participants: 4, date: '2025년 10월 3일', time: '오전 10:00' },
  { id: 4, title: '월간 마케팅 전략 회의', status: '예정', participants: 5, date: '2025년 10월 4일', time: '오전 11:00' },
  { id: 5, title: '월간 마케팅 전략 회의', status: '예정', participants: 5, date: '2025년 10월 4일', time: '오전 11:00' },
  { id: 6, title: '월간 마케팅 전략 회의', status: '종료', participants: 5, date: '2025년 10월 4일', time: '오전 11:00' },
  { id: 7, title: '월간 마케팅 전략 회의', status: '예정', participants: 5, date: '2025년 10월 4일', time: '오전 11:00' },
  { id: 8, title: '월간 마케팅 전략 회의', status: '예정', participants: 5, date: '2025년 10월 4일', time: '오전 11:00' },
  { id: 9, title: '월간 마케팅 전략 회의', status: '종료', participants: 5, date: '2025년 10월 4일', time: '오전 11:00' },
  { id: 10, title: '10월 2주차 주간 보고 회의', status: '진행중', participants: 3, date: '2025년 10월 2일', time: '오후 2:00' },
  { id: 11, title: '신규 프로젝트 기획 회의', status: '예정', participants: 2, date: '2025년 10월 2일', time: '오후 4:00' },
  { id: 12, title: '디자인 시스템 리뷰 및 피드백', status: '예정', participants: 4, date: '2025년 10월 3일', time: '오전 10:00' },
  { id: 13, title: '월간 마케팅 전략 회의', status: '예정', participants: 5, date: '2025년 10월 4일', time: '오전 11:00' },
  { id: 14, title: '월간 마케팅 전략 회의', status: '예정', participants: 5, date: '2025년 10월 4일', time: '오전 11:00' },
  { id: 15, title: '월간 마케팅 전략 회의', status: '종료', participants: 5, date: '2025년 10월 4일', time: '오전 11:00' },
  { id: 16, title: '월간 마케팅 전략 회의', status: '예정', participants: 5, date: '2025년 10월 4일', time: '오전 11:00' },
  { id: 17, title: '월간 마케팅 전략 회의', status: '예정', participants: 5, date: '2025년 10월 4일', time: '오전 11:00' },
  { id: 18, title: '월간 마케팅 전략 회의', status: '종료', participants: 5, date: '2025년 10월 4일', time: '오전 11:00' },
  
];


const DashVIdeo = () => {
    const [activeFilter, setActiveFilter] = useState('전체');
    const [meetings, setMeetings] = useState(mockMeetings);
    const filters = ['전체', '진행중', '예정', '종료'];
    const MEETINGS_PER_PAGE = 6;
    const [currentPage, setCurrentPage] = useState(1);
    
    // ❗ view, currentMeeting, liveKitState 등 모든 상태를 제거합니다.
    // ❗ LayoutContext 관련 useEffect도 제거합니다.

    const filteredMeetings = useMemo(() => 
        meetings.filter(meeting => (activeFilter === '전체' ? true : meeting.status === activeFilter)),
        [meetings, activeFilter] // meetings가 변경될 때마다 재계산
    );

    const totalPages = Math.ceil(filteredMeetings.length / MEETINGS_PER_PAGE);

    useEffect(() => {
        setCurrentPage(1);
    }, [activeFilter]);

    const currentMeetings = useMemo(() => {
        const firstPageIndex = (currentPage - 1) * MEETINGS_PER_PAGE;
        const lastPageIndex = firstPageIndex + MEETINGS_PER_PAGE;
        return filteredMeetings.slice(firstPageIndex, lastPageIndex);
    }, [currentPage, filteredMeetings]);

    const handlePageChange = (page) => {
        setCurrentPage(page);
        window.scrollTo(0, 0);
    };

    // ✅ '참여' 버튼을 누르면 새 창을 여는 로직으로 변경합니다.
    const handleJoinMeeting = (meetingId, meetingTitle) => {
        // 1. 새 창에서 열 URL을 생성합니다. (경로: /meeting)
        const url = new URL('/meeting', window.location.origin);
        
        // 2. URL 파라미터에 회의 ID와 제목을 추가합니다.
        url.searchParams.set('id', meetingId);
        url.searchParams.set('title', meetingTitle);

        // 3. 새 창 또는 탭을 엽니다.
        window.open(url.toString(), '_blank', 'noopener,noreferrer');
    };

const handleStartNewMeeting = async () => {
    // 1. 첫 번째 모달: 회의 제목 입력
    const { value: title } = await Swal.fire({
        title: '회의 제목 입력',
        input: 'text',
        inputPlaceholder: '예: 4분기 실적 보고 회의',
        confirmButtonText: '다음 &rarr;',
        showCancelButton: true,
        cancelButtonText: '취소',
        confirmButtonColor: '#7c3aed',
        // ✅ customClass 옵션으로 input 스타일 지정
        customClass: {
            input: 'custom-swal-input'
        },
        inputValidator: (value) => {
            if (!value) {
                return '회의 제목을 입력해야 합니다!';
            }
        }
    });

    // 제목을 입력했으면 (취소하지 않았으면)
    if (!title) return;

    // 2. 두 번째 모달: 날짜 입력
    const { value: date } = await Swal.fire({
        title: '날짜 선택',
        input: 'date',
        confirmButtonText: '다음 &rarr;',
        showCancelButton: true,
        cancelButtonText: '취소',
        confirmButtonColor: '#7c3aed',
        // ✅ 동일한 customClass 적용
        customClass: {
            input: 'custom-swal-input'
        }
    });

    if (!date) return;

    // 3. 세 번째 모달: 시간 입력
    const { value: time } = await Swal.fire({
        title: '시간 선택',
        input: 'time',
        confirmButtonText: '회의 예약',
        showCancelButton: true,
        cancelButtonText: '취소',
        confirmButtonColor: '#7c3aed',
        // ✅ 동일한 customClass 적용
        customClass: {
            input: 'custom-swal-input'
        }
    });

    // 시간까지 모두 입력했으면 최종 처리
    if (time) {
        // --- 입력받은 데이터로 새 회의 객체 생성 ---
        const newMeetingId = `new-${Date.now()}`;

        // 날짜 포맷팅 (예: 2025년 10월 15일)
        const formattedDate = new Intl.DateTimeFormat('ko-KR', {
            year: 'numeric', month: 'long', day: 'numeric'
        }).format(new Date(date));
        
        // 시간 포맷팅 (예: 오후 2:30)
        const [hour, minute] = time.split(':');
        const hourNum = parseInt(hour, 10);
        const period = hourNum >= 12 ? '오후' : '오전';
        const formattedHour = hourNum % 12 || 12;
        const formattedTime = `${period} ${formattedHour}:${minute}`;

        const newMeeting = {
            id: newMeetingId,
            title: title,
            status: '예정',
            participants: 1,
            date: formattedDate,
            time: formattedTime,
        };
        
        setMeetings(prevMeetings => [newMeeting, ...prevMeetings]);

        Swal.fire({
            icon: 'success',
            title: '예약 완료!',
            text: `'${title}' 회의가 성공적으로 예약되었습니다.`,
            timer: 2000,
            showConfirmButton: false,
        });
    }
};

    // ❗ handleConfirmJoin, handleLeaveMeeting 함수와 조건부 렌더링 로직을 모두 제거합니다.
    
    return (
        <div className="bg-slate-50 min-h-screen p-4 sm:p-8">
            <div className="max-w-8xl mx-auto">
    <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
      {/* 제목 & 설명 */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
          영상회의
        </h1>
        <p className="text-sm sm:text-base text-slate-500 mt-1">
          예정된 영상회의를 확인하고 참여하거나 새로운 회의를 시작하세요.
        </p>
      </div>

      {/* 새 회의 시작 버튼 */}
      <div>
        <button
          onClick={handleStartNewMeeting}
          className="
            flex items-center justify-center gap-2 w-full sm:w-auto
            px-5 py-2.5 
            bg-purple-600 text-white 
            font-semibold rounded-lg shadow-md
            hover:bg-purple-700 
            focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-75
            transition-all duration-200 ease-in-out
          "
        >
          {/* + 아이콘 */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span>새 회의 시작</span>
        </button>
      </div>
    </header>

                <FilterTabs filters={filters} activeFilter={activeFilter} setActiveFilter={setActiveFilter} />

                <main className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mt-6">
                    {currentMeetings.map(meeting => (
                        <MeetingCard
                            key={meeting.id}
                            {...meeting}
                            // 변경된 핸들러를 연결합니다.
                            onJoinMeeting={() => handleJoinMeeting(meeting.id, meeting.title)}
                        />
                    ))}
                </main>
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                />
            </div>
        </div>
    );
};

export default DashVIdeo;