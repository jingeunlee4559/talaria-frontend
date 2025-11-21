// src/components/common/ModeToggle.jsx
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FiGlobe, FiBriefcase } from 'react-icons/fi';

const ModeToggle = ({ className = '' }) => {
    const location = useLocation();
    const navigate = useNavigate();

    const path = location.pathname.toLowerCase();
    const isCultureMode = path.startsWith('/culture');
    const isBusinessMode = path.startsWith('/business');

    const handleClick = (mode) => {
        if (mode === 'culture') {
            navigate('/culture/cultureHome');
        } else if (mode === 'business') {
            navigate('/business/Dashboardhome');
        }
    };

    const cultureActive = isCultureMode || (!isCultureMode && !isBusinessMode);

    // 비즈니스 모드 - 세련되고 프리미엄한 디자인 (사이드바용 컴팩트 버전)
    if (isBusinessMode) {
        return (
            <div className={['inline-flex items-center gap-1.5 rounded-xl px-1.5 py-1.5', 'bg-white border border-slate-200/80', 'shadow-lg shadow-slate-900/5', className].join(' ')}>
                <button
                    type="button"
                    onClick={() => handleClick('culture')}
                    className={[
                        'relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-300',
                        'group',
                        cultureActive ? 'bg-slate-50 text-slate-900' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50/50',
                    ].join(' ')}
                >
                    <FiGlobe className={['w-3.5 h-3.5 transition-all duration-300', cultureActive ? 'text-slate-700' : 'text-slate-400 group-hover:text-slate-600'].join(' ')} />
                    <span className="tracking-wide">Culture</span>
                    {cultureActive && <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-gradient-to-r from-violet-400 via-purple-400 to-pink-400 rounded-full" />}
                </button>
                <button
                    type="button"
                    onClick={() => handleClick('business')}
                    className={[
                        'relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-300',
                        'group overflow-hidden',
                        isBusinessMode
                            ? 'bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 text-white shadow-lg shadow-slate-900/25'
                            : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50/50',
                    ].join(' ')}
                >
                    {isBusinessMode && (
                        <>
                            <div className="absolute inset-0 bg-gradient-to-br from-slate-700 via-slate-600 to-slate-800 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.1),transparent_50%)]" />
                        </>
                    )}
                    <FiBriefcase className={['w-3.5 h-3.5 relative z-10 transition-all duration-300', isBusinessMode ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'].join(' ')} />
                    <span className="relative z-10 tracking-wide">Business</span>
                    {isBusinessMode && <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 rounded-full" />}
                </button>
            </div>
        );
    }

    // 문화/밈 모드 - MZ세대 감성, 화려하고 트렌디한 디자인
    return (
        <div
            className={[
                'inline-flex items-center rounded-full p-1 shadow-lg backdrop-blur-sm',
                'bg-gradient-to-r from-pink-100 via-purple-100 to-indigo-100',
                'border-2 border-white/50',
                className,
            ].join(' ')}
        >
            <button
                type="button"
                onClick={() => handleClick('culture')}
                className={[
                    'relative flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-bold transition-all duration-300',
                    cultureActive ? 'bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white shadow-xl scale-105' : 'text-slate-600 hover:text-slate-800 hover:scale-105',
                ].join(' ')}
            >
                {cultureActive && <div className="absolute inset-0 rounded-full bg-white/20 animate-pulse" />}
                <FiGlobe className="w-5 h-5 relative z-10" />
                <span className="relative z-10 flex items-center gap-1">
                    Culture
                    {cultureActive && <span className="text-xs">✨</span>}
                </span>
            </button>
            <button
                type="button"
                onClick={() => handleClick('business')}
                className={[
                    'relative flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-bold transition-all duration-300',
                    isBusinessMode ? 'bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white shadow-xl scale-105' : 'text-slate-600 hover:text-slate-800 hover:scale-105',
                ].join(' ')}
            >
                {isBusinessMode && <div className="absolute inset-0 rounded-full bg-white/20 animate-pulse" />}
                <FiBriefcase className="w-5 h-5 relative z-10" />
                <span className="relative z-10 flex items-center gap-1">
                    Business
                    {isBusinessMode && <span className="text-xs">💼</span>}
                </span>
            </button>
        </div>
    );
};

export default ModeToggle;
