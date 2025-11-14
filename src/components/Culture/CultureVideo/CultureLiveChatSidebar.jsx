// src/components/Culture/LiveView/CultureLiveChatSidebar.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useDataChannel, useLocalParticipant, useRemoteParticipants, useRoomContext } from '@livekit/components-react';
import { MessageCircle, Users, Send, X, Sparkles, Globe, Heart, Smile, Type } from 'lucide-react';

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

// ==================== 특수 효과 트리거 감지 ====================
const SPECIAL_EFFECTS = {
    '🎉': { type: 'confetti', emoji: '🎉' },
    '🎊': { type: 'confetti', emoji: '🎊' },
    '💥': { type: 'explosion', emoji: '💥' },
    '✨': { type: 'sparkle', emoji: '✨' },
    '🌟': { type: 'star', emoji: '🌟' },
    '💖': { type: 'heart', emoji: '💖' },
    '❤️': { type: 'heart', emoji: '❤️' },
    '🔥': { type: 'fire', emoji: '🔥' },
    '🎆': { type: 'firework', emoji: '🎆' },
    '🎇': { type: 'firework', emoji: '🎇' },
};

const detectSpecialEffect = (text) => {
    for (const [emoji, effect] of Object.entries(SPECIAL_EFFECTS)) {
        if (text.includes(emoji)) {
            return effect;
        }
    }
    return null;
};

// ==================== 애니메이션 컴포넌트 ====================
const SpecialEffectAnimation = ({ effect, onComplete }) => {
    const [particles, setParticles] = useState([]);

    useEffect(() => {
        const count = effect.type === 'confetti' ? 50 : 30;
        const newParticles = Array.from({ length: count }, (_, i) => ({
            id: i,
            x: Math.random() * 100,
            y: -10,
            rotation: Math.random() * 360,
            delay: Math.random() * 0.3,
            duration: 1 + Math.random() * 1,
        }));
        setParticles(newParticles);

        const timer = setTimeout(() => {
            onComplete && onComplete();
        }, 3000);

        return () => clearTimeout(timer);
    }, [effect, onComplete]);

    const getParticleStyle = (particle) => {
        const baseStyle = {
            position: 'fixed',
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            fontSize: '2rem',
            zIndex: 9999,
            pointerEvents: 'none',
            animation: `fall-${effect.type} ${particle.duration}s ease-in ${particle.delay}s forwards`,
            transform: `rotate(${particle.rotation}deg)`,
        };
        return baseStyle;
    };

    return (
        <>
            {particles.map((particle) => (
                <div key={particle.id} style={getParticleStyle(particle)}>
                    {effect.emoji}
                </div>
            ))}
            <style>{`
                @keyframes fall-confetti {
                    0% { transform: translateY(0) rotate(0deg); opacity: 1; }
                    100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
                }
                @keyframes fall-explosion {
                    0% { transform: translate(0, 0) scale(0); opacity: 1; }
                    50% { transform: translate(${Math.random() * 200 - 100}px, ${Math.random() * 200 - 100}px) scale(1.5); opacity: 1; }
                    100% { transform: translate(${Math.random() * 300 - 150}px, ${Math.random() * 300 - 150}px) scale(0); opacity: 0; }
                }
                @keyframes fall-sparkle {
                    0% { transform: scale(0) rotate(0deg); opacity: 1; }
                    50% { transform: scale(1.5) rotate(180deg); opacity: 1; }
                    100% { transform: scale(0) rotate(360deg); opacity: 0; }
                }
                @keyframes fall-star {
                    0% { transform: translateY(-50px) scale(0) rotate(0deg); opacity: 0; }
                    50% { transform: translateY(30px) scale(1.2) rotate(180deg); opacity: 1; }
                    100% { transform: translateY(100vh) scale(0.5) rotate(360deg); opacity: 0; }
                }
                @keyframes fall-heart {
                    0% { transform: translateY(0) scale(0); opacity: 1; }
                    50% { transform: translateY(-100px) scale(1.5); opacity: 1; }
                    100% { transform: translateY(-200px) scale(0); opacity: 0; }
                }
                @keyframes fall-fire {
                    0% { transform: translateY(0) scale(1); opacity: 1; }
                    100% { transform: translateY(-150px) scale(2); opacity: 0; }
                }
                @keyframes fall-firework {
                    0% { transform: translate(0, 0) scale(0); opacity: 1; }
                    50% { transform: translate(0, -100px) scale(1.5); opacity: 1; }
                    100% { transform: translate(0, -200px) scale(0); opacity: 0; }
                }
            `}</style>
        </>
    );
};

// ==================== 폰트 스타일 옵션 ====================
const FONT_STYLES = [
    { id: 'default', name: '기본', style: { fontFamily: 'inherit' } },
    { id: 'bold', name: '굵게', style: { fontWeight: 'bold' } },
    { id: 'italic', name: '기울임', style: { fontStyle: 'italic' } },
    { id: 'cute', name: '귀여운', style: { fontFamily: '"Comic Sans MS", cursive' } },
    { id: 'elegant', name: '우아한', style: { fontFamily: 'serif', fontStyle: 'italic' } },
    { id: 'modern', name: '모던', style: { fontFamily: 'monospace', letterSpacing: '0.05em' } },
];

// ==================== Message Bubble Component ====================
const MessageBubble = ({ msg, userLocale, onLike, onEffectTrigger }) => {
    const isLocal = msg.isLocal;
    const myLocale = normalizeLocale(userLocale);
    const translatedText = msg.text;
    const originalText = msg.originalText || msg.text;
    const [liked, setLiked] = useState(false);

    // 특수 효과 감지 및 트리거
    useEffect(() => {
        const effect = detectSpecialEffect(originalText);
        if (effect && onEffectTrigger) {
            onEffectTrigger(effect);
        }
    }, [originalText, onEffectTrigger]);

    const handleLike = () => {
        setLiked(true);
        onLike && onLike(msg);
        setTimeout(() => setLiked(false), 1000);
    };

    // 폰트 스타일 적용
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
                        {/* Translated Message */}
                        {msg.isTranslated && originalText !== translatedText ? (
                            <div className="space-y-2">
                                {/* Original Text */}
                                <div className="flex items-start gap-2 pb-2 border-b border-white/20">
                                    <Globe className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                    <div className="flex-1">
                                        <p className="text-[10px] font-semibold mb-1 opacity-80">원문 ({msg.sourceLocale})</p>
                                        <p className="text-xs opacity-70 italic" style={fontStyle}>
                                            {originalText}
                                        </p>
                                    </div>
                                </div>

                                {/* Translated Text */}
                                <div className="flex items-start gap-2">
                                    <Sparkles className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                    <div className="flex-1">
                                        <p className="text-[10px] font-semibold mb-1 opacity-90">번역 ({myLocale})</p>
                                        <p className="text-sm font-medium break-words" style={fontStyle}>
                                            {translatedText}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            /* Original Only */
                            <p className="text-sm break-words" style={fontStyle}>
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
const CultureLiveChatSidebar = ({ userLocale = 'ko-KR', sttFinals = [], onClose }) => {
    const [messages, setMessages] = useState([]);
    const [chatInput, setChatInput] = useState('');
    const [activeTab, setActiveTab] = useState('chat');
    const [likeCount, setLikeCount] = useState(0);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [showFontPicker, setShowFontPicker] = useState(false);
    const [selectedFont, setSelectedFont] = useState(FONT_STYLES[0]);
    const [activeEffects, setActiveEffects] = useState([]);

    const chatEndRef = useRef(null);
    const room = useRoomContext();
    const { localParticipant } = useLocalParticipant();
    const remoteParticipants = useRemoteParticipants();
    const { send: sendChat } = useDataChannel('chat_messages');

    const myLocale = normalizeLocale(userLocale);

    // 빠른 이모지 리스트
    const quickEmojis = ['🎉', '🎊', '💥', '✨', '🌟', '💖', '❤️', '🔥', '🎆', '🎇', '😊', '😂', '👍', '🙌', '💪', '🎵', '🎤', '🎸'];

    // Auto scroll to bottom
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // 특수 효과 트리거
    const triggerEffect = useCallback((effect) => {
        const id = Date.now();
        setActiveEffects((prev) => [...prev, { ...effect, id }]);
    }, []);

    const removeEffect = useCallback((id) => {
        setActiveEffects((prev) => prev.filter((e) => e.id !== id));
    }, []);

    // 🔥 Chat Message Receiver
    const onMessage = useCallback(
        (message) => {
            if (message.from) {
                try {
                    const textDecoder = new TextDecoder();
                    const msgData = JSON.parse(textDecoder.decode(message.payload));
                    const senderName = msgData.username || getParticipantNickname(message.from, room);
                    const isLocal = message.from.isLocal;

                    // 폰트 스타일 파싱
                    const fontStyle = msgData.fontStyle || FONT_STYLES[0].style;

                    if (msgData.translations && typeof msgData.translations === 'object') {
                        const sourceLocale = normalizeLocale(msgData.locale || 'ko-KR');
                        const translated = findTranslation(msgData.translations, myLocale);

                        if (translated) {
                            const translatedMessage = {
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
                            };
                            setMessages((prev) => [...prev, translatedMessage]);
                            return;
                        }
                    }

                    const originalMessage = {
                        type: 'chat',
                        text: msgData.text,
                        sender: senderName,
                        time: msgData.time,
                        isLocal: isLocal,
                        isTranslated: false,
                        fontStyle: fontStyle,
                    };
                    setMessages((prev) => [...prev, originalMessage]);
                } catch (error) {
                    console.error('메시지 파싱 실패:', error);
                }
            }
        },
        [room, myLocale],
    );

    useDataChannel('chat_messages', onMessage);

    // 🔥 STT Finals Handler
    useEffect(() => {
        if (sttFinals.length > 0 && localParticipant) {
            const latestSTT = sttFinals[sttFinals.length - 1];
            const myUsername = getParticipantNickname(localParticipant, room);
            const sttUsername = latestSTT.username || latestSTT.identity;
            const isLocal = sttUsername === myUsername || latestSTT.identity === localParticipant.identity;
            const timestamp = new Date(latestSTT.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            if (latestSTT.translations && typeof latestSTT.translations === 'object') {
                const sourceLocale = normalizeLocale(latestSTT.locale || 'ko-KR');
                const translated = findTranslation(latestSTT.translations, myLocale);

                if (translated) {
                    const translatedSTTMessage = {
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
                        const isDuplicate = prev.some(
                            (msg) => msg.type === 'stt' && msg.originalText === translatedSTTMessage.originalText && msg.sender === sttUsername && Date.now() - new Date(msg.time).getTime() < 2000,
                        );
                        if (isDuplicate) return prev;
                        return [...prev, translatedSTTMessage];
                    });
                    return;
                }
            }

            const sttMessage = {
                type: 'stt',
                text: `🎤 ${latestSTT.text}`,
                sender: sttUsername,
                time: timestamp,
                isLocal: isLocal,
                isTranslated: false,
            };

            setMessages((prev) => {
                const isDuplicate = prev.some((msg) => msg.type === 'stt' && msg.text === sttMessage.text && msg.sender === sttUsername && Date.now() - new Date(msg.time).getTime() < 2000);
                if (isDuplicate) return prev;
                return [...prev, sttMessage];
            });
        }
    }, [sttFinals, localParticipant, room, myLocale]);

    // Send Message
    const handleSendMessage = useCallback(() => {
        if (!chatInput.trim() || !sendChat || !localParticipant) return;

        const myUsername = getParticipantNickname(localParticipant, room);
        const messagePayload = {
            type: 'chat',
            text: chatInput,
            username: myUsername,
            locale: myLocale,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            fontStyle: selectedFont.style, // 폰트 스타일 포함
        };

        const textEncoder = new TextEncoder();
        sendChat(textEncoder.encode(JSON.stringify(messagePayload)));

        setMessages((prev) => [...prev, { ...messagePayload, sender: myUsername, isLocal: true, isTranslated: false }]);
        setChatInput('');
        setShowEmojiPicker(false);
        setShowFontPicker(false);
    }, [chatInput, sendChat, localParticipant, room, myLocale, selectedFont]);

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
    };

    const handleLike = () => {
        setLikeCount((prev) => prev + 1);
    };

    return (
        <div className="w-full h-full bg-gradient-to-b from-pink-50 to-purple-50 flex flex-col rounded-3xl shadow-2xl overflow-hidden border border-pink-100 relative">
            {/* 특수 효과 렌더링 */}
            {activeEffects.map((effect) => (
                <SpecialEffectAnimation key={effect.id} effect={effect} onComplete={() => removeEffect(effect.id)} />
            ))}

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
                        <div className="flex-grow overflow-y-auto p-4 space-y-4">
                            {messages.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                    <MessageCircle className="w-16 h-16 mb-3 opacity-30" />
                                    <p className="text-sm font-medium">아직 메시지가 없습니다</p>
                                    <p className="text-xs mt-1">첫 메시지를 보내보세요! 🎉</p>
                                </div>
                            ) : (
                                messages.map((msg, i) => <MessageBubble key={`${msg.sender}-${msg.time}-${i}`} msg={msg} userLocale={userLocale} onLike={handleLike} onEffectTrigger={triggerEffect} />)
                            )}
                            <div ref={chatEndRef} />
                        </div>

                        {/* 이모지 피커 */}
                        {showEmojiPicker && (
                            <div className="flex-shrink-0 p-3 bg-white border-t border-pink-100">
                                <div className="flex flex-wrap gap-2">
                                    {quickEmojis.map((emoji) => (
                                        <button
                                            key={emoji}
                                            onClick={() => handleEmojiClick(emoji)}
                                            className="w-10 h-10 rounded-lg bg-pink-50 hover:bg-pink-100 flex items-center justify-center text-xl transition-colors"
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
                                <div className="grid grid-cols-2 gap-2">
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
                                            style={font.style}
                                        >
                                            {font.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Input */}
                        <div className="flex-shrink-0 p-4 bg-white border-t border-pink-100">
                            {/* 툴바 */}
                            <div className="flex items-center gap-2 mb-2">
                                <button
                                    onClick={() => {
                                        setShowEmojiPicker(!showEmojiPicker);
                                        setShowFontPicker(false);
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
                                    }}
                                    className={`p-2 rounded-lg transition-colors ${showFontPicker ? 'bg-pink-500 text-white' : 'bg-pink-50 hover:bg-pink-100 text-gray-600'}`}
                                    title="폰트"
                                >
                                    <Type className="w-5 h-5" />
                                </button>
                                {selectedFont.id !== 'default' && (
                                    <span className="text-xs px-2 py-1 rounded-full bg-pink-100 text-pink-600" style={selectedFont.style}>
                                        {selectedFont.name}
                                    </span>
                                )}
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    className="flex-1 bg-pink-50 border-2 border-pink-200 rounded-full px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-pink-400 transition-colors"
                                    placeholder="메시지를 입력하세요..."
                                    value={chatInput}
                                    onChange={(e) => setChatInput(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    style={selectedFont.style}
                                />
                                <button
                                    onClick={handleSendMessage}
                                    disabled={!chatInput.trim()}
                                    className="w-10 h-10 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white flex items-center justify-center hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105"
                                >
                                    <Send className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'participants' && (
                    <div className="h-full overflow-y-auto p-4 space-y-3">
                        {/* Local Participant */}
                        <div className="flex items-center gap-3 p-3 bg-white rounded-xl shadow-sm border border-pink-100">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white font-bold">
                                {localParticipant?.name?.charAt(0).toUpperCase() || 'Y'}
                            </div>
                            <div className="flex-1">
                                <p className="font-semibold text-gray-800">
                                    {getParticipantNickname(localParticipant, room)} <span className="text-xs text-pink-600">(나)</span>
                                </p>
                                <p className="text-xs text-gray-500">호스트</p>
                            </div>
                        </div>

                        {/* Remote Participants */}
                        {remoteParticipants.map((p) => (
                            <div key={p.identity} className="flex items-center gap-3 p-3 bg-white rounded-xl shadow-sm border border-purple-100">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center text-white font-bold">
                                    {p.name?.charAt(0).toUpperCase() || 'G'}
                                </div>
                                <div className="flex-1">
                                    <p className="font-semibold text-gray-800">{getParticipantNickname(p, room)}</p>
                                    <p className="text-xs text-gray-500">게스트</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Like Counter (optional) */}
            {likeCount > 0 && (
                <div className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-pink-500 text-white px-4 py-2 rounded-full shadow-lg animate-bounce">
                    <Heart className="w-4 h-4 inline mr-1 fill-current" />+{likeCount}
                </div>
            )}
        </div>
    );
};

export default CultureLiveChatSidebar;
