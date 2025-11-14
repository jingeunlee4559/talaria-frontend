import StatCard from '../../components/dashboard/dashmain/StatCard';
import { CalendarPlusIcon, ClockIcon, FileTextIcon, LanguagesIcon, VideoIcon } from 'lucide-react';
import Workspace from '../../components/dashboard/dashmain/Workspace';
import NextMeetingHero from '../../components/dashboard/dashmain/NextMeetingHero';
import MeetingListItem from '../../components/dashboard/dashmain/MeetingListItem';
import TodoList from '../../components/dashboard/dashmain/TodoList';
import { useContext, useEffect, useState } from 'react';
import { UserContext } from '../../contexts/UserContext';
import api from '../../axios';
import NewMeetingModal from '../../components/dashboard/dashvideo/NewMeetingModal';
import Swal from 'sweetalert2';

// --- 메인 대시보드 컴포넌트 ---
const DashHome = () => {
    const { user } = useContext(UserContext);
    const [meetings, setMeetings] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    console.log(user, 'context1234567');

    // 상태를 한국어로 매핑하는 함수
    const mapStatusToKorean = (status) => {
        const statusMap = {
            SCHEDULED: '예정',
            ONGOING: '진행 중',
            ENDED: '완료',
            cancelled: '취소됨',
        };
        return statusMap[status] || '예정';
    };

    // 사용자 이름의 첫 글자를 영문으로 변환하는 함수
    const getInitial = (name) => {
        if (!name) return 'U';
        const firstChar = name.charAt(0);
        // 한글인 경우 영문으로 매핑 (간단한 예시)
        const koreanToEnglish = {
            김: 'K',
            이: 'L',
            박: 'P',
            최: 'C',
            정: 'J',
            강: 'K',
            조: 'J',
            윤: 'Y',
            장: 'J',
            임: 'L',
            한: 'H',
            오: 'O',
            서: 'S',
            신: 'S',
            권: 'K',
            황: 'H',
            안: 'A',
            송: 'S',
            류: 'R',
            홍: 'H',
        };

        return koreanToEnglish[firstChar] || firstChar.toUpperCase();
    };

    // 회의 참여 함수
    const handleJoinMeeting = async (meetingId, meetingTitle, inviteCode) => {
        try {
            // 회의 상태 업데이트 (SCHEDULED → ONGOING)
            const currentMeeting = meetings.find((m) => m.id === meetingId);

            if (currentMeeting && currentMeeting.status === '예정') {
                console.log('회의 상태 업데이트 시작:', meetingId);

                // 현재 시간을 ISO 형식으로
                const now = new Date().toISOString();

                const updateData = {
                    title: meetingTitle,
                    status: 'ONGOING',
                    inviteCode: inviteCode,
                    scheduledAt: currentMeeting.scheduled_at,
                    // defaultLang은 선택사항이므로 있으면 포함
                    ...(currentMeeting.lang && { defaultLang: currentMeeting.lang }),
                };

                console.log('상태 업데이트 요청:', updateData);

                await api.patch(`/api/users/${user.userId}/meetings/${meetingId}`, updateData);

                console.log('회의 상태가 ONGOING으로 변경되었습니다.');

                // 회의 목록 새로고침
                await fetchMeetings();
            }

            // 회의방으로 이동
            const url = new URL('/business/meeting', window.location.origin);
            url.searchParams.set('id', meetingId);
            url.searchParams.set('title', meetingTitle);
            url.searchParams.set('invite', inviteCode);
            window.open(url.toString(), '_blank', 'noopener,noreferrer');
        } catch (error) {
            console.error('회의 참여 중 오류:', error);

            // 에러가 발생해도 회의방은 열어줌
            const url = new URL('/business/meeting', window.location.origin);
            url.searchParams.set('id', meetingId);
            url.searchParams.set('title', meetingTitle);
            url.searchParams.set('invite', inviteCode);
            window.open(url.toString(), '_blank', 'noopener,noreferrer');

            // 사용자에게 경고 표시 (선택사항)
            Swal.fire({
                icon: 'warning',
                title: '상태 업데이트 실패',
                text: '회의 상태 업데이트에 실패했지만, 회의에는 참여할 수 있습니다.',
                timer: 2000,
                showConfirmButton: false,
            });
        }
    };

    // 회의 정렬 함수: 진행 중 > 예정 > 완료
    const sortMeetings = (meetingList) => {
        const statusOrder = {
            '진행 중': 1,
            예정: 2,
            완료: 3,
            취소됨: 4,
        };

        return [...meetingList].sort((a, b) => {
            // 상태별 우선순위로 정렬
            const orderDiff = statusOrder[a.status] - statusOrder[b.status];
            if (orderDiff !== 0) return orderDiff;

            // 같은 상태인 경우 시간순으로 정렬 (빠른 시간이 먼저)
            return new Date(a.scheduled_at) - new Date(b.scheduled_at);
        });
    };

    // 회의 데이터 가져오기
    const fetchMeetings = async () => {
        if (!user?.userId) return;

        try {
            const res = await api.get(`/api/users/${user.userId}/meetings/all`);
            console.log('회의 데이터:', res.data.items);

            if (Array.isArray(res.data.items)) {
                const formatted = res.data.items.map((m) => {
                    // 호스트 정보
                    const host = m.host || {};
                    const hostInitial = getInitial(host.name || 'H');

                    // 참가자 정보
                    const participants = (m.participants || []).map((p) => {
                        const initial = getInitial(p.user_name || p.name || 'U');
                        return {
                            userId: p.user_id,
                            name: p.user_name || p.name || 'Unknown',
                            email: p.user_email || p.email,
                            role: p.role,
                            avatar: p.user_profile_image_url || `https://ui-avatars.com/api/?name=${initial}&background=A5F3FC&color=0E7490&bold=true`,
                            joinedAt: p.joined_at,
                            leftAt: p.left_at,
                        };
                    });

                    return {
                        id: m.meetings_id,
                        title: m.title,
                        status: mapStatusToKorean(m.status),
                        time: new Date(m.scheduled_at).toLocaleTimeString('ko-KR', {
                            hour: '2-digit',
                            minute: '2-digit',
                        }),
                        date: new Date(m.scheduled_at).toLocaleDateString('ko-KR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                        }),
                        scheduled_at: m.scheduled_at,
                        lang: m.default_lang ? `기본 언어: ${m.default_lang}` : '',
                        invite_code: m.invite_code,

                        // 호스트 정보
                        host: {
                            userId: host.user_id,
                            name: host.name || 'Unknown Host',
                            email: host.email,
                            avatar: host.profile_image_url || `https://ui-avatars.com/api/?name=${hostInitial}&background=FCA5A5&color=991B1B&bold=true`,
                        },

                        // 참가자 정보
                        participants: participants,
                        participantCount: m.participant_count || participants.length,
                        userRole: m.user_role,
                        hostId: m.host_id,

                        // 진행 중인 회의에만 gradient 적용
                        gradient: mapStatusToKorean(m.status) === '진행 중' ? 'bg-gradient-to-br from-indigo-600 to-violet-500' : '',
                    };
                });

                setMeetings(sortMeetings(formatted));
            } else {
                setMeetings([]);
            }
        } catch (err) {
            console.error('회의 데이터 불러오기 오류:', err);
            setMeetings([]);
        }
    };

    useEffect(() => {
        fetchMeetings();
    }, [user?.userId, user?.name]);

    // 새 회의 모달 열기
    const handleOpenNewMeetingModal = () => {
        setIsModalOpen(true);
    };

    // 모달 닫기
    const handleCloseModal = () => {
        setIsModalOpen(false);
        fetchMeetings();
    };

    // 회의 생성 확인
    const handleConfirmMeeting = async (meetingData) => {
        // 1. 날짜와 시간을 ISO 형식으로 변환
        const [year, month, day] = meetingData.date
            .replace(/년|월|일/g, '-')
            .split('-')
            .map((s) => s.trim());

        const [period, timeStr] = meetingData.time.split(' ');
        let [hour, minute] = timeStr.split(':').map((h) => parseInt(h, 10));

        if (period === '오후' && hour !== 12) hour += 12;
        else if (period === '오전' && hour === 12) hour = 0;

        const scheduledAt = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00`;

        // 2. API 요청 데이터 구성
        // ❗️ 모달의 로직을 따르기 위해 'invited_user_ids'를 여기서 보내지 않습니다.
        const requestData = {
            title: meetingData.title,
            scheduled_at: scheduledAt,
        };

        console.log('회의 생성 요청 (ID 반환용):', requestData);

        try {
            // 3. API 호출
            // ❗️ user.userId가 이 함수 스코프에 있는지 확인하세요.
            // (없다면 user 객체를 DashHome의 state에서 가져와야 합니다.)
            const response = await api.post(`/api/users/${user.userId}/meetings`, requestData);

            console.log('회의 생성 응답:', response.data);

            const meetingId = response.data?.meetings_id;

            if (!meetingId) {
                console.error('응답에서 meetings_id를 찾을 수 없습니다.', response.data);
                throw new Error('서버 응답에서 회의 ID를 받지 못했습니다.');
            }

            // 4. ⭐️ 모달이 후속 처리를 할 수 있도록 생성된 ID를 반환합니다. ⭐️
            return meetingId;

            // ❗️ 모달이 자체적으로 성공/실패 처리를 하므로,
            // ❗️ 아래 로직은 여기(DashHome)가 아닌 모달이 닫힌 후(onClose)에 처리해야 합니다.
            // handleCloseModal(); // (X)
            // Swal.fire(...); // (X)
            // await fetchMeetings(); // (X)
        } catch (error) {
            // 5. ⭐️ 에러를 모달의 catch 블록으로 전파(throw)합니다.
            console.error('회의 생성 오류:', error);
            let errorMessage = '회의 생성 중 오류가 발생했습니다.';
            if (error.response) {
                errorMessage = error.response.data?.message || error.response.data?.error || errorMessage;
            } else if (error.request) {
                errorMessage = '서버와 통신할 수 없습니다.';
            }

            // 모달이 에러를 잡아서 Swal을 띄울 수 있도록 throw
            throw new Error(errorMessage);
        }
    };

    const today = new Date();
    const dateString = today.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });

    const documents = [
        { title: 'Project_Helios_Proposal_v3.docx', status: '완료', lang: '한국어 → 영어', type: 'docx' },
        { title: 'Market_Research_Report_Q3.pdf', status: '완료', lang: '영어 → 한국어', type: 'pdf' },
        { title: 'Service_Agreement_Final.pdf', status: '번역 중', lang: '한국어 → 일본어', type: 'pdf' },
    ];

    const minutes = [
        { title: '주간 스크럼 회의록', date: '어제', participants: [{ name: 'David Kim', avatar: 'https://placehold.co/32x32/DDD6FE/4338CA?text=D' }] },
        {
            title: '1분기 성과 리뷰 회의록',
            date: '3일 전',
            participants: [
                { name: 'Sarah Lee', avatar: 'https://placehold.co/32x32/FBCFE8/831843?text=S' },
                { name: 'Michael Chen', avatar: 'https://placehold.co/32x32/BBF7D0/14532D?text=M' },
            ],
        },
    ];

    // 첫 번째 회의 찾기 (진행 중 또는 예정)
    const firstMeeting = meetings.find((m) => m.status === '진행 중') || meetings.find((m) => m.status === '예정');

    return (
        <div className="bg-slate-100 font-sans min-h-screen">
            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(156, 163, 175, 0.5);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(107, 114, 128, 0.5);
                }
                .animation-delay-2000 {
                    animation-delay: 2s;
                }
            `}</style>
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
                <div className="absolute top-0 -left-1/4 w-1/2 h-full bg-gradient-to-r from-violet-200/50 to-transparent opacity-50 blur-3xl animate-pulse"></div>
                <div className="absolute top-0 -right-1/4 w-1/2 h-full bg-gradient-to-l from-sky-200/50 to-transparent opacity-50 blur-3xl animate-pulse animation-delay-2000"></div>
            </div>
            <div className="relative flex flex-col min-w-0">
                <main className="flex-1 p-4 sm:p-6 lg:p-8">
                    <div className="mb-8">
                        <h1 className="text-3xl md:text-4xl font-bold text-slate-800">안녕하세요, {user?.name || '게스트'}님!</h1>
                        <p className="text-slate-500 mt-1">{dateString} 입니다.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                        <StatCard value={meetings.length} label="이번 달 회의" icon={<VideoIcon className="w-6 h-6" />} color="text-violet-500" />
                        <StatCard value="36" label="완료된 문서" icon={<FileTextIcon className="w-6 h-6" />} color="text-sky-500" />
                        <StatCard value="42.5h" label="총 작업 시간" icon={<ClockIcon className="w-6 h-6" />} color="text-emerald-500" />
                        <StatCard value="EN↔KO" label="주요 사용 언어" icon={<LanguagesIcon className="w-6 h-6" />} color="text-amber-500" />
                    </div>

                    <NextMeetingHero meeting={firstMeeting} onJoinMeeting={handleJoinMeeting} />

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                        <div className="lg:col-span-2 bg-white/60 backdrop-blur-sm p-5 rounded-xl shadow-sm flex flex-col">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-bold text-slate-800">예정된 회의 리스트</h3>
                                <button
                                    onClick={handleOpenNewMeetingModal}
                                    className="flex items-center space-x-2 bg-indigo-600 text-white text-sm font-semibold py-2 px-3 rounded-lg hover:bg-indigo-700 transition-colors"
                                >
                                    <CalendarPlusIcon className="w-4 h-4" />
                                    <span>새 회의 예약</span>
                                </button>
                            </div>
                            <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar max-h-80">
                                {meetings.length > 0 ? (
                                    meetings.map((meeting) => <MeetingListItem key={meeting.id} {...meeting} onJoinMeeting={handleJoinMeeting} />)
                                ) : (
                                    <div className="text-center py-8 text-slate-400">예정된 회의가 없습니다.</div>
                                )}
                            </div>
                        </div>

                        <div className="lg:col-span-1">
                            <TodoList className="h-full" />
                        </div>
                    </div>

                    <div className="mt-6">
                        <Workspace documents={documents} minutes={minutes} className="h-[24rem]" />
                    </div>
                </main>
            </div>

            {/* 새 회의 생성 모달 */}
            <NewMeetingModal isOpen={isModalOpen} onClose={handleCloseModal} onConfirm={handleConfirmMeeting} meetingToEdit={null} />
        </div>
    );
};

export default DashHome;
