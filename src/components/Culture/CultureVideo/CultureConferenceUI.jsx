// src/components/Culture/LiveView/CultureConferenceUI.jsx
import React, { useEffect, useState, useRef, useContext, useCallback } from 'react';
import { RoomAudioRenderer, LayoutContextProvider, useParticipants, useRoomContext, useDataChannel, useLocalParticipant } from '@livekit/components-react';
import Swal from 'sweetalert2';
import { FiCopy, FiMaximize, FiMinimize, FiHeart } from 'react-icons/fi';
import { Users, MessageCircle, Info, Mic, MicOff, Video, VideoOff, MonitorUp, PhoneOff, Palette } from 'lucide-react';
import CultureSubtitleOverlay from './CultureSubtitleOverlay';
import { UserContext } from '../../../contexts/UserContext';
import CustomVideoGrid from '../../dashboard/dashvideo/CustomVideoGrid';
import MannerChecker from '../../dashboard/dashvideo/MannerChecker';
import CultureLiveChatSidebar from './CultureLiveChatSidebar';
import SpecialEffectAnimation from '../contents/SpecialEffectAnimation';
import ThemeBackground from '../contents/ThemeBackground';
import BackgroundThemeSelector from '../contents/BackgroundThemeSelector';
import '../../../css/EnhancedAnimations.css';
import { BACKGROUND_THEMES } from '../contents/backgroundThemes';

const CultureConferenceUI = ({ meetingTitle, onLeave, userLocale = 'ko-KR' }) => {
    const room = useRoomContext();
    const participants = useParticipants();
    const participantCount = participants.length;
    const { user } = useContext(UserContext);
    const { localParticipant } = useLocalParticipant();

    const [partials, setPartials] = useState({});
    const [finals, setFinals] = useState([]);
    const [chatMessages, setChatMessages] = useState([]);
    const [likes, setLikes] = useState(Math.floor(Math.random() * 500) + 100);

    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const [activeTab, setActiveTab] = useState('info');
    const [showChatSidebar, setShowChatSidebar] = useState(true);
    const [showThemeSelector, setShowThemeSelector] = useState(false);

    // 🎨 배경 테마 상태 (DataChannel로 동기화)
    const [currentTheme, setCurrentTheme] = useState('default');

    // 미디어 상태
    const [isMicOn, setIsMicOn] = useState(true);
    const [isCameraOn, setIsCameraOn] = useState(true);
    const [isScreenSharing, setIsScreenSharing] = useState(false);

    const mainContainerRef = useRef(null);
    const controlsTimeoutRef = useRef(null);
    const [activeEffects, setActiveEffects] = useState([]);
    const sttSeenRef = useRef(new Set());
    const sttTimerRef = useRef(null);
    console.log('showThemeSelector:', showThemeSelector);
    // 🎨 테마 변경 DataChannel
    const { send: sendTheme } = useDataChannel('theme_change');

    // 🎨 테마 변경 수신
    useDataChannel('theme_change', (msg) => {
        try {
            const textDecoder = new TextDecoder();
            const data = JSON.parse(textDecoder.decode(msg.payload));
            if (data.themeId) {
                setCurrentTheme(data.themeId);
            }
        } catch (error) {
            console.error('테마 변경 수신 오류:', error);
        }
    });

    // 🎨 테마 변경 핸들러 (모든 참가자에게 전송)
    const handleThemeChange = (themeId) => {
        setCurrentTheme(themeId);

        // 다른 참가자들에게 테마 변경 알림
        if (sendTheme) {
            const textEncoder = new TextEncoder();
            sendTheme(textEncoder.encode(JSON.stringify({ themeId })));
        }
    };

    const handleEffectTrigger = (effect) => {
        const id = Date.now() + Math.random();
        setActiveEffects((prev) => [...prev, { ...effect, id }]);
    };

    const handleEffectComplete = (id) => {
        setActiveEffects((prev) => prev.filter((e) => e.id !== id));
    };

    // 미디어 상태 동기화
    useEffect(() => {
        if (!localParticipant) return;

        const updateMediaStates = () => {
            setIsMicOn(localParticipant.isMicrophoneEnabled);
            setIsCameraOn(localParticipant.isCameraEnabled);
            setIsScreenSharing(localParticipant.isScreenShareEnabled);
        };

        updateMediaStates();

        localParticipant.on('trackPublished', updateMediaStates);
        localParticipant.on('trackUnpublished', updateMediaStates);
        localParticipant.on('localTrackPublished', updateMediaStates);
        localParticipant.on('localTrackUnpublished', updateMediaStates);

        return () => {
            localParticipant.off('trackPublished', updateMediaStates);
            localParticipant.off('trackUnpublished', updateMediaStates);
            localParticipant.off('localTrackPublished', updateMediaStates);
            localParticipant.off('localTrackUnpublished', updateMediaStates);
        };
    }, [localParticipant]);

    const toggleMicrophone = async () => {
        if (!localParticipant) return;
        try {
            await localParticipant.setMicrophoneEnabled(!isMicOn);
            setIsMicOn(!isMicOn);
        } catch (error) {
            console.error('마이크 토글 오류:', error);
        }
    };

    const toggleCamera = async () => {
        if (!localParticipant) return;
        try {
            await localParticipant.setCameraEnabled(!isCameraOn);
            setIsCameraOn(!isCameraOn);
        } catch (error) {
            console.error('카메라 토글 오류:', error);
        }
    };

    const toggleScreenShare = async () => {
        if (!localParticipant) return;
        try {
            await localParticipant.setScreenShareEnabled(!isScreenSharing);
            setIsScreenSharing(!isScreenSharing);
        } catch (error) {
            console.error('화면 공유 토글 오류:', error);
        }
    };

    const handleLeaveRoom = async () => {
        const result = await Swal.fire({
            title: '라이브에서 나가시겠습니까?',
            text: '나가시면 실시간 번역 연결이 종료됩니다.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: '예, 나가기',
            cancelButtonText: '취소',
            reverseButtons: true,
        });

        if (result.isConfirmed) {
            try {
                await room.disconnect();
            } catch (error) {
                console.error('⚠️ Error disconnecting:', error);
            }
            onLeave && onLeave();
        }
    };

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

    const toggleFullscreen = async () => {
        const element = mainContainerRef.current;
        if (!element) return;

        try {
            if (!document.fullscreenElement) {
                if (element.requestFullscreen) await element.requestFullscreen();
                else if (element.webkitRequestFullscreen) await element.webkitRequestFullscreen();
            } else {
                if (document.exitFullscreen) await document.exitFullscreen();
                else if (document.webkitExitFullscreen) await document.webkitExitFullscreen();
            }
        } catch (err) {
            console.error('⚠️ Fullscreen error:', err);
        }
    };

    useEffect(() => {
        const handleFullscreenChange = () => {
            const isFull = !!(document.fullscreenElement || document.webkitFullscreenElement);
            setIsFullscreen(isFull);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        document.addEventListener('webkitfullscreenchange', handleFullscreenChange);

        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
        };
    }, []);

    const getParticipantUsername = useCallback(
        (identity) => {
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
        },
        [room],
    );

    const handleSttMessage = useCallback(
        (msg) => {
            try {
                const text = new TextDecoder().decode(msg.payload);
                const data = JSON.parse(text);

                const username = data.username || getParticipantUsername(data.identity) || data.identity || 'Unknown';
                const key = data.identity || data.participant_sid || 'unknown';
                const messageId = `stt-${data.identity || 'unknown'}-${data.text || ''}-${data.ts || ''}`;

                if (data.final) {
                    if (sttSeenRef.current.has(messageId)) {
                        return;
                    }
                    sttSeenRef.current.add(messageId);

                    setTimeout(() => {
                        sttSeenRef.current.delete(messageId);
                    }, 10000);

                    const finalMsg = {
                        id: messageId,
                        identity: data.identity,
                        username,
                        text: data.text || '',
                        locale: data.locale || 'ko-KR',
                        translations: data.translations || {},
                        ts: data.ts ?? Date.now(),
                    };

                    setFinals((prev) => {
                        if (prev.some((m) => m.id === messageId)) {
                            return prev;
                        }
                        return [...prev, finalMsg];
                    });

                    setChatMessages((prev) => {
                        if (prev.some((m) => m.id === messageId)) {
                            return prev;
                        }
                        return [
                            ...prev,
                            {
                                id: messageId,
                                username,
                                text: data.text,
                                translations: data.translations,
                                timestamp: new Date(),
                            },
                        ];
                    });

                    setPartials((prev) => {
                        const next = { ...prev };
                        delete next[key];
                        return next;
                    });
                } else {
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
                console.error('⚠️ STT 파싱 오류:', e);
            }
        },
        [getParticipantUsername],
    );

    useDataChannel('stt', handleSttMessage);

    const handleLike = () => {
        setLikes((prev) => prev + 1);

        const heart = document.createElement('div');
        heart.innerHTML = '❤️';
        heart.style.position = 'fixed';
        heart.style.left = `${Math.random() * 80 + 10}%`;
        heart.style.bottom = '20%';
        heart.style.fontSize = '2rem';
        heart.style.zIndex = '9999';
        heart.style.animation = 'floatUp 2s ease-out forwards';
        heart.style.pointerEvents = 'none';

        document.body.appendChild(heart);

        setTimeout(() => {
            document.body.removeChild(heart);
        }, 2000);
    };

    const handleCopyLink = () => {
        const currentUrl = window.location.href;
        navigator.clipboard.writeText(currentUrl).then(() => {
            Swal.fire({
                icon: 'success',
                title: '복사 완료!',
                text: '라이브 주소가 클립보드에 복사되었습니다.',
                timer: 1500,
                showConfirmButton: false,
                toast: true,
                position: 'top-end',
            });
        });
    };

    return (
        <LayoutContextProvider>
            {/* 🎨 테마 선택기 모달 */}
            {showThemeSelector && <BackgroundThemeSelector currentTheme={currentTheme} onThemeChange={handleThemeChange} onClose={() => setShowThemeSelector(false)} />}

            <div data-lk-theme="default" className="w-full min-h-screen relative overflow-hidden">
                {/* 🎨 배경 테마 레이어 */}
                <div className="fixed inset-0 z-0">
                    <ThemeBackground themeId={currentTheme} />
                </div>

                {/* 메인 컨텐츠 (배경 위에 표시) */}
                <div className="relative z-10 w-full max-w-[1800px] mx-auto px-4 py-6">
                    <div className={`flex gap-4 ${isFullscreen ? 'flex-col' : 'flex-col lg:flex-row'}`}>
                        {/* 왼쪽: 영상 영역 */}
                        <div className={`${isFullscreen ? 'w-full' : 'flex-1 lg:flex-[2]'}`}>
                            <div
                                ref={mainContainerRef}
                                className="rounded-3xl overflow-hidden bg-black shadow-[0_18px_45px_rgba(15,23,42,0.4)] relative"
                                style={{ cursor: isFullscreen && !showControls ? 'none' : 'default' }}
                            >
                                <div className="relative w-full aspect-[16/9] bg-black">
                                    {/* 이펙트 오버레이 */}
                                    {activeEffects.map((effect) => (
                                        <SpecialEffectAnimation key={effect.id} effect={effect} onComplete={() => handleEffectComplete(effect.id)} />
                                    ))}

                                    {/* 비디오 그리드 */}
                                    <CustomVideoGrid />

                                    {/* 매너체커 + LIVE 오버레이 */}
                                    {(!isFullscreen || showControls) && (
                                        <>
                                            <MannerChecker room={room} debug={false} demo={false} />

                                            <div className="absolute top-4 left-4 z-50 bg-gradient-to-r from-pink-600/80 to-purple-600/80 backdrop-blur-sm px-4 py-2 rounded-xl text-white shadow-lg border border-white/15">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                                                    <span className="text-xs font-bold">LIVE</span>
                                                    <span className="flex items-center text-[11px] text-white/80 ml-2">
                                                        <Users className="w-3 h-3 mr-1" />
                                                        {participantCount}명 시청 중
                                                    </span>
                                                </div>
                                                <p className="font-bold text-base">{meetingTitle || '문화 라이브'}</p>
                                            </div>

                                            <div className="absolute top-4 right-4 z-50 flex gap-2">
                                                {/* 테마 변경 버튼 */}
                                                <button
                                                    onClick={() => setShowThemeSelector(true)}
                                                    className="bg-white/90 backdrop-blur-sm p-2.5 rounded-full hover:bg-white transition-all shadow-lg hover:scale-105"
                                                    title="배경 테마 변경"
                                                >
                                                    <Palette className="w-5 h-5 text-purple-600" />
                                                </button>

                                                <button
                                                    onClick={handleLike}
                                                    className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full flex items-center gap-2 hover:bg-white transition-all shadow-lg hover:scale-105"
                                                >
                                                    <FiHeart className="text-pink-500" size={20} />
                                                    <span className="text-gray-800 font-bold">{likes.toLocaleString()}</span>
                                                </button>
                                            </div>
                                        </>
                                    )}

                                    {/* 자막 오버레이 */}
                                    {(!isFullscreen || showControls) && (
                                        <div className="absolute bottom-24 left-0 right-0 z-[80] pointer-events-none">
                                            <div className="flex justify-center">
                                                <CultureSubtitleOverlay userLocale={userLocale} />
                                            </div>
                                        </div>
                                    )}

                                    {/* STT 타이핑 중 */}
                                    {Object.keys(partials).length > 0 && (!isFullscreen || showControls) && (
                                        <div className="absolute bottom-36 left-1/2 -translate-x-1/2 w-[90%] max-w-3xl z-35">
                                            {Object.entries(partials).map(([key, data]) => (
                                                <div key={key} className="bg-pink-500/20 backdrop-blur-md border-2 border-pink-400/50 text-white rounded-xl px-4 py-2 mb-2 shadow-lg animate-pulse">
                                                    <div className="text-center">
                                                        <span className="text-xs font-bold text-pink-300 mr-2">🎙️ {data.username} (입력 중...)</span>
                                                        <p className="text-base leading-6 mt-1">
                                                            {data.text}
                                                            <span className="inline-block w-2 h-4 bg-pink-400 ml-1 animate-blink" />
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* 하단 컨트롤 바 */}
                                    <div
                                        className={`absolute left-0 right-0 bottom-0 flex flex-wrap items-center justify-center bg-gradient-to-t from-black/90 via-black/70 to-transparent px-4 pb-4 pt-6 gap-3 transition-all duration-300 ${
                                            isFullscreen && !showControls ? 'opacity-0 translate-y-full pointer-events-none' : 'opacity-100 translate-y-0'
                                        }`}
                                        style={{ zIndex: 90 }}
                                    >
                                        <button
                                            onClick={toggleMicrophone}
                                            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg hover:scale-110 ${
                                                isMicOn ? 'bg-white text-green-600 hover:bg-green-50' : 'bg-white text-red-600 hover:bg-red-50'
                                            }`}
                                            title={isMicOn ? '마이크 끄기' : '마이크 켜기'}
                                        >
                                            {isMicOn ? <Mic size={20} strokeWidth={2.5} /> : <MicOff size={20} strokeWidth={2.5} />}
                                        </button>

                                        <button
                                            onClick={toggleCamera}
                                            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg hover:scale-110 ${
                                                isCameraOn ? 'bg-white text-green-600 hover:bg-green-50' : 'bg-white text-red-600 hover:bg-red-50'
                                            }`}
                                            title={isCameraOn ? '카메라 끄기' : '카메라 켜기'}
                                        >
                                            {isCameraOn ? <Video size={20} strokeWidth={2.5} /> : <VideoOff size={20} strokeWidth={2.5} />}
                                        </button>

                                        <button
                                            onClick={toggleScreenShare}
                                            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg hover:scale-110 ${
                                                isScreenSharing ? 'bg-white text-green-600 hover:bg-green-50' : 'bg-white text-gray-600 hover:bg-gray-50'
                                            }`}
                                            title={isScreenSharing ? '화면 공유 중지' : '화면 공유'}
                                        >
                                            <MonitorUp size={20} strokeWidth={2.5} />
                                        </button>

                                        <button
                                            onClick={toggleFullscreen}
                                            className="w-12 h-12 rounded-full bg-white text-gray-600 hover:bg-gray-50 flex items-center justify-center transition-all duration-200 shadow-lg hover:scale-110"
                                            title={isFullscreen ? '전체화면 종료' : '전체화면'}
                                        >
                                            {isFullscreen ? <FiMinimize size={20} /> : <FiMaximize size={20} />}
                                        </button>

                                        <button
                                            onClick={handleCopyLink}
                                            className="w-12 h-12 rounded-full bg-white text-gray-600 hover:bg-gray-50 flex items-center justify-center transition-all duration-200 shadow-lg hover:scale-110"
                                            title="라이브 주소 복사"
                                        >
                                            <FiCopy size={20} />
                                        </button>

                                        <button
                                            onClick={handleLeaveRoom}
                                            className="w-12 h-12 rounded-full bg-red-500 text-white hover:bg-red-600 flex items-center justify-center transition-all duration-200 shadow-lg hover:scale-110"
                                            title="라이브 나가기"
                                        >
                                            <PhoneOff size={20} strokeWidth={2.5} />
                                        </button>
                                    </div>
                                </div>

                                <RoomAudioRenderer />
                            </div>
                        </div>

                        {/* 오른쪽: 채팅 사이드바 */}
                        {showChatSidebar && !isFullscreen && (
                            <div className="w-full lg:w-[420px] lg:flex-shrink-0">
                                <div className="sticky top-6" style={{ height: 'calc(100vh - 3rem)', maxHeight: '800px' }}>
                                    <CultureLiveChatSidebar userLocale={userLocale} sttFinals={finals} onClose={() => setShowChatSidebar(false)} onEffectTrigger={handleEffectTrigger} />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* 영상 아래: 정보 카드 (배경 위에 표시) */}
                <div className="relative z-10 w-full max-w-[1800px] mx-auto px-4 pb-10 space-y-6">
                    <section className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl px-6 py-5 space-y-4 border border-white/50">
                        <div className="space-y-2">
                            <div className="flex flex-wrap gap-2 text-[11px] font-semibold">
                                <span className="px-2 py-1 rounded-full bg-slate-900 text-pink-100">KR ↔ EN</span>
                                <span className="px-2 py-1 rounded-full bg-pink-100 text-pink-700">#K-밈</span>
                                <span className="px-2 py-1 rounded-full bg-violet-100 text-violet-700">리액션</span>
                            </div>
                            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">{meetingTitle || '실시간 K-밈 리액션 🔥 해외 친구들과 함께하는 밈 파티'}</h1>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-violet-500" />
                                <div className="flex flex-col">
                                    <span className="font-semibold text-slate-900">{user?.name || '밈마스터'}</span>
                                    <span className="text-xs text-slate-500">{participantCount}명 시청 중</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 pt-1 border-t border-slate-100 mt-2">
                            <button
                                onClick={handleLike}
                                className="flex-1 min-w-[120px] flex items-center justify-center gap-2 px-4 py-2 rounded-full border border-pink-200 text-pink-600 font-semibold text-sm hover:bg-pink-50 transition-colors"
                            >
                                <FiHeart className="w-4 h-4" />
                                좋아요 {likes.toLocaleString()}
                            </button>
                            <button className="flex-1 min-w-[120px] flex items-center justify-center gap-2 px-4 py-2 rounded-full border border-pink-200 text-slate-700 font-semibold text-sm hover:bg-pink-50 transition-colors">
                                공유
                            </button>
                            <button className="flex-1 min-w-[120px] flex items-center justify-center gap-2 px-4 py-2 rounded-full border border-pink-200 text-slate-700 font-semibold text-sm hover:bg-pink-50 transition-colors">
                                저장
                            </button>
                        </div>
                    </section>

                    <section className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50">
                        <div className="flex border-b border-pink-100 px-6 pt-4">
                            <button
                                onClick={() => setActiveTab('info')}
                                className={`flex items-center gap-2 pb-3 mr-6 text-sm font-semibold ${
                                    activeTab === 'info' ? 'text-pink-600 border-b-2 border-pink-500' : 'text-slate-400 hover:text-slate-600'
                                }`}
                            >
                                <Info className="w-4 h-4" />
                                정보
                            </button>
                            <button
                                onClick={() => setActiveTab('members')}
                                className={`flex items-center gap-2 pb-3 text-sm font-semibold ${
                                    activeTab === 'members' ? 'text-pink-600 border-b-2 border-pink-500' : 'text-slate-400 hover:text-slate-600'
                                }`}
                            >
                                <Users className="w-4 h-4" />
                                참여자
                            </button>
                        </div>

                        <div className="px-6 py-5">
                            {activeTab === 'members' && (
                                <div className="space-y-2 text-sm">
                                    <div className="text-xs text-slate-400 mb-3">현재 참여자 {participants.length}명</div>
                                    {participants.map((p) => (
                                        <div key={p.identity} className="flex items-center gap-3 py-2 border-b border-slate-50 last:border-0">
                                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                                                {(p.name || p.identity).charAt(0).toUpperCase()}
                                            </div>
                                            <span className="text-slate-800 font-medium">{p.name || p.identity}</span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {activeTab === 'info' && (
                                <div className="text-sm text-slate-700 space-y-3">
                                    <p className="leading-relaxed">문화/밈 전용 실시간 번역 라이브입니다. 카메라/음성/화면공유를 통해 방송하고, 번역 자막은 상단 영상 아래에 버블 형태로 노출됩니다.</p>
                                    <div className="bg-pink-50 rounded-xl p-4 border border-pink-100">
                                        <p className="text-xs text-slate-500 mb-1">현재 언어 설정</p>
                                        <p className="font-mono text-pink-600 font-semibold">{userLocale}</p>
                                    </div>
                                    <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
                                        <p className="text-xs text-slate-500 mb-2">🎨 현재 배경 테마</p>
                                        <div className="flex items-center gap-2">
                                            <div
                                                className="w-12 h-12 rounded-lg shadow-md"
                                                style={{
                                                    background: BACKGROUND_THEMES[currentTheme]?.gradient || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                }}
                                            />
                                            <span className="font-semibold text-purple-700">{BACKGROUND_THEMES[currentTheme]?.name || '기본'}</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>
                </div>

                <style>{`
                @keyframes blink { 0%, 50% { opacity: 1; } 51%, 100% { opacity: 0; } }
                @keyframes floatUp { 0% { opacity: 1; transform: translateY(0) scale(1); } 100% { opacity: 0; transform: translateY(-100px) scale(1.5); } }
                .animate-blink { animation: blink 1s infinite; }
            `}</style>
            </div>
        </LayoutContextProvider>
    );
};

export default CultureConferenceUI;
