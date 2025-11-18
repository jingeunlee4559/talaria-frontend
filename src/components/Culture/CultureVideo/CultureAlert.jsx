// src/components/Culture/LiveView/CultureAlert.jsx
import { useEffect, useMemo, useRef, useState } from 'react';
import { ConnectionState, RoomEvent } from 'livekit-client';
import { useRoomContext } from '@livekit/components-react';
import { X, Sparkles, Heart, Star, Zap, Globe2 } from 'lucide-react';

// 🎭 캐릭터 정의 (AI 문화 통역사)
const CULTURE_CHARACTERS = {
    korean: {
        id: 'korean',
        name: '토리',
        role: 'K-Culture AI 통역사',
        country: '한국',
        greeting: '안녕하세요! K-밈이랑 문화 차이, 제가 다 통역해 드릴게요 ✨',
        color: 'from-pink-500 to-rose-500',
        secondaryColor: 'from-pink-400 to-rose-400',
        accentColor: '#FFD700',
        bodyColor: '#FFE4E1',
        darkColor: '#FF69B4',
        personality: 'cheerful',
    },
    japanese: {
        id: 'japanese',
        name: '냥코',
        role: '일본 문화 AI 통역사',
        country: '일본',
        greeting: 'こんにちは! 예의 바른 일본 문화, 제가 부드럽게 설명해 드릴게요 🌸',
        color: 'from-red-500 to-pink-500',
        secondaryColor: 'from-red-400 to-pink-400',
        accentColor: '#FFB7C5',
        bodyColor: '#FFF5EE',
        darkColor: '#FF1493',
        personality: 'polite',
    },
    american: {
        id: 'american',
        name: '이글',
        role: '글로벌 감성 AI 통역사',
        country: '미국',
        greeting: 'Hey! 글로벌 표현과 뉘앙스는 저한테 맡겨 주세요 🦅',
        color: 'from-blue-500 to-cyan-500',
        secondaryColor: 'from-blue-400 to-cyan-400',
        accentColor: '#FFD700',
        bodyColor: '#E6F3FF',
        darkColor: '#4169E1',
        personality: 'confident',
    },
    chinese: {
        id: 'chinese',
        name: '팬더',
        role: '중화권 문화 AI 통역사',
        country: '중국',
        greeting: '你好! 중화권 문화와 매너, 조용히 정확하게 알려 줄게요 🐼',
        color: 'from-red-600 to-yellow-500',
        secondaryColor: 'from-red-500 to-yellow-400',
        accentColor: '#FFD700',
        bodyColor: '#FFFFFF',
        darkColor: '#000000',
        personality: 'wise',
    },
};

// 🎯 agent_code → 캐릭터 매핑
const AGENT_TO_CHARACTER = {
    // K-컬처 / K-밈
    'K-meme': 'korean',

    // 글로벌/해외 밈
    'global-meme': 'american',
    'overseas-meme': 'american',

    // 콘텐츠 타입별
    music: 'korean',
    game: 'japanese',
    mukbang: 'korean',
    travel: 'american',
    vlog: 'chinese',
    talk: 'korean',
    study: 'japanese',

    // 기존 culture 에이전트
    gesture: 'korean',
    manner: 'korean',
    age: 'korean',
    gift: 'korean',

    bow: 'japanese',
    onsen: 'japanese',

    tip: 'american',
    space: 'american',

    lantern: 'chinese',
    dragon: 'chinese',

    // 오탈자 방어
    'gloalbl-meam': 'american',
    tarvel: 'american',

    // 기본값
    default: 'american',
};

const AGENT_INFO = {
    'K-meme': { icon: '😂', name: 'K-밈 해석', color: 'from-pink-500 to-rose-500' },
    'k-meme': { icon: '😂', name: 'K-밈 해석', color: 'from-pink-500 to-rose-500' },

    'global-meme': { icon: '🌍', name: '글로벌 밈 해석', color: 'from-sky-500 to-indigo-500' },
    'overseas-meme': { icon: '🌍', name: '해외 밈 해석', color: 'from-sky-500 to-indigo-500' },

    music: { icon: '🎵', name: '음악 · K-POP 문화', color: 'from-purple-500 to-pink-500' },
    game: { icon: '🎮', name: '게임 · 스트리밍 문화', color: 'from-emerald-500 to-teal-500' },
    mukbang: { icon: '🍱', name: '먹방 · 식문화', color: 'from-orange-500 to-amber-500' },
    travel: { icon: '✈️', name: '여행 · 로컬 문화', color: 'from-blue-500 to-cyan-500' },
    vlog: { icon: '📹', name: '브이로그 · 일상 문화', color: 'from-rose-500 to-fuchsia-500' },
    talk: { icon: '💬', name: '잡담 · 토크 문화', color: 'from-slate-500 to-slate-700' },
    study: { icon: '📚', name: '공부 · 스터디 문화', color: 'from-amber-500 to-lime-500' },

    gesture: { icon: '👋', name: '제스처 · 바디랭귀지', color: 'from-purple-500 to-violet-500' },
    manner: { icon: '🙂', name: '매너 · 예절 문화', color: 'from-indigo-500 to-sky-500' },
    food: { icon: '🍜', name: '음식 · 식문화', color: 'from-orange-500 to-amber-500' },
    number: { icon: '🔢', name: '숫자 · 나이 표현', color: 'from-blue-500 to-cyan-500' },
    age: { icon: '🧑‍🤝‍🧑', name: '호칭 · 나이 문화', color: 'from-cyan-500 to-teal-500' },
    gift: { icon: '🎁', name: '선물 · 기념 문화', color: 'from-pink-500 to-red-500' },

    bow: { icon: '🙏', name: '인사 · 절 문화', color: 'from-amber-500 to-red-500' },
    onsen: { icon: '♨️', name: '온천 · 휴식 문화', color: 'from-red-500 to-orange-500' },
    lantern: { icon: '🏮', name: '축제 · 랜턴 문화', color: 'from-red-600 to-yellow-500' },
    dragon: { icon: '🐉', name: '용 · 상징 문화', color: 'from-red-700 to-amber-500' },

    tip: { icon: '💡', name: '글로벌 매너 팁', color: 'from-emerald-500 to-teal-500' },
    space: { icon: '🚀', name: 'SF · 우주 문화', color: 'from-indigo-500 to-fuchsia-500' },

    default: { icon: '✨', name: 'AI 문화 통역', color: 'from-pink-500 to-purple-500' },
};

// ===== 캐릭터 SVG들 (기존 그대로) =====
const KoreanBunny = ({ state = 'normal', size = 110 }) => {
    const isHappy = state === 'happy';
    const isGreeting = state === 'greeting';

    return (
        <svg width={size} height={size} viewBox="0 0 120 120" className="character-svg">
            <circle cx="60" cy="60" r="55" fill="url(#bunnyGlow)" opacity="0.25" className="animate-pulse-soft" />
            <g className={isGreeting ? 'animate-ear-wiggle-left' : ''}>
                <ellipse cx="40" cy="25" rx="8" ry="28" fill="#FFE4E1" />
                <ellipse cx="40" cy="28" rx="5" ry="20" fill="#FFB6C1" />
            </g>
            <g className={isGreeting ? 'animate-ear-wiggle-right' : ''}>
                <ellipse cx="80" cy="25" rx="8" ry="28" fill="#FFE4E1" />
                <ellipse cx="80" cy="28" rx="5" ry="20" fill="#FFB6C1" />
            </g>
            <circle cx="60" cy="60" r="32" fill="#FFE4E1" className="animate-float-gentle" />
            <g className="animate-float-gentle" style={{ animationDelay: '0.1s' }}>
                <path d="M 35 75 Q 40 72 60 72 Q 80 72 85 75 L 88 95 Q 60 98 32 95 Z" fill="url(#hanbokGradient)" />
                <path d="M 40 72 Q 60 70 80 72" stroke="#FFF" strokeWidth="3" fill="none" />
                <path d="M 65 75 Q 75 78 73 85 Q 70 82 65 80" fill="#FFD700" className="animate-ribbon-wave" />
                <circle cx="73" cy="85" r="2" fill="#FFA500" className="animate-shimmer-rotate" />
            </g>
            <ellipse cx="38" cy="78" rx="6" ry="14" fill="#FFE4E1" className={isGreeting ? 'animate-wave-arm-left' : ''} />
            <ellipse cx="82" cy="78" rx="6" ry="14" fill="#FFE4E1" className={isGreeting ? 'animate-wave-arm-right' : ''} />
            {isHappy ? (
                <>
                    <path d="M 48 55 Q 52 58 56 55" stroke="#FF69B4" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                    <path d="M 64 55 Q 68 58 72 55" stroke="#FF69B4" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                </>
            ) : (
                <>
                    <circle cx="50" cy="55" r="3" fill="#333" className="animate-blink" />
                    <circle cx="70" cy="55" r="3" fill="#333" className="animate-blink" />
                    <circle cx="51" cy="54" r="1.5" fill="#FFF" />
                    <circle cx="71" cy="54" r="1.5" fill="#FFF" />
                </>
            )}
            <circle cx="60" cy="62" r="2" fill="#FF69B4" />
            <path d="M 60 62 L 60 66" stroke="#FF69B4" strokeWidth="1.5" />
            <path d="M 56 67 Q 60 70 64 67" stroke="#FF69B4" strokeWidth="2" fill="none" strokeLinecap="round" />
            <ellipse cx="45" cy="63" rx="6" ry="4" fill="#FFB6C1" opacity="0.6" className="animate-blush-pulse" />
            <ellipse cx="75" cy="63" rx="6" ry="4" fill="#FFB6C1" opacity="0.6" className="animate-blush-pulse" />
            <defs>
                <radialGradient id="bunnyGlow">
                    <stop offset="0%" stopColor="#FF69B4" />
                    <stop offset="100%" stopColor="#FFB6C1" stopOpacity="0" />
                </radialGradient>
                <linearGradient id="hanbokGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#FF69B4" />
                    <stop offset="50%" stopColor="#FF1493" />
                    <stop offset="100%" stopColor="#C71585" />
                </linearGradient>
            </defs>
        </svg>
    );
};

const JapaneseCat = ({ state = 'normal', size = 110 }) => {
    const isHappy = state === 'happy';
    const isGreeting = state === 'greeting';

    return (
        <svg width={size} height={size} viewBox="0 0 120 120" className="character-svg">
            {isHappy && (
                <>
                    <g className="animate-sakura-fall-1" opacity="0.8">
                        <path d="M 20 10 L 22 12 L 20 14 L 18 12 Z" fill="#FFB7C5" />
                        <circle cx="20" cy="12" r="1" fill="#FFF" />
                    </g>
                    <g className="animate-sakura-fall-2" opacity="0.8">
                        <path d="M 100 20 L 102 22 L 100 24 L 98 22 Z" fill="#FFB7C5" />
                        <circle cx="100" cy="22" r="1" fill="#FFF" />
                    </g>
                </>
            )}
            <circle cx="60" cy="60" r="55" fill="url(#catGlow)" opacity="0.25" className="animate-pulse-soft" />
            <g className={isGreeting ? 'animate-ear-twitch-left' : ''}>
                <path d="M 35 35 L 30 20 L 45 30 Z" fill="#FFF5EE" />
                <path d="M 35 30 L 32 22 L 40 28 Z" fill="#FFB7C5" />
            </g>
            <g className={isGreeting ? 'animate-ear-twitch-right' : ''}>
                <path d="M 85 35 L 90 20 L 75 30 Z" fill="#FFF5EE" />
                <path d="M 85 30 L 88 22 L 80 28 Z" fill="#FFB7C5" />
            </g>
            <circle cx="60" cy="60" r="30" fill="#FFF5EE" className="animate-float-gentle" />
            <g className="animate-float-gentle" style={{ animationDelay: '0.1s' }}>
                <path d="M 35 75 Q 40 73 60 73 Q 80 73 85 75 L 88 98 Q 60 100 32 98 Z" fill="url(#kimonoGradient)" />
                <rect x="45" y="80" width="30" height="8" fill="url(#obiGradient)" rx="2" className="animate-ribbon-shimmer" />
                <circle cx="60" cy="84" r="3" fill="#FFA500" className="animate-shimmer-rotate" />
            </g>
            {isHappy ? (
                <>
                    <path d="M 47 54 Q 50 56 53 54" stroke="#FF1493" strokeWidth="2" fill="none" strokeLinecap="round" />
                    <path d="M 67 54 Q 70 56 73 54" stroke="#FF1493" strokeWidth="2" fill="none" strokeLinecap="round" />
                </>
            ) : (
                <>
                    <ellipse cx="50" cy="54" rx="5" ry="2" fill="#333" className="animate-cat-blink" />
                    <ellipse cx="70" cy="54" rx="5" ry="2" fill="#333" className="animate-cat-blink" />
                </>
            )}
            <path d="M 60 60 L 58 62 L 62 62 Z" fill="#FF69B4" />
            <defs>
                <radialGradient id="catGlow">
                    <stop offset="0%" stopColor="#FF1493" />
                    <stop offset="100%" stopColor="#FFB7C5" stopOpacity="0" />
                </radialGradient>
                <linearGradient id="kimonoGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#DC143C" />
                    <stop offset="50%" stopColor="#FF1493" />
                    <stop offset="100%" stopColor="#C71585" />
                </linearGradient>
                <linearGradient id="obiGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#FFD700" />
                    <stop offset="50%" stopColor="#FFA500" />
                    <stop offset="100%" stopColor="#FFD700" />
                </linearGradient>
            </defs>
        </svg>
    );
};

const AmericanEagle = ({ state = 'normal', size = 110 }) => {
    const isHappy = state === 'happy';
    const isGreeting = state === 'greeting';

    return (
        <svg width={size} height={size} viewBox="0 0 120 120" className="character-svg">
            <circle cx="60" cy="55" r="50" fill="url(#eagleGlow)" opacity="0.25" className="animate-pulse-soft" />
            <g className={isGreeting ? 'animate-wing-flap-left' : ''}>
                <ellipse cx="30" cy="65" rx="20" ry="35" fill="#4169E1" opacity="0.9" transform="rotate(-20 30 65)" />
            </g>
            <g className={isGreeting ? 'animate-wing-flap-right' : ''}>
                <ellipse cx="90" cy="65" rx="20" ry="35" fill="#4169E1" opacity="0.9" transform="rotate(20 90 65)" />
            </g>
            <ellipse cx="60" cy="70" rx="18" ry="25" fill="#E6F3FF" className="animate-float-gentle" />
            <circle cx="60" cy="50" r="22" fill="#E6F3FF" className="animate-float-gentle" />
            <g className="animate-hat-tip">
                <ellipse cx="60" cy="32" rx="26" ry="5" fill="#8B4513" />
            </g>
            {isHappy ? (
                <>
                    <path d="M 48 46 Q 52 48 56 46" stroke="#4169E1" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                    <path d="M 64 46 Q 68 48 72 46" stroke="#4169E1" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                </>
            ) : (
                <>
                    <circle cx="50" cy="48" r="4" fill="#333" className="animate-determined-blink" />
                    <circle cx="70" cy="48" r="4" fill="#333" className="animate-determined-blink" />
                </>
            )}
            <path d="M 60 55 Q 65 58 60 60 Q 55 58 60 55" fill="#FFA500" />
            <defs>
                <radialGradient id="eagleGlow">
                    <stop offset="0%" stopColor="#4169E1" />
                    <stop offset="100%" stopColor="#87CEEB" stopOpacity="0" />
                </radialGradient>
            </defs>
        </svg>
    );
};

const ChinesePanda = ({ state = 'normal', size = 110 }) => {
    const isHappy = state === 'happy';
    const isGreeting = state === 'greeting';

    return (
        <svg width={size} height={size} viewBox="0 0 120 120" className="character-svg">
            <circle cx="60" cy="60" r="55" fill="url(#pandaGlow)" opacity="0.25" className="animate-pulse-soft" />
            <circle cx="38" cy="35" r="10" fill="#000" className={isGreeting ? 'animate-ear-wiggle-left' : ''} />
            <circle cx="82" cy="35" r="10" fill="#000" className={isGreeting ? 'animate-ear-wiggle-right' : ''} />
            <circle cx="60" cy="55" r="28" fill="#FFF" className="animate-float-gentle" />
            <ellipse cx="48" cy="52" rx="8" ry="10" fill="#000" />
            <ellipse cx="72" cy="52" rx="8" ry="10" fill="#000" />
            {isHappy ? (
                <>
                    <path d="M 45 51 Q 48 53 51 51" stroke="#FFF" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                    <path d="M 69 51 Q 72 53 75 51" stroke="#FFF" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                </>
            ) : (
                <>
                    <circle cx="48" cy="52" r="3" fill="#FFF" className="animate-blink" />
                    <circle cx="72" cy="52" r="3" fill="#FFF" className="animate-blink" />
                </>
            )}
            <ellipse cx="60" cy="62" rx="4" ry="3" fill="#000" />
            <path d="M 60 62 L 60 67" stroke="#000" strokeWidth="2" />
            <path d="M 55 68 Q 60 71 65 68" stroke="#000" strokeWidth="2" fill="none" strokeLinecap="round" />
            <defs>
                <radialGradient id="pandaGlow">
                    <stop offset="0%" stopColor="#DC143C" />
                    <stop offset="100%" stopColor="#FFD700" stopOpacity="0" />
                </radialGradient>
            </defs>
        </svg>
    );
};

// 데모용
const MOCK_ALERTS = [
    {
        type: 'manner_alert',
        label: 'K-CULTURE TIP',
        match: '레전드',
        explanation: '아주 인상적이거나 전설적인 상황을 의미하는 K-밈이에요!',
        suggestion: '해외에서는 "Epic", "Legendary" 같은 표현으로 전달하면 느낌이 잘 살아나요.',
        agent_code: 'K-meme',
        severity: 1,
        language: 'ko-KR',
    },
    {
        type: 'manner_alert',
        label: 'K-Gesture Alert',
        match: '하트 제스처',
        explanation: '손가락으로 하트를 만드는 건 한국 특유의 팬·친구 사이 제스처예요.',
        suggestion: '다른 문화권에서는 처음 보는 사람도 많아서, 한 번 설명해주면 더 재밌게 받아들여져요!',
        agent_code: 'gesture',
        severity: 2,
        language: 'ko-KR',
    },
];

function mapSeverity(sev) {
    if (typeof sev === 'number') return Math.min(3, Math.max(1, sev));
    return 1;
}

function normalizeToCard(ev) {
    if (!ev) return null;

    const matchText = (ev.match && String(ev.match).trim()) || (ev.label && String(ev.label).trim()) || '';
    if (!matchText) return null;

    const sev = mapSeverity(ev.severity);
    const explanation = (ev.explanation || '').toString().trim() || '문화적 차이가 있을 수 있어요!';
    const suggestion = (ev.suggestion || '').toString().trim() || '';
    const speaker = ev.identity || ev.username || 'unknown';
    const cooldownSec = 30;

    const agentCode = ev.agent_code || 'default';
    const characterId = AGENT_TO_CHARACTER[agentCode] || AGENT_TO_CHARACTER.default;

    return {
        id: Date.now() + Math.random(),
        label: ev.label || 'K-Culture Tip',
        match_text: matchText,
        explanation,
        suggestion,
        severity: sev,
        agent_code: agentCode,
        character: characterId,
        key: `${agentCode}:${speaker}:${matchText}`,
        cooldownSec,
        username: ev.username || speaker,
        language: ev.language || 'ko-KR',
    };
}

export default function CultureAlert({ room: roomProp, displayMs = 8000, debug = false, demo = false }) {
    const roomCtx = useRoomContext?.();
    const room = roomProp || roomCtx || null;

    const [current, setCurrent] = useState(null);
    const [visible, setVisible] = useState(false);
    const [progress, setProgress] = useState(100);
    const [showHearts, setShowHearts] = useState(false);
    const [hearts, setHearts] = useState([]);
    const [characterState, setCharacterState] = useState('greeting');

    const [demoIdx, setDemoIdx] = useState(0);
    const [dismissed, setDismissed] = useState(false);

    const queueRef = useRef([]);
    const lastShownAtRef = useRef(new Map());
    const decoder = useMemo(() => new TextDecoder('utf-8'), []);
    const PROGRESS_INTERVAL_MS = 100;

    const severityInfo = useMemo(
        () => ({
            3: { icon: Zap, label: '주의 필요', bg: 'bg-red-50', text: 'text-red-700', ring: 'ring-red-200' },
            2: { icon: Star, label: '문화 포인트', bg: 'bg-orange-50', text: 'text-orange-700', ring: 'ring-orange-200' },
            1: { icon: Heart, label: '귀여운 문화 팁', bg: 'bg-pink-50', text: 'text-pink-700', ring: 'ring-pink-200' },
        }),
        [],
    );

    const isConnected = !!room && (room.state === ConnectionState.Connected || room.state === 'connected');
    const liveMode = !demo && isConnected;

    // DataChannel 수신
    useEffect(() => {
        if (!liveMode) return;

        const onData = (payload, participant, kind, topic) => {
            try {
                const rawText = decoder.decode(payload);
                const data = JSON.parse(rawText);

                if (debug) {
                    console.log('[CultureAlert] Data:', { type: data.type, label: data.label, match: data.match, topic });
                }

                const t = String(data?.type || '').toLowerCase();
                if (topic !== 'manner' && topic !== 'culture' && t !== 'manner' && t !== 'manner_alert' && t !== 'culture_alert') {
                    return;
                }

                const card = normalizeToCard(data);
                if (!card) return;

                const now = Date.now();
                const last = lastShownAtRef.current.get(card.key) ?? 0;
                const cd = Math.max(0, Number(card.cooldownSec || 0)) * 1000;
                if (now - last < cd) {
                    if (debug) console.log('[CultureAlert] cooldown skip:', card.key);
                    return;
                }

                lastShownAtRef.current.set(card.key, now);
                queueRef.current.push(card);

                if (!current && !visible) {
                    const next = queueRef.current.shift() || null;
                    if (next) {
                        setCurrent(next);
                        setVisible(true);
                        setProgress(100);
                        setCharacterState('greeting');
                    }
                }
            } catch (e) {
                console.error('[CultureAlert] parse error:', e);
            }
        };

        room.on(RoomEvent.DataReceived, onData);
        return () => {
            room.off(RoomEvent.DataReceived, onData);
        };
    }, [liveMode, room, decoder, debug, current, visible]);

    // 캐릭터 상태
    useEffect(() => {
        if (!visible) return;
        setCharacterState('greeting');
        const timer = setTimeout(() => setCharacterState('normal'), 2000);
        return () => clearTimeout(timer);
    }, [visible, current]);

    // 진행바 & 자동 닫힘
    useEffect(() => {
        if (!visible || !current) return;

        setProgress(100);
        const steps = displayMs / PROGRESS_INTERVAL_MS;
        const delta = 100 / steps;

        const tick = setInterval(() => {
            setProgress((p) => {
                const next = Math.max(0, p - delta);
                if (next <= 0) {
                    clearInterval(tick);
                    const n = queueRef.current.shift() || null;
                    if (n) {
                        setCurrent(n);
                        setVisible(true);
                        setProgress(100);
                        setShowHearts(false);
                        setCharacterState('greeting');
                    } else {
                        setVisible(false);
                        setCurrent(null);
                        setShowHearts(false);
                    }
                }
                return next;
            });
        }, PROGRESS_INTERVAL_MS);

        return () => clearInterval(tick);
    }, [visible, current, displayMs]);

    // 데모 모드
    useEffect(() => {
        if (liveMode) return;
        if (dismissed) return;

        if (!current) {
            const first = normalizeToCard(MOCK_ALERTS[0]);
            setCurrent(first);
            setVisible(true);
            setProgress(100);
            setDemoIdx(1);
        }

        const timer = setInterval(() => {
            setVisible(false);
            setProgress(100);
            setTimeout(() => {
                const next = normalizeToCard(MOCK_ALERTS[demoIdx % MOCK_ALERTS.length]);
                setCurrent(next);
                setVisible(true);
                setDemoIdx((i) => (i + 1) % MOCK_ALERTS.length);
            }, 250);
        }, displayMs + 500);

        return () => clearInterval(timer);
    }, [liveMode, current, displayMs, demoIdx, dismissed]);

    const handleThank = () => {
        setShowHearts(true);
        setCharacterState('happy');

        const newHearts = Array.from({ length: 14 }, (_, i) => ({
            id: Date.now() + i,
            angle: (Math.PI * 2 * i) / 14,
            delay: Math.random() * 0.3,
            scale: Math.random() * 0.5 + 0.7,
        }));
        setHearts(newHearts);

        setTimeout(() => {
            setHearts([]);
            setCharacterState('normal');
        }, 2000);
    };

    const handleClose = () => {
        setVisible(false);
        setTimeout(() => {
            setCurrent(null);
            setShowHearts(false);
            setCharacterState('normal');
            if (!liveMode) setDismissed(true);
        }, 200);
    };

    if (!current || (!liveMode && dismissed)) return null;

    const s = severityInfo[current.severity] || severityInfo[1];
    const SeverityIcon = s.icon;
    const agentInfo = AGENT_INFO[current.agent_code] || AGENT_INFO.default;
    const character = CULTURE_CHARACTERS[current.character] || CULTURE_CHARACTERS.korean;

    const CharacterComponent =
        {
            korean: KoreanBunny,
            japanese: JapaneseCat,
            american: AmericanEagle,
            chinese: ChinesePanda,
        }[character.id] || KoreanBunny;

    const remainingSeconds = Math.ceil((progress / 100) * (displayMs / 1000));

    return (
        <div
            className={`
                pointer-events-none
                absolute          // ✅ 영상 컨테이너 기준
                left-3 sm:left-6
                top-[4.2rem] sm:top-[3.3rem]
                z-[9998]
                transition-all duration-300 ease-out
               ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-1'}
            `}
            role="alert"
        >
            {/* 캐릭터 + 말풍선 묶음 */}
            <div className="relative flex items-start gap-0">
                {/* 캐릭터 블럭 (말풍선 상단 옆에) */}
                <div className="relative flex-shrink-0 pointer-events-auto mt-2 sm:mt-3">
                    {/* 하트 폭발 */}
                    {showHearts && hearts.length > 0 && (
                        <div className="absolute inset-0 pointer-events-none z-10">
                            {hearts.map((heart) => (
                                <div
                                    key={heart.id}
                                    className="absolute text-3xl animate-heart-burst"
                                    style={{
                                        left: '50%',
                                        top: '40%',
                                        '--angle': `${heart.angle}rad`,
                                        '--scale': heart.scale,
                                        animationDelay: `${heart.delay}s`,
                                    }}
                                >
                                    ❤️
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white shadow-xl border-2 border-white/80 flex items-center justify-center overflow-hidden">
                        <CharacterComponent state={characterState} size={115} />
                        <div className="absolute inset-0 pointer-events-none">
                            <div className="absolute -top-1 -right-1 animate-orbit">
                                <Sparkles className="w-4 h-4 text-yellow-300 animate-sparkle-pulse" />
                            </div>
                        </div>
                    </div>

                    {/* 캐릭터 라벨 */}
                    <div className="mt-1 text-[10px] sm:text-xs font-semibold text-white px-2 py-0.5 rounded-full bg-black/40 backdrop-blur-sm inline-flex items-center gap-1 shadow-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse-dot" />
                        <span>{character.name} · AI 문화 통역사</span>
                    </div>
                </div>

                {/* 말풍선 블럭 */}
                <div className="relative max-w-[270px] sm:max-w-[330px] pointer-events-auto -ml-5 sm:-ml-6">
                    {/* 꼬리: 말풍선 상단 쪽에서 캐릭터 방향으로 */}
                    <div className="absolute -left-2 top-8 sm:top-9 w-4 h-4 bg-white border-l border-b border-gray-200 rotate-45 shadow-sm" />

                    <div className="relative bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200 px-4 py-3 sm:px-5 sm:py-4 overflow-hidden">
                        {/* 닫기 버튼 */}
                        <button
                            onClick={handleClose}
                            className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full bg-black/5 hover:bg-black/10 flex items-center justify-center transition-all hover:rotate-90 hover:scale-110"
                            aria-label="닫기"
                        >
                            <X size={14} className="text-gray-600" />
                        </button>

                        <div className="space-y-2 sm:space-y-2.5">
                            {/* 상단 메타 */}
                            <div className="flex items-start gap-2">
                                <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-2xl bg-gradient-to-br ${agentInfo.color} flex items-center justify-center shadow-md`}>
                                    <span className="text-xl">{agentInfo.icon}</span>
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex flex-wrap items-center gap-1.5">
                                        <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">{current.label || 'AI Culture Alert'}</span>
                                        <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full ${s.bg} ${s.text} text-[10px] font-semibold ring-1 ${s.ring}`}>
                                            <SeverityIcon className="w-3 h-3 animate-icon-pulse" />
                                            <span>{s.label}</span>
                                        </span>
                                    </div>

                                    <p className="text-[10px] sm:text-[11px] text-gray-500 mt-0.5">
                                        감지된 표현 · <span className="font-semibold">{current.username || '참가자'}</span>
                                    </p>
                                </div>
                            </div>

                            {/* 감지된 문장 */}
                            <p className="text-sm sm:text-base font-bold text-gray-900 leading-snug break-words">“{current.match_text}”</p>

                            {/* AI 문화 해석 */}
                            <div className="bg-gray-50 rounded-xl px-3 py-2.5 border border-gray-100 animate-speech-bubble">
                                <p className="text-[10px] sm:text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-0.5">AI 문화 해석</p>
                                <p className="text-[11px] sm:text-sm text-gray-800 leading-relaxed whitespace-pre-line">{current.explanation}</p>
                            </div>

                            {/* 글로벌 소통 팁 */}
                            {current.suggestion && (
                                <div className="bg-amber-50 rounded-xl px-3 py-2.5 border border-amber-100 animate-fade-in-up">
                                    <p className="text-[10px] sm:text-[11px] font-semibold text-amber-900 mb-0.5 flex items-center gap-1">
                                        <span className="inline-flex w-4 h-4 rounded-full bg-gradient-to-br from-yellow-400 to-orange-400 items-center justify-center text-[10px] shadow-sm">💡</span>
                                        글로벌 소통 팁
                                    </p>
                                    <p className="text-[11px] sm:text-sm text-gray-800 leading-relaxed whitespace-pre-line">{current.suggestion}</p>
                                </div>
                            )}

                            {/* 하단 버튼/타이머 */}
                            <div className="flex items-center justify-between gap-2 pt-1">
                                {!showHearts ? (
                                    <>
                                        <button
                                            onClick={handleThank}
                                            className={`flex-1 bg-gradient-to-r ${character.color} text-white text-[11px] sm:text-sm font-semibold py-1.5 sm:py-2 px-3 rounded-xl shadow-md hover:shadow-lg hover:scale-[1.03] active:scale-95 transition-all flex items-center justify-center gap-1.5 relative overflow-hidden group`}
                                        >
                                            <div className="absolute inset-0 bg-white/15 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                                            <Heart className="w-4 h-4 relative z-10 group-hover:animate-heartbeat" fill="currentColor" />
                                            <span className="relative z-10">고마워요, AI 통역사!</span>
                                        </button>
                                        <div className="flex flex-col items-end gap-0.5 min-w-[72px]">
                                            <span className="text-[10px] text-gray-500 font-mono font-semibold">{remainingSeconds > 0 ? `${remainingSeconds}s` : '곧 닫힘'}</span>
                                            <span className="text-[9px] text-gray-400 inline-flex items-center gap-0.5">
                                                <Globe2 className="w-3 h-3" />
                                                실시간 통역
                                            </span>
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex-1 text-center py-1.5 sm:py-2 animate-bounce-in">
                                        <p className="text-sm sm:text-base font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-rose-500 to-red-500 animate-gradient-text">
                                            감사합니다!
                                        </p>
                                        <p className="text-[10px] text-gray-600">{character.name}이(가) 대화 분위기를 계속 보고 있어요 💫</p>
                                    </div>
                                )}
                            </div>

                            {/* 진행바 */}
                            <div className="mt-1 h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 transition-all duration-100 ease-linear" style={{ width: `${progress}%` }} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 커스텀 애니메이션 CSS */}
            <style>{`
    @keyframes ear-wiggle-left { 0%,100%{transform:rotate(0deg);}25%{transform:rotate(-15deg);}75%{transform:rotate(10deg);} }
    @keyframes ear-wiggle-right { 0%,100%{transform:rotate(0deg);}25%{transform:rotate(15deg);}75%{transform:rotate(-10deg);} }
    @keyframes ear-twitch-left { 0%,100%{transform:translateY(0);}50%{transform:translateY(-5px) rotate(-10deg);} }
    @keyframes ear-twitch-right { 0%,100%{transform:translateY(0);}50%{transform:translateY(-5px) rotate(10deg);} }
    @keyframes wave-arm-left { 0%,100%{transform:rotate(0deg) translateY(0);}25%{transform:rotate(-30deg) translateY(-5px);}50%{transform:rotate(-15deg) translateY(-3px);}75%{transform:rotate(-30deg) translateY(-5px);} }
    @keyframes wave-arm-right { 0%,100%{transform:rotate(0deg) translateY(0);}25%{transform:rotate(30deg) translateY(-5px);}50%{transform:rotate(15deg) translateY(-3px);}75%{transform:rotate(30deg) translateY(-5px);} }
    @keyframes ribbon-wave { 0%,100%{transform:rotate(0deg);}50%{transform:rotate(10deg);} }
    @keyframes wing-flap-left { 0%,100%{transform:translateY(0) rotate(-20deg);}50%{transform:translateY(-12px) rotate(-35deg);} }
    @keyframes wing-flap-right { 0%,100%{transform:translateY(0) rotate(20deg);}50%{transform:translateY(-12px) rotate(35deg);} }
    @keyframes hat-tip { 0%,100%{transform:rotate(0deg);}50%{transform:rotate(-8deg);} }
    @keyframes float-gentle { 0%,100%{transform:translateY(0);}50%{transform:translateY(-4px);} }
    @keyframes blush-pulse { 0%,100%{opacity:0.6;transform:scale(1);}50%{opacity:0.9;transform:scale(1.1);} }
    @keyframes blink { 0%,90%,100%{opacity:1;}95%{opacity:0;} }
    @keyframes determined-blink { 0%,85%,100%{opacity:1;transform:scaleY(1);}90%{opacity:0.3;transform:scaleY(0.3);} }
    @keyframes sakura-fall-1 { 0%{transform:translateY(0) rotate(0);opacity:0;}10%{opacity:1;}90%{opacity:1;}100%{transform:translateY(80px) rotate(360deg);opacity:0;} }
    @keyframes pulse-soft { 0%,100%{opacity:0.25;transform:scale(1);}50%{opacity:0.45;transform:scale(1.05);} }
    @keyframes orbit { 0%{transform:rotate(0deg);}100%{transform:rotate(360deg);} }
    @keyframes sparkle-pulse { 0%,100%{opacity:0.4;transform:scale(0.8);}50%{opacity:1;transform:scale(1.2);} }
    @keyframes heart-burst { 0%{opacity:0;transform:translate(-50%,-50%) translate(0,0) scale(0) rotate(0deg);}10%{opacity:1;}100%{opacity:0;transform:translate(-50%,-50%) translate(calc(cos(var(--angle))*150px),calc(sin(var(--angle))*150px)) scale(calc(var(--scale)*2)) rotate(720deg);} }
    @keyframes speech-bubble { 0%{opacity:0;transform:scale(0.9) translateY(8px);}100%{opacity:1;transform:scale(1) translateY(0);} }
    @keyframes fade-in-up { 0%{opacity:0;transform:translateY(8px);}100%{opacity:1;transform:translateY(0);} }
    @keyframes bounce-in { 0%{opacity:0;transform:scale(0.3) translateY(20px);}50%{transform:scale(1.05) translateY(-4px);}100%{opacity:1;transform:scale(1) translateY(0);} }
    @keyframes gradient-text { 0%{background-position:0% 50%;}50%{background-position:100% 50%;}100%{background-position:0% 50%;} }
    @keyframes icon-pulse { 0%,100%{transform:scale(1);}50%{transform:scale(1.15);} }
    @keyframes pulse-dot { 0%,100%{transform:scale(1);opacity:1;}50%{transform:scale(1.5);opacity:0.5;} }

    .animate-ear-wiggle-left { animation: ear-wiggle-left 1.6s ease-in-out infinite; transform-origin: 40px 25px; }
    .animate-ear-wiggle-right { animation: ear-wiggle-right 1.6s ease-in-out infinite; transform-origin: 80px 25px; }
    .animate-ear-twitch-left { animation: ear-twitch-left 1.6s ease-in-out infinite; transform-origin: 35px 30px; }
    .animate-ear-twitch-right { animation: ear-twitch-right 1.6s ease-in-out infinite; transform-origin: 85px 30px; }
    .animate-wave-arm-left { animation: wave-arm-left 1.2s ease-in-out infinite; transform-origin: 38px 78px; }
    .animate-wave-arm-right { animation: wave-arm-right 1.2s ease-in-out infinite; transform-origin: 82px 78px; }
    .animate-ribbon-wave { animation: ribbon-wave 2s ease-in-out infinite; transform-origin: 70px 80px; }
    .animate-wing-flap-left { animation: wing-flap-left 1.2s ease-in-out infinite; transform-origin: 30px 65px; }
    .animate-wing-flap-right { animation: wing-flap-right 1.2s ease-in-out infinite; transform-origin: 90px 65px; }
    .animate-hat-tip { animation: hat-tip 3s ease-in-out infinite; transform-origin: 60px 32px; }
    .animate-float-gentle { animation: float-gentle 3s ease-in-out infinite; }
    .animate-blush-pulse { animation: blush-pulse 2s ease-in-out infinite; }
    .animate-blink { animation: blink 4s ease-in-out infinite; }
    .animate-determined-blink { animation: determined-blink 3s ease-in-out infinite; transform-origin: center; }
    .animate-sakura-fall-1 { animation: sakura-fall-1 4s ease-in-out infinite; }
    .animate-pulse-soft { animation: pulse-soft 2.5s ease-in-out infinite; }
    .animate-orbit { animation: orbit 4s linear infinite; transform-origin: center; }
    .animate-sparkle-pulse { animation: sparkle-pulse 1.5s ease-in-out infinite; transform-origin: center; }
    .animate-heart-burst { animation: heart-burst 2s ease-out forwards; }
    .animate-speech-bubble { animation: speech-bubble 0.35s ease-out; }
    .animate-fade-in-up { animation: fade-in-up 0.4s ease-out 0.1s both; }
    .animate-bounce-in { animation: bounce-in 0.5s cubic-bezier(0.68,-0.55,0.265,1.55); }
    .animate-gradient-text { animation: gradient-text 3s ease infinite; background-size: 200% 200%; }
    .animate-icon-pulse { animation: icon-pulse 2s ease-in-out infinite; transform-origin: center; }
    .animate-pulse-dot { animation: pulse-dot 2s ease-in-out infinite; transform-origin: center; }
    .character-svg { filter: drop-shadow(0 4px 6px rgba(0,0,0,0.12)); }
            `}</style>
        </div>
    );
}
