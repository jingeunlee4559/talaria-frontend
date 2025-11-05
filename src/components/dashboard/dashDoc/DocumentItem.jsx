import React, { useState, useRef, useEffect } from 'react';
import { BsFiletypeTxt, BsFileEarmarkTextFill } from 'react-icons/bs';
import { DownloadIcon, DocumentIcon, FileTypePdfIcon, FileTypeDocxIcon } from '../../icons/icons';
import { LanguagesIcon } from 'lucide-react';

// --- (이 부분은 변경 없음) ---
const languageMap = { ko: '한국어', en: '영어', ja: '일본어', ch: '중국어' };
const getLanguageName = (code) => languageMap[code] || code;

const fileIconMap = {
    pdf: <FileTypePdfIcon />,
    txt: <BsFiletypeTxt />,
    docx: <FileTypeDocxIcon />,
    hwp: <BsFileEarmarkTextFill />,
};
// --- (여기까지 변경 없음) ---

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
        // ... (handleDownload 함수 내용은 변경 없음) ...
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
            // ✅ 1. "선택 상태"와 "호버 효과"를 극대화
            className={`
                flex items-center bg-white p-4 rounded-xl 
                transition-all duration-200 cursor-pointer 
                transform hover:-translate-y-0.5 hover:shadow-xl
                ${
                    isSelected
                        ? 'shadow-lg border-blue-500 ring-2 ring-blue-500/30' // ✨ "슈퍼노바" Glow 효과
                        : 'shadow-md border border-slate-200'
                }
            `}
            // ✅ 2. 모달 열기 (텍스트 영역 등)
            onClick={() => onClick({ ...doc, itemType: 'document' })}
        >
            {/* ✅ 3. 커스텀 체크박스 스타일 (더 세련되게) */}
            <input
                type="checkbox"
                checked={isSelected}
                onChange={() => onSelect(doc.id)}
                onClick={(e) => e.stopPropagation()} // 부모 클릭(모달 열기) 방지
                className="
                    mr-4 w-5 h-5 rounded 
                    accent-indigo-600 
                    focus:ring-2 focus:ring-indigo-500/50
                " // 'rounded'로 부드럽게
            />

            {/* ✅ 4. "슈퍼노바" 아이콘 컨테이너 */}
            <div
                className="
                p-3 bg-gradient-to-br from-blue-500 to-indigo-600 text-white 
                rounded-lg w-12 h-12 
                flex items-center justify-center mr-4
            "
            >
                {getFileIcon(doc.filepath)}
            </div>

            {/* ✅ 5. 텍스트 계층 구조 강화 */}
            <div className="flex-grow min-w-0">
                <p className="text-lg font-bold text-slate-900 truncate">{doc.title}</p>
                <p className="text-sm text-slate-500 mt-0.5 truncate">
                    {getLanguageName(doc.fromLang)} | {doc.author} | {doc.lastModified} | {doc.size}
                </p>
            </div>

            {/* ✅ 6. "액션 버튼" 스타일 개선 */}
            <div className="relative ml-auto flex items-center space-x-1 pl-2">
                <button
                    className="text-slate-500 hover:text-blue-600 hover:bg-blue-100 p-2 rounded-full transition"
                    onClick={(e) => {
                        e.stopPropagation();
                        handleDownload();
                    }}
                    title="다운로드"
                >
                    <DownloadIcon className="w-5 h-5" />
                </button>

                {/* 번역 드롭다운 */}
                <div className="relative" ref={dropdownRef}>
                    <button
                        className="text-slate-500 hover:text-blue-600 hover:bg-blue-100 p-2 rounded-full transition"
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsDropdownOpen((prev) => !prev);
                        }}
                        title="번역하기"
                    >
                        <LanguagesIcon className="w-5 h-5" />
                    </button>

                    {/* ✅ 7. 드롭다운 메뉴 스타일 통일 */}
                    {isDropdownOpen && (
                        <div className="absolute right-0 mt-2 w-40 bg-white border border-slate-200 rounded-xl shadow-xl z-50">
                            {targetLangs.map((lang) => (
                                <button
                                    key={lang}
                                    onClick={(e) => e.stopPropagation()}
                                    className="w-full text-left px-4 py-2 hover:bg-slate-100 text-sm text-slate-800 first:rounded-t-xl last:rounded-b-xl"
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
