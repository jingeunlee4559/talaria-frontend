import React, { useState, useEffect, useMemo, useContext } from 'react';
import { Plus, Inbox, Video, VideoOff } from 'lucide-react';
import FilterTabs from '../../components/dashboard/dashvideo/FilterTabs';
import MeetingCard from '../../components/dashboard/dashvideo/MeetingCard';
import NewMeetingModal from '../../components/dashboard/dashvideo/NewMeetingModal';
import Swal from 'sweetalert2';
import { AnimatePresence } from 'framer-motion';
import InProgressMeetingCard from '../../components/dashboard/dashvideo/InProgressMeetingCard';
import { motion } from 'framer-motion';
import Pagination from '../../components/Pagination';
import { v4 as uuidv4 } from 'uuid';
import DocumentListModal from '../../components/dashboard/dashvideo/DocumentListModal';
import { UserContext } from '../../contexts/UserContext';
import axios from '../../axios';

const mockMeetings = [
    { id: 1, title: '10월 2주차 주간 보고 회의', status: '진행중', participants: 3, date: '2025년 10월 2일', time: '오후 2:00', invited_ids: ['user1', 'user2'] },
    { id: 2, title: '신규 프로젝트 기획 회의', status: '예정', participants: 2, date: '2025년 10월 2일', time: '오후 4:00', invited_ids: ['dev_team_lead'] },
    { id: 3, title: '디자인 시스템 리뷰 및 피드백', status: '예정', participants: 4, date: '2025년 10월 3일', time: '오전 10:00', invited_ids: ['designer_jane', 'pm_chris', 'dev_alex'] },
    { id: 4, title: '월간 마케팅 전략 회의', status: '예정', participants: 5, date: '2025년 10월 4일', time: '오전 11:00', invited_ids: ['marketer1', 'marketer2', 'sales_rep', 'manager_kim'] },
    { id: 5, title: '사용자 인터뷰 결과 공유', status: '예정', participants: 5, date: '2025년 10월 4일', time: '오후 3:00', invited_ids: ['ux_researcher', 'product_owner', 'designer_jane'] },
    { id: 6, title: '3분기 OKR 최종 리뷰', status: '종료', participants: 5, date: '2025년 9월 28일', time: '오전 11:00', invited_ids: ['ceo', 'cto', 'cfo', 'manager_kim'] },
    { id: 7, title: '서버 아키텍처 개선 논의', status: '예정', participants: 4, date: '2025년 10월 5일', time: '오후 1:00', invited_ids: ['backend_dev1', 'backend_dev2', 'devops_engineer'] },
    { id: 8, title: 'QA팀 테스트 결과 브리핑', status: '종료', participants: 6, date: '2025년 9월 30일', time: '오후 4:00', invited_ids: ['qa_lead', 'dev_team_lead', 'pm_chris'] },
    { id: 9, title: '연말 프로모션 아이디어 회의', status: '예정', participants: 7, date: '2025년 10월 6일', time: '오전 10:30', invited_ids: ['marketer1', 'designer_jane', 'sales_rep'] },
];

// const DUMMY_MY_DOCS = [
//     { id: 'm-01', name: '1분기 실적 보고서_v3_최종.docx', date: '2025-10-22' },
//     { id: 'm-02', name: '신규 프로젝트 제안서 (코드명: 아폴로).pdf', date: '2025-10-21' },
//     { id: 'm-03', name: '사용자 피드백 분석 및 개선 방안.pptx', date: '2025-10-20' },
//     { id: 'm-04', name: '마케팅 캠페인 A/B 테스트 결과.xlsx', date: '2025-10-19' },
//     { id: 'm-05', name: '2026년 사업 계획 초안.docx', date: '2025-10-18' },
//     { id: 'm-06', name: '경쟁사 분석 자료.pdf', date: '2025-10-17' },
// ];

const DUMMY_ROOM_DOCS = [
    { id: 'r-01', name: '회의록 (2025-10-15).docx', date: '2025-10-15' },
    { id: 'r-02', name: '디자인 시안_v2.pdf', date: '2025-10-14' },
    { id: 'r-03', name: '개발 일정 공유.xlsx', date: '2025-10-13' },
];

const DashVideoPage = () => {
    // --- States ---
    const [meetings, setMeetings] = useState(mockMeetings);
    const [activeFilter, setActiveFilter] = useState('전체');
    const [currentPage, setCurrentPage] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMeeting, setEditingMeeting] = useState(null);
    const [isDocModalOpen, setIsDocModalOpen] = useState(false);
    const [selectedMeetingDocs, setSelectedMeetingDocs] = useState([]);
    const [savedDocs, setSavedDocs] = useState([]);
    const [documents, setDocuments] = useState([]);

    const filters = ['전체', '진행중', '예정', '준비', '종료'];
    const MEETINGS_PER_PAGE = 6;

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

    console.log(documents, 'sdfdsfs');

    // --- Memos & Effects ---
    const inProgressMeetings = useMemo(() => (activeFilter === '전체' || activeFilter === '진행중' ? meetings.filter((m) => m.status === '진행중') : []), [meetings, activeFilter]);

    const upcomingMeetings = useMemo(() => {
        let otherMeetings;
        if (activeFilter === '전체') {
            otherMeetings = meetings.filter((m) => m.status !== '진행중');
        } else if (activeFilter === '진행중') {
            otherMeetings = [];
        } else {
            otherMeetings = meetings.filter((m) => m.status === activeFilter);
        }
        return otherMeetings.sort((a, b) => b.id - a.id);
    }, [meetings, activeFilter]);

    const paginatedUpcomingMeetings = useMemo(() => {
        const firstPageIndex = (currentPage - 1) * MEETINGS_PER_PAGE;
        const lastPageIndex = firstPageIndex + MEETINGS_PER_PAGE;
        return upcomingMeetings.slice(firstPageIndex, lastPageIndex);
    }, [currentPage, upcomingMeetings]);

    const totalPages = Math.ceil(upcomingMeetings.length / MEETINGS_PER_PAGE);

    useEffect(() => {
        setCurrentPage(1);
    }, [activeFilter]);

    // --- 핸들러 함수들 ---
    const handlePageChange = (page) => {
        setCurrentPage(page);
        window.scrollTo(0, 0);
    };

    const handleJoinMeeting = (meetingId, meetingTitle) => {
        const uniqueUUID = uuidv4();
        const url = new URL('/meeting', window.location.origin);
        url.searchParams.set('id', meetingId);
        url.searchParams.set('title', meetingTitle);
        url.searchParams.set('uuid', uniqueUUID);
        window.open(url.toString(), '_blank', 'noopener,noreferrer');
    };

    const handleOpenNewMeetingModal = () => {
        setEditingMeeting(null);
        setIsModalOpen(true);
    };

    const handleOpenEditMeetingModal = (meeting) => {
        setEditingMeeting(meeting);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setTimeout(() => setEditingMeeting(null), 300);
    };

    const handleConfirmMeeting = (meetingData) => {
        const isEditing = editingMeeting !== null;
        if (isEditing) {
            setMeetings((prev) => prev.map((m) => (m.id === meetingData.id ? meetingData : m)));
        } else {
            // 새 미팅에 ID 부여 (mock data이므로)
            setMeetings((prev) => [{ ...meetingData, id: Date.now() }, ...prev]);
        }
        handleCloseModal();

        Swal.fire({
            icon: 'success',
            title: isEditing ? '수정 완료!' : '예약 완료!',
            text: `'${meetingData.title}' 회의 정보가 저장되었습니다.`,
            timer: 2000,
            showConfirmButton: false,
            timerProgressBar: true,
        });
    };

    const handleDeleteMeeting = (meetingId, meetingTitle) => {
        Swal.fire({
            title: '정말 삭제하시겠습니까?',
            text: `'${meetingTitle}' 회의를 삭제하면 되돌릴 수 없습니다.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#e53e3e',
            cancelButtonColor: '#3b82f6',
            confirmButtonText: '삭제',
            cancelButtonText: '취소',
        }).then((result) => {
            if (result.isConfirmed) {
                setMeetings((prev) => prev.filter((m) => m.id !== meetingId));
                Swal.fire('삭제 완료!', '회의가 성공적으로 삭제되었습니다.', 'success');
            }
        });
    };

    const handleOpenDocuments = (meeting) => {
        const meetingDocs = meeting.docs || []; // docs 없을 때 빈 배열 처리
        setSelectedMeetingDocs(meetingDocs);
        setIsDocModalOpen(true);
    };

    // const handleDownloadSelected = (selectedDocs) => {
    //     console.log('다운로드할 문서:', selectedDocs);
    //     Swal.fire({
    //         icon: 'success',
    //         title: '다운로드 완료',
    //         text: `${selectedDocs.length}개의 문서가 다운로드되었습니다.`,
    //         timer: 1500,
    //         showConfirmButton: false,
    //     });
    // };

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-10">
            <div className="max-w-8xl mx-auto">
                <header className="mb-8">
                    <div>
                        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">영상회의</h1>
                        <p className="text-gray-500 mt-1 text-base sm:text-lg">예정된 회의를 확인하고 새로운 회의를 시작하세요.</p>
                    </div>
                </header>

                <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
                    <div className="w-full md:w-auto">
                        <FilterTabs filters={filters} activeFilter={activeFilter} setActiveFilter={setActiveFilter} />
                    </div>

                    <button
                        onClick={handleOpenNewMeetingModal}
                        className="flex-shrink-0 flex items-center justify-center gap-2 w-full md:w-auto px-6 py-3 rounded-lg text-white font-semibold shadow-lg 
                                   bg-gradient-to-r from-violet-600 to-indigo-600 
                                   hover:from-violet-700 hover:to-indigo-700
                                   transform hover:-translate-y-0.5 transition-all duration-300 ease-in-out"
                    >
                        <Plus className="h-5 w-5" />
                        <span>새 회의 만들기</span>
                    </button>
                </div>

                {inProgressMeetings.length > 0 && (
                    <section className="mb-10">
                        <h2 className="text-2xl font-bold text-gray-800 tracking-tight mb-4">진행중인 회의</h2>
                        <div className="space-y-4">
                            <AnimatePresence>
                                {inProgressMeetings.map((meeting) => (
                                    <InProgressMeetingCard key={meeting.id} meeting={meeting} onJoinMeeting={handleJoinMeeting} />
                                ))}
                            </AnimatePresence>
                        </div>
                    </section>
                )}

                <section>
                    {activeFilter === '전체' && upcomingMeetings.length > 0 && <h2 className="text-2xl font-bold text-gray-800 tracking-tight mb-6">예약된 회의</h2>}
                    {activeFilter !== '전체' && activeFilter !== '진행중' && upcomingMeetings.length > 0 && (
                        <h2 className="text-2xl font-bold text-gray-800 tracking-tight mb-6">'{activeFilter}' 회의</h2>
                    )}

                    <AnimatePresence>
                        {paginatedUpcomingMeetings.length > 0 ? (
                            <motion.main
                                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                                initial="hidden"
                                animate="visible"
                                variants={{
                                    visible: { transition: { staggerChildren: 0.05 } },
                                }}
                            >
                                {paginatedUpcomingMeetings.map((meeting) => (
                                    <motion.div
                                        key={meeting.id}
                                        variants={{
                                            hidden: { y: 20, opacity: 0 },
                                            visible: { y: 0, opacity: 1 },
                                        }}
                                        exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                                        transition={{ duration: 0.3 }}
                                        layout
                                    >
                                        <MeetingCard
                                            {...meeting}
                                            onJoinMeeting={() => handleJoinMeeting(meeting.id, meeting.title)}
                                            onEdit={() => handleOpenEditMeetingModal(meeting)}
                                            onDelete={() => handleDeleteMeeting(meeting.id, meeting.title)}
                                            onOpenDocuments={() => handleOpenDocuments(meeting)}
                                        />
                                    </motion.div>
                                ))}
                            </motion.main>
                        ) : (
                            activeFilter !== '진행중' &&
                            paginatedUpcomingMeetings.length === 0 && (
                                <motion.div
                                    key="empty-state"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="col-span-1 sm:col-span-2 lg:col-span-3 flex flex-col items-center justify-center 
                   py-24 px-6 bg-white rounded-xl border-2 border-dashed border-gray-300 text-center"
                                >
                                    <VideoOff className="w-16 h-16 text-gray-400" />
                                    <h3 className="mt-6 text-xl font-semibold text-gray-800">회의가 없습니다</h3>
                                    <p className="mt-2 text-gray-500 max-w-sm">
                                        {activeFilter === '전체' ? '"새 회의 만들기" 버튼을 눌러 첫 회의를 예약해보세요.' : `현재 "${activeFilter}" 상태인 회의가 없습니다. 다른 필터를 확인해보세요.`}
                                    </p>
                                </motion.div>
                            )
                        )}
                    </AnimatePresence>
                </section>

                {totalPages > 1 && (
                    <div className="mt-12 flex justify-center">
                        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
                    </div>
                )}
            </div>

            <NewMeetingModal isOpen={isModalOpen} onClose={handleCloseModal} onConfirm={handleConfirmMeeting} meetingToEdit={editingMeeting} />
            <DocumentListModal
                isOpen={isDocModalOpen}
                onClose={() => setIsDocModalOpen(false)}
                documents={selectedMeetingDocs}
                myDocuments={documents}
                roomDocuments={DUMMY_ROOM_DOCS}
                initialSelectedDocs={savedDocs}
                onSaveSelected={(selected) => setSavedDocs(selected)}
                onDownloadSelected={(selectedDocs) => console.log('다운로드 대상:', selectedDocs)}
            />
        </div>
    );
};

export default DashVideoPage;
