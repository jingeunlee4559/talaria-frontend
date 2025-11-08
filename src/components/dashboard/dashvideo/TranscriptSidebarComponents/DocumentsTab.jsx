// src/components/sidebar/DocumentsTab.jsx
import React from 'react';

const FileText = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
    </svg>
);

const DocumentItem = ({ doc }) => (
    <div 
        className="bg-[#3A425A] p-4 rounded-lg border border-gray-700/80 flex items-center gap-3 hover:bg-gray-700/70 transition-colors cursor-pointer"
        onClick={() => doc.url && window.open(doc.url, '_blank')}
    >
        <div className="bg-blue-500/20 p-2.5 rounded-lg">
            <FileText />
        </div>
        <div className="flex-1">
            <h3 className="font-bold text-white text-md">{doc.title}</h3>
            <p className="text-sm text-gray-400">{doc.fileType || 'PDF'} • {doc.size}</p>
        </div>
    </div>
);

const DocumentsTab = ({ documents }) => {
    if (documents.length === 0) {
        return (
            <div className="text-center text-gray-400 py-16">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="font-semibold">등록된 자료가 없습니다</p>
                <p className="text-sm mt-1">회의 자료를 추가해보세요</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {documents.map((doc) => <DocumentItem key={doc.id} doc={doc} />)}
        </div>
    );
};

export default DocumentsTab;