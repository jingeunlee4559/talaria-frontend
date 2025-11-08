// MannerChecker.jsx
import { useEffect, useMemo, useRef, useState } from 'react';
import { ConnectionState, RoomEvent } from 'livekit-client';
import { useRoomContext } from '@livekit/components-react';
import { FiX, FiAlertTriangle, FiAlertCircle, FiCheckCircle, FiInfo } from 'react-icons/fi';

/** 데모용 알림 데이터 (연결 안 됐을 때 순환 표시) */
const MOCK_ALERTS = [
  {
    id: 1,
    pattern_text: 'OK 사인 (👌)',
    speaker_locale: 'en_US',
    listener_locale: 'pt_BR',
    explanation_tpl: '브라질에서는 이 제스처가 공격적이고 무례한 의미로 해석됩니다.',
    suggestion_tpl: '엄지손가락을 치켜세우는 제스처 (👍)를 사용하세요.',
    severity: 1,
  },
  {
    id: 2,
    pattern_text: '숫자 4',
    speaker_locale: 'en_US',
    listener_locale: 'zh_CN',
    explanation_tpl:
      '중국, 일본, 한국 등 동아시아 문화권에서 "4"는 죽음(死)과 발음이 비슷하여 불길하게 여겨집니다.',
    suggestion_tpl: '중요한 숫자나 날짜 선정 시 4를 피하거나, 8과 같은 행운의 숫자를 사용하세요.',
    severity: 2,
  },
  {
    id: 3,
    pattern_text: '왼손 사용',
    speaker_locale: 'en_US',
    listener_locale: 'ar_SA',
    explanation_tpl: '일부 지역에서는 왼손이 불결하다고 여겨져 악수/식사/물건 전달에 사용하지 않습니다.',
    suggestion_tpl: '오른손을 사용하세요.',
    severity: 3,
  },
];

const LOCALE_INFO = {
  pt_BR: { flag: '🇧🇷', name: '브라질' },
  zh_CN: { flag: '🇨🇳', name: '중국' },
  ar_SA: { flag: '🇸🇦', name: '사우디아라비아' },
  ar_AE: { flag: '🇦🇪', name: '아랍에미리트' },
  ko_KR: { flag: '🇰🇷', name: '한국' },
  ph_PH: { flag: '🇵🇭', name: '필리핀' },
  en_US: { flag: '🇺🇸', name: '미국' },
};

function mapSeverity(sev) {
  if (typeof sev === 'number') return Math.min(3, Math.max(1, sev));
  const s = String(sev || '').toUpperCase();
  if (s === 'BLOCK') return 3;
  if (s === 'WARN') return 2;
  return 1; // INFO/기타
}

function toUILocale(s) {
  return s ? String(s).replace('-', '_') : '';
}

function normalizeToCard(ev) {
  if (!ev) return null;

  const ruleId = ev.rule_id ?? ev.id;
  if (ruleId == null) return null;

  const pattern =
    (ev.pattern_text && String(ev.pattern_text).trim()) ||
    (ev.match && String(ev.match).trim()) ||
    '';
  if (!pattern) return null;

  const sev = mapSeverity(ev.severity);
  const explanation =
    (ev.explanation ?? ev.explanation_tpl ?? '').toString().trim() ||
    `표현이 문화/상황에 따라 불편하게 인지될 수 있습니다: '${pattern}'`;
  const suggestion = (ev.suggestion ?? ev.suggestion_tpl ?? '').toString().trim() || '';

  const speaker = ev.speaker_identity || ev.identity || 'unknown';
  const cooldownSec =
    ev.cooldown_sec != null ? Number(ev.cooldown_sec) : 30; // 기본 30초 쿨다운

  return {
    id: Number(ruleId),
    rule_id: Number(ruleId),
    pattern_text: pattern,
    speaker_locale: toUILocale(ev.speaker_locale || ''),
    listener_locale: toUILocale(ev.listener_locale || ''),
    explanation_tpl: explanation,
    suggestion_tpl: suggestion,
    severity: sev,
    key: `${ruleId}:${speaker}`,
    cooldownSec,
    speaker_username: ev.speaker_username || ev.username || '',
  };
}

export default function MannerChecker({
  room: roomProp,
  displayMs = 8000,
  debug = false,
  demo = false,
}) {
  // room prop 우선, 없으면 RoomContext 사용(둘 다 없으면 데모 모드)
  const roomCtx = useRoomContext?.();
  const room = roomProp || roomCtx || null;

  const [current, setCurrent] = useState(null);
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(100);

  // 데모 모드 상태
  const [demoIdx, setDemoIdx] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  const queueRef = useRef([]);
  const lastShownAtRef = useRef(new Map()); // key(rule:speaker) -> ts(ms)
  const decoder = useMemo(() => new TextDecoder('utf-8'), []);
  const PROGRESS_INTERVAL_MS = 100;

  const severityInfo = useMemo(
    () => ({
      3: {
        title: '주의',
        icon: FiAlertTriangle,
        iconClasses: 'text-red-500',
        bgClasses: 'bg-red-50',
        progressClasses: 'bg-red-500',
      },
      2: {
        title: '참고',
        icon: FiAlertCircle,
        iconClasses: 'text-orange-400',
        bgClasses: 'bg-orange-50',
        progressClasses: 'bg-orange-400',
      },
      1: {
        title: '유의',
        icon: FiInfo,
        iconClasses: 'text-yellow-400',
        bgClasses: 'bg-yellow-50',
        progressClasses: 'bg-yellow-400',
      },
    }),
    []
  );

  const isConnected =
    !!room &&
    (room.state === ConnectionState.Connected || room.state === 'connected');

  const liveMode = !demo && isConnected;

  // -----------------------------
  // (A) 라이브 모드: DataChannel 수신
  // -----------------------------
  useEffect(() => {
    if (!liveMode) return;
    // any-data 디버그
    const anyData = (payload, participant, kind, topic) => {
      if (!debug) return;
      let sample = '';
      try {
        sample = decoder.decode(payload).slice(0, 200);
      } catch {
        sample = '(binary)';
      }
      console.log('[MannerChecker][ANY DataReceived]', {
        topic,
        kind,
        from: participant?.identity,
        sample,
      });
    };

    // manner 전용
    const onData = (payload, participant, kind, topic) => {
      try {
        const rawText = decoder.decode(payload);
        const data = JSON.parse(rawText);

        // topic이 'manner' 이거나, type이 manner/manner_alert 이면 허용
        const t = String(data?.type || '').toLowerCase();
        if (topic !== 'manner' && t !== 'manner' && t !== 'manner_alert') return;

        const card = normalizeToCard(data);
        if (!card) return;

        // 중복 방지(쿨다운)
        const now = Date.now();
        const last = lastShownAtRef.current.get(card.key) ?? 0;
        const cd = Math.max(0, Number(card.cooldownSec || 0)) * 1000;
        if (now - last < cd) {
          if (debug) console.log('[MannerChecker] dedup (cooldown):', card.key);
          return;
        }

        lastShownAtRef.current.set(card.key, now);
        queueRef.current.push(card);
        if (debug) console.log('[MannerChecker] queued:', card);

        // 현재 토스트가 없으면 즉시 표시
        if (!current && !visible) {
          const next = queueRef.current.shift() || null;
          if (next) {
            setCurrent(next);
            setVisible(true);
            setProgress(100);
          }
        }
      } catch (e) {
        console.error('[MannerChecker] parse error', e);
      }
    };

    room.on(RoomEvent.DataReceived, anyData);
    room.on(RoomEvent.DataReceived, onData);
    if (debug) console.log('[MannerChecker] listeners attached (live)');

    return () => {
      room.off(RoomEvent.DataReceived, anyData);
      room.off(RoomEvent.DataReceived, onData);
      if (debug) console.log('[MannerChecker] listeners detached (live)');
    };
    // room/decoder/debug만 의존 → 중복 리스너 방지
  }, [liveMode, room, decoder, debug]);

  // -----------------------------
  // (B) 진행바 & 자동 닫힘
  // -----------------------------
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
          // 다음 카드 표시
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

  // -----------------------------
  // (C) 데모 모드(또는 미연결): MOCK 순환
  // -----------------------------
  useEffect(() => {
    if (liveMode) return;
    if (dismissed) return;

    // 첫 표시
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
      }, 250);
    }, displayMs);

    return () => clearInterval(timer);
  }, [liveMode, current, displayMs, demoIdx, dismissed]);

  // -----------------------------
  // (D) 수동 닫기
  // -----------------------------
  function handleClose() {
    setVisible(false);
    setTimeout(() => {
      setCurrent(null);
      if (!liveMode) setDismissed(true); // 데모 모드는 닫으면 종료
    }, 200);
  }

  // -----------------------------
  // (E) 랜더링
  // -----------------------------
  if (!current || (!liveMode && dismissed)) return null;

  const s = severityInfo[current.severity] || severityInfo[2];
  const SeverityIcon = s.icon;
  const loc = current.listener_locale || '';
  const listenerInfo = LOCALE_INFO[loc] || { flag: '🌍', name: current.listener_locale || '해당 로케일' };

  return (
    <div
      className={`fixed top-20 left-5 right-5 sm:right-auto z-50 w-auto sm:w-[360px] transition-all duration-300 ${
        visible ? 'opacity-100 translate-y-0 sm:translate-x-0' : 'opacity-0 -translate-y-4 sm:-translate-x-4'
      }`}
      role="alert"
    >
      <div className="bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden relative">
        {/* 진행바 */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gray-100">
          <div className={`h-full transition-all duration-100 ${s.progressClasses}`} style={{ width: `${progress}%` }} />
        </div>

        {/* 헤더 */}
        <div className={`flex justify-between items-center p-3 ${s.bgClasses} border-b border-gray-200`}>
          <span className={`text-sm font-bold ${s.iconClasses}`}>{s.title}</span>
          <button
            onClick={handleClose}
            className={`p-1 ${s.iconClasses} opacity-60 hover:opacity-100 hover:bg-black/10 rounded-full transition-all`}
            aria-label="닫기"
          >
            <FiX size={18} />
          </button>
        </div>

        {/* 본문 */}
        <div className="flex gap-3.5 p-3.5">
          <div className={`w-10 h-10 rounded-full ${s.bgClasses} flex items-center justify-center flex-shrink-0 mt-0.5`}>
            <SeverityIcon className={`w-5 h-5 ${s.iconClasses}`} />
          </div>

          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 mb-1">{current.pattern_text}</h3>
            <p className="text-sm text-gray-500 mb-3.5">
              <span className="mr-1.5">{listenerInfo.flag}</span>
              {listenerInfo.name} 청자에게 주의
            </p>

            <div className="space-y-3">
              <div>
                <label className={`flex items-center gap-1.5 text-xs font-bold ${s.iconClasses} mb-1`}>
                  <FiAlertCircle className="w-3.5 h-3.5" />
                  <span>왜 오해가 될 수 있나요?</span>
                </label>
                <p className="text-sm text-gray-800 leading-relaxed">{current.explanation_tpl}</p>
              </div>

              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold text-green-600 mb-1">
                  <FiCheckCircle className="w-3.5 h-3.5" />
                  <span>대체 표현</span>
                </label>
                <p className="text-sm text-gray-800 leading-relaxed">{current.suggestion_tpl}</p>
              </div>
            </div>
          </div>
        </div>

        {/* 푸터 */}
        <div className="bg-gray-50 border-t border-gray-200 px-3.5 py-2">
          <p className="text-xs text-gray-400 text-center">
            {Math.ceil((progress / 100) * (displayMs / 1000))}초 후 자동 닫힘
          </p>
        </div>
      </div>
    </div>
  );
}
