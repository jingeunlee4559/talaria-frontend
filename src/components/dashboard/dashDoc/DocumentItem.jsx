import React, { useState, useRef, useEffect, useCallback } from 'react';
import api from '../../../axios'; // NOTE: 여기선 기본 API만 쓰면 됨. ai는 Provider에서 사용
import { createPortal } from 'react-dom';
import Swal from 'sweetalert2';
import { BsFiletypeTxt, BsFileEarmarkTextFill } from 'react-icons/bs';
import { LanguagesIcon, Sparkles } from 'lucide-react';
import { DownloadIcon, DocumentIcon, FileTypePdfIcon, FileTypeDocxIcon } from '../../icons/icons';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslator } from '../../../contexts/TranslationProvider';

// === 언어/아이콘/MIME ===
const languageMap = { ko: '한국어', en: '영어', ja: '일본어', 'zh-CN': '중국어' };
const getLanguageName = (code) => languageMap[code] || code;

const fileIconMap = {
    pdf: <FileTypePdfIcon />,
    txt: <BsFiletypeTxt />,
    docx: <FileTypeDocxIcon />,
    hwp: <BsFileEarmarkTextFill />,
};

const mimeMap = {
    pdf: 'application/pdf',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    xls: 'application/vnd.ms-excel',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    csv: 'text/csv;charset=utf-8',
    txt: 'text/plain;charset=utf-8',
    md: 'text/markdown;charset=utf-8',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    hwp: 'application/octet-stream',
};

const getExt = (doc) => {
    const fromPath = doc?.filepath?.split('.').pop()?.toLowerCase();
    if (fromPath) return fromPath;
    const fromTitle = doc?.title?.split('.').pop()?.toLowerCase();
    return fromTitle || 'txt';
};

const getDownloadName = (doc, ext) => {
    const base = doc?.title?.replace(/\.[^/.]+$/, '') || 'document';
    return `${base}.${ext}`;
};

const toast = (title, icon = 'success') => {
    Swal.fire({
        toast: true,
        position: 'top-end',
        icon,
        title,
        showConfirmButton: false,
        timer: 1600,
        timerProgressBar: true,
    });
};

const DocumentItem = ({ onClick, onSelect, isSelected, userId, isHost = true, onRagChange, ...doc }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownBtnRef = useRef(null);
    const dropdownRef = useRef(null);

    const [dropdownStyle, setDropdownStyle] = useState({
        top: 0,
        left: 0,
        transformOrigin: 'top left',
        placement: 'bottom',
    });

    const [patching, setPatching] = useState(false);
    const [downloading, setDownloading] = useState(false);

    // === 전역 번역 훅 ===
    const { startJob, getJobByDocId } = useTranslator();
    const job = getJobByDocId(doc.id); // 없을 수 있음

    const translatingTo = job?.target || null;
    const progress = job?.percent ?? 0;
    const status = job?.status || 'IDLE';
    const translating = status === 'PENDING' || status === 'PROCESSING';

    // 문맥기반 토글 로컬 상태 (Optimistic)
    const [localUseContextRag, setLocalUseContextRag] = useState(doc.use_context_rag ?? null);
    useEffect(() => {
        setLocalUseContextRag(doc.use_context_rag ?? null);
    }, [doc.use_context_rag]);

    const targetLangs = Object.keys(languageMap).filter((lang) => lang !== doc.fromLang && lang !== doc.original_lang);
    const ext = getExt(doc);
    const fileIcon = fileIconMap[ext] || <DocumentIcon />;

    // 외부 클릭 닫기
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isDropdownOpen && dropdownRef.current && !dropdownRef.current.contains(event.target) && dropdownBtnRef.current && !dropdownBtnRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside, true);
        return () => document.removeEventListener('mousedown', handleClickOutside, true);
    }, [isDropdownOpen]);

    // ===== 다운로드 =====
    const handleDownload = async () => {
        if (downloading) return;
        setDownloading(true);
        try {
            const filename = getDownloadName(doc, ext);
            const downloadUrl = doc.downloadUrl || `/api/users/${userId}/documents/${doc.id}/download`;

            const response = await api.get(downloadUrl, { responseType: 'blob', timeout: 30000 });
            const contentType = response.headers['content-type'] || mimeMap[ext] || 'application/octet-stream';
            const blob = new Blob([response.data], { type: contentType });

            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            toast('다운로드가 완료되었습니다');
        } catch (error) {
            console.error('다운로드 실패:', error);
            if (error.response?.status === 404) toast('파일을 찾을 수 없습니다', 'error');
            else if (error.response?.status === 403) toast('파일 접근 권한이 없습니다', 'error');
            else if (error.code === 'ECONNABORTED') toast('다운로드 시간이 초과되었습니다', 'error');
            else toast('다운로드 중 오류가 발생했습니다', 'error');
        } finally {
            setDownloading(false);
        }
    };

    // ===== 문맥기반 토글 =====
    const patchUseContextRag = async (nextBool) => {
        const value = nextBool ? 1 : 0;
        const url = `/api/users/${userId}/documents/${doc.id}/use-context-rag`;
        return api.patch(url, { use_context_rag: value }, { headers: { 'Content-Type': 'application/json' } });
    };

    const handleToggle = async (e) => {
        e.stopPropagation();
        if (!isHost) {
            toast('호스트만 변경할 수 있습니다', 'info');
            return;
        }
        if (patching) return;

        const currentState = localUseContextRag === true;
        const nextState = !currentState;

        const result = await Swal.fire({
            title: nextState ? '문맥기반 번역을 켜시겠습니까?' : '문맥기반 번역을 끄시겠습니까?',
            html: nextState
                ? `<div style="text-align:left;font-size:14px;color:#64748b;line-height:1.6;">
             <p>• 이전 대화 내용을 참고하여 더욱 자연스러운 번역</p>
             <p>• 용어 일관성 향상</p>
             <p>• 처리 시간 소폭 증가 가능</p>
           </div>`
                : `<div style="text-align:left;font-size:14px;color:#64748b;line-height:1.6;">
             <p>• 문서 내용만 기반으로 번역</p>
             <p>• 빠른 처리 속도</p>
             <p>• 독립 문서에 적합</p>
           </div>`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: nextState ? '#4f46e5' : '#64748b',
            cancelButtonColor: '#94a3b8',
            confirmButtonText: nextState ? '네, 켤게요' : '네, 끌게요',
            cancelButtonText: '취소',
        });
        if (!result.isConfirmed) return;

        setLocalUseContextRag(nextState);
        setPatching(true);
        try {
            await patchUseContextRag(nextState);
            onRagChange?.(doc.id, nextState);
            toast(nextState ? '문맥기반 번역이 켜졌습니다' : '문맥기반 번역이 꺼졌습니다');
        } catch (err) {
            console.error('문맥기반 토글 실패:', err);
            setLocalUseContextRag(currentState); // rollback
            onRagChange?.(doc.id, currentState);
            toast('변경에 실패했습니다', 'error');
        } finally {
            setPatching(false);
        }
    };

    // ===== 드롭다운 위치 계산 =====
    const repositionDropdown = useCallback(() => {
        if (!dropdownBtnRef.current || !dropdownRef.current) return;
        const btnRect = dropdownBtnRef.current.getBoundingClientRect();
        const menuRect = dropdownRef.current.getBoundingClientRect();

        const margin = 8;
        let top = btnRect.bottom + margin;
        let left = btnRect.left;
        let placement = 'bottom';
        let transformOrigin = 'top left';

        const overRight = left + menuRect.width > window.innerWidth - margin;
        if (overRight) {
            left = Math.max(margin, btnRect.right - menuRect.width);
            transformOrigin = 'top right';
        }

        const overBottom = top + menuRect.height > window.innerHeight - margin;
        if (overBottom) {
            top = btnRect.top - menuRect.height - margin;
            placement = 'top';
            transformOrigin = overRight ? 'bottom right' : 'bottom left';
        }

        if (left < margin) {
            left = margin;
            transformOrigin = placement === 'bottom' ? 'top left' : 'bottom left';
        }

        setDropdownStyle({ top, left, placement, transformOrigin });
    }, []);

    useEffect(() => {
        if (!isDropdownOpen) return;
        const raf = requestAnimationFrame(() => repositionDropdown());
        const onScroll = () => repositionDropdown();
        const onResize = () => repositionDropdown();

        document.addEventListener('scroll', onScroll, { passive: true, capture: true });
        window.addEventListener('resize', onResize, { passive: true });

        return () => {
            cancelAnimationFrame(raf);
            document.removeEventListener('scroll', onScroll, { capture: true });
            window.removeEventListener('resize', onResize);
        };
    }, [isDropdownOpen, repositionDropdown]);

    // ===== 번역 호출: 전역 훅 사용 =====
    const callTranslate = async (target) => {
        const rel_path = doc.rel_path || doc.filepath;
        const source = doc.fromLang || doc.original_lang || 'ko';

        if (!rel_path) {
            toast('문서 경로(rel_path)를 찾을 수 없습니다', 'error');
            return;
        }
        startJob({ relPath: rel_path, source, target, docId: doc.id, title: doc.title });
        toast(`${getLanguageName(target)} 번역을 요청했습니다`);
    };

    // 진행바(UI는 동일)
    const ProgressBar = () => (
        <div className="mt-2">
            <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-slate-600">번역 진행상황 {translatingTo ? `(${getLanguageName(translatingTo)})` : ''}</span>
                <span className="text-xs text-slate-500">{progress}%</span>
            </div>
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}>
                <div className={`h-full transition-all duration-300 ${status === 'FAILED' ? 'bg-red-400' : 'bg-indigo-500'}`} style={{ width: `${progress}%` }} />
            </div>
            <div className="mt-1.5">
                {status === 'PENDING' && <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-sky-50 text-sky-700">대기 중…</span>}
                {status === 'PROCESSING' && <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700">처리 중…</span>}
                {status === 'COMPLETED' && <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700">완료</span>}
                {status === 'FAILED' && <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700">실패</span>}
            </div>
        </div>
    );

    return (
        <div
            className={`
        flex items-center bg-white p-4 rounded-xl
        transition-all duration-200 cursor-pointer
        transform hover:-translate-y-0.5 hover:shadow-xl
        ${isSelected ? 'shadow-lg border-blue-500 ring-2 ring-blue-500/30' : 'shadow-md border border-slate-200'}
      `}
            onClick={() => onClick?.({ ...doc, itemType: 'document' })}
        >
            {/* 체크박스 */}
            <input
                type="checkbox"
                checked={!!isSelected}
                onChange={() => onSelect?.(doc.id)}
                onClick={(e) => e.stopPropagation()}
                className="mr-4 w-5 h-5 rounded accent-indigo-600 focus:ring-2 focus:ring-indigo-500/50"
            />

            {/* 아이콘 */}
            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-lg w-12 h-12 flex items-center justify-center mr-4">{fileIcon}</div>

            {/* 텍스트 + 진행바 */}
            <div className="flex-grow min-w-0">
                <p className="text-lg font-bold text-slate-900 truncate">{doc.title}</p>
                <p className="text-sm text-slate-500 mt-0.5 truncate">
                    {(languageMap[doc.fromLang] || languageMap[doc.original_lang] || doc.fromLang || doc.original_lang) ?? ''} | {doc.author} | {doc.lastModified} | {doc.size}
                </p>

                {/* 문맥기반 배지 */}
                <div className="mt-1">
                    {localUseContextRag === true && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700">
                            <Sparkles size={12} /> 문맥기반: 켜짐
                        </span>
                    )}
                    {localUseContextRag === false && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600">문맥기반: 꺼짐</span>
                    )}
                    {localUseContextRag == null && <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700">기본값 사용</span>}
                </div>

                {/* 진행바 (전역 상태 기준) */}
                {(status === 'PENDING' || status === 'PROCESSING' || status === 'COMPLETED' || status === 'FAILED') && <ProgressBar />}
            </div>

            {/* 액션 영역 */}
            <div className="relative ml-auto flex items-center space-x-1 pl-2">
                {/* 문맥기반 토글 */}
                <button
                    type="button"
                    onClick={handleToggle}
                    aria-pressed={localUseContextRag === true}
                    disabled={!isHost || patching}
                    className={`
            group relative inline-flex items-center h-8 w-16 rounded-full px-1 transition-all
            ${localUseContextRag === true ? 'bg-gradient-to-r from-blue-500 to-indigo-600 shadow-md shadow-blue-500/30' : 'bg-slate-300'}
            ${!isHost ? 'opacity-50 cursor-not-allowed' : 'hover:brightness-105'}
            ${patching ? 'opacity-50 cursor-wait' : ''}
          `}
                    title={isHost ? '문맥기반 번역' : '호스트만 변경 가능'}
                    onMouseDown={(e) => e.stopPropagation()}
                >
                    <span
                        className={`
              inline-flex items-center justify-center h-6 w-6 transform rounded-full bg-white shadow-lg transition-all duration-300
              ${localUseContextRag === true ? 'translate-x-8' : 'translate-x-0'}
            `}
                    >
                        <Sparkles size={14} className={`${localUseContextRag === true ? 'text-indigo-600' : 'text-slate-400'}`} />
                    </span>
                    <span className="absolute left-2 text-[10px] font-bold text-white/90 select-none">OFF</span>
                    <span className="absolute right-2 text-[10px] font-bold text-white/90 select-none">ON</span>
                </button>

                {/* 다운로드 */}
                <button
                    className={`text-slate-500 hover:text-blue-600 hover:bg-blue-100 p-2 rounded-full transition ${downloading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={(e) => {
                        e.stopPropagation();
                        handleDownload();
                    }}
                    disabled={downloading}
                    title={downloading ? '다운로드 중...' : '다운로드'}
                >
                    <DownloadIcon className={`w-5 h-5 ${downloading ? 'animate-pulse' : ''}`} />
                </button>

                {/* 번역 드롭다운 트리거 */}
                <button
                    ref={dropdownBtnRef}
                    className={`text-slate-500 hover:text-blue-600 hover:bg-blue-100 p-2 rounded-full transition ${translating ? 'opacity-50 cursor-wait' : ''}`}
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsDropdownOpen((prev) => !prev);
                        requestAnimationFrame(() => repositionDropdown());
                    }}
                    title="번역하기"
                    disabled={translating}
                >
                    <LanguagesIcon className="w-5 h-5" />
                </button>
            </div>

            {/* ===== 드롭다운 (포털) ===== */}
            {createPortal(
                <AnimatePresence>
                    {isDropdownOpen && (
                        <motion.div
                            ref={dropdownRef}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ type: 'spring', stiffness: 320, damping: 22 }}
                            className="fixed z-[9999] w-56 rounded-xl border border-slate-200 bg-white shadow-2xl backdrop-blur-xl"
                            style={{
                                top: dropdownStyle.top,
                                left: dropdownStyle.left,
                                transformOrigin: dropdownStyle.transformOrigin,
                            }}
                            onMouseDown={(e) => e.stopPropagation()}
                        >
                            {/* 화살표 */}
                            <div
                                className={`absolute w-3 h-3 bg-white border-l border-t border-slate-200 rotate-45`}
                                style={dropdownStyle.placement === 'bottom' ? { top: -6, left: '16px' } : { bottom: -6, left: '16px' }}
                            />

                            <div className="py-1.5">
                                {targetLangs.map((lang, idx) => (
                                    <button
                                        key={lang}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setIsDropdownOpen(false);
                                            // 전역 번역 시작
                                            callTranslate(lang);
                                        }}
                                        className={`w-full text-left px-4 py-2.5 text-sm text-slate-800 hover:bg-indigo-50 hover:text-indigo-700 transition-colors
                      ${idx === 0 ? 'rounded-t-xl' : ''} ${idx === targetLangs.length - 1 ? 'rounded-b-xl' : ''}`}
                                        disabled={translating}
                                    >
                                        {translatingTo === lang ? '요청 중… ' : ''}
                                        {getLanguageName(lang)}로 번역
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>,
                document.body,
            )}
        </div>
    );
};

export default DocumentItem;
