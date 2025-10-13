import React from 'react';
import StatCard from '../../components/dashboard/dashmain/StatCard';
import MeetingCard from '../../components/dashboard/dashmain/MeetingCard';
import DocumentCard from '../../components/dashboard/dashmain/DocumentCard';
import UsageCard from '../../components/dashboard/dashmain/UsageCard';
import ActionCard from '../../components/dashboard/dashmain/ActionCard';


// 아이콘들을 별도의 컴포넌트로 관리하면 더 깔끔합니다.
// 여기서는 가독성을 위해 DashHome 내부에 정의합니다.
const Icons = {
  Calendar: () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
  DocumentText: () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
  Users: () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197M15 11a4 4 0 110-5.292" /></svg>,
  Language: () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.06 11.06A5.987 5.987 0 0021 12a5.987 5.987 0 00-9.94-4.94M12 21a9.003 9.003 0 008.82-7H3.18a9.003 9.003 0 008.82 7z" /></svg>,
  VideoCamera: () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18V6a2 2 0 012-2h6a2 2 0 012 2v12a2 2 0 01-2 2H7a2 2 0 01-2-2z" /></svg>,
  DocumentAdd: () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
  ChartBar: () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
};

const DashHome = () => {
  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-slate-800">대시보드</h1>
          <p className="text-slate-500 mt-2">환영합니다! 오늘의 활동을 확인하세요.</p>
        </header>

        <main>
          {/* 상단 통계 카드 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard icon={<Icons.Calendar />} title="이번 달 회의" value="24" change="+12%" color="violet" />
            <StatCard icon={<Icons.DocumentText />} title="번역된 문서" value="156" change="+5%" color="sky" />
            <StatCard icon={<Icons.Users />} title="총 참여자" value="89" change="+23%" color="emerald" />
            <StatCard icon={<Icons.Language />} title="지원 언어" value="12" change="+2" color="amber" />
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
            <ActionCard 
              icon={<Icons.VideoCamera />}
              title="즉시 회의 시작"
              description="실시간 번역과 함께 바로 화상 회의를 시작하세요."
            />
            <ActionCard 
              icon={<Icons.DocumentAdd />}
              title="문서 업로드"
              description="문서를 업로드하여 AI 번역을 시작하세요."
            />
            <ActionCard 
              icon={<Icons.ChartBar />}
              title="분석 보고서"
              description="번역 결과와 사용 통계를 확인하세요."
            />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashHome;