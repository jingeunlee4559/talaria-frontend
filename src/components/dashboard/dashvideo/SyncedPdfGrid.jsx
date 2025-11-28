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
 * - originalUrl, translatedUrl, originalTitle, translatedTitle
 * - isHost: boolean (포인터용, 지금은 안 씀)
 * - onPointerSend: (payload) => void  // 호스트가 포인터 찍을 때 호출
 * - remotePointer: { side: 'orig'|'trans', page: number, xPercent: number, yPercent: number, ts: number }
 * - onPageSyncSend: ({ page }) => void  // 페이지 동기화 브로드캐스트
 * - remotePageSync: { page }            // LiveKit에서 받은 페이지 동기화 정보
 */
const SyncedPdfGrid = ({ originalUrl, translatedUrl, originalTitle, translatedTitle, isHost = false, onPointerSend, remotePointer, onPageSyncSend, remotePageSync }) => {
    const [originalPages, setOriginalPages] = useState(0);
    const [translatedPages, setTranslatedPages] = useState(0);

    const [baseZoom, setBaseZoom] = useState(1);
    const [origZoom, setOrigZoom] = useState(1);
    const [transZoom, setTransZoom] = useState(1);

    const effectiveOrigZoom = baseZoom * origZoom;
    const effectiveTransZoom = baseZoom * transZoom;

    const [origInput, setOrigInput] = useState(100);
    const [transInput, setTransInput] = useState(100);

    const [origCurrentPage, setOrigCurrentPage] = useState(1);
    const [transCurrentPage, setTransCurrentPage] = useState(1);

    const [origPageInput, setOrigPageInput] = useState('1');
    const [transPageInput, setTransPageInput] = useState('1');

    const [layoutMode, setLayoutMode] = useState('vertical'); // 'vertical' | 'horizontal'
    const [viewMode, setViewMode] = useState('scroll'); // 'page' | 'scroll'

    const [syncPages, setSyncPages] = useState(true);
    const [syncedPage, setSyncedPage] = useState(1);

    const [pointer, setPointer] = useState(null);

    // ⭐ 외부 스크롤 컨테이너 ref (원본/번역 박스를 모두 감싸는 영역)
    const outerScrollRef = useRef(null);

    // ⭐ 현재 이 클라이언트가 "번역 쪽을 주로 보고 있는지" 힌트용 상태
    const [prefersTrans, setPrefersTrans] = useState(false);

    // ✅ 페이지 동기화 브로드캐스트 함수 (호스트 여부 상관없이 버튼 누른 쪽이 호출)
    const emitPageSync = (page) => {
        if (!onPageSyncSend) return;
        onPageSyncSend({ page });
    };

    useEffect(() => {
        if (!remotePointer) return;
        setPointer(remotePointer);
    }, [remotePointer]);

    useEffect(() => {
        if (!pointer) return;
        const timeout = setTimeout(() => setPointer(null), 2000);
        return () => clearTimeout(timeout);
    }, [pointer]);

    useEffect(() => {
        setOrigInput(Math.round(effectiveOrigZoom * 100));
    }, [effectiveOrigZoom]);

    useEffect(() => {
        setTransInput(Math.round(effectiveTransZoom * 100));
    }, [effectiveTransZoom]);

    useEffect(() => {
        setOrigPageInput(String(origCurrentPage));
    }, [origCurrentPage]);

    useEffect(() => {
        setTransPageInput(String(transCurrentPage));
    }, [transCurrentPage]);

    const handleBaseZoomIn = () => setBaseZoom((z) => clamp(z + 0.25, 0.5, 2.0));
    const handleBaseZoomOut = () => setBaseZoom((z) => clamp(z - 0.25, 0.5, 2.0));
    const handleBaseZoomReset = () => setBaseZoom(1);

    const handleOrigZoomIn = () => {
        const newEffective = clamp(effectiveOrigZoom + 0.25, 0.5, 3.0);
        setOrigZoom(newEffective / baseZoom);
    };
    const handleOrigZoomOut = () => {
        const newEffective = clamp(effectiveOrigZoom - 0.25, 0.5, 3.0);
        setOrigZoom(newEffective / baseZoom);
    };
    const handleOrigZoomReset = () => {
        setOrigZoom(1 / baseZoom);
    };

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

    const origScrollRef = useRef(null);
    const transScrollRef = useRef(null);

    const [origContainerWidth, setOrigContainerWidth] = useState(0);
    const [transContainerWidth, setTransContainerWidth] = useState(0);

    useEffect(() => {
        const el = origScrollRef.current;
        if (!el || typeof ResizeObserver === 'undefined') return;

        const updateWidth = () => {
            setOrigContainerWidth(Math.max(el.clientWidth - 16, 200));
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

    // 🔥 (중요) 페이지/줌 변경 시 스크롤을 강제로 0으로 리셋하지 않도록 주석 처리
    // useEffect(() => {
    //     const el = origScrollRef.current;
    //     if (el) {
    //         el.scrollLeft = 0;
    //         el.scrollTop = 0;
    //     }
    // }, [origWidth, originalPages]);

    // useEffect(() => {
    //     const el = transScrollRef.current;
    //     if (el) {
    //         el.scrollLeft = 0;
    //         el.scrollTop = 0;
    //     }
    // }, [transWidth, translatedPages]);

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

    const applyOrigInput = () => {
        const num = Number(origInput);
        if (Number.isNaN(num)) {
            setOrigInput(Math.round(effectiveOrigZoom * 100));
            return;
        }
        const clampedPercent = clamp(num, 50, 300);
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
            emitPageSync(clampedPage);
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
            emitPageSync(clampedPage);
        }
    };

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

    const origPageRef = useRef(null);
    const transPageRef = useRef(null);

    const handleHostPointerClick = (e, side) => {
        // 🔹 포인터는 isHost 기준으로만 동작 (지금은 isHost 안 쓰면 사실상 비활성)
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

        setPointer(payload);

        if (onPointerSend) {
            onPointerSend(payload);
        }
    };

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

    const containerClass = viewMode === 'scroll' ? 'grid grid-cols-1 md:grid-cols-2 gap-2' : layoutMode === 'vertical' ? 'grid grid-cols-1 md:grid-cols-2 gap-2' : 'flex flex-col gap-2';

    const hasAnyPages = originalPages > 0 || translatedPages > 0;
    let syncMaxPage = 1;
    if (hasAnyPages) {
        const maxPage = originalPages && translatedPages ? Math.min(originalPages, translatedPages) : originalPages || translatedPages;
        syncMaxPage = maxPage || 1;
    }
    const syncCurrentPage = clamp(syncedPage, 1, syncMaxPage);

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

        emitPageSync(newPage);
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

        emitPageSync(newPage);
    };

    // ⭐ 외부 스크롤 시, 지금 이 클라이언트가 "원본/번역 중 어디를 위주로 보고 있는지" 대략 추정
    const handleOuterScroll = () => {
        const outer = outerScrollRef.current;
        if (!outer || !origScrollRef.current || !transScrollRef.current) return;

        const mid = outer.scrollTop + outer.clientHeight / 2;
        const origTop = origScrollRef.current.offsetTop;
        const transTop = transScrollRef.current.offsetTop;

        const distOrig = Math.abs(mid - origTop);
        const distTrans = Math.abs(mid - transTop);

        setPrefersTrans(distTrans <= distOrig);
    };

    // ✅ 다른 참가자에게서 받은 page sync 적용
    useEffect(() => {
        if (!remotePageSync || viewMode !== 'page') return;
        const { page } = remotePageSync;
        if (!page) return;

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

        // ⭐ 여기 핵심:
        // 이 클라이언트가 "번역 영역"을 주로 보고 있던 상태라면,
        // 페이지가 바뀐 뒤에도 외부 스크롤을 번역 박스 위치에 다시 맞춰준다.
        if (outerScrollRef.current && transScrollRef.current && prefersTrans) {
            const outer = outerScrollRef.current;
            const targetTop = transScrollRef.current.offsetTop - 8; // 살짝 여백
            outer.scrollTo({
                top: targetTop,
                behavior: 'auto', // 깜빡임 최소화 (smooth 사용하면 튀는 느낌 더 심해질 수 있음)
            });
        }
    }, [remotePageSync, viewMode, originalPages, translatedPages, prefersTrans]);

    return (
        <div className="absolute inset-0 flex flex-col bg-slate-900 min-h-0">
            <div className="flex items-center justify-between px-4 py-2 border-b border-slate-700 bg-slate-900/95 z-20">
                <div className="flex flex-col">
                    <span className="text-sm font-semibold text-slate-50">문서 공유 중</span>
                    <span className="text-xs text-slate-400">모든 참가자가 같은 문서를 보고 있습니다.</span>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-200">
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

                    <button
                        type="button"
                        onClick={handleToggleSyncPages}
                        className={`px-3 py-1 rounded-lg border border-slate-600 text-[11px] ${syncPages ? 'bg-emerald-700/80' : 'bg-slate-800'} hover:bg-slate-700`}
                    >
                        페이지 동기화 {syncPages ? 'ON' : 'OFF'}
                    </button>

                    {viewMode === 'page' && (
                        <button
                            type="button"
                            onClick={() => setLayoutMode((m) => (m === 'vertical' ? 'horizontal' : 'vertical'))}
                            className="px-3 py-1 rounded-lg border border-slate-600 bg-slate-800 text-[11px] hover:bg-slate-700"
                        >
                            {layoutMode === 'vertical' ? '상하 2분할' : '좌우 2분할'}
                        </button>
                    )}

                    <button
                        type="button"
                        onClick={() => setViewMode((m) => (m === 'page' ? 'scroll' : 'page'))}
                        className="px-3 py-1 rounded-lg border border-slate-600 bg-slate-800 text-[11px] hover:bg-slate-700"
                    >
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

            {/* ⭐ 외부 스크롤 컨테이너에 ref + onScroll 추가 */}
            <div ref={outerScrollRef} className="flex-1 min-h-0 overflow-y-auto p-2" onScroll={handleOuterScroll}>
                <div className={containerClass}>
                    {originalUrl && (
                        <div className="flex flex-col bg-slate-950 rounded-xl overflow-hidden border border-slate-700/70">
                            <div className="px-3 py-2 text-xs text-slate-200 bg-slate-800/95 border-b border-slate-700 flex items-center justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                    <span className="font-semibold">원본</span>
                                    <span className="ml-2 text-[11px] text-slate-400 truncate">{originalTitle || originalUrl}</span>
                                </div>

                                <div className="flex items-center gap-2">
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
                                        {viewMode === 'page' && originalPages > 0 && (
                                            <div ref={origPageRef} className="relative inline-block" onClick={(e) => handleHostPointerClick(e, 'orig')}>
                                                <Page key={`orig-page-${origCurrentPage}`} pageNumber={origCurrentPage} width={origWidth} renderTextLayer={false} renderAnnotationLayer={false} />
                                                {renderPointer('orig', origCurrentPage)}
                                            </div>
                                        )}

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

                    {translatedUrl && (
                        <div className="flex flex-col bg-slate-950 rounded-xl overflow-hidden border border-slate-700/70">
                            <div className="px-3 py-2 text-xs text-slate-200 bg-slate-800/95 border-b border-slate-700 flex items-center justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                    <span className="font-semibold">번역</span>
                                    <span className="ml-2 text-[11px] text-slate-400 truncate">{translatedTitle || translatedUrl}</span>
                                </div>

                                <div className="flex items-center gap-2">
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
                                        {viewMode === 'page' && translatedPages > 0 && (
                                            <div ref={transPageRef} className="relative inline-block" onClick={(e) => handleHostPointerClick(e, 'trans')}>
                                                <Page key={`trans-page-${transCurrentPage}`} pageNumber={transCurrentPage} width={transWidth} renderTextLayer={false} renderAnnotationLayer={false} />
                                                {renderPointer('trans', transCurrentPage)}
                                            </div>
                                        )}

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
