import React, { useEffect, useState } from 'react';
import {
  GridLayout,
  ParticipantTile,
  ControlBar,
  useDataChannel,
  useTracks,
  RoomContext,
  RoomAudioRenderer,
  LayoutContextProvider,
} from '@livekit/components-react';
import { Room, Track } from 'livekit-client';
import '@livekit/components-styles';
import TranscriptSidebar from './TranscriptSidebar';

const mockTranscripts = [
  { type: 'translation', speakerName: 'John Smith', originalText: 'I think we should focus on the Asian market first.', translatedText: '먼저 아시아 시장에 집중해야 한다고 생각합니다.', langFrom: '영어', langTo: '한국어', time: '14:23' },
  { type: 'translation', speakerName: '김민수', originalText: '동의합니다. 특히 일본과 중국 시장이 유망해 보입니다.', translatedText: 'I agree. The Japanese and Chinese markets look promising.', langFrom: '한국어', langTo: '영어', time: '14:24' },
  { type: 'chat', sender: '田中', text: '회의 끝나고 자료 공유 부탁드립니다!', time: '14:25' },
];

const DataSender = () => {
  const { send } = useDataChannel('translation_data');
  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      if (send) {
        const textEncoder = new TextEncoder();
        send(textEncoder.encode(JSON.stringify(mockTranscripts[index % mockTranscripts.length])));
        index++;
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [send]);
  return null;
};

const SubtitleOverlay = () => {
  const [latestMessage, setLatestMessage] = useState(null);
  const { message } = useDataChannel('translation_data');

  useEffect(() => {
    if (message) {
      try {
        const textDecoder = new TextDecoder();
        const msg = JSON.parse(textDecoder.decode(message.payload));
        if (msg.type === 'translation') {
          setLatestMessage(msg);
        }
      } catch (error) {
        console.error('Failed to parse subtitle message:', error);
      }
    }
  }, [message]);

  if (!latestMessage) return null;

  return (
    <div className="absolute bottom-4 md:bottom-20 left-1/2 -translate-x-1/2 w-11/12 md:w-3/4 max-w-4xl bg-black/60 text-white p-3 md:p-4 rounded-lg text-center backdrop-blur-sm transition-all">
      <p className="font-bold text-base md:text-lg">{latestMessage.speakerName} ({latestMessage.langFrom})</p>
      <p className="text-lg md:text-xl my-1">{latestMessage.originalText}</p>
      <p className="text-base md:text-lg text-sky-300">{latestMessage.translatedText}</p>
    </div>
  );
};

function CustomVideoGrid() {
  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { onlySubscribed: false }
  );

  return (
    <GridLayout tracks={tracks} style={{ height: '100%' }}>
      <ParticipantTile />
    </GridLayout>
  );
}

const CustomVideoConference = ({ token, serverUrl, onLeave }) => {
  const [room] = useState(() => new Room({ adaptiveStream: true, dynacast: true }));
  const [participantCount, setParticipantCount] = useState(1);
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);

  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdn.jsdelivr.net/npm/@livekit/components-styles@1.1.6/dist/style.css';
    document.head.appendChild(link);
    return () => {
      if (document.head.contains(link)) document.head.removeChild(link);
    };
  }, []);

  useEffect(() => {
    const updateParticipantCount = () => setParticipantCount(room.participants.size + 1);

    let mounted = true;
    const connectToRoom = async () => {
      console.log('--- Attempting to connect ---');
      console.log('Server URL:', serverUrl);
      console.log('Token:', token);
      if (mounted) {
        try {
          await room.connect(serverUrl, token);
          updateParticipantCount();
          room.on('participantConnected', updateParticipantCount);
          room.on('participantDisconnected', updateParticipantCount);
        } catch (error) {
          console.error('LiveKit connection failed:', error);
        }
      }
    };
    connectToRoom();

    return () => {
      mounted = false;
      room.off('participantConnected', updateParticipantCount);
      room.off('participantDisconnected', updateParticipantCount);
      room.disconnect();
    };
  }, [room, serverUrl, token]);

  return (
    <RoomContext.Provider value={room}>
      <LayoutContextProvider>
        {/* 전체 반응형 컨테이너 */}
        <div data-lk-theme="default" className="w-full h-screen flex flex-col md:flex-row bg-slate-800">
          
          {/* 메인 비디오 영역 */}
          <main className="w-full h-[60vh] md:h-full flex-grow relative flex flex-col">
            <div className="absolute top-4 left-4 z-10 bg-black/50 p-2 rounded text-white text-sm">
              <p className="font-bold">Global Marketing Strategy Meeting</p>
              <p className="text-xs">{participantCount} participant(s)</p>
            </div>

            <div className="flex-grow relative overflow-hidden">
              <CustomVideoGrid />
              <SubtitleOverlay />
            </div>

<div className="flex flex-wrap items-center justify-center bg-slate-900 px-4 py-2 shadow-md rounded-t-lg gap-2">
  {/* 🎥 LiveKit ControlBar (아이콘 전용) */}
  <ControlBar
    className="flex items-center gap-2"
    variation="minimal" // 불필요한 레이블 제거
  />

  {/* 🗒️ Transcript 버튼 (아이콘 전용) */}
  <button
    onClick={() => setIsSidebarVisible(!isSidebarVisible)}
    aria-pressed={isSidebarVisible}
    data-lk-active={isSidebarVisible}
    className={`lk-button lk-button-icon flex items-center justify-center 
                text-white hover:text-blue-400 transition-colors duration-150 ease-in-out`}
    title="Transcript"  // hover 시 툴팁 표시
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 6h16M4 12h16M4 18h12" />
    </svg>
  </button>
</div>
            {/* 나가기 버튼 */}
            <button
              onClick={onLeave}
              className="absolute top-4 right-4 bg-red-600 text-white px-3 py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors z-50 text-sm"
            >
              나가기
            </button>
          </main>

          {/* 사이드바 (반응형 크기) */}
          {isSidebarVisible && (
            <aside className="w-full h-[40vh] md:w-[340px] md:h-full flex-shrink-0 bg-slate-700 transition-all duration-300">
              <TranscriptSidebar />
            </aside>
          )}

          <RoomAudioRenderer />
          <DataSender />
        </div>
      </LayoutContextProvider>
    </RoomContext.Provider>
  );
};

export default CustomVideoConference;
