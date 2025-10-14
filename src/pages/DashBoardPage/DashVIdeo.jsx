import React, {useState, useEffect } from 'react';
import FilterTabs from '../../components/dashboard/dashvideo/FilterTabs';
import MeetingCard from '../../components/dashboard/dashvideo/MeetingCard';
// import api from '../../axios';
import CustomVideoConference from '../../components/dashboard/dashvideo/CustomVideoUI';
import { getLiveKitToken } from '../../services/livekitService';

const mockMeetings = [
  { id: 1, title: '10월 2주차 주간 보고 회의', status: '진행중', participants: 3, date: '2025년 10월 2일', time: '오후 2:00' },
  { id: 2, title: '신규 프로젝트 기획 회의', status: '예정', participants: 2, date: '2025년 10월 2일', time: '오후 4:00' },
  { id: 3, title: '디자인 시스템 리뷰 및 피드백', status: '예정', participants: 4, date: '2025년 10월 3일', time: '오전 10:00' },
  { id: 4, title: '월간 마케팅 전략 회의', status: '예정', participants: 5, date: '2025년 10월 4일', time: '오전 11:00' },
  { id: 5, title: '월간 마케팅 전략 회의', status: '예정', participants: 5, date: '2025년 10월 4일', time: '오전 11:00' },
  { id: 6, title: '월간 마케팅 전략 회의', status: '종료', participants: 5, date: '2025년 10월 4일', time: '오전 11:00' },
];


const DashVIdeo = () => {
  const [activeFilter, setActiveFilter] = useState('전체');
  const filters = ['전체', '진행중', '예정', '종료'];
  const [meetingState, setMeetingState] = useState({
    inMeeting: false,
    token: null,
    serverUrl: null,
  });

//   const [session, setSession] = useState(null);
//   const [messages, setMessages] = useState([]);
//   const wsRef = useRef(null);

  // ✅ 페이지 로드 시 URL 파라미터를 확인하여 회의 UI를 바로 렌더링할지 결정
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const inMeeting = params.get('inMeeting') === 'true';
    const token = params.get('token');
    const serverUrl = params.get('serverUrl');

    if (inMeeting && token && serverUrl) {
      setMeetingState({
        inMeeting: true,
        token: token,
        serverUrl: serverUrl,
      });
    }
  }, []); // 컴포넌트 마운트 시 한 번만 실행

  const filteredMeetings = mockMeetings.filter(meeting => (activeFilter === '전체' ? true : meeting.status === activeFilter));

  const handleStartSession = async () => {
    // try {
    //   const { data } = await api.post('/sessions');
    //   setSession(data);
    //   console.log('SESSION STARTED:', data);
    // } catch (e) {
    //   console.error('세션 생성 실패:', e);
    //   alert('세션 생성 실패');
    // }
  };

  // ✅ 회의 참여 핸들러 수정
  const handleJoinMeeting = async (meetingId, meetingTitle) => {
    try {
      // ❗️ 1. 백엔드 API를 호출하여 토큰과 wsUrl을 동적으로 발급받습니다.
      const response = await getLiveKitToken({
        room: meetingId.toString(),         // 방 이름으로 회의 ID 사용
        identity: 'user-' + Date.now(),   // ❗️ 참여자 고유 ID (실제로는 로그인된 유저 ID/이메일 사용)
        name: '참가자 닉네임'              // ❗️ 참여자 이름 (실제로는 로그인된 유저 닉네임 사용)
      });

       console.log("✅ 백엔드에서 받은 응답:", response);
      console.log("✅ LiveKit 접속에 사용할 토큰:", response.token);

      const { wsUrl, token } = response; // 응답에서 wsUrl과 token 추출

      // ❗️ 2. 백엔드에서 받은 정보로 URL을 생성합니다.
      const url = new URL(window.location.href);
      url.searchParams.set('inMeeting', 'true');
      url.searchParams.set('token', token);       // 👈 백엔드에서 받은 토큰
      url.searchParams.set('serverUrl', wsUrl); // 👈 백엔드에서 받은 WebSocket URL
      console.log(token,"backetoken");
      

      // 3. 새 창 열기
      window.open(url.toString(), '_blank', 'noopener,noreferrer');

    } catch (error) {
      console.error(error);
      alert(error.message); // 사용자에게 에러 알림
    }
  };

  // ✅ 회의 나가기 핸들러: 새 창에서 열렸을 경우 창을 닫도록 수정
  const handleLeaveMeeting = () => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('inMeeting') === 'true') {
        window.close(); // 새 창에서 실행된 경우 창 닫기
    } else {
        // 기존 로직 (같은 창에서 열렸을 경우를 대비)
        setMeetingState({
            inMeeting: false,
            token: null,
            serverUrl: null,
        });
    }
  };

  // 만약 회의에 참여 중이라면, 커스텀 UI를 렌더링
  if (meetingState.inMeeting) {
    return (
      <CustomVideoConference
        token={meetingState.token}
        serverUrl={meetingState.serverUrl}
        onLeave={handleLeaveMeeting}
      />
    );
  }

  return (
   <div className="bg-slate-50 min-h-screen p-4 sm:p-8">
  <div className="max-w-8xl mx-auto">
    <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 sm:gap-0">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">영상회의</h1>
        <p className="text-sm sm:text-base text-slate-500 mt-1">
          예정된 영상회의를 확인하고 참여하거나 새로운 회의를 시작하세요.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={handleStartSession}
          className="bg-blue-600 text-white font-semibold px-3 py-2 sm:px-5 sm:py-2.5 rounded-lg shadow-sm hover:bg-blue-700 transition-colors flex items-center text-sm sm:text-base"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          새 회의 시작
        </button>
      </div>
    </header>

    <FilterTabs filters={filters} activeFilter={activeFilter} setActiveFilter={setActiveFilter} />

    <main className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mt-6">
      {filteredMeetings.map(meeting => (
        <MeetingCard
          key={meeting.id}
          {...meeting}
          onJoinMeeting={() => handleJoinMeeting(meeting.id, meeting.title)}
        />
      ))}
    </main>
  </div>
</div>
  );
};

export default DashVIdeo;
