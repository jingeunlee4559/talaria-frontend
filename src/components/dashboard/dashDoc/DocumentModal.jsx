// src/components/dashboard/dashDoc/DocumentModal.jsx
import { useRef, useState, useEffect } from 'react';
import api from '../../../axios';
import { CopyIcon, CloseIcon, AIIcon, SearchIcon, ParticipantsIcon, DurationIcon, CalendarIcon } from '../../icons/icons';
import Swal from 'sweetalert2';
import { LanguagesIcon } from 'lucide-react';

/* =========================
   공통 유틸
========================= */

// 언어 맵 (zh-CN / ch 동시 지원)
const languageMap = { ko: '한국어', en: '영어', ja: '일본어', 'zh-CN': '중국어', ch: '중국어' };
const getLanguageName = (code) => languageMap[code] || code;

// Toast
const toast = (title, icon = 'success') => Swal.fire({ toast: true, position: 'top-end', icon, title, showConfirmButton: false, timer: 1400, timerProgressBar: true });

// UI용 접두사 제거(orig-/trans-)
const normalizeId = (id) => {
    if (typeof id === 'number') return id;
    const s = String(id ?? '');
    if (s.startsWith('orig-')) return s.slice(5);
    if (s.startsWith('trans-')) return s.slice(6);
    return s;
};

/* =========================
   서버 응답 정규화
   - 번역문 단건 컨텐츠: GET /api/users/{userId}/trans-docs/req/{requestId}
   - 원문 컨텐츠:       GET /api/users/{userId}/documents/{docId}/content
   다양한 키에 유연 대응
========================= */
const normalizeContent = (raw = {}, itemData = {}) => {
    // 원문/번역 텍스트 필드 유연 파싱
    const original_content = raw.original_content ?? raw.originalText ?? raw.original_text ?? raw.original?.content ?? raw.original ?? '';

    const translated_content = raw.translated_content ?? raw.translatedText ?? raw.translated_text ?? raw.translated?.content ?? raw.translated ?? '';

    // 번역 여부
    const has_translation = typeof raw.has_translation === 'boolean' ? raw.has_translation : Boolean((translated_content ?? '').toString().trim());

    // 언어
    const translated_lang = raw.translated_lang ?? raw.target_lang ?? raw.target_language ?? itemData.toLang ?? itemData.target_language ?? null;

    const original_lang = raw.original_lang ?? itemData.fromLang ?? null;

    return {
        original_content,
        translated_content,
        has_translation,
        translated_lang,
        original_lang,
    };
};

/* =========================
   문서 번역 뷰(좌:원문/우:번역)
========================= */
const DocumentView = ({ originalContent, translatedContent, hasTranslation, isSyncScroll, onTranslate, fromLang, toLang }) => {
    const originalRef = useRef(null);
    const translatedRef = useRef(null);

    const syncScroll = (a, b) => {
        if (!isSyncScroll || !a || !b) return;
        const h = a.scrollHeight - a.clientHeight;
        if (h <= 0) return;
        const ratio = a.scrollTop / h;
        b.scrollTop = ratio * (b.scrollHeight - b.clientHeight);
    };

    return (
        <div className="flex flex-grow overflow-hidden">
            {/* 원본 */}
            <div className="flex flex-col w-1/2 overflow-hidden bg-gray-50">
                <h3 className="text-lg font-semibold text-slate-900 p-5 border-b border-slate-200 bg-gray-100 sticky top-0 z-10">원본 ({getLanguageName(fromLang)})</h3>
                <div
                    ref={originalRef}
                    onScroll={(e) => syncScroll(e.target, translatedRef.current)}
                    className="p-8 text-slate-800 text-base leading-relaxed whitespace-pre-wrap overflow-y-auto flex-grow font-inter scrollbar-thin scrollbar-thumb-slate-400 scrollbar-track-gray-100"
                >
                    {originalContent || '내용을 불러오는 중...'}
                </div>
            </div>

            {/* 번역본 */}
            <div className="flex flex-col w-1/2 overflow-hidden bg-white border-l border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900 p-5 border-b border-slate-200 bg-white sticky top-0 z-10">번역본 ({toLang ? getLanguageName(toLang) : '번역 필요'})</h3>
                <div
                    ref={translatedRef}
                    onScroll={(e) => syncScroll(e.target, originalRef.current)}
                    className="p-8 text-slate-800 text-base leading-relaxed whitespace-pre-wrap overflow-y-auto flex-grow font-inter scrollbar-thin scrollbar-thumb-slate-400 scrollbar-track-transparent"
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

/* =========================
   회의록 뷰(디자인 개선)
========================= */
const MinutesView = ({ minutes }) => (
    <div className="flex flex-col flex-grow overflow-y-auto bg-gray-50 scrollbar-thin scrollbar-thumb-slate-400 scrollbar-track-gray-100">
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

        <div className="p-8 grid grid-cols-1 gap-6">
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
                                    <span className="font-bold text-slate-800 mr-2">{t.speaker === 'J' ? 'John Smith' : t.speaker === '田' ? '田中太郎' : t.speaker === '김' ? '김철수' : '기타'}</span>
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

/* =========================
   메인 모달
========================= */
const DocumentModal = ({ isOpen, onClose, itemData }) => {
    const [isSyncScroll, setIsSyncScroll] = useState(true);
    const [documentContent, setDocumentContent] = useState(null);
    const [loading, setLoading] = useState(false);
    const [translating, setTranslating] = useState(false);

    // 컨텐츠 URL (요구사항에 맞춰 번역문서는 request_id 단건 컨텐츠 엔드포인트 사용)
    const buildContentUrl = (userId, item) => {
        if (!item) return null;

        // 원문: /documents/{docId}/content
        if (item.type === 'original' || !item.type) {
            const docId = normalizeId(item.id);
            return `/api/users/${item.userId || userId}/documents/${docId}/content`;
        }

        // 번역문: /trans-docs/req/{requestId}  ← 단건 컨텐츠 엔드포인트(요청대로 /content 없음)
        if (item.type === 'translated' && item.request_id) {
            return `/api/users/${item.userId || userId}/trans-docs/req/${item.request_id}`;
        }

        // (옵션) 백엔드가 지원하면 original_doc_id+target_language 쿼리 방식도 가능
        if (item.type === 'translated' && item.original_doc_id && item.target_language) {
            return `/api/users/${item.userId || userId}/trans-docs/content?original_doc_id=${item.original_doc_id}&target_language=${encodeURIComponent(item.target_language)}`;
        }

        return null;
    };

    // 파일 내용 로드
    useEffect(() => {
        if (!isOpen || !itemData || itemData.itemType !== 'document') {
            setDocumentContent(null);
            return;
        }

        const fetchContent = async () => {
            setLoading(true);
            try {
                const url = buildContentUrl(itemData.userId, itemData);
                if (!url) throw new Error('콘텐츠 URL을 구성할 수 없습니다.');

                const res = await api.get(url);
                const normalized = normalizeContent(res.data, itemData);
                setDocumentContent(normalized);
            } catch (error) {
                console.error('파일 내용 로드 실패:', error);
                const serverMsg = error?.response?.data?.error || error?.response?.data?.message;

                if (error.response?.status === 400) toast(serverMsg || '지원하지 않는 파일 형식입니다', 'warning');
                else if (error.response?.status === 404) toast(serverMsg || '파일을 찾을 수 없습니다', 'error');
                else if (error.response?.status === 403) toast(serverMsg || '접근 권한이 없습니다', 'error');
                else toast(serverMsg || '파일 내용을 불러오는데 실패했습니다', 'error');

                setDocumentContent({
                    original_content: '파일 내용을 불러올 수 없습니다.\n\n' + (serverMsg || '지원하지 않는 파일 형식이거나 파일이 손상되었을 수 있습니다.'),
                    has_translation: false,
                    translated_content: '',
                    original_lang: itemData.fromLang ?? null,
                    translated_lang: null,
                });
            } finally {
                setLoading(false);
            }
        };

        fetchContent();
    }, [isOpen, itemData]);

    // 번역 시작(샘플; 실제 API로 교체)
    const handleTranslate = async (targetLang) => {
        if (translating) return;

        const result = await Swal.fire({
            title: `${getLanguageName(targetLang)}로 번역하시겠습니까?`,
            html: `<div style="text-align:left;font-size:14px;color:#64748b;line-height:1.6;">
               <p>• 문서 전체를 ${getLanguageName(targetLang)}로 번역합니다.</p>
               <p>• 번역에는 시간이 소요될 수 있습니다.</p>
               <p>• 번역 후 결과를 확인하고 다운로드할 수 있습니다.</p>
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
            // 실제 번역 API로 교체:
            // await api.post(`/api/users/${itemData.userId}/documents/${normalizeId(itemData.id)}/translate`, { target_lang: targetLang });

            // 데모용 지연
            await new Promise((r) => setTimeout(r, 2000));

            setDocumentContent((prev) => ({
                ...prev,
                has_translation: true,
                translated_content: `[${getLanguageName(targetLang)} 번역]\n\n` + (prev?.original_content || ''),
                translated_lang: targetLang,
            }));

            toast('번역이 완료되었습니다!', 'success');
        } catch (error) {
            const serverMsg = error?.response?.data?.error || error?.response?.data?.message;
            toast(serverMsg || '번역 중 오류가 발생했습니다', 'error');
        } finally {
            setTranslating(false);
        }
    };

    // ESC 닫기
    useEffect(() => {
        const onEsc = (e) => e.key === 'Escape' && onClose();
        if (isOpen) window.addEventListener('keydown', onEsc);
        return () => window.removeEventListener('keydown', onEsc);
    }, [isOpen, onClose]);

    if (!isOpen || !itemData) return null;

    const isDocument = itemData.itemType === 'document';
    const currentOriginalLang = itemData.fromLang || documentContent?.original_lang;
    const availableTargetLangs = Object.keys(languageMap).filter((l) => l !== currentOriginalLang);
    const effectiveFromLang = currentOriginalLang || 'ko';
    const effectiveToLang = documentContent?.translated_lang || null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/30 backdrop-blur-md" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl w-full h-full max-w-7xl max-h-[90vh] flex flex-col transition-all overflow-hidden" onClick={(e) => e.stopPropagation()}>
                {/* 헤더 */}
                <header className="flex justify-between items-center p-4 border-b border-slate-200 bg-white">
                    <h2 className="text-xl font-bold text-slate-900 truncate">{itemData.title}</h2>
                    <button onClick={onClose} className="p-2 rounded-full text-slate-500 hover:bg-slate-100">
                        <CloseIcon />
                    </button>
                </header>

                {/* 본문 */}
                <div className="flex flex-col flex-grow overflow-hidden">
                    {/* 액션 바 */}
                    <div className="flex items-center justify-between p-3 border-b border-slate-200 bg-slate-50">
                        <div className="flex space-x-2">
                            {isDocument ? (
                                <>
                                    <button
                                        onClick={() =>
                                            navigator.clipboard
                                                .writeText(documentContent?.original_content || '')
                                                .then(() => toast('클립보드에 복사되었습니다'))
                                                .catch(() => toast('복사에 실패했습니다', 'error'))
                                        }
                                        disabled={!documentContent?.original_content}
                                        className="flex items-center gap-1.5 bg-white border border-slate-300 text-slate-700 font-medium px-3 py-2 rounded-lg text-sm hover:bg-slate-50 hover:border-slate-400 transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <CopyIcon /> 원본 복사
                                    </button>

                                    {documentContent?.has_translation ? (
                                        <button
                                            onClick={() =>
                                                navigator.clipboard
                                                    .writeText(documentContent?.translated_content || '')
                                                    .then(() => toast('클립보드에 복사되었습니다'))
                                                    .catch(() => toast('복사에 실패했습니다', 'error'))
                                            }
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
                                <button className="flex items-center gap-1.5 bg-white border border-slate-300 text-slate-700 font-medium px-3 py-2 rounded-lg text-sm hover:bg-slate-50">
                                    <CopyIcon /> 회의록 복사
                                </button>
                            )}
                        </div>

                        {isDocument && (
                            <div className="flex items-center">
                                <span className="text-sm text-slate-600 mr-2">스크롤 동기화</span>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" className="sr-only peer" checked={isSyncScroll} onChange={() => setIsSyncScroll((v) => !v)} />
                                    <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                </label>
                            </div>
                        )}
                    </div>

                    {/* 컨텐츠 */}
                    {loading ? (
                        <div className="flex items-center justify-center flex-grow">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
                                <p className="text-slate-600">파일 내용을 불러오는 중...</p>
                            </div>
                        </div>
                    ) : isDocument ? (
                        <DocumentView
                            originalContent={documentContent?.original_content}
                            translatedContent={documentContent?.translated_content}
                            hasTranslation={documentContent?.has_translation}
                            isSyncScroll={isSyncScroll}
                            onTranslate={() => handleTranslate(availableTargetLangs[0])}
                            fromLang={currentOriginalLang || 'ko'}
                            toLang={effectiveToLang}
                        />
                    ) : (
                        <MinutesView minutes={itemData} />
                    )}
                </div>

                {/* 푸터 */}
                <footer className="p-3 text-sm text-slate-500 border-t border-slate-200 bg-slate-50">
                    <div className="flex justify-between items-center px-2">
                        <span>
                            {itemData.lastModified} | {isDocument ? `${getLanguageName(currentOriginalLang || 'ko')}` : `회의록 ID: ${itemData.id}`}
                        </span>
                        {isDocument && documentContent?.original_content && <span>총 {String(documentContent.original_content).trim().split(/\s+/).filter(Boolean).length} 단어</span>}
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default DocumentModal;
