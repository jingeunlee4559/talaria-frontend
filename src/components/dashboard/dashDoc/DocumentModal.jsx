// src/components/DocumentModal.js
import { useRef, useState, useEffect } from 'react';
import { CopyIcon, CloseIcon, DownloadIcon, AIIcon, SearchIcon, ParticipantsIcon, DurationIcon, CalendarIcon } from '../../icons/icons'; // 아이콘 import

const DocumentModal = ({ isOpen, onClose, itemData }) => {
    if (!isOpen || !itemData) return null;

    const isDocument = itemData.itemType === 'document';
    const originalRef = useRef(null);
    const translatedRef = useRef(null);
    const [isSyncScroll, setIsSyncScroll] = useState(true);

    // 스크롤 동기화 로직 (번역 문서에만 사용)
    const handleScroll = (scrollingDiv, otherDiv) => {
        if (!isSyncScroll) return;
        const ratio = scrollingDiv.scrollTop / (scrollingDiv.scrollHeight - scrollingDiv.clientHeight);
        otherDiv.scrollTop = ratio * (otherDiv.scrollHeight - otherDiv.clientHeight);
    };

    const handleOriginalScroll = (e) => handleScroll(e.target, translatedRef.current);
    const handleTranslatedScroll = (e) => handleScroll(e.target, originalRef.current);

    const handleCopy = (content) => {
        if (!content) return;
        // navigator.clipboard.writeText는 iframe에서 제한될 수 있으므로 execCommand 사용
        const textarea = document.createElement('textarea');
        textarea.value = content;
        document.body.appendChild(textarea);
        textarea.select();
        try {
            document.execCommand('copy');
            // alert() 대신 console.log 사용
            console.log('클립보드에 복사되었습니다.');
        } catch (err) {
            console.error('복사 실패:', err);
        }
        document.body.removeChild(textarea);
    };

    // Esc 키를 눌러 모달 닫기
    useEffect(() => {
        const handleEscape = (event) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        if (isOpen) {
            window.addEventListener('keydown', handleEscape);
        }
        return () => {
            window.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen, onClose]);

    // 회의록 내용 렌더링 함수
    const renderMeetingMinutes = (minutes) => {
        return (
            <div className="flex flex-col flex-grow overflow-y-auto">
                {/* 1. 상단 정보 */}
                <div className="p-4 flex items-center text-sm text-slate-600 border-b border-slate-100 bg-white sticky top-0 z-10">
                    <span className="font-medium mr-4 flex items-center">
                        <CalendarIcon />
                        {minutes.date}
                    </span>
                    <span className="font-medium mr-4 flex items-center">
                        <DurationIcon />
                        {minutes.duration}
                    </span>
                    <span className="font-medium flex items-center">
                        <ParticipantsIcon />
                        {minutes.participants}명
                    </span>
                </div>

                {/* 2. 영상 재생 영역 (플레이스홀더) */}
                {/* <div className="relative w-full h-48 bg-slate-900 flex items-center justify-center flex-shrink-0">
                    <div className="absolute top-3 left-3 px-3 py-1 bg-black bg-opacity-50 text-white text-xs rounded-full">실제 녹화 영상</div>
                    <div className="absolute bottom-3 left-3 text-white text-xs">00:00</div>
                    <div className="absolute bottom-3 right-3 text-white text-xs">25:00 / {minutes.duration}</div>
                    <div className="w-full px-12 absolute bottom-2">
                         <div className="h-1 bg-slate-700 rounded-full">
                            <div className="w-1/4 h-full bg-blue-500 rounded-full"></div>
                        </div>
                    </div>
                    <button className="p-4 bg-blue-600 bg-opacity-70 rounded-full hover:bg-opacity-90 transition">
                        <PlayIcon />
                    </button>
                </div> */}

                {/* 3. AI 요약, 주제, 대화 기록을 담는 컨테이너 (스크롤 가능) */}
                <div className="p-6 flex flex-col flex-grow bg-white overflow-y-auto space-y-8">
                    {/* 3-A. AI 요약 */}
                    <div className="rounded-xl p-5 border border-yellow-200 bg-yellow-50">
                        <h3 className="text-xl font-bold flex items-center text-slate-800 mb-3">
                            <AIIcon /> AI 회의 요약
                        </h3>

                        {/* 결정 사항 */}
                        <div className="mb-4">
                            <h4 className="font-bold text-base text-slate-700 mb-2 border-b border-slate-200 pb-1">결정 사항</h4>
                            <ul className="list-disc ml-5 text-slate-700 space-y-1 text-sm">
                                {minutes.aiSummary.decisions.map((d, i) => (
                                    <li key={i}>{d}</li>
                                ))}
                            </ul>
                        </div>

                        {/* Action Items */}
                        <div>
                            <h4 className="font-bold text-base text-slate-700 mb-2 border-b border-slate-200 pb-1">Action Items</h4>
                            <ul className="text-slate-700 space-y-1 text-sm">
                                {minutes.aiSummary.actionItems.map((a, i) => (
                                    <li key={i} className="flex justify-between items-start">
                                        <span className="font-medium text-slate-800 mr-2 flex-shrink-0">{a.owner}:</span>
                                        <span className="flex-grow">{a.task}</span>
                                        <span className="text-red-500 ml-2 flex-shrink-0">({a.deadline})</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* 3-B. 주요 주제 */}
                    <div>
                        <h3 className="text-lg font-bold text-slate-800 mb-3">주요 주제</h3>
                        <div className="flex flex-wrap gap-2">
                            {minutes.topics.map((topic, i) => (
                                <span key={i} className="px-3 py-1 bg-purple-100 text-purple-700 text-sm font-medium rounded-full hover:bg-purple-200 cursor-pointer transition">
                                    {topic}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* 3-C. 대화 기록 */}
                    <div>
                        <h3 className="text-lg font-bold text-slate-800 mb-4 border-t pt-4 border-slate-100">대화 기록</h3>
                        <div className="relative mb-4">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <SearchIcon className="text-slate-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="스크립트 내 검색..."
                                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition shadow-sm bg-slate-50"
                            />
                        </div>

                        {/* 실제 대화 목록 */}
                        <div className="space-y-4">
                            {minutes.transcript.map((t, i) => (
                                <div key={i} className="flex items-start p-3 bg-white rounded-lg hover:bg-slate-50 transition border border-slate-100">
                                    <div
                                        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white mr-3 
                                        ${t.speaker === '김' ? 'bg-green-500' : t.speaker === 'J' ? 'bg-blue-500' : t.speaker === '田' ? 'bg-red-500' : 'bg-gray-500'}`}
                                    >
                                        {t.speaker}
                                    </div>
                                    <div className="flex-grow">
                                        <div className="flex items-center mb-1">
                                            <span className="font-bold text-slate-800 mr-2">
                                                {/* 화자 이름 표시 로직 */}
                                                {t.speaker === 'J' ? 'John Smith' : t.speaker === '田' ? '田中太郎' : t.speaker === '김' ? '김철수' : '기타'}
                                            </span>
                                            <span className="text-xs text-blue-600 font-medium cursor-pointer hover:underline" onClick={() => console.log(`Seek to ${t.timestamp}`)}>
                                                {t.timestamp}
                                            </span>
                                        </div>
                                        <p className="text-sm text-slate-700 leading-relaxed">{t.text}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4" onClick={onClose}>
            <div
                className="bg-white rounded-xl shadow-2xl w-full h-full max-w-7xl max-h-[90vh] flex flex-col transform transition-all duration-300 scale-100 opacity-100 overflow-hidden"
                onClick={(e) => e.stopPropagation()} // 모달 배경 클릭 방지
            >
                {/* 모달 헤더 */}
                <header className="flex justify-between items-center p-4 border-b border-slate-100 bg-white sticky top-0 z-10 flex-shrink-0">
                    <div className="flex items-center space-x-3">
                        <h2 className="text-xl font-bold text-slate-800 truncate">{itemData.title}</h2>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full text-slate-500 hover:bg-slate-100 transition">
                        <CloseIcon />
                    </button>
                </header>

                {/* 모달 본문 - 액션 및 내용 */}
                <div className="flex flex-col flex-grow overflow-hidden">
                    {/* 액션 바 */}
                    <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50 flex-shrink-0">
                        <div className="flex space-x-3">
                            {isDocument ? (
                                <>
                                    <button
                                        onClick={() => handleCopy(itemData.originalContent)}
                                        className="flex items-center bg-white border border-slate-300 text-slate-700 font-medium px-3 py-2 rounded-lg text-sm hover:bg-slate-100 transition shadow-sm"
                                    >
                                        <CopyIcon /> 원본 복사
                                    </button>
                                    <button
                                        onClick={() => handleCopy(itemData.translatedContent)}
                                        className="flex items-center bg-blue-600 text-white font-medium px-3 py-2 rounded-lg text-sm hover:bg-blue-700 transition shadow-md"
                                    >
                                        <CopyIcon /> 번역본 복사
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button
                                        onClick={() => handleCopy(itemData.minutesText)} // minutesText에 전체 요약 및 내용을 복사
                                        className="flex items-center bg-white border border-slate-300 text-slate-700 font-medium px-3 py-2 rounded-lg text-sm hover:bg-slate-100 transition shadow-sm"
                                    >
                                        <CopyIcon /> 회의록 복사
                                    </button>
                                    <button className="flex items-center bg-blue-600 text-white font-medium px-3 py-2 rounded-lg text-sm hover:bg-blue-700 transition shadow-md">
                                        <DownloadIcon /> 전체 회의록 다운로드
                                    </button>
                                </>
                            )}
                        </div>
                        {isDocument && (
                            <div className="flex items-center">
                                <span className="text-sm text-slate-600 mr-2">스크롤 동기화</span>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" className="sr-only peer" checked={isSyncScroll} onChange={() => setIsSyncScroll(!isSyncScroll)} />
                                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                </label>
                            </div>
                        )}
                    </div>

                    {/* 내용 영역: 번역 문서 (좌우 분할) 또는 회의록 (단일 상세 뷰) */}
                    {isDocument ? (
                        <div className="flex flex-grow divide-x divide-slate-200 overflow-hidden">
                            {/* 원본 (좌) */}
                            <div className="flex flex-col w-1/2 overflow-hidden">
                                <h3 className="text-lg font-bold text-slate-700 p-4 border-b border-slate-100 bg-white">원본 ({itemData.fromLang})</h3>
                                <div
                                    ref={originalRef}
                                    onScroll={handleOriginalScroll}
                                    className="p-5 text-slate-800 text-base leading-relaxed whitespace-pre-wrap overflow-y-auto flex-grow bg-white font-inter"
                                >
                                    <h4 className="font-bold text-xl mb-3">{itemData.title}</h4>
                                    {itemData.originalContent}
                                </div>
                            </div>
                            {/* 번역본 (우) */}
                            <div className="flex flex-col w-1/2 overflow-hidden">
                                <h3 className="text-lg font-bold text-slate-700 p-4 border-b border-slate-100 bg-slate-50">번역본 ({itemData.toLang})</h3>
                                <div
                                    ref={translatedRef}
                                    onScroll={handleTranslatedScroll}
                                    className="p-5 text-slate-800 text-base leading-relaxed whitespace-pre-wrap overflow-y-auto flex-grow bg-slate-50 font-inter"
                                >
                                    <h4 className="font-bold text-xl mb-3">{itemData.title}</h4>
                                    {itemData.translatedContent}
                                </div>
                            </div>
                        </div>
                    ) : (
                        // 회의록 상세 뷰
                        renderMeetingMinutes(itemData)
                    )}
                </div>

                {/* 푸터 (문서 정보) - 회의록은 이미 상단에 정보가 많아 간소화 */}
                <footer className="p-3 text-sm text-slate-500 border-t border-slate-100 bg-slate-50 flex-shrink-0">
                    <div className="flex justify-between items-center px-2">
                        <span>
                            {itemData.date} | {isDocument ? `${itemData.fromLang} → ${itemData.toLang}` : `회의록 ID: ${itemData.id}`}
                        </span>
                        {isDocument && <span>총 {itemData.originalContent?.split(/\s+/).length || 0} 단어</span>}
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default DocumentModal;
