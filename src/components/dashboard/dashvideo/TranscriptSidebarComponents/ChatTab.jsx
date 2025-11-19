// src/components/dashboard/dashvideo/TranscriptSidebarComponents/ChatTab.jsx
import React, { useRef, useEffect } from 'react';
import { findTranslation, normalizeLocale } from './TranscriptSidebarUtils';

const TranslateIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m5 8 6 6" />
        <path d="m4 14 6-6 2-3" />
        <path d="M2 5h12" />
        <path d="M7 2h1" />
        <path d="m22 22-5-10-5 10" />
        <path d="M14 18h6" />
    </svg>
);

const ChatEmptyIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
);

// MessageBubble Component - 완전 수정본
const MessageBubble = ({ msg, userLocale }) => {
    const isLocal = msg.isLocal;
    const myLocale = normalizeLocale(userLocale);

    // ✅ 원문과 번역 텍스트 올바르게 추출
    const translatedText = msg.text; // 번역된 텍스트 (또는 원문)
    const originalText = msg.originalText || msg.text; // ✅ originalText 우선 사용!

    console.log('💬 MessageBubble render:', {
        id: msg.id, // 🎯 ID 로깅 추가
        isTranslated: msg.isTranslated,
        originalText,
        translatedText,
        sourceLocale: msg.sourceLocale,
        myLocale,
    });

    return (
        <div className={`flex items-end gap-3 ${isLocal ? 'justify-end' : 'justify-start'}`}>
            {!isLocal && <img src={`https://i.pravatar.cc/40?u=${msg.sender}`} alt="avatar" className="w-9 h-9 rounded-full flex-shrink-0 self-start" />}

            <div className={`flex flex-col max-w-xs lg:max-w-sm ${isLocal ? 'items-end' : 'items-start'}`}>
                {/* 발신자 정보 */}
                {!isLocal && (
                    <p className="text-sm font-medium text-gray-400 mb-1.5 px-2">
                        {msg.sender}
                        <span className="text-xs text-gray-500 ml-2">{msg.time}</span>
                    </p>
                )}
                {isLocal && <p className="text-xs text-gray-500 mb-1.5 px-2">{msg.time}</p>}

                {/* 메시지 버블 */}
                <div
                    className={`rounded-2xl px-4 py-3 shadow-md ${
                        msg.isTranslated
                            ? isLocal
                                ? 'bg-gradient-to-br from-blue-600 to-blue-500 text-white rounded-br-none border border-blue-400/30'
                                : 'bg-gradient-to-br from-[#424A63] to-[#3A425A] text-gray-100 rounded-bl-none border border-blue-400/20'
                            : isLocal
                            ? 'bg-blue-600 text-white rounded-br-none'
                            : 'bg-[#3A425A] text-gray-200 rounded-bl-none'
                    }`}
                >
                    {/* 번역된 메시지인 경우 */}
                    {msg.isTranslated && originalText !== translatedText ? (
                        <div className="space-y-2">
                            {/* 번역 아이콘 + 원문 (작고 흐리게) */}
                            <div className={`flex items-start gap-2 pb-2 border-b ${isLocal ? 'border-blue-400/30' : 'border-gray-600/40'}`}>
                                <TranslateIcon />
                                <div className="flex-1">
                                    <p className={`text-xs mb-1 ${isLocal ? 'text-blue-100' : 'text-gray-400'}`}>원문 ({msg.sourceLocale})</p>
                                    <p className={`text-xs italic ${isLocal ? 'text-white/70' : 'text-gray-300/70'}`}>{originalText}</p>
                                </div>
                            </div>

                            {/* 번역 텍스트 (크고 선명하게) */}
                            <div>
                                <p className="text-xs mb-1 font-semibold text-blue-300">번역 ({myLocale})</p>
                                <p className="text-sm font-medium break-words whitespace-pre-wrap">{translatedText}</p>
                            </div>
                        </div>
                    ) : (
                        /* 원문만 있는 경우 */
                        <p className="text-sm break-words whitespace-pre-wrap">{originalText}</p>
                    )}
                </div>
            </div>
        </div>
    );
};

// ChatTab Component
const ChatTab = ({ messages, userLocale }) => {
    const chatEndRef = useRef(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    if (messages.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <ChatEmptyIcon />
                <p className="text-sm mt-4">아직 메시지가 없습니다</p>
                <p className="text-xs mt-1">대화를 시작해보세요!</p>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col">
            <div className="flex-grow space-y-6 pr-1 overflow-y-auto">
                {messages.map((msg, i) => (
                    <MessageBubble
                        // ✅ 고유 ID를 key로 사용 (없으면 fallback)
                        key={msg.id || `${msg.sender}-${msg.time}-${msg.isTranslated}-${i}`}
                        msg={msg}
                        userLocale={userLocale}
                    />
                ))}
                <div ref={chatEndRef} />
            </div>
        </div>
    );
};

export default ChatTab;
