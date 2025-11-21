// src/components/Culture/CultureVideo/CultureConferenceUI.jsx
import React, { useEffect, useState, useRef, useContext, useCallback, useMemo } from 'react';
import { RoomAudioRenderer, LayoutContextProvider, useParticipants, useRoomContext, useDataChannel, useLocalParticipant } from '@livekit/components-react';
import Swal from 'sweetalert2';
import { FiCopy, FiMaximize, FiMinimize, FiHeart } from 'react-icons/fi';
import { Users, MessageCircle, Info, Mic, MicOff, Video, VideoOff, MonitorUp, PhoneOff, Palette, Image as ImageIcon } from 'lucide-react';
import CultureSubtitleOverlay from './CultureSubtitleOverlay';
import { UserContext } from '../../../contexts/UserContext';
import CustomVideoGrid from '../../dashboard/dashvideo/CustomVideoGrid';
import CultureLiveChatSidebar from './CultureLiveChatSidebar';
import SpecialEffectAnimation from '../contents/SpecialEffectAnimation';
import ThemeBackground from '../contents/ThemeBackground';
import BackgroundThemeSelector from '../contents/BackgroundThemeSelector';
import ThemeTransitionAnimation from '../contents/ThemeTransitionAnimation';
import api from '../../../axios';

import '../../../css/EnhancedAnimations.css';
import { BACKGROUND_THEMES } from '../contents/backgroundThemes';
import CultureAlert from './CultureAlert';
import { useVirtualBackground } from '../../../hooks/useVirtualBackground';

import VirtualBgModal from '../contents/VirtualBgModal';
import { DEFAULT_VIRTUAL_BG_ID, findVirtualBgPreset, VIRTUAL_BG_PRESETS } from '../contents/VIRTUAL_BG_PRESETS ';

const CultureConferenceUI = ({ meetingId, meetingTitle, onLeave, userLocale = 'ko-KR', meetingDesc, isHost }) => {
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

    const [currentTheme, setCurrentTheme] = useState('default');

    const [showThemeAnimation, setShowThemeAnimation] = useState(false);
    const [animatingTheme, setAnimatingTheme] = useState(null);

    const [isMicOn, setIsMicOn] = useState(true);
    const [isCameraOn, setIsCameraOn] = useState(true);
    const [isScreenSharing, setIsScreenSharing] = useState(false);

    const mainContainerRef = useRef(null);
    const controlsTimeoutRef = useRef(null);
    const [activeEffects, setActiveEffects] = useState([]);
    const sttTimerRef = useRef(null);

    const { send: sendTheme } = useDataChannel('theme_change');
    const { send: sendVirtualBg } = useDataChannel('virtual_bg_change');

    // 참가자별 virtualBgId 맵 { identity: 'korean-room' }
    const [virtualBgMap, setVirtualBgMap] = useState({});

    // 🔥 배경 변경 하이라이트 정보
    const [bgHighlight, setBgHighlight] = useState(null);
    // { identity, token, category }

    // 가상 배경 상태 (카메라 뒤 배경)
    const [virtualBgId, setVirtualBgId] = useState(DEFAULT_VIRTUAL_BG_ID);
    const [pendingVirtualBgId, setPendingVirtualBgId] = useState(DEFAULT_VIRTUAL_BG_ID);
    const [showVirtualBgModal, setShowVirtualBgModal] = useState(false);

    // 선택된 가상 배경 프리셋
    const selectedVirtualBg = useMemo(() => findVirtualBgPreset(virtualBgId), [virtualBgId]);

    // 참가자별 카메라 OFF 이미지용 fallback URL 계산
    const getFallbackBackgroundUrlForParticipant = useCallback(
        (participant) => {
            const id = participant.identity;

            let bgId;
            if (id === room.localParticipant?.identity) {
                bgId = virtualBgId; // 내 배경
            } else {
                bgId = virtualBgMap[id]; // 다른 사람 배경
            }

            const preset = findVirtualBgPreset(bgId);
            if (preset?.type === 'image' && preset.imageUrl) {
                // image 타입이면 선택한 이미지 사용
                return preset.imageUrl;
            }

            // none/blur 등은 null 리턴 → LiveKit 기본 프로필 사용
            return null;
        },
        [room, virtualBgId, virtualBgMap],
    );

    // 실제 카메라에 가상 배경 적용 (segmentation + bg)
    useVirtualBackground(selectedVirtualBg);

    // =============================
    // 🔔 테마 변경 수신
    // =============================
    useDataChannel('theme_change', (msg) => {
        try {
            const textDecoder = new TextDecoder();
            const data = JSON.parse(textDecoder.decode(msg.payload));

            if (data.themeId) {
                if (data.showAnimation) {
                    setAnimatingTheme(data.themeId);
                    setShowThemeAnimation(true);
                } else {
                    setCurrentTheme(data.themeId);
                }
            }
        } catch (error) {
            console.error('테마 변경 수신 오류:', error);
        }
    });

    // =============================
    // 🔔 가상 배경 변경 수신 (다른 참가자)
    // =============================
    useDataChannel('virtual_bg_change', (msg) => {
        try {
            const text = new TextDecoder().decode(msg.payload);
            const data = JSON.parse(text);

            if (data.type !== 'virtual_bg') return;
            if (!data.identity || !data.bgId) return;

            setVirtualBgMap((prev) => ({
                ...prev,
                [data.identity]: data.bgId,
            }));

            // 🔥 수신한 참가자 타일 하이라이트
            const preset = findVirtualBgPreset(data.bgId);
            const category = preset?.category || 'basic';

            setBgHighlight({
                identity: data.identity,
                token: Date.now(),
                category,
            });
        } catch (e) {
            console.error('virtual_bg_change 수신 오류:', e);
        }
    });

    // =============================
    // 🎨 테마 관련 핸들러
    // =============================
    const handleThemeChange = (themeId) => {
        setCurrentTheme(themeId);
        if (sendTheme) {
            const textEncoder = new TextEncoder();
            sendTheme(
                textEncoder.encode(
                    JSON.stringify({
                        themeId,
                        showAnimation: false,
                    }),
                ),
            );
        }
    };

    const handleThemeSelectorClose = (selectedThemeId) => {
        setShowThemeSelector(false);

        if (selectedThemeId) {
            if (sendTheme) {
                const textEncoder = new TextEncoder();
                sendTheme(
                    textEncoder.encode(
                        JSON.stringify({
                            themeId: selectedThemeId,
                            showAnimation: true,
                        }),
                    ),
                );
            }

            setTimeout(() => {
                setAnimatingTheme(selectedThemeId);
                setShowThemeAnimation(true);
            }, 300);
        }
    };

    const handleAnimationComplete = () => {
        setShowThemeAnimation(false);
        if (animatingTheme && animatingTheme !== currentTheme) {
            setCurrentTheme(animatingTheme);
        }
    };

    // =============================
    // 🎆 이펙트
    // =============================
    const handleEffectTrigger = (effect) => {
        const id = Date.now() + Math.random();
        setActiveEffects((prev) => [...prev, { ...effect, id }]);
    };

    const handleEffectComplete = (id) => {
        setActiveEffects((prev) => prev.filter((e) => e.id !== id));
    };

    // =============================
    // 🎛 마이크 / 카메라 / 화면공유 상태 반영
    // =============================
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

    // =============================
    // 🚪 나가기 / 방 종료 통합 버튼
    // =============================
    const handleExitClick = async () => {
        // 🔸 호스트: 방 완전 종료
        if (isHost) {
            if (!user?.userId || !meetingId) {
                Swal.fire({
                    icon: 'error',
                    title: '종료할 수 없습니다',
                    text: '유저 정보 또는 라이브 ID가 없습니다.',
                });
                return;
            }

            const result = await Swal.fire({
                title: '라이브를 종료하시겠습니까?',
                text: '라이브를 종료하면 참여자도 더 이상 입장할 수 없습니다.',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#ef4444',
                cancelButtonColor: '#6b7280',
                confirmButtonText: '예, 라이브 종료',
                cancelButtonText: '취소',
                reverseButtons: true,
            });

            if (!result.isConfirmed) return;

            try {
                // 🔥 서버에 ENDED 처리
                await api.patch(`/api/users/${user.userId}/meetings/${meetingId}/end`);

                await Swal.fire({
                    icon: 'success',
                    title: '라이브가 종료되었습니다',
                    text: '라이브 목록에서 더 이상 노출되지 않습니다.',
                    timer: 1500,
                    showConfirmButton: false,
                });

                try {
                    await room.disconnect();
                } catch (error) {
                    console.error('⚠️ Error disconnecting after end:', error);
                }

                onLeave && onLeave();
                window.close();
                setTimeout(() => {
                    if (!window.closed) {
                        window.history.back();
                    }
                }, 100);
            } catch (error) {
                console.error('라이브 종료 중 오류:', error);
                Swal.fire({
                    icon: 'error',
                    title: '라이브 종료 실패',
                    text: error.response?.data?.message || '라이브 종료 중 오류가 발생했습니다.',
                });
            }

            return;
        }

        // 🔹 일반 참가자: 그냥 나가기
        const result = await Swal.fire({
            title: '라이브에서 나가시겠습니까?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: '예, 나가기',
            cancelButtonText: '취소',
            reverseButtons: true,
        });

        if (!result.isConfirmed) return;

        try {
            await room.disconnect();
        } catch (error) {
            console.error('⚠️ Error disconnecting:', error);
        }

        onLeave && onLeave();
        window.close();
        setTimeout(() => {
            if (!window.closed) {
                window.history.back();
            }
        }, 100);
    };

    // =============================
    // 🖥 풀스크린 컨트롤 표시/숨김
    // =============================
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

    // =============================
    // 👤 사용자명 매핑
    // =============================
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

    // =============================
    // 🎙 STT DataChannel
    // =============================
    const handleSttMessage = useCallback(
        (msg) => {
            try {
                const text = new TextDecoder().decode(msg.payload);
                const data = JSON.parse(text);

                const username = data.username || getParticipantUsername(data.identity) || data.identity || 'Unknown';
                const key = data.identity || data.participant_sid || 'unknown';

                const utteranceId = data.utterance_id || data.utteranceId || `stt-${data.identity || 'unknown'}-${data.ts || ''}`;

                if (data.final) {
                    const finalMsg = {
                        id: utteranceId,
                        utteranceId,
                        identity: data.identity,
                        username,
                        text: data.text || '',
                        locale: data.locale || 'ko-KR',
                        translations: data.translations || {},
                        ts: data.ts ?? Date.now(),
                    };

                    setFinals((prev) => {
                        const idx = prev.findIndex((m) => m.utteranceId === utteranceId || m.id === utteranceId);
                        if (idx === -1) {
                            return [...prev, finalMsg];
                        }
                        const next = [...prev];
                        next[idx] = {
                            ...next[idx],
                            ...finalMsg,
                        };
                        return next;
                    });

                    setChatMessages((prev) => {
                        const idx = prev.findIndex((m) => m.id === utteranceId);
                        const base = {
                            id: utteranceId,
                            username,
                            text: data.text,
                            translations: data.translations,
                            timestamp: new Date(),
                        };
                        if (idx === -1) return [...prev, base];
                        const next = [...prev];
                        next[idx] = {
                            ...next[idx],
                            ...base,
                        };
                        return next;
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
                                locale: data.locale || 'ko-KR',
                                translations: data.translations || {},
                                ts: data.ts ?? Date.now(),
                                utteranceId,
                            },
                        }));
                    }, 50);
                }
            } catch (e) {
                console.error('⚠️ STT 파싱 오류:', e);
            }
        },
        [getParticipantUsername],
    );

    useDataChannel('stt', handleSttMessage);

    // =============================
    // ❤️ 좋아요
    // =============================
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

    // =============================
    // 🎨 가상 배경 모달
    // =============================
    const openVirtualBgModal = () => {
        setPendingVirtualBgId(virtualBgId);
        setShowVirtualBgModal(true);
    };

    const handleApplyVirtualBg = (selectedId) => {
        const finalId = selectedId || DEFAULT_VIRTUAL_BG_ID;
        const preset = findVirtualBgPreset(finalId);
        const category = preset?.category || 'basic';

        // 1) 내 UI/훅 상태 반영
        setVirtualBgId(finalId);
        setShowVirtualBgModal(false);

        // 2) 내 identity → 선택한 bgId 를 로컬 맵에 반영 + 하이라이트
        if (room?.localParticipant?.identity) {
            const myId = room.localParticipant.identity;
            setVirtualBgMap((prev) => ({
                ...prev,
                [myId]: finalId,
            }));

            setBgHighlight({
                identity: myId,
                token: Date.now(),
                category,
            });
        }

        // 3) DataChannel 로 다른 참가자들에게 브로드캐스트
        if (sendVirtualBg && room?.localParticipant?.identity) {
            const payload = {
                type: 'virtual_bg',
                identity: room.localParticipant.identity,
                bgId: finalId,
            };
            const encoder = new TextEncoder();
            sendVirtualBg(encoder.encode(JSON.stringify(payload)));
        }
    };

    // =============================
    // JSX
    // =============================
    return (
        <LayoutContextProvider>
            {showThemeSelector && <BackgroundThemeSelector currentTheme={currentTheme} onThemeChange={handleThemeChange} onClose={handleThemeSelectorClose} />}

            {showThemeAnimation && animatingTheme && <ThemeTransitionAnimation themeId={animatingTheme} onComplete={handleAnimationComplete} />}

            {/* 🔥 카메라 배경 설정 모달 컴포넌트 */}
            <VirtualBgModal
                isOpen={showVirtualBgModal}
                presets={VIRTUAL_BG_PRESETS}
                pendingVirtualBgId={pendingVirtualBgId}
                onSelectPreset={setPendingVirtualBgId}
                onApply={handleApplyVirtualBg}
                onClose={() => setShowVirtualBgModal(false)}
            />

            <div data-lk-theme="default" className="w-full min-h-screen relative overflow-hidden">
                <div className="fixed inset-0 z-0">
                    <ThemeBackground themeId={currentTheme} />
                </div>

                <div className="relative z-10 w-full h-screen flex flex-col">
                    <div className="flex-1 flex flex-col lg:flex-row p-2 sm:p-4 gap-2 sm:gap-4 overflow-hidden">
                        <div className={`flex-1 ${showChatSidebar && !isFullscreen ? 'lg:flex-[2]' : ''} transition-all duration-300`}>
                            <div
                                ref={mainContainerRef}
                                className="h-full rounded-2xl sm:rounded-3xl overflow-hidden bg-black shadow-xl sm:shadow-2xl relative"
                                style={{
                                    cursor: isFullscreen && !showControls ? 'none' : 'default',
                                }}
                            >
                                <div className="relative w-full h-full flex items-center justify-center bg-black">
                                    {activeEffects.map((effect) => (
                                        <SpecialEffectAnimation key={effect.id} effect={effect} onComplete={() => handleEffectComplete(effect.id)} />
                                    ))}

                                    <div className="absolute inset-0">
                                        <CustomVideoGrid virtualBgType={selectedVirtualBg?.type} getFallbackBackgroundUrl={getFallbackBackgroundUrlForParticipant} bgHighlight={bgHighlight} />
                                    </div>

                                    {(!isFullscreen || showControls) && (
                                        <>
                                            <CultureAlert room={room} debug={false} demo={false} displayMs={8000} />

                                            <div className="absolute top-2 sm:top-3 left-2 sm:left-3 z-50 bg-gradient-to-r from-pink-600/90 to-purple-600/90 backdrop-blur-sm px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg sm:rounded-xl shadow-2xl border border-white/20 max-w-[calc(100%-8rem)]">
                                                <div className="flex items-center gap-1.5 sm:gap-2">
                                                    <div className="flex items-center gap-1 flex-shrink-0">
                                                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full animate-pulse" />
                                                        <span className="text-[10px] sm:text-xs font-bold text-white">LIVE</span>
                                                    </div>

                                                    <div className="h-3 w-px bg-white/30 flex-shrink-0" />

                                                    <div className="flex items-center gap-1 flex-shrink-0">
                                                        <Users className="w-3 h-3 text-white/90" />
                                                        <span className="text-[10px] sm:text-xs font-semibold text-white">{participantCount}명</span>
                                                    </div>

                                                    <div className="hidden sm:flex items-center gap-2 min-w-0">
                                                        <div className="h-3 w-px bg-white/30" />
                                                        <p className="font-bold text-xs text-white truncate">{meetingTitle || '문화 라이브'}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="absolute top-2 sm:top-3 right-2 sm:right-3 z-50 flex gap-1.5 sm:gap-2">
                                                <button
                                                    onClick={() => setShowThemeSelector(true)}
                                                    className="bg-white/95 p-2 rounded-full hover:bg-white transition-all shadow-lg hover:scale-110 active:scale-95"
                                                    title="배경 테마"
                                                >
                                                    <Palette className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                                                </button>

                                                <button
                                                    onClick={handleLike}
                                                    className="bg-white/95 px-2 sm:px-3 py-2 rounded-full flex items-center gap-1 hover:bg-white transition-all shadow-lg hover:scale-110 active:scale-95"
                                                >
                                                    <FiHeart className="text-pink-500 w-4 h-4" />
                                                    <span className="text-gray-800 font-bold text-xs hidden sm:inline">{likes.toLocaleString()}</span>
                                                </button>
                                            </div>
                                        </>
                                    )}

                                    {(!isFullscreen || showControls) && (
                                        <div className="absolute bottom-20 sm:bottom-24 left-0 right-0 z-[80] pointer-events-none px-2 sm:px-4">
                                            <div className="flex justify-center">
                                                <CultureSubtitleOverlay userLocale={userLocale} />
                                            </div>
                                        </div>
                                    )}

                                    {Object.keys(partials).length > 0 && (!isFullscreen || showControls) && (
                                        <div className="absolute bottom-28 sm:bottom-36 left-1/2 -translate-x-1/2 w-[95%] sm:w-[90%] max-w-3xl z-35">
                                            {Object.entries(partials).map(([key, data]) => (
                                                <div key={key} className="bg-pink-500/25 backdrop-blur-lg border-2 border-pink-400/60 text-white rounded-2xl px-4 py-2.5 mb-2 shadow-2xl animate-pulse">
                                                    <div className="text-center">
                                                        <span className="text-xs sm:text-sm font-bold text-pink-200">🎙️ {data.username} (입력 중...)</span>
                                                        <p className="text-sm sm:text-base leading-6 mt-1.5 font-medium">
                                                            {data.text}
                                                            <span className="inline-block w-2 h-4 bg-pink-300 ml-1.5 animate-blink rounded-sm" />
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <div
                                        className={`absolute left-0 right-0 bottom-0 bg-gradient-to-t from-black/95 via-black/80 to-transparent transition-all duration-300 ${
                                            isFullscreen && !showControls ? 'opacity-0 translate-y-full pointer-events-none' : 'opacity-100 translate-y-0'
                                        }`}
                                        style={{
                                            zIndex: 90,
                                        }}
                                    >
                                        <div className="flex flex-wrap items-center justify-center px-2 sm:px-4 pb-3 sm:pb-4 pt-4 sm:pt-6 gap-1.5 sm:gap-2">
                                            <button
                                                onClick={toggleMicrophone}
                                                className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all shadow-lg hover:scale-110 active:scale-95 ${
                                                    isMicOn ? 'bg-white text-green-600' : 'bg-white text-red-600'
                                                }`}
                                            >
                                                {isMicOn ? <Mic className="w-4 h-4 sm:w-5 sm:h-5" /> : <MicOff className="w-4 h-4 sm:w-5 sm:h-5" />}
                                            </button>

                                            <button
                                                onClick={toggleCamera}
                                                className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all shadow-lg hover:scale-110 active:scale-95 ${
                                                    isCameraOn ? 'bg-white text-green-600' : 'bg-white text-red-600'
                                                }`}
                                            >
                                                {isCameraOn ? <Video className="w-4 h-4 sm:w-5 sm:h-5" /> : <VideoOff className="w-4 h-4 sm:w-5 sm:h-5" />}
                                            </button>

                                            <button
                                                onClick={toggleScreenShare}
                                                className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all shadow-lg hover:scale-110 active:scale-95 ${
                                                    isScreenSharing ? 'bg-white text-green-600' : 'bg-white text-gray-600'
                                                }`}
                                            >
                                                <MonitorUp className="w-4 h-4 sm:w-5 sm:h-5" />
                                            </button>

                                            {/* 🔥 카메라 배경 설정 버튼 (모달) */}
                                            <button
                                                onClick={openVirtualBgModal}
                                                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white text-purple-600 flex items-center justify-center transition-all shadow-lg hover:scale-110 active:scale-95"
                                                title="카메라 배경 설정"
                                            >
                                                <ImageIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                                            </button>

                                            <button
                                                onClick={() => setShowChatSidebar(!showChatSidebar)}
                                                className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all shadow-lg hover:scale-110 active:scale-95 ${
                                                    showChatSidebar ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white' : 'bg-white text-gray-600'
                                                }`}
                                            >
                                                <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                                            </button>

                                            <button
                                                onClick={toggleFullscreen}
                                                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white text-gray-600 flex items-center justify-center transition-all shadow-lg hover:scale-110 active:scale-95"
                                            >
                                                {isFullscreen ? <FiMinimize className="w-4 h-4 sm:w-5 sm:h-5" /> : <FiMaximize className="w-4 h-4 sm:w-5 sm:h-5" />}
                                            </button>

                                            <button
                                                onClick={handleCopyLink}
                                                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white text-gray-600 flex items-center justify-center transition-all shadow-lg hover:scale-110 active:scale-95"
                                            >
                                                <FiCopy className="w-4 h-4 sm:w-5 sm:h-5" />
                                            </button>

                                            {/* 🚪 나가기 / 방 종료 통합 버튼 */}
                                            <button
                                                onClick={handleExitClick}
                                                className="h-10 sm:h-11 px-4 sm:px-5 rounded-full bg-gradient-to-r from-red-500 to-rose-600 text-white flex items-center justify-center gap-1.5 sm:gap-2 transition-all shadow-lg hover:scale-110 active:scale-95"
                                                title={isHost ? '라이브 종료' : '라이브 나가기'}
                                            >
                                                <PhoneOff className="w-4 h-4 sm:w-5 sm:h-5" />
                                                <span className="hidden sm:inline text-xs sm:text-sm font-semibold">{isHost ? '방 종료' : '나가기'}</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <RoomAudioRenderer />
                            </div>
                        </div>

                        {showChatSidebar && !isFullscreen && (
                            <div className="flex-1 lg:flex-[1] lg:max-w-[400px] xl:max-w-[500px] transition-all duration-300">
                                <div className="h-full">
                                    <CultureLiveChatSidebar userLocale={userLocale} sttFinals={finals} onClose={() => setShowChatSidebar(false)} onEffectTrigger={handleEffectTrigger} />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="relative z-10 w-full max-w-[1800px] mx-auto px-2 sm:px-4 pb-6 sm:pb-10 space-y-4 sm:space-y-6">
                    <section className="bg-white/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-xl px-4 sm:px-6 py-4 sm:py-5 space-y-3 border border-white/50">
                        <div className="space-y-2">
                            <div className="flex flex-wrap gap-1.5 text-[10px] sm:text-[11px] font-semibold">
                                <span className="px-2 py-1 rounded-full bg-slate-900 text-pink-100">KR ↔ EN</span>
                                <span className="px-2 py-1 rounded-full bg-pink-100 text-pink-700">#K-밈</span>
                                <span className="px-2 py-1 rounded-full bg-violet-100 text-violet-700">리액션</span>
                            </div>
                            <h1 className="text-base sm:text-xl lg:text-2xl font-extrabold text-slate-900">{meetingTitle || '실시간 K-밈 리액션 🔥'}</h1>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-slate-600">
                            <div className="flex items-center gap-2">
                                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-pink-400 to-violet-500" />
                                <div className="flex flex-col">
                                    <span className="font-semibold text-slate-900 text-xs sm:text-sm">{user?.name || '밈마스터'}</span>
                                    <span className="text-[10px] sm:text-xs text-slate-500">{participantCount}명 시청 중</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
                            <button
                                onClick={handleLike}
                                className="flex-1 min-w-[100px] flex items-center justify-center gap-1.5 px-3 py-2 rounded-full border border-pink-200 text-pink-600 font-semibold text-xs sm:text-sm hover:bg-pink-50 transition-all hover:scale-105"
                            >
                                <FiHeart className="w-3.5 h-3.5" />
                                좋아요 {likes.toLocaleString()}
                            </button>
                            <button className="flex-1 min-w-[100px] flex items-center justify-center gap-1.5 px-3 py-2 rounded-full border border-pink-200 text-slate-700 font-semibold text-xs sm:text-sm hover:bg-pink-50 transition-all hover:scale-105">
                                공유
                            </button>
                            <button className="flex-1 min-w-[100px] flex items-center justify-center gap-1.5 px-3 py-2 rounded-full border border-pink-200 text-slate-700 font-semibold text-xs sm:text-sm hover:bg-pink-50 transition-all hover:scale-105">
                                저장
                            </button>
                        </div>
                    </section>

                    <section className="bg-white/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-xl border border-white/50">
                        <div className="flex border-b border-pink-100 px-4 sm:px-6 pt-3 sm:pt-4">
                            <button
                                onClick={() => setActiveTab('info')}
                                className={`flex items-center gap-1.5 pb-2 sm:pb-3 mr-4 sm:mr-6 text-xs sm:text-sm font-semibold transition-all ${
                                    activeTab === 'info' ? 'text-pink-600 border-b-2 border-pink-500' : 'text-slate-400 hover:text-slate-600'
                                }`}
                            >
                                <Info className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                정보
                            </button>
                            <button
                                onClick={() => setActiveTab('members')}
                                className={`flex items-center gap-1.5 pb-2 sm:pb-3 text-xs sm:text-sm font-semibold transition-all ${
                                    activeTab === 'members' ? 'text-pink-600 border-b-2 border-pink-500' : 'text-slate-400 hover:text-slate-600'
                                }`}
                            >
                                <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                참여자
                            </button>
                        </div>

                        <div className="px-4 sm:px-6 py-4 sm:py-5">
                            {activeTab === 'members' && (
                                <div className="space-y-2 text-xs sm:text-sm">
                                    <div className="text-[10px] sm:text-xs text-slate-400 mb-3">현재 참여자 {participants.length}명</div>
                                    {participants.map((p) => (
                                        <div key={p.identity} className="flex items-center gap-2 sm:gap-3 py-2 border-b border-slate-50 last:border-0">
                                            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                                                {(p.name || p.identity).charAt(0).toUpperCase()}
                                            </div>
                                            <span className="text-slate-800 font-medium text-xs sm:text-sm truncate">{p.name || p.identity}</span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {activeTab === 'info' && (
                                <div className="text-xs sm:text-sm text-slate-700 space-y-3">
                                    <p className="leading-relaxed">{meetingDesc}</p>
                                    <div className="bg-pink-50 rounded-xl p-3 sm:p-4 border border-pink-100">
                                        <p className="text-[10px] sm:text-xs text-slate-500 mb-1">현재 언어 설정</p>
                                        <p className="font-mono text-pink-600 font-semibold text-xs">{userLocale}</p>
                                    </div>
                                    <div className="bg-purple-50 rounded-xl p-3 sm:p-4 border border-purple-100">
                                        <p className="text-[10px] sm:text-xs text-slate-500 mb-2">🎨 현재 배경 테마</p>
                                        <div className="flex items-center gap-2">
                                            <div
                                                className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg shadow-md"
                                                style={{
                                                    background: BACKGROUND_THEMES[currentTheme]?.gradient || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                }}
                                            />
                                            <span className="font-semibold text-purple-700 text-xs sm:text-sm">{BACKGROUND_THEMES[currentTheme]?.name || '기본'}</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>
                </div>

                <style>{`
                    @keyframes blink { 
                        0%, 50% { opacity: 1; } 
                        51%, 100% { opacity: 0; } 
                    }
                    @keyframes floatUp { 
                        0% { opacity: 1; transform: translateY(0) scale(1); } 
                        100% { opacity: 0; transform: translateY(-100px) scale(1.5); } 
                    }
                    .animate-blink { animation: blink 1s infinite; }
                `}</style>
            </div>
        </LayoutContextProvider>
    );
};

export default CultureConferenceUI;
