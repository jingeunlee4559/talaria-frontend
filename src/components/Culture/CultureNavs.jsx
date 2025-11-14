// CultureNavs.jsx
// (반응형 "스퀴즈" 문제 수정 최종본)

import React, { useState, useRef, useEffect, useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

import { Home, Compass, Radio, Users, MessagesSquare, Bell, Search, User, Signal, Menu, X, LogOut } from 'lucide-react';
import { UserContext } from '../../contexts/UserContext';

const CultureNavs = ({ onLogout }) => {
    const navigate = useNavigate();
    const [keyword, setKeyword] = useState('');
    const [mobileOpen, setMobileOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);

    const profileRef = useRef(null);
    const { user, setUser } = useContext(UserContext); // UserContext 사용

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        const q = keyword.trim();
        if (!q) return;
        navigate(`/culture/videos?query=${encodeURIComponent(q)}`);
        setMobileOpen(false);
    };

    const handleClickLogo = () => {
        navigate('/culture/cultureHome');
        setMobileOpen(false);
    };

    const handleClickMyPage = () => {
        navigate('/culture/mypage');
        setProfileOpen(false);
        setMobileOpen(false);
    };

    // Navs.jsx의 로그아웃 로직 적용
    const handleClickLogout = () => {
        try {
            // 'loggedInUser' 키만 삭제
            localStorage.removeItem('loggedInUser');
        } catch (e) {
            console.error('Failed to remove loggedInUser from localStorage', e);
        }

        // UserContext 상태 업데이트
        if (setUser) {
            setUser(null);
        }

        // 프롭으로 받은 추가 로그아웃 핸들러 (선택적)
        if (onLogout) {
            onLogout();
        }

        // 메인 페이지로 이동
        navigate('/');
        setProfileOpen(false);
        setMobileOpen(false);
    };

    // 프로필 드롭다운 바깥 클릭 시 닫기
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (profileRef.current && !profileRef.current.contains(e.target)) {
                setProfileOpen(false);
            }
        };
        if (profileOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [profileOpen]);

    const menuItems = [
        { to: '/culture/cultureHome', label: '홈', icon: Home, end: true },
        { to: '/culture/videos', label: '영상 탐색', icon: Compass },
        { to: '/culture/live', label: '라이브 시작', icon: Radio },
        { to: '/culture/friends', label: '친구', icon: Users },
        { to: '/culture/community', label: '커뮤니티', icon: MessagesSquare },
    ];

    // NavLink 스타일링 함수 (whitespace-nowrap 추가)
    const getNavLinkClass = ({ isActive }) =>
        [
            'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 whitespace-nowrap', // [수정] 줄바꿈 방지
            isActive ? 'text-pink-600 bg-pink-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100',
        ].join(' ');

    return (
        <header className="w-full border-b border-slate-200 bg-white/95 backdrop-blur-lg sticky top-0 z-40">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-20 items-center justify-between gap-6">
                    {/* 로고 영역 */}
                    <button type="button" onClick={handleClickLogo} className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-pink-400 via-sky-400 to-amber-300 text-white shadow-md">
                            <Signal className="h-5 w-5" />
                        </div>
                        <div className="hidden sm:flex flex-col text-left">
                            <span className="text-base font-semibold tracking-tight text-slate-900 whitespace-nowrap">
                                Talaria <span className="font-extrabold bg-gradient-to-r from-pink-500 via-sky-500 to-amber-400 bg-clip-text text-transparent">Culture</span>
                            </span>
                            {/* [수정] 로고 부제목은 lg 화면 이상에서만 표시 */}
                            <span className="text-xs text-slate-500 hidden lg:block whitespace-nowrap">함꼐 즐기는 문화공간</span>
                        </div>
                    </button>

                    {/* 중앙 네비 (데스크탑) */}
                    {/* 💥 [최종 수정] 💥
                        여기입니다! md:flex -> lg:flex 로 변경하여
                        모든 데스크탑 요소(검색창, 햄버거 숨김 등)와 브레이크포인트를 통일합니다.
                    */}
                    <nav className="hidden flex-1 items-center justify-center lg:flex gap-2 lg:gap-3">
                        {menuItems.map(({ to, label, icon: Icon, end }) => (
                            <NavLink key={to} to={to} end={end} className={getNavLinkClass}>
                                <Icon className="h-4 w-4" />
                                {/* [수정] 라벨 텍스트는 lg 화면 이상에서만 표시 */}
                                <span className="hidden lg:inline">{label}</span>
                                {to === '/culture/live' && <span className="ml-1 rounded-md bg-rose-500 px-1.5 py-0.5 text-[10px] font-semibold text-white shadow-sm hidden lg:inline">LIVE</span>}
                            </NavLink>
                        ))}
                    </nav>

                    {/* 오른쪽 영역 */}
                    <div className="flex items-center gap-3 sm:gap-4">
                        {/* [수정] 검색창도 lg 화면 이상에서만 표시 */}
                        <form
                            onSubmit={handleSearchSubmit}
                            className="hidden items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 shadow-sm transition-all duration-300
                                       hover:border-slate-300 hover:bg-white
                                       focus-within:border-pink-400/70 focus-within:bg-white focus-within:shadow-md lg:flex" // [수정] md:flex -> lg:flex
                        >
                            <Search className="h-4 w-4 text-slate-400" />
                            <input
                                type="text"
                                value={keyword}
                                onChange={(e) => setKeyword(e.target.value)}
                                placeholder="영상 / 밈 검색"
                                className="w-36 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none xl:w-48" // [수정] lg:w-48 -> xl:w-48
                            />
                        </form>

                        {/* 알림 */}
                        <button
                            type="button"
                            className="relative flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition-colors hover:border-pink-400/70 hover:text-pink-500"
                        >
                            <Bell className="h-5 w-5" />
                            <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full bg-gradient-to-tr from-emerald-400 via-sky-400 to-pink-400 ring-2 ring-white" />
                        </button>

                        {/* 프로필 + 드롭다운 (UserContext와 연동) */}
                        <div className="relative" ref={profileRef}>
                            <button
                                type="button"
                                onClick={() => setProfileOpen((v) => !v)}
                                className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-tr from-pink-400 via-sky-400 to-amber-300 text-white shadow-md overflow-hidden"
                            >
                                {user?.profileImageUrl ? (
                                    <img src={user.profileImageUrl} alt={user.name || '프로필'} className="h-full w-full object-cover" />
                                ) : user?.name ? (
                                    <span className="text-lg font-semibold">{user.name.charAt(0)}</span>
                                ) : (
                                    <User className="h-5 w-5" />
                                )}
                            </button>

                            {/* 드롭다운 메뉴 */}
                            {profileOpen && (
                                <div className="absolute right-0 mt-3 w-48 rounded-2xl border border-slate-200 bg-white p-2 text-sm shadow-[0_18px_40px_rgba(15,23,42,0.12)] z-50">
                                    {/* 유저 정보 표시 */}
                                    <div className="flex items-center gap-3 px-3 py-2 border-b border-slate-100 mb-2">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-tr from-pink-400 via-sky-400 to-amber-300 text-white overflow-hidden">
                                            {user?.profileImageUrl ? (
                                                <img src={user.profileImageUrl} alt={user.name} className="h-full w-full object-cover" />
                                            ) : user?.name ? (
                                                <span className="font-semibold">{user.name.charAt(0)}</span>
                                            ) : (
                                                <User className="h-4 w-4" />
                                            )}
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            {' '}
                                            {/* 💥 min-w-0 추가 (truncate 적용을 위해) */}
                                            <span className="font-semibold text-slate-800 truncate">{user?.name || '사용자'}</span>
                                            <span className="text-xs text-slate-500 truncate">{user?.email || '...'}</span>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={handleClickMyPage}
                                        className="flex w-full items-center gap-3 px-3 py-2 text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                                    >
                                        <User className="h-4 w-4 text-pink-500" />
                                        <span>마이페이지</span>
                                    </button>
                                    <button type="button" onClick={handleClickLogout} className="flex w-full items-center gap-3 px-3 py-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors">
                                        <LogOut className="h-4 w-4" />
                                        <span>로그아웃</span>
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* [수정] 모바일 햄버거는 lg 화면 미만에서 표시 */}
                        <button
                            type="button"
                            onClick={() => {
                                setMobileOpen((v) => !v);
                                setProfileOpen(false);
                            }}
                            className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm lg:hidden" // [수정] md:hidden -> lg:hidden
                        >
                            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                        </button>
                    </div>
                </div>

                {/* [수정] 모바일 드롭다운 메뉴도 lg 화면 미만에서 표시 */}
                <div
                    className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${mobileOpen ? 'max-h-screen' : 'max-h-0'}`} // [수정] md:hidden -> lg:hidden
                >
                    {/* 모바일 메뉴 컨테이너 */}
                    <div className="pb-4">
                        <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-lg">
                            {/* 모바일 검색 */}
                            <form onSubmit={handleSearchSubmit} className="mb-3 flex items-center gap-2 rounded-2xl bg-slate-50 px-3 py-2.5 border border-slate-200">
                                <Search className="h-4 w-4 text-slate-400" />
                                <input
                                    type="text"
                                    value={keyword}
                                    onChange={(e) => setKeyword(e.target.value)}
                                    placeholder="콘텐츠 검색..."
                                    className="flex-1 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
                                />
                            </form>

                            {/* 메뉴 리스트 */}
                            <ul className="space-y-1.5">
                                {menuItems.map(({ to, label, icon: Icon, end }) => (
                                    <li key={to}>
                                        <NavLink
                                            to={to}
                                            end={end}
                                            onClick={() => setMobileOpen(false)}
                                            className={({ isActive }) =>
                                                [
                                                    'flex items-center justify-between rounded-xl px-3 py-3 text-sm font-medium transition-all duration-150',
                                                    isActive ? 'bg-gradient-to-r from-pink-500 via-sky-500 to-amber-400 text-white shadow-md' : 'bg-slate-50 text-slate-800 hover:bg-slate-100',
                                                ].join(' ')
                                            }
                                        >
                                            <div className="flex items-center gap-3">
                                                <Icon className="h-4 w-4" />
                                                <span>{label}</span>
                                            </div>
                                            {to === '/culture/live' && <span className="rounded-md bg-white/30 px-2 py-0.5 text-[10px] font-semibold text-white">LIVE</span>}
                                        </NavLink>
                                    </li>
                                ))}
                            </ul>

                            {/* 계정 액션 (모바일 하단) */}
                            <div className="mt-3 border-t border-slate-200 pt-3 space-y-1.5">
                                <button type="button" onClick={handleClickMyPage} className="flex w-full items-center gap-3 rounded-xl bg-slate-50 px-3 py-3 text-sm text-slate-800 hover:bg-slate-100">
                                    <User className="h-4 w-4 text-pink-500" />
                                    <span>마이페이지</span>
                                </button>
                                <button type="button" onClick={handleClickLogout} className="flex w-full items-center gap-3 rounded-xl bg-rose-50 px-3 py-3 text-sm text-rose-500 hover:bg-rose-100">
                                    <LogOut className="h-4 w-4" />
                                    <span>로그아웃</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default CultureNavs;
