import React, { useEffect, useMemo, useState } from 'react';
import DocumentModal from '../../components/dashboard/dashDoc/DocumentModal';
import Pagination from '../../components/Pagination';
import { documents as initialDocuments, mockMinutes } from './mockDocuments';
import { SubTabButton, TabButton } from '../../components/dashboard/dashDoc/TabButtons';
import { DocumentList, MeetingMinutesList } from '../../components/dashboard/dashDoc/DocList';
import DocHeader from '../../components/dashboard/dashDoc/DocHeader';

// --- 재사용 가능한 컴포넌트 ---
const ITEMS_PER_PAGE = 5;

// --- 메인 컴포넌트 ---
const DashDocuments = () => {
    const [activeTab, setActiveTab] = useState('번역 문서');
    const [docSubTab, setDocSubTab] = useState('전체'); // 🎯 새로운 하위 탭 상태
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [docCurrentPage, setDocCurrentPage] = useState(1);
    const [minCurrentPage, setMinCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [documents, setDocuments] = useState(initialDocuments);

    // 검색어나 탭이 바뀔 때 페이지네이션을 1로 리셋
    useEffect(() => {
        setDocCurrentPage(1);
        setMinCurrentPage(1);
    }, [searchTerm, activeTab, docSubTab]); // 🎯 docSubTab이 바뀔 때도 리셋

    const handleAddNewDocument = (uploadedData) => {
        const newDocument = {
            id: `doc_${Date.now()}`, // 고유 ID 생성
            title: uploadedData.fileName,
            summary: `새롭게 추가된 문서입니다: ${uploadedData.file.name}`,
            lastModified: new Date().toISOString().split('T')[0],
            // '원문'/'번역' 구분을 위한 속성 (필요에 따라 로직 추가)
            // 예시: 파일 이름에 'ko'가 있으면 원문으로 간주
            toLang: uploadedData.file.name.includes('_ko') ? '영어' : '한국어',
            date: new Date().toISOString().split('T')[0],
            size: '2.4 MB',
            author: '김철수',
        };

        // 기존 문서 목록의 맨 앞에 새 문서를 추가하여 즉시 보이게 함
        setDocuments((prevDocs) => [newDocument, ...prevDocs]);
    };

    // 1. 검색어 필터링
    const filteredDocumentsBySearch = useMemo(
        () => documents.filter((doc) => doc.title.toLowerCase().includes(searchTerm.toLowerCase())),
        [documents, searchTerm], // 👈 documents를 의존성 배열에 추가
    );

    // 2. 검색 결과에 하위 탭 필터링 적용
    const filteredDocumentsBySubTab = useMemo(() => {
        if (docSubTab === '전체') return filteredDocumentsBySearch;

        // 원문 (Original) 언어로 필터링
        if (docSubTab === '원문') {
            // 원문: 한국어 문서만 필터링 (toLang이 '영어'인 문서)
            return filteredDocumentsBySearch.filter((doc) => doc.toLang === '영어');
        }

        // 번역 (Translated) 언어로 필터링
        if (docSubTab === '번역') {
            // 번역: 한국어 문서만 필터링 (toLang이 '한국어'인 문서)
            return filteredDocumentsBySearch.filter((doc) => doc.toLang === '한국어');
        }

        return filteredDocumentsBySearch;
    }, [docSubTab, filteredDocumentsBySearch]);

    // 3. 회의록 검색 필터링
    const filteredMinutes = useMemo(() => mockMinutes.filter((minute) => minute.title.toLowerCase().includes(searchTerm.toLowerCase())), [searchTerm]);

    // 문서 페이지네이션 로직
    const totalDocPages = Math.ceil(filteredDocumentsBySubTab.length / ITEMS_PER_PAGE);
    const currentDocuments = useMemo(() => {
        const firstPageIndex = (docCurrentPage - 1) * ITEMS_PER_PAGE;
        return filteredDocumentsBySubTab.slice(firstPageIndex, firstPageIndex + ITEMS_PER_PAGE);
    }, [docCurrentPage, filteredDocumentsBySubTab]);

    // 회의록 페이지네이션 로직
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

    // 탭 클릭 핸들러: 메인 탭이 바뀌면 하위 탭도 '전체'로 리셋
    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setDocSubTab('전체');
    };

    return (
        <div className="bg-slate-50 min-h-screen p-4 sm:p-6 lg:p-8 font-sans">
            <div className="max-w-8xl mx-auto">
                {/* 헤더 */}
                <header className="mb-6 sm:mb-8">
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800">문서 & 회의록</h1>
                    <p className="text-slate-500 mt-1 text-sm sm:text-base">과거의 모든 기록을 찾아보고 원하는 정보를 탐색하세요. (Total: {documents.length + mockMinutes.length}건)</p>
                </header>

                <DocHeader
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    onDocumentAdd={handleAddNewDocument} // 👈 여기!
                />

                {/* 메인 탭 */}
                <div className="border-b border-slate-200 mb-6">
                    <nav className="flex gap-4 sm:gap-6">
                        <TabButton title="번역 문서" isActive={activeTab === '번역 문서'} onClick={() => handleTabChange('번역 문서')} />
                        <TabButton title="회의록" isActive={activeTab === '회의록'} onClick={() => handleTabChange('회의록')} />
                    </nav>
                </div>

                <main>
                    {activeTab === '번역 문서' && (
                        <>
                            {/* 🎯 번역 문서 하위 탭 */}
                            <div className="flex gap-2 mb-4">
                                <SubTabButton title="전체" isActive={docSubTab === '전체'} onClick={() => setDocSubTab('전체')} />
                                <SubTabButton title="원문" isActive={docSubTab === '번역'} onClick={() => setDocSubTab('번역')} />
                                <SubTabButton title="번역" isActive={docSubTab === '원문'} onClick={() => setDocSubTab('원문')} />
                            </div>

                            {/* 문서 목록 */}
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

                    {activeTab === '회의록' && (
                        <>
                            {/* 회의록 목록 */}
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
