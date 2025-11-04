import React from 'react';
import { VideoIcon } from 'lucide-react';
import PropTypes from 'prop-types';

const MeetingListItem = ({ id, title, status, time, date, host, participants, participantCount, userRole, gradient, onJoinMeeting, invite_code }) => {
    const statusStyles = {
        '진행 중': { dot: 'bg-red-500 animate-pulse', border: 'border-red-500/50', text: 'text-red-500' },
        예정: { dot: 'bg-blue-500', border: 'border-blue-500/50', text: 'text-blue-500' },
        완료: { dot: 'bg-slate-400', border: 'border-slate-400/30', text: 'text-slate-400' },
    };
    const currentStatus = statusStyles[status] || statusStyles['예정'];

    const handleJoinClick = async () => {
        if (onJoinMeeting && id && title && invite_code) {
            await onJoinMeeting(id, title, invite_code);
        }
    };

    return (
        <div className={`flex items-center space-x-4 p-4 bg-slate-100/50 rounded-xl hover:shadow-md transition-shadow border-l-4 ${currentStatus.border}`}>
            {/* 시간 표시 */}
            <div className="text-center w-20">
                <p className="font-bold text-lg text-slate-800">{time.split(' ')[1] || time}</p>
                <p className="text-sm text-slate-500">{time.split(' ')[0]}</p>
            </div>

            {/* 제목 + 호스트 + 참가자 */}
            <div className="flex-1">
                <h4 className="font-bold text-slate-800 mb-2">{title}</h4>

                {/* 호스트 정보 */}
                <div className="flex items-center space-x-2 mb-2">
                    <div className="relative">
                        <img src={host?.avatar} alt={host?.name} className="w-7 h-7 rounded-full border-2 border-white shadow-sm" title={`호스트: ${host?.name}`} />
                        {/* 호스트 배지 */}
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-amber-500 rounded-full flex items-center justify-center border border-white">
                            <span className="text-white text-[8px] font-bold">H</span>
                        </div>
                    </div>
                    <span className="text-xs text-slate-600 font-medium">{host?.name || 'Unknown Host'}</span>
                </div>

                {/* 참가자 아바타 */}
                {participants && participants.length > 0 && (
                    <div className="flex items-center space-x-1">
                        <div className="flex -space-x-2">
                            {participants.slice(0, 4).map((p, i) => (
                                <img
                                    key={i}
                                    className="inline-block h-7 w-7 rounded-full ring-2 ring-white hover:scale-110 transition-transform"
                                    src={p.avatar}
                                    alt={p.name}
                                    title={`${p.name} (${p.role})`}
                                />
                            ))}
                        </div>
                        {participantCount > 4 && <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-xs font-semibold text-slate-600">+{participantCount - 4}</div>}
                    </div>
                )}
            </div>

            {/* 상태 + 버튼 */}
            <div className="flex flex-col items-end space-y-2">
                {/* 상태 표시 */}
                <div className="flex items-center space-x-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${currentStatus.dot}`}></div>
                    <span className={`text-sm font-semibold ${currentStatus.text}`}>{status}</span>
                </div>

                {/* 역할 배지 */}
                {userRole && (
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${userRole === 'HOST' ? 'bg-amber-100 text-amber-800' : 'bg-indigo-100 text-indigo-800'}`}>
                        {userRole === 'HOST' ? '호스트' : userRole === 'GUEST' ? '게스트' : '뷰어'}
                    </span>
                )}

                {/* 참여 버튼 */}
                {status !== '완료' && (
                    <button onClick={handleJoinClick} className="flex items-center space-x-1 text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors">
                        <VideoIcon className="w-4 h-4" />
                        <span>참여</span>
                    </button>
                )}

                {/* 완료된 회의 */}
                {status === '완료' && <button className="text-sm font-semibold text-slate-500 hover:text-slate-700">결과 보기</button>}
            </div>
        </div>
    );
};

MeetingListItem.propTypes = {
    id: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    time: PropTypes.string.isRequired,
    date: PropTypes.string.isRequired,
    host: PropTypes.shape({
        userId: PropTypes.number,
        name: PropTypes.string,
        email: PropTypes.string,
        avatar: PropTypes.string,
    }),
    participants: PropTypes.arrayOf(
        PropTypes.shape({
            userId: PropTypes.number,
            name: PropTypes.string,
            email: PropTypes.string,
            role: PropTypes.string,
            avatar: PropTypes.string,
        }),
    ),
    participantCount: PropTypes.number,
    userRole: PropTypes.string,
    gradient: PropTypes.string,
    onJoinMeeting: PropTypes.func.isRequired,
    invite_code: PropTypes.string.isRequired,
};

MeetingListItem.defaultProps = {
    host: {
        name: 'Unknown Host',
        avatar: 'https://ui-avatars.com/api/?name=H&background=FCA5A5&color=991B1B&bold=true',
    },
    participants: [],
    participantCount: 0,
    userRole: 'GUEST',
    gradient: '',
};

export default MeetingListItem;
