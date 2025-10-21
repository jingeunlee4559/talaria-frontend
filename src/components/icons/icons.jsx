// src/components/icons.js
import React from 'react';

// 기존 아이콘
export const SearchIcon = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
);

export const FilterIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
        />
    </svg>
);

export const StarIcon = ({ isStarred, className = '' }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        className={`h-5 w-5 ${isStarred ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300 hover:text-yellow-400 transition'} ${className}`}
        viewBox="0 0 20 20"
        fill="currentColor"
    >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.012 8.73c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
);

export const DownloadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 mr-1">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
    </svg>
);

export const CopyIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 mr-1">
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.75 17.25v-3.75m0-11.25H4.5A2.25 2.25 0 002.25 4.5v11.25c0 1.24 1.01 2.25 2.25 2.25h11.25c1.24 0 2.25-1.01 2.25-2.25V5.25a2.25 2.25 0 00-2.25-2.25zm-9 0h2.25M9 7.5h2.25"
        />
    </svg>
);

export const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

// 새로 추가한 아이콘
export const VideoIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path d="M4.5 4.5a3 3 0 00-3 3v9a3 3 0 003 3h8.25a3 3 0 003-3v-9a3 3 0 00-3-3H4.5zM19.94 18.75l-2.69-2.69V7.94l2.69-2.69c.944-.945 2.56-.276 2.56 1.06v11.38c0 1.336-1.616 2.005-2.56 1.06z" />
    </svg>
);

export const SmallStarIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-yellow-500">
        <path
            fillRule="evenodd"
            d="M10.868 2.884c.321-.662 1.134-.662 1.456 0l1.868 3.844 4.251.618c.732.107 1.026.997.494 1.503l-3.076 2.998.726 4.234c.125.728-.638 1.283-1.296.952L10 17.64l-3.844 2.02c-.658.332-1.42-.224-1.296-.952l.726-4.234L2.51 8.847c-.532-.506-.238-1.396.494-1.503l4.25-.618 1.868-3.844z"
            clipRule="evenodd"
        />
    </svg>
);

export const CalendarIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0h18"
        />
    </svg>
);

export const ClockIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

export const UsersIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-4.663M12 12a3 3 0 100-6 3 3 0 000 6z"
        />
    </svg>
);

export const ShareIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.195.025.39.05.588.08a2.25 2.25 0 014.244 0c.198-.03.393-.055.588-.08m-5.42 2.186a2.25 2.25 0 004.244 0M12 6.344a2.25 2.25 0 100 4.312 2.25 2.25 0 000-4.312z"
        />
    </svg>
);

export const MoreIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 13.5a.75.75 0 110-1.5.75.75 0 010 1.5zM12 20.25a.75.75 0 110-1.5.75.75 0 010 1.5z" />
    </svg>
);

export const DocumentIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6 text-blue-500">
        <path
            fillRule="evenodd"
            d="M4.5 3.001a.75.75 0 00-1.036.606l-1.5 10.5a.75.75 0 00.606 1.036h16.86a.75.75 0 00.606-1.036l-1.5-10.5a.75.75 0 00-1.036-.606H4.5zM12 5.25a.75.75 0 00-1.5 0v3a.75.75 0 001.5 0v-3zM15 6a.75.75 0 01.75-.75h.008a.75.75 0 01.75.75v3a.75.75 0 01-1.5 0v-3A.75.75 0 0115 6zM8.25 6.75a.75.75 0 00-1.5 0v3a.75.75 0 001.5 0v-3z"
            clipRule="evenodd"
        />
        <path d="M3 19.5a3 3 0 003 3h12a3 3 0 003-3v-6H3v6z" />
    </svg>
);

export const AIIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={`w-5 h-5 mr-2 text-yellow-500 ${className || ''}`}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21l-2.583 2.583M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

// ⏱ 시간 아이콘
export const DurationIcon = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-4 h-4 mr-1 text-blue-500 ${props.className || ''}`}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

// 👥 참가자 아이콘
export const ParticipantsIcon = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-4 h-4 mr-1 text-blue-500 ${props.className || ''}`}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.12c0-1.874-1.516-3.39-3.39-3.39H8.39c-1.874 0-3.39 1.516-3.39 3.39V21h10.5M16 8a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
);

// 전송 아이콘
export const SendIcon = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5" {...props}>
        <path d="M3.105 2.289a.75.75 0 00-.826.95l1.414 4.949a.75.75 0 00.95.826L11.25 9.25v1.5l-7.595 1.266a.75.75 0 00-.95.826l1.414 4.949a.75.75 0 00.95.826l12.605-2.101a.75.75 0 00.424-1.218L3.105 2.29z" />
    </svg>
);

// 화살표 아이콘
export const LanguageArrowIcon = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-gray-400 mx-1" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
    </svg>
);

// 로그인 비밀번호 아이콘
export const EyeIcon = ({ isPasswordVisible, onClick }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5 text-slate-400 cursor-pointer hover:text-slate-600 transition"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
        onClick={onClick}
    >
        {isPasswordVisible ? (
            <>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </>
        ) : (
            <>
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.98 9.98 0 011.064-1.957m4.394-2.195a3.001 3.001 0 01-2.178-2.178A9.957 9.957 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.136 5.825"
                />
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 12a4 4 0 10-8 0 4 4 0 008 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 14L11 10M3 3l18 18" />
            </>
        )}
    </svg>
);

// --- GoogleIcon ---
export const GoogleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="h-6 w-6 mr-3">
        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.17 3.58l-5.27 4.75c-1.45-1.03-3.18-1.63-4.89-1.63-4.15 0-7.79 2.76-9.08 6.64H6.46C7.93 15.65 15.34 9.5 24 9.5z" />
        <path fill="#4285F4" d="M46.72 24.5c0-.98-.09-1.92-.25-2.84H24v5.68h12.55c-.53 2.58-2.07 4.79-4.7 6.3l4.89 3.75c3.67-3.37 5.86-8.22 5.86-14.89z" />
        <path fill="#FBBC05" d="M14.92 27.56c-.52-1.55-.83-3.21-.83-4.56s.31-3.01.83-4.56v-4.96H6.46C4.85 18.23 4 21.05 4 23c0 1.95.85 4.37 2.46 6.52l8.46-6.46z" />
        <path fill="#34A853" d="M24 41c5.16 0 9.77-1.7 13.03-4.63l-4.89-3.75c-2.43 1.6-4.57 2.54-7.46 2.54-4.15 0-7.79-2.76-9.08-6.64H6.46C7.93 32.35 15.34 41 24 41z" />
    </svg>
);

export const DocumentAddIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
);

export const ChartBarIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
        />
    </svg>
);

export const LanguageIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 5h12M9 3v2m1.06 11.06A5.987 5.987 0 0021 12a5.987 5.987 0 00-9.94-4.94M12 21a9.003 9.003 0 008.82-7H3.18a9.003 9.003 0 008.82 7z"
        />
    </svg>
);

export const VideoCameraIcon = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-8 w-8 text-indigo-500 ${props.className || ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18V6a2 2 0 012-2h6a2 2 0 012 2v12a2 2 0 01-2 2H7a2 2 0 01-2-2z" />
    </svg>
);

export const FileTypeDocxIcon = ({ className }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
        <polyline points="14 2 14 8 20 8" />
        <path d="M12 12v6" />
        <path d="M12 12h2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-2" />
    </svg>
);

// ==========================
// 📕 PDF 아이콘
// ==========================
export const FileTypePdfIcon = ({ className }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="M14 2v4a2 2 0 0 0 2 2h4" />
        <path d="M4 22h14a2 2 0 0 0 2-2V7.5L14.5 2H6a2 2 0 0 0-2 2v4" />
        <path d="M2 12h2" />
        <path d="M2 18h2" />
        <path d="M5 15h3" />
        <path d="M5 12v6" />
        <path d="M11 12h2a2 2 0 1 1 0 4h-2v-4Z" />
    </svg>
);
