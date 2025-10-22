import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FiHome, FiVideo, FiFileText, FiSettings, FiX, FiLogOut } from 'react-icons/fi';
import Swal from 'sweetalert2';
import { Calendar } from 'lucide-react';

const Sidebar = ({ isOpen, setIsOpen, className }) => {
    const navigate = useNavigate();
    const menuItems = [
        { name: '대시보드', icon: FiHome, path: '/dashboardhome' },
        { name: '영상 회의', icon: FiVideo, path: '/dashboardhome/DashVideo' },
        { name: '문서 관리', icon: FiFileText, path: '/dashboardhome/DashDocuments' },
        { name: '일정', icon: Calendar, path: '/dashboardhome/Schedule' },
        { name: '설정', icon: FiSettings, path: '/dashboardhome/settings' },
    ];

    const handleLogout = () => {
        console.log('로그아웃 처리 중...');
        Swal.fire({
            title: '로그아웃 하시겠습니까?',
            text: '현재 세션이 종료됩니다.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#8B5CF6',
            cancelButtonColor: '#d33',
            confirmButtonText: '네, 로그아웃 할게요',
            cancelButtonText: '취소',
        }).then((result) => {
            if (result.isConfirmed) {
                Swal.fire('로그아웃 완료!', '성공적으로 로그아웃되었습니다.', 'success');
                navigate('/');
            }
        });
    };
    return (
        <>
            {/* 모바일용 Overlay */}
            {isOpen && <div className="fixed inset-0 bg-black opacity-70 z-40 md:hidden" onClick={() => setIsOpen(false)}></div>}

            {/* 사이드바 본문 - Slate-900으로 더 깊은 다크톤 적용 */}
            <aside
                className={`
                    group
                    bg-slate-900 text-gray-300 h-screen shadow-2xl
                    fixed inset-y-0 left-0 transform z-50 transition-transform duration-300 ease-in-out
                    ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                    
                    md:relative md:translate-x-0
                    md:transition-all md:duration-300 md:ease-in-out
                    md:w-20 md:hover:w-64 

                    flex flex-col p-4 w-64 
                    ${className}
                `}
            >
                {/* 로고 & 모바일 닫기 버튼 */}
                <div className="flex items-center justify-between mb-8 h-16 border-b border-slate-700/50 pb-4">
                    <div className="flex items-center overflow-hidden">
                        <img
                            src="/img/hermes_logo.jpg"
                            alt="Talaria Logo"
                            className="
                                w-10 h-10 rounded-full
                                object-cover 
                                transition-transform duration-500 md:group-hover:scale-110
                                md:mx-auto md:group-hover:ml-0 
                                ring-2 ring-indigo-500/50
                            "
                        />
                        <span
                            className="
                            text-2xl font-extrabold text-white ml-3 whitespace-nowrap
                            transition-all duration-300
                            md:opacity-0 md:w-0 md:group-hover:opacity-100 md:group-hover:w-auto 
                            "
                        >
                            Talaria
                        </span>
                    </div>
                    <button onClick={() => setIsOpen(false)} className="md:hidden text-gray-400 hover:text-white p-1">
                        <FiX className="text-3xl" />
                    </button>
                </div>

                {/* 메뉴 아이템 */}
                <nav className="flex-1 space-y-1 mt-4">
                    {menuItems.map((item, index) => (
                        <NavLink
                            key={index}
                            to={item.path}
                            end
                            // 1. className prop: 활성화 여부를 스타일링에 반영
                            className={({ isActive }) => `
                                relative
                                flex items-center py-3 px-3 rounded-xl
                                transition-all duration-200 
                                text-gray-300 hover:bg-slate-800 hover:text-indigo-400
                                
                                ${isActive ? 'text-white font-semibold bg-slate-800/80' : ''}
                            `}
                        >
                            {/* 2. children prop: NavLink의 자식 요소를 렌더 함수로 정의하여 isActive를 내부에서 사용 */}
                            {({ isActive }) => (
                                <>
                                    {/* 🚀 수정된 활성화 표시: 세로 강조 막대 */}
                                    {isActive && <div className="absolute left-0 top-1 bottom-1 w-1 bg-indigo-500 rounded-full"></div>}

                                    <item.icon
                                        className={`
                                            text-2xl min-w-[2rem] ml-1
                                            transition-transform duration-200
                                            md:group-hover:scale-105
                                            ${isActive ? 'text-indigo-400' : ''} // 활성화 시 아이콘 색상 변경
                                        `}
                                    />
                                    <span
                                        className="
                                        text-base ml-4 whitespace-nowrap font-medium
                                        transition-opacity duration-200
                                        md:opacity-0 md:w-0 md:group-hover:opacity-100 md:group-hover:w-auto 
                                        "
                                    >
                                        {item.name}
                                    </span>
                                </>
                            )}
                        </NavLink>
                    ))}
                </nav>

                {/* 로그아웃 버튼 */}
                <div className="mt-auto pt-4 border-t border-slate-700">
                    <button
                        onClick={handleLogout}
                        className="
                            w-full flex items-center py-3 px-3 rounded-xl
                            transition-all duration-200
                            text-red-400 bg-slate-800 hover:bg-red-900/40 hover:text-red-300
                            font-medium
                        "
                    >
                        <FiLogOut className="text-2xl min-w-[2rem]" />
                        <span
                            className="
                            text-base ml-4 whitespace-nowrap
                            transition-opacity duration-200
                            md:opacity-0 md:group-hover:opacity-100
                            "
                        >
                            로그아웃
                        </span>
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
