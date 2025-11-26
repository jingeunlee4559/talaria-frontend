// src/components/Culture/contents/chatKeywordHighlight.jsx
import React from 'react';

export const HIGHLIGHT_KEYWORDS = ['최애', '입덕', '레전드', '갓생', '국룰', '성지순례', '킬링파트', '원딜', '탑차이', '가챠', '현질'];

const escapeRegExp = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// 🎨 단어별 스타일(색/이모지) – 애니메이션은 CSS에서 class로 처리
const KEYWORD_STYLES = {
    // K-POP 감성
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

    // 밈/신조어
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

    // 게임 용어
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
                    <span className="mr-1" aria-hidden="true">
                        🎤
                    </span>
                )}
                {bodyText}
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
            <span key="mic-prefix" className="mr-1" aria-hidden="true">
                🎤
            </span>,
        );
    }

    parts.forEach((part, idx) => {
        if (!part) return;

        const lower = part.toLowerCase();
        const isKeyword = lowerKeywords.includes(lower);

        // 일반 텍스트는 그대로
        if (!isKeyword) {
            nodes.push(
                <span key={`txt-${idx}`} className="align-middle">
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

        nodes.push(
            <span
                key={`kw-${idx}`}
                className={`talaria-keyword talaria-keyword--${originalKey} inline-flex items-center justify-center align-middle`}
                style={{
                    fontSize: '1.5em',
                    fontWeight: 900,
                    padding: '0.22rem 0.8rem',
                    margin: '0 0.12rem',
                    borderRadius: '999px',
                    backgroundImage: `linear-gradient(135deg, ${bgFrom}, ${bgTo})`,
                    color: '#ffffff',
                    letterSpacing: '0.04em',
                    whiteSpace: 'pre-wrap',
                }}
            >
                {emoji && (
                    <span className="mr-1" aria-hidden="true" style={{ fontSize: '1.05em' }}>
                        {emoji}
                    </span>
                )}
                {part}
            </span>,
        );
    });

    return nodes;
};
