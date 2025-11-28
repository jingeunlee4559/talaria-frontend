// src/components/dashboard/dashvideo/SyncedPdfGrid.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

// ✅ pdf.js 워커를 로컬 모듈로 설정 (CDN 사용 X)
pdfjs.GlobalWorkerOptions.workerSrc = pdfWorker;

// 공통 clamp 함수
const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

/**
 * props:
 * - originalUrl, translatedUrl, originalTitle, translatedTitle: 기존 그대로
 * - isHost: boolean (호스트 여부)
 * - onPointerSend: (payload) => void  // 호스트가 포인터 찍을 때 호출
 * - remotePointer: { side: 'orig'|'trans', page: number, xPercent: number, yPercent: number, ts: number }
 */
const SyncedPdfGrid = ({ originalUrl, translatedUrl, originalTitle, translatedTitle, isHost = false, onPointerSend, remotePointer, onPageSyncSend, remotePageSync }) => {
    const [originalPages, setOriginalPages] = useState(0);
    const [translatedPages, setTranslatedPages] = useState(0);

    // ✅ 전체 배율 (두 칸에 공통)
    const [baseZoom, setBaseZoom] = useState(1); // 1 = 100%

    // ✅ 원본/번역 개별 배율 (기본 둘 다 1 → 100%)
    const [origZoom, setOrigZoom] = useState(1);
    const [transZoom, setTransZoom] = useState(1);

    // 👉 실제로 적용되는 배율(사용자가 느끼는 비율) = 전체 × 개별
    const effectiveOrigZoom = baseZoom * origZoom;
    const effectiveTransZoom = baseZoom * transZoom;

    // ✅ 줌 입력창용 상태 (표시/입력 값)
    const [origInput, setOrigInput] = useState(100);
    const [transInput, setTransInput] = useState(100);

    // ✅ 페이지 네비게이션 상태
    const [origCurrentPage, setOrigCurrentPage] = useState(1);
    const [transCurrentPage, setTransCurrentPage] = useState(1);

    // 페이지 입력용 상태 (문자열)
    const [origPageInput, setOrigPageInput] = useState('1');
    const [transPageInput, setTransPageInput] = useState('1');

    // ✅ 레이아웃 모드: 좌우 2분할 / 상하 2분할
    const [layoutMode, setLayoutMode] = useState('vertical'); // 'vertical' | 'horizontal'
    const toggleLayoutMode = () => {
        setLayoutMode((m) => (m === 'vertical' ? 'horizontal' : 'vertical'));
    };

    // ✅ 뷰 모드: 페이지 모드 / 스크롤 모드
    const [viewMode, setViewMode] = useState('page'); // 'page' | 'scroll'
    const toggleViewMode = () => {
        setViewMode((m) => (m === 'page' ? 'scroll' : 'page'));
    };

    // ✅ 페이지 동기화 (ON일 때 원본/번역 함께 이동)
    const [syncPages, setSyncPages] = useState(true);

    // ✅ 동기화 모드에서 사용하는 공통 페이지 번호
    const [syncedPage, setSyncedPage] = useState(1);

    // ✅ 레이저 포인터 상태 (로컬 표시용)
    // pointer: { side: 'orig' | 'trans', page, xPercent, yPercent, ts }
    const [pointer, setPointer] = useState(null);

    const emitPageSync = (page) => {
        if (!isHost || !onPageSyncSend) return;
        onPageSyncSend({ page });
    };

    // remotePointer 가 변경되면 로컬 pointer에 반영
    useEffect(() => {
        if (!remotePointer) return;
        setPointer(remotePointer);
    }, [remotePointer]);

    // 포인터 2초 후 자동 제거
    useEffect(() => {
        if (!pointer) return;
        const timeout = setTimeout(() => setPointer(null), 2000);
        return () => clearTimeout(timeout);
    }, [pointer]);

    // 실제 배율이 바뀔 때마다 줌 입력창에 반영
    useEffect(() => {
        setOrigInput(Math.round(effectiveOrigZoom * 100));
    }, [effectiveOrigZoom]);

    useEffect(() => {
        setTransInput(Math.round(effectiveTransZoom * 100));
    }, [effectiveTransZoom]);

    // 현재 페이지가 바뀔 때마다 페이지 입력창에 반영
    useEffect(() => {
        setOrigPageInput(String(origCurrentPage));
    }, [origCurrentPage]);

    useEffect(() => {
        setTransPageInput(String(transCurrentPage));
    }, [transCurrentPage]);

    // ---- 전체 배율 컨트롤 ----
    const handleBaseZoomIn = () => setBaseZoom((z) => clamp(z + 0.25, 0.5, 2.0));
    const handleBaseZoomOut = () => setBaseZoom((z) => clamp(z - 0.25, 0.5, 2.0));
    const handleBaseZoomReset = () => setBaseZoom(1);

    // ---- 원본 개별 배율 버튼 ----
    const handleOrigZoomIn = () => {
        const newEffective = clamp(effectiveOrigZoom + 0.25, 0.5, 3.0); // 50~300%
        setOrigZoom(newEffective / baseZoom);
    };
    const handleOrigZoomOut = () => {
        const newEffective = clamp(effectiveOrigZoom - 0.25, 0.5, 3.0);
        setOrigZoom(newEffective / baseZoom);
    };
    const handleOrigZoomReset = () => {
        setOrigZoom(1 / baseZoom); // 전체 배율 고려해서 "100%" 맞추기
    };

    // ---- 번역 개별 배율 버튼 ----
    const handleTransZoomIn = () => {
        const newEffective = clamp(effectiveTransZoom + 0.25, 0.5, 3.0);
        setTransZoom(newEffective / baseZoom);
    };
    const handleTransZoomOut = () => {
        const newEffective = clamp(effectiveTransZoom - 0.25, 0.5, 3.0);
        setTransZoom(newEffective / baseZoom);
    };
    const handleTransZoomReset = () => {
        setTransZoom(1 / baseZoom);
    };

    // ============================
    // 📏 각 뷰어의 실제 가로폭 측정 (처음부터 꽉 차게)
    // ============================
    const origScrollRef = useRef(null);
    const transScrollRef = useRef(null);

    const [origContainerWidth, setOrigContainerWidth] = useState(0);
    const [transContainerWidth, setTransContainerWidth] = useState(0);

    useEffect(() => {
        const el = origScrollRef.current;
        if (!el || typeof ResizeObserver === 'undefined') return;

        const updateWidth = () => {
            setOrigContainerWidth(Math.max(el.clientWidth - 16, 200)); // padding 고려
        };

        updateWidth();
        const observer = new ResizeObserver(updateWidth);
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        const el = transScrollRef.current;
        if (!el || typeof ResizeObserver === 'undefined') return;

        const updateWidth = () => {
            setTransContainerWidth(Math.max(el.clientWidth - 16, 200));
        };

        updateWidth();
        const observer = new ResizeObserver(updateWidth);
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    const baseOrigWidth = origContainerWidth || 420;
    const baseTransWidth = transContainerWidth || 420;

    const origWidth = baseOrigWidth * effectiveOrigZoom;
    const transWidth = baseTransWidth * effectiveTransZoom;

    // ============================
    // 🖱 가로+세로 드래그 스크롤 상태
    // ============================
    const origDrag = useRef({
        isDown: false,
        startX: 0,
        startY: 0,
        scrollLeft: 0,
        scrollTop: 0,
    });
    const transDrag = useRef({
        isDown: false,
        startX: 0,
        startY: 0,
        scrollLeft: 0,
        scrollTop: 0,
    });

    const [isDraggingOrig, setIsDraggingOrig] = useState(false);
    const [isDraggingTrans, setIsDraggingTrans] = useState(false);

    // 줌 변경 시 항상 (0,0) 에서 시작
    useEffect(() => {
        const el = origScrollRef.current;
        if (el) {
            el.scrollLeft = 0;
            el.scrollTop = 0;
        }
    }, [origWidth, originalPages]);

    useEffect(() => {
        const el = transScrollRef.current;
        if (el) {
            el.scrollLeft = 0;
            el.scrollTop = 0;
        }
    }, [transWidth, translatedPages]);

    // 원본 드래그
    const handleOrigMouseDown = (e) => {
        if (e.button !== 0) return;
        const el = origScrollRef.current;
        if (!el) return;
        e.preventDefault();

        origDrag.current = {
            isDown: true,
            startX: e.clientX,
            startY: e.clientY,
            scrollLeft: el.scrollLeft,
            scrollTop: el.scrollTop,
        };
        setIsDraggingOrig(true);
    };

    const handleOrigMouseMove = (e) => {
        const el = origScrollRef.current;
        const drag = origDrag.current;
        if (!el || !drag.isDown) return;

        e.preventDefault();
        const dx = e.clientX - drag.startX;
        const dy = e.clientY - drag.startY;
        el.scrollLeft = drag.scrollLeft - dx;
        el.scrollTop = drag.scrollTop - dy;
    };

    const stopOrigDrag = () => {
        if (!origDrag.current.isDown) return;
        origDrag.current.isDown = false;
        setIsDraggingOrig(false);
    };

    // 번역 드래그
    const handleTransMouseDown = (e) => {
        if (e.button !== 0) return;
        const el = transScrollRef.current;
        if (!el) return;
        e.preventDefault();

        transDrag.current = {
            isDown: true,
            startX: e.clientX,
            startY: e.clientY,
            scrollLeft: el.scrollLeft,
            scrollTop: el.scrollTop,
        };
        setIsDraggingTrans(true);
    };

    const handleTransMouseMove = (e) => {
        const el = transScrollRef.current;
        const drag = transDrag.current;
        if (!el || !drag.isDown) return;

        e.preventDefault();
        const dx = e.clientX - drag.startX;
        const dy = e.clientY - drag.startY;
        el.scrollLeft = drag.scrollLeft - dx;
        el.scrollTop = drag.scrollTop - dy;
    };

    const stopTransDrag = () => {
        if (!transDrag.current.isDown) return;
        transDrag.current.isDown = false;
        setIsDraggingTrans(false);
    };

    // ✅ 줌 입력창 blur 시 적용 (원본/번역 공통 로직)
    const applyOrigInput = () => {
        const num = Number(origInput);
        if (Number.isNaN(num)) {
            setOrigInput(Math.round(effectiveOrigZoom * 100));
            return;
        }
        const clampedPercent = clamp(num, 50, 300); // 50~300%
        const newEffective = clampedPercent / 100;
        setOrigZoom(newEffective / baseZoom);
    };

    const applyTransInput = () => {
        const num = Number(transInput);
        if (Number.isNaN(num)) {
            setTransInput(Math.round(effectiveTransZoom * 100));
            return;
        }
        const clampedPercent = clamp(num, 50, 300);
        const newEffective = clampedPercent / 100;
        setTransZoom(newEffective / baseZoom);
    };

    // ✅ 페이지 입력 적용 (원본 기준, 필요 시 번역도 동기화)
    const applyOrigPageInput = () => {
        const num = Number(origPageInput);
        if (Number.isNaN(num) || !originalPages) {
            setOrigPageInput(String(origCurrentPage));
            return;
        }
        const clampedPage = clamp(num, 1, originalPages);
        setOrigCurrentPage(clampedPage);

        if (syncPages && translatedPages) {
            setTransCurrentPage((prev) => clamp(clampedPage, 1, translatedPages));
            setSyncedPage((prev) => clamp(clampedPage, 1, prev));
        }

        if (syncPages) {
            emitPageSync(clampedPage); // ✅ 추가
        }
    };

    const applyTransPageInput = () => {
        const num = Number(transPageInput);
        if (Number.isNaN(num) || !translatedPages) {
            setTransPageInput(String(transCurrentPage));
            return;
        }
        const clampedPage = clamp(num, 1, translatedPages);
        setTransCurrentPage(clampedPage);

        if (syncPages && originalPages) {
            setOrigCurrentPage((prev) => clamp(clampedPage, 1, originalPages));
            setSyncedPage((prev) => clamp(clampedPage, 1, prev));
        }

        if (syncPages) {
            emitPageSync(clampedPage); // ✅ 추가
        }
    };

    // 페이지 이동 버튼 (개별)
    const handleOrigPrevPage = () => {
        if (!originalPages) return;
        setOrigCurrentPage((p) => clamp(p - 1, 1, originalPages));
        if (syncPages && translatedPages) {
            setTransCurrentPage((p) => clamp(p - 1, 1, translatedPages));
        }
    };

    const handleOrigNextPage = () => {
        if (!originalPages) return;
        setOrigCurrentPage((p) => clamp(p + 1, 1, originalPages));
        if (syncPages && translatedPages) {
            setTransCurrentPage((p) => clamp(p + 1, 1, translatedPages));
        }
    };

    const handleTransPrevPage = () => {
        if (!translatedPages) return;
        setTransCurrentPage((p) => clamp(p - 1, 1, translatedPages));
        if (syncPages && originalPages) {
            setOrigCurrentPage((p) => clamp(p - 1, 1, originalPages));
        }
    };

    const handleTransNextPage = () => {
        if (!translatedPages) return;
        setTransCurrentPage((p) => clamp(p + 1, 1, translatedPages));
        if (syncPages && originalPages) {
            setOrigCurrentPage((p) => clamp(p + 1, 1, originalPages));
        }
    };

    useEffect(() => {
        if (!remotePageSync || viewMode !== 'page') return;
        const { page } = remotePageSync;
        if (!page) return;

        // 아직 페이지 수가 안 잡힌 경우를 대비해 일단 clamp
        const targetOrig = originalPages ? clamp(page, 1, originalPages) : null;
        const targetTrans = translatedPages ? clamp(page, 1, translatedPages) : null;

        setSyncedPage(page);

        if (targetOrig !== null) {
            setOrigCurrentPage(targetOrig);
            setOrigPageInput(String(targetOrig));
        }
        if (targetTrans !== null) {
            setTransCurrentPage(targetTrans);
            setTransPageInput(String(targetTrans));
        }
    }, [remotePageSync, viewMode, originalPages, translatedPages]);

    // ============================
    // 🧲 레이저 포인터 좌표 계산 (호스트 전용, 페이지 모드에서만 사용)
    // ============================
    const origPageRef = useRef(null);
    const transPageRef = useRef(null);

    const handleHostPointerClick = (e, side) => {
        if (!isHost || viewMode !== 'page') return;

        const ref = side === 'orig' ? origPageRef : transPageRef;
        const el = ref.current;
        if (!el) return;

        const rect = el.getBoundingClientRect();
        const xPercent = ((e.clientX - rect.left) / rect.width) * 100;
        const yPercent = ((e.clientY - rect.top) / rect.height) * 100;

        const page = side === 'orig' ? origCurrentPage : transCurrentPage;
        const payload = {
            side,
            page,
            xPercent,
            yPercent,
            ts: Date.now(),
        };

        // 로컬 표시
        setPointer(payload);

        // 상위(예: LiveKit DataChannel)로 브로드캐스트 콜백
        if (onPointerSend) {
            onPointerSend(payload);
        }
    };

    // 포인터 렌더링 공통 컴포넌트 (페이지 모드에서만 호출)
    const renderPointer = (side, currentPage) => {
        if (viewMode !== 'page') return null;
        if (!pointer) return null;
        if (pointer.side !== side || pointer.page !== currentPage) return null;

        const ringClass = side === 'orig' ? 'bg-red-500/40' : 'bg-emerald-400/40';
        const dotClass = side === 'orig' ? 'bg-red-500' : 'bg-emerald-400';

        return (
            <div
                className="absolute w-6 h-6 flex items-center justify-center pointer-events-none"
                style={{
                    left: `${pointer.xPercent}%`,
                    top: `${pointer.yPercent}%`,
                    transform: 'translate(-50%, -50%)',
                }}
            >
                <span className={`absolute inline-flex h-full w-full rounded-full ${ringClass} opacity-75 animate-ping`} />
                <span className={`relative inline-flex w-3 h-3 rounded-full ${dotClass} border border-white shadow`} />
            </div>
        );
    };

    // ✅ 스크롤 모드일 때는 항상 좌우 2분할 강제
    const containerClass =
        viewMode === 'scroll'
            ? 'grid grid-cols-1 md:grid-cols-2 gap-2' // 스크롤 모드 → 항상 좌우 2분할
            : layoutMode === 'vertical'
            ? 'grid grid-cols-1 md:grid-cols-2 gap-2' // 페이지 모드 + vertical → 좌우 2분할
            : 'flex flex-col gap-2'; // 페이지 모드 + horizontal → 상하 2분할

    // ✅ 상단 공통 페이지 정보 (동기화 ON일 때 표시용)
    const hasAnyPages = originalPages > 0 || translatedPages > 0;
    let syncMaxPage = 1;
    if (hasAnyPages) {
        const maxPage = originalPages && translatedPages ? Math.min(originalPages, translatedPages) : originalPages || translatedPages;
        syncMaxPage = maxPage || 1;
    }
    const syncCurrentPage = clamp(syncedPage, 1, syncMaxPage);

    // ✅ 페이지 동기화 토글 클릭 시: ON이 될 때 두 문서 페이지를 맞춰줌 + syncedPage 갱신
    const handleToggleSyncPages = () => {
        setSyncPages((prev) => {
            const next = !prev;
            if (next && viewMode === 'page') {
                const hasOrig = originalPages > 0;
                const hasTrans = translatedPages > 0;
                if (!hasOrig && !hasTrans) return next;

                const maxPage = hasOrig && hasTrans ? Math.min(originalPages, translatedPages) : hasOrig ? originalPages : translatedPages;

                const basePage = hasOrig ? origCurrentPage : transCurrentPage;
                const newPage = clamp(basePage, 1, maxPage || 1);

                setSyncedPage(newPage);
                if (hasOrig) {
                    setOrigCurrentPage(newPage);
                    setOrigPageInput(String(newPage));
                }
                if (hasTrans) {
                    setTransCurrentPage(newPage);
                    setTransPageInput(String(newPage));
                }
            }
            return next;
        });
    };

    // ✅ 상단 공통 페이지 이동 (syncPages + page 모드일 때만)
    const handleGlobalPrevPage = () => {
        if (!syncPages || viewMode !== 'page' || !hasAnyPages) return;

        const newPage = clamp(syncCurrentPage - 1, 1, syncMaxPage);
        setSyncedPage(newPage);

        if (originalPages > 0) {
            const p = clamp(newPage, 1, originalPages);
            setOrigCurrentPage(p);
            setOrigPageInput(String(p));
        }
        if (translatedPages > 0) {
            const p = clamp(newPage, 1, translatedPages);
            setTransCurrentPage(p);
            setTransPageInput(String(p));
        }

        emitPageSync(newPage); // ✅ 추가
    };

    const handleGlobalNextPage = () => {
        if (!syncPages || viewMode !== 'page' || !hasAnyPages) return;

        const newPage = clamp(syncCurrentPage + 1, 1, syncMaxPage);
        setSyncedPage(newPage);

        if (originalPages > 0) {
            const p = clamp(newPage, 1, originalPages);
            setOrigCurrentPage(p);
            setOrigPageInput(String(p));
        }
        if (translatedPages > 0) {
            const p = clamp(newPage, 1, translatedPages);
            setTransCurrentPage(p);
            setTransPageInput(String(p));
        }

        emitPageSync(newPage); // ✅ 추가
    };

    return (
        <div className="absolute inset-0 flex flex-col bg-slate-900 min-h-0">
            {/* 상단 바 + 전체 배율 컨트롤 + 레이아웃 모드/뷰 모드/동기화 토글 */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-slate-700 bg-slate-900/95 z-20">
                <div className="flex flex-col">
                    <span className="text-sm font-semibold text-slate-50">문서 공유 중</span>
                    <span className="text-xs text-slate-400">모든 참가자가 같은 문서를 보고 있습니다.</span>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-200">
                    {/* ✅ 공통 페이지 네비 (페이지 모드 + 동기화 ON + 페이지 존재) */}
                    {viewMode === 'page' && syncPages && hasAnyPages && (
                        <div className="flex items-center gap-1 px-2 py-1 rounded-lg border border-slate-600 bg-slate-800">
                            <button
                                type="button"
                                onClick={handleGlobalPrevPage}
                                disabled={syncCurrentPage <= 1}
                                className="px-2 py-0.5 rounded border border-slate-500 bg-slate-900 disabled:opacity-40 hover:bg-slate-700"
                            >
                                ◀
                            </button>
                            <span className="text-[11px] text-slate-100">
                                {syncCurrentPage} / {syncMaxPage}
                            </span>
                            <button
                                type="button"
                                onClick={handleGlobalNextPage}
                                disabled={syncCurrentPage >= syncMaxPage}
                                className="px-2 py-0.5 rounded border border-slate-500 bg-slate-900 disabled:opacity-40 hover:bg-slate-700"
                            >
                                ▶
                            </button>
                        </div>
                    )}

                    {/* 페이지 동기화 토글 */}
                    <button
                        type="button"
                        onClick={handleToggleSyncPages}
                        className={`px-3 py-1 rounded-lg border border-slate-600 text-[11px] ${syncPages ? 'bg-emerald-700/80' : 'bg-slate-800'} hover:bg-slate-700`}
                    >
                        페이지 동기화 {syncPages ? 'ON' : 'OFF'}
                    </button>

                    {/* 레이아웃 모드 토글 👉 페이지 모드에서만 표시 */}
                    {viewMode === 'page' && (
                        <button type="button" onClick={toggleLayoutMode} className="px-3 py-1 rounded-lg border border-slate-600 bg-slate-800 text-[11px] hover:bg-slate-700">
                            {layoutMode === 'vertical' ? '상하 2분할' : '좌우 2분할'}
                        </button>
                    )}

                    {/* 뷰 모드 토글 (페이지 vs 스크롤) */}
                    <button type="button" onClick={toggleViewMode} className="px-3 py-1 rounded-lg border border-slate-600 bg-slate-800 text-[11px] hover:bg-slate-700">
                        {viewMode === 'page' ? '스크롤 모드' : '페이지 모드'}
                    </button>

                    <span className="px-2 py-1 rounded-full bg-slate-800 border border-slate-600">전체 {Math.round(baseZoom * 100)}%</span>
                    <div className="inline-flex rounded-lg overflow-hidden border border-slate-600 bg-slate-800">
                        <button type="button" onClick={handleBaseZoomOut} className="px-2 py-1 hover:bg-slate-700 text-slate-200 text-xs">
                            -
                        </button>
                        <button type="button" onClick={handleBaseZoomReset} className="px-3 py-1 hover:bg-slate-700 text-slate-200 text-[11px]">
                            100%
                        </button>
                        <button type="button" onClick={handleBaseZoomIn} className="px-2 py-1 hover:bg-slate-700 text-slate-200 text-xs">
                            +
                        </button>
                    </div>
                </div>
            </div>

            {/* 세로 스크롤 컨테이너 */}
            <div className="flex-1 min-h-0 overflow-y-auto p-2">
                <div className={containerClass}>
                    {/* ==================== 원본 ==================== */}
                    {originalUrl && (
                        <div className="flex flex-col bg-slate-950 rounded-xl overflow-hidden border border-slate-700/70">
                            <div className="px-3 py-2 text-xs text-slate-200 bg-slate-800/95 border-b border-slate-700 flex items-center justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                    <span className="font-semibold">원본</span>
                                    <span className="ml-2 text-[11px] text-slate-400 truncate">{originalTitle || originalUrl}</span>
                                </div>

                                {/* 페이지 네비게이션 + 줌 컨트롤 */}
                                <div className="flex items-center gap-2">
                                    {/* 페이지 네비 (개별) */}
                                    {originalPages > 0 && (
                                        <div className="flex items-center gap-1 text-[10px]">
                                            <button
                                                type="button"
                                                onClick={handleOrigPrevPage}
                                                disabled={viewMode !== 'page' || syncPages || origCurrentPage <= 1}
                                                className="px-1 py-0.5 rounded border border-slate-600 bg-slate-900 disabled:opacity-40 hover:bg-slate-700"
                                            >
                                                ◀
                                            </button>
                                            <input
                                                type="number"
                                                min={1}
                                                max={originalPages}
                                                value={origPageInput}
                                                onChange={(e) => setOrigPageInput(e.target.value)}
                                                onBlur={applyOrigPageInput}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') applyOrigPageInput();
                                                }}
                                                disabled={viewMode !== 'page' || syncPages}
                                                className="w-9 px-1 py-0.5 bg-slate-900 border border-slate-600 rounded text-center text-[10px] outline-none focus:border-sky-400 disabled:opacity-50"
                                            />
                                            <span className="text-slate-300">/ {originalPages}</span>
                                            <button
                                                type="button"
                                                onClick={handleOrigNextPage}
                                                disabled={viewMode !== 'page' || syncPages || origCurrentPage >= originalPages}
                                                className="px-1 py-0.5 rounded border border-slate-600 bg-slate-900 disabled:opacity-40 hover:bg-slate-700"
                                            >
                                                ▶
                                            </button>
                                        </div>
                                    )}

                                    {/* 원본 배율 표시 + 입력 + 버튼 */}
                                    <div className="flex items-center gap-1 text-[10px]">
                                        <input
                                            type="number"
                                            min={50}
                                            max={300}
                                            value={origInput}
                                            onChange={(e) => setOrigInput(e.target.value)}
                                            onBlur={applyOrigInput}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') applyOrigInput();
                                            }}
                                            className="w-12 px-1 py-0.5 bg-slate-900 border border-slate-600 rounded text-center text-[10px] outline-none focus:border-sky-400"
                                        />
                                        <span className="text-slate-300 mr-1">%</span>
                                        <div className="inline-flex rounded-md overflow-hidden border border-slate-600 bg-slate-900">
                                            <button type="button" onClick={handleOrigZoomOut} className="px-1.5 py-0.5 hover:bg-slate-700">
                                                -
                                            </button>
                                            <button type="button" onClick={handleOrigZoomReset} className="px-2 py-0.5 hover:bg-slate-700 text-[9px]">
                                                100
                                            </button>
                                            <button type="button" onClick={handleOrigZoomIn} className="px-1.5 py-0.5 hover:bg-slate-700">
                                                +
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div
                                ref={origScrollRef}
                                className="p-2 overflow-auto"
                                onMouseDown={handleOrigMouseDown}
                                onMouseMove={handleOrigMouseMove}
                                onMouseUp={stopOrigDrag}
                                onMouseLeave={stopOrigDrag}
                                style={{
                                    cursor: isDraggingOrig ? 'grabbing' : 'grab',
                                    userSelect: isDraggingOrig ? 'none' : 'auto',
                                }}
                            >
                                <div className="inline-block">
                                    <Document
                                        file={originalUrl}
                                        onLoadSuccess={({ numPages }) => {
                                            setOriginalPages(numPages);
                                            setOrigCurrentPage(1);
                                        }}
                                        loading={<div className="text-slate-300 text-xs py-4">원본 PDF 불러오는 중...</div>}
                                        error={<div className="text-red-400 text-xs py-4">원본 PDF를 불러오지 못했습니다.</div>}
                                    >
                                        {/* 페이지 모드: 한 페이지만 렌더 + 포인터 */}
                                        {viewMode === 'page' && originalPages > 0 && (
                                            <div ref={origPageRef} className="relative inline-block" onClick={(e) => handleHostPointerClick(e, 'orig')}>
                                                <Page key={`orig-page-${origCurrentPage}`} pageNumber={origCurrentPage} width={origWidth} renderTextLayer={false} renderAnnotationLayer={false} />
                                                {renderPointer('orig', origCurrentPage)}
                                            </div>
                                        )}

                                        {/* 스크롤 모드: 모든 페이지 세로 렌더 */}
                                        {viewMode === 'scroll' && originalPages > 0 && (
                                            <div className="flex flex-col gap-4">
                                                {Array.from({ length: originalPages }, (_, idx) => (
                                                    <Page key={`orig-page-${idx + 1}`} pageNumber={idx + 1} width={origWidth} renderTextLayer={false} renderAnnotationLayer={false} />
                                                ))}
                                            </div>
                                        )}
                                    </Document>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ==================== 번역 ==================== */}
                    {translatedUrl && (
                        <div className="flex flex-col bg-slate-950 rounded-xl overflow-hidden border border-slate-700/70">
                            <div className="px-3 py-2 text-xs text-slate-200 bg-slate-800/95 border-b border-slate-700 flex items-center justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                    <span className="font-semibold">번역</span>
                                    <span className="ml-2 text-[11px] text-slate-400 truncate">{translatedTitle || translatedUrl}</span>
                                </div>

                                {/* 페이지 네비게이션 + 줌 컨트롤 */}
                                <div className="flex items-center gap-2">
                                    {/* 페이지 네비 (개별) */}
                                    {translatedPages > 0 && (
                                        <div className="flex items-center gap-1 text-[10px]">
                                            <button
                                                type="button"
                                                onClick={handleTransPrevPage}
                                                disabled={viewMode !== 'page' || syncPages || transCurrentPage <= 1}
                                                className="px-1 py-0.5 rounded border border-slate-600 bg-slate-900 disabled:opacity-40 hover:bg-slate-700"
                                            >
                                                ◀
                                            </button>
                                            <input
                                                type="number"
                                                min={1}
                                                max={translatedPages}
                                                value={transPageInput}
                                                onChange={(e) => setTransPageInput(e.target.value)}
                                                onBlur={applyTransPageInput}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') applyTransPageInput();
                                                }}
                                                disabled={viewMode !== 'page' || syncPages}
                                                className="w-9 px-1 py-0.5 bg-slate-900 border border-slate-600 rounded text-center text-[10px] outline-none focus:border-emerald-400 disabled:opacity-50"
                                            />
                                            <span className="text-slate-300">/ {translatedPages}</span>
                                            <button
                                                type="button"
                                                onClick={handleTransNextPage}
                                                disabled={viewMode !== 'page' || syncPages || transCurrentPage >= translatedPages}
                                                className="px-1 py-0.5 rounded border border-slate-600 bg-slate-900 disabled:opacity-40 hover:bg-slate-700"
                                            >
                                                ▶
                                            </button>
                                        </div>
                                    )}

                                    {/* 번역 배율 표시 + 입력 + 버튼 */}
                                    <div className="flex items-center gap-1 text-[10px]">
                                        <input
                                            type="number"
                                            min={50}
                                            max={300}
                                            value={transInput}
                                            onChange={(e) => setTransInput(e.target.value)}
                                            onBlur={applyTransInput}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') applyTransInput();
                                            }}
                                            className="w-12 px-1 py-0.5 bg-slate-900 border border-slate-600 rounded text-center text-[10px] outline-none focus:border-emerald-400"
                                        />
                                        <span className="text-slate-300 mr-1">%</span>
                                        <div className="inline-flex rounded-md overflow-hidden border border-slate-600 bg-slate-900">
                                            <button type="button" onClick={handleTransZoomOut} className="px-1.5 py-0.5 hover:bg-slate-700">
                                                -
                                            </button>
                                            <button type="button" onClick={handleTransZoomReset} className="px-2 py-0.5 hover:bg-slate-700 text-[9px]">
                                                100
                                            </button>
                                            <button type="button" onClick={handleTransZoomIn} className="px-1.5 py-0.5 hover:bg-slate-700">
                                                +
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div
                                ref={transScrollRef}
                                className="p-2 overflow-auto"
                                onMouseDown={handleTransMouseDown}
                                onMouseMove={handleTransMouseMove}
                                onMouseUp={stopTransDrag}
                                onMouseLeave={stopTransDrag}
                                style={{
                                    cursor: isDraggingTrans ? 'grabbing' : 'grab',
                                    userSelect: isDraggingTrans ? 'none' : 'auto',
                                }}
                            >
                                <div className="inline-block">
                                    <Document
                                        file={translatedUrl}
                                        onLoadSuccess={({ numPages }) => {
                                            setTranslatedPages(numPages);
                                            setTransCurrentPage(1);
                                        }}
                                        loading={<div className="text-slate-300 text-xs py-4">번역 PDF 불러오는 중...</div>}
                                        error={<div className="text-red-400 text-xs py-4">번역 PDF를 불러오지 못했습니다.</div>}
                                    >
                                        {/* 페이지 모드: 한 페이지만 렌더 + 포인터 */}
                                        {viewMode === 'page' && translatedPages > 0 && (
                                            <div ref={transPageRef} className="relative inline-block" onClick={(e) => handleHostPointerClick(e, 'trans')}>
                                                <Page key={`trans-page-${transCurrentPage}`} pageNumber={transCurrentPage} width={transWidth} renderTextLayer={false} renderAnnotationLayer={false} />
                                                {renderPointer('trans', transCurrentPage)}
                                            </div>
                                        )}

                                        {/* 스크롤 모드: 모든 페이지 세로 렌더 */}
                                        {viewMode === 'scroll' && translatedPages > 0 && (
                                            <div className="flex flex-col gap-4">
                                                {Array.from({ length: translatedPages }, (_, idx) => (
                                                    <Page key={`trans-page-${idx + 1}`} pageNumber={idx + 1} width={transWidth} renderTextLayer={false} renderAnnotationLayer={false} />
                                                ))}
                                            </div>
                                        )}
                                    </Document>
                                </div>
                            </div>
                        </div>
                    )}

                    {!originalUrl && !translatedUrl && <div className="flex items-center justify-center text-slate-300 text-sm h-full">공유할 문서 URL이 없습니다.</div>}
                </div>
            </div>
        </div>
    );
};

export default SyncedPdfGrid;
