import { ArrowRightIcon, ClockIcon, CrownIcon } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

const NextMeetingHero = ({ meeting, onJoinMeeting }) => {
    const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

    useEffect(() => {
        if (!meeting) return;
        const meetingTime = new Date(Date.now() + 2 * 3600 * 1000 + 15 * 60 * 1000);
        const timer = setInterval(() => {
            const now = new Date();
            const difference = meetingTime - now;
            if (difference > 0) {
                setTimeLeft({
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((difference / 1000 / 60) % 60),
                    seconds: Math.floor((difference / 1000) % 60),
                });
            } else {
                clearInterval(timer);
                setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
            }
        }, 1000);
        return () => clearInterval(timer);
    }, [meeting]);

    if (!meeting) return null;

    const handleJoinClick = async () => {
        if (onJoinMeeting && meeting.id && meeting.title && meeting.invite_code) {
            await onJoinMeeting(meeting.id, meeting.title, meeting.invite_code);
        }
    };

    return (
        <div className={`relative w-full p-6 sm:p-8 rounded-2xl flex flex-col md:flex-row md:items-center justify-between text-white overflow-hidden min-h-[260px] ${meeting.gradient}`}>
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="absolute -right-16 -top-16 w-64 h-64 bg-white/10 rounded-full opacity-50"></div>
            <div className="absolute -left-24 -bottom-24 w-72 h-72 bg-white/10 rounded-full opacity-50"></div>

            {/* 왼쪽: 회의 정보 */}
            <div className="relative z-10 mb-6 md:mb-0">
                <p className="font-semibold text-lg opacity-80 flex items-center space-x-2">
                    <ClockIcon className="w-5 h-5" />
                    <span>다음 회의</span>
                </p>
                <h3 className="text-3xl md:text-4xl font-bold mt-2">{meeting.title}</h3>

                {/* 언어 정보 */}
                {meeting.lang && <p className="mt-3 font-medium opacity-80 bg-white/20 rounded-full px-3 py-1 w-fit text-sm backdrop-blur-sm">{meeting.lang}</p>}

                {/* 호스트 정보 */}
                {meeting.host && (
                    <div className="flex items-center space-x-2 mt-4">
                        <div className="relative">
                            <img src={meeting.host.avatar} alt={meeting.host.name} className="w-10 h-10 rounded-full border-2 border-white shadow-lg" title={`호스트: ${meeting.host.name}`} />
                            {/* 호스트 왕관 배지 */}
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center border-2 border-white shadow-md">
                                <CrownIcon className="w-3 h-3 text-white" />
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-semibold">{meeting.host.name}</span>
                            <span className="text-xs opacity-80">호스트</span>
                        </div>
                    </div>
                )}

                {/* 참가자 아바타 */}
                {meeting.participants && meeting.participants.length > 0 && (
                    <div className="flex items-center space-x-2 mt-4">
                        <div className="flex -space-x-3">
                            {meeting.participants.slice(0, 5).map((p, i) => (
                                <img
                                    key={i}
                                    className="inline-block h-10 w-10 rounded-full ring-2 ring-white/50 hover:scale-110 transition-transform shadow-lg"
                                    src={p.avatar}
                                    alt={p.name}
                                    title={`${p.name} (${p.role})`}
                                />
                            ))}
                        </div>
                        {meeting.participantCount > 5 && (
                            <div className="w-10 h-10 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center text-sm font-bold shadow-lg">+{meeting.participantCount - 5}</div>
                        )}
                    </div>
                )}
            </div>

            {/* 오른쪽: 타이머 + 버튼 */}
            <div className="relative z-10 flex flex-col items-start md:items-end">
                {/* 카운트다운 타이머 */}
                <div className="flex space-x-4">
                    <div className="text-center">
                        <p className="text-4xl font-bold">{String(timeLeft.hours).padStart(2, '0')}</p>
                        <p className="opacity-70">시간</p>
                    </div>
                    <div className="text-4xl font-bold opacity-50">:</div>
                    <div className="text-center">
                        <p className="text-4xl font-bold">{String(timeLeft.minutes).padStart(2, '0')}</p>
                        <p className="opacity-70">분</p>
                    </div>
                    <div className="text-4xl font-bold opacity-50">:</div>
                    <div className="text-center">
                        <p className="text-4xl font-bold">{String(timeLeft.seconds).padStart(2, '0')}</p>
                        <p className="opacity-70">초</p>
                    </div>
                </div>

                {/* 사용자 역할 배지 */}
                {meeting.userRole && (
                    <div className="mt-3">
                        <span className={`text-xs px-3 py-1 rounded-full font-semibold ${meeting.userRole === 'HOST' ? 'bg-amber-500/90 text-white' : 'bg-white/30 text-white backdrop-blur-sm'}`}>
                            {meeting.userRole === 'HOST' ? '🎯 호스트' : meeting.userRole === 'GUEST' ? '👥 게스트' : '👁️ 뷰어'}
                        </span>
                    </div>
                )}

                {/* 참여 버튼 */}
                <button
                    onClick={handleJoinClick}
                    className="mt-4 bg-white text-slate-800 font-bold py-3 px-6 rounded-lg hover:bg-slate-200 transition-all shadow-lg flex items-center space-x-2 hover:scale-105"
                >
                    <span>참여하기</span>
                    <ArrowRightIcon className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};

NextMeetingHero.propTypes = {
    meeting: PropTypes.shape({
        id: PropTypes.number.isRequired,
        title: PropTypes.string.isRequired,
        status: PropTypes.string,
        time: PropTypes.string,
        date: PropTypes.string,
        scheduled_at: PropTypes.string,
        lang: PropTypes.string,
        invite_code: PropTypes.string.isRequired,
        gradient: PropTypes.string,
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
    }),
    onJoinMeeting: PropTypes.func.isRequired,
};

export default NextMeetingHero;
