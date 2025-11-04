import React, { useState, useEffect, useRef } from 'react';
import { useDataChannel, useLocalParticipant, useRemoteParticipants } from '@livekit/components-react';

// --- Helper Icons ---
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

const FileText = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
    </svg>
);

const MutedIcon = () => (
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
        className="text-gray-500"
    >
        <path d="M11.5 5.5a5 5 0 0 0-5 5v2" />
        <path d="M15.5 10.5a5 5 0 0 1-5 5" />
        <path d="m2 2 20 20" />
        <path d="M17 10.5V11a5 5 0 0 1-4.24 4.95" />
        <path d="M8.5 8.5a5 5 0 0 0 5 5" />
    </svg>
);

// ✅ 닉네임 가져오기 함수
const getParticipantNickname = (participant) => {
    if (!participant) return 'Unknown';
    if (participant.name) return participant.name;
    try {
        const metadata = JSON.parse(participant.metadata);
        return metadata?.username || participant.identity;
    } catch {
        return participant.identity;
    }
};

// ✅ 메시지 버블 컴포넌트
const MessageBubble = ({ msg }) => {
    const isLocal = msg.isLocal;

    return (
        <div className={`flex items-end gap-3 ${isLocal ? 'justify-end' : 'justify-start'}`}>
            {!isLocal && <img src={`https://i.pravatar.cc/40?u=${msg.sender}`} alt="avatar" className="w-9 h-9 rounded-full flex-shrink-0 self-start" />}
            <div className={`flex flex-col max-w-xs lg:max-w-sm ${isLocal ? 'items-end' : 'items-start'}`}>
                <p className="text-sm font-medium text-gray-400 mb-1.5 px-2">
                    {msg.sender}
                    <span className="text-xs text-gray-500 ml-2">{msg.time}</span>
                </p>
                <div className={`rounded-2xl px-4 py-3 shadow-md ${isLocal ? 'bg-blue-600 text-white rounded-br-none' : 'bg-[#3A425A] text-gray-200 rounded-bl-none'}`}>
                    <p className="text-sm break-words whitespace-pre-wrap">{msg.text}</p>
                </div>
            </div>
        </div>
    );
};

// ✅ 문서 아이템 컴포넌트
const DocumentItem = ({ doc }) => (
    <div className="bg-[#3A425A] p-4 rounded-lg border border-gray-700/80 flex items-center gap-3 hover:bg-gray-700/70 transition-colors cursor-pointer">
        <div className="bg-blue-500/20 p-2.5 rounded-lg">
            <FileText />
        </div>
        <div className="flex-1">
            <h3 className="font-bold text-white text-md">{doc.title}</h3>
            <p className="text-sm text-gray-400">
                {doc.fileType || 'PDF'} • {doc.size}
            </p>
        </div>
    </div>
);

// ✅ 사전 데이터
const dictionaryData = [
    {
        term: '손맛',
        pronunciation: 'Son-mat',
        definition: '레시피만으로는 설명할 수 없는, 요리하는 사람의 정성과 경험이 만들어내는 깊은 맛. "Hand taste".',
    },
    {
        term: '정',
        pronunciation: 'Jeong',
        definition: '단순한 애정이나 동정심을 넘어, 사람들과의 관계 속에서 형성되는 따뜻하고 깊은 유대감.',
    },
    {
        term: '한',
        pronunciation: 'Han',
        definition: '개인적 또는 역사적 고난과 슬픔이 쌓여 응어리진, 한국 문화 특유의 복합적인 정서.',
    },
    {
        term: '눈치',
        pronunciation: 'Nunchi',
        definition: '말로 표현되지 않는 상대방의 기분이나 상황을 빠르고 정확하게 파악하는 능력. "Eye-measure".',
    },
    {
        term: '답정너',
        pronunciation: 'Dap-jeong-neo',
        definition: '"답은 정해져 있고 너는 대답만 하면 돼"의 줄임말. 이미 답을 정해놓고 질문하여 원하는 대답을 유도하는 사람.',
    },
    {
        term: '내로남불',
        pronunciation: 'Nae-ro-nam-bul',
        definition: '"내가 하면 로맨스, 남이 하면 불륜"의 줄임말. 같은 상황을 자신에게는 유리하게, 남에게는 불리하게 해석하는 이중잣대.',
    },
    {
        term: '흥',
        pronunciation: 'Heung',
        definition: '음악, 춤, 놀이 등에서 느끼는 신나고 들뜬 기분. 억제할 수 없는 즐거운 감정의 발산.',
    },
    {
        term: '멘붕',
        pronunciation: 'Men-bung',
        definition: '"멘탈 붕괴"의 줄임말. 정신적 충격으로 인해 정상적인 사고나 행동이 어려운 상태.',
    },
];

// --- 메인 사이드바 컴포넌트 ---
const TranscriptSidebar = ({ documents = [], sttFinals = [], onClose }) => {
    const [messages, setMessages] = useState([]);
    const [chatInput, setChatInput] = useState('');
    const [activeTab, setActiveTab] = useState('chat');

    const { localParticipant } = useLocalParticipant();
    const remoteParticipants = useRemoteParticipants();
    const { send: sendChat } = useDataChannel('chat_messages');

    const chatEndRef = useRef(null);

    // ✅ 채팅 메시지 수신
    const onMessage = (message) => {
        if (message.from) {
            try {
                const textDecoder = new TextDecoder();
                const msgData = JSON.parse(textDecoder.decode(message.payload));
                const fullMessage = {
                    ...msgData,
                    sender: getParticipantNickname(message.from),
                    isLocal: message.from.isLocal,
                };
                setMessages((prev) => [...prev, fullMessage]);
            } catch (error) {
                console.error('메시지 파싱 실패:', error);
            }
        }
    };

    useDataChannel('chat_messages', onMessage);

    // ✅ STT Finals를 채팅창에 통합 (선택사항)
    useEffect(() => {
        if (sttFinals.length > 0) {
            const latestSTT = sttFinals[sttFinals.length - 1];
            const sttMessage = {
                type: 'stt',
                text: `🎤 ${latestSTT.text}`,
                sender: latestSTT.identity,
                time: new Date(latestSTT.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                isLocal: false,
            };
            setMessages((prev) => [...prev, sttMessage]);
        }
    }, [sttFinals]);

    // ✅ 자동 스크롤
    useEffect(() => {
        if (activeTab === 'chat') {
            chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, activeTab]);

    // ✅ 메시지 전송
    const handleSendMessage = () => {
        if (!chatInput.trim() || !sendChat || !localParticipant) return;

        const messagePayload = {
            type: 'chat',
            text: chatInput,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        const textEncoder = new TextEncoder();
        sendChat(textEncoder.encode(JSON.stringify(messagePayload)));

        const newChatMessage = {
            ...messagePayload,
            sender: getParticipantNickname(localParticipant),
            isLocal: true,
        };

        setMessages((prev) => [...prev, newChatMessage]);
        setChatInput('');
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    // ✅ 탭별 콘텐츠 렌더링
    const renderContent = () => {
        switch (activeTab) {
            case 'chat':
                return (
                    <div className="h-full flex flex-col">
                        <div className="flex-grow space-y-6 pr-1 overflow-y-auto">
                            {messages.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mb-4">
                                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                                    </svg>
                                    <p className="text-sm">아직 메시지가 없습니다</p>
                                    <p className="text-xs mt-1">대화를 시작해보세요!</p>
                                </div>
                            ) : (
                                messages.map((msg, i) => <MessageBubble key={i} msg={msg} />)
                            )}
                            <div ref={chatEndRef} />
                        </div>
                    </div>
                );

            case 'participants':
                return (
                    <div className="space-y-2">
                        {[localParticipant, ...remoteParticipants].filter(Boolean).map((p) => (
                            <div
                                key={p.sid}
                                className="flex items-center justify-between p-3 rounded-xl bg-[#3A425A]/60 border border-transparent hover:border-gray-600/80 transition-colors duration-200"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="relative">
                                        <img src={`https://i.pravatar.cc/44?u=${p.identity}`} alt="avatar" className="w-11 h-11 rounded-full" />
                                        {p.isSpeaking && <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-[#2C3349] animate-pulse"></div>}
                                    </div>
                                    <span className="font-semibold text-gray-200">{getParticipantNickname(p)}</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    {!p.isCameraEnabled && <MutedIcon />}
                                    {p.isLocal && <span className="text-xs font-bold text-green-300 bg-green-500/20 px-3 py-1 rounded-full">나</span>}
                                </div>
                            </div>
                        ))}
                    </div>
                );

            case 'documents':
                return (
                    <div className="space-y-3">
                        {documents.length === 0 ? (
                            <div className="text-center text-gray-400 py-16">
                                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                <p className="font-semibold">등록된 자료가 없습니다</p>
                                <p className="text-sm mt-1">회의 자료를 추가해보세요</p>
                            </div>
                        ) : (
                            documents.map((doc) => <DocumentItem key={doc.id} doc={doc} />)
                        )}
                    </div>
                );

            case 'dictionary':
                return (
                    <div className="space-y-4">
                        {dictionaryData.map((item, index) => (
                            <div key={index} className="bg-[#3A425A]/80 p-4 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors cursor-pointer">
                                <div className="flex items-baseline">
                                    <h3 className="text-lg font-bold text-white">{item.term}</h3>
                                    <span className="ml-2 text-md text-gray-400">({item.pronunciation})</span>
                                </div>
                                <p className="mt-2 text-gray-300 text-sm leading-relaxed">{item.definition}</p>
                            </div>
                        ))}
                    </div>
                );

            default:
                return null;
        }
    };

    const getTabClass = (tabName) =>
        `pb-2 px-1 text-sm font-semibold transition-colors duration-200 cursor-pointer ${activeTab === tabName ? 'text-white border-b-2 border-pink-500' : 'text-gray-400 hover:text-white'}`;

    return (
        <div className="w-full h-full bg-[#2C3349] flex flex-col shadow-2xl rounded-r-2xl">
            {/* 헤더 - 탭 네비게이션 */}
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

            {/* 메인 콘텐츠 영역 */}
            <div className="flex-grow p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">{renderContent()}</div>

            {/* 채팅 입력창 (채팅 탭에서만 표시) */}
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
