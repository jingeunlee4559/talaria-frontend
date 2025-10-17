import React, { useState, useEffect, useRef } from 'react';
import { useDataChannel, useLocalParticipant } from '@livekit/components-react';
import { LanguageArrowIcon, SendIcon } from '../../icons/icons';
import DocumentItem from '../dashDoc/DocumentItem';

// 👇 1. 참가자의 닉네임을 안전하게 가져오는 헬퍼 함수를 추가합니다.
// 이 함수는 컴포넌트 외부에 있어도 되고, 내부에 있어도 됩니다.
const getParticipantNickname = (participant) => {
  // 참가자 정보가 없는 경우를 대비합니다.
  if (!participant) return 'Unknown'; 
  
  try {
    // metadata는 문자열이므로 JSON 객체로 파싱합니다.
    const metadata = JSON.parse(participant.metadata);
    // metadata에 nickname이 있으면 그것을, 없으면 원래의 identity를 반환합니다.
    // Lobby에서 username을 사용했으므로, metadata.username을 확인합니다.
    return metadata?.username || participant.identity;
  } catch (error) {
    // metadata가 없거나 JSON 형식이 아닐 경우, identity를 기본값으로 사용합니다.
    return participant.identity;
  }
};


const TranscriptSidebar = ({ documents = [], onItemClick }) => {
    const [translationMessages, setTranslationMessages] = useState([]);
    const [chatMessages, setChatMessages] = useState([]);
    const [chatInput, setChatInput] = useState('');
    const [activeTab, setActiveTab] = useState('translate');
    
    const { message, send } = useDataChannel('translation_data');
    const { localParticipant } = useLocalParticipant(); 
    const translationEndRef = useRef(null);
    const chatEndRef = useRef(null);

   // 수신 메시지 처리
    useEffect(() => {
        if (message && message.from) {
            if (message.from.isLocal) {
                return; 
            }
            try {
                const textDecoder = new TextDecoder();
                const msgData = JSON.parse(textDecoder.decode(message.payload));
                
                const fullMessage = {
                    ...msgData,
                    // 👇 2. 발신자 이름 대신 '닉네임'을 가져오도록 수정합니다.
                    sender: getParticipantNickname(message.from), 
                    isLocal: false,
                };

                if (fullMessage.type === 'translation') {
                    setTranslationMessages(prev => [...prev, fullMessage]);
                } else if (fullMessage.type === 'chat') {
                    setChatMessages(prev => [...prev, fullMessage]);
                }
            } catch (error) {
                console.error("Failed to parse message payload:", error);
            }
        }
    }, [message]);

    // 자동 스크롤
    useEffect(() => {
        if (activeTab === 'translate') translationEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [translationMessages, activeTab]);
    useEffect(() => {
        if (activeTab === 'chat') chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatMessages, activeTab]);

    // 채팅 메시지 전송
    const handleSendMessage = () => {
        if (!chatInput.trim() || !send || !localParticipant) return;
        
        const messagePayload = {
            type: 'chat',
            text: chatInput,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        const textEncoder = new TextEncoder();
        send(textEncoder.encode(JSON.stringify(messagePayload)));
        
        const newChatMessage = {
            ...messagePayload,
            // 👇 3. 내 화면에 표시할 이름도 '닉네임'을 사용하도록 수정합니다.
            sender: getParticipantNickname(localParticipant),
            isLocal: true,
        };

        setChatMessages(prev => [...prev, newChatMessage]);
        setChatInput('');
    };
    
    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };
    
    const getSpeakerColor = (speakerName = '') => {
        const colors = ['bg-amber-100 text-amber-800', 'bg-sky-100 text-sky-800', 'bg-lime-100 text-lime-800'];
        const hash = speakerName.split('').reduce((acc, char) => char.charCodeAt(0) + ((acc << 5) - acc), 0);
        return colors[Math.abs(hash) % colors.length];
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'translate':
                return (
                    <>
                        {translationMessages.map((msg, i) => (
                            <div key={i} className="mb-3">
                                <div className="rounded-lg border border-slate-200 bg-white p-3.5 shadow-sm">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${getSpeakerColor(msg.speakerName)}`}>{msg.speakerName}</span>
                                        <div className="flex items-center text-xs font-medium text-slate-500">
                                            <span>{msg.langFrom}</span><LanguageArrowIcon /><span>{msg.langTo}</span>
                                        </div>
                                    </div>
                                    <p className="text-sm text-slate-700">{msg.originalText}</p>
                                    <p className="text-sm font-medium text-blue-600 mt-1">{msg.translatedText}</p>
                                    <p className="text-right text-xs text-slate-400 mt-2">{msg.time}</p>
                                </div>
                            </div>
                        ))}
                        <div ref={translationEndRef} />
                    </>
                );
            case 'transcript':
                return (
                    <div className="flex-grow p-4 overflow-visible scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
                        {documents.length === 0 ? (
                            <p className="text-center text-slate-500 py-12">등록된 문서가 없습니다.</p>
                        ) : (
                            <div className="space-y-3 relative">
                                {documents.map(doc => (
                                    <DocumentItem
                                        key={doc.id}
                                        {...doc}
                                        onClick={onItemClick}
                                        className="hover:shadow-lg transition-shadow cursor-pointer"
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                );
            case 'chat':
                return (
                    <div className="h-full flex flex-col">
                        <div className="flex-grow space-y-4 pr-1">
                            {chatMessages.map((msg, i) => (
                                // 👇 4. 렌더링 로직은 변경할 필요 없습니다.
                                // msg.sender에 이미 닉네임이 담겨 있기 때문입니다.
                                <div key={i} className={`flex items-end gap-2 ${msg.isLocal ? 'justify-end' : 'justify-start'}`}>
                                    {!msg.isLocal && <div className="w-7 h-7 bg-slate-200 rounded-full flex-shrink-0"></div>}
                                    <div>
                                        {!msg.isLocal && <p className="text-xs text-slate-500 mb-1 ml-2">{msg.sender}</p>}
                                        <div className={`rounded-2xl px-4 py-2 max-w-xs lg:max-w-sm ${msg.isLocal ? 'bg-blue-600 text-white rounded-br-lg' : 'bg-white text-slate-800 border border-slate-200 rounded-bl-lg'}`}>
                                            <p className="text-sm break-words">{msg.text}</p>
                                        </div>
                                        <p className={`text-xs mt-1 ${msg.isLocal ? 'text-slate-400 text-right mr-1' : 'text-slate-400 ml-1'}`}>{msg.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div ref={chatEndRef} />
                    </div>
                );
            default: return null;
        }
    };

    const getTabClass = (tabName) => activeTab === tabName
        ? "px-3 py-2 text-sm font-semibold text-blue-600 border-b-2 border-blue-600"
        : "px-3 py-2 text-sm font-medium text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-md";

    return (
        <div className="w-full h-full bg-slate-50 border-l border-slate-200 flex flex-col">
            <div className="flex-shrink-0 flex space-x-2 p-2 border-b border-slate-200 bg-white/80 backdrop-blur-sm">
                <button onClick={() => setActiveTab('translate')} className={getTabClass('translate')}>번역</button>
                <button onClick={() => setActiveTab('transcript')} className={getTabClass('transcript')}>파일 목록</button>
                <button onClick={() => setActiveTab('chat')} className={getTabClass('chat')}>채팅</button>
            </div>
            <div className="flex-grow p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
                {renderContent()}
            </div>
            {activeTab === 'chat' && (
                <div className="flex-shrink-0 p-3 border-t border-slate-200 bg-white">
                    <div className="flex items-center space-x-2">
                        <input type="text" className="w-full bg-slate-100 border-transparent rounded-lg px-4 py-2 text-sm text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="메시지를 입력하세요..." value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyPress={handleKeyPress} />
                        <button onClick={handleSendMessage} className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:bg-blue-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                            disabled={!chatInput.trim()}>
                            <SendIcon />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TranscriptSidebar;
