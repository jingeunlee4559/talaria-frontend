import React, { useRef, useState } from 'react';
// ✅ 경로 대소문자 수정: dashvideo (소문자)
import FilterTabs from '../../components/dashboard/dashvideo/FilterTabs';
import MeetingCard from '../../components/dashboard/dashvideo/MeetingCard';

// 백엔드 REST 호출용 공용 axios 인스턴스
import api from '../../axios';

// 실제 애플리케이션에서는 API로부터 받아올 목업 데이터입니다.
const mockMeetings = [
  { id: 1, title: '10월 2주차 주간 보고 회의', status: '진행중', participants: 3, date: '2025년 10월 2일', time: '오후 2:00' },
  { id: 2, title: '신규 프로젝트 기획 회의', status: '예정', participants: 2, date: '2025년 10월 2일', time: '오후 4:00' },
  { id: 3, title: '디자인 시스템 리뷰 및 피드백', status: '예정', participants: 4, date: '2025년 10월 3일', time: '오전 10:00' },
  { id: 4, title: '월간 마케팅 전략 회의', status: '예정', participants: 5, date: '2025년 10월 4일', time: '오전 11:00' },
  { id: 5, title: '월간 마케팅 전략 회의', status: '예정', participants: 5, date: '2025년 10월 4일', time: '오전 11:00' },
  { id: 6, title: '월간 마케팅 전략 회의', status: '종료', participants: 5, date: '2025년 10월 4일', time: '오전 11:00' },
];

// ---- WebSocket 유틸 (이 파일 안에 간단 구현) ----
function connectSubtitles({ sid, token, onOpen, onMessage, onClose, onError }) {
  const WS_BASE = import.meta?.env?.VITE_WS_BASE || 'ws://localhost:8080';
  const url = `${WS_BASE}/ws/subtitles?sid=${encodeURIComponent(sid)}${token ? `&token=${encodeURIComponent(token)}` : ''}`;

  const ws = new WebSocket(url);
  ws.onopen = () => onOpen && onOpen();
  ws.onmessage = (ev) => {
    try {
      const msg = JSON.parse(ev.data);
      onMessage && onMessage(msg);
    } catch (e) {
      console.error('WS message parse error:', e);
    }
  };
  ws.onclose = () => onClose && onClose();
  ws.onerror = (e) => onError && onError(e);
  return ws;
}

function sendSubtitle(ws, { type = 'final', text, ts = Date.now() }) {
  if (ws?.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type, text, ts }));
  }
}

// ---- 컴포넌트 ----
const DashVIdeo = () => {
  // 필터 상태
  const [activeFilter, setActiveFilter] = useState('전체');
  const filters = ['전체', '진행중', '예정', '종료'];

  // Talaria 세션/WS 상태
  const [session, setSession] = useState(null); // { session_id, token, ws_url, expires_at }
  const [messages, setMessages] = useState([]); // WS로 수신되는 자막/알림
  const wsRef = useRef(null);

  const filteredMeetings = mockMeetings.filter(meeting => (activeFilter === '전체' ? true : meeting.status === activeFilter));

  // --- 액션 핸들러 ---
  const handleStartSession = async () => {
    try {
      const { data } = await api.post('/sessions'); // 백엔드: 세션 생성
      setSession(data);
      console.log('SESSION STARTED:', data);
    } catch (e) {
      console.error('세션 생성 실패:', e);
      alert('세션 생성 실패');
    }
  };

  const handleConnectWs = () => {
    if (!session) return alert('세션이 없습니다. 먼저 "새 회의 시작"을 누르세요.');
    if (wsRef.current) wsRef.current.close();

    wsRef.current = connectSubtitles({
      sid: session.session_id,
      token: session.token, // 백엔드에 토큰 검증 인터셉터가 있으면 필수
      onOpen: () => console.log('WS OPEN'),
      onMessage: (msg) => setMessages(prev => [...prev, msg]),
      onClose: () => console.log('WS CLOSE'),
      onError: (e) => console.error('WS ERROR', e),
    });
  };

  const handleSendTest = () => {
    if (!wsRef.current) return alert('WS가 연결되지 않았습니다.');
    sendSubtitle(wsRef.current, { type: 'final', text: '테스트 메시지' });
  };

  const handleUpdateSettings = async () => {
    if (!session) return;
    try {
      await api.post(`/sessions/${session.session_id}/settings`, {
        font_size: 22,
        high_contrast: true,
        caption_commit_ms: 400,
      });
      alert('설정 반영 완료');
    } catch (e) {
      console.error('설정 반영 실패:', e);
      alert('설정 반영 실패');
    }
  };

  const handleEndSession = async () => {
    try {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      if (session) {
        await api.post(`/sessions/${session.session_id}/end`);
      }
      setSession(null);
      setMessages([]);
    } catch (e) {
      console.error('세션 종료 실패:', e);
      alert('세션 종료 실패');
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">영상회의</h1>
            <p className="text-slate-500 mt-1">예정된 영상회의를 확인하고 참여하거나 새로운 회의를 시작하세요.</p>
            {/* 세션 상태 표시 */}
            <div className="mt-2 text-sm text-slate-600">
              {session ? (
                <>
                  <div>세션ID: <span className="font-mono">{session.session_id}</span></div>
                  <div>만료시각(Unix): <span className="font-mono">{session.expires_at}</span></div>
                </>
              ) : (
                <div>세션 없음</div>
              )}
            </div>
          </div>

          {/* 제어 버튼 묶음 */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleStartSession}
              className="bg-blue-600 text-white font-semibold px-5 py-2.5 rounded-lg shadow-sm hover:bg-blue-700 transition-colors flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              새 회의 시작
            </button>

            <button
              onClick={handleConnectWs}
              disabled={!session}
              className="bg-gray-800 text-white font-semibold px-4 py-2.5 rounded-lg hover:bg-gray-900"
            >
              WS 연결
            </button>

            <button
              onClick={handleSendTest}
              disabled={!wsRef.current}
              className="bg-gray-700 text-white font-semibold px-4 py-2.5 rounded-lg hover:bg-gray-800"
            >
              테스트 전송
            </button>

            <button
              onClick={handleUpdateSettings}
              disabled={!session}
              className="bg-indigo-600 text-white font-semibold px-4 py-2.5 rounded-lg hover:bg-indigo-700"
            >
              설정 반영
            </button>

            <button
              onClick={handleEndSession}
              disabled={!session}
              className="bg-red-600 text-white font-semibold px-4 py-2.5 rounded-lg hover:bg-red-700"
            >
              세션 종료
            </button>
          </div>
        </header>

        {/* WS 메시지 로그 */}
        <section className="mb-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-2">자막/알림 로그</h2>
          <div className="border rounded p-3 h-48 overflow-auto bg-white">
            {messages.length === 0 ? (
              <div className="text-slate-400 text-sm">메시지 없음 (WS 연결 후 [테스트 전송] 클릭)</div>
            ) : (
              messages.map((m, i) => (
                <div key={i} className="text-sm">
                  <b>{m.type}</b>: {m.text} <span className="text-gray-400">({m.ts})</span>
                </div>
              ))
            )}
          </div>
        </section>

        {/* 필터 탭 */}
        <FilterTabs filters={filters} activeFilter={activeFilter} setActiveFilter={setActiveFilter} />

        {/* 회의 카드 그리드 */}
        <main className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {filteredMeetings.map(meeting => (
            <MeetingCard key={meeting.id} {...meeting} />
          ))}
        </main>
      </div>
    </div>
  );
};

export default DashVIdeo;