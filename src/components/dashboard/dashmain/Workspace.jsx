import { ClipboardListIcon, UploadCloudIcon } from 'lucide-react';
import React, { useState } from 'react';
import { FileTypeDocxIcon, FileTypePdfIcon } from '../../icons/icons';

const DocumentListItem = ({ title, status, type, lang }) => (
    <div className="flex items-center space-x-4 p-3 hover:bg-slate-200/40 rounded-lg transition-colors">
        {type === 'pdf' ? <FileTypePdfIcon className="w-8 h-8 text-red-500 shrink-0" /> : <FileTypeDocxIcon className="w-8 h-8 text-blue-500 shrink-0" />}
        <div className="flex-1 overflow-hidden">
            <p className="font-semibold text-slate-800 truncate">{title}</p>
            <p className="text-sm text-slate-500">{lang}</p>
        </div>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${status === '완료' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>{status}</span>
    </div>
);

const MeetingMinuteItem = ({ title, date, participants }) => (
    <div className="flex items-center space-x-4 p-3 hover:bg-slate-200/40 rounded-lg transition-colors">
        <ClipboardListIcon className="w-8 h-8 text-indigo-500 shrink-0" />
        <div className="flex-1 overflow-hidden">
            <p className="font-semibold text-slate-800 truncate">{title}</p>
            <div className="flex items-center space-x-2">
                <p className="text-sm text-slate-500">{date}</p>
                <div className="flex -space-x-1">
                    {participants.map((p, i) => (
                        <img key={i} className="inline-block h-5 w-5 rounded-full ring-1 ring-white" src={p.avatar} alt={p.name} title={p.name} />
                    ))}
                </div>
            </div>
        </div>
        <button className="text-sm font-semibold text-indigo-600 hover:text-indigo-800">보기</button>
    </div>
);

const Workspace = ({ documents, minutes, className }) => {
    const [activeTab, setActiveTab] = useState('documents');

    return (
        <div className={`bg-white/60 backdrop-blur-sm rounded-xl shadow-sm flex flex-col ${className}`}>
            <div className="p-3 border-b border-slate-200/80 flex justify-between items-center">
                <div className="flex space-x-2">
                    <button
                        onClick={() => setActiveTab('documents')}
                        className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors ${
                            activeTab === 'documents' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:bg-white/50'
                        }`}
                    >
                        최근 문서
                    </button>
                    <button
                        onClick={() => setActiveTab('minutes')}
                        className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors ${
                            activeTab === 'minutes' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:bg-white/50'
                        }`}
                    >
                        회의록 보기
                    </button>
                </div>
                <button className="flex items-center space-x-2 bg-sky-500 text-white text-sm font-semibold py-2 px-3 rounded-lg hover:bg-sky-600 transition-colors">
                    <UploadCloudIcon className="w-4 h-4" />
                    <span>새 문서 번역</span>
                </button>
            </div>
            <div className="p-3 flex-1 overflow-y-auto custom-scrollbar">
                {activeTab === 'documents' && (
                    <div className="space-y-2">
                        {documents.map((doc, i) => (
                            <DocumentListItem key={i} {...doc} />
                        ))}
                    </div>
                )}
                {activeTab === 'minutes' && (
                    <div className="space-y-2">
                        {minutes.map((minute, i) => (
                            <MeetingMinuteItem key={i} {...minute} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Workspace;
