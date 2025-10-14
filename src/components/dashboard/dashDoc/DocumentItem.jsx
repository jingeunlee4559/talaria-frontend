import React from 'react';
import { StarIcon,DownloadIcon,MoreIcon,DocumentIcon } from '../../icons/icons';


// 개별 번역 문서 항목 컴포넌트 (모달 호출 기능 추가)
const DocumentItem = ({ onClick, ...doc }) => (
    <div
        className="flex items-center bg-white p-4 rounded-xl shadow-md hover:shadow-lg transition duration-300 cursor-pointer border border-slate-200"
        onClick={() => onClick({ ...doc, itemType: 'document' })}
    >
        <div className="flex-shrink-0 mr-4">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5c0-.621-.504-1.125-1.125-1.125H9.75M4.5 16.5v.75A.75.75 0 005.25 18h13.5a.75.75 0 00.75-.75v-.75m-18 0A2.25 2.25 0 014.5 14.25V7.5a2.25 2.25 0 012.25-2.25H9M9 16.5A2.25 2.25 0 0011.25 18h.75A2.25 2.25 0 0014.25 16.5m-18-4a1.5 1.5 0 011.5-1.5h1.5a1.5 1.5 0 011.5 1.5M9 16.5h.75a1.5 1.5 0 001.5-1.5v-1.5a1.5 1.5 0 00-1.5-1.5H9" /></svg>
            </div>
        </div>
        <div className="flex-grow">
            <div className="flex items-center">
                <p className="text-base font-semibold text-slate-800 truncate mr-2">{doc.title}</p>
                {doc.isStarred && <StarIcon isStarred={true} className="h-4 w-4" />}
            </div>
            <p className="text-sm text-slate-500 mt-0.5">
                {doc.fromLang} → {doc.toLang} | {doc.author} | {doc.date} | {doc.size}
            </p>
        </div>
        <button className="text-slate-400 hover:text-slate-600 p-2 rounded-full transition">
            <DownloadIcon className="w-5 h-5" />
        </button>
    </div>
);


export default DocumentItem;