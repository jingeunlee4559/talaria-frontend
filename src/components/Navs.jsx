// Navs.jsx
import React, { useState, useEffect, useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { scroller } from 'react-scroll';
import { UserContext } from '../contexts/UserContext';
import { Briefcase, Sparkles, Menu, X } from 'lucide-react';

const Navs = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, setUser } = useContext(UserContext);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // 로그인 상태 확인 - UserContext와 localStorage 모두 체크
    useEffect(() => {
        const loggedInUser = localStorage.getItem('loggedInUser');
        if (loggedInUser) {
            try {
                const userData = JSON.parse(loggedInUser);
                setUser(userData);
                setIsLoggedIn(true);
            } catch (error) {
                console.error('Failed to parse user data:', error);
                localStorage.removeItem('loggedInUser');
            }
        } else {
            setIsLoggedIn(false);
        }
    }, [location, setUser]);

    // user 상태가 변경될 때마다 로그인 상태 업데이트
    useEffect(() => {
        setIsLoggedIn(!!user);
    }, [user]);

    const handleScroll = (target) => {
        if (location.pathname !== '/') {
            navigate('/');
            setTimeout(() => {
                scroller.scrollTo(target, {
                    smooth: true,
                    duration: 600,
                    offset: -80,
                });
            }, 300);
        } else {
            scroller.scrollTo(target, {
                smooth: true,
                duration: 600,
                offset: -80,
            });
        }
        setIsMobileMenuOpen(false);
    };

    const handleStartClick = () => {
        navigate('/Register');
        setIsMobileMenuOpen(false);
    };

    const handleLogout = () => {
        localStorage.removeItem('loggedInUser');
        setUser(null);
        setIsLoggedIn(false);
        navigate('/');
        setIsMobileMenuOpen(false);
    };

    const handleBusinessClick = () => {
        navigate('/business/Dashboardhome');
        setIsMobileMenuOpen(false);
    };

    const handleCultureClick = () => {
        navigate('/culture/CultureHome');
        setIsMobileMenuOpen(false);
    };

    return (
        <header className="bg-white shadow-sm sticky top-0 z-50">
            <div className="container mx-auto px-4 py-3 sm:py-4">
                <div className="flex justify-between items-center">
                    {/* 로고 */}
                    <div className="flex items-center space-x-2 sm:space-x-4">
                        <Link to="/" className="text-xl sm:text-2xl font-bold text-purple-600 hover:text-purple-700 transition-colors">
                            Talaria
                        </Link>
                        <span className="text-xs sm:text-sm text-gray-500 hidden lg:block">AI 기반 실시간 번역 서비스</span>
                    </div>

                    {/* 데스크탑 네비게이션 */}
                    <nav className="hidden lg:flex items-center space-x-6 xl:space-x-8">
                        <span onClick={() => handleScroll('corefeatures')} className="text-gray-600 hover:text-purple-600 cursor-pointer transition-colors font-medium text-sm xl:text-base">
                            솔루션
                        </span>
                        <span onClick={() => handleScroll('features')} className="text-gray-600 hover:text-purple-600 cursor-pointer transition-colors font-medium text-sm xl:text-base">
                            비즈니스 기능
                        </span>
                        <span onClick={() => handleScroll('culture-features')} className="text-gray-600 hover:text-purple-600 cursor-pointer transition-colors font-medium text-sm xl:text-base">
                            문화/밈 기능
                        </span>
                    </nav>

                    {/* 데스크탑 버튼 영역 */}
                    <div className="hidden lg:flex items-center gap-2 xl:gap-3">
                        {!isLoggedIn ? (
                            <>
                                <Link to="/login" className="text-gray-600 hover:text-purple-600 transition-colors font-medium text-sm xl:text-base">
                                    로그인
                                </Link>
                                <button
                                    onClick={handleStartClick}
                                    className="bg-purple-600 text-white font-semibold py-2 px-4 xl:px-6 rounded-lg hover:bg-purple-700 transition-all duration-300 shadow-md hover:shadow-lg text-sm xl:text-base"
                                >
                                    무료로 시작하기
                                </button>
                            </>
                        ) : (
                            <>
                                {/* 비즈니스 버튼 */}
                                <button
                                    onClick={handleBusinessClick}
                                    className="group flex items-center gap-1.5 xl:gap-2 px-3 xl:px-4 py-2 bg-gradient-to-r from-slate-700 to-indigo-800 text-white font-semibold rounded-lg hover:from-slate-800 hover:to-indigo-900 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105 text-sm xl:text-base"
                                >
                                    <Briefcase className="w-3.5 h-3.5 xl:w-4 xl:h-4 group-hover:rotate-12 transition-transform" />
                                    <span>비즈니스</span>
                                </button>

                                {/* 문화/밈 버튼 */}
                                <button
                                    onClick={handleCultureClick}
                                    className="group flex items-center gap-1.5 xl:gap-2 px-3 xl:px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105 text-sm xl:text-base"
                                >
                                    <Sparkles className="w-3.5 h-3.5 xl:w-4 xl:h-4 group-hover:rotate-12 transition-transform" />
                                    <span>문화/밈</span>
                                </button>

                                {/* 구분선 */}
                                <div className="w-px h-8 bg-gray-300 mx-1"></div>

                                {/* 사용자 정보 */}
                                <div className="flex items-center gap-2">
                                    {user?.profileImageUrl ? (
                                        <img src={user.profileImageUrl} alt={user.name} className="w-8 h-8 xl:w-9 xl:h-9 rounded-full border-2 border-purple-200 shadow-sm" />
                                    ) : (
                                        <div className="w-8 h-8 xl:w-9 xl:h-9 rounded-full bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center text-white font-bold text-xs xl:text-sm shadow-sm">
                                            {user?.name?.charAt(0) || 'U'}
                                        </div>
                                    )}
                                    <span className="text-gray-700 font-medium hidden xl:block text-sm">{user?.name || '사용자'}</span>
                                </div>

                                {/* 로그아웃 버튼 */}
                                <button
                                    onClick={handleLogout}
                                    className="text-gray-600 hover:text-purple-600 transition-colors font-medium px-2 xl:px-3 py-2 rounded-lg hover:bg-purple-50 text-sm xl:text-base"
                                >
                                    로그아웃
                                </button>
                            </>
                        )}
                    </div>

                    {/* 모바일 메뉴 버튼 */}
                    <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="lg:hidden p-2 text-gray-600 hover:text-purple-600 transition-colors">
                        {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>

                {/* 모바일 메뉴 */}
                {isMobileMenuOpen && (
                    <div className="lg:hidden mt-4 pb-4 border-t border-gray-200 pt-4 space-y-3">
                        {/* 네비게이션 링크 */}
                        <div className="space-y-2">
                            <div
                                onClick={() => handleScroll('corefeatures')}
                                className="block px-4 py-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg cursor-pointer transition-colors font-medium"
                            >
                                솔루션
                            </div>
                            <div
                                onClick={() => handleScroll('features')}
                                className="block px-4 py-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg cursor-pointer transition-colors font-medium"
                            >
                                비즈니스 기능
                            </div>
                            <div
                                onClick={() => handleScroll('culture-features')}
                                className="block px-4 py-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg cursor-pointer transition-colors font-medium"
                            >
                                문화/밈 기능
                            </div>
                        </div>

                        {/* 로그인 상태별 버튼 */}
                        {!isLoggedIn ? (
                            <div className="space-y-2 pt-2 border-t border-gray-200">
                                <Link
                                    to="/login"
                                    className="block px-4 py-2 text-center text-gray-600 hover:text-purple-600 font-medium rounded-lg hover:bg-purple-50 transition-colors"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    로그인
                                </Link>
                                <button
                                    onClick={handleStartClick}
                                    className="w-full bg-purple-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-purple-700 transition-all duration-300 shadow-md"
                                >
                                    무료로 시작하기
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-2 pt-2 border-t border-gray-200">
                                {/* 사용자 정보 */}
                                <div className="flex items-center gap-3 px-4 py-2 bg-purple-50 rounded-lg">
                                    {user?.profileImageUrl ? (
                                        <img src={user.profileImageUrl} alt={user.name} className="w-10 h-10 rounded-full border-2 border-purple-200" />
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center text-white font-bold">
                                            {user?.name?.charAt(0) || 'U'}
                                        </div>
                                    )}
                                    <span className="text-gray-700 font-semibold">{user?.name || '사용자'}</span>
                                </div>

                                {/* 비즈니스 버튼 */}
                                <button
                                    onClick={handleBusinessClick}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-slate-700 to-indigo-800 text-white font-semibold rounded-lg shadow-md"
                                >
                                    <Briefcase className="w-4 h-4" />
                                    비즈니스
                                </button>

                                {/* 문화/밈 버튼 */}
                                <button
                                    onClick={handleCultureClick}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold rounded-lg shadow-md"
                                >
                                    <Sparkles className="w-4 h-4" />
                                    문화/밈
                                </button>

                                {/* 로그아웃 버튼 */}
                                <button onClick={handleLogout} className="w-full px-4 py-2 text-gray-600 hover:text-purple-600 font-medium rounded-lg hover:bg-purple-50 transition-colors">
                                    로그아웃
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </header>
    );
};

export default Navs;
