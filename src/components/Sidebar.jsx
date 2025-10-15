import React from 'react';
import { NavLink } from 'react-router-dom';
import { FiHome, FiVideo, FiFileText, FiSettings, FiX } from 'react-icons/fi';

const Sidebar = ({ isOpen, setIsOpen,className  }) => {
    const menuItems = [
        { name: '대시보드', icon: FiHome, path: '/dashboardhome' },
        { name: '영상 회의', icon: FiVideo, path: '/dashboardhome/DashVideo' },
        { name: '문서 관리', icon: FiFileText, path: '/dashboardhome/DashDocuments' },
        { name: '설정', icon: FiSettings, path: '/dashboardhome/settings' },
    ];

    return (
        <>
            {/* 모바일용 Overlay */}
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-black opacity-50 z-20 md:hidden"
                    onClick={() => setIsOpen(false)}
                ></div>
            )}

            {/* 사이드바 본문 */}
            <aside
                className={`
                    group // group-hover를 사용하기 위해 추가
                    bg-white text-gray-800 h-screen shadow-lg
                    fixed inset-y-0 left-0 transform z-30 transition-transform duration-300 ease-in-out
                    ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                    
                    md:relative md:translate-x-0
                    md:transition-all md:duration-300 md:ease-in-out
                    md:w-20 md:hover:w-64 

                    flex flex-col p-4 w-64 
                    ${className}
                `}
            >
                {/* 로고 & 모바일 닫기 버튼 */}
                <div className="flex items-center justify-between mb-8 h-16">
                    <div className="flex items-center">
                        {/* ⚠️ 이 img 태그의 className을 아래와 같이 수정합니다 ⚠️ */}
                        <img 
                            src='/img/hermes_logo.jpg' 
                            alt='Talaria Logo' // alt 속성은 접근성을 위해 중요합니다.
                            className="
                                w-12 h-12 
                                object-contain 
                                transition-transform duration-300 md:group-hover:rotate-12
                                md:mx-auto md:group-hover:ml-0 // 축소 시 중앙, 확장 시 왼쪽 정렬
                            "
                        />
                        <span className="
                            text-3xl font-bold text-gray-900 ml-3 whitespace-nowrap
                            transition-all duration-200
                            md:opacity-0 md:w-0 md:group-hover:opacity-100 md:group-hover:w-auto 
                        ">
                            Talaria
                        </span>
                    </div>
                    <button onClick={() => setIsOpen(false)} className="md:hidden text-2xl p-1">
                        <FiX />
                    </button>
                </div>
                
                {/* 메뉴 아이템은 동일 */}
                <nav className="flex-1">
                    <ul>
                        {menuItems.map((item, index) => (
                            <li key={index} className="mb-2">
                                <NavLink
                                    to={item.path}
                                    className={({ isActive }) => `
                                        flex items-center py-3 px-4 rounded-lg
                                        text-gray-700 hover:bg-purple-100 hover:text-purple-700
                                        transition-colors duration-200
                                        ${isActive ? 'bg-purple-100 text-purple-700 font-semibold' : ''}
                                    `}
                                    end
                                >
                                    <item.icon className="text-2xl min-w-[2rem]" />
                                    <span className="
                                        text-lg ml-4 whitespace-nowrap
                                        transition-opacity duration-200
                                        md:opacity-0 md:group-hover:opacity-100
                                    ">
                                        {item.name}
                                    </span>
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </nav>
            </aside>
        </>
    );
};

export default Sidebar;