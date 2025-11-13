// src/components/sidebar/DocumentsTab.jsx
import React, { useContext } from 'react';
import api from '../../../../axios';
import { UserContext } from '../../../../contexts/UserContext';

const FileText = ({ className = 'w-5 h-5' }) => (
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
        className={className}
    >
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
    </svg>
);

const DownloadIcon = ({ className = 'w-4 h-4' }) => (
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
        className={className}
    >
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
);

// ========= 메타 텍스트(원문 / KO→EN 등) =========
const getDocMetaLabel = (doc) => {
    const isOriginal = doc.doc_type === 'ORIGINAL' || (!doc.trans_doc_id && !doc.doc_type);
    const isTranslated = doc.doc_type === 'TRANSLATION' || !!doc.trans_doc_id;

    if (isOriginal) {
        return '원문';
    }

    if (isTranslated) {
        const from = (doc.fromLang || doc.source_lang || '').toString().trim();
        const to = (doc.toLang || doc.target_language || '').toString().trim();

        if (from && to) {
            return `${from.toUpperCase()}→${to.toUpperCase()}`; // 예: KO→EN
        }
        return '번역';
    }

    return doc.fileType || '파일';
};

// ========= 파일명 / 확장자 유틸 (DashVideo와 동일) =========
const extractFilenameFromCD = (cd) => {
    if (!cd) return null;
    const utf8 = cd.match(/filename\*\s*=\s*UTF-8''([^;]+)/i);
    if (utf8) return decodeURIComponent(utf8[1]);
    const quoted = cd.match(/filename\s*=\s*"([^"]+)"/i);
    if (quoted) return quoted[1];
    const plain = cd.match(/filename\s*=\s*([^;]+)/i);
    return plain ? plain[1] : null;
};

const getExtFromContentType = (ct) => {
    if (!ct) return null;
    const type = ct.split(';')[0].trim().toLowerCase();
    const map = {
        'application/pdf': 'pdf',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
        'application/vnd.ms-powerpoint': 'ppt',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
        'application/msword': 'doc',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
        'application/vnd.ms-excel': 'xls',
        'text/plain': 'txt',
        'text/markdown': 'md',
        'text/csv': 'csv',
        'image/jpeg': 'jpg',
        'image/png': 'png',
    };
    return map[type] || null;
};

const getExtFromNameOrPath = (str) => {
    if (!str) return null;
    const clean = String(str).split('?')[0].split('#')[0];
    const base = clean.split('/').pop();
    const dot = base.lastIndexOf('.');
    if (dot > 0 && dot < base.length - 1) {
        return base.slice(dot + 1).toLowerCase();
    }
    return null;
};

const ensureFilenameWithExt = (name, ext) => {
    let base = (name || 'download').trim();
    base = base.replace(/[\\"']/g, '').replace(/\s+$/, '');
    const existingExt = getExtFromNameOrPath(base);
    if (existingExt) return base;
    if (ext) return `${base}.${ext}`;
    return base;
};

// ========= 실제 다운로드 (원문/번역 분기) =========
const downloadOneMeetingDoc = async (userId, meetingId, doc) => {
    if (!userId || !meetingId) {
        console.error('❌ userId 또는 meetingId 없음:', { userId, meetingId });
        return;
    }

    const isTranslation = doc.doc_type === 'TRANSLATION' || !!doc.trans_doc_id;
    const endpoint = isTranslation ? `/api/users/${userId}/meetings/${meetingId}/documents/translations/${doc.id}/download` : `/api/users/${userId}/meetings/${meetingId}/documents/${doc.id}/download`;

    const res = await api.get(endpoint, { responseType: 'blob', withCredentials: true });

    // 1) 파일명
    const cd = res.headers?.['content-disposition'];
    let filename = extractFilenameFromCD(cd);
    if (!filename) {
        filename = doc.original_name || doc.title || String(doc.id);
    }

    // 2) 확장자
    let ext = getExtFromNameOrPath(filename) || getExtFromNameOrPath(doc.rel_path) || getExtFromContentType(res.headers?.['content-type']);

    if (!ext && typeof filename === 'string') {
        const lowered = filename.toLowerCase();
        if (/(pdf|pptx|ppt|docx|doc|xlsx|xls|txt|md|csv|jpg|jpeg|png)$/.test(lowered)) {
            ext = lowered.split('.').pop();
        }
    }
    const finalName = ensureFilenameWithExt(filename, ext);

    // 3) blob 다운로드
    const blobUrl = window.URL.createObjectURL(new Blob([res.data]));
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = finalName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(blobUrl);
};

const DocumentItem = ({ doc }) => {
    const { user } = useContext(UserContext);
    const metaLabel = getDocMetaLabel(doc);

    const handleDownload = async (e) => {
        e.stopPropagation();
        try {
            const params = new URLSearchParams(window.location.search);
            const meetingId = params.get('id'); // /meeting?id=80&...
            await downloadOneMeetingDoc(user?.userId, meetingId, doc);
        } catch (err) {
            console.error('❌ 사이드바 다운로드 실패:', err);
        }
    };

    return (
        <div className="bg-[#3A425A] p-4 rounded-lg border border-gray-700/80 flex items-center gap-3">
            {/* 왼쪽 파일 아이콘 */}
            <div className="bg-blue-500/20 p-2.5 rounded-lg flex items-center justify-center">
                <FileText />
            </div>

            {/* 중앙 텍스트 영역 */}
            <div className="flex-1 min-w-0">
                <h3 className="font-bold text-white text-sm md:text-md truncate">{doc.title}</h3>
                <p className="text-xs md:text-sm text-gray-400">
                    {metaLabel}
                    {doc.size ? <> • {doc.size}</> : null}
                </p>
            </div>

            {/* 오른쪽 다운로드 버튼 */}
            <button
                type="button"
                onClick={handleDownload}
                className="ml-2 inline-flex items-center justify-center rounded-full px-3 py-2 text-xs font-semibold
                           border border-blue-400 text-blue-100 hover:bg-blue-500 hover:text-white
                           transition-colors"
                title="다운로드"
            >
                <DownloadIcon className="w-4 h-4 mr-1" />
                <span>다운로드</span>
            </button>
        </div>
    );
};

const DocumentsTab = ({ documents }) => {
    if (!documents || documents.length === 0) {
        return (
            <div className="text-center text-gray-400 py-16">
                <div className="w-12 h-12 mx-auto mb-4 opacity-50">
                    <FileText />
                </div>
                <p className="font-semibold">등록된 자료가 없습니다</p>
                <p className="text-sm mt-1">회의 자료를 추가해보세요</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {documents.map((doc) => (
                <DocumentItem key={doc.id} doc={doc} />
            ))}
        </div>
    );
};

export default DocumentsTab;
