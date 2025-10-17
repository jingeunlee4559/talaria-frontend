import React from 'react';

const LanguageTag = ({ lang, colorClass }) => <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${colorClass}`}>{lang}</span>;

const MeetingItem = ({ title, time, tags }) => (
    <div className="flex items-center justify-between py-4 border-b border-slate-100 last:border-b-0">
        <div className="flex items-center">
            <div className="bg-slate-100 p-2.5 rounded-lg mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            </div>
            <div>
                <p className="font-semibold text-slate-800">{title}</p>
                <p className="text-sm text-slate-500">{time}</p>
            </div>
        </div>
        <div className="flex items-center space-x-2">
            {tags.map((tag) => (
                <LanguageTag key={tag.lang} {...tag} />
            ))}
        </div>
    </div>
);

const MeetingCard = () => {
    const meetings = [
        {
            title: '글로벌 마케팅 전략 회의',
            time: '오늘 14:00',
            tags: [
                { lang: '한국어', colorClass: 'bg-blue-100 text-blue-800' },
                { lang: '영어', colorClass: 'bg-emerald-100 text-emerald-800' },
                { lang: '일본어', colorClass: 'bg-rose-100 text-rose-800' },
            ],
        },
        {
            title: '제품 개발 협의',
            time: '내일 10:00',
            tags: [
                { lang: '한국어', colorClass: 'bg-blue-100 text-blue-800' },
                { lang: '영어', colorClass: 'bg-emerald-100 text-emerald-800' },
            ],
        },
        {
            title: '법무 검토 미팅',
            time: '9월 30일 15:00',
            tags: [
                { lang: '한국어', colorClass: 'bg-blue-100 text-blue-800' },
                { lang: '영어', colorClass: 'bg-emerald-100 text-emerald-800' },
                { lang: '중국어', colorClass: 'bg-amber-100 text-amber-800' },
            ],
        },
    ];

    return (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-full">
            <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-bold text-slate-800">예정된 회의</h2>
                <button className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-indigo-700 transition shadow-sm hover:shadow-md">+ 새 회의</button>
            </div>
            <div className="mt-4">
                {meetings.map((meeting, index) => (
                    <MeetingItem key={index} {...meeting} />
                ))}
            </div>
        </div>
    );
};

export default MeetingCard;
