import StatCard from '../../components/dashboard/dashmain/StatCard';
import { CalendarPlusIcon, ClockIcon, FileTextIcon, LanguagesIcon, VideoIcon } from 'lucide-react';
import Workspace from '../../components/dashboard/dashmain/Workspace';
import NextMeetingHero from '../../components/dashboard/dashmain/NextMeetingHero';
import MeetingListItem from '../../components/dashboard/dashmain/MeetingListItem';
import TodoList from '../../components/dashboard/dashmain/TodoList';
import { useContext, useEffect, useState } from 'react';
import { UserContext } from '../../contexts/UserContext';
import axios from '../../axios';
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
    const handleJoinMeeting = (meetingId, meetingTitle, inviteCode) => {
        const url = new URL('/meeting', window.location.origin);
        url.searchParams.set('id', meetingId);
        url.searchParams.set('title', meetingTitle);
        url.searchParams.set('invite', inviteCode);
        window.open(url.toString(), '_blank', 'noopener,noreferrer');
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
            const res = await axios.get(`/api/users/${user.userId}/meetings`);
            console.log(res.data.items, '나오니????');

            if (Array.isArray(res.data.items)) {
                const formatted = res.data.items.map((m) => {
                    const initial = getInitial(user.name);
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
                        scheduled_at: m.scheduled_at, // 정렬을 위해 원본 날짜 보관
                        lang: m.translation_languages ? `실시간 번역: ${m.translation_languages}` : '',
                        invite_code: m.invite_code,
                        participants: m.participants_data || [
                            {
                                name: user.name || 'User',
                                avatar: `https://ui-avatars.com/api/?name=${initial}&background=A5F3FC&color=0E7490&bold=true`,
                            },
                        ],
                        // 진행 중인 회의에만 gradient 적용
                        gradient: mapStatusToKorean(m.status) === '진행 중' ? 'bg-gradient-to-br from-indigo-600 to-violet-500' : '',
                    };
                });

                // 정렬 후 상태 업데이트
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
    };

    // 회의 생성 확인
    const handleConfirmMeeting = async (meetingData) => {
        try {
            // 날짜와 시간을 ISO 형식으로 변환
            const [year, month, day] = meetingData.date
                .replace(/년|월|일/g, '-')
                .split('-')
                .map((s) => s.trim());

            const [period, timeStr] = meetingData.time.split(' ');
            let [hour, minute] = timeStr.split(':').map((h) => parseInt(h, 10));

            // 오전/오후 변환
            if (period === '오후' && hour !== 12) {
                hour += 12;
            } else if (period === '오전' && hour === 12) {
                hour = 0;
            }

            // ISO 8601 형식으로 변환
            const scheduledAt = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00`;

            // API 요청 데이터 구성
            const requestData = {
                title: meetingData.title,
                scheduled_at: scheduledAt,
                invited_user_ids: meetingData.invited_ids || [], // 초대된 사용자 ID 배열
            };

            console.log('회의 생성 요청:', requestData);

            // API 호출
            const response = await axios.post(`/api/users/${user.userId}/meetings`, requestData);

            console.log('회의 생성 응답:', response.data);

            handleCloseModal();

            // 성공 메시지
            Swal.fire({
                icon: 'success',
                title: '예약 완료!',
                text: `'${meetingData.title}' 회의가 생성되었습니다.`,
                timer: 2000,
                showConfirmButton: false,
                timerProgressBar: true,
            });

            // 회의 목록 새로고침
            await fetchMeetings();
        } catch (error) {
            console.error('회의 생성 오류:', error);

            let errorMessage = '회의 생성 중 오류가 발생했습니다.';

            if (error.response) {
                // 서버에서 응답을 받은 경우
                errorMessage = error.response.data?.message || error.response.data?.error || errorMessage;
                console.error('서버 응답 오류:', error.response.data);
            } else if (error.request) {
                // 요청은 보냈지만 응답을 받지 못한 경우
                errorMessage = '서버와 통신할 수 없습니다. 네트워크 연결을 확인해주세요.';
                console.error('네트워크 오류:', error.request);
            }

            Swal.fire({
                icon: 'error',
                title: '생성 실패',
                text: errorMessage,
            });
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
