import React, { useState, useEffect, useRef } from 'react';
import { useDataChannel }  from '@livekit/components-react';import { LanguageArrowIcon, SendIcon } from '../../icons/icons';
import DocumentItem from '../dashDoc/DocumentItem';
;

const TranscriptSidebar = ({documents = [],onItemClick }) => {
    const [translationMessages, setTranslationMessages] = useState([]);
    const [chatMessages, setChatMessages] = useState([]);
    const [chatInput, setChatInput] = useState('');
    const [activeTab, setActiveTab] = useState('translate');
    
    const { message, send } = useDataChannel('translation_data');
    const translationEndRef = useRef(null);
    const chatEndRef = useRef(null);

    // 수신 메시지 처리
    useEffect(() => {
        if (message) {
            try {
                const textDecoder = new TextDecoder();
                const msg = JSON.parse(textDecoder.decode(message.payload));
                if (msg.type === 'translation') {
                    setTranslationMessages(prev => [...prev, msg]);
                } else if (msg.type === 'chat') {
                    setChatMessages(prev => [...prev, msg]);
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
        if (!chatInput.trim() || !send) return;
        const newChatMessage = {
            type: 'chat',
            sender: 'Me', // 실제 앱에서는 사용자 이름으로 변경
            text: chatInput,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        const textEncoder = new TextEncoder();
        send(textEncoder.encode(JSON.stringify(newChatMessage)));
        setChatMessages(prev => [...prev, newChatMessage]); // 내 화면에 바로 표시
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
                                <div key={i} className={`flex items-end gap-2 ${msg.sender === 'Me' ? 'justify-end' : 'justify-start'}`}>
                                    {msg.sender !== 'Me' && <div className="w-7 h-7 bg-slate-200 rounded-full flex-shrink-0"></div>}
                                    <div>
                                        {msg.sender !== 'Me' && <p className="text-xs text-slate-500 mb-1 ml-2">{msg.sender}</p>}
                                        <div className={`rounded-2xl px-4 py-2 max-w-xs lg:max-w-sm ${msg.sender === 'Me' ? 'bg-blue-600 text-white rounded-br-lg' : 'bg-white text-slate-800 border border-slate-200 rounded-bl-lg'}`}>
                                            <p className="text-sm break-words">{msg.text}</p>
                                        </div>
                                        <p className={`text-xs mt-1 ${msg.sender === 'Me' ? 'text-slate-400 text-right mr-1' : 'text-slate-400 ml-1'}`}>{msg.time}</p>
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
