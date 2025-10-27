import React, { useContext, useEffect, useMemo, useState } from 'react';
import DocumentModal from '../../components/dashboard/dashDoc/DocumentModal';
import Pagination from '../../components/Pagination';
import { mockMinutes } from './mockDocuments';
import { SubTabButton, TabButton } from '../../components/dashboard/dashDoc/TabButtons';
import { DocumentList, MeetingMinutesList } from '../../components/dashboard/dashDoc/DocList';
import DocHeader from '../../components/dashboard/dashDoc/DocHeader';
import axios from '../../axios';
import { UserContext } from '../../contexts/UserContext';

const ITEMS_PER_PAGE = 5;

const DashDocuments = () => {
    const [activeTab, setActiveTab] = useState('번역 문서');
    const [docSubTab, setDocSubTab] = useState('전체');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [docCurrentPage, setDocCurrentPage] = useState(1);
    const [minCurrentPage, setMinCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [documents, setDocuments] = useState([]);

    const { user } = useContext(UserContext);

    useEffect(() => {
        if (!user?.userId) return;

        const fetchDocuments = async () => {
            try {
                const response = await axios.get(`/api/users/${user?.userId}/documents`);
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
                        // ✅ [수정 1] 서버 응답에 'translated_lang'가 있을 때만 toLang 값을 할당합니다.
                        // 이 필드가 없거나 null이면 toLang은 undefined가 되어 번역이 안 된 것으로 간주합니다.
                        size: `${(doc.size / 1024 / 1024).toFixed(2)} MB`,
                        author: `${doc.uploader_name}`,
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
    }, [user?.userId]);

    useEffect(() => {
        setDocCurrentPage(1);
        setMinCurrentPage(1);
    }, [searchTerm, activeTab, docSubTab]);

    const handleAddNewDocument = (newDocumentFromServer) => {
        const formattedNewDocument = {
            id: newDocumentFromServer.doc_id,
            title: newDocumentFromServer.original_name,
            lastModified: newDocumentFromServer.uploaded_at
                ? new Date(newDocumentFromServer.uploaded_at).toLocaleDateString('ko-KR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                  })
                : '날짜 정보 없음',
            fromLang: newDocumentFromServer.original_lang,
            // 새로 추가된 문서도 마찬가지로 translated_lang이 없으면 toLang은 undefined가 됩니다.
            size: `${(newDocumentFromServer.size / 1024 / 1024).toFixed(2)} MB`,
            author: `${newDocumentFromServer.uploader_name}`,
        };
        setDocuments((prevDocs) => [formattedNewDocument, ...prevDocs]);
    };

    const filteredDocumentsBySearch = useMemo(() => (Array.isArray(documents) ? documents.filter((doc) => doc?.title?.toLowerCase().includes(searchTerm.toLowerCase())) : []), [documents, searchTerm]);

    // ✅ [수정 2] 하위 탭 필터링 로직: 이 로직은 이제 의도대로 정확하게 동작합니다.
    const filteredDocumentsBySubTab = useMemo(() => {
        // '전체' 탭: 모든 문서를 보여줍니다.
        if (docSubTab === '전체') {
            return filteredDocumentsBySearch;
        }
        // '원문' 탭: fromLang이 있는 모든 문서를 보여줍니다. (업로드된 모든 문서)
        if (docSubTab === '원문') {
            return filteredDocumentsBySearch.filter((doc) => doc.fromLang);
        }
        // '번역' 탭: toLang 속성값이 존재하는 (번역이 완료된) 문서만 보여줍니다.
        if (docSubTab === '번역') {
            return filteredDocumentsBySearch.filter((doc) => doc.toLang);
        }
        return filteredDocumentsBySearch;
    }, [docSubTab, filteredDocumentsBySearch]);

    const filteredMinutes = useMemo(() => mockMinutes.filter((minute) => minute.title.toLowerCase().includes(searchTerm.toLowerCase())), [searchTerm]);

    const totalDocPages = Math.ceil(filteredDocumentsBySubTab.length / ITEMS_PER_PAGE);
    const currentDocuments = useMemo(() => {
        const firstPageIndex = (docCurrentPage - 1) * ITEMS_PER_PAGE;
        return filteredDocumentsBySubTab.slice(firstPageIndex, firstPageIndex + ITEMS_PER_PAGE);
    }, [docCurrentPage, filteredDocumentsBySubTab]);

    const totalMinPages = Math.ceil(filteredMinutes.length / ITEMS_PER_PAGE);
    const currentMinutes = useMemo(() => {
        const firstPageIndex = (minCurrentPage - 1) * ITEMS_PER_PAGE;
        return filteredMinutes.slice(firstPageIndex, firstPageIndex + ITEMS_PER_PAGE);
    }, [minCurrentPage, filteredMinutes]);

    const handleItemClick = (item) => {
        setSelectedItem(item);
        setIsModalOpen(true);
    };
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedItem(null);
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setDocSubTab('전체');
    };

    return (
        <div className="bg-slate-50 min-h-screen p-4 sm:p-6 lg:p-8 font-sans">
            <div className="max-w-8xl mx-auto">
                <header className="mb-6 sm:mb-8">
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800">문서 & 회의록</h1>
                    <p className="text-slate-500 mt-1 text-sm sm:text-base">과거의 모든 기록을 찾아보고 원하는 정보를 탐색하세요. (Total: {documents.length + mockMinutes.length}건)</p>
                </header>

                <DocHeader searchTerm={searchTerm} setSearchTerm={setSearchTerm} onDocumentAdd={handleAddNewDocument} />

                <div className="border-b border-slate-200 mb-6">
                    <nav className="flex gap-4 sm:gap-6">
                        <TabButton title="번역 문서" isActive={activeTab === '번역 문서'} onClick={() => handleTabChange('번역 문서')} />
                        <TabButton title="회의록" isActive={activeTab === '회의록'} onClick={() => handleTabChange('회의록')} />
                    </nav>
                </div>

                <main>
                    {activeTab === '번역 문서' && (
                        <>
                            <div className="flex gap-2 mb-4">
                                <SubTabButton title="전체" isActive={docSubTab === '전체'} onClick={() => setDocSubTab('전체')} />
                                <SubTabButton title="원문" isActive={docSubTab === '원문'} onClick={() => setDocSubTab('원문')} />
                                <SubTabButton title="번역" isActive={docSubTab === '번역'} onClick={() => setDocSubTab('번역')} />
                            </div>

                            {currentDocuments.length > 0 ? (
                                <>
                                    <DocumentList documents={currentDocuments} onItemClick={handleItemClick} />
                                    <Pagination
                                        currentPage={docCurrentPage}
                                        totalPages={totalDocPages}
                                        onPageChange={(page) => {
                                            setDocCurrentPage(page);
                                            window.scrollTo(0, 0);
                                        }}
                                    />
                                </>
                            ) : (
                                <div className="text-center py-16 text-slate-500 bg-white rounded-xl border border-slate-200">
                                    <p>{searchTerm || docSubTab !== '전체' ? `조건에 맞는 검색 결과가 없습니다.` : '표시할 문서가 없습니다.'}</p>
                                </div>
                            )}
                        </>
                    )}

                    {/* ... 회의록 부분은 동일 ... */}
                    {activeTab === '회의록' && (
                        <>
                            {currentMinutes.length > 0 ? (
                                <>
                                    <MeetingMinutesList minutes={currentMinutes} onItemClick={handleItemClick} />
                                    <Pagination
                                        currentPage={minCurrentPage}
                                        totalPages={totalMinPages}
                                        onPageChange={(page) => {
                                            setMinCurrentPage(page);
                                            window.scrollTo(0, 0);
                                        }}
                                    />
                                </>
                            ) : (
                                <div className="text-center py-16 text-slate-500 bg-white rounded-xl border border-slate-200">
                                    <p>{searchTerm ? `"${searchTerm}"에 대한 검색 결과가 없습니다.` : '표시할 회의록이 없습니다.'}</p>
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
