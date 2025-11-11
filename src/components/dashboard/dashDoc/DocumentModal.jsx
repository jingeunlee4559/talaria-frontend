import { useRef, useState, useEffect } from 'react';
import api from '../../../axios';
import { CopyIcon, CloseIcon, DownloadIcon, AIIcon, SearchIcon, ParticipantsIcon, DurationIcon, CalendarIcon } from '../../icons/icons';
import Swal from 'sweetalert2';
import { LanguagesIcon } from 'lucide-react';

// 언어 맵
const languageMap = { ko: '한국어', en: '영어', ja: '일본어', ch: '중국어' };
const getLanguageName = (code) => languageMap[code] || code;

// Toast 알림
const toast = (title, icon = 'success') => {
    Swal.fire({
        toast: true,
        position: 'top-end',
        icon,
        title,
        showConfirmButton: false,
        timer: 1400,
        timerProgressBar: true,
    });
};

// 1. 문서 번역 뷰
const DocumentView = ({ userId, docId, originalContent, translatedContent, hasTranslation, isSyncScroll, onTranslate, fromLang, toLang }) => {
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
        <div className="flex flex-grow overflow-hidden">
            {/* 원본 (좌) */}
            <div className="flex flex-col w-1/2 overflow-hidden bg-gray-50">
                <h3 className="text-lg font-semibold text-slate-900 p-5 border-b border-slate-200 bg-gray-100 sticky top-0 z-10 flex-shrink-0">원본 ({getLanguageName(fromLang)})</h3>
                <div
                    ref={originalRef}
                    onScroll={handleOriginalScroll}
                    className="p-8 text-slate-800 text-base leading-relaxed whitespace-pre-wrap overflow-y-auto flex-grow font-inter 
                               scrollbar-thin scrollbar-thumb-slate-400 scrollbar-track-gray-100"
                >
                    {originalContent || '내용을 불러오는 중...'}
                </div>
            </div>

            {/* 번역본 (우) */}
            <div className="flex flex-col w-1/2 overflow-hidden bg-white border-l border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900 p-5 border-b border-slate-200 bg-white sticky top-0 z-10 flex-shrink-0">
                    번역본 ({toLang ? getLanguageName(toLang) : '번역 필요'})
                </h3>
                <div
                    ref={translatedRef}
                    onScroll={handleTranslatedScroll}
                    className="p-8 text-slate-800 text-base leading-relaxed whitespace-pre-wrap overflow-y-auto flex-grow font-inter
                               scrollbar-thin scrollbar-thumb-slate-400 scrollbar-track-transparent"
                >
                    {hasTranslation ? (
                        translatedContent
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                            <div className="mb-6">
                                <LanguagesIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                                <p className="text-slate-500 text-lg mb-2">아직 번역된 내용이 없습니다</p>
                                <p className="text-slate-400 text-sm">상단의 번역 버튼을 눌러 번역을 시작하세요</p>
                            </div>
                            {onTranslate && (
                                <button
                                    onClick={onTranslate}
                                    className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium px-6 py-3 rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                                >
                                    <LanguagesIcon className="w-5 h-5" />
                                    번역 시작하기
                                </button>
                            )}
                        </div>
                    )}
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

// 3. 메인 모달 컴포넌트
const DocumentModal = ({ isOpen, onClose, itemData }) => {
    const [isSyncScroll, setIsSyncScroll] = useState(true);
    const [documentContent, setDocumentContent] = useState(null);
    const [loading, setLoading] = useState(false);
    const [translating, setTranslating] = useState(false);

    // 파일 내용 불러오기
    useEffect(() => {
        if (!isOpen || !itemData || itemData.itemType !== 'document') {
            setDocumentContent(null);
            return;
        }

        const fetchContent = async () => {
            setLoading(true);
            try {
                const response = await api.get(`/api/users/${itemData.userId || 1}/documents/${itemData.id}/content`);
                setDocumentContent(response.data);
            } catch (error) {
                console.error('파일 내용 로드 실패:', error);

                if (error.response?.status === 400) {
                    toast(error.response?.data?.error || '지원하지 않는 파일 형식입니다', 'warning');
                } else {
                    toast('파일 내용을 불러오는데 실패했습니다', 'error');
                }

                setDocumentContent({
                    original_content: '파일 내용을 불러올 수 없습니다.\n\n' + (error.response?.data?.error || '지원하지 않는 파일 형식이거나 파일이 손상되었을 수 있습니다.'),
                    has_translation: false,
                    translated_content: '',
                });
            } finally {
                setLoading(false);
            }
        };

        fetchContent();
    }, [isOpen, itemData]);

    // 번역 시작
    const handleTranslate = async (targetLang) => {
        if (translating) return;

        const result = await Swal.fire({
            title: `${getLanguageName(targetLang)}로 번역하시겠습니까?`,
            html: `<div style="text-align: left; font-size: 14px; color: #64748b; line-height: 1.6;">
                    <p style="margin-bottom: 8px;">• 문서 전체를 ${getLanguageName(targetLang)}로 번역합니다.</p>
                    <p style="margin-bottom: 8px;">• 번역에는 시간이 소요될 수 있습니다.</p>
                    <p style="margin-bottom: 0;">• 번역 후 결과를 확인하고 다운로드할 수 있습니다.</p>
                   </div>`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#4f46e5',
            cancelButtonColor: '#94a3b8',
            confirmButtonText: '네, 번역할게요',
            cancelButtonText: '취소',
        });

        if (!result.isConfirmed) return;

        setTranslating(true);
        toast('번역을 시작합니다...', 'info');

        try {
            // TODO: 실제 번역 API 엔드포인트 호출
            // const response = await axios.post(
            //     `/api/users/${itemData.userId}/documents/${itemData.id}/translate`,
            //     { target_lang: targetLang }
            // );

            // 임시: 2초 대기 후 원본 내용을 번역본으로 표시
            await new Promise((resolve) => setTimeout(resolve, 2000));

            setDocumentContent((prev) => ({
                ...prev,
                has_translation: true,
                translated_content: `[${getLanguageName(targetLang)} 번역]\n\n` + prev.original_content,
                translated_lang: targetLang,
            }));

            toast('번역이 완료되었습니다!', 'success');
        } catch (error) {
            console.error('번역 실패:', error);
            toast('번역 중 오류가 발생했습니다', 'error');
        } finally {
            setTranslating(false);
        }
    };

    const handleCopy = (content) => {
        if (!content) return;
        navigator.clipboard
            .writeText(content)
            .then(() => {
                toast('클립보드에 복사되었습니다');
            })
            .catch((err) => {
                console.error('복사 실패:', err);
                toast('복사에 실패했습니다', 'error');
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

    // 번역 가능한 언어 목록 (현재 언어 제외)
    const availableTargetLangs = Object.keys(languageMap).filter((lang) => lang !== (itemData.fromLang || documentContent?.original_lang));

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/30 backdrop-blur-md" onClick={onClose}>
            <div
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

                {/* 모달 본문 */}
                <div className="flex flex-col flex-grow overflow-hidden">
                    {/* 액션 바 */}
                    <div className="flex items-center justify-between p-3 border-b border-slate-200 bg-slate-50 flex-shrink-0">
                        <div className="flex space-x-2">
                            {isDocument ? (
                                <>
                                    <button
                                        onClick={() => handleCopy(documentContent?.original_content)}
                                        disabled={!documentContent?.original_content}
                                        className="flex items-center gap-1.5 bg-white border border-slate-300 text-slate-700 font-medium px-3 py-2 rounded-lg text-sm hover:bg-slate-50 hover:border-slate-400 transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <CopyIcon /> 원본 복사
                                    </button>

                                    {documentContent?.has_translation ? (
                                        <button
                                            onClick={() => handleCopy(documentContent?.translated_content)}
                                            className="flex items-center gap-1.5 bg-blue-600 text-white font-medium px-3 py-2 rounded-lg text-sm hover:bg-blue-700 transition-shadow shadow-md hover:scale-105 transform"
                                        >
                                            <CopyIcon /> 번역본 복사
                                        </button>
                                    ) : (
                                        <div className="relative group">
                                            <button
                                                disabled={translating || loading}
                                                className="flex items-center gap-1.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium px-3 py-2 rounded-lg text-sm hover:from-blue-600 hover:to-indigo-700 transition-all shadow-md hover:scale-105 transform disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <LanguagesIcon className={`w-4 h-4 ${translating ? 'animate-spin' : ''}`} />
                                                {translating ? '번역 중...' : '번역하기'}
                                            </button>
                                            {/* 드롭다운 메뉴 */}
                                            {!translating && !loading && (
                                                <div className="absolute left-0 top-full mt-1 w-48 bg-white border border-slate-200 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                                                    {availableTargetLangs.map((lang, idx) => (
                                                        <button
                                                            key={lang}
                                                            onClick={() => handleTranslate(lang)}
                                                            className={`w-full text-left px-4 py-2 hover:bg-slate-100 text-sm text-slate-800 ${idx === 0 ? 'rounded-t-lg' : ''} ${
                                                                idx === availableTargetLangs.length - 1 ? 'rounded-b-lg' : ''
                                                            }`}
                                                        >
                                                            {getLanguageName(lang)}로 번역
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </>
                            ) : (
                                // 회의록용 버튼 (기존 코드)
                                <>
                                    <button className="flex items-center gap-1.5 bg-white border border-slate-300 text-slate-700 font-medium px-3 py-2 rounded-lg text-sm hover:bg-slate-50">
                                        <CopyIcon /> 회의록 복사
                                    </button>
                                </>
                            )}
                        </div>

                        {isDocument && (
                            <div className="flex items-center">
                                <span className="text-sm text-slate-600 mr-2">스크롤 동기화</span>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" className="sr-only peer" checked={isSyncScroll} onChange={() => setIsSyncScroll(!isSyncScroll)} />
                                    <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                </label>
                            </div>
                        )}
                    </div>

                    {/* 내용 영역 */}
                    {loading ? (
                        <div className="flex items-center justify-center flex-grow">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
                                <p className="text-slate-600">파일 내용을 불러오는 중...</p>
                            </div>
                        </div>
                    ) : isDocument ? (
                        <DocumentView
                            userId={itemData.userId}
                            docId={itemData.id}
                            originalContent={documentContent?.original_content}
                            translatedContent={documentContent?.translated_content}
                            hasTranslation={documentContent?.has_translation}
                            isSyncScroll={isSyncScroll}
                            onTranslate={() => handleTranslate(availableTargetLangs[0])}
                            fromLang={itemData.fromLang}
                            toLang={documentContent?.translated_lang}
                        />
                    ) : (
                        <MinutesView minutes={itemData} />
                    )}
                </div>

                {/* 푸터 */}
                <footer className="p-3 text-sm text-slate-500 border-t border-slate-200 bg-slate-50 flex-shrink-0">
                    <div className="flex justify-between items-center px-2">
                        <span>
                            {itemData.lastModified} | {isDocument ? `${getLanguageName(itemData.fromLang)}` : `회의록 ID: ${itemData.id}`}
                        </span>
                        {isDocument && documentContent?.original_content && <span>총 {documentContent.original_content.split(/\s+/).length} 단어</span>}
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default DocumentModal;
