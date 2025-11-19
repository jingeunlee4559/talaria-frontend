import React, { useEffect, useState } from 'react';
import { FileText, CheckCircle, X } from 'lucide-react';

export default function MeetingSummaryHUD({ summaries, onClose, mode = 'bottom-right', right = 16, bottom = 16 }) {
    const [open, setOpen] = useState(false);

    // 활성 요약이 생기면 자동으로 패널 열기
    useEffect(() => {
        if (summaries.length > 0) {
            setOpen(true);
        } else {
            setOpen(false);
        }
    }, [summaries.length]);

    if (summaries.length === 0) {
        return null;
    }

    const containerStyle = { right, bottom };
    const anyProcessing = summaries.some((s) => s.status === 'PROCESSING');

    return (
        <div className="fixed z-[99999] pointer-events-none" style={containerStyle} aria-live="polite" aria-atomic="true">
            {/* FAB 버튼 */}
            <div className="flex justify-end mb-2 pointer-events-auto">
                <button
                    onClick={() => setOpen((v) => !v)}
                    className="
                        group relative flex items-center gap-2 rounded-full
                        shadow-2xl border border-emerald-200 bg-white
                        hover:bg-emerald-50 transition px-4 py-2
                    "
                    title={open ? '요약 패널 닫기' : '요약 패널 열기'}
                >
                    {/* 아이콘 */}
                    <span className="inline-flex items-center justify-center">
                        {anyProcessing ? (
                            <svg className="animate-spin h-4 w-4 mr-1 text-emerald-600" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                            </svg>
                        ) : (
                            <FileText className="h-4 w-4 mr-1 text-emerald-600" />
                        )}
                        <span className="text-sm font-semibold text-slate-800">회의록 요약</span>
                    </span>

                    {/* 개수 뱃지 */}
                    <span
                        className="
                            ml-1 inline-flex items-center justify-center
                            text-[11px] min-w-5 h-5 px-1 rounded-full
                            bg-emerald-600 text-white font-bold
                        "
                        aria-label={`진행 중 ${summaries.length}건`}
                    >
                        {summaries.length}
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
                        pointer-events-auto w-[400px] max-w-[90vw]
                        bg-white border border-emerald-200 shadow-2xl rounded-2xl p-3
                    "
                    role="region"
                    aria-label="회의록 요약 패널"
                >
                    <div className="text-sm font-semibold text-slate-700 mb-2">진행 중 회의록 요약 ({summaries.length})</div>

                    <div className="space-y-2 max-h-[50vh] overflow-auto pr-1">
                        {summaries.map((summary) => (
                            <SummaryCard key={summary.meetingId} summary={summary} onClose={() => onClose(summary.meetingId)} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

/* 상태 뱃지 */
function StatusBadge({ status }) {
    const map = {
        PROCESSING: { text: '요약중', cls: 'bg-emerald-50 text-emerald-700', icon: null },
        COMPLETED: { text: '완료', cls: 'bg-green-50 text-green-700', icon: <CheckCircle className="w-3 h-3" /> },
        FAILED: { text: '실패', cls: 'bg-rose-50 text-rose-700', icon: <X className="w-3 h-3" /> },
    };
    const s = map[status] || { text: status, cls: 'bg-slate-100 text-slate-700', icon: null };
    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${s.cls}`}>
            {s.icon}
            {s.text}
        </span>
    );
}

/* 진행 바 */
function ProgressBar({ percent, failed }) {
    return (
        <div>
            <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] text-slate-500">진행률</span>
                <span className="text-[11px] text-slate-500">{Math.min(Math.max(percent ?? 0, 0), 100)}%</span>
            </div>
            <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                    className={`h-full transition-all duration-300 ${failed ? 'bg-rose-400' : 'bg-emerald-500'}`}
                    style={{
                        width: `${Math.min(Math.max(percent ?? 0, 0), 100)}%`,
                    }}
                />
            </div>
        </div>
    );
}

/* 요약 카드 */
function SummaryCard({ summary, onClose }) {
    const failed = summary.status === 'FAILED';
    const completed = summary.status === 'COMPLETED';

    return (
        <div className={`border rounded-xl p-2.5 transition-all ${completed ? 'border-green-200 bg-green-50/30' : failed ? 'border-rose-200 bg-rose-50/30' : 'border-emerald-200 bg-emerald-50/30'}`}>
            <div className="flex items-start gap-2">
                <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-bold text-slate-800 truncate" title={summary.meetingTitle}>
                        {summary.meetingTitle}
                    </div>
                    <div className="text-[12px] text-slate-500">참여자 {summary.participantCount}명</div>
                </div>
                <StatusBadge status={summary.status} />
            </div>

            <div className="mt-2">
                <ProgressBar percent={summary.percent} failed={failed} />
            </div>

            <div className="mt-2 flex items-center justify-between">
                {failed ? (
                    <span className="text-[11px] text-rose-600 truncate pr-2" title={summary.error || ''}>
                        {summary.error || '요약 중 오류가 발생했습니다'}
                    </span>
                ) : completed ? (
                    <span className="text-[11px] text-green-600 font-medium">✓ 회의록 요약이 완성되었습니다</span>
                ) : (
                    <span className="text-[11px] text-emerald-600 font-medium">📝 회의록 요약중입니다...</span>
                )}
                <button onClick={onClose} className="text-[12px] px-2 py-1 rounded-md border border-slate-200 hover:bg-slate-50 transition-colors">
                    닫기
                </button>
            </div>
        </div>
    );
}
