import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useDataChannel, useLocalParticipant, useRemoteParticipants, useRoomContext } from '@livekit/components-react';
import { MessageCircle, Users, Send, X, Sparkles, Globe, Heart, Smile, Type, Info, Zap } from 'lucide-react';

import { SPECIAL_EFFECTS, detectSpecialEffect, ANIMATION_CATEGORIES } from '../contents/specialEffects';
import { QUICK_EMOJIS } from '../contents/emojis';
import { FONT_STYLES } from '../contents/fontStyles';
import { TEXT_EFFECTS, TEXT_EFFECT_MAP } from '../contents/textEffects';
import { highlightKeywords } from '../contents/chatKeywordHighlight';

import '../../../css/TestAnimation.css';

// 🎤 테마별 이미지 import
import huntrixImg from '../../../assets/kpdh/huntrix.png';
import derpyTigerImg from '../../../assets/kpdh/derpy_tiger.png';

// 🎨 테마별 색상 팔레트
const getThemeColors = (themeId) => {
    const themeColors = {
        kpdh_huntrix: {
            primary: '#a855f7',
            secondary: '#ec4899',
            gradient: 'from-pink-500 to-purple-600',
            bgImage: huntrixImg,
        },
        kpdh_demon: {
            primary: '#7c3aed',
            secondary: '#c026d3',
            gradient: 'from-purple-800 to-fuchsia-600',
            bgImage: huntrixImg,
        },
        kpdh_derpy: {
            primary: '#06b6d4',
            secondary: '#22d3ee',
            gradient: 'from-cyan-500 to-blue-500',
            bgImage: derpyTigerImg,
        },
        kpdh_concert: {
            primary: '#9333ea',
            secondary: '#ec4899',
            gradient: 'from-purple-600 via-pink-500 to-orange-500',
            bgImage: huntrixImg,
        },
        kpdh_golden: {
            primary: '#fbbf24',
            secondary: '#f59e0b',
            gradient: 'from-yellow-400 to-orange-500',
            bgImage: huntrixImg,
        },
        default: {
            primary: '#ec4899',
            secondary: '#a855f7',
            gradient: 'from-pink-500 to-purple-600',
            bgImage: null,
        },
    };
    return themeColors[themeId] || themeColors.default;
};

const normalizeLocale = (locale) => {
    if (!locale) return 'ko-KR';
    const l = String(locale).toLowerCase();
    if (l.includes('-')) return locale;
    const map = { ko: 'ko-KR', en: 'en-US', ja: 'ja-JP', zh: 'zh-CN' };
    return map[l] || locale;
};

const getParticipantNickname = (participant, room = null) => {
    if (!participant) return 'Unknown';
    try {
        const metadata = JSON.parse(participant.metadata || '{}');
        if (metadata?.username) return metadata.username;
    } catch {}
    if (participant.name && participant.name !== participant.identity) return participant.name;
    const identity = participant.identity || 'Unknown';
    if (identity.startsWith('user-')) {
        const parts = identity.split('-');
        if (parts.length >= 3) return `Guest-${parts[parts.length - 1].substring(0, 4)}`;
    }
    return identity;
};

const findTranslation = (translations, targetLocale) => {
    if (!translations || typeof translations !== 'object') return null;
    if (translations[targetLocale]) return translations[targetLocale];
    if (targetLocale.includes('-')) {
        const langCode = targetLocale.split('-')[0];
        if (translations[langCode]) return translations[langCode];
    }
    return null;
};

// ================================
// 🎆 애니메이션 리스트 사이드바
// ================================

const AnimationListSidebar = ({ isOpen, onClose, onSelectEffect, themeColors }) => {
    const [selectedCategory, setSelectedCategory] = useState('celebration');
    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 bg-black/30 z-[9998]" onClick={onClose} />
            <div className="fixed top-0 right-0 h-full w-full sm:w-[400px] bg-white shadow-2xl z-[9999] animate-slide-in-right">
                <div className="h-full flex flex-col">
                    <div className={`flex-shrink-0 bg-gradient-to-r ${themeColors.gradient} text-white p-4 shadow-lg`}>
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <Sparkles className="w-5 h-5" />
                                <h2 className="text-lg font-bold">애니메이션 효과</h2>
                            </div>
                            <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <p className="text-sm text-white/90">채팅에 이모지를 입력하면 멋진 애니메이션이 실행됩니다! ✨</p>
                    </div>
                    <div className="flex-shrink-0 p-3 border-b overflow-x-auto" style={{ backgroundColor: `${themeColors.primary}10`, borderColor: `${themeColors.primary}20` }}>
                        <div className="flex gap-2">
                            {Object.entries(ANIMATION_CATEGORIES).map(([key, category]) => (
                                <button
                                    key={key}
                                    onClick={() => setSelectedCategory(key)}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                                        selectedCategory === key ? `text-white shadow-md` : `bg-white hover:bg-gray-100`
                                    }`}
                                    style={selectedCategory === key ? { backgroundColor: themeColors.primary } : { color: themeColors.primary }}
                                >
                                    <span className="text-base">{category.icon}</span>
                                    {category.name}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4">
                        <div className="grid grid-cols-2 gap-3">
                            {ANIMATION_CATEGORIES[selectedCategory].effects.map((emoji) => {
                                const effect = SPECIAL_EFFECTS[emoji];
                                return (
                                    <button
                                        key={emoji}
                                        onClick={() => {
                                            onSelectEffect(emoji);
                                            onClose();
                                        }}
                                        className="flex flex-col items-center gap-2 p-3 rounded-xl border transition-all hover:scale-105 hover:shadow-lg"
                                        style={{ background: `linear-gradient(135deg, ${themeColors.primary}10, ${themeColors.secondary}10)`, borderColor: `${themeColors.primary}30` }}
                                    >
                                        <span className="text-3xl">{emoji}</span>
                                        <div className="text-center">
                                            <p className="text-xs font-bold text-gray-800">{effect.name}</p>
                                            <p className="text-[10px] text-gray-500 mt-1 line-clamp-2">{effect.description}</p>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                    <div className="flex-shrink-0 p-3 bg-gray-50 border-t">
                        <p className="text-xs text-gray-600 text-center">💡 팁: 채팅 메시지에 위 이모지를 입력하면 자동으로 애니메이션이 실행됩니다!</p>
                    </div>
                </div>
            </div>
        </>
    );
};

// ================================
// 💬 메시지 버블
// ================================

const MessageBubble = ({ msg, userLocale, onLike, onEffectTrigger, triggeredMessages, themeColors }) => {
    const isLocal = msg.isLocal;
    const myLocale = normalizeLocale(userLocale);
    const translatedText = msg.text;
    const originalText = msg.originalText || msg.text;
    const [liked, setLiked] = useState(false);
    const [isImpactAnimating, setIsImpactAnimating] = useState(false);
    const messageId = msg.id || `${msg.sender}-${msg.time}-${originalText}`;
    const textEffectClass = TEXT_EFFECT_MAP[msg.textEffect || 'none']?.className || '';
    const msgImpactMode = msg.impactMode || false;
    const fontStyle = msg.fontStyle || FONT_STYLES[0].style;

    // 이모지 기반 애니메이션 트리거
    useEffect(() => {
        if (triggeredMessages.current.has(messageId)) return;
        const effect = detectSpecialEffect(originalText);
        if (effect && onEffectTrigger) {
            onEffectTrigger(effect);
            triggeredMessages.current.add(messageId);
        }
    }, [messageId, originalText, onEffectTrigger, triggeredMessages]);

    // 임팩트 모드 애니메이션
    useEffect(() => {
        if (msgImpactMode && msg.timestamp && Date.now() - msg.timestamp < 100) {
            setIsImpactAnimating(true);
            const timer = setTimeout(() => setIsImpactAnimating(false), 800);
            return () => clearTimeout(timer);
        }
    }, [msg.timestamp, msgImpactMode]);

    const handleLike = () => {
        setLiked(true);
        onLike && onLike(msg);
        setTimeout(() => setLiked(false), 1000);
    };

    return (
        <div className={`flex items-start gap-2 ${isLocal ? 'flex-row-reverse' : 'flex-row'} group`}>
            <div className="flex-shrink-0">
                <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white"
                    style={isLocal ? { background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.secondary})` } : { background: 'linear-gradient(135deg, #60a5fa, #06b6d4)' }}
                >
                    {msg.sender?.charAt(0).toUpperCase() || '?'}
                </div>
            </div>
            <div className={`flex flex-col max-w-[75%] ${isLocal ? 'items-end' : 'items-start'}`}>
                <div className={`flex items-center gap-2 mb-1 text-xs ${isLocal ? 'flex-row-reverse' : 'flex-row'}`}>
                    <span className="font-semibold text-gray-700">{msg.sender}</span>
                    <span className="text-gray-400">{msg.time}</span>
                </div>
                <div className="relative">
                    <div
                        className={`rounded-2xl px-4 py-3 shadow-lg backdrop-blur-sm ${
                            msg.isTranslated ? 'text-white border' : isLocal ? 'text-white' : 'bg-white text-gray-800 border border-gray-200'
                        } ${isLocal ? 'rounded-br-sm' : 'rounded-bl-sm'} ${isImpactAnimating ? 'animate-impact-message' : ''}`}
                        style={
                            msg.isTranslated
                                ? {
                                      background: isLocal ? `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.secondary})` : 'linear-gradient(135deg, #3b82f6, #06b6d4)',
                                      borderColor: 'rgba(255,255,255,0.3)',
                                  }
                                : isLocal
                                ? { backgroundColor: themeColors.primary }
                                : {}
                        }
                    >
                        {msg.isTranslated && originalText !== translatedText ? (
                            <div className="space-y-2">
                                <div className="flex items-start gap-2 pb-2 border-b border-white/20">
                                    <Globe className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                    <div className="flex-1">
                                        <p className="text-[10px] font-semibold mb-1 opacity-80">원문 ({msg.sourceLocale})</p>
                                        <p className="talaria-message-text text-xs opacity-70 italic break-words" style={fontStyle}>
                                            {highlightKeywords(originalText, themeColors)}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-2">
                                    <Sparkles className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                    <div className="flex-1">
                                        <p className="text-[10px] font-semibold mb-1 opacity-90">번역 ({myLocale})</p>
                                        <p className={`talaria-message-text text-sm font-medium break-words ${textEffectClass}`} style={fontStyle}>
                                            {highlightKeywords(translatedText, themeColors)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <p className={`talaria-message-text text-sm break-words ${textEffectClass}`} style={fontStyle}>
                                {highlightKeywords(originalText, themeColors)}
                            </p>
                        )}
                    </div>
                    {!isLocal && (
                        <button
                            onClick={handleLike}
                            className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center transition-all transform shadow-lg border ${
                                liked ? 'text-white scale-125' : 'bg-white hover:scale-110 opacity-0 group-hover:opacity-100 border-gray-200'
                            }`}
                            style={liked ? { backgroundColor: themeColors.primary } : { color: themeColors.primary }}
                        >
                            <Heart className={`w-3 h-3 ${liked ? 'fill-current' : ''}`} />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

// ================================
// 📺 메인: CultureLiveChatSidebar
// ================================

const CultureLiveChatSidebar = ({ userLocale = 'ko-KR', sttFinals = [], onClose, onEffectTrigger, currentTheme = 'default' }) => {
    const [messages, setMessages] = useState([]);
    const [chatInput, setChatInput] = useState('');
    const [activeTab, setActiveTab] = useState('chat');
    const [likeCount, setLikeCount] = useState(0);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [showFontPicker, setShowFontPicker] = useState(false);
    const [showAnimationList, setShowAnimationList] = useState(false);
    const [selectedFont, setSelectedFont] = useState(FONT_STYLES[0]);
    const [selectedEffect, setSelectedEffect] = useState(TEXT_EFFECTS[0]);
    const [showTextEffectPicker, setShowTextEffectPicker] = useState(false);
    const [impactMode, setImpactMode] = useState(false);

    const triggeredEffectsRef = useRef(new Set());
    const triggeredChatMessagesRef = useRef(new Set());
    const chatEndRef = useRef(null);
    const messagesContainerRef = useRef(null);

    const room = useRoomContext();
    const { localParticipant } = useLocalParticipant();
    const remoteParticipants = useRemoteParticipants();
    const { send: sendChat } = useDataChannel('chat_messages');
    const myLocale = normalizeLocale(userLocale);
    const themeColors = useMemo(() => getThemeColors(currentTheme), [currentTheme]);

    // 채팅 탭일 때 자동 스크롤
    useEffect(() => {
        if (activeTab !== 'chat') return;
        const container = messagesContainerRef.current;
        if (!container) return;
        container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
    }, [messages.length, activeTab]);

    // 🔔 데이터채널 수신 (채팅)
    const onMessage = useCallback(
        (message) => {
            if (!message.from) return;
            try {
                const textDecoder = new TextDecoder();
                const msgData = JSON.parse(textDecoder.decode(message.payload));
                const senderName = msgData.username || getParticipantNickname(message.from, room);
                const isLocal = message.from.isLocal;
                const fontStyle = msgData.fontStyle || FONT_STYLES[0].style;
                const textEffect = msgData.textEffect || 'none';
                const msgImpactMode = msgData.impactMode || false;
                const messageId = msgData.messageId || `${senderName}-${msgData.time}-${msgData.text}-${Date.now()}`;

                if (msgData.translations && typeof msgData.translations === 'object') {
                    const sourceLocale = normalizeLocale(msgData.locale || 'ko-KR');
                    const translated = findTranslation(msgData.translations, myLocale);
                    if (translated) {
                        setMessages((prev) => {
                            if (prev.some((m) => m.id === messageId)) return prev;
                            return [
                                ...prev,
                                {
                                    id: messageId,
                                    type: 'chat',
                                    text: translated,
                                    originalText: msgData.text,
                                    translatedTexts: msgData.translations,
                                    sourceLocale,
                                    sender: senderName,
                                    time: msgData.time,
                                    isLocal,
                                    isTranslated: true,
                                    fontStyle,
                                    textEffect,
                                    timestamp: Date.now(),
                                    impactMode: msgImpactMode,
                                },
                            ];
                        });
                        return;
                    }
                }

                setMessages((prev) => {
                    if (prev.some((m) => m.id === messageId)) return prev;
                    return [
                        ...prev,
                        {
                            id: messageId,
                            type: 'chat',
                            text: msgData.text,
                            sender: senderName,
                            time: msgData.time,
                            isLocal,
                            isTranslated: false,
                            fontStyle,
                            textEffect,
                            timestamp: Date.now(),
                            impactMode: msgImpactMode,
                        },
                    ];
                });
            } catch {
                // ignore parsing error
            }
        },
        [room, myLocale],
    );

    useDataChannel('chat_messages', onMessage);

    // 🎤 STT → 메시지로 반영
    useEffect(() => {
        if (!sttFinals.length || !localParticipant) return;
        const myUsername = getParticipantNickname(localParticipant, room);

        setMessages((prevMessages) => {
            let updatedMessages = [...prevMessages];
            const newMessagesToAdd = [];

            sttFinals.forEach((latestSTT) => {
                const sttUsername = latestSTT.username || latestSTT.identity;
                const isLocal = sttUsername === myUsername || latestSTT.identity === localParticipant.identity;
                const timestamp = new Date(latestSTT.ts * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                const utteranceId = latestSTT.utteranceId || latestSTT.utterance_id || `stt-${latestSTT.identity}-${latestSTT.ts}`;
                const messageId = utteranceId;
                const existingIndex = updatedMessages.findIndex((m) => m.id === messageId);

                if (latestSTT.translations && typeof latestSTT.translations === 'object') {
                    const sourceLocale = normalizeLocale(latestSTT.locale || 'ko-KR');
                    const translated = findTranslation(latestSTT.translations, myLocale);
                    if (translated) {
                        const translatedSTTMessage = {
                            id: messageId,
                            type: 'stt',
                            text: `🎤 ${translated}`,
                            originalText: `🎤 ${latestSTT.text}`,
                            translatedTexts: latestSTT.translations,
                            sourceLocale,
                            sender: sttUsername,
                            time: timestamp,
                            isLocal,
                            isTranslated: true,
                            timestamp: Date.now(),
                        };

                        if (existingIndex === -1 && !triggeredEffectsRef.current.has(messageId)) {
                            const effect = detectSpecialEffect(latestSTT.text || '') || detectSpecialEffect(translated);
                            if (effect && onEffectTrigger) {
                                onEffectTrigger(effect);
                                triggeredEffectsRef.current.add(messageId);
                                setTimeout(() => triggeredEffectsRef.current.delete(messageId), 10000);
                            }
                        }

                        if (existingIndex !== -1) updatedMessages[existingIndex] = translatedSTTMessage;
                        else newMessagesToAdd.push(translatedSTTMessage);
                        return;
                    }
                }

                const sttMessage = {
                    id: messageId,
                    type: 'stt',
                    text: `🎤 ${latestSTT.text}`,
                    sender: sttUsername,
                    time: timestamp,
                    isLocal,
                    isTranslated: false,
                    timestamp: Date.now(),
                };

                if (existingIndex === -1 && !triggeredEffectsRef.current.has(messageId)) {
                    const effect = detectSpecialEffect(latestSTT.text || '');
                    if (effect && onEffectTrigger) {
                        onEffectTrigger(effect);
                        triggeredEffectsRef.current.add(messageId);
                        setTimeout(() => triggeredEffectsRef.current.delete(messageId), 10000);
                    }
                }

                if (existingIndex !== -1) updatedMessages[existingIndex] = sttMessage;
                else newMessagesToAdd.push(sttMessage);
            });

            return [...updatedMessages, ...newMessagesToAdd];
        });
    }, [sttFinals, localParticipant?.identity, myLocale, room, onEffectTrigger]);

    // ✉️ 채팅 전송
    const handleSendMessage = useCallback(() => {
        if (!chatInput.trim() || !sendChat || !localParticipant) return;

        const myUsername = getParticipantNickname(localParticipant, room);
        const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const uniqueId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        const messagePayload = {
            type: 'chat',
            text: chatInput,
            username: myUsername,
            locale: myLocale,
            time: currentTime,
            fontStyle: selectedFont.style,
            textEffect: selectedEffect.id,
            messageId: uniqueId,
            impactMode,
        };

        const textEncoder = new TextEncoder();
        sendChat(textEncoder.encode(JSON.stringify(messagePayload)));

        setMessages((prev) => [
            ...prev,
            {
                ...messagePayload,
                id: uniqueId,
                sender: myUsername,
                isLocal: true,
                isTranslated: false,
                timestamp: Date.now(),
            },
        ]);

        setChatInput('');
        setShowEmojiPicker(false);
        setShowFontPicker(false);
        setShowTextEffectPicker(false);
    }, [chatInput, sendChat, localParticipant, room, myLocale, selectedFont, selectedEffect, impactMode]);

    const handleKeyPress = useCallback(
        (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
            }
        },
        [handleSendMessage],
    );

    const handleEmojiClick = (emoji) => {
        setChatInput((prev) => prev + emoji);
        setShowEmojiPicker(false);
    };

    const handleLike = () => setLikeCount((prev) => prev + 1);

    const getInputStyle = () => {
        const baseStyle = selectedFont.inputSafe ? selectedFont.style : selectedFont.inputStyle || {};
        return { ...baseStyle, color: '#111827', WebkitTextFillColor: '#111827', background: 'transparent' };
    };

    const backgroundStyle = themeColors.bgImage ? { backgroundImage: `url(${themeColors.bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {};

    return (
        <div className="w-full h-full flex flex-col rounded-3xl shadow-2xl overflow-hidden border relative" style={{ borderColor: `${themeColors.primary}30` }}>
            <AnimationListSidebar isOpen={showAnimationList} onClose={() => setShowAnimationList(false)} onSelectEffect={handleEmojiClick} themeColors={themeColors} />

            {/* 상단 헤더 */}
            <div className={`flex-shrink-0 bg-gradient-to-r ${themeColors.gradient} text-white p-4 shadow-lg`}>
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                        <h2 className="text-lg font-bold">실시간 채팅</h2>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setImpactMode(!impactMode)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${impactMode ? 'bg-white shadow-lg' : 'bg-white/20 hover:bg-white/30'}`}
                            style={impactMode ? { color: themeColors.primary } : {}}
                            title="임팩트 모드: 메시지가 크게 나타났다가 작아집니다"
                        >
                            <Zap className={`w-4 h-4 ${impactMode ? 'animate-pulse' : ''}`} />
                            <span>임팩트</span>
                        </button>
                        {onClose && (
                            <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center">
                                <X className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setActiveTab('chat')}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                            activeTab === 'chat' ? 'bg-white shadow-md' : 'bg-white/20 text-white hover:bg-white/30'
                        }`}
                        style={activeTab === 'chat' ? { color: themeColors.primary } : {}}
                    >
                        <MessageCircle className="w-4 h-4" />
                        채팅 {messages.length > 0 && `(${messages.length})`}
                    </button>
                    <button
                        onClick={() => setActiveTab('participants')}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                            activeTab === 'participants' ? 'bg-white shadow-md' : 'bg-white/20 text-white hover:bg-white/30'
                        }`}
                        style={activeTab === 'participants' ? { color: themeColors.secondary } : {}}
                    >
                        <Users className="w-4 h-4" />
                        참여자 ({remoteParticipants.length + 1})
                    </button>
                </div>
            </div>

            {/* 본문 */}
            <div className="flex-grow overflow-hidden relative">
                {themeColors.bgImage && (
                    <div
                        className="absolute inset-0 opacity-20"
                        style={{
                            ...backgroundStyle,
                            filter: 'blur(2px)',
                        }}
                    />
                )}
                <div className="absolute inset-0" style={{ backgroundColor: `${themeColors.primary}05` }} />

                {/* 채팅 탭 */}
                {activeTab === 'chat' && (
                    <div className="h-full flex flex-col relative z-10">
                        <div ref={messagesContainerRef} className="flex-grow overflow-y-auto p-4 space-y-4">
                            {messages.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                    <MessageCircle className="w-16 h-16 mb-3 opacity-30" />
                                    <p className="text-sm font-medium">아직 메시지가 없습니다</p>
                                    <p className="text-xs mt-1">첫 메시지를 보내보세요! 🎉</p>
                                </div>
                            ) : (
                                messages.map((msg) => (
                                    <MessageBubble
                                        key={msg.id}
                                        msg={msg}
                                        userLocale={userLocale}
                                        onLike={handleLike}
                                        onEffectTrigger={onEffectTrigger}
                                        triggeredMessages={triggeredChatMessagesRef}
                                        themeColors={themeColors}
                                    />
                                ))
                            )}
                            <div ref={chatEndRef} />
                        </div>

                        {/* 이모지 피커 */}
                        {showEmojiPicker && (
                            <div className="flex-shrink-0 p-3 bg-white/95 backdrop-blur-sm border-t" style={{ borderColor: `${themeColors.primary}20` }}>
                                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                                    {QUICK_EMOJIS.map((emoji) => (
                                        <button
                                            key={emoji}
                                            onClick={() => handleEmojiClick(emoji)}
                                            className="w-10 h-10 rounded-lg flex items-center justify-center text-xl hover:scale-110"
                                            style={{ backgroundColor: `${themeColors.primary}10` }}
                                        >
                                            {emoji}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* 폰트 선택 */}
                        {showFontPicker && (
                            <div className="flex-shrink-0 p-3 bg-white/95 backdrop-blur-sm border-t" style={{ borderColor: `${themeColors.primary}20` }}>
                                <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto">
                                    {FONT_STYLES.map((font) => (
                                        <button
                                            key={font.id}
                                            onClick={() => {
                                                setSelectedFont(font);
                                                setShowFontPicker(false);
                                            }}
                                            className={`px-3 py-2 rounded-lg text-sm ${selectedFont.id === font.id ? 'text-white' : 'text-gray-700'}`}
                                            style={selectedFont.id === font.id ? { backgroundColor: themeColors.primary } : { backgroundColor: `${themeColors.primary}10` }}
                                        >
                                            <span style={selectedFont.id === font.id ? {} : font.style}>{font.name}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* 텍스트 효과 선택 */}
                        {showTextEffectPicker && (
                            <div className="flex-shrink-0 p-3 bg-white/95 backdrop-blur-sm border-t" style={{ borderColor: `${themeColors.primary}20` }}>
                                <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto">
                                    {TEXT_EFFECTS.map((effect) => (
                                        <button
                                            key={effect.id}
                                            onClick={() => {
                                                setSelectedEffect(effect);
                                                setShowTextEffectPicker(false);
                                            }}
                                            className={`px-3 py-2 rounded-lg text-xs text-left ${selectedEffect.id === effect.id ? 'text-white' : 'text-gray-700'}`}
                                            style={selectedEffect.id === effect.id ? { backgroundColor: themeColors.secondary } : { backgroundColor: `${themeColors.secondary}10` }}
                                        >
                                            <span className="block font-semibold">{effect.name}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* 입력 영역 */}
                        <div className="flex-shrink-0 p-4 bg-white/95 backdrop-blur-sm border-t" style={{ borderColor: `${themeColors.primary}20` }}>
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                                <button
                                    onClick={() => {
                                        setShowEmojiPicker(!showEmojiPicker);
                                        setShowFontPicker(false);
                                        setShowTextEffectPicker(false);
                                    }}
                                    className={`p-2 rounded-lg ${showEmojiPicker ? 'text-white' : 'text-gray-600'}`}
                                    style={showEmojiPicker ? { backgroundColor: themeColors.primary } : { backgroundColor: `${themeColors.primary}10` }}
                                >
                                    <Smile className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => {
                                        setShowFontPicker(!showFontPicker);
                                        setShowEmojiPicker(false);
                                        setShowTextEffectPicker(false);
                                    }}
                                    className={`p-2 rounded-lg ${showFontPicker ? 'text-white' : 'text-gray-600'}`}
                                    style={showFontPicker ? { backgroundColor: themeColors.primary } : { backgroundColor: `${themeColors.primary}10` }}
                                >
                                    <Type className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => {
                                        setShowTextEffectPicker(!showTextEffectPicker);
                                        setShowEmojiPicker(false);
                                        setShowFontPicker(false);
                                    }}
                                    className={`p-2 rounded-lg ${showTextEffectPicker ? 'text-white' : 'text-gray-600'}`}
                                    style={showTextEffectPicker ? { backgroundColor: themeColors.primary } : { backgroundColor: `${themeColors.primary}10` }}
                                >
                                    <Sparkles className="w-5 h-5" />
                                </button>
                                <button onClick={() => setShowAnimationList(true)} className="p-2 rounded-lg" style={{ backgroundColor: `${themeColors.secondary}10`, color: themeColors.secondary }}>
                                    <Info className="w-5 h-5" />
                                </button>
                                {selectedFont.id !== 'default' && (
                                    <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: `${themeColors.primary}20`, color: themeColors.primary }}>
                                        {selectedFont.name}
                                    </span>
                                )}
                                {selectedEffect.id !== 'none' && (
                                    <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: `${themeColors.secondary}20`, color: themeColors.secondary }}>
                                        {selectedEffect.name}
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    className="flex-1 border-2 rounded-full px-4 py-2.5 text-sm placeholder-gray-400 focus:outline-none text-gray-900"
                                    placeholder="메시지를 입력하세요..."
                                    value={chatInput}
                                    onChange={(e) => setChatInput(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    style={{
                                        ...getInputStyle(),
                                        backgroundColor: `${themeColors.primary}10`,
                                        borderColor: `${themeColors.primary}40`,
                                    }}
                                />
                                <button
                                    onClick={handleSendMessage}
                                    disabled={!chatInput.trim()}
                                    className={`w-10 h-10 rounded-full bg-gradient-to-r ${themeColors.gradient} text-white flex items-center justify-center hover:shadow-lg disabled:opacity-50 hover:scale-105`}
                                >
                                    <Send className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* 참여자 탭 */}
                {activeTab === 'participants' && (
                    <div className="h-full overflow-y-auto p-4 space-y-3 relative z-10">
                        <div className="flex items-center gap-3 p-3 bg-white/95 backdrop-blur-sm rounded-xl shadow-sm border" style={{ borderColor: `${themeColors.primary}30` }}>
                            <div
                                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                                style={{ background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.secondary})` }}
                            >
                                {localParticipant?.name?.charAt(0).toUpperCase() || 'Y'}
                            </div>
                            <div className="flex-1">
                                <p className="font-semibold text-gray-800 truncate">
                                    {getParticipantNickname(localParticipant, room)}{' '}
                                    <span className="text-xs" style={{ color: themeColors.primary }}>
                                        (나)
                                    </span>
                                </p>
                                <p className="text-xs text-gray-500">호스트</p>
                            </div>
                        </div>
                        {remoteParticipants.map((p) => (
                            <div
                                key={p.identity}
                                className="flex items-center gap-3 p-3 bg-white/95 backdrop-blur-sm rounded-xl shadow-sm border"
                                style={{ borderColor: `${themeColors.secondary}30` }}
                            >
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center text-white font-bold">
                                    {p.name?.charAt(0).toUpperCase() || 'G'}
                                </div>
                                <div className="flex-1">
                                    <p className="font-semibold text-gray-800 truncate">{getParticipantNickname(p, room)}</p>
                                    <p className="text-xs text-gray-500">게스트</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* 전체 좋아요 카운트 */}
            {likeCount > 0 && (
                <div className="absolute bottom-20 left-1/2 -translate-x-1/2 text-white px-4 py-2 rounded-full shadow-lg animate-bounce z-50" style={{ backgroundColor: themeColors.primary }}>
                    <Heart className="w-4 h-4 inline mr-1 fill-current" />+{likeCount}
                </div>
            )}

            <style>{`
                @keyframes slide-in-right {
                    from { transform: translateX(100%); }
                    to { transform: translateX(0); }
                }
                .animate-slide-in-right {
                    animation: slide-in-right .3s ease-out;
                }
                
                @keyframes impact-message {
                    0% {
                        transform: scale(2);
                        opacity: 0.8;
                    }
                    50% {
                        transform: scale(1.8);
                        opacity: 0.9;
                    }
                    100% {
                        transform: scale(1);
                        opacity: 1;
                    }
                }
                .animate-impact-message {
                    animation: impact-message 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
                    transform-origin: center center;
                }
            `}</style>
        </div>
    );
};

export default CultureLiveChatSidebar;
