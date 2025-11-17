// src/components/Culture/LiveView/ThemeTransitionAnimation.jsx
import React, { useState, useEffect } from 'react';
import { Sparkles, Star } from 'lucide-react';
import picachuImg from '../../../assets/themes/picachu.png';

// 🎭 테마별 캐릭터 및 애니메이션 설정
const THEME_CHARACTERS = {
    pokemon: {
        imageUrl: picachuImg,
        name: '피카츄',
        animation: 'bounce-welcome',
        particles: ['⚡', '✨', '💫', '⭐'],
        message: '피카피카~! 포켓몬 세계로 어서와!',
        sound: 'Pika Pika!',
    },
    japanese: {
        emoji: '🐱',
        name: '마네키네코',
        animation: 'wave-paw',
        particles: ['🌸', '🎌', '💮'],
        message: 'いらっしゃいませ! (어서오세요!)',
        sound: 'ニャー!',
    },
    korean: {
        emoji: '🏯',
        name: '한복소녀',
        animation: 'bow',
        particles: ['🌸', '🎊', '✨'],
        message: '환영합니다! 한국 전통의 아름다움을 느껴보세요',
        sound: '환영해요!',
    },
    underwater: {
        emoji: '🐬',
        name: '돌핀',
        animation: 'jump-wave',
        particles: ['💧', '🌊', '🫧'],
        message: '바닷속 세계로 풍덩!',
        sound: 'Click Click!',
    },
    galaxy: {
        emoji: '🌟',
        name: '스타',
        animation: 'twinkle-spin',
        particles: ['⭐', '✨', '💫', '🌠'],
        message: '은하수를 여행하세요!',
        sound: 'Twinkle~',
    },
    sunset: {
        emoji: '🌅',
        name: '선셋',
        animation: 'fade-glow',
        particles: ['☀️', '🌤️', '🌈'],
        message: '아름다운 석양이 펼쳐집니다',
        sound: 'Shine~',
    },
    default: {
        emoji: '✨',
        name: '매직',
        animation: 'twinkle-spin',
        particles: ['✨', '💫', '⭐'],
        message: '환영합니다!',
        sound: 'Magic~',
    },
    aurora: {
        emoji: '🌌',
        name: '오로라',
        animation: 'fade-glow',
        particles: ['✨', '💫', '🌟'],
        message: '신비로운 오로라를 만나보세요',
        sound: 'Aurora~',
    },
    tropical: {
        emoji: '🌴',
        name: '트로피컬',
        animation: 'wave-paw',
        particles: ['🌺', '🌴', '🦜'],
        message: '열대의 낙원으로!',
        sound: 'Tropical~',
    },
    anime: {
        emoji: '🎌',
        name: '애니메이션',
        animation: 'bounce-welcome',
        particles: ['✨', '💫', '🌟'],
        message: '애니메이션 세계로!',
        sound: 'Anime~',
    },
    minecraft: {
        emoji: '⛏️',
        name: '마인크래프트',
        animation: 'bounce-welcome',
        particles: ['🟩', '🟫', '⛏️'],
        message: '크래프팅 시작!',
        sound: 'Mine~',
    },
    fantasy: {
        emoji: '🏰',
        name: '판타지',
        animation: 'twinkle-spin',
        particles: ['✨', '🔮', '⚔️'],
        message: '판타지 세계로!',
        sound: 'Fantasy~',
    },
    spring: {
        emoji: '🌸',
        name: '봄',
        animation: 'wave-paw',
        particles: ['🌸', '🦋', '🌺'],
        message: '봄이 찾아왔어요!',
        sound: 'Spring~',
    },
    summer: {
        emoji: '☀️',
        name: '여름',
        animation: 'fade-glow',
        particles: ['☀️', '🌊', '🏖️'],
        message: '뜨거운 여름!',
        sound: 'Summer~',
    },
    autumn: {
        emoji: '🍂',
        name: '가을',
        animation: 'wave-paw',
        particles: ['🍂', '🍁', '🌰'],
        message: '가을의 정취를!',
        sound: 'Autumn~',
    },
    winter: {
        emoji: '❄️',
        name: '겨울',
        animation: 'twinkle-spin',
        particles: ['❄️', '⛄', '🎿'],
        message: '하얀 겨울 나라로!',
        sound: 'Winter~',
    },
};

// 🎨 메인 애니메이션 컴포넌트
const ThemeTransitionAnimation = ({ themeId, onComplete }) => {
    const [particles, setParticles] = useState([]);
    const [showCharacter, setShowCharacter] = useState(false);
    const [showMessage, setShowMessage] = useState(false);
    const [showSound, setShowSound] = useState(false);

    const character = THEME_CHARACTERS[themeId] || THEME_CHARACTERS.default;

    useEffect(() => {
        // 1단계: 캐릭터 등장 (0.2초)
        setTimeout(() => setShowCharacter(true), 100);

        // 2단계: 파티클 폭발 (0.4초)
        setTimeout(() => {
            const newParticles = Array.from({ length: 40 }, (_, i) => ({
                id: i,
                emoji: character.particles[Math.floor(Math.random() * character.particles.length)],
                x: 50,
                y: 50,
                angle: (Math.PI * 2 * i) / 40,
                delay: Math.random() * 0.2,
                size: Math.random() * 2 + 1,
            }));
            setParticles(newParticles);
        }, 400);

        // 3단계: 사운드 텍스트 표시 (0.6초)
        setTimeout(() => setShowSound(true), 600);

        // 4단계: 메시지 표시 (1초)
        setTimeout(() => setShowMessage(true), 1000);

        // 5단계: 페이드아웃 및 완료 (2.8초)
        const completeTimer = setTimeout(() => {
            onComplete?.();
        }, 2800);

        return () => clearTimeout(completeTimer);
    }, [themeId]);

    return (
        <div className="fixed inset-0 z-[10000] pointer-events-none overflow-hidden">
            {/* 배경 오버레이 - 그라데이션 효과 */}
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 via-pink-400/20 to-purple-400/20 animate-fade-in backdrop-blur-sm" />

            {/* 파티클 폭발 효과 */}
            <div className="absolute inset-0">
                {particles.map((particle) => (
                    <div
                        key={particle.id}
                        className="absolute animate-particle-burst"
                        style={{
                            left: '50%',
                            top: '50%',
                            fontSize: `${particle.size}rem`,
                            '--angle': `${particle.angle}rad`,
                            animationDelay: `${particle.delay}s`,
                        }}
                    >
                        {particle.emoji}
                    </div>
                ))}
            </div>

            {/* 캐릭터 등장 */}
            <div className="absolute inset-0 flex items-center justify-center">
                <div className={`transition-all duration-700 ease-out ${showCharacter ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-0 translate-y-32'}`}>
                    {/* 캐릭터 뒤 빛나는 효과 */}
                    <div className="absolute inset-0 bg-yellow-300 rounded-full blur-3xl opacity-50 animate-pulse" style={{ width: '200px', height: '200px', margin: 'auto' }} />

                    {/* 피카츄 이미지 or 이모지 */}
                    {character.imageUrl ? (
                        <div className={`relative animate-${character.animation}`}>
                            <img src={character.imageUrl} alt={character.name} className="w-48 h-48 md:w-64 md:h-64 object-contain filter drop-shadow-2xl" />
                            {/* 전기 효과 (피카츄 전용) */}
                            <div className="absolute -top-4 -right-4 text-6xl animate-spark">⚡</div>
                            <div className="absolute -bottom-4 -left-4 text-4xl animate-spark" style={{ animationDelay: '0.3s' }}>
                                ⚡
                            </div>
                        </div>
                    ) : (
                        <div className={`text-9xl filter drop-shadow-2xl animate-${character.animation}`}>{character.emoji}</div>
                    )}
                </div>
            </div>

            {/* 사운드 텍스트 (말풍선 스타일) */}
            {showSound && (
                <div className="absolute top-1/3 left-1/2 -translate-x-1/2 animate-bounce-in">
                    <div className="relative bg-white rounded-3xl px-8 py-4 shadow-2xl border-4 border-yellow-400">
                        <p className="text-3xl font-black text-gray-800 whitespace-nowrap">{character.sound}</p>
                        {/* 말풍선 꼬리 */}
                        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-t-[20px] border-t-white" />
                        <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[22px] border-l-transparent border-r-[22px] border-r-transparent border-t-[22px] border-t-yellow-400" />
                    </div>
                </div>
            )}

            {/* 환영 메시지 */}
            {showMessage && (
                <div className="absolute bottom-24 md:bottom-32 left-0 right-0 flex justify-center animate-slide-up px-4">
                    <div className="relative">
                        {/* 글로우 효과 */}
                        <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 rounded-3xl blur-xl opacity-50" />

                        {/* 메시지 카드 */}
                        <div className="relative bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl px-6 md:px-8 py-4 md:py-5 border-4 border-pink-300 max-w-2xl">
                            <div className="flex flex-col md:flex-row items-center gap-3 md:gap-4">
                                <Sparkles className="w-6 h-6 md:w-8 md:h-8 text-pink-500 animate-spin-slow flex-shrink-0" />
                                <p className="text-lg md:text-2xl font-bold text-gray-800 text-center md:text-left leading-tight">{character.message}</p>
                                <Star className="w-6 h-6 md:w-8 md:h-8 text-yellow-500 animate-pulse flex-shrink-0" />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                /* 기본 애니메이션 */
                @keyframes fade-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                /* 파티클 폭발 - 더 화려하게 */
                @keyframes particle-burst {
                    0% {
                        transform: translate(-50%, -50%) translate(0, 0) scale(0) rotate(0deg);
                        opacity: 0;
                    }
                    10% {
                        opacity: 1;
                    }
                    100% {
                        transform: translate(-50%, -50%) 
                                   translate(
                                     calc(cos(var(--angle)) * 350px), 
                                     calc(sin(var(--angle)) * 350px)
                                   ) 
                                   scale(2) 
                                   rotate(1080deg);
                        opacity: 0;
                    }
                }

                /* 피카츄 바운스 환영 */
                @keyframes bounce-welcome {
                    0%, 100% { transform: translateY(0) scale(1) rotate(0deg); }
                    20% { transform: translateY(-40px) scale(1.15) rotate(-8deg); }
                    40% { transform: translateY(0) scale(1) rotate(0deg); }
                    60% { transform: translateY(-20px) scale(1.08) rotate(8deg); }
                    80% { transform: translateY(0) scale(1) rotate(0deg); }
                }

                /* 손 흔들기 */
                @keyframes wave-paw {
                    0%, 100% { transform: rotate(0deg) scale(1); }
                    20% { transform: rotate(-20deg) scale(1.1); }
                    40% { transform: rotate(20deg) scale(1.15); }
                    60% { transform: rotate(-15deg) scale(1.1); }
                    80% { transform: rotate(10deg) scale(1.05); }
                }

                /* 인사 */
                @keyframes bow {
                    0%, 100% { transform: rotateX(0deg) scale(1); }
                    50% { transform: rotateX(30deg) scale(1.1); }
                }

                /* 점프 */
                @keyframes jump-wave {
                    0%, 100% { transform: translateY(0) rotate(0deg) scale(1); }
                    15% { transform: translateY(-80px) rotate(-20deg) scale(1.1); }
                    30% { transform: translateY(-120px) rotate(0deg) scale(1.2); }
                    45% { transform: translateY(-90px) rotate(20deg) scale(1.15); }
                    60% { transform: translateY(-50px) rotate(-10deg) scale(1.08); }
                    80% { transform: translateY(-20px) rotate(5deg) scale(1.03); }
                }

                /* 반짝이며 회전 */
                @keyframes twinkle-spin {
                    0%, 100% { 
                        transform: scale(1) rotate(0deg);
                        filter: brightness(1) drop-shadow(0 0 20px gold);
                    }
                    25% {
                        transform: scale(1.2) rotate(90deg);
                        filter: brightness(1.3) drop-shadow(0 0 35px gold);
                    }
                    50% { 
                        transform: scale(1.4) rotate(180deg);
                        filter: brightness(1.6) drop-shadow(0 0 50px gold);
                    }
                    75% {
                        transform: scale(1.2) rotate(270deg);
                        filter: brightness(1.3) drop-shadow(0 0 35px gold);
                    }
                }

                /* 빛나는 효과 */
                @keyframes fade-glow {
                    0%, 100% { 
                        opacity: 1;
                        transform: scale(1);
                        filter: drop-shadow(0 0 30px orange) brightness(1);
                    }
                    50% { 
                        opacity: 0.9;
                        transform: scale(1.2);
                        filter: drop-shadow(0 0 60px gold) brightness(1.5);
                    }
                }

                /* 전기 스파크 */
                @keyframes spark {
                    0%, 100% { 
                        opacity: 0;
                        transform: scale(0) rotate(0deg);
                    }
                    50% { 
                        opacity: 1;
                        transform: scale(1.5) rotate(180deg);
                    }
                }

                /* 말풍선 등장 */
                @keyframes bounce-in {
                    0% {
                        opacity: 0;
                        transform: scale(0) translateY(50px);
                    }
                    50% {
                        transform: scale(1.1) translateY(0);
                    }
                    100% {
                        opacity: 1;
                        transform: scale(1) translateY(0);
                    }
                }

                /* 슬라이드 업 */
                @keyframes slide-up {
                    from {
                        opacity: 0;
                        transform: translateY(50px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                /* 천천히 회전 */
                @keyframes spin-slow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }

                /* 클래스 적용 */
                .animate-fade-in { animation: fade-in 0.4s ease-out; }
                .animate-particle-burst { animation: particle-burst 1.8s ease-out forwards; }
                .animate-bounce-welcome { animation: bounce-welcome 2s ease-in-out infinite; }
                .animate-wave-paw { animation: wave-paw 2s ease-in-out infinite; }
                .animate-bow { animation: bow 2s ease-in-out infinite; }
                .animate-jump-wave { animation: jump-wave 2s ease-in-out infinite; }
                .animate-twinkle-spin { animation: twinkle-spin 2s ease-in-out infinite; }
                .animate-fade-glow { animation: fade-glow 2s ease-in-out infinite; }
                .animate-spark { animation: spark 0.6s ease-in-out infinite; }
                .animate-bounce-in { animation: bounce-in 0.5s ease-out; }
                .animate-slide-up { animation: slide-up 0.6s ease-out; }
                .animate-spin-slow { animation: spin-slow 4s linear infinite; }

                /* 반응형 조정 */
                @media (max-width: 768px) {
                    @keyframes particle-burst {
                        100% {
                            transform: translate(-50%, -50%) 
                                       translate(
                                         calc(cos(var(--angle)) * 200px), 
                                         calc(sin(var(--angle)) * 200px)
                                       ) 
                                       scale(1.5) 
                                       rotate(720deg);
                        }
                    }
                }
            `}</style>
        </div>
    );
};

export default ThemeTransitionAnimation;
