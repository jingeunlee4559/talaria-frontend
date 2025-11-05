// src/components/DocumentModal.js
import { useRef, useState, useEffect } from 'react';
import { CopyIcon, CloseIcon, DownloadIcon, AIIcon, SearchIcon, ParticipantsIcon, DurationIcon, CalendarIcon } from '../../icons/icons'; // 아이콘 import

// 1. [디자인 대폭 개선] 문서 번역 뷰
const DocumentView = ({ itemData, isSyncScroll }) => {
    const originalRef = useRef(null);
    const translatedRef = useRef(null);

    const handleScroll = (scrollingDiv, otherDiv) => {
        if (!isSyncScroll || !scrollingDiv || !otherDiv) return;
        const scrollHeight = scrollingDiv.scrollHeight - scrollingDiv.clientHeight;
        if (scrollHeight === 0) return;
        const ratio = scrollingDiv.scrollTop / scrollHeight;
        otherDiv.scrollTop = ratio * (otherDiv.scrollHeight - otherDiv.clientHeight);
    };

    const handleOriginalScroll = (e) => handleScroll(e.target, translatedRef.current);
    const handleTranslatedScroll = (e) => handleScroll(e.target, originalRef.current);

    return (
        // [개선] divide-x 제거, 각 패널이 고유한 배경색을 갖도록 함
        <div className="flex flex-grow overflow-hidden">
            {/* 원본 (좌) - [개선] 연한 회색 배경(bg-gray-50/100)으로 구분 */}
            <div className="flex flex-col w-1/2 overflow-hidden bg-gray-50">
                <h3 className="text-lg font-semibold text-slate-900 p-5 border-b border-slate-200 bg-gray-100 sticky top-0 z-10 flex-shrink-0">원본 ({itemData.fromLang})</h3>
                <div
                    ref={originalRef}
                    onScroll={handleOriginalScroll}
                    className="p-8 text-slate-800 text-base leading-relaxed whitespace-pre-wrap overflow-y-auto flex-grow font-inter 
                               scrollbar-thin scrollbar-thumb-slate-400 scrollbar-track-gray-100"
                >
                    {itemData.originalContent}
                </div>
            </div>
            {/* 번역본 (우) - [개선] 흰색 배경(bg-white)으로 구분 */}
            <div className="flex flex-col w-1/2 overflow-hidden bg-white border-l border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900 p-5 border-b border-slate-200 bg-white sticky top-0 z-10 flex-shrink-0">번역본 ({itemData.toLang})</h3>
                <div
                    ref={translatedRef}
                    onScroll={handleTranslatedScroll}
                    className="p-8 text-slate-800 text-base leading-relaxed whitespace-pre-wrap overflow-y-auto flex-grow font-inter
                               scrollbar-thin scrollbar-thumb-slate-400 scrollbar-track-transparent"
                >
                    {itemData.translatedContent}
                </div>
            </div>
        </div>
    );
};

// 2. [디자인 개선] 회의록 뷰
const MinutesView = ({ minutes }) => {
    return (
        // [개선] 전체 배경을 연한 회색(bg-gray-50)으로 변경하여 카드들이 돋보이게 함
        <div className="flex flex-col flex-grow overflow-y-auto bg-gray-50 scrollbar-thin scrollbar-thumb-slate-400 scrollbar-track-gray-100">
            {/* 2-1. 상단 정보 (Sticky) */}
            <div className="p-4 flex items-center text-sm text-slate-600 border-b border-slate-200 bg-white sticky top-0 z-10">
                <span className="font-medium mr-5 flex items-center gap-1.5">
                    <CalendarIcon className="w-4 h-4" />
                    {minutes.date}
                </span>
                <span className="font-medium mr-5 flex items-center gap-1.5">
                    <DurationIcon className="w-4 h-4" />
                    {minutes.duration}
                </span>
                <span className="font-medium flex items-center gap-1.5">
                    <ParticipantsIcon className="w-4 h-4" />
                    {minutes.participants}명
                </span>
            </div>

            {/* 2-2. 컨텐츠 영역 - [개선] 패딩을 p-8로 늘려 여유 공간 확보 */}
            <div className="p-8 grid grid-cols-1 gap-6">
                {/* 2-2A. AI 요약 - [개선] 그라데이션 배경 */}
                <div className="rounded-xl p-5 border border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 shadow-sm">
                    <h3 className="text-xl font-bold flex items-center text-blue-900 mb-4 gap-2">
                        <AIIcon className="w-5 h-5" /> AI 회의 요약
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                        <div>
                            <h4 className="font-semibold text-base text-slate-800 mb-2 pb-1">결정 사항</h4>
                            <ul className="list-disc pl-5 text-slate-700 space-y-1.5 text-sm">
                                {minutes.aiSummary.decisions.map((d, i) => (
                                    <li key={i}>{d}</li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold text-base text-slate-800 mb-2 pb-1">Action Items</h4>
                            <ul className="text-slate-700 space-y-2 text-sm">
                                {minutes.aiSummary.actionItems.map((a, i) => (
                                    <li key={i} className="flex items-start">
                                        <span className="font-medium text-slate-900 mr-2 flex-shrink-0 w-[80px] truncate">{a.owner}:</span>
                                        <span className="flex-grow text-slate-700">{a.task}</span>
                                        <span className="text-red-600 ml-2 flex-shrink-0 text-xs font-medium mt-0.5">({a.deadline})</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                {/* 2-2B. 주요 주제 - [개선] 태그 호버 효과 */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-semibold text-slate-900 mb-3">주요 주제</h3>
                    <div className="flex flex-wrap gap-2">
                        {minutes.topics.map((topic, i) => (
                            <span
                                key={i}
                                className="px-3 py-1 bg-indigo-100 text-indigo-800 text-sm font-medium rounded-full cursor-pointer transition-all duration-200 hover:bg-indigo-200 hover:shadow-md transform"
                            >
                                {topic}
                            </span>
                        ))}
                    </div>
                </div>

                {/* 2-2C. 대화 기록 - [개선] 타임스탬프 호버 효과, 아이템 구분선 */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">대화 기록</h3>
                    <div className="relative mb-4">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <SearchIcon className="text-slate-400 w-5 h-5" />
                        </div>
                        <input
                            type="text"
                            placeholder="스크립트 내 검색..."
                            className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition shadow-sm bg-white focus:bg-white"
                        />
                    </div>

                    <div className="border-t border-slate-100">
                        {minutes.transcript.map((t, i) => (
                            <div key={i} className="group flex items-start p-3 transition-colors hover:bg-slate-100/70 border-b border-slate-100 last:border-b-0">
                                <div
                                    className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white mr-3 mt-0.5 
                                    ${t.speaker === '김' ? 'bg-green-500' : t.speaker === 'J' ? 'bg-blue-500' : t.speaker === '田' ? 'bg-red-500' : 'bg-gray-500'}`}
                                >
                                    {t.speaker}
                                </div>
                                <div className="flex-grow">
                                    <div className="flex items-center mb-1">
                                        <span className="font-bold text-slate-800 mr-2">
                                            {t.speaker === 'J' ? 'John Smith' : t.speaker === '田' ? '田中太郎' : t.speaker === '김' ? '김철수' : '기타'}
                                        </span>
                                        {/* [개선] 마우스를 올리면 타임스탬프가 나타남 */}
                                        <span
                                            className="text-xs text-blue-600 font-medium cursor-pointer hover:underline md:opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                            onClick={() => console.log(`Seek to ${t.timestamp}`)}
                                        >
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

// 3. 메인 모달 컴포넌트 (Shell)
const DocumentModal = ({ isOpen, onClose, itemData }) => {
    const [isSyncScroll, setIsSyncScroll] = useState(true);

    const handleCopy = (content) => {
        if (!content) return;
        navigator.clipboard
            .writeText(content)
            .then(() => {
                console.log('클립보드에 복사되었습니다.');
            })
            .catch((err) => {
                console.error('복사 실패:', err);
                try {
                    const textarea = document.createElement('textarea');
                    textarea.value = content;
                    textarea.style.position = 'fixed';
                    textarea.style.opacity = '0';
                    document.body.appendChild(textarea);
                    textarea.select();
                    document.execCommand('copy');
                    document.body.removeChild(textarea);
                    console.log('클립보드에 복사되었습니다. (폴백)');
                } catch (fallbackErr) {
                    console.error('폴백 복사 실패:', fallbackErr);
                }
            });
    };

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

    if (!isOpen || !itemData) return null;

    const isDocument = itemData.itemType === 'document';

    const getMinutesAsText = (minutes) => {
        if (!minutes) return '';
        const summary = `AI 요약:\n결정사항:\n${minutes.aiSummary.decisions.join('\n- ')}\n\nAction Items:\n${minutes.aiSummary.actionItems
            .map((a) => `- ${a.owner}: ${a.task} (${a.deadline})`)
            .join('\n')}`;
        const transcript = `\n\n대화 기록:\n${minutes.transcript.map((t) => `[${t.timestamp}] ${t.speaker}: ${t.text}`).join('\n')}`;
        return `${summary}\n${transcript}`;
    };

    return (
        // [수정] 모달 배경을 검정색이 아닌, '프로스티드 글래스' 효과로 변경
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/30 backdrop-blur-md" onClick={onClose}>
            <div
                // [개선] 모달 컨텐츠의 기본 배경을 흰색으로 지정
                className="bg-white rounded-xl shadow-2xl w-full h-full max-w-7xl max-h-[90vh] flex flex-col transform transition-all duration-300 opacity-100 overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* 모달 헤더 */}
                <header className="flex justify-between items-center p-4 border-b border-slate-200 bg-white flex-shrink-0">
                    <h2 className="text-xl font-bold text-slate-900 truncate">{itemData.title}</h2>
                    <button onClick={onClose} className="p-2 rounded-full text-slate-500 hover:bg-slate-100 transition-colors">
                        <CloseIcon />
                    </button>
                </header>

                {/* 모달 본문 - 액션 및 내용 */}
                <div className="flex flex-col flex-grow overflow-hidden">
                    {/* 액션 바 */}
                    <div className="flex items-center justify-between p-3 border-b border-slate-200 bg-slate-50 flex-shrink-0">
                        <div className="flex space-x-2">
                            {isDocument ? (
                                <>
                                    <button
                                        onClick={() => handleCopy(itemData.originalContent)}
                                        className="flex items-center gap-1.5 bg-white border border-slate-300 text-slate-700 font-medium px-3 py-2 rounded-lg text-sm hover:bg-slate-50 hover:border-slate-400 transition shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                                    >
                                        <CopyIcon /> 원본 복사
                                    </button>
                                    <button
                                        onClick={() => handleCopy(itemData.translatedContent)}
                                        className="flex items-center gap-1.5 bg-blue-600 text-white font-medium px-3 py-2 rounded-lg text-sm hover:bg-blue-700 transition-shadow shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 hover:scale-105 transform transition-transform duration-200"
                                    >
                                        <CopyIcon /> 번역본 복사
                                    </button>
                                    {/* <D button> 오타 수정 */}
                                </>
                            ) : (
                                <>
                                    <button
                                        onClick={() => handleCopy(getMinutesAsText(itemData))}
                                        className="flex items-center gap-1.5 bg-white border border-slate-300 text-slate-700 font-medium px-3 py-2 rounded-lg text-sm hover:bg-slate-50 hover:border-slate-400 transition shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                                    >
                                        <CopyIcon /> 회의록 복사
                                    </button>
                                    <button className="flex items-center gap-1.5 bg-blue-600 text-white font-medium px-3 py-2 rounded-lg text-sm hover:bg-blue-700 transition-shadow shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 hover:scale-105 transform transition-transform duration-200">
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
                                    <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-blue-600"></div>
                                </label>
                            </div>
                        )}
                    </div>

                    {/* 내용 영역 */}
                    {isDocument ? <DocumentView itemData={itemData} isSyncScroll={isSyncScroll} /> : <MinutesView minutes={itemData} />}
                </div>

                {/* 푸터 (문서 정보) */}
                <footer className="p-3 text-sm text-slate-500 border-t border-slate-200 bg-slate-50 flex-shrink-0">
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
