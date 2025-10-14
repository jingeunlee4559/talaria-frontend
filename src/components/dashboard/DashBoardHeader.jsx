import React from 'react';
import { FiMenu, FiBell } from 'react-icons/fi';

// setIsMobileSidebarOpen 함수를 props로 받아옵니다.
const DashBoardHeader = ({ setIsMobileSidebarOpen }) => {
    return (
        <header className="sticky top-0 bg-white shadow-md z-10">
            {/* 'justify-between'을 제거하여 수동으로 정렬합니다. */}
            <div className="flex items-center p-4">
                {/* 모바일용 햄버거 버튼 */}
                <button
                    className="md:hidden text-gray-500 focus:outline-none"
                    onClick={() => setIsMobileSidebarOpen(true)}
                >
                    <FiMenu className="text-2xl" />
                </button>
                
                {/* --- 'Talaria' 텍스트가 있던 div가 삭제되었습니다 --- */}
                
                {/* 우측 아이콘 영역 */}
                {/* ml-auto: 왼쪽의 모든 여백을 차지하여 이 div를 오른쪽 끝으로 밀어냅니다. */}
                <div className="flex items-center space-x-4 ml-auto">
                    {/* 알림 버튼 */}
                    <button className="relative">
                        <FiBell className="text-xl text-gray-600 hover:text-purple-600 transition-colors" />
                        {/* 알림 뱃지 예시 */}
                        <span className="absolute -top-1 -right-1 flex h-4 w-4">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-4 w-4 bg-purple-500 justify-center items-center text-white text-xs">
                                3
                            </span>
                        </span>
                    </button>
                    
                    {/* 프로필 아이콘 버튼 */}
                    <button className="w-9 h-9 rounded-full overflow-hidden border-2 border-gray-200 hover:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition">
                        {/* 실제로는 사용자 프로필 이미지를 넣으면 됩니다. */}
                        <img 
                            src="https://placehold.co/100x100/E2E8F0/4A5568?text=U"
                            alt="User Profile" 
                            className="w-full h-full object-cover"
                        />
                    </button>
                </div>
            </div>
        </header>
    );
};

export default DashBoardHeader;

