import { useState } from 'react';
import SearchInput from '../../SearchInput';
import FileUploadModal from './FileUploadModal';
import { Plus, Trash2 } from 'lucide-react';

const DocHeader = ({ searchTerm, setSearchTerm, onDocumentAdd, onDeleteSelected }) => {
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

    const handleUploadSuccess = (data) => {
        onDocumentAdd(data);
    };

    return (
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
            <div className="w-full md:flex-grow">
                <SearchInput searchTerm={searchTerm} setSearchTerm={setSearchTerm} placeholder="제목으로 검색..." className="w-full" />
            </div>

            <div className="flex gap-2 w-full md:w-auto">
                {/* ✅ 문서 삭제 버튼 */}
                <button
                    onClick={onDeleteSelected}
                    // 👇 이 부분에 whitespace-nowrap을 추가했습니다.
                    className="flex flex-grow items-center justify-center gap-2 whitespace-nowrap bg-red-100 hover:bg-red-200 text-red-600 font-semibold px-4 py-3 rounded-xl shadow-md transition"
                >
                    <Trash2 size={18} /> 삭제
                </button>

                {/* ✅ 문서 등록 버튼 */}
                <button
                    onClick={() => setIsUploadModalOpen(true)}
                    className="flex flex-grow items-center justify-center gap-3 bg-gradient-to-r from-indigo-500 to-violet-600 md:min-w-[200px]
                     text-white font-semibold text-base sm:text-lg px-6 py-3 rounded-xl shadow-lg
                     hover:from-indigo-600 hover:to-violet-700 hover:shadow-2xl
                     transition-all transform hover:-translate-y-1
                     focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    <Plus size={20} className="-ml-1 mr-1.5" /> 새 문서 등록
                </button>
            </div>

            <FileUploadModal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} onUploadSuccess={handleUploadSuccess} />
        </div>
    );
};

export default DocHeader;
