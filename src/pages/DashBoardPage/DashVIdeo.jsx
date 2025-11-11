// src/pages/dashboard/DashVideoPage.jsx
import React, { useState, useEffect, useMemo, useContext } from 'react';
import { Plus, VideoOff } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import Swal from 'sweetalert2';

import FilterTabs from '../../components/dashboard/dashvideo/FilterTabs';
import MeetingCard from '../../components/dashboard/dashvideo/MeetingCard';
import InProgressMeetingCard from '../../components/dashboard/dashvideo/InProgressMeetingCard';
import NewMeetingModal from '../../components/dashboard/dashvideo/NewMeetingModal';
import DocumentListModal from '../../components/dashboard/dashvideo/DocumentListModal';
import Pagination from '../../components/Pagination';

import { UserContext } from '../../contexts/UserContext';
import axios from '../../axios';

const MEETINGS_PER_PAGE = 6;
const FILTERS = ['전체', '진행중', '예정', '종료'];

const DashVideoPage = () => {
    const { user } = useContext(UserContext);

    const [meetings, setMeetings] = useState([]);
    const [activeFilter, setActiveFilter] = useState('전체');
    const [currentPage, setCurrentPage] = useState(1);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMeeting, setEditingMeeting] = useState(null);

    // 문서 모달 상태
    const [isDocModalOpen, setIsDocModalOpen] = useState(false);
    const [selectedMeetingId, setSelectedMeetingId] = useState(null);
    const [selectedMeetingStatus, setSelectedMeetingStatus] = useState('SCHEDULED');
    const [roomDocuments, setRoomDocuments] = useState([]); // 회의 첨부 문서
    const [myDocuments, setMyDocuments] = useState([]); // 내 문서 목록

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

    // 회의 목록 로드
    useEffect(() => {
        if (!user?.userId) return;
        (async () => {
            try {
                const res = await axios.get(`/api/users/${user.userId}/meetings/all`);
                if (!Array.isArray(res.data?.items)) {
                    setMeetings([]);
                    return;
                }

                const formatted = await Promise.all(
                    res.data.items.map(async (m) => {
                        // 참가자 수
                        let participantCount = 1;
                        try {
                            const countUrl = m.status === 'ONGOING' ? `/livekit/meetings/${m.meetings_id}/participants/count` : `/api/meetings/${m.meetings_id}/participants/count`; // ENDED, SCHEDULED은 이쪽만
                            const cnt = await axios.get(countUrl);
                            participantCount = cnt.data.totalCount ?? cnt.data.count ?? 1;
                        } catch {
                            // ignore
                        }

                        // 게스트 목록
                        const guestParticipants = (m.participants || [])
                            .filter((p) => p.role === 'GUEST')
                            .map((p) => ({
                                userId: p.user_id,
                                name: p.user_name,
                                email: p.user_email,
                            }));

                        return {
                            id: m.meetings_id,
                            title: m.title,
                            status: mapStatusToKorean(m.status),
                            rawStatus: m.status,
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
                            participants: participantCount,
                            invited_ids: guestParticipants,
                            user_role: m.user_role,
                            host_id: m.host_id,
                        };
                    }),
                );

                setMeetings(formatted);
            } catch (e) {
                console.error(e);
                setMeetings([]);
            }
        })();
    }, [user?.userId]);

    // 내 문서 목록 로드
    useEffect(() => {
        if (!user?.userId) return;
        (async () => {
            try {
                const res = await axios.get(`/api/users/${user.userId}/documents`);
                const items = Array.isArray(res.data?.items) ? res.data.items : [];
                setMyDocuments(
                    items.map((d) => ({
                        id: d.doc_id,
                        title: d.original_name,
                        lastModified: d.uploaded_at
                            ? new Date(d.uploaded_at).toLocaleDateString('ko-KR', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                              })
                            : '',
                        fromLang: d.original_lang,
                        size: `${(d.size / 1024 / 1024).toFixed(2)} MB`,
                        author: d.uploader_name,
                        filepath: d.filepath,
                    })),
                );
            } catch (e) {
                console.error(e);
                setMyDocuments([]);
            }
        })();
    }, [user?.userId]);

    // 필터링된 목록
    const inProgressMeetings = useMemo(() => {
        if (activeFilter !== '전체' && activeFilter !== '진행중') return [];
        return meetings.filter((m) => m.status === '진행중');
    }, [meetings, activeFilter]);

    const upcomingMeetings = useMemo(() => {
        let list;
        if (activeFilter === '전체') list = meetings.filter((m) => m.status !== '진행중');
        else if (activeFilter === '진행중') list = [];
        else list = meetings.filter((m) => m.status === activeFilter);

        // 최신 id 우선 정렬
        return list.sort((a, b) => Number(b.id) - Number(a.id));
    }, [meetings, activeFilter]);

    // 페이지네이션
    const paginatedUpcomingMeetings = useMemo(() => {
        const first = (currentPage - 1) * MEETINGS_PER_PAGE;
        const last = first + MEETINGS_PER_PAGE;
        return upcomingMeetings.slice(first, last);
    }, [currentPage, upcomingMeetings]);

    const totalPages = Math.ceil(upcomingMeetings.length / MEETINGS_PER_PAGE);

    useEffect(() => {
        setCurrentPage(1);
    }, [activeFilter]);

    const handlePageChange = (page) => {
        setCurrentPage(page);
        window.scrollTo(0, 0);
    };

    // 회의 문서 보기/첨부 모달
    const handleOpenDocuments = async (meeting) => {
        try {
            setSelectedMeetingId(meeting.id);
            setSelectedMeetingStatus(meeting.rawStatus || 'SCHEDULED');

            const res = await axios.get(`/api/users/${user.userId}/meetings/${meeting.id}/documents`);
            const items = Array.isArray(res.data?.items) ? res.data.items : [];
            setRoomDocuments(
                items.map((d) => ({
                    id: d.doc_id,
                    title: d.original_name,
                    size: `${(d.size / 1024 / 1024).toFixed(2)} MB`,
                    lastModified: d.uploaded_at
                        ? new Date(d.uploaded_at).toLocaleDateString('ko-KR', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                          })
                        : '',
                    url: undefined, // 필요 시 다운로드 URL 구성
                })),
            );

            setIsDocModalOpen(true);
        } catch (e) {
            console.error(e);
            setRoomDocuments([]);
            setIsDocModalOpen(true);
        }
    };

    const handleAddDocsToMeeting = async (selectedIds) => {
        if (!selectedMeetingId) return;
        try {
            const body = { docIds: selectedIds };
            const res = await axios.post(`/api/users/${user.userId}/meetings/${selectedMeetingId}/documents`, body);

            const duplicated = res.data?.duplicated || [];
            const notOwned = res.data?.notOwned || [];

            if (duplicated.length + notOwned.length > 0) {
                const msg = [duplicated.length ? `중복: ${duplicated.join(', ')}` : null, notOwned.length ? `소유아님: ${notOwned.join(', ')}` : null].filter(Boolean).join(' / ');
                Swal.fire({ icon: 'info', title: '일부 제외됨', text: msg, timer: 2200, showConfirmButton: false });
            } else {
                Swal.fire({ icon: 'success', title: '첨부 완료', timer: 1500, showConfirmButton: false });
            }

            // 첨부 후 회의 문서 새로고침
            const refreshed = await axios.get(`/api/users/${user.userId}/meetings/${selectedMeetingId}/documents`);
            const items = Array.isArray(refreshed.data?.items) ? refreshed.data.items : [];
            setRoomDocuments(
                items.map((d) => ({
                    id: d.doc_id,
                    title: d.original_name,
                    size: `${(d.size / 1024 / 1024).toFixed(2)} MB`,
                    lastModified: d.uploaded_at
                        ? new Date(d.uploaded_at).toLocaleDateString('ko-KR', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                          })
                        : '',
                })),
            );
        } catch (e) {
            const msg = e?.response?.data?.error || '문서 첨부 중 오류가 발생했습니다.';
            Swal.fire({ icon: 'error', title: '실패', text: msg });
        }
    };

    const handleJoinMeeting = async (meetingId, meetingTitle, inviteCode, rawStatus) => {
        // ENDED면 참여 금지, 문서만 열 수 있게
        if (rawStatus === 'ENDED') {
            Swal.fire({
                icon: 'info',
                title: '종료된 회의입니다',
                text: '종료된 회의는 참여할 수 없고 첨부 문서만 확인 가능합니다.',
                timer: 1800,
                showConfirmButton: false,
            });
            return;
        }

        try {
            const currentMeeting = meetings.find((m) => m.id === meetingId);
            if (currentMeeting && currentMeeting.user_role === 'GUEST' && currentMeeting.status !== '진행중') {
                Swal.fire({ icon: 'warning', title: '참여 불가', text: '게스트는 진행중인 회의만 참여할 수 있습니다.', timer: 2000, showConfirmButton: false });
                return;
            }
            if (currentMeeting && currentMeeting.status === '예정') {
                const updateData = { title: meetingTitle, status: 'ONGOING', inviteCode, scheduledAt: new Date().toISOString() };
                if (currentMeeting.user_role === 'HOST') {
                    await axios.patch(`/api/users/${user.userId}/meetings/${meetingId}`, updateData);
                }
            }
            const url = new URL('/meeting', window.location.origin);
            url.searchParams.set('id', meetingId);
            url.searchParams.set('title', meetingTitle);
            url.searchParams.set('invite', inviteCode);
            window.open(url.toString(), '_blank', 'noopener,noreferrer');
        } catch {
            const url = new URL('/meeting', window.location.origin);
            url.searchParams.set('id', meetingId);
            url.searchParams.set('title', meetingTitle);
            url.searchParams.set('invite', inviteCode);
            window.open(url.toString(), '_blank', 'noopener,noreferrer');
            Swal.fire({ icon: 'warning', title: '상태 업데이트 실패', text: '회의 상태 업데이트에 실패했지만, 회의에는 참여할 수 있습니다.', timer: 2000, showConfirmButton: false });
        }
    };

    // 회의 생성/수정 모달 Open
    const handleOpenNewMeetingModal = () => {
        setEditingMeeting(null);
        setIsModalOpen(true);
    };

    const handleOpenEditMeetingModal = (meeting) => {
        if (meeting.user_role !== 'HOST') {
            Swal.fire({
                icon: 'warning',
                title: '권한 없음',
                text: '호스트만 회의를 수정할 수 있습니다.',
                timer: 2000,
                showConfirmButton: false,
            });
            return;
        }
        setEditingMeeting(meeting);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setTimeout(() => setEditingMeeting(null), 300);
    };

    // 회의 생성/수정 Confirm
    const handleConfirmMeeting = async (meetingData) => {
        const isEditing = editingMeeting !== null;

        try {
            // "YYYY년 MM월 DD일" → ISO date
            const [year, month, day] = meetingData.date
                .replace(/년|월|일/g, '-')
                .split('-')
                .map((s) => s.trim());

            // "오전/오후 HH:MM"
            const [period, timeStr] = meetingData.time.split(' ');
            let [hour, minute] = timeStr.split(':').map((h) => parseInt(h, 10));

            if (period === '오후' && hour !== 12) hour += 12;
            else if (period === '오전' && hour === 12) hour = 0;

            const scheduledAt = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T` + `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00`;

            const requestData = {
                title: meetingData.title,
                scheduled_at: scheduledAt,
                invited_user_ids: meetingData.invited_ids || [],
            };

            let meetingId;
            if (isEditing) {
                await axios.patch(`/api/users/${user.userId}/meetings/${meetingData.id}`, requestData);
                meetingId = meetingData.id;
            } else {
                const response = await axios.post(`/api/users/${user.userId}/meetings`, requestData);
                meetingId = response.data.meetings_id || response.data.id;
            }

            // 목록 새로고침
            const res = await axios.get(`/api/users/${user.userId}/meetings/all`);
            if (Array.isArray(res.data?.items)) {
                const formatted = await Promise.all(
                    res.data.items.map(async (m) => {
                        let participantCount = 1;
                        try {
                            const countRes = await axios.get(`/api/meetings/${m.meetings_id}/participants/count`);
                            participantCount = countRes.data.totalCount ?? countRes.data.count ?? 1;
                        } catch {
                            if (m.meetings_id === meetingId && meetingData.invited_ids) {
                                participantCount = meetingData.invited_ids.length + 1;
                            }
                        }

                        const guestParticipants = (m.participants || [])
                            .filter((p) => p.role === 'GUEST')
                            .map((p) => ({
                                userId: p.user_id,
                                name: p.user_name,
                                email: p.user_email,
                            }));

                        return {
                            id: m.meetings_id,
                            title: m.title,
                            status: mapStatusToKorean(m.status),
                            rawStatus: m.status,
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
                            participants: participantCount,
                            invited_ids: guestParticipants,
                            user_role: m.user_role,
                            host_id: m.host_id,
                        };
                    }),
                );
                setMeetings(formatted);
            }

            handleCloseModal();
            return meetingId;
        } catch (error) {
            console.error('회의 처리 오류:', error);

            let errorMessage = isEditing ? '회의 수정 중 오류가 발생했습니다.' : '회의 생성 중 오류가 발생했습니다.';

            if (error?.response) {
                errorMessage = error.response.data?.message || error.response.data?.error || errorMessage;
            } else if (error?.request) {
                errorMessage = '서버와 통신할 수 없습니다. 네트워크 연결을 확인해주세요.';
            }

            Swal.fire({
                icon: 'error',
                title: isEditing ? '수정 실패' : '생성 실패',
                text: errorMessage,
            });

            throw error;
        }
    };

    const handleDetachDocsFromMeeting = async (selectedIds) => {
        if (!selectedMeetingId || !user?.userId || selectedIds.length === 0) return;

        try {
            // 단건 DELETE API를 병렬 호출
            await Promise.all(selectedIds.map((docId) => axios.delete(`/api/users/${user.userId}/meetings/${selectedMeetingId}/documents/${docId}`)));

            // 최신 회의 문서 목록 재조회
            const refreshed = await axios.get(`/api/users/${user.userId}/meetings/${selectedMeetingId}/documents`);
            const items = Array.isArray(refreshed.data.items) ? refreshed.data.items : [];
            setRoomDocuments(
                items.map((d) => ({
                    id: d.doc_id,
                    title: d.original_name,
                    size: `${(d.size / 1024 / 1024).toFixed(2)} MB`,
                    lastModified: d.uploaded_at ? new Date(d.uploaded_at).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' }) : '',
                })),
            );

            Swal.fire({
                icon: 'success',
                title: '해제 완료',
                text: `${selectedIds.length}개 문서를 회의에서 해제했습니다.`,
                timer: 1500,
                showConfirmButton: false,
            });
        } catch (e) {
            console.error(e);
            Swal.fire({ icon: 'error', title: '해제 실패', text: '문서 해제 중 오류가 발생했습니다.' });
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-10">
            <div className="max-w-8xl mx-auto">
                <header className="mb-8">
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">영상회의</h1>
                    <p className="text-gray-500 mt-1 text-base sm:text-lg">예정된 회의를 확인하고 새로운 회의를 시작하세요.</p>
                </header>

                <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
                    <FilterTabs filters={FILTERS} activeFilter={activeFilter} setActiveFilter={setActiveFilter} />
                    <button
                        onClick={handleOpenNewMeetingModal}
                        className="flex flex-grow items-center justify-center gap-2 whitespace-nowrap 
              bg-gradient-to-r from-blue-500 to-indigo-600 
              text-white font-semibold text-base px-6 py-3 rounded-xl 
              shadow-lg shadow-blue-500/40 
              transition-all transform duration-300 ease-in-out
              hover:shadow-xl hover:shadow-blue-400/50 hover:-translate-y-1
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
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
                    {activeFilter === '전체' && upcomingMeetings.length > 0 && <h2 className="text-2xl font-bold text-gray-800 mb-6">회의 목록</h2>}
                    {activeFilter !== '전체' && activeFilter !== '진행중' && upcomingMeetings.length > 0 && <h2 className="text-2xl font-bold text-gray-800 mb-6">'{activeFilter}' 회의</h2>}

                    <AnimatePresence>
                        {paginatedUpcomingMeetings.length > 0 ? (
                            <motion.main
                                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                                initial="hidden"
                                animate="visible"
                                variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
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
                                            user_role={meeting.user_role}
                                            onJoinMeeting={() => handleJoinMeeting(meeting.id, meeting.title, meeting.invite_code, meeting.rawStatus)}
                                            onEdit={() => handleOpenEditMeetingModal(meeting)}
                                            onDelete={() => {
                                                if (meeting.user_role !== 'HOST') {
                                                    Swal.fire({
                                                        icon: 'warning',
                                                        title: '권한 없음',
                                                        text: '호스트만 회의를 삭제할 수 있습니다.',
                                                        timer: 2000,
                                                        showConfirmButton: false,
                                                    });
                                                    return;
                                                }
                                                Swal.fire({
                                                    title: '정말 삭제하시겠습니까?',
                                                    text: `'${meeting.title}' 회의를 삭제하면 되돌릴 수 없습니다.`,
                                                    icon: 'warning',
                                                    showCancelButton: true,
                                                    confirmButtonColor: '#e53e3e',
                                                    cancelButtonColor: '#3b82f6',
                                                    confirmButtonText: '삭제',
                                                    cancelButtonText: '취소',
                                                }).then((result) => {
                                                    if (result.isConfirmed) {
                                                        setMeetings((prev) => prev.filter((m) => m.id !== meeting.id));
                                                        Swal.fire('삭제 완료!', '회의가 성공적으로 삭제되었습니다.', 'success');
                                                    }
                                                });
                                            }}
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

            {/* 모달들 */}
            <NewMeetingModal isOpen={isModalOpen} onClose={handleCloseModal} onConfirm={handleConfirmMeeting} meetingToEdit={editingMeeting} />

            <DocumentListModal
                isOpen={isDocModalOpen}
                onClose={() => setIsDocModalOpen(false)}
                myDocuments={myDocuments}
                roomDocuments={roomDocuments}
                onAddToMeeting={handleAddDocsToMeeting}
                onDownloadSelected={(selected) => console.log('다운로드 대상:', selected)}
                onDetachSelected={handleDetachDocsFromMeeting}
                meetingStatus={selectedMeetingStatus}
            />
        </div>
    );
};

export default DashVideoPage;
