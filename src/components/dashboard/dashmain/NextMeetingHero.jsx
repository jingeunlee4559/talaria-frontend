import { ArrowRightIcon, ClockIcon } from 'lucide-react';
import React, { useEffect, useState } from 'react';

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
            <div className="relative z-10 mb-6 md:mb-0">
                <p className="font-semibold text-lg opacity-80 flex items-center space-x-2">
                    <ClockIcon className="w-5 h-5" />
                    <span>다음 회의</span>
                </p>
                <h3 className="text-3xl md:text-4xl font-bold mt-2">{meeting.title}</h3>
                {meeting.lang && <p className="mt-3 font-medium opacity-80 bg-white/20 rounded-full px-3 py-1 w-fit text-sm backdrop-blur-sm">{meeting.lang}</p>}
                <div className="flex -space-x-3 mt-4">
                    {meeting.participants?.map((p, i) => (
                        <img key={i} className="inline-block h-12 w-12 rounded-full ring-2 ring-white/50" src={p.avatar} alt={p.name} title={p.name} />
                    ))}
                </div>
            </div>
            <div className="relative z-10 flex flex-col items-start md:items-end">
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
                <button onClick={handleJoinClick} className="mt-4 bg-white text-slate-800 font-bold py-3 px-6 rounded-lg hover:bg-slate-200 transition-colors shadow-lg flex items-center space-x-2">
                    <span>참여하기</span>
                    <ArrowRightIcon className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};

export default NextMeetingHero;
