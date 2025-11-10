import React, { useState, useRef, useEffect } from 'react';
import axios from '../../../axios';
import { createPortal } from 'react-dom';
import Swal from 'sweetalert2';
import { BsFiletypeTxt, BsFileEarmarkTextFill } from 'react-icons/bs';
import { LanguagesIcon, Sparkles } from 'lucide-react';
import { DownloadIcon, DocumentIcon, FileTypePdfIcon, FileTypeDocxIcon } from '../../icons/icons';

// 언어 맵
const languageMap = { ko: '한국어', en: '영어', ja: '일본어', ch: '중국어' };
const getLanguageName = (code) => languageMap[code] || code;

// 아이콘 맵
const fileIconMap = {
    pdf: <FileTypePdfIcon />,
    txt: <BsFiletypeTxt />,
    docx: <FileTypeDocxIcon />,
    hwp: <BsFileEarmarkTextFill />,
};

// MIME 맵
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
        timer: 1400,
        timerProgressBar: true,
    });
};

const DocumentItem = ({ onClick, onSelect, isSelected, userId, isHost = true, onRagChange, ...doc }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownBtnRef = useRef(null);
    const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 });
    const dropdownRef = useRef(null);
    const [patching, setPatching] = useState(false);
    const [downloading, setDownloading] = useState(false);

    // ✅ Optimistic UI: 문맥기반 토글 로컬 상태
    const [localUseContextRag, setLocalUseContextRag] = useState(doc.use_context_rag ?? null);

    // prop 변경 시 동기화
    useEffect(() => {
        setLocalUseContextRag(doc.use_context_rag ?? null);
    }, [doc.use_context_rag]);

    const targetLangs = Object.keys(languageMap).filter((lang) => lang !== doc.fromLang);
    const ext = getExt(doc);
    const fileIcon = fileIconMap[ext] || <DocumentIcon />;

    // 드롭다운 외부 클릭 닫기
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isDropdownOpen && dropdownRef.current && !dropdownRef.current.contains(event.target) && dropdownBtnRef.current && !dropdownBtnRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isDropdownOpen]);

    // ✅ 완벽한 다운로드 핸들러
    const handleDownload = async () => {
        if (downloading) return;

        setDownloading(true);

        try {
            const filename = getDownloadName(doc, ext);
            const downloadUrl = doc.downloadUrl || `/api/users/${userId}/documents/${doc.id}/download`;

            // axios로 blob 다운로드
            const response = await axios.get(downloadUrl, {
                responseType: 'blob',
                timeout: 30000, // 30초 타임아웃
            });

            // Content-Type 헤더에서 MIME 타입 가져오기
            const contentType = response.headers['content-type'] || mimeMap[ext] || 'application/octet-stream';

            // Blob 생성
            const blob = new Blob([response.data], { type: contentType });

            // 다운로드 링크 생성 및 클릭
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.href = url;
            link.download = filename;

            // DOM에 추가 (일부 브라우저에서 필요)
            document.body.appendChild(link);
            link.click();

            // 정리
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            toast('다운로드가 완료되었습니다');
        } catch (error) {
            console.error('다운로드 실패:', error);

            if (error.response?.status === 404) {
                toast('파일을 찾을 수 없습니다', 'error');
            } else if (error.response?.status === 403) {
                toast('파일 접근 권한이 없습니다', 'error');
            } else if (error.code === 'ECONNABORTED') {
                toast('다운로드 시간이 초과되었습니다', 'error');
            } else {
                toast('다운로드 중 오류가 발생했습니다', 'error');
            }
        } finally {
            setDownloading(false);
        }
    };

    // ====== 🎯 PATCH API 호출 로직 ======
    const patchUseContextRag = async (nextBool) => {
        const value = nextBool ? 1 : 0;
        const url = `/api/users/${userId}/documents/${doc.id}/use-context-rag`;
        return axios.patch(
            url,
            { use_context_rag: value },
            {
                headers: {
                    'Content-Type': 'application/json',
                },
            },
        );
    };

    // ✅ 토글 클릭 시 SweetAlert 확인 후 처리
    const handleToggle = async (e) => {
        e.stopPropagation();

        if (!isHost) {
            toast('호스트만 변경할 수 있습니다', 'info');
            return;
        }

        if (patching) return;

        const currentState = localUseContextRag === true;
        const nextState = !currentState;

        // 🎯 SweetAlert 확인 다이얼로그
        const result = await Swal.fire({
            title: nextState ? '문맥기반 번역을 켜시겠습니까?' : '문맥기반 번역을 끄시겠습니까?',
            html: nextState
                ? `<div style="text-align: left; font-size: 14px; color: #64748b; line-height: 1.6;">
                    <p style="margin-bottom: 8px;">• 이전 대화 내용을 참고하여 더욱 자연스러운 번역을 제공합니다.</p>
                    <p style="margin-bottom: 8px;">• 문맥을 고려한 정확한 용어 선택이 가능합니다.</p>
                    <p style="margin-bottom: 0;">• 번역 처리 시간이 약간 증가할 수 있습니다.</p>
                   </div>`
                : `<div style="text-align: left; font-size: 14px; color: #64748b; line-height: 1.6;">
                    <p style="margin-bottom: 8px;">• 문서 내용만을 기반으로 번역합니다.</p>
                    <p style="margin-bottom: 8px;">• 빠른 번역 속도를 제공합니다.</p>
                    <p style="margin-bottom: 0;">• 간단한 문서나 독립적인 내용에 적합합니다.</p>
                   </div>`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: nextState ? '#4f46e5' : '#64748b',
            cancelButtonColor: '#94a3b8',
            confirmButtonText: nextState ? '네, 켤게요' : '네, 끌게요',
            cancelButtonText: '취소',
            customClass: {
                popup: 'swal-wide',
            },
        });

        // 사용자가 취소를 누른 경우
        if (!result.isConfirmed) {
            return;
        }

        // 확인을 누른 경우 → API 호출
        setLocalUseContextRag(nextState); // Optimistic UI
        setPatching(true);

        try {
            await patchUseContextRag(nextState);
            onRagChange?.(doc.id, nextState);
            toast(nextState ? '문맥기반 번역이 켜졌습니다' : '문맥기반 번역이 꺼졌습니다');
        } catch (err) {
            console.error('문맥기반 토글 실패:', err);
            setLocalUseContextRag(currentState); // 롤백
            onRagChange?.(doc.id, currentState);
            toast('변경에 실패했습니다', 'error');
        } finally {
            setPatching(false);
        }
    };

    // 드롭다운 좌표 계산 (position: fixed)
    const toggleDropdown = (e) => {
        e.stopPropagation();
        if (!dropdownBtnRef.current) return;
        const rect = dropdownBtnRef.current.getBoundingClientRect();
        setDropdownPos({ top: rect.bottom + 6, left: rect.left, width: rect.width });
        setIsDropdownOpen((prev) => !prev);
    };

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
                checked={isSelected}
                onChange={() => onSelect?.(doc.id)}
                onClick={(e) => e.stopPropagation()}
                className="mr-4 w-5 h-5 rounded accent-indigo-600 focus:ring-2 focus:ring-indigo-500/50"
            />

            {/* 아이콘 */}
            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-lg w-12 h-12 flex items-center justify-center mr-4">{fileIcon}</div>

            {/* 텍스트 */}
            <div className="flex-grow min-w-0">
                <p className="text-lg font-bold text-slate-900 truncate">{doc.title}</p>
                <p className="text-sm text-slate-500 mt-0.5 truncate">
                    {getLanguageName(doc.fromLang)} | {doc.author} | {doc.lastModified} | {doc.size}
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
                <button ref={dropdownBtnRef} className="text-slate-500 hover:text-blue-600 hover:bg-blue-100 p-2 rounded-full transition" onClick={toggleDropdown} title="번역하기">
                    <LanguagesIcon className="w-5 h-5" />
                </button>
            </div>

            {/* ===== 드롭다운 (포털) ===== */}
            {isDropdownOpen &&
                createPortal(
                    <div
                        ref={dropdownRef}
                        className="fixed z-[9999] w-48 bg-white border border-slate-200 rounded-xl shadow-2xl"
                        style={{ top: dropdownPos.top, left: dropdownPos.left }}
                        onMouseDown={(e) => e.stopPropagation()}
                    >
                        {targetLangs.map((lang, idx) => (
                            <button
                                key={lang}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsDropdownOpen(false);
                                    // TODO: 번역 API 호출
                                }}
                                className={`w-full text-left px-4 py-2 hover:bg-slate-100 text-sm text-slate-800 ${idx === 0 ? 'rounded-t-xl' : ''} ${
                                    idx === targetLangs.length - 1 ? 'rounded-b-xl' : ''
                                }`}
                            >
                                {getLanguageName(lang)}로 번역
                            </button>
                        ))}
                    </div>,
                    document.body,
                )}
        </div>
    );
};

export default DocumentItem;
