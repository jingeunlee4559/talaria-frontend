import React, { useState, useEffect, useMemo, useContext } from 'react';
import { Plus, VideoOff } from 'lucide-react';
import FilterTabs from '../../components/dashboard/dashvideo/FilterTabs';
import MeetingCard from '../../components/dashboard/dashvideo/MeetingCard';
import NewMeetingModal from '../../components/dashboard/dashvideo/NewMeetingModal';
import Swal from 'sweetalert2';
import { AnimatePresence, motion } from 'framer-motion';
import InProgressMeetingCard from '../../components/dashboard/dashvideo/InProgressMeetingCard';
import Pagination from '../../components/Pagination';
import DocumentListModal from '../../components/dashboard/dashvideo/DocumentListModal';
import { UserContext } from '../../contexts/UserContext';
import axios from '../../axios';

const DUMMY_ROOM_DOCS = [
    { id: 'r-01', name: '회의록 (2025-10-15).docx', date: '2025-10-15' },
    { id: 'r-02', name: '디자인 시안_v2.pdf', date: '2025-10-14' },
    { id: 'r-03', name: '개발 일정 공유.xlsx', date: '2025-10-13' },
];

const DashVideoPage = () => {
    // --- States ---
    const [meetings, setMeetings] = useState([]);
    const [activeFilter, setActiveFilter] = useState('전체');
    const [currentPage, setCurrentPage] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMeeting, setEditingMeeting] = useState(null);
    const [isDocModalOpen, setIsDocModalOpen] = useState(false);
    const [selectedMeetingDocs, setSelectedMeetingDocs] = useState([]);
    const [savedDocs, setSavedDocs] = useState([]);
    const [documents, setDocuments] = useState([]);

    const filters = ['전체', '진행중', '예정', '종료'];
    const MEETINGS_PER_PAGE = 6;

    const { user } = useContext(UserContext);

    // --- 상태 매핑 함수 ---
    const mapStatusToKorean = (status) => {
        switch (status) {
            case 'ONGOING':
                return '진행중';
            case 'SCHEDULED':
                return '예정';
            case 'ENDED':
                return '종료';
            default:
                return '알수없음';
        }
    };

    // --- 회의 데이터 가져오기 ---
    useEffect(() => {
        if (!user?.userId) return;

        const fetchMeetings = async () => {
            try {
                const res = await axios.get(`/api/users/${user.userId}/meetings`);
                console.log(res.data.items, '나오니????');

                if (Array.isArray(res.data.items)) {
                    const formatted = res.data.items.map((m) => ({
                        id: m.meetings_id,
                        title: m.title,
                        status: mapStatusToKorean(m.status),
                        date: new Date(m.scheduled_at).toLocaleDateString('ko-KR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                        }),
                        time: new Date(m.scheduled_at).toLocaleTimeString('ko-KR', {
                            hour: '2-digit',
                            minute: '2-digit',
                        }),
                        invite_code: m.invite_code,
                        participants: m.participants || 1,
                        invited_ids: [],
                    }));
                    setMeetings(formatted);
                } else {
                    setMeetings([]);
                }
            } catch (err) {
                console.error('회의 데이터 불러오기 오류:', err);
                setMeetings([]);
            }
        };

        fetchMeetings();
    }, [user?.userId]);

    // --- 문서 데이터 가져오기 ---
    useEffect(() => {
        if (!user?.userId) return;

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

    // --- 필터별 회의 목록 ---
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

    // --- 핸들러 ---
    const handlePageChange = (page) => {
        setCurrentPage(page);
        window.scrollTo(0, 0);
    };

    const handleJoinMeeting = (meetingId, meetingTitle, inviteCode) => {
        const url = new URL('/meeting', window.location.origin);
        url.searchParams.set('id', meetingId);
        url.searchParams.set('title', meetingTitle);
        url.searchParams.set('invite', inviteCode); // ✅ 초대코드 추가
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
        const meetingDocs = meeting.docs || [];
        setSelectedMeetingDocs(meetingDocs);
        setIsDocModalOpen(true);
    };

    // --- 렌더 ---
    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-10">
            <div className="max-w-8xl mx-auto">
                <header className="mb-8">
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">영상회의</h1>
                    <p className="text-gray-500 mt-1 text-base sm:text-lg">예정된 회의를 확인하고 새로운 회의를 시작하세요.</p>
                </header>

                <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
                    <FilterTabs filters={filters} activeFilter={activeFilter} setActiveFilter={setActiveFilter} />
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
                    {activeFilter === '전체' && upcomingMeetings.length > 0 && <h2 className="text-2xl font-bold text-gray-800 mb-6">예약된 회의</h2>}
                    {activeFilter !== '전체' && activeFilter !== '진행중' && upcomingMeetings.length > 0 && <h2 className="text-2xl font-bold text-gray-800 mb-6">'{activeFilter}' 회의</h2>}

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
                                            onJoinMeeting={() => handleJoinMeeting(meeting.id, meeting.title, meeting.invite_code)}
                                            onEdit={() => handleOpenEditMeetingModal(meeting)}
                                            onDelete={() => handleDeleteMeeting(meeting.id, meeting.title, meeting.invite_code)}
                                            onOpenDocuments={() => handleOpenDocuments(meeting)}
                                        />
                                    </motion.div>
                                ))}
                            </motion.main>
                        ) : (
                            activeFilter !== '진행중' && (
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
