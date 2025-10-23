// components/dashboard/dashDoc/DocHeader.js
import { useState } from 'react';
import SearchInput from '../../SearchInput';
import FileUploadModal from './FileUploadModal';
import { Plus } from 'lucide-react';

const DocHeader = ({ searchTerm, setSearchTerm, onDocumentAdd }) => {
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

    const handleUploadSuccess = (data) => {
        console.log('업로드 성공! 부모 컴포넌트로 데이터 전달:', data);
        onDocumentAdd(data);
    };
    return (
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
            <div className="w-full md:flex-grow">
                <SearchInput searchTerm={searchTerm} setSearchTerm={setSearchTerm} placeholder="제목으로 검색..." className="w-full" />
            </div>
            <div className="flex w-full md:w-auto">
                <button
                    onClick={() => setIsUploadModalOpen(true)}
                    className="flex flex-grow items-center justify-center gap-3 bg-gradient-to-r from-indigo-500 to-violet-600 md:min-w-[200px]
                   text-white font-semibold text-base sm:text-lg px-6 py-3 rounded-xl shadow-lg
                   hover:from-indigo-600 hover:to-violet-700 hover:shadow-2xl
                   transition-all transform hover:-translate-y-1
                   focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    <Plus size={20} className="-ml-1 mr-1.5" />새 문서 등록
                </button>
            </div>

            <FileUploadModal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} onUploadSuccess={handleUploadSuccess} />
        </div>
    );
};

export default DocHeader;
