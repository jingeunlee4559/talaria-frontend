import React from 'react';

// 👉 강조하고 싶은 단어들
export const HIGHLIGHT_KEYWORDS = [
    // 기존 밈/게임/신조어
    '최애',
    '입덕',
    '레전드',
    '갓생',
    '국룰',
    '성지순례',
    '킬링파트',
    '원딜',
    '탑차이',
    '가챠',
    '현질',
    // 🔥 K-POP 관련 단어
    '컴백',
    '엔딩요정',
    '완전체',
    '팬캠',
    '안무영상',
    '타이틀곡',
    '수록곡',
    '응원법',
];

const escapeRegExp = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// 🎵 K-POP 관련 단어 (음표 애니메이션 공통 적용)
const KPOP_KEYWORDS = new Set(['최애', '입덕', '킬링파트', '컴백', '엔딩요정', '완전체', '팬캠', '안무영상', '타이틀곡', '수록곡', '응원법']);

// 🎨 단어별 스타일(그라디언트 + 이모지)
const KEYWORD_STYLES = {
    // ====== K-POP 감성 ======
    최애: {
        bgFrom: '#ec4899',
        bgTo: '#a855f7',
        emoji: '💖',
    },
    입덕: {
        bgFrom: '#f97316',
        bgTo: '#ec4899',
        emoji: '✨',
    },
    킬링파트: {
        bgFrom: '#6366f1',
        bgTo: '#ec4899',
        emoji: '🎧',
    },
    컴백: {
        bgFrom: '#f472b6',
        bgTo: '#6366f1',
        emoji: '🎵',
    },
    엔딩요정: {
        bgFrom: '#a855f7',
        bgTo: '#f97316',
        emoji: '📸',
    },
    완전체: {
        bgFrom: '#22c55e',
        bgTo: '#0ea5e9',
        emoji: '👑',
    },
    팬캠: {
        bgFrom: '#6366f1',
        bgTo: '#22d3ee',
        emoji: '🎥',
    },
    안무영상: {
        bgFrom: '#4f46e5',
        bgTo: '#ec4899',
        emoji: '🩰',
    },
    타이틀곡: {
        bgFrom: '#f97316',
        bgTo: '#facc15',
        emoji: '🎶',
    },
    수록곡: {
        bgFrom: '#0ea5e9',
        bgTo: '#22c55e',
        emoji: '💿',
    },
    응원법: {
        bgFrom: '#22c55e',
        bgTo: '#a855f7',
        emoji: '📣',
    },

    // ====== 밈/신조어 ======
    레전드: {
        bgFrom: '#22c55e',
        bgTo: '#16a34a',
        emoji: '🔥',
    },
    갓생: {
        bgFrom: '#06b6d4',
        bgTo: '#6366f1',
        emoji: '💪',
    },
    국룰: {
        bgFrom: '#facc15',
        bgTo: '#f97316',
        emoji: '📌',
    },
    성지순례: {
        bgFrom: '#14b8a6',
        bgTo: '#22c55e',
        emoji: '⛺',
    },

    // ====== 게임 용어 ======
    원딜: {
        bgFrom: '#0ea5e9',
        bgTo: '#6366f1',
        emoji: '🎯',
    },
    탑차이: {
        bgFrom: '#f97316',
        bgTo: '#dc2626',
        emoji: '⚔️',
    },
    가챠: {
        bgFrom: '#a855f7',
        bgTo: '#22c55e',
        emoji: '🎲',
    },
    현질: {
        bgFrom: '#22c55e',
        bgTo: '#16a34a',
        emoji: '💸',
    },
};

export const highlightKeywords = (text, themeColors) => {
    if (!text) return null;

    const defaultFrom = themeColors?.primary || '#fbbf24';
    const defaultTo = themeColors?.secondary || '#f97316';

    const hasMicPrefix = text.startsWith('🎤');
    const bodyText = hasMicPrefix ? text.replace(/^🎤\s?/, '') : text;

    if (!HIGHLIGHT_KEYWORDS.length) {
        return (
            <>
                {hasMicPrefix && (
                    <span className="talaria-mic-prefix mr-1" aria-hidden="true">
                        🎤
                    </span>
                )}
                <span className="talaria-text-fragment">{bodyText}</span>
            </>
        );
    }

    const escapedKeywords = HIGHLIGHT_KEYWORDS.map(escapeRegExp);
    const regex = new RegExp(`(${escapedKeywords.join('|')})`, 'gi');
    const parts = bodyText.split(regex);
    const lowerKeywords = HIGHLIGHT_KEYWORDS.map((k) => k.toLowerCase());

    const nodes = [];

    if (hasMicPrefix) {
        nodes.push(
            <span key="mic-prefix" className="talaria-mic-prefix mr-1" aria-hidden="true">
                🎤
            </span>,
        );
    }

    parts.forEach((part, idx) => {
        if (!part) return;

        const lower = part.toLowerCase();
        const isKeyword = lowerKeywords.includes(lower);

        // 일반 텍스트
        if (!isKeyword) {
            nodes.push(
                <span key={`txt-${idx}`} className="talaria-text-fragment align-middle">
                    {part}
                </span>,
            );
            return;
        }

        // ✅ 단어별 스타일 정보
        const originalKey = HIGHLIGHT_KEYWORDS.find((kw) => kw.toLowerCase() === lower) || part;
        const styleConfig = KEYWORD_STYLES[originalKey] || {};

        const bgFrom = styleConfig.bgFrom || defaultFrom;
        const bgTo = styleConfig.bgTo || defaultTo;
        const emoji = styleConfig.emoji || null;
        const isKpop = KPOP_KEYWORDS.has(originalKey);

        const keywordClassName = ['talaria-keyword', `talaria-keyword--${originalKey}`, isKpop ? 'talaria-keyword--kpop' : '', 'inline-flex', 'items-center', 'justify-center', 'align-middle']
            .filter(Boolean)
            .join(' ');

        nodes.push(
            <span
                key={`kw-${idx}`}
                className={keywordClassName}
                style={{
                    fontSize: '1.25em', // 말풍선 너무 커지지 않게 조정
                    fontWeight: 900,
                    padding: '0.16rem 0.72rem',
                    margin: '0 0.06rem',
                    borderRadius: '999px',
                    backgroundImage: `linear-gradient(135deg, ${bgFrom}, ${bgTo})`,
                    color: '#ffffff',
                    letterSpacing: '0.04em',
                    whiteSpace: 'pre-wrap',
                }}
            >
                {emoji && (
                    <span className="mr-1" aria-hidden="true" style={{ fontSize: '1.0em' }}>
                        {emoji}
                    </span>
                )}
                {part}
            </span>,
        );
    });

    return nodes;
};
