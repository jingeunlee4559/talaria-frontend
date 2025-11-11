import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslator } from './TranslationProvider';

/**
 * Props:
 * - mode: "bottom-right" | "below-header"  (default: "bottom-right")
 * - headerSelector: string (mode="below-header"일 때 헤더 DOM 선택자, default: 'header')
 * - right: number (px), bottom: number (px), topGap: number (px)
 */
export default function GlobalTranslatorHUD({ mode = 'bottom-right', headerSelector = 'header', right = 16, bottom = 16, topGap = 12 }) {
    const { jobs, stopJob } = useTranslator();
    const [open, setOpen] = useState(false); // 패널 열림 상태
    const [topOffset, setTopOffset] = useState(64); // below-header 모드에서 사용
    const btnRef = useRef(null);

    const activeJobs = useMemo(() => Object.values(jobs).filter((j) => j.status !== 'COMPLETED'), [jobs]);

    // 활성 작업이 생기면 FAB 자동표시, 없으면 닫음
    useEffect(() => {
        if (activeJobs.length === 0) setOpen(false);
    }, [activeJobs.length]);

    // 헤더 바로 아래 고정 위치 계산
    useEffect(() => {
        if (mode !== 'below-header') return;
        const calc = () => {
            const header = document.querySelector(headerSelector);
            if (!header) {
                setTopOffset(64);
                return;
            }
            const rect = header.getBoundingClientRect();
            const scrollTop = window.scrollY || document.documentElement.scrollTop || 0;
            setTopOffset(rect.height + scrollTop + topGap);
        };
        calc();
        const ro = new ResizeObserver(calc);
        const header = document.querySelector(headerSelector);
        if (header) ro.observe(header);
        window.addEventListener('scroll', calc, { passive: true });
        window.addEventListener('resize', calc, { passive: true });
        return () => {
            ro.disconnect();
            window.removeEventListener('scroll', calc);
            window.removeEventListener('resize', calc);
        };
    }, [mode, headerSelector, topGap]);

    // FAB 버튼이 nav를 가리지 않도록 z-index 가장 위
    const containerStyle = mode === 'bottom-right' ? { right, bottom } : { right, top: topOffset };

    if (activeJobs.length === 0) {
        // 활성 작업 없으면 FAB/패널 모두 숨김
        return null;
    }

    const anyProcessing = activeJobs.some((j) => j.status === 'PENDING' || j.status === 'PROCESSING');

    return (
        <div className="fixed z-[99999] pointer-events-none" style={containerStyle} aria-live="polite" aria-atomic="true">
            {/* FAB: 번역 버튼 눌렀을 때만 보이게 → 활성 작업이 있을 때 자동 노출 */}
            <div className="flex justify-end mb-2 pointer-events-auto">
                <button
                    ref={btnRef}
                    onClick={() => setOpen((v) => !v)}
                    className={`
            group relative flex items-center gap-2 rounded-full
            shadow-2xl border border-slate-200 bg-white
            hover:bg-slate-50 transition px-4 py-2
          `}
                    title={open ? '진행 패널 닫기' : '진행 패널 열기'}
                >
                    {/* 아이콘 + 라벨 */}
                    <span className="inline-flex items-center justify-center">
                        {/* 스피너 */}
                        {anyProcessing ? (
                            <svg className="animate-spin h-4 w-4 mr-1 text-indigo-600" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                            </svg>
                        ) : (
                            <svg className="h-4 w-4 mr-1 text-slate-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z" />
                            </svg>
                        )}
                        <span className="text-sm font-semibold text-slate-800">번역 진행</span>
                    </span>

                    {/* 개수 뱃지 */}
                    <span
                        className="
              ml-1 inline-flex items-center justify-center
              text-[11px] min-w-5 h-5 px-1 rounded-full
              bg-indigo-600 text-white font-bold
            "
                        aria-label={`진행 중 ${activeJobs.length}건`}
                    >
                        {activeJobs.length}
                    </span>

                    {/* 토글 화살표 */}
                    <svg className={`h-3.5 w-3.5 ml-1 text-slate-600 transition-transform ${open ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M6 9l6 6 6-6" />
                    </svg>
                </button>
            </div>

            {/* 패널 */}
            {open && (
                <div
                    className="
            pointer-events-auto w-[360px] max-w-[90vw]
            bg-white border border-slate-200 shadow-2xl rounded-2xl p-3
          "
                    role="region"
                    aria-label="번역 진행 패널"
                >
                    <div className="text-sm font-semibold text-slate-700 mb-2">진행 중 번역 ({activeJobs.length})</div>

                    <div className="space-y-2 max-h-[50vh] overflow-auto pr-1">
                        {activeJobs.map((job) => (
                            <JobCard key={job.jobKey} job={job} onClose={() => stopJob(job.jobKey)} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

/* 내부 요소들 */
function StatusBadge({ status }) {
    const map = {
        PENDING: { text: '대기', cls: 'bg-sky-50 text-sky-700' },
        PROCESSING: { text: '진행', cls: 'bg-indigo-50 text-indigo-700' },
        COMPLETED: { text: '완료', cls: 'bg-emerald-50 text-emerald-700' },
        FAILED: { text: '실패', cls: 'bg-rose-50 text-rose-700' },
    };
    const s = map[status] || { text: status, cls: 'bg-slate-100 text-slate-700' };
    return <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold ${s.cls}`}>{s.text}</span>;
}

function ProgressBar({ percent, failed }) {
    return (
        <div>
            <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] text-slate-500">진행률</span>
                <span className="text-[11px] text-slate-500">{Math.min(Math.max(percent ?? 0, 0), 100)}%</span>
            </div>
            <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                    className={`h-full transition-all duration-300 ${failed ? 'bg-rose-400' : 'bg-indigo-500'}`}
                    style={{
                        width: `${Math.min(Math.max(percent ?? 0, 0), 100)}%`,
                    }}
                />
            </div>
        </div>
    );
}

function JobCard({ job, onClose }) {
    const failed = job.status === 'FAILED';
    return (
        <div className="border border-slate-100 rounded-xl p-2.5">
            <div className="flex items-start gap-2">
                <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-bold text-slate-800 truncate" title={job.title || job.relPath}>
                        {job.title || job.relPath}
                    </div>
                    <div className="text-[12px] text-slate-500">
                        {job.source} → {job.target}
                    </div>
                </div>
                <StatusBadge status={job.status} />
            </div>

            <div className="mt-2">
                <ProgressBar percent={job.percent} failed={failed} />
            </div>

            <div className="mt-2 flex items-center justify-between">
                {failed ? (
                    <span className="text-[11px] text-rose-600 truncate pr-2" title={job.error || ''}>
                        {job.error}
                    </span>
                ) : (
                    <span className="text-[11px] text-slate-400">시작: {new Date(job.startedAt).toLocaleTimeString()}</span>
                )}
                <button onClick={onClose} className="text-[12px] px-2 py-1 rounded-md border border-slate-200 hover:bg-slate-50">
                    닫기
                </button>
            </div>
        </div>
    );
}
