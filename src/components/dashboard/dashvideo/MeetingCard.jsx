import { Calendar, Users, Video, Clock, Edit, Trash2, FileText } from 'lucide-react';
import React from 'react';

/**
 * 회의 상태별 설정 객체
 * ✅ 'badge'와 'button' 속성을 JSX에서 그대로 사용하도록 수정됨
 */
const statusConfig = {
    진행중: {
        badge: 'bg-green-100 text-green-800 ring-1 ring-inset ring-green-600/20',
        button: 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md shadow-green-500/30 hover:shadow-lg hover:shadow-green-500/40 focus-visible:outline-green-600',
        text: '지금 참여하기',
        icon: <Video className="w-5 h-5" />,
        dot: 'bg-green-500',
    },
    예정: {
        badge: 'bg-sky-100 text-sky-800 ring-1 ring-inset ring-sky-600/20',
        button: 'bg-gradient-to-r from-sky-500 to-sky-600 text-white shadow-md shadow-sky-500/30 hover:shadow-lg hover:shadow-sky-500/40 focus-visible:outline-sky-600',
        text: '회의 시작하기',
        icon: <Video className="w-5 h-5" />,
        dot: 'bg-sky-500',
    },
    준비: {
        badge: 'bg-indigo-100 text-indigo-800 ring-1 ring-inset ring-indigo-600/20',
        button: 'bg-indigo-300 text-white cursor-not-allowed opacity-80',
        text: '준비 중',
        icon: <Clock className="w-5 h-5" />,
        dot: 'bg-indigo-500',
    },
    종료: {
        badge: 'bg-red-200 text-red-700 ring-1 ring-inset ring-red-600/20',
        button: 'bg-red-500 text-white cursor-not-allowed opacity-60',
        text: '회의 종료됨',
        icon: null,
        dot: 'bg-red-500',
    },
};

const MeetingCard = ({ id, title, status, participants, date, time, onJoinMeeting, onEdit, onDelete, onOpenDocuments, user_role }) => {
    const currentStatus = statusConfig[status] || statusConfig['종료'];

    const handleButtonClick = () => {
        if (status === '진행중' || status === '예정') onJoinMeeting();
    };

    return (
        <div className="bg-white rounded-xl shadow-md border border-gray-200/80 hover:shadow-xl hover:border-violet-400 transition-all duration-300 flex flex-col h-full">
            <div className="p-5 border-b border-gray-100">
                <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ${currentStatus.badge}`}>
                    <span className={`w-2.5 h-2.5 rounded-full ${currentStatus.dot}`}></span>
                    {status}
                </span>
                <h3 className="mt-3 font-semibold text-lg text-gray-900 line-clamp-2 h-14">{title}</h3>
            </div>

            <div className="p-5 space-y-3 text-sm text-gray-600 flex-grow">
                <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span>{date}</span>
                </div>
                <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span>{time}</span>
                </div>
                <div className="flex items-center gap-3">
                    <Users className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span>참여 {participants}명</span>
                </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-b-xl flex justify-between items-center gap-3">
                <button
                    onClick={handleButtonClick}
                    disabled={status === '완료' || status === '취소'}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${currentStatus.button}`}
                >
                    {currentStatus.icon}
                    <span>{currentStatus.text}</span>
                </button>

                {/* 문서 / 수정 / 삭제 - HOST만 수정/삭제 가능 */}
                <div className="flex items-center flex-shrink-0">
                    <button onClick={onOpenDocuments} className="p-2 text-gray-500 hover:text-violet-600 hover:bg-violet-50 rounded-full transition-colors" aria-label="문서 리스트">
                        <FileText className="w-4 h-4" />
                    </button>
                    {user_role === 'HOST' && (
                        <>
                            <button onClick={onEdit} className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors" aria-label="회의 수정">
                                <Edit className="w-4 h-4" />
                            </button>
                            <button onClick={onDelete} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors" aria-label="회의 삭제">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MeetingCard;
