// src/components/modals/FileUploadModal.jsx
import React, { useCallback, useEffect, useMemo, useState, useContext } from 'react';
import { FilePlus2, FileText, UploadCloud, X, HelpCircle, Loader2, Trash2, FileCheck2, Sparkles } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import Swal from 'sweetalert2';
import api, { ai } from '../../../axios';
import { UserContext } from '../../../contexts/UserContext';
import { useNavigate } from 'react-router-dom';

// ===== 설정 =====
const MAX_FILE_BYTES = 100 * 1024 * 1024; // 100MB
const ALLOWED_EXT = ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'hwp'];

const languageOptions = [
    { value: 'ko', label: '한국어', emoji: '🇰🇷' },
    { value: 'en', label: '영어', emoji: '🇺🇸' },
    { value: 'ja', label: '일본어', emoji: '🇯🇵' },
    { value: 'ch', label: '중국어', emoji: '🇨🇳' },
];

const chip = (label) => <span className="inline-flex items-center rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 px-3 py-1 text-xs font-semibold shadow-sm">{label}</span>;

const FileUploadModal = ({ isOpen, onClose, onUploadSuccess, meetingId }) => {
    const { user } = useContext(UserContext);

    const [fileName, setFileName] = useState('');
    const [file, setFile] = useState(null);
    const [language, setLanguage] = useState('ko');

    // ✅ 숫자형 0/1 로 관리: 0=비활성, 1=활성
    const [useContextRag, setUseContextRag] = useState(0);

    const [uploadProgress, setUploadProgress] = useState(0);
    const [message, setMessage] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const navigate = useNavigate();

    // ESC로 닫기
    useEffect(() => {
        if (!isOpen) return;
        const onKey = (e) => {
            if (e.key === 'Escape') handleClose();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);

    // 파일 검사
    const checkFile = (selectedFile) => {
        if (selectedFile.size > MAX_FILE_BYTES) {
            setMessage(`파일 용량이 큽니다. 최대 ${(MAX_FILE_BYTES / (1024 * 1024)).toFixed(0)}MB까지 업로드 가능합니다.`);
            return false;
        }
        const ext = selectedFile.name.split('.').pop()?.toLowerCase();
        if (ext && !ALLOWED_EXT.includes(ext)) {
            setMessage(`허용되지 않는 확장자입니다. (${ALLOWED_EXT.join(', ')})`);
            return false;
        }
        return true;
    };

    const onDrop = useCallback(
        (acceptedFiles) => {
            const selectedFile = acceptedFiles?.[0];
            if (!selectedFile) return;
            if (!checkFile(selectedFile)) return;

            setFile(selectedFile);
            if (!fileName) {
                const nameNoExt = selectedFile.name.split('.').slice(0, -1).join('.');
                setFileName(nameNoExt || selectedFile.name);
            }
            setMessage('');
        },
        [fileName],
    );

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        multiple: false,
        noClick: false,
        noKeyboard: false,
    });

    const fileInfo = useMemo(() => {
        if (!file) return null;
        const ext = file.name.split('.').pop()?.toUpperCase();
        const sizeKB = (file.size / 1024).toFixed(1);
        return { ext, sizeKB };
    }, [file]);

    const resetState = () => {
        setFileName('');
        setFile(null);
        setLanguage('ko');
        setUseContextRag(0); // 초기화 시 0
        setUploadProgress(0);
        setMessage('');
        setSubmitting(false);
    };

    const handleClose = () => {
        onClose?.();
        setTimeout(resetState, 250);
    };

    // 제출
    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        if (!fileName || !file || !language) {
            setMessage('문서 이름, 언어, 파일을 모두 선택해주세요.');
            return;
        }
        if (!user?.userId) {
            setMessage('로그인 정보가 없습니다.');
            return;
        }

        try {
            setSubmitting(true);
            const formData = new FormData();
            formData.append('file', file);
            formData.append('original_name', fileName.trim());
            formData.append('original_lang', language);
            formData.append('uploader_user_id', user.userId);

            // ✅ 서버로 "0" 또는 "1" 전송
            formData.append('use_context_rag', String(useContextRag));

            if (meetingId) formData.append('meeting_id', meetingId);

            setUploadProgress(10);

            // 1) 문서 업로드
            const response = await api.post(`/api/users/${user.userId}/documents`, formData, {
                onUploadProgress: (evt) => {
                    if (!evt.total) return;
                    const percent = Math.round((evt.loaded * 100) / evt.total);
                    setUploadProgress(percent);
                },
            });

            // 2) 업로드 응답에서 RAG용 데이터 추출
            const uploadedDoc = response.data;
            console.log('업로드 응답:', uploadedDoc);

            const docId = uploadedDoc.doc_id; // ✅ 여기!
            const docLang = uploadedDoc.original_lang || language;
            const relPath = uploadedDoc.filepath;

            if (!docId || !relPath) {
                console.warn('RAG 처리에 필요한 docId 또는 relPath가 없습니다.', uploadedDoc);
            } else {
                // 👉 문맥 기반 옵션 켰을 때만 돌리고 싶으면 if (useContextRag === 1 && ...) 로 감싸기
                await ai.post(
                    '/rag/process-document',
                    {
                        document_id: String(docId),
                        language: docLang,
                        rel_path: relPath,
                        // meeting_id: meetingId, // 필요하면 추가
                    },
                    {
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    },
                );
            }

            // 4) 최종 UI 처리
            setUploadProgress(100);

            Swal.fire({
                icon: 'success',
                title: '업로드 완료!',
                text: `'${fileName}' 문서가 성공적으로 등록되었습니다.`,
                timer: 1800,
                timerProgressBar: true,
                showConfirmButton: false,
            }).then(() => {
                handleClose();
                onUploadSuccess?.(response.data);
                navigate(0);
            });
        } catch (err) {
            console.error(err);

            // ✅ FastAPI가 내려준 422 디테일 확인
            if (err.response) {
                console.log('RAG 422 detail:', err.response.data);
            }

            setUploadProgress(0);
            setSubmitting(false);
            Swal.fire({
                icon: 'error',
                title: '업로드 실패',
                text: '파일 업로드 중 오류가 발생했습니다. 다시 시도해주세요.',
                confirmButtonColor: '#d33',
                confirmButtonText: '확인',
            });
        }
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black/40 backdrop-blur-md p-3 sm:p-4 animate-[fadeIn_0.2s_ease-out]"
            onClick={handleClose}
            aria-modal="true"
            role="dialog"
        >
            <div
                className="w-full max-w-lg sm:max-w-2xl max-h-[calc(100vh-2rem)] sm:max-h-[calc(100vh-4rem)] overflow-hidden rounded-2xl sm:rounded-3xl bg-white shadow-2xl flex flex-col animate-[slideUp_0.3s_ease-out]"
                onClick={(e) => e.stopPropagation()}
                style={{ animation: 'slideUp 0.3s ease-out' }}
            >
                {/* 헤더 */}
                <div className="relative h-32 sm:h-40 bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 overflow-hidden">
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-0 left-0 w-72 h-72 sm:w-96 sm:h-96 bg-white rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
                        <div className="absolute bottom-0 right-0 w-72 h-72 sm:w-96 sm:h-96 bg-white rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
                    </div>
                    <div className="absolute inset-0">
                        <Sparkles className="absolute top-6 left-6 sm:top-8 sm:left-12 text-white/30 animate-pulse" size={14} />
                        <Sparkles className="absolute top-14 right-10 sm:top-16 sm:right-20 text-white/40 animate-pulse delay-75" size={10} />
                        <Sparkles className="absolute bottom-8 left-10 sm:bottom-12 sm:left-24 text-white/30 animate-pulse delay-150" size={12} />
                    </div>
                    <div className="relative flex h-full items-center gap-3 sm:gap-4 px-5 sm:px-8">
                        <div className="grid h-14 w-14 sm:h-16 sm:w-16 place-items-center rounded-2xl bg-white/95 shadow-xl backdrop-blur-sm transform hover:scale-105 transition-transform">
                            <FilePlus2 className="text-blue-600" size={28} strokeWidth={2.5} />
                        </div>
                        <div className="min-w-0">
                            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mb-0.5 truncate">문서 업로드</h2>
                            <p className="text-xs sm:text-sm text-white/90 font-medium">AI 번역을 위한 문서를 등록하세요</p>
                        </div>
                    </div>
                    <button
                        onClick={handleClose}
                        className="absolute right-3 top-3 sm:right-4 sm:top-4 rounded-full p-2 sm:p-2.5 text-white/90 hover:bg-white/20 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 transition-all"
                        aria-label="닫기"
                    >
                        <X size={22} strokeWidth={2.5} />
                    </button>
                </div>

                {/* 본문 */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto space-y-6 px-5 py-6 sm:px-8 sm:py-8 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
                    {/* 문서 이름 */}
                    <div className="space-y-2.5">
                        <label htmlFor="fileName" className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-800 h-6">
                            <FileText size={18} className="text-blue-600" />
                            문서 이름
                        </label>
                        <input
                            id="fileName"
                            type="text"
                            value={fileName}
                            onChange={(e) => setFileName(e.target.value)}
                            placeholder="예) 2025_Q1_세일즈_제안서"
                            className="w-full h-12 sm:h-14 rounded-xl border-2 border-slate-200 bg-slate-50/50 px-3 sm:px-4 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all
                                focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 hover:border-slate-300"
                            required
                        />
                    </div>

                    {/* 언어 + 문맥기반 */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* 언어 선택 */}
                        <div className="space-y-2.5">
                            <label htmlFor="language" className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-800 h-6">
                                <span className="text-base sm:text-lg">🌍</span>
                                원문 언어
                            </label>
                            <div className="relative h-12 sm:h-14 rounded-xl border-2 border-slate-200 bg-slate-50/50 transition-all hover:border-slate-300 focus-within:border-blue-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-500/10">
                                <select
                                    id="language"
                                    value={language}
                                    onChange={(e) => setLanguage(e.target.value)}
                                    className="appearance-none w-full h-full px-3 sm:px-4 bg-transparent text-sm text-slate-900 outline-none cursor-pointer"
                                    required
                                >
                                    {languageOptions.map((o) => (
                                        <option key={o.value} value={o.value}>
                                            {o.emoji} {o.label}
                                        </option>
                                    ))}
                                </select>
                                <div className="pointer-events-none absolute right-3 sm:right-4 top-1/2 -translate-y-1/2">
                                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* 문맥기반 토글 */}
                        <div className="space-y-2.5">
                            <div className="flex items-center justify-between h-6">
                                <label className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-800">
                                    <Sparkles size={18} className="text-blue-600" />
                                    문맥기반 번역
                                </label>
                                <div className="relative group">
                                    <button type="button" className="text-slate-400 hover:text-blue-600 focus:outline-none transition-colors" aria-label="문맥기반 번역 안내">
                                        <HelpCircle size={18} />
                                    </button>
                                    <div
                                        role="tooltip"
                                        className="pointer-events-none absolute right-0 top-7 z-10 hidden w-72 sm:w-80 rounded-xl border-2 border-blue-100 bg-white p-3 sm:p-4 text-[11px] sm:text-xs text-slate-700 shadow-2xl group-hover:block group-focus-within:block"
                                    >
                                        <div className="font-bold text-blue-700 mb-1.5 sm:mb-2 flex items-center gap-1.5">
                                            <Sparkles size={14} />
                                            AI 문맥 분석 기능
                                        </div>
                                        업로드된 문서와 회의 내용에서 관련 정보를 검색하여 용어와 고유명사의 번역 정확도를 높입니다. 처리 시간이 조금 더 소요될 수 있습니다.
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between h-12 sm:h-14 rounded-xl border-2 border-slate-200 bg-slate-50/50 px-3 sm:px-4 transition-all hover:border-slate-300">
                                <div className="flex flex-col justify-center">
                                    <span className={`text-xs sm:text-sm font-bold leading-tight transition-colors ${useContextRag === 1 ? 'text-blue-700' : 'text-slate-600'}`}>
                                        {useContextRag === 1 ? '✨ 활성화됨' : '비활성화'}
                                    </span>
                                    <span className="text-[10px] sm:text-[11px] text-slate-500 leading-tight mt-0.5">{useContextRag === 1 ? '정확도 ↑ · 시간/비용 ↑' : '빠른 처리'}</span>
                                </div>

                                {/* ✅ 숫자형 토글: 0 ↔ 1 */}
                                <button
                                    type="button"
                                    role="switch"
                                    aria-checked={useContextRag === 1}
                                    onClick={() => setUseContextRag((v) => (v === 1 ? 0 : 1))}
                                    className={`relative inline-flex h-7 sm:h-8 w-12 sm:w-14 shrink-0 items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:ring-offset-2
                      ${useContextRag === 1 ? 'bg-gradient-to-r from-blue-500 to-indigo-600 shadow-md shadow-blue-500/30' : 'bg-slate-300'}`}
                                >
                                    <span
                                        className={`inline-block h-5 sm:h-6 w-5 sm:w-6 transform rounded-full bg-white shadow-lg transition-all duration-300 ${
                                            useContextRag === 1 ? 'translate-x-6 sm:translate-x-7' : 'translate-x-1'
                                        }`}
                                    />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* 업로드 카드 */}
                    <div>
                        <label className="mb-3 flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-800 h-6">
                            <UploadCloud size={18} className="text-blue-600" />
                            파일 첨부
                        </label>
                        <div
                            {...getRootProps()}
                            className={`group relative flex flex-col items-center justify-center rounded-2xl border-3 border-dashed p-6 sm:p-10 transition-all duration-300 cursor-pointer
                  ${
                      file
                          ? 'border-blue-400 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg shadow-blue-100'
                          : isDragActive
                          ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 ring-4 ring-blue-500/30 scale-[1.02]'
                          : 'border-slate-300 bg-slate-50/50 hover:border-blue-300 hover:bg-blue-50/30 hover:shadow-md'
                  }`}
                        >
                            <input {...getInputProps()} aria-label="파일 선택 또는 드래그앤드롭" />
                            {file ? (
                                <div className="flex w-full flex-col items-center gap-3 sm:gap-4 text-center animate-[fadeIn_0.3s_ease-out]">
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-blue-600 rounded-2xl blur-xl opacity-20 animate-pulse" />
                                        <FileCheck2 className="relative text-blue-600 drop-shadow-lg" size={48} strokeWidth={2} />
                                    </div>
                                    <div className="space-y-2 w-full">
                                        <p className="text-sm sm:text-base font-bold text-slate-800 break-all px-2 sm:px-4">{file.name}</p>
                                        <div className="flex items-center justify-center gap-2 flex-wrap">
                                            {chip(`${fileInfo?.ext ?? ''}`)}
                                            {chip(`${fileInfo?.sizeKB} KB`)}
                                        </div>
                                        <p className="text-xs text-blue-700 font-bold mt-2 sm:mt-3">✓ 파일이 선택되었습니다</p>
                                    </div>
                                    <button
                                        type="button"
                                        className="inline-flex items-center gap-2 rounded-xl border-2 border-slate-200 bg-white px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:border-red-300 hover:text-red-600 active:scale-95 transition-all shadow-sm"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setFile(null);
                                        }}
                                    >
                                        <Trash2 size={16} />
                                        파일 제거
                                    </button>
                                </div>
                            ) : (
                                <div className="text-center space-y-3 sm:space-y-4">
                                    <div className="relative inline-block">
                                        <div
                                            className={`absolute inset-0 bg-blue-600 rounded-2xl blur-2xl opacity-0 transition-opacity ${
                                                isDragActive ? 'opacity-30 animate-pulse' : 'group-hover:opacity-20'
                                            }`}
                                        />
                                        <UploadCloud
                                            className={`relative transition-all duration-300 ${
                                                isDragActive ? 'text-blue-600 scale-110' : 'text-slate-400 group-hover:text-blue-500 group-hover:scale-105'
                                            }`}
                                            size={48}
                                            strokeWidth={2}
                                        />
                                    </div>
                                    <div>
                                        <p className="text-sm sm:text-base font-bold text-slate-800 mb-1">{isDragActive ? '📁 여기에 놓아주세요!' : '파일을 드래그하여 놓기'}</p>
                                        <p className="text-xs sm:text-sm text-slate-600 font-medium">또는 클릭하여 파일 선택</p>
                                    </div>
                                    <div className="pt-1.5 sm:pt-2 space-y-1.5">
                                        <p className="text-[11px] sm:text-xs text-slate-500">
                                            📎 허용 확장자: <span className="font-bold text-blue-700">{ALLOWED_EXT.join(', ')}</span>
                                        </p>
                                        <p className="text-[11px] sm:text-xs text-slate-500">
                                            📦 최대 용량: <span className="font-bold text-blue-700">{(MAX_FILE_BYTES / (1024 * 1024)).toFixed(0)}MB</span>
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 진행/메시지 */}
                    {(uploadProgress > 0 || message) && (
                        <div className="space-y-3 animate-[fadeIn_0.2s_ease-out]">
                            {uploadProgress > 0 && (
                                <div className="overflow-hidden rounded-xl border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-lg">
                                    <div className="flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3">
                                        <div className="flex items-center gap-2.5 sm:gap-3">
                                            {uploadProgress < 100 ? (
                                                <Loader2 className="animate-spin text-blue-600" size={18} />
                                            ) : (
                                                <div className="flex h-5 w-5 items-center justify-center">
                                                    <FileCheck2 className="text-green-600" size={20} />
                                                </div>
                                            )}
                                            <span className="text-xs sm:text-sm font-bold text-slate-800">{uploadProgress < 100 ? '업로드 중...' : '✅ 업로드 완료'}</span>
                                        </div>
                                        <span className="rounded-full bg-blue-600 px-2.5 sm:px-3 py-0.5 sm:py-1 text-[11px] sm:text-xs font-bold text-white shadow-md">{uploadProgress}%</span>
                                    </div>
                                    <div className="h-2 bg-blue-100">
                                        <div className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-300 ease-out shadow-lg" style={{ width: `${uploadProgress}%` }} />
                                    </div>
                                </div>
                            )}
                            {message && (
                                <div className="rounded-xl border-2 border-red-200 bg-red-50 px-3 sm:px-4 py-2.5 sm:py-3 shadow-md animate-[shake_0.3s_ease-in-out]">
                                    <p className="text-xs sm:text-sm font-bold text-red-800 flex items-center gap-2">
                                        <span className="text-base sm:text-lg">⚠️</span>
                                        {message}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* 하단 액션 */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-end gap-2.5 sm:gap-3 pt-2 border-t-2 border-slate-200">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="h-10 sm:h-12 rounded-xl border-2 border-slate-300 bg-white px-4 sm:px-6 text-xs sm:text-sm font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-400 active:scale-95 transition-all shadow-sm w-full sm:w-auto"
                        >
                            취소
                        </button>
                        <button
                            type="submit"
                            disabled={submitting || (uploadProgress > 0 && uploadProgress < 100)}
                            className={`h-10 sm:h-12 flex items-center justify-center gap-2 px-4 sm:px-6 rounded-xl text-xs sm:text-sm font-bold text-white shadow-lg transition-all w-full sm:w-auto
                  ${
                      submitting || (uploadProgress > 0 && uploadProgress < 100)
                          ? 'bg-slate-400 cursor-not-allowed'
                          : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 hover:shadow-xl hover:shadow-blue-500/50 hover:-translate-y-0.5 active:scale-95'
                  }`}
                        >
                            {submitting ? (
                                <>
                                    <Loader2 size={16} className="sm:size-[18px] animate-spin" />
                                    업로드 중...
                                </>
                            ) : (
                                <>
                                    <UploadCloud size={16} className="sm:size-[18px]" strokeWidth={2.5} />
                                    문서 업로드
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>

            <style>{`
                @keyframes slideUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }
                @keyframes shake {
                    0%,
                    100% {
                        transform: translateX(0);
                    }
                    25% {
                        transform: translateX(-5px);
                    }
                    75% {
                        transform: translateX(5px);
                    }
                }
            `}</style>
        </div>
    );
};

export default FileUploadModal;
