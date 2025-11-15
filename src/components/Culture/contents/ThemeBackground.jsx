// src/components/Culture/LiveView/ThemeBackground.jsx

import React, { useEffect, useState } from 'react';
import { BACKGROUND_THEMES, getAnimationStyles } from './backgroundThemes';
import pokeballImg from '../../../assets/themes/pokeball.png';

// ⚡ 포켓볼 이미지 경로 (public/assets/themes/pokeball.png 기준)
const POKEBALL_IMAGE_SRC = pokeballImg;

const ThemeBackground = ({ themeId = 'default' }) => {
    const theme = BACKGROUND_THEMES[themeId] || BACKGROUND_THEMES.default;
    const [particles, setParticles] = useState([]);

    useEffect(() => {
        // 파티클 생성
        const newParticles = Array.from({ length: 30 }, (_, i) => ({
            id: i,
            x: Math.random() * 100,
            y: Math.random() * 100,
            size: Math.random() * 30 + 10,
            duration: Math.random() * 20 + 10,
            delay: Math.random() * 5,
        }));
        setParticles(newParticles);
    }, [themeId]);

    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
            {/* 배경 그라데이션 */}
            <div className="absolute inset-0 transition-all duration-1000" style={{ background: theme.gradient }} />

            {/* 배경 이미지 (있는 경우) */}
            {theme.imageUrl && <div className="absolute inset-0 opacity-25 bg-cover bg-center" style={{ backgroundImage: `url(${theme.imageUrl})` }} />}

            {/* 효과 레이어 */}
            {theme.effects?.includes('stars') && <StarsEffect />}
            {theme.effects?.includes('aurora') && <AuroraEffect />}
            {theme.effects?.includes('nebula') && <NebulaEffect />}
            {theme.effects?.includes('sakura') && <SakuraEffect />}
            {theme.effects?.includes('sakuraFall') && <SakuraFallEffect />}
            {theme.effects?.includes('hanok') && <HanokEffect />}
            {theme.effects?.includes('mountains') && <MountainsEffect />}
            {theme.effects?.includes('torii') && <ToriiEffect />}
            {theme.effects?.includes('mountFuji') && <MountFujiEffect />}
            {theme.effects?.includes('lanterns') && <LanternsEffect />}
            {theme.effects?.includes('dragon') && <DragonEffect />}
            {theme.effects?.includes('fireworks') && <FireworksEffect />}
            {theme.effects?.includes('waves') && <WavesEffect />}
            {theme.effects?.includes('sun') && <SunEffect />}
            {theme.effects?.includes('clouds') && <CloudsEffect />}
            {theme.effects?.includes('palms') && <PalmsEffect />}
            {theme.effects?.includes('beach') && <BeachEffect />}
            {theme.effects?.includes('ocean') && <OceanEffect />}
            {theme.effects?.includes('birds') && <BirdsEffect />}
            {theme.effects?.includes('cityscape') && <CityscapeEffect />}
            {theme.effects?.includes('neon') && <NeonEffect />}
            {theme.effects?.includes('snow') && <SnowEffect />}
            {theme.effects?.includes('leaves') && <LeavesEffect />}
            {theme.effects?.includes('flowers') && <FlowersEffect />}
            {theme.effects?.includes('bubbles') && <BubblesEffect />}
            {theme.effects?.includes('fish') && <FishEffect />}
            {theme.effects?.includes('butterflies') && <ButterfliesEffect />}
            {theme.effects?.includes('pokeball') && <PokeballEffect />}
            {theme.effects?.includes('castle') && <CastleEffect />}
            {theme.effects?.includes('magic') && <MagicEffect />}
            {theme.effects?.includes('traditionalPattern') && <TraditionalPatternEffect />}
            {theme.effects?.includes('koreanPattern') && <KoreanPatternEffect />}
            {theme.effects?.includes('sparkles') && <SparklesEffect />}
            {theme.effects?.includes('spotlight') && <SpotlightEffect />}
            {theme.effects?.includes('lights') && <LightsEffect />}
            {theme.effects?.includes('chineseRoof') && <ChineseRoofEffect />}
            {theme.effects?.includes('goldPattern') && <GoldPatternEffect />}
            {theme.effects?.includes('coral') && <CoralEffect />}
            {theme.effects?.includes('wind') && <WindEffect />}
            {theme.effects?.includes('frost') && <FrostEffect />}

            {/* 파티클 */}
            <div className="absolute inset-0">
                {particles.map((p) => (
                    <div
                        key={p.id}
                        className="absolute rounded-full bg-white opacity-20"
                        style={{
                            left: `${p.x}%`,
                            top: `${p.y}%`,
                            width: `${p.size}px`,
                            height: `${p.size}px`,
                            animation: `float ${p.duration}s ease-in-out ${p.delay}s infinite`,
                        }}
                    />
                ))}
            </div>

            <style>{getAnimationStyles()}</style>
        </div>
    );
};

// ===== 효과 컴포넌트들 =====

const StarsEffect = () => (
    <div className="absolute inset-0">
        {Array.from({ length: 100 }, (_, i) => (
            <div
                key={i}
                className="absolute rounded-full bg-white"
                style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    width: `${Math.random() * 3 + 1}px`,
                    height: `${Math.random() * 3 + 1}px`,
                    animation: `twinkle ${Math.random() * 3 + 2}s ease-in-out ${Math.random() * 2}s infinite`,
                }}
            />
        ))}
    </div>
);

const AuroraEffect = () => (
    <div className="absolute inset-0 opacity-60">
        <div
            className="absolute inset-0 animate-aurora-1"
            style={{
                background: 'radial-gradient(ellipse at 50% 0%, rgba(0, 255, 150, 0.3), transparent 70%)',
            }}
        />
        <div
            className="absolute inset-0 animate-aurora-2"
            style={{
                background: 'radial-gradient(ellipse at 80% 20%, rgba(150, 0, 255, 0.3), transparent 70%)',
            }}
        />
        <div
            className="absolute inset-0 animate-aurora-3"
            style={{
                background: 'radial-gradient(ellipse at 20% 30%, rgba(0, 150, 255, 0.3), transparent 70%)',
            }}
        />
    </div>
);

const NebulaEffect = () => (
    <div className="absolute inset-0">
        <div
            className="absolute inset-0 opacity-50 animate-pulse"
            style={{
                background: 'radial-gradient(circle at 70% 30%, rgba(138, 43, 226, 0.3), transparent 50%)',
                animationDuration: '8s',
            }}
        />
        <div
            className="absolute inset-0 opacity-40 animate-pulse"
            style={{
                background: 'radial-gradient(circle at 30% 70%, rgba(30, 144, 255, 0.2), transparent 50%)',
                animationDuration: '12s',
                animationDelay: '2s',
            }}
        />
    </div>
);

const SakuraEffect = () => (
    <div className="absolute inset-0">
        {Array.from({ length: 15 }, (_, i) => (
            <div
                key={i}
                className="absolute text-4xl opacity-70"
                style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animation: `float ${Math.random() * 10 + 10}s ease-in-out ${Math.random() * 5}s infinite`,
                }}
            >
                🌸
            </div>
        ))}
    </div>
);

const SakuraFallEffect = () => (
    <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 30 }, (_, i) => (
            <div
                key={i}
                className="absolute text-3xl"
                style={{
                    left: `${Math.random() * 100}%`,
                    animation: `fall ${Math.random() * 10 + 10}s linear ${Math.random() * 5}s infinite`,
                }}
            >
                🌸
            </div>
        ))}
    </div>
);

const HanokEffect = () => (
    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 opacity-40">
        <div className="text-9xl mb-4">🏯</div>
    </div>
);

const MountainsEffect = () => (
    <div className="absolute bottom-0 left-0 right-0 h-48 opacity-30">
        <svg width="100%" height="100%" viewBox="0 0 1000 200" preserveAspectRatio="none">
            <polygon points="0,200 0,100 200,60 400,80 600,40 800,70 1000,50 1000,200" fill="#8b4513" opacity="0.6" />
            <polygon points="0,200 0,130 150,100 350,120 550,90 750,110 950,100 1000,105 1000,200" fill="#a0522d" opacity="0.5" />
        </svg>
    </div>
);

const ToriiEffect = () => (
    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 opacity-50">
        <div className="text-9xl">⛩️</div>
    </div>
);

const MountFujiEffect = () => (
    <div className="absolute bottom-0 right-10 opacity-40">
        <div className="relative">
            <div className="text-9xl">🗻</div>
            <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent animate-pulse" />
        </div>
    </div>
);

const LanternsEffect = () => (
    <div className="absolute inset-0">
        {Array.from({ length: 12 }, (_, i) => (
            <div
                key={i}
                className="absolute text-5xl"
                style={{
                    left: `${(i * 100) / 11}%`,
                    top: `${Math.random() * 20 + 5}%`,
                    animation: `swing ${Math.random() * 2 + 2}s ease-in-out ${i * 0.2}s infinite`,
                    transformOrigin: 'top center',
                }}
            >
                🏮
            </div>
        ))}
    </div>
);

const DragonEffect = () => (
    <div className="absolute">
        <div className="text-9xl animate-dragon-fly">🐉</div>
    </div>
);

const FireworksEffect = () => {
    const [fireworks, setFireworks] = useState([]);

    useEffect(() => {
        const interval = setInterval(() => {
            const newFirework = {
                id: Date.now() + Math.random(),
                x: Math.random() * 80 + 10,
                y: Math.random() * 50 + 10,
            };
            setFireworks((prev) => [...prev, newFirework]);
            setTimeout(() => {
                setFireworks((prev) => prev.filter((f) => f.id !== newFirework.id));
            }, 2000);
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="absolute inset-0">
            {fireworks.map((fw) => (
                <div key={fw.id} className="absolute text-6xl animate-firework" style={{ left: `${fw.x}%`, top: `${fw.y}%` }}>
                    🎆
                </div>
            ))}
        </div>
    );
};

const WavesEffect = () => (
    <div className="absolute bottom-0 left-0 right-0 h-32">
        {[0, 1, 2].map((i) => (
            <div
                key={i}
                className="absolute bottom-0 left-0 right-0 h-24 opacity-20"
                style={{
                    background: 'linear-gradient(to right, transparent, rgba(0,191,255,0.5), transparent)',
                    animation: `wave ${5 + i}s ease-in-out ${i * 2}s infinite`,
                }}
            />
        ))}
    </div>
);

const SunEffect = () => (
    <div className="absolute top-10 right-10">
        <div className="text-8xl animate-pulse" style={{ animationDuration: '3s' }}>
            ☀️
        </div>
        <div className="absolute inset-0 bg-yellow-300 rounded-full blur-3xl opacity-30 animate-pulse" />
    </div>
);

const CloudsEffect = () => (
    <div className="absolute inset-0">
        {Array.from({ length: 5 }, (_, i) => (
            <div
                key={i}
                className="absolute text-6xl opacity-30 animate-cloud-move"
                style={{
                    top: `${Math.random() * 40 + 10}%`,
                    animationDuration: `${30 + i * 10}s`,
                    animationDelay: `${i * 5}s`,
                }}
            >
                ☁️
            </div>
        ))}
    </div>
);

const PalmsEffect = () => (
    <div className="absolute inset-0">
        <div className="absolute bottom-0 left-10 text-9xl opacity-50 animate-palm-sway">🌴</div>
        <div className="absolute bottom-0 right-10 text-9xl opacity-50 animate-palm-sway" style={{ animationDelay: '1s' }}>
            🌴
        </div>
    </div>
);

const BeachEffect = () => (
    <div className="absolute bottom-0 left-0 right-0 h-32">
        <div className="absolute inset-0 bg-gradient-to-t from-yellow-200/30 to-transparent" />
        <div className="absolute bottom-0 text-4xl opacity-40 whitespace-nowrap">{'🏖️'.repeat(20)}</div>
    </div>
);

const OceanEffect = () => (
    <div className="absolute bottom-0 left-0 right-0 h-40">
        <div className="absolute inset-0 bg-gradient-to-t from-blue-400/20 to-transparent animate-tide" />
    </div>
);

const BirdsEffect = () => (
    <div className="absolute inset-0">
        {Array.from({ length: 5 }, (_, i) => (
            <div
                key={i}
                className="absolute text-3xl"
                style={{
                    top: `${20 + i * 10}%`,
                    animation: `bird-fly ${20 + i * 5}s linear ${i * 3}s infinite`,
                }}
            >
                🦜
            </div>
        ))}
    </div>
);

const CityscapeEffect = () => (
    <div className="absolute bottom-0 left-0 right-0 h-64 opacity-40">
        <div className="flex justify-around items-end h-full">
            {Array.from({ length: 8 }, (_, i) => (
                <div
                    key={i}
                    className="bg-gradient-to-t from-gray-800 to-gray-600"
                    style={{
                        width: '8%',
                        height: `${50 + Math.random() * 50}%`,
                        boxShadow: '0 0 20px rgba(255,255,255,0.2)',
                    }}
                >
                    {Array.from({ length: Math.floor(Math.random() * 10 + 5) }, (_, j) => (
                        <div key={j} className="w-2 h-2 bg-yellow-300 m-1 animate-pulse" style={{ animationDelay: `${Math.random() * 2}s` }} />
                    ))}
                </div>
            ))}
        </div>
    </div>
);

const NeonEffect = () => (
    <div className="absolute inset-0">
        {Array.from({ length: 5 }, (_, i) => (
            <div
                key={i}
                className="absolute left-0 right-0 h-px animate-neon-glow"
                style={{
                    top: `${(i + 1) * 18}%`,
                    background: i % 2 === 0 ? 'rgba(0,255,255,0.8)' : 'rgba(255,0,255,0.8)',
                    animationDelay: `${i * 0.5}s`,
                }}
            />
        ))}
    </div>
);

const SnowEffect = () => (
    <div className="absolute inset-0">
        {Array.from({ length: 50 }, (_, i) => (
            <div
                key={i}
                className="absolute text-2xl opacity-70"
                style={{
                    left: `${Math.random() * 100}%`,
                    animation: `fall ${Math.random() * 10 + 5}s linear ${Math.random() * 5}s infinite`,
                }}
            >
                ❄️
            </div>
        ))}
    </div>
);

const LeavesEffect = () => (
    <div className="absolute inset-0">
        {Array.from({ length: 20 }, (_, i) => (
            <div
                key={i}
                className="absolute text-3xl"
                style={{
                    left: `${Math.random() * 100}%`,
                    animation: `fall-rotate ${Math.random() * 8 + 5}s linear ${Math.random() * 5}s infinite`,
                }}
            >
                🍂
            </div>
        ))}
    </div>
);

const FlowersEffect = () => (
    <div className="absolute inset-0">
        {['🌺', '🌻', '🌷', '🌹', '💐'].map((flower, i) =>
            Array.from({ length: 5 }, (_, j) => (
                <div
                    key={`${i}-${j}`}
                    className="absolute text-4xl opacity-70 animate-bounce"
                    style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                        animationDelay: `${(i + j) * 0.5}s`,
                        animationDuration: `${Math.random() * 2 + 2}s`,
                    }}
                >
                    {flower}
                </div>
            )),
        )}
    </div>
);

const BubblesEffect = () => (
    <div className="absolute inset-0">
        {Array.from({ length: 30 }, (_, i) => (
            <div
                key={i}
                className="absolute rounded-full border-2 border-white/30 animate-bubble-rise"
                style={{
                    left: `${Math.random() * 100}%`,
                    bottom: '-50px',
                    width: `${Math.random() * 40 + 20}px`,
                    height: `${Math.random() * 40 + 20}px`,
                    animationDelay: `${Math.random() * 5}s`,
                }}
            />
        ))}
    </div>
);

const FishEffect = () => (
    <div className="absolute inset-0">
        {['🐠', '🐟', '🐡'].map((fish, i) =>
            Array.from({ length: 3 }, (_, j) => (
                <div
                    key={`${i}-${j}`}
                    className="absolute text-4xl animate-swim"
                    style={{
                        top: `${20 + i * 20}%`,
                        animationDuration: `${15 + j * 5}s`,
                        animationDelay: `${j * 3}s`,
                    }}
                >
                    {fish}
                </div>
            )),
        )}
    </div>
);

const ButterfliesEffect = () => (
    <div className="absolute inset-0">
        {Array.from({ length: 10 }, (_, i) => (
            <div
                key={i}
                className="absolute text-3xl animate-butterfly"
                style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 5}s`,
                }}
            >
                🦋
            </div>
        ))}
    </div>
);

// ✅ 포켓몬 전용: 실제 포켓볼 이미지가 떠다니는 효과
const PokeballEffect = () => (
    <div className="absolute inset-0">
        {Array.from({ length: 8 }, (_, i) => (
            <div
                key={i}
                className="absolute animate-spin-slow"
                style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${i * 0.5}s`,
                }}
            >
                <div
                    className="w-16 h-16 md:w-20 md:h-20 bg-center bg-no-repeat bg-contain drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                    style={{
                        backgroundImage: `url(${POKEBALL_IMAGE_SRC})`,
                    }}
                />
            </div>
        ))}
    </div>
);

const CastleEffect = () => (
    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 opacity-50">
        <div className="text-9xl">🏰</div>
        <div className="absolute inset-0 bg-gradient-to-t from-purple-500/20 to-transparent animate-pulse" />
    </div>
);

const MagicEffect = () => (
    <div className="absolute inset-0">
        {Array.from({ length: 20 }, (_, i) => (
            <div
                key={i}
                className="absolute text-3xl animate-magic-sparkle"
                style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 3}s`,
                }}
            >
                ✨
            </div>
        ))}
    </div>
);

const TraditionalPatternEffect = () => (
    <div className="absolute inset-0 opacity-10">
        <div
            className="w-full h-full"
            style={{
                backgroundImage: `repeating-linear-gradient(
                    45deg,
                    transparent,
                    transparent 35px,
                    rgba(220,20,60,0.5) 35px,
                    rgba(220,20,60,0.5) 70px
                ),
                repeating-linear-gradient(
                    -45deg,
                    transparent,
                    transparent 35px,
                    rgba(0,0,255,0.5) 35px,
                    rgba(0,0,255,0.5) 70px
                )`,
            }}
        />
    </div>
);

const KoreanPatternEffect = () => (
    <div className="absolute inset-0 opacity-20">
        <div
            className="w-full h-full"
            style={{
                backgroundImage: 'radial-gradient(circle, rgba(255,192,203,0.5) 2px, transparent 2px)',
                backgroundSize: '50px 50px',
            }}
        />
    </div>
);

const SparklesEffect = () => (
    <div className="absolute inset-0">
        {Array.from({ length: 15 }, (_, i) => (
            <div
                key={i}
                className="absolute text-3xl animate-magic-sparkle"
                style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 2}s`,
                }}
            >
                ✨
            </div>
        ))}
    </div>
);

const SpotlightEffect = () => (
    <div className="absolute inset-0">
        {Array.from({ length: 3 }, (_, i) => (
            <div
                key={i}
                className="absolute animate-pulse"
                style={{
                    left: `${20 + i * 30}%`,
                    top: '0',
                    width: '150px',
                    height: '100%',
                    background: 'linear-gradient(180deg, rgba(255,255,255,0.3), transparent 50%)',
                    animationDelay: `${i * 0.5}s`,
                    animationDuration: '3s',
                }}
            />
        ))}
    </div>
);

const LightsEffect = () => (
    <div className="absolute inset-0">
        {Array.from({ length: 20 }, (_, i) => (
            <div
                key={i}
                className="absolute rounded-full bg-yellow-300 opacity-40 animate-pulse"
                style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    width: '10px',
                    height: '10px',
                    animationDelay: `${Math.random() * 2}s`,
                }}
            />
        ))}
    </div>
);

const ChineseRoofEffect = () => (
    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 opacity-40">
        <div className="text-9xl">🏯</div>
    </div>
);

const GoldPatternEffect = () => (
    <div className="absolute inset-0 opacity-15">
        <div
            className="w-full h-full"
            style={{
                backgroundImage: 'radial-gradient(circle, rgba(255,215,0,0.6) 2px, transparent 2px)',
                backgroundSize: '40px 40px',
            }}
        />
    </div>
);

const CoralEffect = () => (
    <div className="absolute bottom-0 left-0 right-0 h-40 opacity-50">
        <div className="flex justify-around items-end h-full">
            {Array.from({ length: 8 }, (_, i) => (
                <div
                    key={i}
                    className="text-6xl opacity-70"
                    style={{
                        animation: `float ${Math.random() * 3 + 2}s ease-in-out ${i * 0.3}s infinite`,
                    }}
                >
                    🪸
                </div>
            ))}
        </div>
    </div>
);

const WindEffect = () => (
    <div className="absolute inset-0">
        {Array.from({ length: 10 }, (_, i) => (
            <div
                key={i}
                className="absolute h-px opacity-30"
                style={{
                    left: '-100px',
                    top: `${Math.random() * 100}%`,
                    width: '200px',
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)',
                    animation: `cloud-move ${Math.random() * 5 + 3}s linear ${i * 0.5}s infinite`,
                }}
            />
        ))}
    </div>
);

const FrostEffect = () => (
    <div className="absolute inset-0 opacity-20">
        <div
            className="w-full h-full"
            style={{
                backgroundImage: `
                    radial-gradient(circle at 20% 30%, rgba(255,255,255,0.4) 1px, transparent 1px),
                    radial-gradient(circle at 60% 70%, rgba(255,255,255,0.3) 2px, transparent 2px),
                    radial-gradient(circle at 80% 20%, rgba(255,255,255,0.5) 1px, transparent 1px)
                `,
                backgroundSize: '100px 100px, 150px 150px, 120px 120px',
            }}
        />
    </div>
);

export default ThemeBackground;
