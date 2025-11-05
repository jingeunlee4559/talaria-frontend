import React, { useContext } from 'react';
import { motion } from 'framer-motion';
import { Clock, Radio, UsersRound, Video, XCircle } from 'lucide-react';
import Swal from 'sweetalert2';
import axios from '../../../axios'; // ✅ axios 경로 확인 필요
import { UserContext } from '../../../contexts/UserContext';

const InProgressMeetingCard = ({ meeting, onJoinMeeting }) => {
    const { user } = useContext(UserContext);

    const handleEndMeeting = async () => {
        Swal.fire({
            title: '회의를 종료하시겠습니까?',
            text: `'${meeting.title}' 회의가 종료됩니다.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#16a34a', // 초록색
            cancelButtonColor: '#6b7280', // 회색
            confirmButtonText: '예',
            cancelButtonText: '아니오',
            background: '#f9fafb',
            customClass: {
                popup: 'rounded-2xl shadow-lg',
                title: 'text-lg font-semibold',
            },
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const res = await axios.patch(`/api/users/${user.userId}/meetings/${meeting.id}/end`);
                    if (res.status === 200) {
                        Swal.fire({
                            icon: 'success',
                            title: '회의 종료 완료',
                            text: `'${meeting.title}' 회의가 정상적으로 종료되었습니다.`,
                            timer: 1500,
                            showConfirmButton: false,
                        }).then(() => {
                            window.location.reload();
                        });
                    }
                } catch (err) {
                    console.error('회의 종료 오류:', err);
                    Swal.fire({
                        icon: 'error',
                        title: '종료 실패',
                        text: '회의 종료 중 문제가 발생했습니다.',
                    });
                }
            }
        });
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-xl shadow-lg border border-green-300 overflow-hidden
                       flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 gap-4"
        >
            <div className="flex items-center gap-4">
                <span className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full bg-green-100 text-green-600">
                    <Radio className="w-6 h-6 animate-pulse" />
                </span>
                <div>
                    <h3 className="font-bold text-lg text-gray-900">{meeting.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                        <span className="flex items-center gap-1.5">
                            <UsersRound className="w-4 h-4" /> {meeting.participants}명 참여중
                        </span>
                        <span className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4" /> {meeting.time}
                        </span>
                    </div>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <button
                    onClick={() => onJoinMeeting(meeting.id, meeting.title, meeting.invite_code)}
                    className="flex items-center justify-center gap-2 px-5 py-2.5 bg-green-600 text-white font-semibold rounded-lg text-base
                               hover:bg-green-700 transition-colors shadow-md hover:shadow-lg w-full sm:w-auto"
                >
                    <Video className="w-5 h-5" />
                    <span>즉시 참여</span>
                </button>

                {/* ✅ HOST일 때만 보이는 회의 종료 버튼 */}
                {meeting.user_role === 'HOST' && (
                    <button
                        onClick={handleEndMeeting}
                        className="flex items-center justify-center gap-2 px-5 py-2.5 bg-red-600 text-white font-semibold rounded-lg text-base
                                   hover:bg-red-700 transition-colors shadow-md hover:shadow-lg w-full sm:w-auto"
                    >
                        <XCircle className="w-5 h-5" />
                        <span>회의 종료</span>
                    </button>
                )}
            </div>
        </motion.div>
    );
};

export default InProgressMeetingCard;
