import { useState } from "react";
import {
  ControlBar,
  RoomAudioRenderer,
  LayoutContextProvider,
  useParticipants,
} from '@livekit/components-react';
import Swal from "sweetalert2";
import TranscriptSidebar from "./TranscriptSidebar";
import DataSender from "./DataSender";
import CustomVideoGrid from "./CustomVideoGrid";
import SubtitleOverlay from "./SubtitleOverlay";
import { FiCopy } from "react-icons/fi";

const ConferenceUI = ({ room, onLeave }) => {

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


  // 이제 이 컴포넌트는 RoomContext.Provider의 '내부'에 있으므로 훅을 안전하게 사용할 수 있습니다.
  const participants = useParticipants();
  const participantCount = participants.length;

  const [isSidebarVisible, setIsSidebarVisible] = useState(true);

  const handleCopyLink = () => {
    const currentUrl = window.location.href;
    navigator.clipboard.writeText(currentUrl).then(() => {
      Swal.fire({
        icon: 'success',
        title: '복사 완료!',
        text: '회의 주소가 클립보드에 복사되었습니다.',
        timer: 1500,
        showConfirmButton: false,
        width: '350px',
        toast: true,
        position: 'top-end',
      });
    }).catch(err => {
      console.error('주소 복사에 실패했습니다:', err);
      Swal.fire({
        icon: 'error',
        title: '복사 실패',
        text: '주소를 복사하는 데 실패했습니다. 다시 시도해주세요.',
        confirmButtonColor: '#d33',
      });
    });
  };

  return (
    <LayoutContextProvider>
      <div data-lk-theme="default" className="w-full h-screen flex flex-col md:flex-row bg-slate-800">
        <main className="w-full h-[60vh] md:h-full flex-grow relative flex flex-col">
          <div className="absolute top-4 left-4 z-10 bg-black/50 p-2 rounded text-white text-sm">
            <p className="font-bold">Global Marketing Strategy Meeting</p>
            <p className="text-xs">{participantCount > 0 ? ` 인원수 ${participantCount}` : 'Connecting...'}</p>
          </div>

          <div className="flex-grow relative overflow-hidden">
            <CustomVideoGrid />
            <SubtitleOverlay />
          </div>

          <div className="flex flex-wrap items-center justify-center bg-slate-900 px-4 py-2 shadow-md rounded-t-lg gap-2">
            <ControlBar variation="minimal" />
            <button onClick={handleCopyLink} title="회의 주소 복사" className="lk-button lk-button-icon">
              <FiCopy size={20} />
            </button>
            <button
              onClick={() => setIsSidebarVisible(!isSidebarVisible)}
              aria-pressed={isSidebarVisible}
              data-lk-active={isSidebarVisible}
              className="lk-button lk-button-icon"
              title="Transcript"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" >
                <path d="M4 6h16M4 12h16M4 18h12" />
              </svg>
            </button>
          </div>
          
          <button
            onClick={onLeave}
            className="absolute top-4 right-4 bg-red-600 text-white px-3 py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors z-50 text-sm"
          >
            나가기
          </button>
        </main>

        {isSidebarVisible && (
          <aside className="w-full h-[40vh] md:w-[340px] md:h-full flex-shrink-0 bg-slate-700 transition-all duration-300">
            <TranscriptSidebar documents={documents} />
          </aside>
        )}

        <RoomAudioRenderer />
        <DataSender />
      </div>
    </LayoutContextProvider>
  );
};

export default ConferenceUI;