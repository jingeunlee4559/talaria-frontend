import React from 'react';

const MeetingListItem = ({ id, time, title, participants, status, invite_code, onJoinMeeting }) => {
    const statusStyles = {
        '진행 중': { dot: 'bg-red-500 animate-pulse', border: 'border-red-500/50', text: 'text-red-500' },
        예정: { dot: 'bg-blue-500', border: 'border-blue-500/50', text: 'text-blue-500' },
        완료: { dot: 'bg-slate-400', border: 'border-slate-400/30', text: 'text-slate-400' },
    };
    const currentStatus = statusStyles[status] || statusStyles['예정'];

    const handleJoinClick = () => {
        if (onJoinMeeting && id && title && invite_code) {
            onJoinMeeting(id, title, invite_code);
        }
    };

    return (
        <div className={`flex items-center space-x-4 p-4 bg-slate-100/50 rounded-xl hover:shadow-md transition-shadow border-l-4 ${currentStatus.border}`}>
            <div className="text-center w-20">
                <p className="font-bold text-lg text-slate-800">{time.split(' ')[1] || time}</p>
                <p className="text-sm text-slate-500">{time.split(' ')[0]}</p>
            </div>
            <div className="flex-1">
                <h4 className="font-bold text-slate-800">{title}</h4>
                <div className="flex -space-x-2 mt-2">
                    {participants?.map((p, i) => (
                        <img key={i} className="inline-block h-8 w-8 rounded-full ring-2 ring-white" src={p.avatar} alt={p.name} title={p.name} />
                    ))}
                </div>
            </div>
            <div className="flex flex-col items-end space-y-2">
                <div className="flex items-center space-x-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${currentStatus.dot}`}></div>
                    <span className={`text-sm font-semibold ${currentStatus.text}`}>{status}</span>
                </div>
                {status !== '완료' && (
                    <button onClick={handleJoinClick} className="text-sm font-semibold text-indigo-600 hover:text-indigo-800">
                        참여
                    </button>
                )}
                {status === '완료' && <button className="text-sm font-semibold text-slate-500 hover:text-slate-700">결과 보기</button>}
            </div>
        </div>
    );
};

export default MeetingListItem;
