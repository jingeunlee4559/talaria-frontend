import { useEffect, useState, useRef } from 'react';
import { ControlBar, RoomAudioRenderer, LayoutContextProvider, useParticipants, useRoomContext, useDataChannel, useTracks } from '@livekit/components-react';
import { Track } from 'livekit-client';
import Swal from 'sweetalert2';
import TranscriptSidebar from './TranscriptSidebar';
import CustomVideoGrid from './CustomVideoGrid';
import SubtitleOverlay from './SubtitleOverlay';
import MannerChecker from './MannerChecker';
import { FiCopy, FiMaximize, FiMinimize } from 'react-icons/fi';

const ConferenceUI = ({ meetingTitle, onLeave }) => {
    const room = useRoomContext();
    const participants = useParticipants();
    const participantCount = participants.length;

    const [isSidebarVisible, setIsSidebarVisible] = useState(true);
    const [partials, setPartials] = useState({});
    const [finals, setFinals] = useState([]);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const mainContainerRef = useRef(null);
    const controlsTimeoutRef = useRef(null);

    // 화면 공유 상태 확인
    const tracks = useTracks([{ source: Track.Source.ScreenShare, withPlaceholder: false }], { onlySubscribed: false });
    const hasScreenShare = tracks.length > 0;

    // 전체화면에서 마우스 움직임 감지
    useEffect(() => {
        if (!isFullscreen) {
            setShowControls(true);
            return;
        }

        // 전체화면에서는 기본적으로 숨김
        setShowControls(false);

        const handleMouseMove = () => {
            setShowControls(true);

            // 기존 타이머 클리어
            if (controlsTimeoutRef.current) {
                clearTimeout(controlsTimeoutRef.current);
            }

            // 3초 후 컨트롤 숨김
            controlsTimeoutRef.current = setTimeout(() => {
                setShowControls(false);
            }, 3000);
        };

        const container = mainContainerRef.current;
        if (container) {
            container.addEventListener('mousemove', handleMouseMove);
        }

        return () => {
            if (container) {
                container.removeEventListener('mousemove', handleMouseMove);
            }
            if (controlsTimeoutRef.current) {
                clearTimeout(controlsTimeoutRef.current);
            }
        };
    }, [isFullscreen]);

    // 전체화면 토글 함수
    const toggleFullscreen = async () => {
        const element = mainContainerRef.current;

        if (!element) {
            console.error('❌ Main container not found');
            return;
        }

        try {
            if (!document.fullscreenElement) {
                console.log('📺 Entering fullscreen...');
                if (element.requestFullscreen) {
                    await element.requestFullscreen();
                } else if (element.webkitRequestFullscreen) {
                    await element.webkitRequestFullscreen();
                } else if (element.mozRequestFullScreen) {
                    await element.mozRequestFullScreen();
                } else if (element.msRequestFullscreen) {
                    await element.msRequestFullscreen();
                }
            } else {
                console.log('📺 Exiting fullscreen...');
                if (document.exitFullscreen) {
                    await document.exitFullscreen();
                } else if (document.webkitExitFullscreen) {
                    await document.webkitExitFullscreen();
                } else if (document.mozCancelFullScreen) {
                    await document.mozCancelFullScreen();
                } else if (document.msExitFullscreen) {
                    await document.msExitFullscreen();
                }
            }
        } catch (err) {
            console.error('❌ Fullscreen error:', err);
        }
    };

    // 전체화면 상태 변경 감지
    useEffect(() => {
        const handleFullscreenChange = () => {
            const isFull = !!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement);
            console.log('🔄 Fullscreen state changed:', isFull);
            setIsFullscreen(isFull);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
        document.addEventListener('mozfullscreenchange', handleFullscreenChange);
        document.addEventListener('msfullscreenchange', handleFullscreenChange);

        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
            document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
            document.removeEventListener('msfullscreenchange', handleFullscreenChange);
        };
    }, []);

    // Helper: participant의 username 가져오기 (개선)
    const getParticipantUsername = (identity) => {
        if (!identity) return 'Unknown';

        // Local participant 확인
        if (room.localParticipant?.identity === identity) {
            try {
                const metadata = JSON.parse(room.localParticipant.metadata || '{}');
                return metadata.username || room.localParticipant.name || identity;
            } catch {
                return room.localParticipant.name || identity;
            }
        }

        // Remote participants 확인
        for (const p of room.remoteParticipants.values()) {
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

    // STT DataChannel 구독 (개선된 로직)
    useDataChannel('stt', (msg) => {
        try {
            const text = new TextDecoder().decode(msg.payload);
            const data = JSON.parse(text);

            console.log('📥 STT received:', {
                type: data.final ? 'FINAL' : 'PARTIAL',
                identity: data.identity,
                username: data.username,
                text: data.text?.substring(0, 50),
                participant_sid: data.participant_sid,
            });

            // Username 우선순위: 1) data.username, 2) getParticipantUsername, 3) identity
            const username = data.username || getParticipantUsername(data.identity) || data.identity || 'Unknown';

            // 고유 키 생성 (identity 우선, 없으면 participant_sid)
            const key = data.identity || data.participant_sid || 'unknown';

            if (data.final) {
                // ✅ Final: 확정된 텍스트
                console.log(`✅ FINAL STT from ${username}: ${data.text}`);

                setFinals((prev) => [
                    ...prev,
                    {
                        identity: data.identity,
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
                // ⏳ Partial: 실시간 진행 중인 텍스트
                console.log(`⏳ PARTIAL STT from ${username}: ${data.text}`);

                setPartials((prev) => ({
                    ...prev,
                    [key]: {
                        text: data.text || '',
                        username: username,
                        identity: data.identity,
                    },
                }));
            }
        } catch (e) {
            console.error('❌ STT 파싱 오류:', e);
        }
    });

    // 🆕 디버깅: 모든 participants의 오디오 트랙 상태 로깅
    useEffect(() => {
        const logParticipantTracks = () => {
            console.group('🎙️ Participant Audio Tracks Status');

            // Local participant
            if (room.localParticipant) {
                console.log('Local Participant:', {
                    identity: room.localParticipant.identity,
                    name: room.localParticipant.name,
                    audioTracks: Array.from(room.localParticipant.audioTrackPublications.values()).map((pub) => ({
                        sid: pub.trackSid,
                        enabled: pub.isEnabled,
                        muted: pub.isMuted,
                        subscribed: pub.isSubscribed,
                    })),
                });
            }

            // Remote participants
            room.remoteParticipants.forEach((p) => {
                console.log(`Remote Participant [${p.identity}]:`, {
                    name: p.name,
                    audioTracks: Array.from(p.audioTrackPublications.values()).map((pub) => ({
                        sid: pub.trackSid,
                        enabled: pub.isEnabled,
                        muted: pub.isMuted,
                        subscribed: pub.isSubscribed,
                    })),
                });
            });

            console.groupEnd();
        };

        // 초기 로깅
        logParticipantTracks();

        // 트랙 변경 시 로깅
        const handleTrackPublished = () => {
            console.log('🆕 Track published event');
            logParticipantTracks();
        };

        const handleTrackUnpublished = () => {
            console.log('❌ Track unpublished event');
            logParticipantTracks();
        };

        room.on('trackPublished', handleTrackPublished);
        room.on('trackUnpublished', handleTrackUnpublished);

        return () => {
            room.off('trackPublished', handleTrackPublished);
            room.off('trackUnpublished', handleTrackUnpublished);
        };
    }, [room, participants]);

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
            <div
                ref={mainContainerRef}
                data-lk-theme="default"
                className="w-full h-screen flex flex-col md:flex-row bg-black overflow-hidden"
                style={{ cursor: isFullscreen && !showControls ? 'none' : 'default' }}
            >
                {/* 비디오 + 컨트롤 영역 */}
                <div className="flex-1 flex flex-col min-w-0 relative h-full">
                    {/* 상단 정보 오버레이 */}
                    {(!isFullscreen || showControls) && (
                        <>
                            <div className="absolute top-40 left-4 z-50">
                                <MannerChecker />
                            </div>

                            {/* 회의 정보 */}
                            <div className="absolute top-4 left-4 z-50 bg-black/60 backdrop-blur-sm px-4 py-2 rounded-xl text-white shadow-lg border border-white/10">
                                <p className="font-bold text-base">{meetingTitle || '회의'}</p>
                                <p className="text-xs text-slate-300">{participantCount > 0 ? `👥 ${participantCount}명 참여 중` : '연결 중...'}</p>
                            </div>
                        </>
                    )}

                    {/* 비디오 그리드 영역 - 완전히 채우기 */}
                    <div className="flex-1 w-full relative overflow-hidden">
                        <CustomVideoGrid />

                        {/* 자막 오버레이 - 화면 공유 시에도 표시 */}
                        {(!isFullscreen || showControls) && (
                            <div className="absolute bottom-23 left-0 right-0 z-[80] pointer-events-none">
                                <div className="flex justify-center">
                                    <SubtitleOverlay />
                                </div>
                            </div>
                        )}

                        {/* Partial STT */}
                        {Object.keys(partials).length > 0 && (!isFullscreen || showControls) && (
                            <div className="absolute bottom-32 left-1/2 -translate-x-1/2 w-[90%] max-w-3xl z-35">
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

                    {/* 컨트롤 바 */}
                    <div
                        className={`
                            ${isFullscreen ? 'absolute bottom-0 left-0 right-0' : 'flex-shrink-0'} 
                            flex flex-wrap items-center justify-center bg-black/95 backdrop-blur-sm px-4 py-3 shadow-lg gap-2 border-t border-slate-800 transition-all duration-300
                            ${isFullscreen && !showControls ? 'opacity-0 translate-y-full pointer-events-none' : 'opacity-100 translate-y-0'}
                        `}
                        style={{ zIndex: 70 }}
                    >
                        <ControlBar variation="minimal" />

                        <button onClick={toggleFullscreen} title={isFullscreen ? '전체화면 종료' : '전체화면'} className="lk-button lk-button-icon">
                            {isFullscreen ? <FiMinimize size={20} /> : <FiMaximize size={20} />}
                        </button>

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

                        <button onClick={onLeave} className="lk-button bg-red-600 hover:bg-red-700 text-white font-semibold px-4 rounded-lg transition-colors" title="회의 나가기">
                            나가기
                        </button>
                    </div>
                </div>

                {/* 사이드바 - 전체화면/일반화면 상관없이 동일한 크기 유지 */}
                {isSidebarVisible && (
                    <aside className="flex-shrink-0 bg-slate-800 border-l border-slate-700 overflow-hidden w-full h-[40vh] md:h-full md:w-[360px]">
                        <TranscriptSidebar sttFinals={finals} />
                    </aside>
                )}

                <RoomAudioRenderer />
            </div>

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
                    0%, 50% {
                        opacity: 1;
                    }
                    51%, 100% {
                        opacity: 0;
                    }
                }

                .animate-fadeIn {
                    animation: fadeIn 0.3s ease-out;
                }

                .animate-blink {
                    animation: blink 1s infinite;
                }

                /* 전체화면에서 LiveKit 기본 스타일 오버라이드 */
                [data-lk-theme="default"] .lk-focus-layout,
                [data-lk-theme="default"] .lk-grid-layout {
                    width: 100% !important;
                    height: 100% !important;
                }

            `}</style>
        </LayoutContextProvider>
    );
};

export default ConferenceUI;
