import React from 'react';
import StatCard from '../../components/dashboard/dashmain/StatCard';
import MeetingCard from '../../components/dashboard/dashmain/MeetingCard';
import DocumentCard from '../../components/dashboard/dashmain/DocumentCard';
import UsageCard from '../../components/dashboard/dashmain/UsageCard';
import ActionCard from '../../components/dashboard/dashmain/ActionCard';
import { CalendarIcon, ChartBarIcon, DocumentAddIcon, DocumentIcon, LanguageIcon, UsersIcon, VideoCameraIcon, VideoIcon } from '../../components/icons/icons';

const DashHome = () => {
    return (
        <div className="bg-slate-50 min-h-screen">
            <div className="max-w-8xl mx-auto p-4 sm:p-6 lg:p-8">
                <header className="mb-8">
                    <h1 className="text-4xl font-bold text-slate-800">대시보드</h1>
                    <p className="text-slate-500 mt-2">환영합니다! 오늘의 활동을 확인하세요.</p>
                </header>

                <main>
                    {/* 상단 통계 카드 */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatCard icon={<CalendarIcon />} title="이번 달 회의" value="24" change="+12%" color="violet" />
                        <StatCard icon={<DocumentIcon />} title="번역된 문서" value="156" change="+5%" color="sky" />
                        <StatCard icon={<UsersIcon />} title="총 참여자" value="89" change="+23%" color="emerald" />
                        <StatCard icon={<LanguageIcon />} title="지원 언어" value="12" change="+2" color="amber" />
                    </div>

                    {/* 회의 및 문서 섹션 */}
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-6">
                        <div className="xl:col-span-2">
                            <MeetingCard />
                        </div>
                        <DocumentCard />
                    </div>

                    {/* 사용량 섹션 */}
                    <div className="mt-6">
                        <UsageCard />
                    </div>

                    {/* 액션 카드 섹션 */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                        <ActionCard icon={<VideoCameraIcon />} title="즉시 회의 시작" description="실시간 번역과 함께 바로 화상 회의를 시작하세요." />
                        <ActionCard icon={<DocumentAddIcon />} title="문서 업로드" description="문서를 업로드하여 AI 번역을 시작하세요." />
                        <ActionCard icon={<ChartBarIcon />} title="분석 보고서" description="번역 결과와 사용 통계를 확인하세요." />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default DashHome;
