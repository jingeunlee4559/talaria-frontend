// src/constants/textEffects.js

export const TEXT_EFFECTS = [
    { id: 'none', name: '효과 없음', className: '' },

    // ⚡ 1차 세트: 기본 효과
    { id: 'pop', name: '팝업 강조', className: 'text-effect-pop' },
    { id: 'bounce-once', name: '점프', className: 'text-effect-bounce-once' },
    { id: 'shake', name: '흔들림 강조', className: 'text-effect-shake' },
    { id: 'wave', name: '물결', className: 'text-effect-wave' },
    { id: 'glow', name: '빛나는 강조', className: 'text-effect-glow' },

    // ⚡ 2차 세트: 추가 효과
    { id: 'slide-up', name: '위로 슬라이드', className: 'text-effect-slide-up' },
    { id: 'zoom-loop', name: '줌 인/아웃', className: 'text-effect-zoom-loop' },
    { id: 'rainbow', name: '레인보우 컬러', className: 'text-effect-rainbow' },
    { id: 'jelly', name: '젤리 튕김', className: 'text-effect-jelly' },
    { id: 'heartbeat', name: '심장 박동', className: 'text-effect-heartbeat' },

    // ⚡ 3차 세트: 눈에 띄는 애니메이션
    { id: 'bounce-loop', name: '반복 점프', className: 'text-effect-bounce-loop' },
    { id: 'glitch', name: '글리치 노이즈', className: 'text-effect-glitch' },
    { id: 'spin-in', name: '스핀 인', className: 'text-effect-spin-in' },
    { id: 'flip', name: '플립 카드', className: 'text-effect-flip' },
    { id: 'float', name: '둥실둥실 떠다님', className: 'text-effect-float' },
    { id: 'neon', name: '네온 라이트', className: 'text-effect-neon' },

    // ⚡ 4차 세트: 새로 추가 (좀 더 다양하게)
    { id: 'fade-in', name: '부드러운 페이드 인', className: 'text-effect-fade-in' },
    { id: 'drop-in', name: '위에서 떨어짐', className: 'text-effect-drop-in' },
    { id: 'wobble', name: '통통 흔들림', className: 'text-effect-wobble' },
    { id: 'spark', name: '번쩍 강조', className: 'text-effect-spark' },

    // 🧷 타자기 효과 (한 글자씩 나오는 느낌)
    { id: 'typewriter', name: '타자 효과', className: 'text-effect-typewriter' },
];

export const TEXT_EFFECT_MAP = TEXT_EFFECTS.reduce((acc, effect) => {
    acc[effect.id] = effect;
    return acc;
}, {});
