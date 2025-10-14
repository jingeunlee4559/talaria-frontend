import React, { useState, useRef, useEffect } from 'react';
import { StarIcon, DownloadIcon, DocumentIcon } from '../../icons/icons';

const DocumentItem = ({ onClick, ...doc }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 텍스트를 파일로 다운로드
  const handleDownload = (lang) => {
    const content = lang === 'original' ? doc.originalContent : doc.translatedContent;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${doc.title}_${lang === 'original' ? '원문' : '번역'}.txt`;
    link.click();
    URL.revokeObjectURL(link.href);
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
        <DocumentIcon />
      </div>
    </div>

    {/* 내용 */}
    <div className="flex-grow min-w-0">
      <div className="flex items-center justify-between">
        <p className="text-base font-semibold text-slate-800 break-words mr-2">
          {doc.title}
        </p>
        {doc.isStarred && <StarIcon isStarred={true} className="h-4 w-4 flex-shrink-0" />}
      </div>
      <p className="text-sm text-slate-500 mt-0.5 whitespace-normal break-words">
        {doc.fromLang} → {doc.toLang} | {doc.author} | {doc.date} | {doc.size}
      </p>
    </div>

    {/* 다운로드 버튼 */}
    <div className="relative ml-auto sm:ml-4 mt-3 sm:mt-0 flex-shrink-0" ref={dropdownRef}>
      <button
        className="text-slate-400 hover:text-slate-600 p-2 rounded-full transition"
        onClick={(e) => {
          e.stopPropagation();
          setIsDropdownOpen((prev) => !prev);
        }}
      >
        <DownloadIcon className="w-5 h-5" />
      </button>

      {/* 언어 선택 드롭다운 */}
      {isDropdownOpen && (
        <div className="absolute right-0 mt-2 w-40 bg-white border border-slate-200 rounded-md shadow-lg z-50">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDownload('original');
            }}
            className="w-full text-left px-4 py-2 hover:bg-slate-100 text-sm text-slate-800"
          >
            원문 다운로드
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDownload('translated');
            }}
            className="w-full text-left px-4 py-2 hover:bg-slate-100 text-sm text-slate-800"
          >
            번역본 다운로드
          </button>
        </div>
      )}
    </div>
  </div>
);
};

export default DocumentItem;
