import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { FiMenu } from 'react-icons/fi'; // 햄버거 메뉴 아이콘

const DashboardLayout = () => {
    // 모바일 사이드바의 열림/닫힘 상태
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

    return (
        <div className="relative min-h-screen md:flex">
            {/* Sidebar 컴포넌트에 상태와 상태 변경 함수를 props로 전달
            */}
            <Sidebar isOpen={isMobileSidebarOpen} setIsOpen={setIsMobileSidebarOpen} />
            
            <main className="flex-1">
                {/* 모바일 화면용 헤더 및 햄버거 버튼 */}
                <div className="md:hidden flex justify-between items-center p-4 bg-white shadow">
                    <span className="text-xl font-bold text-purple-700">Talaria</span>
                    <button onClick={() => setIsMobileSidebarOpen(true)}>
                        <FiMenu className="text-2xl" />
                    </button>
                </div>

                <div className="p-4 md:p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;