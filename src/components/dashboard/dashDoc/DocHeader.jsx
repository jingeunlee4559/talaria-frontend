import { useState } from 'react';
import FileUploadModal from './FileUploadModal';
// 👇 Search 아이콘을 import합니다.
import { Plus, Trash2, Search } from 'lucide-react';

const DocHeader = ({ searchTerm, setSearchTerm, onDocumentAdd, onDeleteSelected }) => {
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

    const handleUploadSuccess = (data) => {
        onDocumentAdd(data);
    };

    return (
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
            {/* ✅ 1. "세련된" 검색창 디자인 */}
            <div className="relative w-full md:flex-grow">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search className="text-slate-400" size={20} />
                </div>
                <input
                    type="text"
                    placeholder="제목으로 검색..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="
                        w-full pl-12 pr-4 py-3 
                        text-base text-slate-700 
                        bg-white border border-slate-200 
                        rounded-xl shadow-md 
                        transition-all duration-200
                        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:border-blue-500
                    "
                />
            </div>

            {/* --- 버튼 컨테이너 --- */}
            <div className="flex gap-3 w-full md:w-auto">
                {/* ✅ 2. 문서 삭제 버튼 (줄바꿈 방지) */}
                <button
                    onClick={onDeleteSelected}
                    className="
                        flex flex-shrink-0 items-center justify-center gap-2 whitespace-nowrap
                        bg-white text-red-600 font-semibold 
                        px-4 py-3 rounded-xl 
                        border border-red-200 shadow-md 
                        transition-all duration-200 
                        hover:bg-red-50 hover:shadow-lg hover:border-red-300
                        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500
                    "
                >
                    <Trash2 size={18} />
                    삭제
                </button>

                {/* ✅ 3. 문서 등록 버튼 (✨ "whitespace-nowrap" 추가!) */}
                <button
                    onClick={() => setIsUploadModalOpen(true)}
                    className="
                        flex flex-grow items-center justify-center gap-2 whitespace-nowrap 
                        bg-gradient-to-r from-blue-500 to-indigo-600 
                        text-white font-semibold text-base px-6 py-3 rounded-xl 
                        shadow-lg shadow-blue-500/40 
                        transition-all transform duration-300 ease-in-out
                        hover:shadow-xl hover:shadow-blue-400/50 hover:-translate-y-1
                        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                    "
                >
                    <Plus size={20} />새 문서 등록
                </button>
            </div>

            <FileUploadModal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} onUploadSuccess={handleUploadSuccess} />
        </div>
    );
};

export default DocHeader;
