import React, { useState, useRef, useEffect } from 'react';
// ✅ 1. 'react-icons'에서 사용할 아이콘들을 import 합니다.
import { BsFiletypeTxt, BsFileEarmarkTextFill } from 'react-icons/bs';
import { DownloadIcon, DocumentIcon, FileTypePdfIcon, FileTypeDocxIcon } from '../../icons/icons';
import { LanguagesIcon } from 'lucide-react';
import { DocumentTextIcon } from '@heroicons/react/20/solid';

const languageMap = {
    ko: '한국어',
    en: '영어',
    ja: '일본어',
    ch: '중국어',
};

const getLanguageName = (code) => {
    return languageMap[code] || code;
};

// ✅ 2. 파일 확장자와 아이콘 컴포넌트를 매핑하는 객체에 docx, hwp, txt를 추가합니다.
const fileIconMap = {
    pdf: <FileTypePdfIcon />,
    txt: <BsFiletypeTxt />,
    docx: <FileTypeDocxIcon />,
    hwp: <BsFileEarmarkTextFill />,
};

const DocumentItem = ({ onClick, ...doc }) => {
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
        // 매핑 객체에 해당 확장자가 있으면 그 아이콘을, 없으면 기본 DocumentIcon을 반환합니다.
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

    const handleTranslate = (targetLang) => {
        console.log(`'${doc.title}' 문서를 ${getLanguageName(targetLang)}(으)로 번역 요청`);
        setIsDropdownOpen(false);
    };

    return (
        <div
            className="flex flex-wrap sm:flex-nowrap items-start sm:items-center bg-white p-4 rounded-xl shadow-md hover:shadow-lg transition duration-300 cursor-pointer border border-slate-200"
            onClick={() => onClick({ ...doc, itemType: 'document' })}
        >
            {/* 아이콘 */}
            <div className="flex-shrink-0 mr-0 sm:mr-4 mb-3 sm:mb-0">
                <div className="p-3 bg-blue-100 text-blue-600 rounded-full w-12 h-12 flex items-center justify-center">
                    {/* ✅ 3. 이 부분은 변경할 필요 없이 그대로 작동합니다. */}
                    {getFileIcon(doc.filepath)}
                </div>
            </div>

            {/* 내용 */}
            <div className="flex-grow min-w-0">
                <p className="text-base font-semibold text-slate-800 break-words mr-2">{doc.title}</p>
                <p className="text-sm text-slate-500 mt-0.5 whitespace-normal break-words">
                    {getLanguageName(doc.fromLang)} | {doc.author} | {doc.lastModified} | {doc.size}
                </p>
            </div>

            {/* 버튼 섹션 (기존과 동일) */}
            <div className="relative ml-auto sm:ml-4 mt-3 sm:mt-0 flex items-center space-x-2 flex-shrink-0">
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
                                <button
                                    key={lang}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleTranslate(lang);
                                    }}
                                    className="w-full text-left px-4 py-2 hover:bg-slate-100 text-sm text-slate-800"
                                >
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
