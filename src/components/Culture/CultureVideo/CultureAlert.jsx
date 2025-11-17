// src/components/Culture/LiveView/CultureAlert.jsx
import { useEffect, useMemo, useRef, useState } from 'react';
import { ConnectionState, RoomEvent } from 'livekit-client';
import { useRoomContext } from '@livekit/components-react';
import { X, Sparkles, Star, Heart, Zap } from 'lucide-react';

/** 데모용 알림 데이터 */
const MOCK_ALERTS = [
    {
        type: 'manner_alert',
        label: 'K-Culture Tip',
        match: '레전드',
        explanation: '아주 인상적이거나 전설적인 상황을 의미하는 K-밈이에요! 💯',
        suggestion: '해외에서는 "Epic", "Legendary" 등으로 번역돼요!',
        agent_code: 'K-meme',
        severity: 1,
        language: 'ko-KR',
    },
    {
        type: 'manner_alert',
        label: 'K-Gesture Alert',
        match: '하트 제스처 💜',
        explanation: '손가락으로 하트를 만드는 건 한국 특유의 제스처예요!',
        suggestion: '다른 문화권에서는 잘 이해하지 못할 수 있어요. 설명을 곁들여주세요!',
        agent_code: 'gesture',
        severity: 2,
        language: 'ko-KR',
    },
    {
        type: 'manner_alert',
        label: 'K-Food Culture',
        match: '먹방 소리 🍜',
        explanation: '한국에서는 먹방 소리가 자연스럽지만, 일부 문화권에서는 불편할 수 있어요.',
        suggestion: '사전에 안내를 해주거나 볼륨을 조절해주세요!',
        agent_code: 'food',
        severity: 1,
        language: 'ko-KR',
    },
];

const AGENT_INFO = {
    'K-meme': { icon: '😂', name: 'K-밈', color: 'from-pink-500 to-rose-500' },
    gesture: { icon: '👋', name: '제스처', color: 'from-purple-500 to-violet-500' },
    food: { icon: '🍜', name: '음식문화', color: 'from-orange-500 to-amber-500' },
    number: { icon: '🔢', name: '숫자', color: 'from-blue-500 to-cyan-500' },
    default: { icon: '✨', name: '문화팁', color: 'from-pink-500 to-purple-500' },
};

function mapSeverity(sev) {
    if (typeof sev === 'number') return Math.min(3, Math.max(1, sev));
    return 1;
}

function normalizeToCard(ev) {
    if (!ev) return null;

    const matchText = (ev.match && String(ev.match).trim()) || (ev.label && String(ev.label).trim()) || '';
    if (!matchText) return null;

    const sev = mapSeverity(ev.severity);
    const explanation = (ev.explanation || '').toString().trim() || '문화적 차이가 있을 수 있어요! ✨';
    const suggestion = (ev.suggestion || '').toString().trim() || '';

    const speaker = ev.identity || ev.username || 'unknown';
    const cooldownSec = 30;

    return {
        id: Date.now() + Math.random(),
        label: ev.label || 'K-Culture Tip',
        match_text: matchText,
        explanation,
        suggestion,
        severity: sev,
        agent_code: ev.agent_code || 'default',
        key: `${ev.agent_code || 'default'}:${speaker}:${matchText}`,
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

    const [demoIdx, setDemoIdx] = useState(0);
    const [dismissed, setDismissed] = useState(false);

    const queueRef = useRef([]);
    const lastShownAtRef = useRef(new Map());
    const decoder = useMemo(() => new TextDecoder('utf-8'), []);
    const PROGRESS_INTERVAL_MS = 100;

    const severityInfo = useMemo(
        () => ({
            3: {
                icon: Zap,
                bgGradient: 'from-red-500/25 via-orange-500/25 to-yellow-500/25',
                borderColor: 'border-red-400/60',
                glowColor: 'shadow-red-500/40',
            },
            2: {
                icon: Star,
                bgGradient: 'from-orange-500/25 via-pink-500/25 to-rose-500/25',
                borderColor: 'border-orange-400/60',
                glowColor: 'shadow-orange-500/40',
            },
            1: {
                icon: Heart,
                bgGradient: 'from-pink-500/25 via-purple-500/25 to-violet-500/25',
                borderColor: 'border-pink-400/60',
                glowColor: 'shadow-pink-500/40',
            },
        }),
        [],
    );

    const isConnected = !!room && (room.state === ConnectionState.Connected || room.state === 'connected');
    const liveMode = !demo && isConnected;

    // LiveKit DataChannel 수신
    useEffect(() => {
        if (!liveMode) return;

        const onData = (payload, participant, kind, topic) => {
            try {
                const rawText = decoder.decode(payload);
                const data = JSON.parse(rawText);

                if (debug) {
                    console.log('[CultureAlert] 📩 Data received:', {
                        type: data.type,
                        label: data.label,
                        match: data.match,
                        topic,
                    });
                }

                const t = String(data?.type || '').toLowerCase();
                if (topic !== 'manner' && topic !== 'culture' && t !== 'manner' && t !== 'manner_alert' && t !== 'culture_alert') {
                    if (debug) console.log('[CultureAlert] ❌ Topic/type mismatch, ignored');
                    return;
                }

                const card = normalizeToCard(data);
                if (!card) {
                    if (debug) console.log('[CultureAlert] ❌ Failed to normalize card');
                    return;
                }

                const now = Date.now();
                const last = lastShownAtRef.current.get(card.key) ?? 0;
                const cd = Math.max(0, Number(card.cooldownSec || 0)) * 1000;
                if (now - last < cd) {
                    if (debug) console.log('[CultureAlert] 🔄 Cooldown active:', card.key);
                    return;
                }

                lastShownAtRef.current.set(card.key, now);
                queueRef.current.push(card);
                if (debug) console.log('[CultureAlert] ✅ Queued:', card);

                if (!current && !visible) {
                    const next = queueRef.current.shift() || null;
                    if (next) {
                        setCurrent(next);
                        setVisible(true);
                        setProgress(100);
                    }
                }
            } catch (e) {
                console.error('[CultureAlert] ❌ Parse error:', e);
            }
        };

        room.on(RoomEvent.DataReceived, onData);
        if (debug) console.log('[CultureAlert] 👂 Listeners attached (live mode)');

        return () => {
            room.off(RoomEvent.DataReceived, onData);
            if (debug) console.log('[CultureAlert] 👋 Listeners detached');
        };
    }, [liveMode, room, decoder, debug, current, visible]);

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
                    } else {
                        setVisible(false);
                        setCurrent(null);
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
            const first = MOCK_ALERTS[0];
            setCurrent(first);
            setVisible(true);
            setProgress(100);
            setDemoIdx(1);
        }

        const timer = setInterval(() => {
            setVisible(false);
            setProgress(100);
            setTimeout(() => {
                const next = MOCK_ALERTS[demoIdx % MOCK_ALERTS.length];
                setCurrent(next);
                setVisible(true);
                setDemoIdx((i) => (i + 1) % MOCK_ALERTS.length);
            }, 300);
        }, displayMs);

        return () => clearInterval(timer);
    }, [liveMode, current, displayMs, demoIdx, dismissed]);

    function handleClose() {
        setVisible(false);
        setTimeout(() => {
            setCurrent(null);
            if (!liveMode) setDismissed(true);
        }, 200);
    }

    if (!current || (!liveMode && dismissed)) return null;

    const s = severityInfo[current.severity] || severityInfo[1];
    const SeverityIcon = s.icon;
    const agentInfo = AGENT_INFO[current.agent_code] || AGENT_INFO.default;

    return (
        <div
            // ⬇⬇⬇ 여기 변경 포인트
            // fixed → absolute 로 변경 / LIVE 배지(top-2/3) 아래에 오도록 top 간격 조정
            className={`
                absolute
                left-2 sm:left-3
                top-12 sm:top-14 md:top-16
                z-[45]
                w-[260px] sm:w-[320px] md:w-[360px]
                transition-all duration-500 ease-out
                ${visible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-2 scale-95'}
            `}
            role="alert"
        >
            {/* 메인 카드 - 기존보다 살짝 크게 / 여백 증가 */}
            <div
                className={`
                    bg-gradient-to-br ${s.bgGradient}
                    backdrop-blur-xl border-2 ${s.borderColor}
                    rounded-xl sm:rounded-2xl overflow-hidden relative
                    shadow-2xl ${s.glowColor}
                `}
            >
                {/* 반짝이는 배경 */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent animate-pulse opacity-40"></div>

                {/* 진행바 */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-white/20 overflow-hidden">
                    <div className={`h-full bg-gradient-to-r ${agentInfo.color} transition-all duration-100`} style={{ width: `${progress}%` }}>
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer"></div>
                    </div>
                </div>

                {/* 헤더 */}
                <div className="relative flex items-center justify-between px-3.5 py-2.5 border-b border-white/20">
                    <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br ${agentInfo.color} flex items-center justify-center shadow-lg`}>
                            <span className="text-lg">{agentInfo.icon}</span>
                        </div>
                        <div>
                            <p className="text-[11px] sm:text-xs font-bold text-white/85">{current.label}</p>
                            <p className="text-[9px] sm:text-[10px] text-white/65">{agentInfo.name}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleClose}
                        className="w-6 h-6 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all hover:rotate-90 duration-300"
                        aria-label="닫기"
                    >
                        <X size={14} className="text-white" />
                    </button>
                </div>

                {/* 본문 */}
                <div className="relative px-3.5 py-3.5 space-y-2.5">
                    {/* 매치 텍스트 */}
                    <div className="flex items-center gap-2.5">
                        <SeverityIcon className="w-4.5 h-4.5 text-white flex-shrink-0" />
                        <h3 className="text-[13px] sm:text-sm md:text-[15px] font-bold text-white leading-tight">{current.match_text}</h3>
                    </div>

                    {/* 설명 */}
                    <div className="bg-white/15 backdrop-blur-sm rounded-lg p-2.5 border border-white/20">
                        <div className="flex items-start gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-white/80 mt-0.5 flex-shrink-0" />
                            <p className="text-[11px] sm:text-[11.5px] text-white/90 leading-relaxed">{current.explanation}</p>
                        </div>
                    </div>

                    {/* 제안 (있을 경우) */}
                    {current.suggestion && (
                        <div className="bg-emerald-500/25 backdrop-blur-sm rounded-lg p-2.5 border border-emerald-400/35">
                            <div className="flex items-start gap-1.5">
                                <Sparkles className="w-3.5 h-3.5 text-emerald-200 mt-0.5 flex-shrink-0" />
                                <p className="text-[11px] sm:text-[11.5px] text-white/92 leading-relaxed font-medium">{current.suggestion}</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* 푸터 */}
                <div className="relative px-3.5 py-1.5 bg-white/10 border-t border-white/20">
                    <div className="flex items-center justify-between">
                        <p className="text-[9px] sm:text-[10px] text-white/65">🌍 문화 인사이트</p>
                        <p className="text-[9px] sm:text-[10px] font-semibold text-white/85">{Math.ceil((progress / 100) * (displayMs / 1000))}초</p>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
                .animate-shimmer {
                    animation: shimmer 2s linear infinite;
                }
            `}</style>
        </div>
    );
}
