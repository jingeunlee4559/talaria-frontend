import React, { useState } from 'react';
import DocumentItem from '../../components/dashboard/dashDoc/DocumentItem';
import MeetingMinutesItem from '../../components/dashboard/dashDoc/MeetingMinutesItem';


const SearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;
const FilterIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>;

// 번역 문서 목업 데이터
const documents = [
  { id: 1, title: '파트너십 계약서', isStarred: true, fromLang: '영어', toLang: '한국어', date: '2025-09-27', size: '2.4 MB', author: '김철수' },
  { id: 2, title: '제품 사양서', isStarred: false, fromLang: '한국어', toLang: '영어', date: '2025-09-25', size: '1.8 MB', author: '이영희' },
  { id: 3, title: '마케팅 전략 검토 보고서', isStarred: true, fromLang: '영어', toLang: '한국어', date: '2025-09-23', size: '3.2 MB', author: '박민수' },
];

// 회의록 목업 데이터를 새로 추가합니다.
const mockMinutes = [
  { id: 1, title: '2025 Q3 사업 계획 회의', isStarred: true, date: '2025-09-26', duration: '1시간 15분', participants: 4 },
  { id: 2, title: '글로벌 마케팅 전략 회의', isStarred: false, date: '2025-09-24', duration: '45분', participants: 3 },
];


const DashDocuments = () => {
  const [activeTab, setActiveTab] = useState('번역 문서');

  return (
    // 페이지 배경색을 약간 회색으로 변경하면 카드들이 더 돋보입니다.
    <div className="bg-slate-50 min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        {/* --- (헤더, 검색, 필터 부분은 기존 코드와 동일) --- */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800">문서 & 회의록</h1>
          <p className="text-slate-500 mt-1">과거의 모든 기록을 찾아보고 원하는 정보를 탐색하세요.</p>
        </header>

        <div className="flex justify-between items-center mb-6">
          <div className="relative w-1/3">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon />
            </div>
            <input
              type="text"
              placeholder="문서 또는 회의록 검색..."
              className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            />
          </div>
          <div className="flex items-center space-x-2">
            <button className="flex items-center bg-white border border-slate-300 text-slate-700 font-semibold px-4 py-2 rounded-lg hover:bg-slate-50 transition">
              <FilterIcon />
              필터
            </button>
            <button className="bg-slate-100 text-slate-800 font-semibold px-4 py-2 rounded-lg hover:bg-slate-200 transition">
              전체
            </button>
          </div>
        </div>

        {/* 탭 */}
        <div className="border-b border-slate-200">
          <nav className="flex space-x-6">
            <TabButton title="번역 문서" isActive={activeTab === '번역 문서'} onClick={() => setActiveTab('번역 문서')} />
            <TabButton title="회의록" isActive={activeTab === '회의록'} onClick={() => setActiveTab('회의록')} />
          </nav>
        </div>

        {/* 목록: activeTab 상태에 따라 다른 컴포넌트를 렌더링합니다. */}
        <main className="mt-6">
          {activeTab === '번역 문서' ? (
            <DocumentList documents={documents} />
          ) : (
            <MeetingMinutesList minutes={mockMinutes} />
          )}
        </main>
      </div>
    </div>
  );
};

// 탭 버튼 컴포넌트 (기존 코드와 동일)
const TabButton = ({ title, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`py-3 text-sm font-semibold transition-colors
      ${isActive
        ? 'border-b-2 border-blue-600 text-blue-600'
        : 'text-slate-500 hover:text-slate-700'
      }`}
  >
    {title}
  </button>
);


// 문서 리스트 컴포넌트 (기존 코드와 동일)
const DocumentList = ({ documents }) => (
  <div className="space-y-3">
    {documents.map(doc => (
      // DocumentItem의 배경색을 투명하게 하거나 부모와 맞추어 일관성을 유지합니다.
      <DocumentItem key={doc.id} {...doc} />
    ))}
  </div>
);

// 회의록 리스트 컴포넌트를 새로 추가합니다.
const MeetingMinutesList = ({ minutes }) => (
    <div className="space-y-3">
      {minutes.map(minute => (
        <MeetingMinutesItem key={minute.id} {...minute} />
      ))}
    </div>
);


export default DashDocuments;