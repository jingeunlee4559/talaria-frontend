// src/components/Culture/LiveView/CultureLiveChatSidebar.jsx
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useDataChannel, useLocalParticipant, useRemoteParticipants, useRoomContext } from '@livekit/components-react';
import { MessageCircle, Users, Send, X, Sparkles, Globe, Heart, Smile, Type, Info, ChevronRight } from 'lucide-react';

// 🎨 Import constants from separate files
import { SPECIAL_EFFECTS, detectSpecialEffect, ANIMATION_CATEGORIES } from '../contents/specialEffects';
import { QUICK_EMOJIS } from '../contents/emojis';
import { FONT_STYLES } from '../contents/fontStyles';
import { TEXT_EFFECTS, TEXT_EFFECT_MAP } from '../contents/textEffects';
import '../../../css/TestAnimation.css';

// ==================== Utils ====================
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
    } catch (error) {
        console.error('메타데이터 파싱 오류:', error);
    }
    if (participant.name && participant.name !== participant.identity) {
        return participant.name;
    }
    const identity = participant.identity || 'Unknown';
    if (identity.startsWith('user-')) {
        const parts = identity.split('-');
        if (parts.length >= 3) {
            return `Guest-${parts[parts.length - 1].substring(0, 4)}`;
        }
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

// ==================== 애니메이션 리스트 사이드바 ====================
const AnimationListSidebar = ({ isOpen, onClose, onSelectEffect }) => {
    const [selectedCategory, setSelectedCategory] = useState('celebration');

    // 🎯 isOpen이 false면 렌더링하지 않음
    if (!isOpen) return null;

    return (
        <>
            {/* 반투명 배경 */}
            <div className="fixed inset-0 bg-black/30 z-[9998] transition-opacity duration-300" onClick={onClose} />

            {/* 사이드바 */}
            <div className="fixed top-0 right-0 h-full w-full sm:w-[400px] bg-white shadow-2xl z-[9999] animate-slide-in-right">
                <div className="h-full flex flex-col">
                    {/* Header */}
                    <div className="flex-shrink-0 bg-gradient-to-r from-pink-500 to-purple-600 text-white p-4 shadow-lg">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <Sparkles className="w-5 h-5" />
                                <h2 className="text-lg font-bold">애니메이션 효과</h2>
                            </div>
                            <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <p className="text-sm text-white/90">채팅에 이모지를 입력하면 멋진 애니메이션이 실행됩니다! ✨</p>
                    </div>

                    {/* Category Tabs */}
                    <div className="flex-shrink-0 p-3 bg-pink-50 border-b border-pink-100 overflow-x-auto">
                        <div className="flex gap-2">
                            {Object.entries(ANIMATION_CATEGORIES).map(([key, category]) => (
                                <button
                                    key={key}
                                    onClick={() => setSelectedCategory(key)}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                                        selectedCategory === key ? 'bg-pink-500 text-white shadow-md' : 'bg-white text-gray-700 hover:bg-pink-100'
                                    }`}
                                >
                                    <span className="text-base">{category.icon}</span>
                                    {category.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Animation List - 스크롤 영역 */}
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
                                        className="flex flex-col items-center gap-2 p-3 rounded-xl bg-gradient-to-br from-pink-50 to-purple-50 hover:from-pink-100 hover:to-purple-100 border border-pink-200 hover:border-pink-300 transition-all hover:scale-105 hover:shadow-lg"
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

                    {/* Footer */}
                    <div className="flex-shrink-0 p-3 bg-gray-50 border-t border-gray-200">
                        <p className="text-xs text-gray-600 text-center">💡 팁: 채팅 메시지에 위 이모지를 입력하면 자동으로 애니메이션이 실행됩니다!</p>
                    </div>
                </div>
            </div>
        </>
    );
};

// ==================== Message Bubble Component ====================
const MessageBubble = ({ msg, userLocale, onLike, onEffectTrigger, triggeredMessages }) => {
    const isLocal = msg.isLocal;
    const myLocale = normalizeLocale(userLocale);
    const translatedText = msg.text;
    const originalText = msg.originalText || msg.text;
    const [liked, setLiked] = useState(false);

    const messageId = msg.id || `${msg.sender}-${msg.time}-${originalText}`;

    const textEffectClass = TEXT_EFFECT_MAP[msg.textEffect || 'none']?.className || '';

    useEffect(() => {
        // 🎯 이미 트리거된 메시지인지 확인
        if (triggeredMessages.current.has(messageId)) return;

        const effect = detectSpecialEffect(originalText);
        if (effect && onEffectTrigger) {
            onEffectTrigger(effect);
            // 🎯 트리거된 메시지 ID 저장 (탭 전환 후에도 유지됨)
            triggeredMessages.current.add(messageId);
        }
    }, [messageId, originalText, onEffectTrigger, triggeredMessages]);

    const handleLike = () => {
        setLiked(true);
        onLike && onLike(msg);
        setTimeout(() => setLiked(false), 1000);
    };

    const fontStyle = msg.fontStyle || FONT_STYLES[0].style;

    return (
        <div className={`flex items-start gap-2 ${isLocal ? 'flex-row-reverse' : 'flex-row'} group`}>
            {/* Avatar */}
            <div className="flex-shrink-0">
                <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        isLocal ? 'bg-gradient-to-br from-pink-400 to-purple-500 text-white' : 'bg-gradient-to-br from-blue-400 to-cyan-500 text-white'
                    }`}
                >
                    {msg.sender.charAt(0).toUpperCase()}
                </div>
            </div>

            {/* Message Content */}
            <div className={`flex flex-col max-w-[75%] ${isLocal ? 'items-end' : 'items-start'}`}>
                {/* Sender & Time */}
                <div className={`flex items-center gap-2 mb-1 text-xs ${isLocal ? 'flex-row-reverse' : 'flex-row'}`}>
                    <span className="font-semibold text-gray-700">{msg.sender}</span>
                    <span className="text-gray-400">{msg.time}</span>
                </div>

                {/* Message Bubble */}
                <div className="relative">
                    <div
                        className={`rounded-2xl px-4 py-3 shadow-lg backdrop-blur-sm ${
                            msg.isTranslated
                                ? isLocal
                                    ? 'bg-gradient-to-br from-pink-500 to-purple-600 text-white border border-pink-300/30'
                                    : 'bg-gradient-to-br from-blue-500 to-cyan-600 text-white border border-blue-300/30'
                                : isLocal
                                ? 'bg-pink-500 text-white'
                                : 'bg-white text-gray-800 border border-gray-200'
                        } ${isLocal ? 'rounded-br-sm' : 'rounded-bl-sm'}`}
                    >
                        {msg.isTranslated && originalText !== translatedText ? (
                            <div className="space-y-2">
                                <div className="flex items-start gap-2 pb-2 border-b border-white/20">
                                    <Globe className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                    <div className="flex-1">
                                        <p className="text-[10px] font-semibold mb-1 opacity-80">원문 ({msg.sourceLocale})</p>
                                        <p className="text-xs opacity-70 italic break-words" style={fontStyle}>
                                            {originalText}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-2">
                                    <Sparkles className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                    <div className="flex-1">
                                        <p className="text-[10px] font-semibold mb-1 opacity-90">번역 ({myLocale})</p>
                                        <p className={`text-sm font-medium break-words ${textEffectClass}`} style={fontStyle}>
                                            {translatedText}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <p className={`text-sm break-words ${textEffectClass}`} style={fontStyle}>
                                {originalText}
                            </p>
                        )}
                    </div>

                    {/* Like Button */}
                    {!isLocal && (
                        <button
                            onClick={handleLike}
                            className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center transition-all transform ${
                                liked ? 'bg-pink-500 text-white scale-125' : 'bg-white text-gray-400 hover:text-pink-500 hover:scale-110 opacity-0 group-hover:opacity-100'
                            } shadow-lg border border-gray-200`}
                        >
                            <Heart className={`w-3 h-3 ${liked ? 'fill-current' : ''}`} />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

// ==================== Main Sidebar Component ====================
const CultureLiveChatSidebar = ({ userLocale = 'ko-KR', sttFinals = [], onClose, onEffectTrigger }) => {
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

    // 🎯 STT 메시지 애니메이션 트리거 관리 (기존)
    const triggeredEffectsRef = useRef(new Set());

    // 🎯 채팅 메시지 애니메이션 트리거 관리 (신규 - 전역으로 관리)
    const triggeredChatMessagesRef = useRef(new Set());

    const processedSttMessagesRef = useMemo(() => ({ current: new Set() }), []);
    const lastProcessedIdRef = useRef(null);

    const chatEndRef = useRef(null);
    const room = useRoomContext();
    const { localParticipant } = useLocalParticipant();
    const remoteParticipants = useRemoteParticipants();
    const { send: sendChat } = useDataChannel('chat_messages');

    const myLocale = normalizeLocale(userLocale);
    const messagesContainerRef = useRef(null);

    useEffect(() => {
        if (activeTab !== 'chat') return;

        const container = messagesContainerRef.current;
        if (!container) return;

        container.scrollTo({
            top: container.scrollHeight,
            behavior: 'smooth',
        });
    }, [messages.length, activeTab]);

    const onMessage = useCallback(
        (message) => {
            if (message.from) {
                try {
                    const textDecoder = new TextDecoder();
                    const msgData = JSON.parse(textDecoder.decode(message.payload));
                    const senderName = msgData.username || getParticipantNickname(message.from, room);
                    const isLocal = message.from.isLocal;

                    const fontStyle = msgData.fontStyle || FONT_STYLES[0].style;
                    const textEffect = msgData.textEffect || 'none';

                    // 🎯 서버에서 받은 고유 ID 사용, 없으면 생성
                    const messageId = msgData.messageId || `${senderName}-${msgData.time}-${msgData.text}-${Date.now()}`;

                    if (msgData.translations && typeof msgData.translations === 'object') {
                        const sourceLocale = normalizeLocale(msgData.locale || 'ko-KR');
                        const translated = findTranslation(msgData.translations, myLocale);

                        if (translated) {
                            const translatedMessage = {
                                id: messageId,
                                type: 'chat',
                                text: translated,
                                originalText: msgData.text,
                                translatedTexts: msgData.translations,
                                sourceLocale: sourceLocale,
                                sender: senderName,
                                time: msgData.time,
                                isLocal: isLocal,
                                isTranslated: true,
                                fontStyle: fontStyle,
                                textEffect: textEffect,
                            };
                            setMessages((prev) => {
                                // 🎯 같은 ID가 이미 있으면 추가하지 않음 (진짜 중복 방지)
                                if (prev.some((m) => m.id === messageId)) return prev;
                                return [...prev, translatedMessage];
                            });
                            return;
                        }
                    }

                    const originalMessage = {
                        id: messageId,
                        type: 'chat',
                        text: msgData.text,
                        sender: senderName,
                        time: msgData.time,
                        isLocal: isLocal,
                        isTranslated: false,
                        fontStyle: fontStyle,
                        textEffect: textEffect,
                    };
                    setMessages((prev) => {
                        // 🎯 같은 ID가 이미 있으면 추가하지 않음 (진짜 중복 방지)
                        if (prev.some((m) => m.id === messageId)) return prev;
                        return [...prev, originalMessage];
                    });
                } catch (error) {
                    console.error('메시지 파싱 실패:', error);
                }
            }
        },
        [room, myLocale],
    );

    useDataChannel('chat_messages', onMessage);

    useEffect(() => {
        if (sttFinals.length === 0 || !localParticipant) return;

        const latestSTT = sttFinals[sttFinals.length - 1];
        const myUsername = getParticipantNickname(localParticipant, room);
        const sttUsername = latestSTT.username || latestSTT.identity;
        const isLocal = sttUsername === myUsername || latestSTT.identity === localParticipant.identity;
        const timestamp = new Date(latestSTT.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        const messageId = `stt-${latestSTT.identity}-${latestSTT.text}-${latestSTT.ts}`;

        if (lastProcessedIdRef.current === messageId) {
            return;
        }

        if (processedSttMessagesRef.current.has(messageId)) {
            lastProcessedIdRef.current = messageId;
            return;
        }

        processedSttMessagesRef.current.add(messageId);
        lastProcessedIdRef.current = messageId;

        setTimeout(() => {
            processedSttMessagesRef.current.delete(messageId);
        }, 10000);

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
                    sourceLocale: sourceLocale,
                    sender: sttUsername,
                    time: timestamp,
                    isLocal: isLocal,
                    isTranslated: true,
                };

                setMessages((prev) => {
                    if (prev.some((msg) => msg.id === messageId)) {
                        return prev;
                    }

                    if (!triggeredEffectsRef.current.has(messageId)) {
                        const sttText = latestSTT.text || '';
                        const detectedEffect = detectSpecialEffect(sttText);

                        let effectToTrigger = detectedEffect;
                        if (translated) {
                            const translatedEffect = detectSpecialEffect(translated);
                            if (translatedEffect) {
                                effectToTrigger = translatedEffect;
                            }
                        }

                        if (effectToTrigger && onEffectTrigger) {
                            onEffectTrigger(effectToTrigger);
                            triggeredEffectsRef.current.add(messageId);

                            setTimeout(() => {
                                triggeredEffectsRef.current.delete(messageId);
                            }, 10000);
                        }
                    }

                    return [...prev, translatedSTTMessage];
                });
                return;
            }
        }

        const sttMessage = {
            id: messageId,
            type: 'stt',
            text: `🎤 ${latestSTT.text}`,
            sender: sttUsername,
            time: timestamp,
            isLocal: isLocal,
            isTranslated: false,
        };

        setMessages((prev) => {
            if (prev.some((msg) => msg.id === messageId)) {
                return prev;
            }

            if (!triggeredEffectsRef.current.has(messageId)) {
                const sttText = latestSTT.text || '';
                const detectedEffect = detectSpecialEffect(sttText);

                if (detectedEffect && onEffectTrigger) {
                    onEffectTrigger(detectedEffect);
                    triggeredEffectsRef.current.add(messageId);

                    setTimeout(() => {
                        triggeredEffectsRef.current.delete(messageId);
                    }, 10000);
                }
            }

            return [...prev, sttMessage];
        });
    }, [sttFinals.length, localParticipant?.identity, myLocale]);

    const handleSendMessage = useCallback(() => {
        if (!chatInput.trim() || !sendChat || !localParticipant) return;

        const myUsername = getParticipantNickname(localParticipant, room);
        const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        // 🎯 고유 ID 생성 (밀리초 타임스탬프 + 랜덤 값)
        const uniqueId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        const messagePayload = {
            type: 'chat',
            text: chatInput,
            username: myUsername,
            locale: myLocale,
            time: currentTime,
            fontStyle: selectedFont.style,
            textEffect: selectedEffect.id,
            messageId: uniqueId, // 🎯 고유 ID 추가
        };

        const textEncoder = new TextEncoder();
        sendChat(textEncoder.encode(JSON.stringify(messagePayload)));

        const localMessage = {
            ...messagePayload,
            id: uniqueId, // 🎯 고유 ID 사용
            sender: myUsername,
            isLocal: true,
            isTranslated: false,
        };

        setMessages((prev) => [...prev, localMessage]);
        setChatInput('');
        setShowEmojiPicker(false);
        setShowFontPicker(false);
        setShowTextEffectPicker(false);
    }, [chatInput, sendChat, localParticipant, room, myLocale, selectedFont, selectedEffect]);

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

    const handleLike = () => {
        setLikeCount((prev) => prev + 1);
    };

    const getInputStyle = () => {
        const baseStyle = selectedFont.inputSafe ? selectedFont.style : selectedFont.inputStyle || {};

        return {
            fontFamily: baseStyle.fontFamily,
            fontWeight: baseStyle.fontWeight,
            fontStyle: baseStyle.fontStyle,
            letterSpacing: baseStyle.letterSpacing,
            color: '#111827',
            WebkitTextFillColor: '#111827',
            background: 'transparent',
            WebkitBackgroundClip: 'initial',
            backgroundClip: 'initial',
        };
    };

    return (
        <div className="w-full h-full bg-gradient-to-b from-pink-50 to-purple-50 flex flex-col rounded-3xl shadow-2xl overflow-hidden border border-pink-100 relative">
            {/* 🎯 애니메이션 리스트 사이드바 - isOpen이 true일 때만 렌더링 */}
            <AnimationListSidebar isOpen={showAnimationList} onClose={() => setShowAnimationList(false)} onSelectEffect={handleEmojiClick} />

            {/* Header */}
            <div className="flex-shrink-0 bg-gradient-to-r from-pink-500 to-purple-600 text-white p-4 shadow-lg">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                        <h2 className="text-lg font-bold">실시간 채팅</h2>
                    </div>
                    {onClose && (
                        <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    )}
                </div>

                {/* Tabs */}
                <div className="flex gap-3">
                    <button
                        onClick={() => setActiveTab('chat')}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                            activeTab === 'chat' ? 'bg-white text-pink-600 shadow-md' : 'bg-white/20 text-white hover:bg-white/30'
                        }`}
                    >
                        <MessageCircle className="w-4 h-4" />
                        채팅 {messages.length > 0 && `(${messages.length})`}
                    </button>
                    <button
                        onClick={() => setActiveTab('participants')}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                            activeTab === 'participants' ? 'bg-white text-purple-600 shadow-md' : 'bg-white/20 text-white hover:bg-white/30'
                        }`}
                    >
                        <Users className="w-4 h-4" />
                        참여자 ({remoteParticipants.length + 1})
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-grow overflow-hidden">
                {activeTab === 'chat' && (
                    <div className="h-full flex flex-col">
                        {/* Messages */}
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
                                        key={msg.id || `${msg.sender}-${msg.time}-${Math.random()}`}
                                        msg={msg}
                                        userLocale={userLocale}
                                        onLike={handleLike}
                                        onEffectTrigger={onEffectTrigger}
                                        triggeredMessages={triggeredChatMessagesRef}
                                    />
                                ))
                            )}
                            <div ref={chatEndRef} />
                        </div>

                        {/* 이모지 피커 */}
                        {showEmojiPicker && (
                            <div className="flex-shrink-0 p-3 bg-white border-t border-pink-100">
                                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                                    {QUICK_EMOJIS.map((emoji) => (
                                        <button
                                            key={emoji}
                                            onClick={() => handleEmojiClick(emoji)}
                                            className="w-10 h-10 rounded-lg bg-pink-50 hover:bg-pink-100 flex items-center justify-center text-xl transition-colors hover:scale-110 transform flex-shrink-0"
                                        >
                                            {emoji}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* 폰트 피커 */}
                        {showFontPicker && (
                            <div className="flex-shrink-0 p-3 bg-white border-t border-pink-100">
                                <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto">
                                    {FONT_STYLES.map((font) => (
                                        <button
                                            key={font.id}
                                            onClick={() => {
                                                setSelectedFont(font);
                                                setShowFontPicker(false);
                                            }}
                                            className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                                                selectedFont.id === font.id ? 'bg-pink-500 text-white' : 'bg-pink-50 hover:bg-pink-100 text-gray-700'
                                            }`}
                                        >
                                            <span style={selectedFont.id === font.id ? {} : font.style}>{font.name}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* 텍스트 효과 피커 */}
                        {showTextEffectPicker && (
                            <div className="flex-shrink-0 p-3 bg-white border-t border-pink-100">
                                <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto">
                                    {TEXT_EFFECTS.map((effect) => (
                                        <button
                                            key={effect.id}
                                            onClick={() => {
                                                setSelectedEffect(effect);
                                                setShowTextEffectPicker(false);
                                            }}
                                            className={`px-3 py-2 rounded-lg text-xs text-left transition-colors ${
                                                selectedEffect.id === effect.id ? 'bg-purple-500 text-white' : 'bg-purple-50 hover:bg-purple-100 text-gray-700'
                                            }`}
                                        >
                                            <span className="block font-semibold">{effect.name}</span>
                                            {effect.id !== 'none' && (
                                                <span className="block text-[10px] opacity-70 mt-0.5">
                                                    {effect.id === 'pop' && '일반 강조'}
                                                    {effect.id === 'bounce-once' && '축하, 긍정적인 말'}
                                                    {effect.id === 'shake' && '경고/강조'}
                                                    {effect.id === 'wave' && '인사/가벼운 농담'}
                                                    {effect.id === 'glow' && '중요 문장 강조'}
                                                </span>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Input */}
                        <div className="flex-shrink-0 p-4 bg-white border-t border-pink-100">
                            {/* 툴바 */}
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                                <button
                                    onClick={() => {
                                        setShowEmojiPicker(!showEmojiPicker);
                                        setShowFontPicker(false);
                                        setShowTextEffectPicker(false);
                                    }}
                                    className={`p-2 rounded-lg transition-colors ${showEmojiPicker ? 'bg-pink-500 text-white' : 'bg-pink-50 hover:bg-pink-100 text-gray-600'}`}
                                    title="이모지"
                                >
                                    <Smile className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => {
                                        setShowFontPicker(!showFontPicker);
                                        setShowEmojiPicker(false);
                                        setShowTextEffectPicker(false);
                                    }}
                                    className={`p-2 rounded-lg transition-colors ${showFontPicker ? 'bg-pink-500 text-white' : 'bg-pink-50 hover:bg-pink-100 text-gray-600'}`}
                                    title="폰트"
                                >
                                    <Type className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => {
                                        setShowTextEffectPicker(!showTextEffectPicker);
                                        setShowEmojiPicker(false);
                                        setShowFontPicker(false);
                                    }}
                                    className={`p-2 rounded-lg transition-colors ${showTextEffectPicker ? 'bg-pink-500 text-white' : 'bg-pink-50 hover:bg-pink-100 text-gray-600'}`}
                                    title="텍스트 애니메이션"
                                >
                                    <Sparkles className="w-5 h-5" />
                                </button>

                                {/* 🎯 애니메이션 목록 버튼 - 클릭시 모달 열기 */}
                                <button
                                    onClick={() => setShowAnimationList(true)}
                                    className="p-2 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-600 transition-colors"
                                    title="애니메이션 목록 보기"
                                >
                                    <Info className="w-5 h-5" />
                                </button>

                                {/* 선택된 폰트 태그 */}
                                {selectedFont.id !== 'default' && (
                                    <span className="text-xs px-2 py-1 rounded-full bg-pink-100 text-pink-600" style={selectedFont.style}>
                                        {selectedFont.name}
                                    </span>
                                )}

                                {/* 🎯 선택된 텍스트 애니메이션 태그 */}
                                {selectedEffect.id !== 'none' && <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-600">{selectedEffect.name}</span>}
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    className="flex-1 bg-pink-50 border-2 border-pink-200 rounded-full px-4 py-2.5 text-sm placeholder-gray-400 focus:outline-none focus:border-pink-400 transition-colors text-gray-900"
                                    placeholder="메시지를 입력하세요..."
                                    value={chatInput}
                                    onChange={(e) => setChatInput(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    style={getInputStyle()}
                                />
                                <button
                                    onClick={handleSendMessage}
                                    disabled={!chatInput.trim()}
                                    className="w-10 h-10 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white flex items-center justify-center hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 flex-shrink-0"
                                >
                                    <Send className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'participants' && (
                    <div className="h-full overflow-y-auto p-4 space-y-3">
                        <div className="flex items-center gap-3 p-3 bg-white rounded-xl shadow-sm border border-pink-100">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                                {localParticipant?.name?.charAt(0).toUpperCase() || 'Y'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-gray-800 truncate">
                                    {getParticipantNickname(localParticipant, room)} <span className="text-xs text-pink-600">(나)</span>
                                </p>
                                <p className="text-xs text-gray-500">호스트</p>
                            </div>
                        </div>

                        {remoteParticipants.map((p) => (
                            <div key={p.identity} className="flex items-center gap-3 p-3 bg-white rounded-xl shadow-sm border border-purple-100">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                                    {p.name?.charAt(0).toUpperCase() || 'G'}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-gray-800 truncate">{getParticipantNickname(p, room)}</p>
                                    <p className="text-xs text-gray-500">게스트</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Like Counter */}
            {likeCount > 0 && (
                <div className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-pink-500 text-white px-4 py-2 rounded-full shadow-lg animate-bounce">
                    <Heart className="w-4 h-4 inline mr-1 fill-current" />+{likeCount}
                </div>
            )}

            <style>{`
                @keyframes slide-in-right {
                    from {
                        transform: translateX(100%);
                    }
                    to {
                        transform: translateX(0);
                    }
                }
                .animate-slide-in-right {
                    animation: slide-in-right 0.3s ease-out;
                }
            `}</style>
        </div>
    );
};

export default CultureLiveChatSidebar;
