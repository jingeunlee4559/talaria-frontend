import React, { useState, useRef, useEffect } from 'react';
import { BsFiletypeTxt, BsFileEarmarkTextFill } from 'react-icons/bs';
import { DownloadIcon, DocumentIcon, FileTypePdfIcon, FileTypeDocxIcon } from '../../icons/icons';
import { LanguagesIcon } from 'lucide-react';

const languageMap = { ko: '한국어', en: '영어', ja: '일본어', ch: '중국어' };
const getLanguageName = (code) => languageMap[code] || code;

const fileIconMap = {
    pdf: <FileTypePdfIcon />,
    txt: <BsFiletypeTxt />,
    docx: <FileTypeDocxIcon />,
    hwp: <BsFileEarmarkTextFill />,
};

const DocumentItem = ({ onClick, onSelect, isSelected, ...doc }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    const targetLangs = Object.keys(languageMap).filter((lang) => lang !== doc.fromLang);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const getFileIcon = (filepath) => {
        const extension = filepath?.split('.').pop().toLowerCase();
        return fileIconMap[extension] || <DocumentIcon />;
    };

    const handleDownload = () => {
        const content = doc.content || doc.originalContent || '';
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${doc.title}_${getLanguageName(doc.fromLang)}.txt`;
        link.click();
        URL.revokeObjectURL(link.href);
    };

    return (
        <div
            className="flex items-center bg-white p-4 rounded-xl shadow-md hover:shadow-lg transition cursor-pointer border border-slate-200"
            onClick={() => onClick({ ...doc, itemType: 'document' })}
        >
            {/* ✅ 체크박스 */}
            <input
                type="checkbox"
                checked={isSelected}
                onChange={(e) => {
                    // e.stopPropagation(); // onChange에서 호출할 필요는 없습니다.
                    onSelect(doc.id);
                }}
                // 👇 이 부분을 추가해 주세요.
                onClick={(e) => e.stopPropagation()}
                className="mr-3 w-5 h-5 accent-indigo-600"
            />

            {/* 아이콘 */}
            <div className="p-3 bg-blue-100 text-blue-600 rounded-full w-12 h-12 flex items-center justify-center mr-4">{getFileIcon(doc.filepath)}</div>

            {/* 내용 */}
            <div className="flex-grow min-w-0">
                <p className="text-base font-semibold text-slate-800 break-words">{doc.title}</p>
                <p className="text-sm text-slate-500 mt-0.5">
                    {getLanguageName(doc.fromLang)} | {doc.author} | {doc.lastModified} | {doc.size}
                </p>
            </div>

            {/* 다운로드/번역 버튼 */}
            <div className="relative ml-auto flex items-center space-x-2">
                <button
                    className="text-slate-400 hover:text-slate-600 p-2 rounded-full transition"
                    onClick={(e) => {
                        e.stopPropagation();
                        handleDownload();
                    }}
                    title="다운로드"
                >
                    <DownloadIcon className="w-5 h-5" />
                </button>

                <div className="relative" ref={dropdownRef}>
                    <button
                        className="text-slate-400 hover:text-slate-600 p-2 rounded-full transition"
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsDropdownOpen((prev) => !prev);
                        }}
                        title="번역하기"
                    >
                        <LanguagesIcon className="w-5 h-5" />
                    </button>

                    {isDropdownOpen && (
                        <div className="absolute right-0 mt-2 w-40 bg-white border border-slate-200 rounded-md shadow-lg z-50">
                            {targetLangs.map((lang) => (
                                <button key={lang} onClick={(e) => e.stopPropagation()} className="w-full text-left px-4 py-2 hover:bg-slate-100 text-sm text-slate-800">
                                    {getLanguageName(lang)}로 번역
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DocumentItem;
