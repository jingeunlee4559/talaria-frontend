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


// =======================================================================
// Main Video Conference Component
// =======================================================================

// Mock 데이터에 'type' 필드를 추가하여 사이드바와 호환되도록 수정
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
}

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
                console.error("Failed to parse subtitle message:", error);
            }
        }
    }, [message]);
    
    if (!latestMessage) return null;

    // 반응형 스타일 수정
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
    [{ source: Track.Source.Camera, withPlaceholder: true }, { source: Track.Source.ScreenShare, withPlaceholder: false }],
    { onlySubscribed: false }
  );
  // 부모 컨테이너 높이에 100% 맞추도록 수정
  return (
    <GridLayout tracks={tracks} style={{ height: '100%' }}>
      <ParticipantTile />
    </GridLayout>
  );
}

const CustomVideoConference = ({ token, serverUrl, onLeave }) => {
  const [room] = useState(() => new Room({ adaptiveStream: true, dynacast: true }));
  const [participantCount, setParticipantCount] = useState(1);

  // LiveKit 컴포넌트 스타일시트 동적 추가
  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdn.jsdelivr.net/npm/@livekit/components-styles@1.1.6/dist/style.css';
    document.head.appendChild(link);
    return () => {
      if (document.head.contains(link)) {
        document.head.removeChild(link);
      }
    };
  }, []);

  // LiveKit Room 연결 및 참여자 수 업데이트 로직
  useEffect(() => {
    const updateParticipantCount = () => {
        setParticipantCount(room.participants.size + 1);
    };

    let mounted = true;
    const connectToRoom = async () => {
              console.log('--- 연결 시도 ---');
      console.log('Server URL:', serverUrl);
      console.log('Token:', token);
      if (mounted) {
        try {
          await room.connect(serverUrl, token);
          updateParticipantCount(); // 연결 후 참여자 수 업데이트
          room.on('participantConnected', updateParticipantCount);
          room.on('participantDisconnected', updateParticipantCount);
        } catch (error) {
          console.error("LiveKit connection failed:", error);
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
      {/* ✅ RoomContext.Provider 바로 안쪽에 LayoutContextProvider를 추가합니다. */}
      <LayoutContextProvider>
        <div data-lk-theme="default" className="w-full h-screen flex flex-col md:flex-row bg-slate-800">
          
          {/* === 비디오 영역 컨테이너 === */}
          <main className="w-full h-3/5 md:h-full flex-grow relative flex flex-col">
            <div className="absolute top-4 left-4 z-10 bg-black/50 p-2 rounded text-white text-sm">
              <p className="font-bold">글로벌 마케팅 전략 회의</p>
              <p className="text-xs">{participantCount}명 참여 중</p>
            </div>
            
            <div className="flex-grow relative overflow-hidden">
              <CustomVideoGrid />
              <SubtitleOverlay />
            </div>

            <ControlBar controls={{ microphone: true, camera: true, screenShare: true ,  settings: true, leave: false}} />
            
            <button onClick={onLeave} className="absolute top-4 right-4 bg-red-600 text-white px-3 py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors z-50 text-sm">
              나가기
            </button>
          </main>
          
          {/* === 사이드바 영역 컨테이너 === */}
          <aside className="w-full h-2/5 md:w-[340px] md:h-full flex-shrink-0">
            <TranscriptSidebar />
          </aside>

          <RoomAudioRenderer />
          <DataSender />
        </div>
      </LayoutContextProvider> {/* ✅ LayoutContextProvider로 감싸줍니다. */}
    </RoomContext.Provider>
  );
};

export default CustomVideoConference;


