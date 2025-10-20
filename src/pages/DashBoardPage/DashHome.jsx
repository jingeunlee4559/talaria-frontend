import React from 'react';

// --- 아이콘 컴포넌트들 (SVG) ---
const CalendarIcon = ({ className = 'w-6 h-6' }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect>
        <line x1="16" x2="16" y1="2" y2="6"></line>
        <line x1="8" x2="8" y1="2" y2="6"></line>
        <line x1="3" x2="21" y1="10" y2="10"></line>
    </svg>
);
const ClockIcon = ({ className = 'w-6 h-6' }) => (
    <svg
        xmlns="http://www.w.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <circle cx="12" cy="12" r="10"></circle>
        <polyline points="12 6 12 12 16 14"></polyline>
    </svg>
);
const MicIcon = ({ className = 'w-6 h-6' }) => (
    <svg
        xmlns="http://www.w.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
        <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
        <line x1="12" x2="12" y1="19" y2="22"></line>
    </svg>
);
const GlobeIcon = ({ className = 'w-6 h-6' }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <circle cx="12" cy="12" r="10"></circle>
        <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path>
        <path d="M2 12h20"></path>
    </svg>
);
const ArrowRightIcon = ({ className = 'w-4 h-4' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
        <path
            fillRule="evenodd"
            d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z"
            clipRule="evenodd"
        />
    </svg>
);
const SearchIcon = ({ className = 'w-5 h-5' }) => (
    <svg
        xmlns="http://www.w.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    </svg>
);
const BellIcon = ({ className = 'w-6 h-6' }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path>
        <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"></path>
    </svg>
);
const DocumentTextIcon = ({ className = 'w-5 h-5' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
        <path
            fillRule="evenodd"
            d="M4 2a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V8.667a2.001 2.001 0 00-.586-1.414l-4.667-4.667A2 2 0 0010.667 2H4zm6 6a1 1 0 10-2 0v4a1 1 0 102 0V8zm-3 4a1 1 0 011-1h2a1 1 0 110 2H8a1 1 0 01-1-1z"
            clipRule="evenodd"
        />
    </svg>
);
const SunIcon = ({ className = 'w-6 h-6' }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <circle cx="12" cy="12" r="4"></circle>
        <path d="M12 2v2"></path>
        <path d="M12 20v2"></path>
        <path d="m4.93 4.93 1.41 1.41"></path>
        <path d="m17.66 17.66 1.41 1.41"></path>
        <path d="M2 12h2"></path>
        <path d="M20 12h2"></path>
        <path d="m6.34 17.66-1.41 1.41"></path>
        <path d="m19.07 4.93-1.41 1.41"></path>
    </svg>
);
const PlusCircleIcon = ({ className = 'w-5 h-5' }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="16"></line>
        <line x1="8" y1="12" x2="16" y2="12"></line>
    </svg>
);

// --- 재사용 컴포넌트 ---
const StatCard = ({ icon, title, value, change, color }) => {
    const colorClasses = {
        violet: { text: 'text-violet-600', bg: 'bg-violet-100', border: 'border-violet-200' },
        sky: { text: 'text-sky-600', bg: 'bg-sky-100', border: 'border-sky-200' },
        emerald: { text: 'text-emerald-600', bg: 'bg-emerald-100', border: 'border-emerald-200' },
        amber: { text: 'text-amber-600', bg: 'bg-amber-100', border: 'border-amber-200' },
    };
    const selectedColor = colorClasses[color] || colorClasses.violet;
    return (
        <div className="bg-white/70 backdrop-blur-sm p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between">
                <div className={`p-2.5 rounded-lg ${selectedColor.bg} border ${selectedColor.border}`}>{React.cloneElement(icon, { className: `w-5 h-5 ${selectedColor.text}` })}</div>
                {change && <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${change.startsWith('+') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{change}</span>}
            </div>
            <div className="mt-4">
                <p className="text-sm text-slate-500 font-medium">{title}</p>
                <p className="text-2xl font-bold text-slate-800 tracking-tight">{value}</p>
            </div>
        </div>
    );
};

const UpcomingMeetingCard = () => {
    return (
        <div className="relative bg-gradient-to-br from-indigo-600 to-sky-500 p-8 rounded-3xl overflow-hidden shadow-2xl shadow-indigo-200">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/4 translate-x-1/4 blur-2xl"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full translate-y-1/4 -translate-x-1/4 blur-2xl"></div>
            <div className="relative z-10">
                <span className="text-xs font-bold text-white bg-white/20 px-3 py-1.5 rounded-full backdrop-blur-sm">다가오는 미팅</span>
                <h3 className="text-4xl font-bold text-white mt-4 tracking-tight">신규 프로젝트 '오로라' 킥오프</h3>
                <p className="text-indigo-200 mt-2">오늘, 오후 2:00 - 3:30 (90분)</p>
                <div className="flex items-center justify-between mt-8">
                    <div className="flex -space-x-3 items-center">
                        <div className="w-12 h-12 rounded-full bg-sky-200 flex items-center justify-center text-slate-700 font-bold border-4 border-indigo-500">박</div>
                        <div className="w-12 h-12 rounded-full bg-amber-200 flex items-center justify-center text-slate-700 font-bold border-4 border-indigo-500">최</div>
                        <div className="w-12 h-12 rounded-full bg-violet-200 flex items-center justify-center text-slate-700 font-bold border-4 border-indigo-500">이</div>
                        <div className="w-12 h-12 rounded-full bg-indigo-400 flex items-center justify-center text-white font-bold border-4 border-indigo-500">+5</div>
                    </div>
                    <button className="bg-white text-indigo-600 font-bold py-3 px-6 rounded-xl hover:bg-slate-200 transition-all transform hover:scale-105 flex items-center gap-2 shadow-lg">
                        <span>참여하기</span> <ArrowRightIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

const TodayAgendaCard = () => {
    // ... 이전 버전과 동일, 스타일 약간 수정 ...
    const agenda = [
        { time: '10:00 AM', title: '4분기 마케팅 전략', duration: '90분', status: 'live', participants: ['bg-sky-200', 'bg-amber-200', 'bg-violet-200'] },
        { time: '02:00 PM', title: "신규 프로젝트 '오로라' 킥오프", duration: '90분', status: 'upcoming', participants: ['bg-emerald-200', 'bg-rose-200'] },
        { time: '04:30 PM', title: '주간 디자인팀 리뷰', duration: '60분', status: 'upcoming', participants: ['bg-sky-200', 'bg-rose-200', 'bg-amber-200', 'bg-violet-200'] },
    ];
    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80 h-full">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">오늘의 아젠다</h3>
            <div className="space-y-4">
                {agenda.map((item) => (
                    <div key={item.time} className="flex items-start gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors">
                        <p className="font-bold text-sm text-slate-700 w-20 pt-1">{item.time}</p>
                        <div className="relative h-auto self-stretch">
                            <div className="h-full w-0.5 bg-slate-200"></div>
                            <div className={`absolute top-1 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full border-2 border-white ${item.status === 'live' ? 'bg-red-500' : 'bg-slate-300'}`}></div>
                        </div>
                        <div className="flex-1">
                            {item.status === 'live' && <span className="text-xs font-bold text-red-600 bg-red-100 px-2 py-1 rounded-full mb-2 inline-block">LIVE</span>}
                            <h4 className="font-bold text-slate-800">{item.title}</h4>
                            <p className="text-sm text-slate-400 mt-1">{item.duration}</p>
                            <div className="flex items-center -space-x-2 mt-3">
                                {item.participants.map((color, i) => (
                                    <div key={i} className={`w-8 h-8 rounded-full ${color} border-2 border-white`}></div>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const ActionItemsCard = () => {
    const items = [
        { text: "'오로라' 프로젝트 와이어프레임 제출", done: false },
        { text: '4분기 마케팅 전략 회의록 검토', done: true },
        { text: '디자인팀 리뷰 피드백 반영', done: false },
    ];
    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Action Items</h3>
            <div className="space-y-3">
                {items.map((item) => (
                    <div key={item.text} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50">
                        <div className={`w-5 h-5 rounded flex items-center justify-center ${item.done ? 'bg-indigo-500 border-indigo-500' : 'border border-slate-300'}`}>
                            {item.done && (
                                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                </svg>
                            )}
                        </div>
                        <p className={`text-sm font-medium flex-1 ${item.done ? 'text-slate-400 line-through' : 'text-slate-700'}`}>{item.text}</p>
                    </div>
                ))}
                <button className="w-full mt-2 flex items-center justify-center gap-2 text-sm font-semibold text-indigo-600 hover:bg-indigo-50 py-2 rounded-lg transition-colors">
                    <PlusCircleIcon className="w-5 h-5" />
                    <span>새 항목 추가</span>
                </button>
            </div>
        </div>
    );
};

const TeamActivityCard = () => {
    const team = [
        { name: '이수진', role: '프로덕트 매니저', status: 'online', avatarColor: 'bg-sky-200' },
        { name: '박서준', role: 'UX 디자이너', status: 'meeting', avatarColor: 'bg-emerald-200' },
        { name: '최유나', role: '프론트엔드 개발자', status: 'online', avatarColor: 'bg-amber-200' },
    ];
    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80 h-full">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">팀 활동</h3>
            <div className="space-y-4">
                {team.map((member) => (
                    <div key={member.name} className="flex items-center gap-3">
                        <div className="relative">
                            <div className={`w-10 h-10 rounded-full ${member.avatarColor} flex items-center justify-center font-bold text-slate-600`}>{member.name.charAt(0)}</div>
                            <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${member.status === 'online' ? 'bg-green-500' : 'bg-amber-500'}`}></div>
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-semibold text-slate-700">{member.name}</p>
                            <p className="text-xs text-slate-400">{member.role}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- 메인 대시보드 컴포넌트 ---
const DashHome = () => {
    return (
        <div className="bg-slate-100 font-sans">
            <main className="max-w-screen-xl mx-auto p-6 lg:p-8">
                {/* 헤더 */}
                <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold text-slate-800 tracking-tight">안녕하세요, 김민준님!</h1>
                        <div className="flex items-center gap-2 text-slate-500 mt-2 text-md">
                            <SunIcon className="w-5 h-5 text-amber-500" />
                            <span>광주, 맑음, 22°C</span>
                            <span className="text-slate-300">|</span>
                            <span>2025년 10월 20일 월요일</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 mt-4 sm:mt-0">
                        <button className="font-semibold py-2 px-4 rounded-xl text-sm bg-white border border-slate-200 hover:bg-slate-100 transition-colors">새 문서</button>
                        <button className="font-semibold py-2 px-4 rounded-xl text-sm bg-indigo-600 text-white hover:bg-indigo-700 transition-colors">새 회의 시작</button>
                    </div>
                </header>

                {/* 메인 컨텐츠 */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 flex flex-col gap-8">
                        <UpcomingMeetingCard />
                        <TodayAgendaCard />
                    </div>
                    <div className="lg:col-span-1 flex flex-col gap-8">
                        <div className="grid grid-cols-2 gap-4">
                            <StatCard icon={<ClockIcon />} title="총 회의 시간" value="1h 45m" color="sky" />
                            <StatCard icon={<MicIcon />} title="주요 발언" value="12회" color="emerald" />
                        </div>
                        <ActionItemsCard />
                        <TeamActivityCard />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default DashHome;
