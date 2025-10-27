import React, { useContext, useEffect, useMemo, useState } from 'react';
import DocumentModal from '../../components/dashboard/dashDoc/DocumentModal';
import Pagination from '../../components/Pagination';
import { mockMinutes } from './mockDocuments';
import { SubTabButton, TabButton } from '../../components/dashboard/dashDoc/TabButtons';
import { DocumentList, MeetingMinutesList } from '../../components/dashboard/dashDoc/DocList';
import DocHeader from '../../components/dashboard/dashDoc/DocHeader';
import axios from '../../axios';
import { UserContext } from '../../contexts/UserContext';
import Swal from 'sweetalert2';

const ITEMS_PER_PAGE = 5;

const DashDocuments = () => {
    const [activeTab, setActiveTab] = useState('번역 문서');
    const [docSubTab, setDocSubTab] = useState('전체');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [docCurrentPage, setDocCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [documents, setDocuments] = useState([]);
    const [selectedDocs, setSelectedDocs] = useState([]); // ✅ 선택된 문서 ID 관리

    const { user, loading } = useContext(UserContext);

    // ✅ 문서 데이터 불러오기
    useEffect(() => {
        if (loading || !user?.userId) return;

        const fetchDocuments = async () => {
            try {
                const response = await axios.get(`/api/users/${user.userId}/documents`);
                if (response.data && Array.isArray(response.data.items)) {
                    const formattedDocuments = response.data.items.map((doc) => ({
                        id: doc.doc_id,
                        title: doc.original_name,
                        lastModified: doc.uploaded_at
                            ? new Date(doc.uploaded_at).toLocaleDateString('ko-KR', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                              })
                            : '날짜 정보 없음',
                        fromLang: doc.original_lang,
                        toLang: doc.translated_lang,
                        size: `${(doc.size / 1024 / 1024).toFixed(2)} MB`,
                        author: doc.uploader_name,
                        filepath: doc.filepath,
                    }));
                    setDocuments(formattedDocuments);
                } else {
                    setDocuments([]);
                }
            } catch (error) {
                console.error('문서 불러오기 오류:', error);
                setDocuments([]);
            }
        };

        fetchDocuments();
    }, [user, loading]);

    const handleDocumentAdd = (newDocumentData) => {
        // 서버에서 받은 새 문서 데이터를 화면 형식에 맞게 가공합니다.
        const formattedNewDocument = {
            id: newDocumentData.doc_id,
            title: newDocumentData.original_name,
            lastModified: new Date(newDocumentData.uploaded_at).toLocaleDateString('ko-KR'),
            fromLang: newDocumentData.original_lang,
            size: `${(newDocumentData.size / 1024 / 1024).toFixed(2)} MB`,
            author: newDocumentData.uploader_name,
            filepath: newDocumentData.filepath,
        };

        // ✨ 2. 기존 문서 목록(state)의 맨 앞에 새로 추가된 문서를 더해줍니다.
        // 이렇게 하면 API를 다시 호출하지 않아도 화면이 즉시 갱신됩니다.
        setDocuments((prevDocuments) => [formattedNewDocument, ...prevDocuments]);
    };

    // ✅ 검색 필터링
    const filteredDocumentsBySearch = useMemo(() => (Array.isArray(documents) ? documents.filter((doc) => doc?.title?.toLowerCase().includes(searchTerm.toLowerCase())) : []), [documents, searchTerm]);

    // ✅ 서브탭 필터링
    const filteredDocumentsBySubTab = useMemo(() => {
        if (docSubTab === '전체') return filteredDocumentsBySearch;
        if (docSubTab === '원문') return filteredDocumentsBySearch.filter((doc) => doc.fromLang);
        if (docSubTab === '번역') return filteredDocumentsBySearch.filter((doc) => doc.toLang);
        return filteredDocumentsBySearch;
    }, [docSubTab, filteredDocumentsBySearch]);

    const totalDocPages = Math.ceil(filteredDocumentsBySubTab.length / ITEMS_PER_PAGE);
    const currentDocuments = useMemo(() => {
        const startIndex = (docCurrentPage - 1) * ITEMS_PER_PAGE;
        return filteredDocumentsBySubTab.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [docCurrentPage, filteredDocumentsBySubTab]);

    // ✅ 선택 토글
    const handleSelectDoc = (id) => {
        setSelectedDocs((prev) => (prev.includes(id) ? prev.filter((docId) => docId !== id) : [...prev, id]));
    };

    // ✅ 전체 선택
    const handleSelectAll = () => {
        if (selectedDocs.length === currentDocuments.length) {
            setSelectedDocs([]);
        } else {
            setSelectedDocs(currentDocuments.map((doc) => doc.id));
        }
    };

    // ✅ 삭제 처리
    const handleDeleteSelected = async () => {
        if (selectedDocs.length === 0) {
            Swal.fire({
                icon: 'warning',
                title: '선택된 문서가 없습니다',
                text: '삭제할 문서를 먼저 선택해주세요.',
            });
            return;
        }

        // 1. 삭제 여부 확인 (confirm)
        Swal.fire({
            title: `총 ${selectedDocs.length}개의 문서를 삭제하시겠습니까?`,
            text: '삭제된 문서는 다시 복구할 수 없습니다.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33', // 삭제 버튼 색상
            cancelButtonColor: '#3085d6', // 취소 버튼 색상
            confirmButtonText: '네, 삭제할게요',
            cancelButtonText: '아니요',
        }).then(async (result) => {
            // 2. 사용자가 '삭제' 버튼을 눌렀을 때만 실행
            if (result.isConfirmed) {
                try {
                    await Promise.all(selectedDocs.map((id) => axios.delete(`/api/users/${user.userId}/documents/${id}`)));

                    setDocuments((prev) => prev.filter((doc) => !selectedDocs.includes(doc.id)));
                    setSelectedDocs([]);

                    // 3. 성공 알림 (success)
                    Swal.fire('삭제 완료!', '선택한 문서가 성공적으로 삭제되었습니다.', 'success');
                } catch (error) {
                    console.error('문서 삭제 오류:', error);

                    // 4. 실패 알림 (error)
                    Swal.fire('오류 발생', '문서 삭제 중 문제가 발생했습니다.', 'error');
                }
            }
        });
    };

    const handleItemClick = (item) => {
        setSelectedItem(item);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedItem(null);
    };

    return (
        <div className="bg-slate-50 min-h-screen p-4 sm:p-6 lg:p-8 font-sans">
            <div className="max-w-8xl mx-auto">
                <header className="mb-6 sm:mb-8">
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800">문서 & 회의록</h1>
                    <p className="text-slate-500 mt-1 text-sm sm:text-base">과거의 모든 기록을 찾아보고 원하는 정보를 탐색하세요. (Total: {documents.length + mockMinutes.length}건)</p>
                </header>

                {/* ✅ DocHeader에 삭제 버튼 연결 */}
                <DocHeader searchTerm={searchTerm} setSearchTerm={setSearchTerm} onDocumentAdd={handleDocumentAdd} onDeleteSelected={handleDeleteSelected} />

                {/* ✅ 상단 탭 */}
                <div className="border-b border-slate-200 mb-6">
                    <nav className="flex gap-4 sm:gap-6">
                        <TabButton title="번역 문서" isActive={activeTab === '번역 문서'} onClick={() => setActiveTab('번역 문서')} />
                        <TabButton title="회의록" isActive={activeTab === '회의록'} onClick={() => setActiveTab('회의록')} />
                    </nav>
                </div>

                <main>
                    {activeTab === '번역 문서' && (
                        <>
                            <div className="flex items-center gap-2 mb-4">
                                <SubTabButton title="전체" isActive={docSubTab === '전체'} onClick={() => setDocSubTab('전체')} />
                                <SubTabButton title="원문" isActive={docSubTab === '원문'} onClick={() => setDocSubTab('원문')} />
                                <SubTabButton title="번역" isActive={docSubTab === '번역'} onClick={() => setDocSubTab('번역')} />
                                {/* ✅ 전체 선택 버튼 */}
                                <button onClick={handleSelectAll} className="ml-auto text-sm text-slate-500 hover:text-slate-700">
                                    {selectedDocs.length === currentDocuments.length ? '전체 해제' : '전체 선택'}
                                </button>
                            </div>

                            {currentDocuments.length > 0 ? (
                                <>
                                    <DocumentList documents={currentDocuments} onItemClick={handleItemClick} onSelect={handleSelectDoc} selectedDocs={selectedDocs} />
                                    <Pagination currentPage={docCurrentPage} totalPages={totalDocPages} onPageChange={(page) => setDocCurrentPage(page)} />
                                </>
                            ) : (
                                <div className="text-center py-16 text-slate-500 bg-white rounded-xl border border-slate-200">
                                    <p>표시할 문서가 없습니다.</p>
                                </div>
                            )}
                        </>
                    )}
                </main>
            </div>

            <DocumentModal isOpen={isModalOpen} onClose={handleCloseModal} itemData={selectedItem} />
        </div>
    );
};

export default DashDocuments;
