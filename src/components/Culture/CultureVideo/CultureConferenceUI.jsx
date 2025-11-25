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
import '../../../css/KPDHCursor.css';
import { BACKGROUND_THEMES } from '../contents/backgroundThemes';
import CultureAlert from './CultureAlert';
import { useVirtualBackground } from '../../../hooks/useVirtualBackground';
import { useKPDHCursor } from '../../../hooks/useKPDHCursor';

import VirtualBgModal from '../contents/VirtualBgModal';
import { DEFAULT_VIRTUAL_BG_ID, findVirtualBgPreset, VIRTUAL_BG_PRESETS } from '../contents/VIRTUAL_BG_PRESETS ';

// 🎨 테마별 색상 팔레트
const getThemeColors = (themeId) => {
    const themeColors = {
        kpdh_huntrix: {
            primary: '#a855f7',
            secondary: '#ec4899',
            accent: '#6b21a8',
            gradient: 'from-pink-500 to-purple-600',
            bg: 'bg-gradient-to-br from-pink-500/90 to-purple-600/90',
            border: 'border-pink-300/30',
            text: 'text-pink-600',
            hover: 'hover:bg-pink-100',
        },
        kpdh_demon: {
            primary: '#7c3aed',
            secondary: '#c026d3',
            accent: '#1e1b4b',
            gradient: 'from-purple-800 to-fuchsia-600',
            bg: 'bg-gradient-to-br from-purple-800/90 to-fuchsia-600/90',
            border: 'border-purple-300/30',
            text: 'text-purple-600',
            hover: 'hover:bg-purple-100',
        },
        kpdh_derpy: {
            primary: '#06b6d4',
            secondary: '#22d3ee',
            accent: '#0ea5e9',
            gradient: 'from-cyan-500 to-blue-500',
            bg: 'bg-gradient-to-br from-cyan-500/90 to-blue-500/90',
            border: 'border-cyan-300/30',
            text: 'text-cyan-600',
            hover: 'hover:bg-cyan-100',
        },
        kpdh_concert: {
            primary: '#9333ea',
            secondary: '#ec4899',
            accent: '#f97316',
            gradient: 'from-purple-600 via-pink-500 to-orange-500',
            bg: 'bg-gradient-to-br from-purple-600/90 via-pink-500/90 to-orange-500/90',
            border: 'border-pink-300/30',
            text: 'text-purple-600',
            hover: 'hover:bg-purple-100',
        },
        kpdh_golden: {
            primary: '#fbbf24',
            secondary: '#f59e0b',
            accent: '#facc15',
            gradient: 'from-yellow-400 to-orange-500',
            bg: 'bg-gradient-to-br from-yellow-400/90 to-orange-500/90',
            border: 'border-yellow-300/30',
            text: 'text-yellow-600',
            hover: 'hover:bg-yellow-100',
        },
        default: {
            primary: '#ec4899',
            secondary: '#a855f7',
            accent: '#8b5cf6',
            gradient: 'from-pink-600 to-purple-600',
            bg: 'bg-gradient-to-r from-pink-600/90 to-purple-600/90',
            border: 'border-white/20',
            text: 'text-pink-600',
            hover: 'hover:bg-pink-50',
        },
    };

    return themeColors[themeId] || themeColors.default;
};

const CultureConferenceUI = ({ meetingId, meetingTitle, onLeave, userLocale = 'ko-KR', meetingDesc, isHost }) => {
    const isAgent = (participant) => {
        if (!participant) return false;
        const identity = participant.identity || '';
        const name = participant.name || '';

        if (identity.toLowerCase().includes('agent') || name.toLowerCase().includes('agent')) {
            return true;
        }

        try {
            const metadata = JSON.parse(participant.metadata || '{}');
            if (metadata.isAgent === true || metadata.type === 'agent') {
                return true;
            }
        } catch (e) {}

        return false;
    };

    const room = useRoomContext();
    const participants = useParticipants();
    const realParticipants = participants.filter((p) => !isAgent(p)); // 🤖 에이전트 제외
    const participantCount = realParticipants.length;
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
    const { send: sendMeetingControl } = useDataChannel('meeting_control');

    const [virtualBgMap, setVirtualBgMap] = useState({});
    const [bgHighlight, setBgHighlight] = useState(null);

    const [virtualBgId, setVirtualBgId] = useState(DEFAULT_VIRTUAL_BG_ID);
    const [pendingVirtualBgId, setPendingVirtualBgId] = useState(DEFAULT_VIRTUAL_BG_ID);
    const [showVirtualBgModal, setShowVirtualBgModal] = useState(false);

    const selectedVirtualBg = useMemo(() => findVirtualBgPreset(virtualBgId), [virtualBgId]);

    // 🎤 K-POP 데몬 헌터스 커스텀 커서 활성화
    const { createClickEffect, createHeartEffect } = useKPDHCursor(currentTheme, true);

    // 🎨 현재 테마 색상
    const themeColors = useMemo(() => getThemeColors(currentTheme), [currentTheme]);

    const getFallbackBackgroundUrlForParticipant = useCallback(
        (participant) => {
            const id = participant.identity;
            let bgId;
            if (id === room.localParticipant?.identity) {
                bgId = virtualBgId;
            } else {
                bgId = virtualBgMap[id];
            }
            const preset = findVirtualBgPreset(bgId);
            if (preset?.type === 'image' && preset.imageUrl) {
                return preset.imageUrl;
            }
            return null;
        },
        [room, virtualBgId, virtualBgMap],
    );

    useVirtualBackground(selectedVirtualBg);

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

    useDataChannel('meeting_control', (msg) => {
        try {
            const text = new TextDecoder().decode(msg.payload);
            const data = JSON.parse(text);
            if (data.type === 'HOST_ENDED_MEETING') {
                Swal.fire({
                    icon: 'info',
                    title: '라이브가 종료되었어요! 👋',
                    html: `
                    <div class="text-center">
                        <div class="text-6xl mb-4">✨</div>
                        <p class="text-gray-600">
                            호스트가 라이브를 종료했습니다.
                        </p>
                        <p class="text-gray-500 text-sm mt-2">
                            다음에 또 만나요~ 💖
                        </p>
                    </div>
                `,
                    timer: 3000,
                    showConfirmButton: false,
                    allowOutsideClick: false,
                    customClass: {
                        popup: 'rounded-2xl',
                    },
                });
                setTimeout(async () => {
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
                }, 3000);
            }
        } catch (e) {
            console.error('meeting_control 수신 오류:', e);
        }
    });

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

    const handleEffectTrigger = (effect) => {
        const id = Date.now() + Math.random();
        setActiveEffects((prev) => [...prev, { ...effect, id }]);
    };

    const handleEffectComplete = (id) => {
        setActiveEffects((prev) => prev.filter((e) => e.id !== id));
    };

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

    const handleExitClick = async () => {
        if (isHost) {
            if (!user?.userId || !meetingId) {
                Swal.fire({
                    icon: 'error',
                    title: '앗! 문제가 생겼어요 😅',
                    text: '유저 정보가 없어서 방을 종료할 수 없어요!',
                    customClass: {
                        popup: 'rounded-2xl',
                        confirmButton: 'rounded-xl px-6 py-2.5 font-semibold',
                    },
                });
                return;
            }

            const result = await Swal.fire({
                title: '🎬 라이브 종료할까요?',
                html: `
                <div class="text-center">
                    <div class="text-6xl mb-4 animate-bounce">👋</div>
                    <p class="text-gray-600 mb-2">
                        라이브를 종료하면 <span class="font-bold" style="color: ${themeColors.primary}">모든 참가자</span>가 나가고
                    </p>
                    <p class="text-gray-600">
                        더 이상 새로운 사람들이 입장할 수 없어요!
                    </p>
                </div>
            `,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: themeColors.primary,
                cancelButtonColor: '#6b7280',
                confirmButtonText: '네, 종료할게요! 👋',
                cancelButtonText: '아니요, 계속할래요 🎉',
                reverseButtons: true,
                customClass: {
                    popup: 'rounded-2xl',
                    title: 'text-2xl font-bold',
                    confirmButton: 'rounded-xl px-6 py-3 font-bold shadow-lg hover:shadow-xl transition-all',
                    cancelButton: 'rounded-xl px-6 py-3 font-bold',
                },
                backdrop: 'rgba(0, 0, 0, 0.8)',
            });

            if (!result.isConfirmed) return;

            try {
                if (sendMeetingControl) {
                    const payload = {
                        type: 'HOST_ENDED_MEETING',
                        meetingId: meetingId,
                        timestamp: Date.now(),
                    };
                    const encoder = new TextEncoder();
                    sendMeetingControl(encoder.encode(JSON.stringify(payload)));
                }

                await api.patch(`/api/users/${user.userId}/meetings/${meetingId}/end`);

                await Swal.fire({
                    icon: 'success',
                    title: '라이브 종료 완료! 🎉',
                    html: `
                    <div class="text-center">
                        <div class="text-6xl mb-4">✨</div>
                        <p class="text-gray-600">
                            수고하셨어요! 다음에 또 봐요~ 💖
                        </p>
                    </div>
                `,
                    timer: 2000,
                    showConfirmButton: false,
                    customClass: {
                        popup: 'rounded-2xl',
                    },
                });

                if (window.opener && !window.opener.closed) {
                    window.opener.postMessage(
                        {
                            type: 'MEETING_ENDED',
                            meetingId: meetingId,
                        },
                        window.location.origin,
                    );
                }

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
                    title: '앗! 종료 실패 😱',
                    html: `
                    <div class="text-center">
                        <div class="text-6xl mb-4">💥</div>
                        <p class="text-gray-600">
                            ${error.response?.data?.message || '라이브 종료 중 오류가 발생했어요. 다시 시도해주세요!'}
                        </p>
                    </div>
                `,
                    confirmButtonText: '알겠어요!',
                    customClass: {
                        popup: 'rounded-2xl',
                        confirmButton: 'rounded-xl px-6 py-2.5 font-semibold',
                    },
                });
            }
            return;
        }

        const result = await Swal.fire({
            title: '벌써 가시게요? 🥺',
            html: `
            <div class="text-center">
                <div class="text-6xl mb-4 animate-bounce">😢</div>
                <p class="text-gray-600 mb-2">
                    지금 나가면 <span class="font-bold" style="color: ${themeColors.primary}">이 순간을 놓칠 수도</span> 있어요!
                </p>
            </div>
        `,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: themeColors.primary,
            confirmButtonText: '네, 나갈래요 👋',
            cancelButtonText: '더 볼래요! 🎉',
            reverseButtons: true,
            customClass: {
                popup: 'rounded-2xl',
                title: 'text-2xl font-bold',
                confirmButton: 'rounded-xl px-6 py-3 font-bold',
                cancelButton: 'rounded-xl px-6 py-3 font-bold shadow-lg',
            },
            backdrop: 'rgba(0, 0, 0, 0.8)',
        });

        if (!result.isConfirmed) return;

        if (window.opener && !window.opener.closed) {
            window.opener.postMessage(
                {
                    type: 'USER_LEFT',
                    meetingId: meetingId,
                },
                window.location.origin,
            );
        }

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

    const handleLike = () => {
        setLikes((prev) => prev + 1);

        // 🎤 테마별 하트 이펙트
        if (createHeartEffect) {
            const rect = mainContainerRef.current?.getBoundingClientRect();
            if (rect) {
                const x = rect.left + Math.random() * rect.width;
                const y = rect.top + rect.height * 0.7;
                createHeartEffect(x, y);
            }
        }

        const heart = document.createElement('div');
        heart.innerHTML = currentTheme.startsWith('kpdh_') ? '💜' : '❤️';
        heart.style.position = 'fixed';
        heart.style.left = `${Math.random() * 80 + 10}%`;
        heart.style.bottom = '20%';
        heart.style.fontSize = '2rem';
        heart.style.zIndex = '9999';
        heart.style.animation = 'floatUp 2s ease-out forwards';
        heart.style.pointerEvents = 'none';
        heart.style.filter = `drop-shadow(0 0 10px ${themeColors.primary})`;

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
                iconColor: themeColors.primary,
            });
        });
    };

    const openVirtualBgModal = () => {
        setPendingVirtualBgId(virtualBgId);
        setShowVirtualBgModal(true);
    };

    const handleApplyVirtualBg = (selectedId) => {
        const finalId = selectedId || DEFAULT_VIRTUAL_BG_ID;
        const preset = findVirtualBgPreset(finalId);
        const category = preset?.category || 'basic';

        setVirtualBgId(finalId);
        setShowVirtualBgModal(false);

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

    return (
        <LayoutContextProvider>
            {showThemeSelector && <BackgroundThemeSelector currentTheme={currentTheme} onThemeChange={handleThemeChange} onClose={handleThemeSelectorClose} />}
            {showThemeAnimation && animatingTheme && <ThemeTransitionAnimation themeId={animatingTheme} onComplete={handleAnimationComplete} />}
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

                                            <div
                                                className={`absolute top-2 sm:top-3 left-2 sm:left-3 z-50 ${themeColors.bg} backdrop-blur-sm px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg sm:rounded-xl shadow-2xl ${themeColors.border} border max-w-[calc(100%-8rem)]`}
                                            >
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
                                                    style={{
                                                        boxShadow: `0 0 20px ${themeColors.primary}40`,
                                                    }}
                                                >
                                                    <Palette className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: themeColors.primary }} />
                                                </button>

                                                <button
                                                    data-kpdh-heart
                                                    onClick={handleLike}
                                                    className="bg-white/95 px-2 sm:px-3 py-2 rounded-full flex items-center gap-1 hover:bg-white transition-all shadow-lg hover:scale-110 active:scale-95"
                                                    style={{
                                                        boxShadow: `0 0 20px ${themeColors.secondary}40`,
                                                    }}
                                                >
                                                    <FiHeart style={{ color: themeColors.secondary }} className="w-4 h-4" />
                                                    <span className="text-gray-800 font-bold text-xs hidden sm:inline">{likes.toLocaleString()}</span>
                                                </button>
                                            </div>
                                        </>
                                    )}

                                    {(!isFullscreen || showControls) && (
                                        <div className="absolute bottom-20 sm:bottom-24 left-0 right-0 z-[80] pointer-events-none px-2 sm:px-4">
                                            <div className="flex justify-center">
                                                <CultureSubtitleOverlay userLocale={userLocale} currentTheme={currentTheme} />
                                            </div>
                                        </div>
                                    )}

                                    {Object.keys(partials).length > 0 && (!isFullscreen || showControls) && (
                                        <div className="absolute bottom-28 sm:bottom-36 left-1/2 -translate-x-1/2 w-[95%] sm:w-[90%] max-w-3xl z-35">
                                            {Object.entries(partials).map(([key, data]) => (
                                                <div
                                                    key={key}
                                                    className="backdrop-blur-lg border-2 rounded-2xl px-4 py-2.5 mb-2 shadow-2xl animate-pulse"
                                                    style={{
                                                        backgroundColor: `${themeColors.primary}40`,
                                                        borderColor: `${themeColors.primary}60`,
                                                    }}
                                                >
                                                    <div className="text-center">
                                                        <span className="text-xs sm:text-sm font-bold text-white">🎙️ {data.username} (입력 중...)</span>
                                                        <p className="text-sm sm:text-base leading-6 mt-1.5 font-medium text-white">
                                                            {data.text}
                                                            <span
                                                                className="inline-block w-2 h-4 ml-1.5 animate-blink rounded-sm"
                                                                style={{
                                                                    backgroundColor: themeColors.accent,
                                                                }}
                                                            />
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
                                        style={{ zIndex: 90 }}
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

                                            <button
                                                onClick={openVirtualBgModal}
                                                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white flex items-center justify-center transition-all shadow-lg hover:scale-110 active:scale-95"
                                                style={{ color: themeColors.primary }}
                                                title="카메라 배경 설정"
                                            >
                                                <ImageIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                                            </button>

                                            <button
                                                onClick={() => setShowChatSidebar(!showChatSidebar)}
                                                className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all shadow-lg hover:scale-110 active:scale-95 ${
                                                    showChatSidebar ? `bg-gradient-to-r ${themeColors.gradient} text-white` : 'bg-white text-gray-600'
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
                                    <CultureLiveChatSidebar
                                        userLocale={userLocale}
                                        sttFinals={finals}
                                        onClose={() => setShowChatSidebar(false)}
                                        onEffectTrigger={handleEffectTrigger}
                                        currentTheme={currentTheme}
                                    />
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
                                <span className="px-2 py-1 rounded-full" style={{ backgroundColor: `${themeColors.primary}20`, color: themeColors.primary }}>
                                    #{currentTheme.startsWith('kpdh_') ? 'KPDH' : 'K-밈'}
                                </span>
                                <span className="px-2 py-1 rounded-full bg-violet-100 text-violet-700">리액션</span>
                            </div>
                            <h1 className="text-base sm:text-xl lg:text-2xl font-extrabold text-slate-900">{meetingTitle || '실시간 K-밈 리액션 🔥'}</h1>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-slate-600">
                            <div className="flex items-center gap-2">
                                <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br ${themeColors.gradient}`} />
                                <div className="flex flex-col">
                                    <span className="font-semibold text-slate-900 text-xs sm:text-sm">{user?.name || '밈마스터'}</span>
                                    <span className="text-[10px] sm:text-xs text-slate-500">{participantCount}명 시청 중</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
                            <button
                                data-kpdh-heart
                                onClick={handleLike}
                                className="flex-1 min-w-[100px] flex items-center justify-center gap-1.5 px-3 py-2 rounded-full border font-semibold text-xs sm:text-sm transition-all hover:scale-105"
                                style={{
                                    borderColor: `${themeColors.primary}40`,
                                    color: themeColors.primary,
                                    backgroundColor: `${themeColors.primary}10`,
                                }}
                            >
                                <FiHeart className="w-3.5 h-3.5" />
                                좋아요 {likes.toLocaleString()}
                            </button>
                            <button
                                className="flex-1 min-w-[100px] flex items-center justify-center gap-1.5 px-3 py-2 rounded-full border border-pink-200 text-slate-700 font-semibold text-xs sm:text-sm transition-all hover:scale-105"
                                style={{
                                    borderColor: `${themeColors.primary}40`,
                                }}
                            >
                                공유
                            </button>
                            <button
                                className="flex-1 min-w-[100px] flex items-center justify-center gap-1.5 px-3 py-2 rounded-full border border-pink-200 text-slate-700 font-semibold text-xs sm:text-sm transition-all hover:scale-105"
                                style={{
                                    borderColor: `${themeColors.primary}40`,
                                }}
                            >
                                저장
                            </button>
                        </div>
                    </section>

                    <section className="bg-white/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-xl border border-white/50">
                        <div className="flex border-b border-pink-100 px-4 sm:px-6 pt-3 sm:pt-4">
                            <button
                                onClick={() => setActiveTab('info')}
                                className={`flex items-center gap-1.5 pb-2 sm:pb-3 mr-4 sm:mr-6 text-xs sm:text-sm font-semibold transition-all ${
                                    activeTab === 'info' ? `border-b-2` : 'text-slate-400 hover:text-slate-600'
                                }`}
                                style={
                                    activeTab === 'info'
                                        ? {
                                              color: themeColors.primary,
                                              borderBottomColor: themeColors.primary,
                                          }
                                        : {}
                                }
                            >
                                <Info className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                정보
                            </button>
                            <button
                                onClick={() => setActiveTab('members')}
                                className={`flex items-center gap-1.5 pb-2 sm:pb-3 text-xs sm:text-sm font-semibold transition-all ${
                                    activeTab === 'members' ? `border-b-2` : 'text-slate-400 hover:text-slate-600'
                                }`}
                                style={
                                    activeTab === 'members'
                                        ? {
                                              color: themeColors.primary,
                                              borderBottomColor: themeColors.primary,
                                          }
                                        : {}
                                }
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
                                            <div
                                                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br ${themeColors.gradient} flex items-center justify-center text-white font-bold text-xs flex-shrink-0`}
                                            >
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
                                    <div className="rounded-xl p-3 sm:p-4 border" style={{ backgroundColor: `${themeColors.primary}10`, borderColor: `${themeColors.primary}30` }}>
                                        <p className="text-[10px] sm:text-xs text-slate-500 mb-1">현재 언어 설정</p>
                                        <p className="font-mono font-semibold text-xs" style={{ color: themeColors.primary }}>
                                            {userLocale}
                                        </p>
                                    </div>
                                    <div className="rounded-xl p-3 sm:p-4 border" style={{ backgroundColor: `${themeColors.secondary}10`, borderColor: `${themeColors.secondary}30` }}>
                                        <p className="text-[10px] sm:text-xs text-slate-500 mb-2">🎨 현재 배경 테마</p>
                                        <div className="flex items-center gap-2">
                                            <div
                                                className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg shadow-md"
                                                style={{
                                                    background: BACKGROUND_THEMES[currentTheme]?.gradient || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                }}
                                            />
                                            <span className="font-semibold text-xs sm:text-sm" style={{ color: themeColors.secondary }}>
                                                {BACKGROUND_THEMES[currentTheme]?.name || '기본'}
                                            </span>
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
