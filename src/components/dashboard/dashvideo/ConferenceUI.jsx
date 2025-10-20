import { useEffect, useState } from "react";
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

  // LiveKit 참가자 수
  const participants = useParticipants();
  const participantCount = participants.length;

  // 사이드바 표시 상태
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);

  //  STT 수신 상태: partial/ final
  const [partials, setPartials] = useState({});  // key(화자) -> 현재 진행 중 텍스트
  const [finals, setFinals] = useState([]);      // [{ identity, text, ts }]

  //  LiveKit DataTrack('stt') 수신
  useEffect(() => {
    if (!room) return;

    const onData = (payload, participant, dataChannel) => {
      try {
        if (dataChannel?.topic !== 'stt') return; // STT 전용 topic만 처리
        const text = new TextDecoder().decode(payload);
        const msg = JSON.parse(text);
        // 기대 페이로드:
        // { type:'stt', final:boolean, text:string, identity?:string, track_sid?:string, ts?:number }

        const key =
          msg.identity ||
          msg.track_sid ||
          participant?.identity ||
          'unknown';

        if (msg.final) {
          // 최종 문장: finals에 누적, partial 제거
          setFinals(prev => [
            ...prev,
            { identity: key, text: msg.text || '', ts: msg.ts ?? Date.now() },
          ]);
          setPartials(prev => {
            const next = { ...prev };
            delete next[key];
            return next;
          });
        } else {
          // 진행 중 문장: partial 갱신
          setPartials(prev => ({ ...prev, [key]: msg.text || '' }));
        }
      } catch (e) {
        // 파싱 실패 등은 무시
        console.debug('stt parse error', e);
      }
    };

    room.on('dataReceived', onData);
    return () => {
      room.off('dataReceived', onData);
    };
  }, [room]);

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
            {/* 기존 오버레이(유지): SubtitleOverlay가 내부 상태를 쓰면 그대로 사용 */}
            <SubtitleOverlay />

            {/*  STT Partial 오버레이 (하단 중앙) */}
            {Object.keys(partials).length > 0 && (
              <div className="absolute bottom-24 left-1/2 -translate-x-1/2 w-[90%] max-w-3xl bg-black/60 text-white rounded-xl px-4 py-2 z-20">
                {Object.entries(partials).map(([key, txt]) => (
                  <div key={key} className="text-center text-base leading-6">
                    <span className="opacity-70 mr-2">[{key}]</span>{txt}
                  </div>
                ))}
              </div>
            )}

            {/*  STT Final 패널 (하단 우측, 최근 20개) */}
            {finals.length > 0 && (
              <div className="absolute bottom-2 right-2 w-[26rem] max-h-64 overflow-auto bg-white/85 backdrop-blur rounded-xl p-3 shadow z-20">
                {finals.slice(-20).map((it, i) => (
                  <div key={`${it.ts}-${i}`} className="text-sm text-gray-800 mb-1">
                    <span className="font-semibold mr-2">{it.identity}</span>{it.text}
                  </div>
                ))}
              </div>
            )}
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
            {/* 필요 시 finals/partials를 TranscriptSidebar로 내려서 기록/검색 UI 구현 가능 */}
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
