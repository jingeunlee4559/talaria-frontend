// src/components/Culture/LiveView/contents/SpecialEffectAnimation.jsx
import React, { useState, useEffect } from 'react';

const SpecialEffectAnimation = ({ effect, onComplete }) => {
    const [particles, setParticles] = useState([]);

    useEffect(() => {
        if (!effect) return;

        let count = 50;
        if (effect.type === 'firework') count = 80;
        else if (effect.type === 'explosion') count = 60;
        else if (effect.type === 'snow' || effect.type === 'sakura') count = 40;
        else if (effect.type === 'butterfly') count = 15;
        else if (effect.type === 'heart-spin') count = 30;
        else if (effect.type === 'spiral') count = 40;

        const newParticles = Array.from({ length: count }, (_, i) => ({
            id: i,
            // firework는 중앙 기준, 나머지는 랜덤
            x: effect.type === 'firework' ? 50 : Math.random() * 100,
            y: effect.type === 'firework' ? 50 : Math.random() * 80,
            rotation: Math.random() * 360,
            delay: Math.random() * 0.5,
            duration: 1.5 + Math.random() * 1.5,
            angle: (Math.PI * 2 * i) / count,
        }));
        setParticles(newParticles);

        const timer = setTimeout(() => {
            onComplete && onComplete();
        }, 3500);

        return () => clearTimeout(timer);
    }, [effect, onComplete]);

    if (!effect) return null;

    const getParticleStyle = (particle) => {
        const baseStyle = {
            position: 'absolute', // 오버레이 안에서 절대 위치
            fontSize: '2.2rem',
            zIndex: 1,
            pointerEvents: 'none',
        };

        if (effect.type === 'firework') {
            return {
                ...baseStyle,
                left: '50%',
                top: '50%',
                animation: `firework-burst ${particle.duration}s ease-out ${particle.delay}s forwards`,
                '--angle': `${particle.angle}rad`,
            };
        }

        return {
            ...baseStyle,
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            animation: `fall-${effect.type} ${particle.duration}s ease-out ${particle.delay}s forwards`,
        };
    };

    return (
        <div
            // 영상 영역을 덮는 오버레이
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
                /* 공통: 아래 keyframes 안에는 Math.random() 절대 사용 X */

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

                @keyframes firework-burst {
                    0% {
                        transform: translate(-50%, -50%) translate(0, 0) scale(0);
                        opacity: 1;
                    }
                    50% {
                        transform: translate(-50%, -50%) 
                                   translate(calc(cos(var(--angle)) * 200px), calc(sin(var(--angle)) * 200px)) 
                                   scale(1.5) rotate(180deg);
                        opacity: 1;
                    }
                    100% {
                        transform: translate(-50%, -50%) 
                                   translate(calc(cos(var(--angle)) * 400px), calc(sin(var(--angle)) * 400px)) 
                                   scale(0) rotate(360deg);
                        opacity: 0;
                    }
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
