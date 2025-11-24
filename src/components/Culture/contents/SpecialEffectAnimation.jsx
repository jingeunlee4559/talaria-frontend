// src/components/Culture/LiveView/contents/SpecialEffectAnimation.jsx
import React, { useState, useEffect } from 'react';

const SpecialEffectAnimation = ({ effect, onComplete }) => {
    const [particles, setParticles] = useState([]);

    useEffect(() => {
        if (!effect) return;

        let count = 50;
        if (effect.type === 'firework') count = 90;
        else if (effect.type === 'explosion') count = 60;
        else if (effect.type === 'snow' || effect.type === 'sakura') count = 40;
        else if (effect.type === 'butterfly') count = 15;
        else if (effect.type === 'heart-spin') count = 30;
        else if (effect.type === 'spiral') count = 40;

        // 🎉 전용: 생일축하 폭죽 (양쪽 아래에서 대각선으로 크게 터짐)
        const isBirthdayPop = effect.type === 'firework' && (effect.variant === 'birthday-pop' || effect.emoji === '🎉');

        const newParticles = [];
        const now = Date.now();

        if (isBirthdayPop) {
            const total = count + 40; // 조금 더 많이
            const half = Math.floor(total / 2);

            const baseY = effect.baseY ?? 82; // 아래쪽 기준 Y(%)
            const leftX = effect.leftX ?? 10; // 왼쪽 캐논 X(%)
            const rightX = effect.rightX ?? 90; // 오른쪽 캐논 X(%)

            const spreadDeg = 35; // 퍼지는 각도
            const spreadRad = (spreadDeg * Math.PI) / 180;

            const centerAngleLeft = (-60 * Math.PI) / 180; // 왼쪽: 오른쪽 위 대각선
            const centerAngleRight = (-120 * Math.PI) / 180; // 오른쪽: 왼쪽 위 대각선

            // 왼쪽 폭죽들
            for (let i = 0; i < half; i++) {
                const angle = centerAngleLeft + (Math.random() - 0.5) * spreadRad;
                const distance = 320 + Math.random() * 260; // 전체 길이
                const dx = Math.cos(angle) * distance;
                const dy = Math.sin(angle) * distance; // 음수라서 위로

                newParticles.push({
                    id: `birthday-L-${i}-${now}`,
                    originX: leftX + Math.random() * 5,
                    originY: baseY + Math.random() * 6,
                    rotation: Math.random() * 360,
                    delay: Math.random() * 0.35,
                    duration: 1.4 + Math.random() * 0.7,
                    dx,
                    dy,
                    side: 'left',
                });
            }

            // 오른쪽 폭죽들
            for (let i = 0; i < total - half; i++) {
                const angle = centerAngleRight + (Math.random() - 0.5) * spreadRad;
                const distance = 320 + Math.random() * 260;
                const dx = Math.cos(angle) * distance;
                const dy = Math.sin(angle) * distance;

                newParticles.push({
                    id: `birthday-R-${i}-${now}`,
                    originX: rightX - Math.random() * 5,
                    originY: baseY + Math.random() * 6,
                    rotation: Math.random() * 360,
                    delay: Math.random() * 0.35,
                    duration: 1.4 + Math.random() * 0.7,
                    dx,
                    dy,
                    side: 'right',
                });
            }

            setParticles(newParticles);
        } else if (effect.type === 'firework') {
            // 기본 중앙 폭죽 (기존/백업용)
            for (let i = 0; i < count; i++) {
                const angle = (Math.PI * 2 * i) / count;
                const radius1 = 200 + Math.random() * 100;
                const radius2 = radius1 + 150 + Math.random() * 120;
                newParticles.push({
                    id: `center-firework-${i}-${now}`,
                    x: 50,
                    y: 50,
                    rotation: Math.random() * 360,
                    delay: Math.random() * 0.5,
                    duration: 1.6 + Math.random() * 0.9,
                    angle,
                    radius1,
                    radius2,
                });
            }
            setParticles(newParticles);
        } else {
            // 나머지 낙하형 이펙트
            for (let i = 0; i < count; i++) {
                newParticles.push({
                    id: i,
                    x: Math.random() * 100,
                    y: Math.random() * 80,
                    rotation: Math.random() * 360,
                    delay: Math.random() * 0.5,
                    duration: 1.5 + Math.random() * 1.5,
                });
            }
            setParticles(newParticles);
        }

        const timer = setTimeout(() => {
            onComplete && onComplete();
        }, 3500);

        return () => clearTimeout(timer);
    }, [effect, onComplete]);

    if (!effect) return null;

    const getParticleStyle = (particle) => {
        const isBirthdayPop = effect.type === 'firework' && (effect.variant === 'birthday-pop' || effect.emoji === '🎉');

        const baseStyle = {
            position: 'absolute',
            fontSize: isBirthdayPop ? '3.2rem' : '2.2rem',
            zIndex: 1,
            pointerEvents: 'none',
        };

        if (isBirthdayPop) {
            return {
                ...baseStyle,
                left: `${particle.originX}%`,
                top: `${particle.originY}%`,
                animation: `firework-side-diagonal ${particle.duration}s cubic-bezier(0.16, 1, 0.3, 1) ${particle.delay}s forwards`,
                '--dx': `${particle.dx}px`,
                '--dy': `${particle.dy}px`,
            };
        }

        if (effect.type === 'firework') {
            return {
                ...baseStyle,
                left: `${particle.x}%`,
                top: `${particle.y}%`,
                animation: `firework-burst ${particle.duration}s cubic-bezier(0.16, 1, 0.3, 1) ${particle.delay}s forwards`,
                '--angle': `${particle.angle}rad`,
                '--radius1': `${particle.radius1 || 220}px`,
                '--radius2': `${particle.radius2 || 380}px`,
            };
        }

        // 기본 낙하시 효과
        return {
            ...baseStyle,
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            animation: `fall-${effect.type} ${particle.duration}s ease-out ${particle.delay}s forwards`,
        };
    };

    return (
        <div
            style={{
                position: 'absolute',
                inset: 0,
                zIndex: 9999,
                pointerEvents: 'none',
                overflow: 'hidden',
            }}
        >
            {particles.map((particle) => (
                <div key={particle.id} style={getParticleStyle(particle)}>
                    {effect.emoji}
                </div>
            ))}

            <style>{`
                /* 🎉 생일축하 폭죽: 양쪽 아래에서 대각선으로 크게 터지는 애니메이션 */
                @keyframes firework-side-diagonal {
                    0% {
                        transform: translate(0, 0) scale(0.2) rotate(0deg);
                        opacity: 0;
                        filter: brightness(1);
                    }
                    15% {
                        transform: translate(
                            calc(var(--dx) * 0.15),
                            calc(var(--dy) * 0.15)
                        ) scale(1.3) rotate(45deg);
                        opacity: 1;
                        filter: brightness(1.5);
                    }
                    40% {
                        transform: translate(
                            calc(var(--dx) * 0.5),
                            calc(var(--dy) * 0.5)
                        ) scale(2.4) rotate(180deg);
                        opacity: 1;
                        filter: brightness(2);
                    }
                    70% {
                        transform: translate(
                            calc(var(--dx) * 0.8),
                            calc(var(--dy) * 0.8)
                        ) scale(1.7) rotate(270deg);
                        opacity: 0.9;
                        filter: brightness(1.6);
                    }
                    100% {
                        transform: translate(var(--dx), var(--dy)) scale(0.4) rotate(360deg);
                        opacity: 0;
                        filter: brightness(1);
                    }
                }

                /* 기존 firework (중앙에서 터지는 버전, 다른 이펙트용) */
                @keyframes firework-burst {
                    0% {
                        transform: translate(-50%, -50%) translate(0, 0) scale(0.2);
                        opacity: 0;
                        filter: brightness(1);
                    }
                    20% {
                        transform: translate(-50%, -50%)
                                   translate(0, -40px)
                                   scale(1.1) rotate(45deg);
                        opacity: 1;
                        filter: brightness(1.5);
                    }
                    60% {
                        transform: translate(-50%, -50%) 
                                   translate(
                                       calc(cos(var(--angle)) * var(--radius1, 240px)),
                                       calc(sin(var(--angle)) * var(--radius1, 240px))
                                   )
                                   scale(2.2) rotate(180deg);
                        opacity: 1;
                        filter: brightness(2);
                    }
                    100% {
                        transform: translate(-50%, -50%) 
                                   translate(
                                       calc(cos(var(--angle)) * var(--radius2, 420px)),
                                       calc(sin(var(--angle)) * var(--radius2, 420px))
                                   )
                                   scale(0.2) rotate(360deg);
                        opacity: 0;
                        filter: brightness(1);
                    }
                }

                /* ===== 이하 기존 fall-* 이펙트 유지 ===== */

                @keyframes fall-confetti {
                    0% { transform: translateY(-20px) rotate(0deg); opacity: 1; }
                    100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
                }

                @keyframes fall-explosion {
                    0% { transform: scale(0); opacity: 1; }
                    50% { transform: scale(1.8); opacity: 1; }
                    100% { transform: scale(0); opacity: 0; }
                }

                @keyframes fall-sparkle {
                    0% { transform: scale(0) rotate(0deg); opacity: 0; }
                    50% { transform: scale(1.8) rotate(180deg); opacity: 1; }
                    100% { transform: scale(0) rotate(360deg); opacity: 0; }
                }

                @keyframes fall-star {
                    0% { transform: translateY(-40px) scale(0) rotate(0deg); opacity: 0; }
                    50% { transform: translateY(40vh) scale(1.5) rotate(180deg); opacity: 1; }
                    100% { transform: translateY(110vh) scale(0.8) rotate(360deg); opacity: 0; }
                }

                @keyframes fall-heart {
                    0% { transform: translateY(0) scale(0); opacity: 0; }
                    50% { transform: translateY(-20vh) scale(1.8); opacity: 1; }
                    100% { transform: translateY(-40vh) scale(0); opacity: 0; }
                }

                @keyframes fall-fire {
                    0% { transform: translateY(0) scale(1); opacity: 1; filter: hue-rotate(0deg); }
                    50% { transform: translateY(-10vh) scale(2.5); opacity: 1; filter: hue-rotate(45deg); }
                    100% { transform: translateY(-20vh) scale(0); opacity: 0; filter: hue-rotate(90deg); }
                }

                @keyframes fall-star-burst {
                    0% { transform: scale(0) rotate(0deg); opacity: 0; }
                    25% { transform: scale(2) rotate(90deg); opacity: 1; }
                    50% { transform: scale(1.5) rotate(180deg); opacity: 1; }
                    100% { transform: scale(0) rotate(360deg); opacity: 0; }
                }

                @keyframes fall-dizzy {
                    0% { transform: translate(0, 0) rotate(0deg) scale(1); opacity: 1; }
                    25% { transform: translate(40px, -40px) rotate(90deg) scale(1.3); opacity: 1; }
                    50% { transform: translate(-40px, -80px) rotate(180deg) scale(1.5); opacity: 1; }
                    75% { transform: translate(40px, -120px) rotate(270deg) scale(1.2); opacity: 1; }
                    100% { transform: translate(0, -160px) rotate(360deg) scale(0); opacity: 0; }
                }

                @keyframes fall-rainbow {
                    0% { transform: translateY(-10vh) scale(1); opacity: 1; filter: hue-rotate(0deg); }
                    100% { transform: translateY(110vh) scale(2); opacity: 0; filter: hue-rotate(360deg); }
                }

                @keyframes fall-gift {
                    0% { transform: translateY(-40px) rotate(0deg) scale(0); opacity: 0; }
                    20% { transform: translateY(0) rotate(180deg) scale(1.3); opacity: 1; }
                    80% { transform: translateY(80vh) rotate(540deg) scale(1); opacity: 1; }
                    100% { transform: translateY(110vh) rotate(720deg) scale(0); opacity: 0; }
                }

                @keyframes fall-balloon {
                    0% { transform: translateY(110vh) scale(0.5); opacity: 0; }
                    20% { transform: translateY(80vh) scale(1); opacity: 1; }
                    100% { transform: translateY(-40px) scale(1.2); opacity: 0; }
                }

                @keyframes fall-sakura {
                    0% { transform: translateY(-20vh) translateX(0) rotate(0deg); opacity: 0; }
                    100% { transform: translateY(110vh) translateX(60px) rotate(720deg); opacity: 1; }
                }

                @keyframes fall-snow {
                    0% { transform: translateY(-20vh) translateX(0); opacity: 0; }
                    100% { transform: translateY(110vh) translateX(40px); opacity: 1; }
                }

                @keyframes fall-lightning {
                    0%, 100% { opacity: 0; transform: scale(1); }
                    10%, 30%, 50% { opacity: 1; transform: scale(1.5); }
                    20%, 40% { opacity: 0; transform: scale(1.2); }
                }

                @keyframes fall-butterfly {
                    0% { transform: translateY(-10vh) translateX(0) rotate(0deg); opacity: 0; }
                    25% { transform: translateY(20vh) translateX(60px) rotate(90deg); opacity: 1; }
                    50% { transform: translateY(50vh) translateX(-40px) rotate(180deg); opacity: 1; }
                    75% { transform: translateY(80vh) translateX(40px) rotate(270deg); opacity: 1; }
                    100% { transform: translateY(110vh) translateX(0) rotate(360deg); opacity: 0; }
                }

                @keyframes fall-flower {
                    0% { transform: translateY(-20vh) scale(0) rotate(0deg); opacity: 0; }
                    30% { transform: translateY(30vh) scale(1.2) rotate(180deg); opacity: 1; }
                    70% { transform: translateY(70vh) scale(1) rotate(360deg); opacity: 1; }
                    100% { transform: translateY(110vh) scale(0.5) rotate(540deg); opacity: 0; }
                }

                @keyframes fall-ribbon {
                    0% { transform: translateY(0) scale(0) rotate(0deg); opacity: 1; }
                    50% { transform: translateY(-60px) scale(2) rotate(720deg); opacity: 1; }
                    100% { transform: translateY(-120px) scale(0) rotate(1440deg); opacity: 0; }
                }

                @keyframes fall-bouquet {
                    0% { transform: translateY(110vh) scale(0); opacity: 0; }
                    50% { transform: translateY(40vh) scale(1.5) rotate(180deg); opacity: 1; }
                    100% { transform: translateY(-40px) scale(2) rotate(360deg); opacity: 0; }
                }

                @keyframes fall-sunflower {
                    0% { transform: translateY(-20vh) rotate(0deg) scale(1); opacity: 1; }
                    100% { transform: translateY(110vh) rotate(360deg) scale(1.5); opacity: 0; }
                }

                @keyframes fall-clover {
                    0% { transform: translateY(-20vh) rotate(0deg) scale(0); opacity: 0; }
                    50% { transform: translateY(50vh) rotate(180deg) scale(1.5); opacity: 1; }
                    100% { transform: translateY(110vh) rotate(360deg) scale(0.8); opacity: 0; }
                }

                @keyframes fall-cat {
                    0% { transform: translateX(-20vw) scale(0); opacity: 0; }
                    30% { transform: translateX(20vw) scale(1.2); opacity: 1; }
                    70% { transform: translateX(60vw) scale(1); opacity: 1; }
                    100% { transform: translateX(110vw) scale(1.5); opacity: 0; }
                }

                @keyframes fall-unicorn {
                    0% { transform: translate(0, 110vh) scale(0); opacity: 0; filter: hue-rotate(0deg); }
                    50% { transform: translate(50vw, 50vh) scale(1.5); opacity: 1; filter: hue-rotate(180deg); }
                    100% { transform: translate(100vw, -10vh) scale(0); opacity: 0; filter: hue-rotate(360deg); }
                }

                @keyframes fall-crown {
                    0% { transform: translateY(-20vh) scale(0) rotate(0deg); opacity: 0; }
                    20% { transform: translateY(20vh) scale(1.5) rotate(90deg); opacity: 1; }
                    80% { transform: translateY(80vh) scale(1.2) rotate(270deg); opacity: 1; }
                    100% { transform: translateY(110vh) scale(0) rotate(360deg); opacity: 0; }
                }

                @keyframes fall-diamond {
                    0% { transform: scale(0) rotate(0deg); opacity: 0; }
                    25% { transform: scale(1.5) rotate(90deg); opacity: 1; }
                    50% { transform: scale(2) rotate(180deg); opacity: 1; }
                    75% { transform: scale(1.5) rotate(270deg); opacity: 1; }
                    100% { transform: scale(0) rotate(360deg); opacity: 0; }
                }

                @keyframes fall-moon {
                    0% { transform: translateY(-20vh) translateX(0) rotate(0deg) scale(1); opacity: 1; }
                    100% { transform: translateY(110vh) translateX(60px) rotate(180deg) scale(1.5); opacity: 0; }
                }

                @keyframes fall-sun {
                    0% { transform: scale(0) rotate(0deg); opacity: 0; filter: brightness(1); }
                    50% { transform: scale(2) rotate(180deg); opacity: 1; filter: brightness(2); }
                    100% { transform: scale(0) rotate(360deg); opacity: 0; filter: brightness(1); }
                }

                @keyframes fall-music {
                    0% { transform: translateY(110vh) scale(0) rotate(0deg); opacity: 0; }
                    30% { transform: translateY(60vh) scale(1.3) rotate(180deg); opacity: 1; }
                    70% { transform: translateY(30vh) scale(1) rotate(360deg); opacity: 1; }
                    100% { transform: translateY(-20px) scale(0.5) rotate(540deg); opacity: 0; }
                }

                @keyframes fall-heart-spin {
                    0% { transform: rotate(0deg) scale(0); opacity: 0; }
                    50% { transform: rotate(180deg) scale(2); opacity: 1; }
                    100% { transform: rotate(360deg) scale(0); opacity: 0; }
                }

                @keyframes fall-spiral {
                    0% { transform: translate(0, -20vh) rotate(0deg) scale(1); opacity: 1; }
                    25% { transform: translate(80px, 20vh) rotate(90deg) scale(1.2); opacity: 1; }
                    50% { transform: translate(0, 50vh) rotate(180deg) scale(1.5); opacity: 1; }
                    75% { transform: translate(-80px, 80vh) rotate(270deg) scale(1.2); opacity: 1; }
                    100% { transform: translate(0, 110vh) rotate(360deg) scale(0); opacity: 0; }
                }

                @keyframes fall-circus {
                    0% { transform: translateY(-20vh) scale(0) rotate(0deg); opacity: 0; }
                    30% { transform: translateY(30vh) scale(1.5) rotate(180deg); opacity: 1; }
                    70% { transform: translateY(70vh) scale(1.2) rotate(360deg); opacity: 1; }
                    100% { transform: translateY(110vh) scale(0) rotate(540deg); opacity: 0; }
                }

                @keyframes fall-mask {
                    0% { transform: translateY(-20vh) rotate(0deg) scale(1); opacity: 1; }
                    50% { transform: translateY(50vh) rotate(180deg) scale(1.8); opacity: 1; }
                    100% { transform: translateY(110vh) rotate(360deg) scale(0.5); opacity: 0; }
                }

                @keyframes fall-palette {
                    0% { transform: rotate(0deg) scale(0); opacity: 0; filter: hue-rotate(0deg); }
                    50% { transform: rotate(180deg) scale(2); opacity: 1; filter: hue-rotate(180deg); }
                    100% { transform: rotate(360deg) scale(0); opacity: 0; filter: hue-rotate(360deg); }
                }

                @keyframes fall-clapper {
                    0% { transform: translateY(-20vh) rotateX(0deg) scale(0); opacity: 0; }
                    50% { transform: translateY(50vh) rotateX(180deg) scale(1.5); opacity: 1; }
                    100% { transform: translateY(110vh) rotateX(360deg) scale(0.8); opacity: 0; }
                }

                @keyframes fall-trophy {
                    0% { transform: translateY(110vh) scale(0); opacity: 0; }
                    50% { transform: translateY(40vh) scale(2) rotate(180deg); opacity: 1; }
                    100% { transform: translateY(-20px) scale(2.5) rotate(360deg); opacity: 0; }
                }
            `}</style>
        </div>
    );
};

export default SpecialEffectAnimation;
