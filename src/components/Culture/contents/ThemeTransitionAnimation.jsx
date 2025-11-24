// src/components/Culture/contents/ThemeTransitionAnimation.jsx
import React, { useEffect, useState, useRef } from 'react';
import { BACKGROUND_THEMES } from './backgroundThemes';

// 🎤 KPDH 이미지 import
import huntrixImg from '../../../assets/kpdh/huntrix.png';
import derpyTigerImg from '../../../assets/kpdh/derpy_tiger.png';

const ThemeTransitionAnimation = ({ themeId, onComplete }) => {
    const [particles, setParticles] = useState([]);
    const [fadeOut, setFadeOut] = useState(false);
    const containerRef = useRef(null);
    const theme = BACKGROUND_THEMES[themeId];

    // 🎤 KPDH 테마 감지
    const isKPDHTheme = themeId?.startsWith('kpdh_');

    // 🎤 테마별 이미지 선택
    const getThemeImage = () => {
        if (themeId === 'kpdh_derpy') return derpyTigerImg;
        if (isKPDHTheme) return huntrixImg;
        return null;
    };

    // 🎤 KPDH 음표 파티클
    const MUSIC_NOTES = ['🎵', '🎶', '🎤', '🎼', '🎸', '🎹', '🎺', '🎻', '🥁', '🎧', '💿', '🎙️'];

    // 🎤 테마별 그라데이션
    const getThemeGradient = () => {
        const gradients = {
            kpdh_huntrix: 'linear-gradient(135deg, #a855f7 0%, #ec4899 50%, #6b21a8 100%)',
            kpdh_demon: 'linear-gradient(135deg, #7c3aed 0%, #c026d3 50%, #1e1b4b 100%)',
            kpdh_derpy: 'linear-gradient(135deg, #06b6d4 0%, #22d3ee 50%, #0ea5e9 100%)',
            kpdh_concert: 'linear-gradient(135deg, #9333ea 0%, #ec4899 50%, #f97316 100%)',
            kpdh_golden: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #facc15 100%)',
            default: theme?.gradient || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        };
        return gradients[themeId] || gradients.default;
    };

    useEffect(() => {
        // 🎤 파티클 생성
        const newParticles = [];
        const particleCount = isKPDHTheme ? 40 : 30; // KPDH는 더 많이!

        for (let i = 0; i < particleCount; i++) {
            newParticles.push({
                id: i,
                // 🎤 KPDH 테마는 음표, 기본 테마는 별
                emoji: isKPDHTheme ? MUSIC_NOTES[Math.floor(Math.random() * MUSIC_NOTES.length)] : '⭐',
                left: Math.random() * 100,
                delay: Math.random() * 2,
                duration: 3 + Math.random() * 2,
                size: isKPDHTheme ? 1.5 + Math.random() * 1.5 : 1 + Math.random(), // 음표는 더 크게
                rotation: Math.random() * 360,
                blur: Math.random() * 2,
            });
        }
        setParticles(newParticles);

        // 🎤 애니메이션 타이밍
        const fadeTimer = setTimeout(() => setFadeOut(true), 2500);
        const completeTimer = setTimeout(() => {
            onComplete && onComplete();
        }, 3000);

        return () => {
            clearTimeout(fadeTimer);
            clearTimeout(completeTimer);
        };
    }, [themeId, onComplete, isKPDHTheme]);

    if (!theme) return null;

    const themeImage = getThemeImage();
    const themeGradient = getThemeGradient();

    return (
        <div
            ref={containerRef}
            className={`fixed inset-0 z-[9999] flex items-center justify-center transition-opacity duration-1000 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}
            style={{
                background: themeGradient,
                backdropFilter: 'blur(10px)',
            }}
        >
            {/* 🎤 KPDH 로고 이미지 (중앙) */}
            {isKPDHTheme && themeImage && (
                <div className="absolute inset-0 flex items-center justify-center z-20">
                    <div className="relative animate-kpdh-logo-entrance">
                        <img
                            src={themeImage}
                            alt="K-POP Demon Hunters"
                            className="w-64 md:w-96 h-auto object-contain drop-shadow-2xl animate-kpdh-logo-glow"
                            style={{
                                filter: 'drop-shadow(0 0 30px rgba(255, 255, 255, 0.8)) drop-shadow(0 0 60px rgba(168, 85, 247, 0.6))',
                            }}
                        />
                        {/* 글로우 링 */}
                        <div
                            className="absolute inset-0 rounded-full animate-kpdh-ring-pulse"
                            style={{
                                background: `radial-gradient(circle, ${theme.gradient?.includes('pink') ? 'rgba(236, 72, 153, 0.3)' : 'rgba(168, 85, 247, 0.3)'} 0%, transparent 70%)`,
                                filter: 'blur(40px)',
                            }}
                        />
                    </div>
                </div>
            )}

            {/* 📛 일반 테마 텍스트 */}
            {!isKPDHTheme && (
                <div className="relative z-20 text-center px-6 animate-fade-in-scale">
                    <div className="relative">
                        <h1
                            className="text-5xl md:text-7xl font-black mb-4 animate-glow-pulse"
                            style={{
                                background: 'linear-gradient(45deg, #fff, rgba(255,255,255,0.8))',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text',
                                textShadow: '0 0 40px rgba(255,255,255,0.8), 0 0 80px rgba(255,255,255,0.4)',
                            }}
                        >
                            {theme.name}
                        </h1>
                        <p className="text-white text-xl md:text-2xl font-medium opacity-90 drop-shadow-lg">{theme.description}</p>
                    </div>
                </div>
            )}

            {/* 🎤 KPDH 테마 이름 (하단) */}
            {isKPDHTheme && (
                <div className="absolute bottom-20 left-0 right-0 z-20 text-center animate-slide-up-fade">
                    <div className="inline-block px-8 py-4 rounded-full bg-white/10 backdrop-blur-xl border border-white/30 shadow-2xl">
                        <h2 className="text-3xl md:text-4xl font-black text-white drop-shadow-lg">{theme.name}</h2>
                        <p className="text-white/90 text-sm md:text-base mt-1 font-medium">{theme.description}</p>
                    </div>
                </div>
            )}

            {/* 🎵 파티클 애니메이션 */}
            <div className="absolute inset-0 overflow-hidden z-10">
                {particles.map((particle) => (
                    <div
                        key={particle.id}
                        className="absolute animate-fall-and-fade"
                        style={{
                            left: `${particle.left}%`,
                            top: '-10%',
                            fontSize: `${particle.size}rem`,
                            animationDelay: `${particle.delay}s`,
                            animationDuration: `${particle.duration}s`,
                            transform: `rotate(${particle.rotation}deg)`,
                            filter: `blur(${particle.blur}px)`,
                            // 🎤 KPDH 음표는 더 밝게
                            textShadow: isKPDHTheme ? '0 0 10px rgba(255,255,255,0.8), 0 0 20px rgba(255,255,255,0.6)' : '0 0 10px rgba(255,255,255,0.5)',
                        }}
                    >
                        {particle.emoji}
                    </div>
                ))}
            </div>

            {/* 🎤 하단 파도 효과 (KPDH만) */}
            {isKPDHTheme && (
                <div className="absolute bottom-0 left-0 right-0 z-0">
                    <svg className="w-full h-32 md:h-48" viewBox="0 0 1440 320" preserveAspectRatio="none">
                        <path
                            fill="rgba(255,255,255,0.1)"
                            fillOpacity="1"
                            d="M0,160L48,144C96,128,192,96,288,106.7C384,117,480,171,576,181.3C672,192,768,160,864,138.7C960,117,1056,107,1152,117.3C1248,128,1344,160,1392,176L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
                            className="animate-wave"
                        />
                    </svg>
                </div>
            )}

            <style>{`
                @keyframes fall-and-fade {
                    0% {
                        transform: translateY(0) rotate(0deg);
                        opacity: 0;
                    }
                    10% {
                        opacity: 1;
                    }
                    90% {
                        opacity: 1;
                    }
                    100% {
                        transform: translateY(120vh) rotate(360deg);
                        opacity: 0;
                    }
                }

                @keyframes fade-in-scale {
                    0% {
                        opacity: 0;
                        transform: scale(0.8);
                    }
                    100% {
                        opacity: 1;
                        transform: scale(1);
                    }
                }

                @keyframes glow-pulse {
                    0%, 100% {
                        text-shadow: 0 0 40px rgba(255,255,255,0.8), 0 0 80px rgba(255,255,255,0.4);
                    }
                    50% {
                        text-shadow: 0 0 60px rgba(255,255,255,1), 0 0 120px rgba(255,255,255,0.6);
                    }
                }

                /* 🎤 KPDH 로고 등장 애니메이션 */
                @keyframes kpdh-logo-entrance {
                    0% {
                        opacity: 0;
                        transform: scale(0.5) rotateY(180deg);
                    }
                    50% {
                        opacity: 1;
                        transform: scale(1.1) rotateY(0deg);
                    }
                    100% {
                        opacity: 1;
                        transform: scale(1) rotateY(0deg);
                    }
                }

                /* 🎤 로고 글로우 효과 */
                @keyframes kpdh-logo-glow {
                    0%, 100% {
                        filter: drop-shadow(0 0 30px rgba(255, 255, 255, 0.8)) drop-shadow(0 0 60px rgba(168, 85, 247, 0.6));
                    }
                    50% {
                        filter: drop-shadow(0 0 50px rgba(255, 255, 255, 1)) drop-shadow(0 0 100px rgba(236, 72, 153, 0.8));
                    }
                }

                /* 🎤 글로우 링 펄스 */
                @keyframes kpdh-ring-pulse {
                    0%, 100% {
                        transform: scale(1);
                        opacity: 0.3;
                    }
                    50% {
                        transform: scale(1.5);
                        opacity: 0.6;
                    }
                }

                /* 🎤 하단 텍스트 슬라이드 */
                @keyframes slide-up-fade {
                    0% {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    100% {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                /* 🎤 파도 애니메이션 */
                @keyframes wave {
                    0%, 100% {
                        transform: translateX(0) scaleY(1);
                    }
                    50% {
                        transform: translateX(-25%) scaleY(1.2);
                    }
                }

                .animate-fall-and-fade {
                    animation: fall-and-fade linear forwards;
                }

                .animate-fade-in-scale {
                    animation: fade-in-scale 0.8s ease-out forwards;
                }

                .animate-glow-pulse {
                    animation: glow-pulse 2s ease-in-out infinite;
                }

                .animate-kpdh-logo-entrance {
                    animation: kpdh-logo-entrance 1.2s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
                }

                .animate-kpdh-logo-glow {
                    animation: kpdh-logo-glow 2s ease-in-out infinite;
                }

                .animate-kpdh-ring-pulse {
                    animation: kpdh-ring-pulse 2s ease-in-out infinite;
                }

                .animate-slide-up-fade {
                    animation: slide-up-fade 0.8s ease-out 0.5s forwards;
                    opacity: 0;
                }

                .animate-wave {
                    animation: wave 6s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
};

export default ThemeTransitionAnimation;