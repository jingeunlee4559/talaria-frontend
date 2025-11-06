import { useEffect, useState } from 'react';
import { ControlBar, RoomAudioRenderer, LayoutContextProvider, useParticipants, useRoomContext, useDataChannel } from '@livekit/components-react';
import Swal from 'sweetalert2';
import TranscriptSidebar from './TranscriptSidebar';
import CustomVideoGrid from './CustomVideoGrid';
import SubtitleOverlay from './SubtitleOverlay';
import MannerChecker from './MannerChecker';
import { FiCopy } from 'react-icons/fi';

const ConferenceUI = ({ meetingTitle, onLeave }) => {
    const room = useRoomContext();
    const participants = useParticipants();
    const participantCount = participants.length;

    const [isSidebarVisible, setIsSidebarVisible] = useState(true);
    const [partials, setPartials] = useState({});
    const [finals, setFinals] = useState([]);

    // Helper: participant의 username 가져오기
    const getParticipantUsername = (identity) => {
        if (room.localParticipant?.identity === identity) {
            try {
                const metadata = JSON.parse(room.localParticipant.metadata || '{}');
                return metadata.username || room.localParticipant.name || identity;
            } catch {
                return room.localParticipant.name || identity;
            }
        }

        for (const p of participants) {
            if (p.identity === identity) {
                try {
                    const metadata = JSON.parse(p.metadata || '{}');
                    return metadata.username || p.name || identity;
                } catch {
                    return p.name || identity;
                }
            }
        }

        return identity;
    };

    // STT DataChannel 구독
    useDataChannel('stt', (msg) => {
        try {
            const text = new TextDecoder().decode(msg.payload);
            const data = JSON.parse(text);

            console.log('📥 STT received:', {
                type: data.final ? 'FINAL' : 'PARTIAL',
                username: data.username,
                text: data.text?.substring(0, 30) + '...',
            });

            const username = data.username || getParticipantUsername(data.identity) || data.identity || 'Unknown';
            const key = data.identity || data.track_sid || (msg.from?.identity ?? 'unknown');

            if (data.final) {
                // Final: 확정된 텍스트
                setFinals((prev) => [
                    ...prev,
                    {
                        identity: key,
                        username: username,
                        text: data.text || '',
                        ts: data.ts ?? Date.now(),
                    },
                ]);

                // Partial 제거
                setPartials((prev) => {
                    const next = { ...prev };
                    delete next[key];
                    return next;
                });
            } else {
                // Partial: 실시간 진행 중인 텍스트
                setPartials((prev) => ({
                    ...prev,
                    [key]: {
                        text: data.text || '',
                        username: username,
                    },
                }));
            }
        } catch (e) {
            console.error('❌ STT 파싱 오류:', e);
        }
    });

    // 회의 링크 복사
    const handleCopyLink = () => {
        const currentUrl = window.location.href;
        navigator.clipboard
            .writeText(currentUrl)
            .then(() => {
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
            })
            .catch((err) => {
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
                    {/* ✨ 매너체커 오버레이 (좌측 상단) */}
                    <MannerChecker />

                    {/* 상단 정보 (좌측 상단 고정) */}
                    <div className="absolute top-4 left-4 z-10 bg-black/60 backdrop-blur-sm px-4 py-2 rounded-xl text-white shadow-lg border border-white/10">
                        <p className="font-bold text-base">{meetingTitle || '회의'}</p>
                        <p className="text-xs text-slate-300">{participantCount > 0 ? `👥 ${participantCount}명 참여 중` : '연결 중...'}</p>
                    </div>

                    {/* 비디오 영역 */}
                    <div className="flex-grow relative overflow-hidden">
                        <CustomVideoGrid />

                        {/* ✅ 자막 오버레이 (중앙 하단) - Final STT & 번역 표시 */}
                        <SubtitleOverlay />

                        {/* ✅ Partial STT 오버레이 (실시간 음성인식) */}
                        {Object.keys(partials).length > 0 && (
                            <div className="absolute bottom-28 md:bottom-32 left-1/2 -translate-x-1/2 w-[90%] max-w-3xl z-30">
                                {Object.entries(partials).map(([key, data]) => (
                                    <div key={key} className="bg-yellow-500/20 backdrop-blur-md border-2 border-yellow-400/50 text-white rounded-xl px-4 py-2 mb-2 shadow-lg animate-pulse">
                                        <div className="text-center">
                                            <span className="text-xs font-bold text-yellow-300 mr-2">🎙️ {data.username} (입력 중...)</span>
                                            <p className="text-base leading-6 mt-1">
                                                {data.text}
                                                <span className="inline-block w-2 h-4 bg-yellow-400 ml-1 animate-blink"></span>
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* 하단 컨트롤 바 */}
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
                    <button onClick={onLeave} className="absolute top-4 right-4 bg-red-600 text-white px-3 py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors z-50 text-sm shadow-lg">
                        나가기
                    </button>
                </main>

                {/* 사이드바 */}
                {isSidebarVisible && (
                    <aside className="w-full h-[40vh] md:w-[340px] md:h-full flex-shrink-0 bg-slate-700 transition-all duration-300">
                        <TranscriptSidebar sttFinals={finals} />
                    </aside>
                )}

                <RoomAudioRenderer />
            </div>

            {/* 애니메이션 스타일 */}
            <style>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes blink {
                    0%,
                    50% {
                        opacity: 1;
                    }
                    51%,
                    100% {
                        opacity: 0;
                    }
                }

                .animate-fadeIn {
                    animation: fadeIn 0.3s ease-out;
                }

                .animate-blink {
                    animation: blink 1s infinite;
                }
            `}</style>
        </LayoutContextProvider>
    );
};

export default ConferenceUI;
