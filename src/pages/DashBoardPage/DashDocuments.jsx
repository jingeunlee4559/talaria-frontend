import React, { useContext, useEffect, useMemo, useState } from 'react';
import DocumentModal from '../../components/dashboard/dashDoc/DocumentModal';
import Pagination from '../../components/Pagination';
import { mockMinutes } from './mockDocuments';
import { SubTabButton, TabButton } from '../../components/dashboard/dashDoc/TabButtons';
import { DocumentList, MeetingMinutesList } from '../../components/dashboard/dashDoc/DocList';
import DocHeader from '../../components/dashboard/dashDoc/DocHeader';
import api from '../../axios';
import { UserContext } from '../../contexts/UserContext';
import Swal from 'sweetalert2';

const ITEMS_PER_PAGE = 5;

const DashDocuments = () => {
    const [activeTab, setActiveTab] = useState('번역 문서'); // 상위 탭: 번역 문서 / 회의록
    const [docSubTab, setDocSubTab] = useState('전체'); // 하위 탭: 전체 / 원문 / 번역
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [origDocuments, setOrigDocuments] = useState([]); // tl_documents
    const [transDocuments, setTransDocuments] = useState([]); // tl_trans_docs
    const [selectedDocs, setSelectedDocs] = useState([]);
    const [loading, setLoading] = useState(false);

    // 페이지네이션
    const [docCurrentPage, setDocCurrentPage] = useState(1);
    const [minCurrentPage, setMinCurrentPage] = useState(1);

    const { user, loading: userLoading } = useContext(UserContext);

    // ===== Fetch: 원문 문서 =====
    useEffect(() => {
        if (userLoading || !user?.userId) return;

        const fetchOriginals = async () => {
            try {
                const res = await api.get(`/api/users/${user.userId}/documents`);
                const items = Array.isArray(res.data?.items) ? res.data.items : [];

                const formatted = items.map((doc) => {
                    const sizeMB = (doc.size ?? 0) / 1024 / 1024;
                    return {
                        type: 'original',
                        id: `orig-${doc.doc_id}`,
                        doc_id: doc.doc_id,
                        title: doc.original_name || '(제목 없음)',
                        lastModified: doc.uploaded_at ? new Date(doc.uploaded_at).toLocaleString('ko-KR') : '날짜 정보 없음',
                        fromLang: doc.original_lang,
                        size: `${sizeMB.toFixed(2)} MB`,
                        size_bytes: doc.size ?? 0,
                        author: doc.uploader_name,
                        filepath: doc.filepath,
                        rel_path: doc.filepath, // 서버가 rel_path로도 인식한다면 유지
                        downloadUrl: `/api/users/${user.userId}/documents/${doc.doc_id}/download`,
                        use_context_rag: !!doc.use_context_rag,
                    };
                });

                setOrigDocuments(formatted);
            } catch (err) {
                console.error('원문 문서 불러오기 오류:', err);
                Swal.fire({
                    icon: 'error',
                    title: '문서 불러오기 실패',
                    text: '원문 문서를 불러오는 중 오류가 발생했습니다.',
                });
                setOrigDocuments([]);
            }
        };

        fetchOriginals();
    }, [user, userLoading]);

    // ===== Fetch: 번역 문서 =====
    useEffect(() => {
        if (userLoading || !user?.userId) return;

        const fetchTranslated = async () => {
            setLoading(true);
            try {
                const res = await api.get(`/api/users/${user.userId}/trans-docs/req`, {
                    params: { page: 0, size: 50 },
                });
                const items = Array.isArray(res.data?.items) ? res.data.items : [];

                // 원문 매핑(제목/언어 등 붙이기)
                const origById = new Map(origDocuments.map((o) => [o.doc_id, o]));

                const formatted = items.map((t) => {
                    const orig = origById.get(t.original_doc_id);
                    const baseTitle = orig?.title || `(원문:${t.original_doc_id})`;
                    const sizeMB = (t.size_bytes ?? 0) / 1024 / 1024;

                    return {
                        type: 'translated',
                        id: `trans-${t.request_id}`,
                        request_id: t.request_id,
                        original_doc_id: t.original_doc_id,

                        // ⬇️ 제목에 " · {lang} 번역" 제거 (원문 제목만)
                        title: baseTitle,

                        lastModified: t.translated_at ? new Date(t.translated_at).toLocaleString('ko-KR') : t.updated_at ? new Date(t.updated_at).toLocaleString('ko-KR') : '날짜 정보 없음',
                        target_language: t.target_language,
                        provider: t.provider,
                        size: `${sizeMB.toFixed(2)} MB`,
                        size_bytes: t.size_bytes ?? 0,
                        translated_rel_path: t.translated_rel_path,
                        downloadUrl: `/api/users/${user.userId}/trans-docs/req/${t.request_id}/download`,

                        // 서브텍스트용 보조 정보
                        author: orig?.author ?? '',
                        fromLang: orig?.fromLang ?? '', // ⬅️ 원문 언어
                        rel_path: t.translated_rel_path,
                        use_context_rag: null,
                    };
                });

                setTransDocuments(formatted);
            } catch (err) {
                console.error('번역 문서 불러오기 오류:', err);
                Swal.fire({
                    icon: 'error',
                    title: '문서 불러오기 실패',
                    text: '번역 문서를 불러오는 중 오류가 발생했습니다.',
                });
                setTransDocuments([]);
            } finally {
                setLoading(false);
            }
        };

        fetchTranslated();
        // 원문 변경 시(처음 로드 포함) 번역 매핑 재계산 필요
    }, [user, userLoading, origDocuments]);

    // ===== 새 원문 추가(업로드 성공 콜백) =====
    const handleDocumentAdd = (newDocumentData) => {
        const formattedNewDocument = {
            type: 'original',
            id: `orig-${newDocumentData.doc_id}`,
            doc_id: newDocumentData.doc_id,
            title: newDocumentData.original_name || '(제목 없음)',
            lastModified: new Date(newDocumentData.uploaded_at).toLocaleString('ko-KR'),
            fromLang: newDocumentData.original_lang,
            size: `${(newDocumentData.size / 1024 / 1024).toFixed(2)} MB`,
            size_bytes: newDocumentData.size ?? 0,
            author: newDocumentData.uploader_name,
            filepath: newDocumentData.filepath,
            rel_path: newDocumentData.filepath,
            downloadUrl: `/api/users/${user.userId}/documents/${newDocumentData.doc_id}/download`,
            use_context_rag: !!newDocumentData.use_context_rag,
        };
        setOrigDocuments((prev) => [formattedNewDocument, ...prev]);
    };

    // ===== 필터링 & 병합 =====
    const mergedBySubTab = useMemo(() => {
        const term = searchTerm.toLowerCase();

        const filterByTerm = (arr) => arr.filter((d) => (d?.title || '').toLowerCase().includes(term));

        if (docSubTab === '원문') return filterByTerm(origDocuments);
        if (docSubTab === '번역') return filterByTerm(transDocuments);
        return filterByTerm([...origDocuments, ...transDocuments]);
    }, [docSubTab, origDocuments, transDocuments, searchTerm]);

    // 최신순 정렬(날짜 문자열을 Date로 안전 변환)
    const sortedDocuments = useMemo(() => {
        return [...mergedBySubTab].sort((a, b) => {
            const da = new Date(a.lastModified).getTime() || 0;
            const db = new Date(b.lastModified).getTime() || 0;
            return db - da;
        });
    }, [mergedBySubTab]);

    const totalDocPages = Math.ceil(sortedDocuments.length / ITEMS_PER_PAGE);
    const currentDocuments = useMemo(() => {
        const startIndex = (docCurrentPage - 1) * ITEMS_PER_PAGE;
        return sortedDocuments.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [docCurrentPage, sortedDocuments]);

    // 회의록
    const filteredMinutes = useMemo(() => mockMinutes.filter((m) => m.title.toLowerCase().includes(searchTerm.toLowerCase())), [searchTerm]);
    const totalMinPages = Math.ceil(filteredMinutes.length / ITEMS_PER_PAGE);
    const currentMinutes = useMemo(() => {
        const startIndex = (minCurrentPage - 1) * ITEMS_PER_PAGE;
        return filteredMinutes.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [minCurrentPage, filteredMinutes]);

    // 선택 토글
    const handleSelectDoc = (id) => {
        setSelectedDocs((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    };

    const handleSelectAll = () => {
        if (selectedDocs.length === currentDocuments.length && currentDocuments.length > 0) {
            setSelectedDocs([]);
        } else {
            setSelectedDocs(currentDocuments.map((doc) => doc.id));
        }
    };

    // 삭제(원문만 지원, 번역 문서는 서버 정책에 따라 별도 API 필요시 분기)
    const handleDeleteSelected = async () => {
        if (selectedDocs.length === 0) {
            Swal.fire({ icon: 'warning', title: '선택된 문서가 없습니다', text: '삭제할 문서를 먼저 선택해주세요.' });
            return;
        }

        // 현재 화면의 데이터 소스에서 선택된 항목 추출
        const allItems = [...origDocuments, ...transDocuments];
        const selectedItems = allItems.filter((d) => selectedDocs.includes(d.id));

        const originalsToDelete = selectedItems.filter((d) => d.type === 'original'); // orig-*
        const translationsToDelete = selectedItems.filter((d) => d.type === 'translated'); // trans-*

        if (originalsToDelete.length === 0 && translationsToDelete.length === 0) {
            Swal.fire({
                icon: 'info',
                title: '삭제할 수 있는 항목이 없습니다',
                text: '선택 항목을 다시 확인해주세요.',
            });
            return;
        }

        const totalCount = originalsToDelete.length + translationsToDelete.length;

        const ok = await Swal.fire({
            title: `총 ${totalCount}개의 항목을 삭제하시겠습니까?`,
            html: [originalsToDelete.length ? `원문 문서: <b>${originalsToDelete.length}</b>개` : null, translationsToDelete.length ? `번역 문서: <b>${translationsToDelete.length}</b>개` : null]
                .filter(Boolean)
                .join('<br/>'),
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: '네, 삭제할게요',
            cancelButtonText: '아니요',
        });

        if (!ok.isConfirmed) return;

        try {
            setLoading(true);

            // 원문 삭제 호출
            const delOriginals = originalsToDelete.length ? Promise.all(originalsToDelete.map((d) => api.delete(`/api/users/${user.userId}/documents/${d.doc_id}`))) : Promise.resolve();

            // 번역(요청) 삭제 호출
            const delTranslations = translationsToDelete.length
                ? Promise.all(
                      translationsToDelete.map((d) =>
                          // ⚠️ 서버가 '/req{requestId}' 형태를 요구한다면 아래 URL에서 '/' 제거
                          api.delete(`/api/users/${user.userId}/trans-docs/req/${d.request_id}`),
                      ),
                  )
                : Promise.resolve();

            await Promise.all([delOriginals, delTranslations]);

            // 상태 갱신: 삭제된 항목 제거
            const selectedSet = new Set(selectedDocs);
            setOrigDocuments((prev) => prev.filter((d) => !selectedSet.has(d.id)));
            setTransDocuments((prev) => prev.filter((d) => !selectedSet.has(d.id)));
            setSelectedDocs([]);

            Swal.fire('삭제 완료!', '선택한 항목이 삭제되었습니다.', 'success');
        } catch (e) {
            console.error(e);
            Swal.fire('오류 발생', '문서 삭제 중 문제가 발생했습니다.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleItemClick = (item) => {
        setSelectedItem({ ...item, userId: user.userId });
        setIsModalOpen(true);
    };
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedItem(null);
    };

    // RAG 상태 업데이트(원문만)
    const updateDocRag = (docId, val) => {
        setOrigDocuments((prev) => prev.map((d) => (d.id === docId ? { ...d, use_context_rag: val } : d)));
    };

    return (
        <div className="bg-slate-50 min-h-screen p-4 sm:p-6 lg:p-8 font-sans">
            <div className="max-w-8xl mx-auto">
                <header className="mb-6 sm:mb-8">
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800">문서 & 회의록</h1>
                    <p className="text-slate-500 mt-1 text-sm sm:text-base">
                        과거의 모든 기록을 찾아보고 원하는 정보를 탐색하세요. (Total: {origDocuments.length + transDocuments.length + mockMinutes.length}건)
                    </p>
                </header>

                <DocHeader searchTerm={searchTerm} setSearchTerm={setSearchTerm} onDocumentAdd={handleDocumentAdd} onDeleteSelected={handleDeleteSelected} />

                <div className="border-b border-slate-200 mb-6">
                    <nav className="flex gap-4 sm:gap-6">
                        <TabButton
                            title="번역 문서"
                            isActive={activeTab === '번역 문서'}
                            onClick={() => {
                                setActiveTab('번역 문서');
                                setMinCurrentPage(1);
                            }}
                        />
                        <TabButton
                            title="회의록"
                            isActive={activeTab === '회의록'}
                            onClick={() => {
                                setActiveTab('회의록');
                                setDocCurrentPage(1);
                            }}
                        />
                    </nav>
                </div>

                <main>
                    {activeTab === '번역 문서' && (
                        <>
                            <div className="flex items-center gap-2 mb-4">
                                <SubTabButton
                                    title="전체"
                                    isActive={docSubTab === '전체'}
                                    onClick={() => {
                                        setDocSubTab('전체');
                                        setDocCurrentPage(1);
                                    }}
                                />
                                <SubTabButton
                                    title="원문"
                                    isActive={docSubTab === '원문'}
                                    onClick={() => {
                                        setDocSubTab('원문');
                                        setDocCurrentPage(1);
                                    }}
                                />
                                <SubTabButton
                                    title="번역"
                                    isActive={docSubTab === '번역'}
                                    onClick={() => {
                                        setDocSubTab('번역');
                                        setDocCurrentPage(1);
                                    }}
                                />
                                <button onClick={handleSelectAll} className="ml-auto text-sm text-slate-500 hover:text-slate-700 transition">
                                    {selectedDocs.length === currentDocuments.length && currentDocuments.length > 0 ? '전체 해제' : '전체 선택'}
                                </button>
                            </div>

                            {loading ? (
                                <div className="text-center py-16 text-slate-500 bg-white rounded-xl border border-slate-200">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                                    <p>문서를 불러오는 중...</p>
                                </div>
                            ) : currentDocuments.length > 0 ? (
                                <>
                                    <DocumentList
                                        userId={user.userId}
                                        documents={currentDocuments}
                                        onItemClick={handleItemClick}
                                        onSelect={handleSelectDoc}
                                        selectedDocs={selectedDocs}
                                        onRagChange={updateDocRag}
                                    />
                                    <Pagination
                                        currentPage={docCurrentPage}
                                        totalPages={totalDocPages}
                                        onPageChange={(page) => {
                                            setDocCurrentPage(page);
                                            window.scrollTo({ top: 0, behavior: 'smooth' });
                                        }}
                                    />
                                </>
                            ) : (
                                <div className="text-center py-16 text-slate-500 bg-white rounded-xl border border-slate-200">
                                    <p>{searchTerm ? `"${searchTerm}"에 대한 검색 결과가 없습니다.` : '표시할 문서가 없습니다.'}</p>
                                </div>
                            )}
                        </>
                    )}

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
