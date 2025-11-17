// src/components/dashboard/dashvideo/TranscriptSidebarComponents/TranscriptSidebar.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useDataChannel, useLocalParticipant, useRemoteParticipants, useRoomContext } from '@livekit/components-react';

// Tabs
import ChatTab from './ChatTab';
import ParticipantsTab from './ParticipantsTab';
import DocumentsTab from './DocumentsTab';
import DictionaryTab from './DictionaryTab';
import { findTranslation, getParticipantNickname, normalizeLocale } from './TranscriptSidebarUtils';

// ==================== Icons ====================
const SendIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 2 11 13" />
        <path d="m22 2-7 20-4-9-9-4 20-7z" />
    </svg>
);

const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 6 6 18" />
        <path d="m6 6 12 12" />
    </svg>
);

const TranscriptSidebar = ({ documents = [], sttFinals = [], onClose, userLocale = 'ko-KR' }) => {
    const [messages, setMessages] = useState([]);
    const [chatInput, setChatInput] = useState('');
    const [activeTab, setActiveTab] = useState('chat');

    const room = useRoomContext();
    const { localParticipant } = useLocalParticipant();
    const remoteParticipants = useRemoteParticipants();
    const { send: sendChat } = useDataChannel('chat_messages');

    const myLocale = normalizeLocale(userLocale);

    console.log('🌍 TranscriptSidebar userLocale:', userLocale, '-> normalized:', myLocale);

    // 🔥 채팅 메시지 수신
    const onMessage = useCallback(
        (message) => {
            if (message.from) {
                try {
                    const textDecoder = new TextDecoder();
                    const msgData = JSON.parse(textDecoder.decode(message.payload));
                    const senderName = msgData.username || getParticipantNickname(message.from, room);
                    const isLocal = message.from.isLocal;

                    // 🔥 번역이 있으면 하나의 메시지로 처리
                    if (msgData.translations && typeof msgData.translations === 'object') {
                        const sourceLocale = normalizeLocale(msgData.locale || 'ko-KR');
                        const translated = findTranslation(msgData.translations, myLocale);

                        if (translated) {
                            const translatedMessage = {
                                type: 'chat',
                                text: translated, // 번역된 텍스트
                                originalText: msgData.text, // ✅ 원문 추가!
                                translatedTexts: msgData.translations,
                                sourceLocale: sourceLocale,
                                sender: senderName,
                                time: msgData.time,
                                isLocal: isLocal,
                                isTranslated: true,
                            };
                            setMessages((prev) => [...prev, translatedMessage]);
                            return; // ✅ 원문 메시지는 추가하지 않음
                        }
                    }

                    // 번역이 없으면 원문만
                    const originalMessage = {
                        type: 'chat',
                        text: msgData.text,
                        sender: senderName,
                        time: msgData.time,
                        isLocal: isLocal,
                        isTranslated: false,
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

    // 🔥 STT Finals 처리
    useEffect(() => {
        if (sttFinals.length > 0 && localParticipant) {
            const latestSTT = sttFinals[sttFinals.length - 1];
            const myUsername = getParticipantNickname(localParticipant, room);
            const sttUsername = latestSTT.username || latestSTT.identity;

            const isLocal = sttUsername === myUsername || latestSTT.identity === localParticipant.identity;
            const timestamp = new Date(latestSTT.ts * 1000).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
            });

            // 🔥 번역이 있는 경우
            if (latestSTT.translations && typeof latestSTT.translations === 'object') {
                const sourceLocale = normalizeLocale(latestSTT.locale || 'ko-KR');
                const translated = findTranslation(latestSTT.translations, myLocale);

                if (translated) {
                    const translatedSTTMessage = {
                        type: 'stt',
                        text: `🎤 ${translated}`, // 번역된 텍스트
                        originalText: `🎤 ${latestSTT.text}`, // ✅ 원문 추가!
                        translatedTexts: latestSTT.translations,
                        sourceLocale: sourceLocale,
                        sender: sttUsername,
                        time: timestamp,
                        isLocal: isLocal,
                        isTranslated: true,
                    };

                    setMessages((prev) => {
                        // 중복 체크
                        const isDuplicate = prev.some(
                            (msg) => msg.type === 'stt' && msg.originalText === translatedSTTMessage.originalText && msg.sender === sttUsername && Date.now() - new Date(msg.time).getTime() < 2000,
                        );

                        if (isDuplicate) {
                            console.log('⏭️ Duplicate STT message, skipping');
                            return prev;
                        }

                        return [...prev, translatedSTTMessage];
                    });

                    return; // ✅ 원문 메시지는 추가하지 않음
                }
            }

            // 번역이 없으면 원문만
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

                if (isDuplicate) {
                    console.log('⏭️ Duplicate STT message, skipping');
                    return prev;
                }

                return [...prev, sttMessage];
            });
        }
    }, [sttFinals, localParticipant, room, myLocale]);

    // 메시지 전송
    const handleSendMessage = useCallback(() => {
        if (!chatInput.trim() || !sendChat || !localParticipant) return;

        const myUsername = getParticipantNickname(localParticipant, room);
        const messagePayload = {
            type: 'chat',
            text: chatInput,
            username: myUsername,
            locale: myLocale,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        const textEncoder = new TextEncoder();
        sendChat(textEncoder.encode(JSON.stringify(messagePayload)));

        setMessages((prev) => [...prev, { ...messagePayload, sender: myUsername, isLocal: true, isTranslated: false }]);
        setChatInput('');
    }, [chatInput, sendChat, localParticipant, room, myLocale]);

    const handleKeyPress = useCallback(
        (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
            }
        },
        [handleSendMessage],
    );

    const renderContent = () => {
        switch (activeTab) {
            case 'chat':
                return <ChatTab messages={messages} userLocale={myLocale} />;
            case 'participants':
                return <ParticipantsTab localParticipant={localParticipant} remoteParticipants={remoteParticipants} room={room} />;
            case 'documents':
                return <DocumentsTab documents={documents} />; // 🔥 여기로 ConferenceUI 에서 받은 문서 배열 전달
            case 'dictionary':
                return <DictionaryTab />;
            default:
                return null;
        }
    };

    const getTabClass = (tabName) =>
        `pb-2 px-1 text-sm font-semibold transition-colors duration-200 cursor-pointer ${activeTab === tabName ? 'text-white border-b-2 border-pink-500' : 'text-gray-400 hover:text-white'}`;

    return (
        <div className="w-full h-full bg-[#2C3349] flex flex-col shadow-2xl rounded-r-2xl">
            {/* 헤더 */}
            <div className="flex-shrink-0 flex justify-between items-center p-4 border-b border-gray-700/50">
                <div className="flex space-x-5">
                    <button onClick={() => setActiveTab('chat')} className={getTabClass('chat')}>
                        채팅
                    </button>
                    <button onClick={() => setActiveTab('participants')} className={getTabClass('participants')}>
                        참가자
                    </button>
                    <button onClick={() => setActiveTab('documents')} className={getTabClass('documents')}>
                        자료
                    </button>
                    <button onClick={() => setActiveTab('dictionary')} className={getTabClass('dictionary')}>
                        사전
                    </button>
                </div>
                {onClose && (
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <CloseIcon />
                    </button>
                )}
            </div>

            {/* 콘텐츠 */}
            <div className="flex-grow p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">{renderContent()}</div>

            {/* 채팅 입력 */}
            {activeTab === 'chat' && (
                <div className="flex-shrink-0 p-3 border-t border-gray-700/50 bg-[#22283A]">
                    <div className="flex items-center space-x-2">
                        <input
                            type="text"
                            className="w-full bg-[#3A425A] border-transparent rounded-lg px-4 py-2.5 text-sm text-gray-200 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                            placeholder="메시지를 입력하세요..."
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                        />
                        <button
                            onClick={handleSendMessage}
                            className="p-2.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:bg-blue-400/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#22283A] focus:ring-blue-500 transition-colors"
                            disabled={!chatInput.trim()}
                        >
                            <SendIcon />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TranscriptSidebar;
