import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import DashBoardHeader from '../components/dashboard/dashboardHeader/DashBoardHeader';

const DashboardLayout = () => {
  // 모바일 사이드바 열림/닫힘 상태
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* 사이드바 */}
      <Sidebar 
        isOpen={isMobileSidebarOpen} 
        setIsOpen={setIsMobileSidebarOpen} 
      />

      {/* 메인 영역 */}
      <div className="flex flex-col flex-1 w-0">
        {/* 상단 헤더 */}
        <DashBoardHeader setIsMobileSidebarOpen={setIsMobileSidebarOpen} />

        {/* 콘텐츠 영역 (스크롤 가능) */}
        <main className="flex-1 overflow-y-auto p-2 md:p-2"> 
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
