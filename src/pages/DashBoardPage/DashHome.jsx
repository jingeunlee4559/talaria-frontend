// import React, { useState, useEffect, useRef } from 'react';
import StatCard from '../../components/dashboard/dashmain/StatCard';
import { CalendarPlusIcon, ClockIcon, FileTextIcon, LanguagesIcon, VideoIcon } from 'lucide-react';
import Workspace from '../../components/dashboard/dashmain/Workspace';
import NextMeetingHero from '../../components/dashboard/dashmain/NextMeetingHero';
import MeetingListItem from '../../components/dashboard/dashmain/MeetingListItem';
import TodoList from '../../components/dashboard/dashmain/TodoList';
import { useEffect, useState } from 'react';

// --- 메인 대시보드 컴포넌트 ---
const DashHome = () => {
    const [userName, setUserName] = useState(''); // ✅ 사용자 이름 상태

    useEffect(() => {
        // 세션스토리지에서 로그인 정보 가져오기
        const storedUser = localStorage.getItem('loggedInUser');
        if (storedUser) {
            const user = JSON.parse(storedUser);
            setUserName(user.name); // 세션스토리지 name 가져오기
        } else {
            setUserName(''); // 로그인 정보 없으면 빈 문자열
        }
    }, []);

    const today = new Date();
    const dateString = today.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });

    const meetings = [
        {
            time: '오전 10:00',
            title: '글로벌 마케팅 전략 회의',
            lang: '실시간 번역: 한국어 ↔ 영어',
            status: '진행 중',
            participants: [
                { name: 'John Doe', avatar: 'https://placehold.co/48x48/A5F3FC/0E7490?text=J' },
                { name: 'Emily Smith', avatar: 'https://placehold.co/48x48/FECACA/7F1D1D?text=E' },
                { name: 'Michael Chen', avatar: 'https://placehold.co/48x48/BBF7D0/14532D?text=M' },
            ],
            gradient: 'bg-gradient-to-br from-indigo-600 to-violet-500',
        },
        { time: '오후 2:30', title: '3분기 실적 리뷰 (APAC)', status: '예정', participants: [{ name: 'Sarah Lee', avatar: 'https://placehold.co/32x32/FBCFE8/831843?text=S' }] },
        {
            time: '오후 5:00',
            title: '신규 프로젝트 킥오프',
            status: '예정',
            participants: [
                { name: 'David Kim', avatar: 'https://placehold.co/32x32/DDD6FE/4338CA?text=D' },
                { name: 'Jessica Wang', avatar: 'https://placehold.co/32x32/FED7AA/9A3412?text=W' },
            ],
        },
        { time: '오전 9:00', title: '주간 스크럼', status: '완료', participants: [{ name: 'David Kim', avatar: 'https://placehold.co/32x32/DDD6FE/4338CA?text=D' }] },
        // 스크롤 테스트를 위한 데이터
        { time: '내일 오전', title: '영업팀 주간 회의', status: '예정', participants: [{ name: 'David Kim', avatar: 'https://placehold.co/32x32/DDD6FE/4338CA?text=D' }] },
    ];
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
                        <h1 className="text-3xl md:text-4xl font-bold text-slate-800">안녕하세요, {userName || '게스트'}님!</h1>
                        <p className="text-slate-500 mt-1">{dateString} 입니다.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                        <StatCard value="12" label="이번 달 회의" icon={<VideoIcon className="w-6 h-6" />} color="text-violet-500" />
                        <StatCard value="36" label="완료된 문서" icon={<FileTextIcon className="w-6 h-6" />} color="text-sky-500" />
                        <StatCard value="42.5h" label="총 작업 시간" icon={<ClockIcon className="w-6 h-6" />} color="text-emerald-500" />
                        <StatCard value="EN↔KO" label="주요 사용 언어" icon={<LanguagesIcon className="w-6 h-6" />} color="text-amber-500" />
                    </div>

                    <NextMeetingHero meeting={firstMeeting} />

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                        {/* ⭐️ 변경된 부분: 회의 리스트를 흰색 카드 컴포넌트로 감싸기 */}
                        <div className="lg:col-span-2 bg-white/60 backdrop-blur-sm p-5 rounded-xl shadow-sm flex flex-col">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-bold text-slate-800">예정된 회의 리스트</h3>
                                <button className="flex items-center space-x-2 bg-indigo-600 text-white text-sm font-semibold py-2 px-3 rounded-lg hover:bg-indigo-700 transition-colors">
                                    <CalendarPlusIcon className="w-4 h-4" />
                                    <span>새 회의 예약</span>
                                </button>
                            </div>
                            {/* ⭐️ 변경된 부분: max-h-80 추가 (약 4개 항목 높이) */}
                            <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar max-h-80">
                                {meetings.map((meeting, i) => (
                                    <MeetingListItem key={i} {...meeting} />
                                ))}
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
        </div>
    );
};

export default DashHome;
