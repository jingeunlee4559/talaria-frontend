import React, { useState} from 'react';
import DocumentModal from '../../components/dashboard/dashDoc/DocumentModal';
import { SearchIcon,FilterIcon,StarIcon,DownloadIcon } from '../../components/icons/icons';
import MeetingMinutesItem from '../../components/dashboard/dashDoc/MeetingMinutesItem';
import DocumentItem from '../../components/dashboard/dashDoc/DocumentItem';

// --- 목업 데이터 ---
const documents = [
    { id: 1, type: 'document', title: '파트너십 계약서', isStarred: true, fromLang: '영어', toLang: '한국어', date: '2025-09-27', size: '2.4 MB', author: '김철수', 
      originalContent: "This Partnership Agreement ('Agreement') is entered into as of September 27, 2025, by and between: Party A: TechCorp International Ltd. Address: 123 Business Street, San Francisco, CA 94105. Party B: Innovation Korea Co., Ltd. Address: 456 Gangnam-daero, Seoul, South Korea. The purpose of this agreement is to establish a cooperative framework for joint development and marketing of future products.",
      translatedContent: "본 파트너십 계약('본 계약')은 2025년 9월 27일부로 다음 당사자 간에 체결됩니다: 당사자 A: TechCorp International Ltd. 주소: 123 Business Street, San Francisco, CA 94105. 당사자 B: 이노베이션 코리아 주식회사. 주소: 서울특별시 강남대로 456. 본 계약의 목적은 향후 제품의 공동 개발 및 마케팅을 위한 협력 체계를 구축하는 것입니다."
    },
    { id: 2, type: 'document', title: '제품 사양서', isStarred: false, fromLang: '한국어', toLang: '영어', date: '2025-09-25', size: '1.8 MB', author: '이영희',
      originalContent: "제품명: 제미니 AI 프로세서. 주요 기능: 초당 100조 회의 연산 능력, 저전력 설계. 개발 팀: AI솔루션팀. 출시 예정일: 2026년 1월.",
      translatedContent: "Product Name: Gemini AI Processor. Key Features: 100 trillion operations per second, low power design. Development Team: AI Solution Team. Estimated Release Date: January 2026."
    },
    { id: 3, type: 'document', title: '마케팅 전략 검토 보고서', isStarred: true, fromLang: '영어', toLang: '한국어', date: '2025-09-23', size: '3.2 MB', author: '박민수',
      originalContent: "The Q4 marketing campaign will focus primarily on digital channels, specifically targeting Gen Z users through short-form video content. Budget allocation: 60% digital ads, 30% influencer collaborations, 10% traditional media.",
      translatedContent: "4분기 마케팅 캠페인은 주로 디지털 채널에 집중하며, 특히 짧은 형식의 비디오 콘텐츠를 통해 Gen Z 사용자를 타겟팅할 것입니다. 예산 할당: 디지털 광고 60%, 인플루언서 협업 30%, 전통 미디어 10%."
    },
];

const mockMinutes = [
    { id: 4, type: 'minutes', title: '2025 Q3 사업 계획 회의', isStarred: true, date: '2025-09-26', duration: '1시간 15분', participants: 4,
      aiSummary: {
        decisions: ['Q4 아시아 시장 진출을 위한 예산 300만 달러 승인', '신제품 출시일을 2025년 12월 15일로 확정', '마케팅팀 3명 추가 채용 결정'],
        actionItems: [
          { owner: '김철수', task: '시장 조사 보고서 작성', deadline: '마감: 10월 5일' },
          { owner: 'John Smith', task: '파트너십 계약서 초안 준비', deadline: '마감: 10월 10일' },
          { owner: '田中太郎', task: '일본 시장 진출 전략 발표', deadline: '마감: 10월 8일' }
        ]
      },
      topics: ['예산', '마케팅', '인력 채용', '시장 진출'],
      transcript: [
        { speaker: '김', timestamp: '00:00:12', text: '오늘 회의를 시작하겠습니다. 먼저 Q3 실적을 검토하고 Q4 계획을 논의하겠습니다.' },
        { speaker: 'J', timestamp: '00:02:45', text: 'John Smith: Our Q3 revenue exceeded expected expectations by 15%. This gives us a strong foundation for Asian market expansion.' },
        { speaker: '田', timestamp: '00:05:20', text: '田中太郎: 日本市場への進出は、現地でのパートナーシップが不可欠です。3社と交渉中です.' },
        { speaker: '김', timestamp: '00:07:30', text: 'Q4 마케팅 예산에 대해 추가 의견 있으십니까?' },
        { speaker: 'J', timestamp: '00:09:15', text: 'We should allocate more budget towards digital influencer campaigns.' }
      ]
    },
    { id: 5, type: 'minutes', title: '글로벌 마케팅 전략 회의', isStarred: false, date: '2025-09-24', duration: '45분', participants: 3,
      aiSummary: {
        decisions: ['10월 중 독일 베를린에서 파일럿 캠페인 시작', '제품 현지화를 위해 유럽어권 인터페이스 개발'],
        actionItems: [
          { owner: '이영희', task: '베를린 캠페인 장소 최종 확정', deadline: '마감: 9월 30일' },
          { owner: '박민수', task: '현지화 디자인팀 구성 및 Kick-off', deadline: '마감: 10월 5일' }
        ]
      },
      topics: ['유럽 시장', '캠페인', '현지화'],
      transcript: [
        { speaker: '이', timestamp: '00:01:05', text: '유럽 시장 진출을 위한 초기 전략을 논의하겠습니다.' },
        { speaker: 'P', timestamp: '00:03:10', text: '독일 시장이 가장 매력적으로 보입니다. 초기에는 베를린에 집중하는 것이 어떻습니까?' },
        { speaker: 'J', timestamp: '00:06:55', text: 'Localization of the app interface is critical for user adoption in European countries.' }
      ]
    },
];

// 전체 목록을 하나로 합칩니다.
// const allItems = [...documents, ...mockMinutes];


// --- 재사용 가능한 컴포넌트 ---

// 탭 버튼 컴포넌트
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




// 문서 리스트 컴포넌트
const DocumentList = ({ documents, onItemClick }) => (
    <div className="space-y-3">
        {documents.map(doc => (
            <DocumentItem key={doc.id} {...doc} onClick={onItemClick} />
        ))}
    </div>
);

// 회의록 리스트 컴포넌트
const MeetingMinutesList = ({ minutes, onItemClick }) => (
    <div className="space-y-3">
        {minutes.map(minute => (
            <MeetingMinutesItem key={minute.id} {...minute} onClick={onItemClick} />
        ))}
    </div>
);




// --- 메인 컴포넌트 ---
const DashDocuments = () => {
    const [activeTab, setActiveTab] = useState('번역 문서');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);

    const handleItemClick = (item) => {
        setSelectedItem(item);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedItem(null);
    };

    const activeList = activeTab === '번역 문서' ? documents : mockMinutes;

    return (
<div className="bg-slate-50 min-h-screen p-6 sm:p-8 font-sans" style={{ fontFamily: 'Inter, sans-serif' }}>
  <div className="max-w-8xl mx-auto">
    {/* 헤더 */}
    <header className="mb-6 sm:mb-8">
      <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800">문서 & 회의록</h1>
      <p className="text-slate-500 mt-1 text-sm sm:text-base">과거의 모든 기록을 찾아보고 원하는 정보를 탐색하세요.</p>
    </header>

    {/* 검색 & 필터 */}
    <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
      <div className="relative w-full max-w-md">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <SearchIcon className="text-slate-400" />
        </div>
        <input
          type="text"
          placeholder="문서 또는 회의록 검색..."
          className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition shadow-sm"
        />
      </div>
      <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
        <button className="flex items-center justify-center bg-white border border-slate-300 text-slate-700 font-semibold px-4 py-2 rounded-lg hover:bg-slate-50 transition shadow-sm w-full sm:w-auto">
          <FilterIcon />
          <span className="ml-2">필터</span>
        </button>
        <button className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 transition shadow-md w-full sm:w-auto">
          새 문서 등록
        </button>
      </div>
    </div>

    {/* 탭 */}
    <div className="border-b border-slate-200 mb-6">
      <nav className="flex flex-wrap gap-4 space-x-0 sm:space-x-6">
        <TabButton title="번역 문서" isActive={activeTab === '번역 문서'} onClick={() => setActiveTab('번역 문서')} />
        <TabButton title="회의록" isActive={activeTab === '회의록'} onClick={() => setActiveTab('회의록')} />
      </nav>
    </div>

    {/* 목록 */}
    <main>
      {activeList.length > 0 ? (
        activeTab === '번역 문서' ? (
          <DocumentList documents={documents} onItemClick={handleItemClick} />
        ) : (
          <MeetingMinutesList minutes={mockMinutes} onItemClick={handleItemClick} />
        )
      ) : (
        <div className="text-center py-10 text-slate-500 bg-white rounded-xl border border-slate-200">
          <p>검색 결과가 없습니다.</p>
        </div>
      )}
    </main>
  </div>

  {/* 모달 렌더링 */}
  <DocumentModal isOpen={isModalOpen} onClose={handleCloseModal} itemData={selectedItem} />
</div>
    );
};

export default DashDocuments;
