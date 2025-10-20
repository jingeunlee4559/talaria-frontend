import React, { useState, useEffect, useRef } from 'react';
import { useDataChannel, useLocalParticipant, useRemoteParticipants } from '@livekit/components-react';

// --- Helper Icons (You can replace these with your own icon library) ---

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

const SpeakingIcon = () => (
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
        className="text-green-400 animate-pulse"
    >
        <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
        <path d="M19 10v1a7 7 0 0 1-14 0v-1" />
        <line x1="12" x2="12" y1="19" y2="22" />
    </svg>
);

// --- File Type Icons ---
const PdfIcon = () => (
    <div className="bg-red-500/20 p-2.5 rounded-lg">
        <svg className="w-7 h-7 text-red-400 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C9.243 2 7 4.243 7 7v10c0 2.757 2.243 5 5 5s5-2.243 5-5V7c0-1.654-1.346-3-3-3S11 5.346 11 7v9c0 .551.449 1 1 1s1-.449 1-1V8h2v8c0 1.654-1.346 3-3 3s-3-1.346-3-3V7c0-2.757 2.243-5 5-5s5 2.243 5 5v10c0 3.86-3.14 7-7 7s-7-3.14-7-7V7c0-3.86 3.14-7 7-7z" />
        </svg>
    </div>
);

const DocxIcon = () => (
    <div className="bg-blue-500/20 p-2.5 rounded-lg">
        <svg className="w-7 h-7 text-blue-400 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M14 2H6C4.9 2 4 2.9 4 4v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zM13 9V3.5L18.5 9H13z" />
        </svg>
    </div>
);

const XlsxIcon = () => (
    <div className="bg-green-500/20 p-2.5 rounded-lg">
        <svg className="w-7 h-7 text-green-400 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M14 2H6C4.9 2 4 2.9 4 4v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zM13 9V3.5L18.5 9H13z" />
        </svg>
    </div>
);

const getFileIcon = (fileType) => {
    switch (fileType?.toUpperCase()) {
        case 'PDF':
            return <PdfIcon />;
        case 'DOCX':
            return <DocxIcon />;
        case 'XLSX':
            return <XlsxIcon />;
        default:
            return <PdfIcon />;
    }
};

const DocumentItem = ({ title, fileType, fileSize, onDownload, id }) => (
    <div className="bg-[#3A425A] p-4 rounded-lg border border-gray-700/80 flex flex-col gap-4 transition-all hover:bg-gray-700/70">
        <div className="flex items-center gap-3">
            {getFileIcon(fileType)}
            <div>
                <h3 className="font-bold text-white text-md">{title}</h3>
                <p className="text-sm text-gray-400">
                    {fileType} • {fileSize}
                </p>
            </div>
        </div>
        <button
            onClick={() => onDownload(id)}
            className="w-full bg-[#E67E22] text-white font-bold py-2.5 rounded-lg hover:bg-[#D35400] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#3A425A] focus:ring-[#E67E22]"
        >
            다운로드
        </button>
    </div>
);

// --- 닉네임 가져오는 함수 (수정됨) ---
const getParticipantNickname = (participant) => {
    if (!participant) return 'Unknown';

    // participant.name이 LiveKit Room에 접속할 때 설정한 'participantName'입니다.
    // 이 값을 우선적으로 사용합니다.
    if (participant.name) {
        return participant.name;
    }

    // participant.name이 없는 경우를 대비한 폴백 로직
    try {
        const metadata = JSON.parse(participant.metadata);
        return metadata?.username || participant.identity;
    } catch (error) {
        return participant.identity;
    }
};

const dictionaryData = [
    { term: '손맛', pronunciation: 'Son-mat', definition: '레시피만으로는 설명할 수 없는, 요리하는 사람의 정성과 경험이 만들어내는 깊은 맛. "Hand taste".' },
    { term: '정', pronunciation: 'Jeong', definition: '단순한 애정이나 동정심을 넘어, 사람들과의 관계 속에서 형성되는 따뜻하고 깊은 유대감.' },
    { term: '한', pronunciation: 'Han', definition: '개인적 또는 역사적 고난과 슬픔이 쌓여 응어리진, 한국 문화 특유의 복합적인 정서.' },
    { term: '눈치', pronunciation: 'Nunchi', definition: '말로 표현되지 않는 상대방의 기분이나 상황을 빠르고 정확하게 파악하는 능력. "Eye-measure".' },
    { term: '답정너', pronunciation: 'Dap-jeong-neo', definition: '"답은 정해져 있고 너는 대답만 하면 돼"의 줄임말. 이미 답을 정해놓고 질문하여 원하는 대답을 유도하는 사람.' },
    { term: '내로남불', pronunciation: 'Nae-ro-nam-bul', definition: '"내가 하면 로맨스, 남이 하면 불륜"의 줄임말. 같은 상황을 자신에게는 유리하게, 남에게는 불리하게 해석하는 이중잣대.' },
];

const MessageBubble = ({ msg }) => {
    const isLocal = msg.isLocal;
    const isTranslation = msg.type === 'translation';

    return (
        <div className={`flex items-end gap-3 ${isLocal ? 'justify-end' : 'justify-start'}`}>
            {!isLocal && <img src={`https://i.pravatar.cc/40?u=${msg.sender}`} alt="avatar" className="w-9 h-9 rounded-full flex-shrink-0 self-start" />}
            <div className={`flex flex-col max-w-xs lg:max-w-sm ${isLocal ? 'items-end' : 'items-start'}`}>
                {/* --- 메시지 보낸 사람 닉네임 (수정됨) --- */}
                {/* 이제 내 메시지에도 닉네임이 표시됩니다. */}
                <p className="text-sm font-medium text-gray-400 mb-1.5 px-2">
                    {msg.sender}
                    <span className="text-xs text-gray-500 ml-2">{msg.time}</span>
                </p>

                {isTranslation ? (
                    <>
                        <div className={`rounded-2xl px-4 py-3 shadow-md ${isLocal ? 'bg-blue-600 text-white rounded-br-none' : 'bg-[#3A425A] text-gray-200 rounded-bl-none'}`}>
                            <p className="text-sm break-words whitespace-pre-wrap">{msg.originalText}</p>
                        </div>
                        <div
                            className={`rounded-2xl px-4 py-3 shadow-md mt-1.5 border ${
                                isLocal ? 'bg-transparent border-blue-400/50 text-gray-300 rounded-tr-none' : 'bg-[#282E40] border-gray-600/50 text-gray-300 rounded-tl-none'
                            }`}
                        >
                            <p className="text-sm break-words whitespace-pre-wrap">{msg.translatedText}</p>
                        </div>
                    </>
                ) : (
                    <div className={`rounded-2xl px-4 py-3 shadow-md ${isLocal ? 'bg-blue-600 text-white rounded-br-none' : 'bg-[#3A425A] text-gray-200 rounded-bl-none'}`}>
                        <p className="text-sm break-words whitespace-pre-wrap">{msg.text}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- Main Sidebar Component ---
const TranscriptSidebar = ({ documents: initialDocuments = [], onItemClick, onClose }) => {
    const [messages, setMessages] = useState([]);
    const [chatInput, setChatInput] = useState('');
    const [activeTab, setActiveTab] = useState('chat');

    const { localParticipant } = useLocalParticipant();
    const remoteParticipants = useRemoteParticipants();
    const { send: sendChat } = useDataChannel('chat_messages');

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
                console.error('Failed to parse message payload:', error);
            }
        }
    };

    useDataChannel('chat_messages', onMessage);
    useDataChannel('translation_data', onMessage);

    const chatEndRef = useRef(null);

    const documents =
        initialDocuments.length > 0
            ? initialDocuments
            : [
                  { id: 1, title: '삼겹살 레시피', fileType: 'PDF', fileSize: '2.4 MB' },
                  { id: 2, title: '회의록_20251020', fileType: 'DOCX', fileSize: '1.8 MB' },
                  { id: 3, title: '프로젝트 제안서', fileType: 'PDF', fileSize: '5.1 MB' },
                  { id: 4, title: '분기별 매출 보고서', fileType: 'XLSX', fileSize: '850 KB' },
              ];

    const allParticipants = [localParticipant, ...remoteParticipants].filter((p) => p);

    useEffect(() => {
        if (activeTab === 'chat') {
            chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, activeTab]);

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
            sender: getParticipantNickname(localParticipant), // 수정된 함수로 닉네임을 가져옵니다.
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

    const renderContent = () => {
        switch (activeTab) {
            case 'chat':
                return (
                    <div className="h-full flex flex-col">
                        <div className="flex-grow space-y-6 pr-1 overflow-y-auto">
                            {messages.map((msg, i) => (
                                <MessageBubble key={i} msg={msg} />
                            ))}
                            <div ref={chatEndRef} />
                        </div>
                    </div>
                );
            case 'participants':
                return (
                    <div className="space-y-2">
                        {allParticipants.map((p) => (
                            <div
                                key={p.sid}
                                className="flex items-center justify-between p-3 rounded-xl bg-[#3A425A]/60 border border-transparent hover:border-gray-600/80 transition-colors duration-200"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="relative">
                                        <img src={`https://i.pravatar.cc/44?u=${p.identity}`} alt="avatar" className="w-11 h-11 rounded-full" />
                                        {p.isSpeaking && <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-[#2C3349] animate-pulse"></div>}
                                    </div>
                                    {/* 수정된 함수로 닉네임을 가져옵니다. */}
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
                                <p>등록된 자료가 없습니다.</p>
                            </div>
                        ) : (
                            documents.map((doc) => <DocumentItem key={doc.id} {...doc} onDownload={onItemClick} />)
                        )}
                    </div>
                );
            case 'dictionary':
                return (
                    <div className="space-y-4">
                        {dictionaryData.map((item, index) => (
                            <div key={index} className="bg-[#3A425A]/80 p-4 rounded-lg border border-gray-700">
                                <div className="flex items-baseline">
                                    <h3 className="text-lg font-bold text-white">{item.term}</h3>
                                    <span className="ml-2 text-md text-gray-400">({item.pronunciation})</span>
                                </div>
                                <p className="mt-2 text-gray-300 text-sm">{item.definition}</p>
                            </div>
                        ))}
                    </div>
                );
            default:
                return null;
        }
    };

    const getTabClass = (tabName) =>
        `pb-2 px-1 text-sm font-semibold transition-colors duration-200 ${activeTab === tabName ? 'text-white border-b-2 border-pink-500' : 'text-gray-400 hover:text-white'}`;

    return (
        <div className="w-full h-full bg-[#2C3349] flex flex-col shadow-2xl rounded-r-2xl">
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
                <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                    <CloseIcon />
                </button>
            </div>

            <div className="flex-grow p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">{renderContent()}</div>

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
