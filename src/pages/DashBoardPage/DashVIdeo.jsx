import React, { useState, useEffect, useMemo } from 'react';
import { Plus } from 'lucide-react';
import FilterTabs from '../../components/dashboard/dashvideo/FilterTabs';
import MeetingCard from '../../components/dashboard/dashvideo/MeetingCard';
import Pagination from '../../components/Pagination';
import NewMeetingModal from '../../components/dashboard/dashvideo/NewMeetingModal';
import Swal from 'sweetalert2';

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

const DashVideoPage = () => {
    const [meetings, setMeetings] = useState(mockMeetings);
    const [activeFilter, setActiveFilter] = useState('전체');
    const [currentPage, setCurrentPage] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMeeting, setEditingMeeting] = useState(null);

    const filters = ['전체', '진행중', '예정', '종료'];
    const MEETINGS_PER_PAGE = 6;

    const filteredMeetings = useMemo(() => meetings.filter((meeting) => (activeFilter === '전체' ? true : meeting.status === activeFilter)), [meetings, activeFilter]);

    const currentMeetings = useMemo(() => {
        const firstPageIndex = (currentPage - 1) * MEETINGS_PER_PAGE;
        const lastPageIndex = firstPageIndex + MEETINGS_PER_PAGE;
        return filteredMeetings.slice(firstPageIndex, lastPageIndex);
    }, [currentPage, filteredMeetings]);

    const totalPages = Math.ceil(filteredMeetings.length / MEETINGS_PER_PAGE);

    useEffect(() => {
        setCurrentPage(1);
    }, [activeFilter]);

    const handlePageChange = (page) => {
        setCurrentPage(page);
        window.scrollTo(0, 0);
    };

    const handleJoinMeeting = (meetingId, meetingTitle) => {
        const url = new URL('/meeting', window.location.origin);
        url.searchParams.set('id', meetingId);
        url.searchParams.set('title', meetingTitle);
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
            setMeetings((prev) => [meetingData, ...prev]);
        }
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
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: '삭제',
            cancelButtonText: '취소',
        }).then((result) => {
            if (result.isConfirmed) {
                setMeetings((prev) => prev.filter((m) => m.id !== meetingId));
                Swal.fire('삭제 완료!', '회의가 성공적으로 삭제되었습니다.', 'success');
            }
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-slate-50 p-6 sm:p-10">
            <div className="max-w-8xl mx-auto">
                {/* HEADER */}
                <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-5">
                    <div>
                        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">🎥 영상회의</h1>
                        <p className="text-slate-500 mt-2 text-base sm:text-lg">예정된 영상회의를 확인하고 참여하거나 새로운 회의를 시작하세요.</p>
                    </div>
                    <button
                        onClick={handleOpenNewMeetingModal}
                        className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
                    >
                        <Plus className="h-5 w-5" />
                        <span>새 회의 만들기</span>
                    </button>
                </header>

                {/* FILTER TABS */}
                <div className="flex justify-center sm:justify-start mb-6">
                    <FilterTabs filters={filters} activeFilter={activeFilter} setActiveFilter={setActiveFilter} />
                </div>

                {/* MAIN CONTENT */}
                <main className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {currentMeetings.map((meeting) => (
                        <div key={meeting.id} className="transform transition-transform hover:scale-[1.02]">
                            <MeetingCard
                                {...meeting}
                                onJoinMeeting={() => handleJoinMeeting(meeting.id, meeting.title)}
                                onEdit={() => handleOpenEditMeetingModal(meeting)}
                                onDelete={() => handleDeleteMeeting(meeting.id, meeting.title)}
                            />
                        </div>
                    ))}
                </main>

                {/* PAGINATION */}
                {totalPages > 1 && (
                    <div className="mt-10 flex justify-center">
                        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
                    </div>
                )}
            </div>

            <NewMeetingModal isOpen={isModalOpen} onClose={handleCloseModal} onConfirm={handleConfirmMeeting} meetingToEdit={editingMeeting} />
        </div>
    );
};

export default DashVideoPage;
