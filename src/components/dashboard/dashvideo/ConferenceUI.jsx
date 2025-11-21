// src/components/dashboard/dashvideo/ConferenceUI.jsx
import { useEffect, useState, useRef, useContext } from 'react';
import { ControlBar, RoomAudioRenderer, LayoutContextProvider, useParticipants, useRoomContext, useDataChannel, useTracks } from '@livekit/components-react';
import { Track } from 'livekit-client';
import Swal from 'sweetalert2';
import TranscriptSidebar from './TranscriptSidebarComponents/TranscriptSidebar';
import CustomVideoGrid from './CustomVideoGrid';
import SubtitleOverlay from './SubtitleOverlay';
import MannerChecker from './MannerChecker';
import { FiCopy, FiMaximize, FiMinimize } from 'react-icons/fi';

// 🔥 유저 정보 + axios
import { UserContext } from '../../../contexts/UserContext';
import api from '../../../axios';

const ConferenceUI = ({ meetingTitle, onLeave, userLocale = 'ko-KR' }) => {
    const room = useRoomContext();
    const participants = useParticipants();
    const participantCount = participants.length;

    const { user } = useContext(UserContext);

    const [isSidebarVisible, setIsSidebarVisible] = useState(true);
    const [partials, setPartials] = useState({});
    const [finals, setFinals] = useState([]);

    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showControls, setShowControls] = useState(true);

    const mainContainerRef = useRef(null);
    const controlsTimeoutRef = useRef(null);

    // ❌ sttSeenRef 제거 - finals 배열에서 직접 관리
    const sttTimerRef = useRef(null);

    // 🔥 사이드바 "자료" 탭에 뿌릴 회의 문서 목록
    const [sidebarDocuments, setSidebarDocuments] = useState([]);

    // 화면 공유 상태 확인
    const tracks = useTracks([{ source: Track.Source.ScreenShare, withPlaceholder: false }], {
        onlySubscribed: false,
    });
    const hasScreenShare = tracks.length > 0;

    console.log('🌍 ConferenceUI userLocale:', userLocale);

    // ===== 회의 문서 목록 조회 (사이드바용) =====
    useEffect(() => {
        if (!user?.userId) return;

        const searchParams = new URLSearchParams(window.location.search);
        const meetingId = searchParams.get('id');
        if (!meetingId) return;

        const fetchMeetingDocsForSidebar = async () => {
            try {
                const res = await api.get(`/api/users/${user.userId}/meetings/${meetingId}/documents`);
                const items = Array.isArray(res.data?.items) ? res.data.items : [];

                const mapped = items.map((d) => {
                    const isTrans = !!d.trans_doc_id || d.doc_type === 'TRANSLATION';
                    const docId = isTrans ? d.trans_doc_id : d.doc_id;
                    const bytes = Number(isTrans ? d.trans_size_bytes ?? d.size : d.size) || 0;
                    const size = bytes > 0 ? `${(bytes / 1024 / 1024).toFixed(2)} MB` : '';
                    const name = d.original_name || d.title || '제목 없는 문서';

                    return {
                        id: docId,
                        trans_doc_id: d.trans_doc_id ?? null,
                        doc_type: isTrans ? 'TRANSLATION' : 'ORIGINAL',
                        title: name,
                        original_name: d.original_name,
                        size,
                        rel_path: d.rel_path || d.filepath,
                        source_lang: d.source_lang || d.original_lang,
                        target_language: d.target_language,
                        url: isTrans
                            ? `/api/users/${user.userId}/meetings/${meetingId}/documents/translations/${docId}/download`
                            : `/api/users/${user.userId}/meetings/${meetingId}/documents/${docId}/download`,
                    };
                });

                console.log('📂 sidebarDocuments mapped:', mapped);
                setSidebarDocuments(mapped);
            } catch (e) {
                console.error('회의 문서(사이드바) 불러오기 실패:', e);
                setSidebarDocuments([]);
            }
        };

        fetchMeetingDocsForSidebar();
    }, [user?.userId]);

    // 전체화면에서 마우스 움직임 감지
    useEffect(() => {
        if (!isFullscreen) {
            setShowControls(true);
            return;
        }

        setShowControls(false);

        const handleMouseMove = () => {
            setShowControls(true);
            if (controlsTimeoutRef.current) {
                clearTimeout(controlsTimeoutRef.current);
            }
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

    // 전체화면 토글
    const toggleFullscreen = async () => {
        const element = mainContainerRef.current;
        if (!element) {
            console.error('❌ Main container not found');
            return;
        }
        try {
            if (!document.fullscreenElement) {
                if (element.requestFullscreen) await element.requestFullscreen();
                else if (element.webkitRequestFullscreen) await element.webkitRequestFullscreen();
                else if (element.mozRequestFullScreen) await element.mozRequestFullScreen();
                else if (element.msRequestFullscreen) await element.msRequestFullscreen();
            } else {
                if (document.exitFullscreen) await document.exitFullscreen();
                else if (document.webkitExitFullscreen) await document.webkitExitFullscreen();
                else if (document.mozCancelFullScreen) await document.mozCancelFullScreen();
                else if (document.msExitFullscreen) await document.msExitFullscreen();
            }
        } catch (err) {
            console.error('❌ Fullscreen error:', err);
        }
    };

    // 전체화면 상태 감지
    useEffect(() => {
        const handleFullscreenChange = () => {
            const isFull = !!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement);
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

    // username 가져오기
    const getParticipantUsername = (identity) => {
        if (!identity) return 'Unknown';
        if (room.localParticipant?.identity === identity) {
            try {
                const metadata = JSON.parse(room.localParticipant.metadata || '{}');
                return metadata.username || room.localParticipant.name || identity;
            } catch {
                return room.localParticipant.name || identity;
            }
        }
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

    // 🔥 STT DataChannel 구독 (다국어 번역 처리)
    useDataChannel('stt', (msg) => {
        try {
            const text = new TextDecoder().decode(msg.payload);
            const data = JSON.parse(text);

            console.log('📺 STT received:', {
                final: data.final,
                identity: data.identity,
                text: data.text?.substring(0, 30) + '...',
                locale: data.locale,
                translations: data.translations,
                utteranceId: data.utteranceId || data.utterance_id,
            });

            const username = data.username || getParticipantUsername(data.identity) || data.identity || 'Unknown';
            const key = data.identity || data.participant_sid || 'unknown';

            // 🔑 utteranceId 우선 사용
            const utteranceId = data.utteranceId || data.utterance_id || `stt-${data.identity || 'unknown'}-${data.ts || Date.now()}`;
            const messageId = utteranceId;

            if (data.final) {
                // ✅ finals 배열에서 직접 업데이트 (sttSeenRef 제거)
                setFinals((prev) => {
                    const existingIndex = prev.findIndex((m) => m.id === messageId);

                    const newMessage = {
                        id: messageId,
                        utteranceId: utteranceId,
                        identity: data.identity,
                        username,
                        text: data.text || '',
                        locale: data.locale || 'ko-KR',
                        translations: data.translations || {},
                        ts: data.ts ?? Date.now(),
                    };

                    if (existingIndex !== -1) {
                        // ✅ 기존 메시지 업데이트
                        console.log('🔄 STT 업데이트:', messageId, {
                            기존: prev[existingIndex].text?.substring(0, 30),
                            신규: newMessage.text?.substring(0, 30),
                        });
                        const updated = [...prev];
                        updated[existingIndex] = newMessage;
                        return updated;
                    } else {
                        // ✅ 새 메시지 추가
                        console.log('➕ 새 STT 추가:', messageId);
                        return [...prev, newMessage];
                    }
                });

                // Partial 제거
                setPartials((prev) => {
                    const next = { ...prev };
                    delete next[key];
                    return next;
                });
            } else {
                // Partial STT (타이핑 중)
                if (sttTimerRef.current) {
                    clearTimeout(sttTimerRef.current);
                }

                sttTimerRef.current = setTimeout(() => {
                    setPartials((prev) => ({
                        ...prev,
                        [key]: {
                            text: data.text || '',
                            username,
                            identity: data.identity,
                        },
                    }));
                }, 100);
            }
        } catch (e) {
            console.error('❌ STT 파싱 오류:', e);
        }
    });

    // Disconnect 버튼 확인
    useEffect(() => {
        const handleDisconnectClick = async (e) => {
            e.preventDefault();
            e.stopPropagation();
            const result = await Swal.fire({
                title: '회의에서 나가시겠습니까?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#ef4444',
                cancelButtonColor: '#6b7280',
                confirmButtonText: '예, 나가기',
                cancelButtonText: '취소',
                reverseButtons: true,
                customClass: {
                    popup: 'rounded-2xl',
                    confirmButton: 'rounded-lg px-6 py-2.5 font-semibold',
                    cancelButton: 'rounded-lg px-6 py-2.5 font-semibold',
                },
                backdrop: 'rgba(0, 0, 0, 0.7)',
            });
            if (result.isConfirmed) {
                try {
                    await room.disconnect();
                } catch (error) {
                    console.error('❌ Error disconnecting from room:', error);
                }
                onLeave && onLeave();
            }
        };

        const findAndAttachListener = () => {
            const disconnectButton = document.querySelector('.lk-disconnect-button');
            if (disconnectButton) {
                disconnectButton.addEventListener('click', handleDisconnectClick, true);
                return disconnectButton;
            }
            return null;
        };

        const button = findAndAttachListener();
        let timeoutId;
        if (!button) timeoutId = setTimeout(findAndAttachListener, 500);

        return () => {
            const disconnectButton = document.querySelector('.lk-disconnect-button');
            if (disconnectButton) {
                disconnectButton.removeEventListener('click', handleDisconnectClick, true);
            }
            if (timeoutId) clearTimeout(timeoutId);
        };
    }, [room, onLeave]);

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
                    {/* 오버레이 */}
                    {(!isFullscreen || showControls) && (
                        <>
                            <MannerChecker room={room} debug={false} />

                            {/* 회의 정보 */}
                            <div className="absolute top-4 left-4 z-50 bg-black/60 backdrop-blur-sm px-4 py-2 rounded-xl text-white shadow-lg border border-white/10">
                                <p className="font-bold text-base">{meetingTitle || '회의'}</p>
                                <p className="text-xs text-slate-300">{participantCount > 0 ? `👥 ${participantCount}명 참여 중` : '연결 중...'}</p>
                            </div>
                        </>
                    )}

                    {/* 비디오 그리드 */}
                    <div className="flex-1 w-full relative overflow-hidden">
                        <CustomVideoGrid />

                        {/* 자막 오버레이 */}
                        {(!isFullscreen || showControls) && (
                            <div className="absolute bottom-23 left-0 right-0 z-[80] pointer-events-none">
                                <div className="flex justify-center">
                                    <SubtitleOverlay userLocale={userLocale} />
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
                        className={`${
                            isFullscreen ? 'absolute bottom-0 left-0 right-0' : 'flex-shrink-0'
                        } flex flex-wrap items-center justify-center bg-black/95 backdrop-blur-sm px-4 py-3 shadow-lg gap-2 border-t border-slate-800 transition-all duration-300 ${
                            isFullscreen && !showControls ? 'opacity-0 translate-y-full pointer-events-none' : 'opacity-100 translate-y-0'
                        }`}
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
                            title="채팅 및 정보"
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
                </div>

                {/* 사이드바 */}
                {isSidebarVisible && (
                    <aside className="flex-shrink-0 bg-slate-800 border-l border-slate-700 overflow-hidden w-full h-[40vh] md:h-full md:w-[360px]">
                        <TranscriptSidebar documents={sidebarDocuments} sttFinals={finals} userLocale={userLocale} />
                    </aside>
                )}

                <RoomAudioRenderer />
            </div>

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes blink {
                    0%, 50% { opacity: 1; }
                    51%, 100% { opacity: 0; }
                }
                .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
                .animate-blink { animation: blink 1s infinite; }

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
