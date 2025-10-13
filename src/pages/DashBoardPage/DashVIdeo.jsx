import React, { useState } from 'react';
import FilterTabs from '../../components/dashboard/DashVideo/FilterTabs';
import MeetingCard from '../../components/dashboard/DashVideo/MeetingCard';

// 실제 애플리케이션에서는 API로부터 받아올 목업 데이터입니다.
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

  const filteredMeetings = mockMeetings.filter(meeting => {
    if (activeFilter === '전체') return true;
    return meeting.status === activeFilter;
  });

  return (
    <div className="bg-slate-50 min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">영상회의</h1>
            <p className="text-slate-500 mt-1">예정된 영상회의를 확인하고 참여하거나 새로운 회의를 시작하세요.</p>
          </div>
          <button className="bg-blue-600 text-white font-semibold px-5 py-2.5 rounded-lg shadow-sm hover:bg-blue-700 transition-colors flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            새 회의 시작
          </button>
        </header>

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