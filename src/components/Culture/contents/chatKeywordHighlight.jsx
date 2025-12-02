// src/components/Culture/contents/chatKeywordHighlight.jsx
import React from 'react';

// ✅ 기본 하이라이트 키워드 (항상 유지되는 단어들)
export const HIGHLIGHT_KEYWORDS = [
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
    '컴백',
    '엔딩요정',
    '완전체',
    '팬캠',
    '안무영상',
    '타이틀곡',
    '수록곡',
    '응원법',
];

// ✅ 기본 키워드 → 카테고리(agent_code) 매핑
//  - k-meme : MZ/신조어/공통 밈
//  - game   : 게임 포지션/용어
//  - music  : K-POP 음악 관련
const KEYWORD_AGENT_MAP = {
    최애: 'k-meme',
    입덕: 'k-meme',
    레전드: 'overseas-meme',
    갓생: 'k-meme',
    국룰: 'k-meme',
    성지순례: 'travel',

    원딜: 'game',
    탑차이: 'game',
    가챠: 'game',
    현질: 'game',

    킬링파트: 'music',
    컴백: 'music',
    엔딩요정: 'music',
    완전체: 'music',
    팬캠: 'music',
    안무영상: 'music',
    타이틀곡: 'music',
    수록곡: 'music',
    응원법: 'music',
};

const escapeRegExp = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// ✅ agent_code → CSS 클래스 매핑
const AGENT_CLASS_MAP = {
    'k-meme': 'talaria-agent-k-meme',
    'global-meme': 'talaria-agent-global-meme',
    'overseas-meme': 'talaria-agent-global-meme',
    game: 'talaria-agent-game',
    music: 'talaria-agent-music',
    mukbang: 'talaria-agent-mukbang',
    travel: 'talaria-agent-travel',
    vlog: 'talaria-agent-vlog',
    talk: 'talaria-agent-talk',
    study: 'talaria-agent-study',
    default: 'talaria-agent-default',
};

// ✅ agent_code → 이모지 매핑
const AGENT_EMOJI_MAP = {
    'k-meme': '💜', // K-POP / K-밈 느낌 (보라하트)
    'global-meme': '🌍', // 글로벌 밈
    'overseas-meme': '✈️', // 해외 관련 밈/컨텐츠
    game: '🎮',
    music: '🎧', // 음악/아이돌 곡
    mukbang: '🍜', // 먹방
    travel: '🏝️', // 여행
    vlog: '📹', // 브이로그
    talk: '🗨️', // 수다/토크
    study: '📖', // 공부/스터디
    default: '🌟',
};

/**
 * 🔁 알럿으로 감지된 모든 키워드를 누적 저장하는 전역 Map
 *  - key: 소문자 keyword (예: "금사빠")
 *  - value: { keyword: 원본표기, agentCode }
 *
 *  => 한 번 알럿에 잡힌 단어는 alertHighlights가 비워져도
 *     회의 끝날 때까지 계속 하이라이트됨
 */
const PERSIST_ALERT_KEYWORD_MAP = new Map();

// ✅ 콘솔 로그를 한 번만 찍기 위한 Set (디버깅용)
const LOGGED_ALERT_KEYWORDS = new Set();

/**
 * text: STT/채팅 문자열
 * themeColors: { primary, secondary } (지금은 미사용, 고정색 사용)
 * alertHighlights: [{ keyword / match_text, agent_code }, ...]
 */

const DEFAULT_FROM = '#0ea5e9'; // 일반 키워드용 고정 그라디언트 시작
const DEFAULT_TO = '#6366f1'; // 일반 키워드용 고정 그라디언트 끝

export const highlightKeywords = (text, themeColors, alertHighlights = []) => {
    if (!text) return null;

    // 1) 새로 들어온 알럿 키워드를 영구 Map에 누적
    if (alertHighlights && alertHighlights.length > 0) {
        (alertHighlights || []).forEach((h) => {
            const raw = (h.keyword || h.match_text || '').trim();
            if (!raw) return;

            const lower = raw.toLowerCase();
            const prev = PERSIST_ALERT_KEYWORD_MAP.get(lower) || {};

            const meta = {
                keyword: prev.keyword || raw,
                agentCode: h.agent_code || h.agentCode || prev.agentCode || 'default',
            };

            PERSIST_ALERT_KEYWORD_MAP.set(lower, meta);

            if (!LOGGED_ALERT_KEYWORDS.has(lower)) {
                console.log('[highlightKeywords] 새로운 알럿 키워드 등록', {
                    lower,
                    meta,
                });
                LOGGED_ALERT_KEYWORDS.add(lower);
            }
        });
    }

    const defaultFrom = DEFAULT_FROM;
    const defaultTo = DEFAULT_TO;

    const hasMicPrefix = text.startsWith('🎤');
    const bodyText = hasMicPrefix ? text.replace(/^🎤\s?/, '') : text;

    // 기본 키워드 + 영구 알럿 키워드 둘 다 없으면 그냥 원문 리턴
    if (!HIGHLIGHT_KEYWORDS.length && PERSIST_ALERT_KEYWORD_MAP.size === 0) {
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

    // 2) 영구 저장된 알럿 키워드 목록 추출
    const persistedAlertKeywords = Array.from(PERSIST_ALERT_KEYWORD_MAP.values()).map((v) => v.keyword);

    // 3) 기본 키워드 + 알럿 키워드 합치기
    const allKeywords = [...HIGHLIGHT_KEYWORDS, ...persistedAlertKeywords];
    const uniqueKeywords = Array.from(new Set(allKeywords.map(String)));

    if (!uniqueKeywords.length) {
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

    const escapedKeywords = uniqueKeywords.map(escapeRegExp);
    const regex = new RegExp(`(${escapedKeywords.join('|')})`, 'gi');
    const parts = bodyText.split(regex);
    const lowerKeywords = uniqueKeywords.map((k) => k.toLowerCase());

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

        const originalKey = uniqueKeywords.find((kw) => kw.toLowerCase() === lower) || part;

        // 🔍 이 키워드에 대한 영구 메타데이터 조회 (알럿 여부 + agentCode)
        const persistedMeta = PERSIST_ALERT_KEYWORD_MAP.get(lower) || null;

        // 1순위: 서버 알럿에서 온 agentCode
        // 2순위: 기본 KEYWORD_AGENT_MAP 매핑
        const fallbackAgentCode = KEYWORD_AGENT_MAP[originalKey] || null;
        const agentCode = persistedMeta?.agentCode || fallbackAgentCode || null;

        const isAlertKeyword = !!persistedMeta;
        const agentClass = agentCode ? AGENT_CLASS_MAP[agentCode] || AGENT_CLASS_MAP.default : '';

        // 🎯 이모지 결정 (카테고리 있는 경우만)
        const emoji = agentCode ? AGENT_EMOJI_MAP[agentCode] || AGENT_EMOJI_MAP.default : null;

        const keywordClassName = [
            'talaria-keyword',
            `talaria-keyword--${originalKey}`,
            agentClass,
            isAlertKeyword ? 'talaria-keyword--alert' : '',
            isAlertKeyword && agentCode ? 'talaria-agent--pulse' : '',
            'inline-flex',
            'items-center',
            'justify-center',
            'align-middle',
        ]
            .filter(Boolean)
            .join(' ');

        // 🔧 스타일 분기
        const style = {
            fontSize: '1.25em',
            fontWeight: 900,
            padding: '0.16rem 0.72rem',
            margin: '0 0.06rem',
            borderRadius: '999px',
            letterSpacing: '0.04em',
            whiteSpace: 'pre-wrap',
        };

        if (agentCode) {
            // 카테고리가 있는 경우: 배경/텍스트색은 CSS(.talaria-agent-*)가 담당
            if (isAlertKeyword) {
                // 알럿으로 감지된 경우만 추가 글로우
                style.boxShadow = '0 0 0 2px rgba(255,255,255,0.85), 0 0 18px rgba(56,189,248,0.9)';
                style.border = '1px solid rgba(15,23,42,0.4)';
            }
        } else {
            // 카테고리 없는 일반 키워드는 고정 그라디언트 사용
            style.backgroundImage = `linear-gradient(135deg, ${defaultFrom}, ${defaultTo})`;
            style.color = '#ffffff';
        }

        nodes.push(
            <span key={`kw-${idx}`} className={keywordClassName} style={style}>
                {emoji && (
                    <span className="talaria-agent-emoji mr-1" aria-hidden="true">
                        {emoji}
                    </span>
                )}
                <span className="talaria-agent-text">{part}</span>
            </span>,
        );
    });

    return nodes;
};

// ✅ 회의 종료/페이지 나갈 때 호출해서 상태 초기화
export const clearAlertHighlightKeywords = () => {
    PERSIST_ALERT_KEYWORD_MAP.clear();
    LOGGED_ALERT_KEYWORDS.clear();
};
