// src/components/Culture/LiveView/CultureAlert.jsx
import { useEffect, useMemo, useRef, useState } from 'react';
import { ConnectionState, RoomEvent } from 'livekit-client';
import { useRoomContext } from '@livekit/components-react';
import { X, Sparkles, Heart, Star, Zap, Globe2 } from 'lucide-react';

// 마스코트 이미지 import (public 또는 src/assets 기준)
import tigerMascotImg from '../../../assets/mascot-tiger.jpg';

// 🎭 캐릭터 정의 (AI 문화 통역사 - 한복 백호 1종)
const CULTURE_CHARACTERS = {
    whiteTiger: {
        id: 'whiteTiger',
        name: '하랑이',
        role: '글로벌 K-컬처 AI 코치',
        country: '글로벌',
        greeting: '안녕! 전 세계 밈이랑 K-컬처 뉘앙스, 내가 백호처럼 든든하게 지켜볼게 🐯',
        color: 'from-sky-500 to-indigo-500',
        secondaryColor: 'from-sky-400 to-blue-400',
        accentColor: '#38BDF8',
        bodyColor: '#F9FAFB',
        darkColor: '#111827',
        personality: 'confident',
    },
};

// 🎯 agent_code → 캐릭터 매핑 (전부 백호로 통일)
const AGENT_TO_CHARACTER = {
    'k-meme': 'whiteTiger',
    music: 'whiteTiger',
    mukbang: 'whiteTiger',
    talk: 'whiteTiger',
    study: 'whiteTiger',

    'global-meme': 'whiteTiger',
    'overseas-meme': 'whiteTiger',
    game: 'whiteTiger',
    travel: 'whiteTiger',
    vlog: 'whiteTiger',

    // 오탈자 방어
    'gloalbl-meam': 'whiteTiger',
    tarvel: 'whiteTiger',

    // 기본값
    default: 'whiteTiger',
};

const AGENT_INFO = {
    'k-meme': { icon: '😂', name: 'K-밈 해석', color: 'from-sky-500 to-indigo-500' },

    'global-meme': { icon: '🌍', name: '글로벌 밈 해석', color: 'from-orange-500 to-amber-500' },
    'overseas-meme': { icon: '🌍', name: '해외 밈 해석', color: 'from-orange-500 to-amber-500' },

    music: { icon: '🎵', name: '음악 · K-POP 문화', color: 'from-purple-500 to-pink-500' },
    game: { icon: '🎮', name: '게임 · 스트리밍 문화', color: 'from-emerald-500 to-teal-500' },
    mukbang: { icon: '🍱', name: '먹방 · 식문화', color: 'from-orange-500 to-amber-500' },
    travel: { icon: '✈️', name: '여행 · 로컬 문화', color: 'from-blue-500 to-cyan-500' },
    vlog: { icon: '📹', name: '브이로그 · 일상 문화', color: 'from-rose-500 to-fuchsia-500' },
    talk: { icon: '💬', name: '잡담 · 토크 문화', color: 'from-slate-500 to-slate-700' },
    study: { icon: '📚', name: '공부 · 스터디 문화', color: 'from-amber-500 to-lime-500' },

    default: { icon: '✨', name: 'AI 문화 통역', color: 'from-sky-500 to-purple-500' },
};

// ===== 이미지 기반 마스코트 컴포넌트 =====
const TigerMascot = ({ state = 'normal', size = 110 }) => {
    const isHappy = state === 'happy';
    const isGreeting = state === 'greeting';

    return (
        <div
            className={`
                relative
                ${isGreeting ? 'animate-bounce-gentle' : 'animate-float-gentle'}
            `}
            style={{ width: size, height: size }}
        >
            {/* 메인 이미지 - 원형으로 */}
            <img
                src={tigerMascotImg}
                alt="백호 마스코트"
                className={`
                    w-full h-full 
                    object-cover
                    rounded-full
                    ${isHappy ? 'animate-wiggle' : ''}
                    ${isGreeting ? 'animate-bounce-gentle' : ''}
                `}
                style={{
                    filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.25))',
                }}
            />

            {/* 반짝이는 효과 */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute -top-2 -right-2 animate-orbit">
                    <Sparkles className="w-5 h-5 text-yellow-300 animate-sparkle-pulse drop-shadow-lg" />
                </div>
                <div className="absolute -bottom-1 -left-1 animate-orbit-reverse" style={{ animationDelay: '0.5s' }}>
                    <Star className="w-4 h-4 text-pink-300 animate-sparkle-pulse drop-shadow-lg" />
                </div>
            </div>

            {/* 은은한 광채 */}
            <div
                className="absolute inset-0 -z-10 rounded-full blur-2xl opacity-40 animate-pulse-soft"
                style={{
                    background: 'radial-gradient(circle, rgba(56,189,248,0.6) 0%, rgba(99,102,241,0.4) 50%, transparent 70%)',
                }}
            />

            {/* 행복할 때 추가 효과 */}
            {isHappy && (
                <>
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-2xl animate-bounce-high">✨</div>
                    <div className="absolute inset-0 animate-ping-once opacity-75">
                        <div className="w-full h-full rounded-full border-4 border-pink-400" />
                    </div>
                </>
            )}
        </div>
    );
};

// ===== 유틸 / 데모 데이터 =====
function shorten(text, max = 80) {
    if (!text) return '';
    const t = String(text).trim();
    if (t.length <= max) return t;
    return t.slice(0, max - 1) + '…';
}

const MOCK_ALERTS = [
    {
        type: 'manner_alert',
        label: 'K-CULTURE TIP',
        match: '레전드',
        explanation: '아주 인상적이거나 전설적인 상황을 의미하는 K-밈이에요!',
        suggestion: '해외에서는 "Epic", "Legendary" 같은 표현으로 전달하면 느낌이 잘 살아나요.',
        agent_code: 'k-meme',
        severity: 1,
        language: 'ko-KR',
    },
    {
        type: 'manner_alert',
        label: 'K-Gesture Alert',
        match: '하트 제스처',
        explanation: '손가락으로 하트를 만드는 건 한국 특유의 팬·친구 사이 제스처예요.',
        suggestion: '처음 보는 사람도 많아서, 한 번 설명해주면 더 재밌게 받아들여져요!',
        agent_code: 'global-meme',
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
        shortExplanation: shorten(explanation, 80),
        shortSuggestion: shorten(suggestion, 70),
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

    const [current, setCurrent] = useState(null); // 현재 표시 중인 카드
    const [visible, setVisible] = useState(false); // 카드 보임 여부
    const [progress, setProgress] = useState(100); // 진행바
    const [showHearts, setShowHearts] = useState(false);
    const [hearts, setHearts] = useState([]);
    const [characterState, setCharacterState] = useState('normal');
    const [bubbleHidden, setBubbleHidden] = useState(false); // ✅ 말풍선 온/오프

    const [demoIdx, setDemoIdx] = useState(0);
    const [dismissed, setDismissed] = useState(false);

    const queueRef = useRef([]);
    const lastShownAtRef = useRef(new Map());
    const decoder = useMemo(() => new TextDecoder('utf-8'), []);
    const PROGRESS_INTERVAL_MS = 100;

    const severityInfo = useMemo(
        () => ({
            3: { icon: Zap, label: '주의 필요', accent: 'text-red-300' },
            2: { icon: Star, label: '문화 포인트', accent: 'text-orange-300' },
            1: { icon: Heart, label: '귀여운 문화 팁', accent: 'text-pink-300' },
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
                        setBubbleHidden(false); // ✅ 새 카드 등장 시 말풍선 ON
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

    // 진행바 & 자동 닫힘 (카드만 제어)
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
                        setBubbleHidden(false); // ✅ 다음 카드도 말풍선 ON
                        setProgress(100);
                        setShowHearts(false);
                        setCharacterState('greeting');
                    } else {
                        // 마지막 카드 끝 → 카드만 숨김, 하랑이는 그대로
                        setVisible(false);
                        setCurrent(null);
                        setShowHearts(false);
                        setBubbleHidden(false);
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
            setBubbleHidden(false);
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
                setBubbleHidden(false);
                setDemoIdx((i) => (i + 1) % MOCK_ALERTS.length);
            }, 250);
        }, displayMs + 500);

        return () => clearInterval(timer);
    }, [liveMode, current, displayMs, demoIdx, dismissed]);

    const handleThank = () => {
        setShowHearts(true);
        setCharacterState('happy');

        const newHearts = Array.from({ length: 12 }, (_, i) => ({
            id: Date.now() + i,
            angle: (Math.PI * 2 * i) / 12,
            delay: Math.random() * 0.25,
            scale: Math.random() * 0.5 + 0.7,
        }));
        setHearts(newHearts);

        setTimeout(() => {
            setHearts([]);
            setCharacterState('normal');
        }, 2000);
    };

    // ✅ 닫기 버튼: 말풍선만 숨기기 (하랑이는 그대로)
    const handleClose = () => {
        setBubbleHidden(true);
    };

    // 데모 모드에서 완전히 닫힌 상태만 숨김
    if (!liveMode && dismissed && !current) return null;

    const s = severityInfo[current?.severity] || severityInfo[1];
    const SeverityIcon = s.icon;
    const agentInfo = current ? AGENT_INFO[current.agent_code] || AGENT_INFO.default : AGENT_INFO.default;
    const character = CULTURE_CHARACTERS.whiteTiger;

    const remainingSeconds = Math.ceil((progress / 100) * (displayMs / 1000));

    return (
        <div
            className={`
            pointer-events-none
            absolute            
            left-3 sm:left-6
            top-[4.2rem] sm:top-[3.3rem]   
            z-[9998]
            transition-all duration-300 ease-out
            ${visible ? 'opacity-100 translate-y-0' : 'opacity-100 translate-y-0'}
        `}
            role="alert"
        >
            <div className="flex items-start gap-2 sm:gap-3 pointer-events-auto">
                {/* 캐릭터 아바타 (항상 보이게) */}
                <div className="relative flex-shrink-0 flex flex-col items-center">
                    {/* 하트 폭발 */}
                    {showHearts && hearts.length > 0 && (
                        <div className="absolute inset-0 pointer-events-none z-10">
                            {hearts.map((heart) => (
                                <div
                                    key={heart.id}
                                    className="absolute text-2xl sm:text-3xl animate-heart-burst"
                                    style={{
                                        left: '50%',
                                        top: '45%',
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

                    <button
                        type="button"
                        onClick={handleThank}
                        className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br from-orange-50 to-amber-50 shadow-xl border-2 border-orange-200/50 flex items-center justify-center overflow-hidden hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 hover:border-orange-300"
                    >
                        <TigerMascot state={characterState} size={120} />
                    </button>

                    {/* 라벨 + ? 도움말 */}
                    <div className="mt-1.5 flex items-center justify-center gap-1.5">
                        <div className="text-[10px] sm:text-[11px] font-bold text-white px-2.5 py-1 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 backdrop-blur-sm inline-flex items-center gap-1.5 shadow-lg">
                            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse-dot" />
                            <span>{character.name}</span>
                        </div>

                        {/* ? 아이콘 + 호버 툴팁 */}
                        <div className="relative group">
                            <button
                                type="button"
                                className="w-4 h-4 rounded-full border border-white/70 text-[10px] flex items-center justify-center bg-white/10 hover:bg-white/20 text-white shadow-sm"
                            >
                                ?
                            </button>
                            <div
                                className="
                                    absolute left-1/2 top-7 -translate-x-1/2
                                    z-20
                                    w-44 sm:w-52
                                    rounded-xl
                                    bg-slate-900/90
                                    text-[10px] sm:text-[11px] text-slate-50
                                    px-3 py-2.5
                                    shadow-2xl
                                    border border-white/10
                                    opacity-0 translate-y-0
                                    pointer-events-none
                                    group-hover:opacity-100 group-hover:translate-y-1
                                    group-hover:pointer-events-auto
                                    transition-all duration-200
                                "
                            >
                                <p className="font-semibold mb-1 text-sky-200">하랑이는 뭐 해?</p>
                                <p className="leading-snug">
                                    실시간 대화 속 K-컬처·밈 표현을 캐치해서
                                    <span className="font-semibold text-sky-100"> 글로벌 친구들이 이해하기 쉽게</span> 풀어주는 AI 문화 코치예요. 예의·제스처·뉘앙스까지 부드럽게 설명해줘요.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 말풍선 카드: current 있을 때만 등장 */}
                {current && !bubbleHidden && (
                    <div className="relative max-w-[210px] sm:max-w-[280px]">
                        {/* 꼬리 */}
                        <div className="absolute -left-1.5 top-6 w-3 h-3 bg-gradient-to-br from-sky-100 to-indigo-100 rotate-45 shadow-md" />

                        <div
                            className="
                                relative
                                bg-gradient-to-br from-white via-sky-50 to-indigo-50
                                text-slate-800
                                rounded-2xl
                                px-3 py-2 sm:px-3.5 sm:py-2.5
                                shadow-xl
                                border border-sky-100/80
                                backdrop-blur-md
                            "
                        >
                            {/* 닫기 버튼 - 카드만 숨김 */}
                            <button
                                onClick={handleClose}
                                className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-slate-100/70 hover:bg-slate-200 flex items-center justify-center transition-all"
                                aria-label="닫기"
                            >
                                <X size={12} className="text-slate-500" />
                            </button>

                            <div className="space-y-1.5 sm:space-y-2">
                                {/* 헤더 */}
                                <div className="flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-1.5 min-w-0">
                                        <span
                                            className={`
                                                inline-flex items-center justify-center
                                                text-[10px] sm:text-[11px] font-semibold
                                                px-2 py-0.5 rounded-full
                                                bg-gradient-to-r ${agentInfo.color}
                                                text-white shadow-md
                                            `}
                                        >
                                            <span className="mr-1">{agentInfo.icon}</span>
                                            <span className="truncate max-w-[120px] sm:max-w-[160px]">{agentInfo.name}</span>
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1 text-[10px] text-slate-500">
                                        <SeverityIcon className={`w-3.5 h-3.5 ${s.accent}`} />
                                        <span>{s.label}</span>
                                    </div>
                                </div>

                                {/* 감지된 표현 */}
                                <p className="text-[10px] sm:text-[11px] text-slate-500 leading-snug line-clamp-1">
                                    감지된 표현 · <span className="font-semibold text-sky-600">{current.username || '참가자'}</span> · "{current.match_text}"
                                </p>

                                {/* 핵심 해석 */}
                                <p className="text-[11px] sm:text-[12px] text-slate-800 leading-relaxed font-semibold">{current.shortExplanation}</p>

                                {current.shortSuggestion && (
                                    <p className="text-[10px] sm:text-[11px] text-sky-700 leading-relaxed">
                                        <span className="mr-1">💡</span>
                                        {current.shortSuggestion}
                                    </p>
                                )}

                                {/* 하단 */}
                                <div className="flex items-center justify-between gap-2 pt-0.5">
                                    <button
                                        onClick={handleThank}
                                        className="
                                            inline-flex items-center gap-1
                                            text-[10px] sm:text-[11px]
                                            text-pink-500 hover:text-pink-400
                                            font-semibold
                                            transition-colors
                                        "
                                    >
                                        <Heart className="w-3.5 h-3.5" fill="currentColor" />
                                        <span>도움됐어요</span>
                                    </button>
                                    <div className="flex items-center gap-1 text-[10px] text-slate-400">
                                        <Globe2 className="w-3.5 h-3.5" />
                                        <span>{remainingSeconds > 0 ? `${remainingSeconds}s` : '곧 닫힘'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* 진행바 */}
                            <div className="mt-1.5 h-1 w-full bg-sky-100 rounded-full overflow-hidden">
                                <div
                                    className="
                                        h-full
                                        bg-gradient-to-r from-sky-400 via-indigo-400 to-violet-400
                                        transition-all duration-100 ease-linear
                                        shadow-sm
                                    "
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* 커스텀 애니메이션 CSS */}
            <style>{`
            @keyframes float-gentle { 
                0%, 100% { transform: translateY(0) rotate(0deg); }
                25% { transform: translateY(-3px) rotate(-1deg); }
                50% { transform: translateY(-6px) rotate(0deg); }
                75% { transform: translateY(-3px) rotate(1deg); }
            }
            
            @keyframes bounce-gentle {
                0%, 100% { transform: translateY(0) scale(1); }
                25% { transform: translateY(-8px) scale(1.05); }
                50% { transform: translateY(-12px) scale(1.08); }
                75% { transform: translateY(-6px) scale(1.03); }
            }
            
            @keyframes wiggle {
                0%, 100% { transform: rotate(0deg); }
                10%, 30%, 50%, 70%, 90% { transform: rotate(-3deg); }
                20%, 40%, 60%, 80% { transform: rotate(3deg); }
            }
            
            @keyframes pulse-soft { 
                0%, 100% { opacity: 0.3; transform: scale(1); }
                50% { opacity: 0.6; transform: scale(1.1); }
            }
            
            @keyframes orbit { 
                0% { transform: rotate(0deg) translateX(20px) rotate(0deg); }
                100% { transform: rotate(360deg) translateX(20px) rotate(-360deg); }
            }
            
            @keyframes orbit-reverse { 
                0% { transform: rotate(0deg) translateX(18px) rotate(0deg); }
                100% { transform: rotate(-360deg) translateX(18px) rotate(360deg); }
            }
            
            @keyframes sparkle-pulse { 
                0%, 100% { opacity: 0.4; transform: scale(0.8) rotate(0deg); }
                50% { opacity: 1; transform: scale(1.3) rotate(180deg); }
            }
            
            @keyframes bounce-high {
                0%, 100% { transform: translate(-50%, 0); opacity: 1; }
                50% { transform: translate(-50%, -20px); opacity: 0.8; }
            }
            
            @keyframes ping-once {
                0% { transform: scale(0.8); opacity: 0.8; }
                50% { transform: scale(1.2); opacity: 0.4; }
                100% { transform: scale(1.5); opacity: 0; }
            }

            @keyframes heart-burst {
                0% {
                    opacity: 0;
                    transform: translate(-50%, -50%) translate(0, 0) scale(0) rotate(0deg);
                }
                10% { opacity: 1; }
                100% {
                    opacity: 0;
                    transform:
                        translate(-50%, -50%)
                        translate(calc(cos(var(--angle)) * 140px), calc(sin(var(--angle)) * 140px))
                        scale(calc(var(--scale) * 2))
                        rotate(720deg);
                }
            }

            @keyframes pulse-dot { 
                0%, 100% { transform: scale(1); opacity: 1; }
                50% { transform: scale(1.5); opacity: 0.5; }
            }

            .animate-float-gentle { animation: float-gentle 4s.ease-in-out infinite; }
            .animate-bounce-gentle { animation: bounce-gentle 1.5s ease-in-out; }
            .animate-wiggle { animation: wiggle 0.8s ease-in-out; }
            .animate-pulse-soft { animation: pulse-soft 3s ease-in-out infinite; }
            .animate-orbit { animation: orbit 6s linear infinite; }
            .animate-orbit-reverse { animation: orbit-reverse 7s linear infinite; }
            .animate-sparkle-pulse { animation: sparkle-pulse 2s ease-in-out infinite; }
            .animate-bounce-high { animation: bounce-high 1s ease-out; }
            .animate-ping-once { animation: ping-once 0.6s ease-out; }
            .animate-heart-burst { animation: heart-burst 2s ease-out forwards; }
            .animate-pulse-dot { animation: pulse-dot 2s ease-in-out infinite; }
        `}</style>
        </div>
    );
}
