// src/components/dashboard/dashvideo/CustomVideoGrid.jsx
import React, { useEffect, useState } from 'react';
import { useTracks, ParticipantTile, VideoTrack, useDataChannel } from '@livekit/components-react';
import { Track } from 'livekit-client';
import SyncedPdfGrid from './SyncedPdfGrid'; // ✅ 문서 뷰어

// 🤖 에이전트 판별 함수
const isAgent = (participant) => {
    if (!participant) return false;

    const identity = participant.identity || '';
    const name = participant.name || '';

    if (identity.toLowerCase().includes('agent') || name.toLowerCase().includes('agent')) {
        return true;
    }

    try {
        const metadata = JSON.parse(participant.metadata || '{}');
        if (metadata.isAgent === true || metadata.type === 'agent') {
            return true;
        }
    } catch (e) {}

    return false;
};

function CustomVideoGrid({ virtualBgType, getFallbackBackgroundUrl, bgHighlight, docShare }) {
    const [activeHighlight, setActiveHighlight] = useState(null);

    // ✅ 다른 참가자로부터 받은 문서 포인터 상태
    const [remotePointer, setRemotePointer] = useState(null);

    // ✅ 다른 참가자로부터 받은 "페이지 동기화" 상태
    const [remotePageSync, setRemotePageSync] = useState(null);

    // 🔴 문서 동기화용 데이터 채널 (JSON 디코딩 추가)
    const { send: sendDocSync } = useDataChannel('doc-sync', (msg) => {
        try {
            const text = new TextDecoder().decode(msg.payload);
            const data = JSON.parse(text);

            if (data.type === 'pointer') {
                setRemotePointer(data);
            }

            if (data.type === 'page') {
                setRemotePageSync(data);
            }
        } catch (err) {
            console.error('doc-sync 수신 파싱 오류:', err);
        }
    });

    // 🔴 페이지 변경 브로드캐스트 함수 (JSON 인코딩 추가)
    const broadcastPageSync = (pagePayload) => {
        if (!sendDocSync || !pagePayload) return;

        try {
            const encoder = new TextEncoder();
            const payload = {
                type: 'page',
                ...pagePayload, // { page }
            };
            const bytes = encoder.encode(JSON.stringify(payload));
            sendDocSync(bytes);
        } catch (err) {
            console.error('문서 동기화(page) 전송 오류:', err);
        }
    };

    useEffect(() => {
        if (!bgHighlight) return;
        setActiveHighlight(bgHighlight);
        const timer = setTimeout(() => {
            setActiveHighlight(null);
        }, 320);
        return () => clearTimeout(timer);
    }, [bgHighlight?.token]);

    const getHighlightClasses = (category) => {
        switch (category) {
            case 'basic':
                return 'ring-4 ring-blue-400 shadow-[0_0_24px_rgba(96,165,250,0.9)] scale-[1.02]';
            case 'culture':
                return 'ring-4 ring-pink-400 shadow-[0_0_28px_rgba(236,72,153,0.95)] scale-[1.03]';
            case 'special':
                return 'ring-4 ring-amber-300 shadow-[0_0_32px_rgba(252,211,77,1)] scale-[1.035]';
            case 'season':
                return 'ring-4 ring-emerald-300 shadow-[0_0_28px_rgba(52,211,153,0.95)] scale-[1.03]';
            default:
                return 'ring-0 shadow-md';
        }
    };

    const tracks = useTracks(
        [
            { source: Track.Source.Camera, withPlaceholder: true },
            { source: Track.Source.ScreenShare, withPlaceholder: false },
        ],
        { onlySubscribed: false },
    );

    const screenShareTracks = tracks.filter((t) => t.source === Track.Source.ScreenShare).filter((t) => !isAgent(t.participant));

    const cameraTracks = tracks.filter((t) => t.source === Track.Source.Camera).filter((t) => !isAgent(t.participant));

    const hasScreenShare = screenShareTracks.length > 0;
    const isVirtualBgActive = virtualBgType === 'image' || virtualBgType === 'blur';

    // 📱 현재 화면이 모바일인지 여부 (768px 기준)
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            if (typeof window === 'undefined') return;
            setIsMobile(window.innerWidth < 768); // md 브레이크포인트 기준
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // ======================
    // 0) 문서 공유 레이아웃 (원본/번역 2분할 + 동기 스크롤/페이지)
    //     + 참가자 타일: 오른쪽 상단 세로 스택
    // ======================
    if (docShare?.active && (docShare.originalUrl || docShare.translatedUrl)) {
        return (
            <div className="absolute inset-0 w-full h-full bg-slate-900 overflow-hidden">
                {/* 메인 PDF 뷰어 (원본/번역) */}
                <SyncedPdfGrid
                    originalUrl={docShare.originalUrl}
                    translatedUrl={docShare.translatedUrl}
                    originalTitle={docShare.originalTitle}
                    translatedTitle={docShare.translatedTitle}
                    onPageSyncSend={broadcastPageSync}
                    remotePointer={remotePointer}
                    remotePageSync={remotePageSync}
                />

                {/* 참가자 카메라 타일: 하단 가로 스택 */}
                {cameraTracks.length > 0 && (
                    <div className="absolute left-0 right-0 bottom-4 z-40 pointer-events-none px-3 sm:px-4">
                        <div
                            className="
                            flex items-center justify-center gap-2
                            overflow-x-auto
                            pb-1
                            pointer-events-auto
                        "
                        >
                            {cameraTracks.map((trackRef) => (
                                <div
                                    key={trackRef.participant.identity}
                                    className="
                                    flex-shrink-0
                                    rounded-lg overflow-hidden
                                    shadow-2xl border-2 border-white/70 bg-slate-800/90
                                    hover:border-white hover:scale-105
                                    transition-all
                                    w-20 h-16
                                    sm:w-24 sm:h-18
                                    md:w-35 md:h-27
                                "
                                >
                                    <ParticipantTile
                                        trackRef={trackRef}
                                        style={{
                                            height: '100%',
                                            width: '100%',
                                            objectFit: 'cover',
                                        }}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    }
    // ======================
    // 1) 화면 공유 레이아웃
    //     + 참가자 타일: 오른쪽 상단 세로 스택
    // ======================
    if (hasScreenShare) {
        const shareTrackRef = screenShareTracks[0];

        return (
            <div className="absolute inset-0 w-full h-full overflow-hidden bg-black">
                {/* 블러 배경 */}
                <div className="absolute inset-0 z-10" style={{ margin: '-10%' }}>
                    <VideoTrack
                        trackRef={shareTrackRef}
                        style={{
                            width: '120%',
                            height: '120%',
                            filter: 'blur(50px) brightness(0.7)',
                            transform: 'scale(1.5)',
                            objectFit: 'cover',
                        }}
                    />
                </div>

                {/* 실제 화면 공유 */}
                <div className="absolute inset-0 z-20 flex items-center justify-center">
                    <VideoTrack
                        trackRef={shareTrackRef}
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'contain',
                        }}
                    />
                </div>

                {/* 참가자 카메라 타일: 오른쪽 상단 세로 스택 */}
                {cameraTracks.length > 0 && (
                    <div className="absolute top-4 right-4 z-40 pointer-events-none max-h-[calc(100vh-160px)] overflow-y-auto">
                        <div className="flex flex-col gap-2 pointer-events-auto">
                            {cameraTracks.map((trackRef) => (
                                <div
                                    key={trackRef.participant.identity}
                                    className="
                                        flex-shrink-0 
                                        rounded-lg overflow-hidden 
                                        shadow-2xl border-2 border-white/60 bg-slate-800/90 
                                        hover:border-white/80 hover:scale-105 
                                        transition-all
                                        w-24 h-18
                                        sm:w-28 sm:h-20
                                        md:w-32 md:h-24
                                    "
                                >
                                    <ParticipantTile
                                        trackRef={trackRef}
                                        style={{
                                            height: '100%',
                                            width: '100%',
                                            objectFit: 'cover',
                                        }}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // ======================
    // 2) 일반 카메라 레이아웃 (공유 X)
    //  👉 모바일(<768px): 1열, 상하로 꽉 차게
    //  👉 태블릿/PC: 인원 수에 따라 2~3열로 가득 차게
    // ======================

    // 인원 수에 따른 열 수 계산 (데스크톱용)
    const getGridCols = (count) => {
        if (count === 1) return 1;
        if (count === 2) return 2;
        if (count <= 4) return 2;
        if (count <= 6) return 3;
        return Math.ceil(Math.sqrt(count));
    };

    const totalCount = cameraTracks.length;
    const cols = isMobile ? 1 : getGridCols(totalCount || 1); // 📱 모바일이면 항상 1열

    const lastRowCount = totalCount % cols || cols;
    const isLastRowIncomplete = lastRowCount !== cols && totalCount > cols;
    const isOnlyOneInLastRow = lastRowCount === 1;

    return (
        <div className="absolute inset-0 w-full h-full bg-slate-900 overflow-hidden">
            <div
                className="w-full h-full grid gap-2 p-2"
                style={{
                    gridTemplateColumns: `repeat(${cols}, 1fr)`,
                    gridAutoRows: '1fr', // 각 셀이 남는 공간 가득 사용
                }}
            >
                {cameraTracks.map((trackRef, index) => {
                    const pub = trackRef.publication;
                    const isMuted = pub?.isMuted ?? trackRef.isMuted;
                    const videoTrack = pub?.videoTrack || pub?.track;
                    const hasVideoTrack = !!videoTrack && !isMuted;

                    const displayName = (trackRef.participant.name || trackRef.participant.identity || '?').charAt(0).toUpperCase();

                    const participant = trackRef.participant;
                    const bgUrl = typeof getFallbackBackgroundUrl === 'function' ? getFallbackBackgroundUrl(participant) : null;

                    const isInLastRow = index >= totalCount - lastRowCount;
                    const isLastItem = index === totalCount - 1;

                    // 🔹 마지막 줄 레이아웃 보정 (가득 차게 보이도록)
                    let gridColumnStyle = {};

                    if (!isMobile) {
                        // 데스크톱/태블릿에서만 가로 스판 조정
                        if (isOnlyOneInLastRow && isLastItem && cols > 1) {
                            // 마지막 줄에 1개만 있으면 가운데 2칸 정도 차지
                            const startCol = Math.max(1, Math.floor((cols - 1) / 2) + 1);
                            gridColumnStyle = {
                                gridColumn: `${startCol} / span 2`,
                            };
                        } else if (isLastRowIncomplete && isInLastRow && lastRowCount > 1) {
                            // 불완전한 마지막 줄 여러 개 → 가능한 한 균등하게 스팬
                            const spanSize = Math.floor(cols / lastRowCount);
                            const itemPosition = index - (totalCount - lastRowCount);
                            const startCol = itemPosition * spanSize + 1;
                            gridColumnStyle = {
                                gridColumn: `${startCol} / span ${spanSize}`,
                            };
                        }
                    }

                    const key = trackRef.publication?.trackSid || trackRef.participant.identity || index;

                    const isHighlighted = activeHighlight?.identity === trackRef.participant.identity;
                    const highlightClasses = getHighlightClasses(isHighlighted ? activeHighlight.category : null);

                    return (
                        <div
                            key={key}
                            className={`
                                relative w-full h-full 
                                overflow-hidden rounded-xl bg-black 
                                transition-all duration-300 
                                ${highlightClasses}
                            `}
                            style={gridColumnStyle}
                        >
                            {hasVideoTrack ? (
                                <>
                                    {!isVirtualBgActive && (
                                        <div className="absolute inset-0 z-0" style={{ margin: '-10%' }}>
                                            <VideoTrack
                                                trackRef={trackRef}
                                                style={{
                                                    width: '120%',
                                                    height: '120%',
                                                    filter: 'blur(40px) brightness(0.6)',
                                                    transform: 'scale(1.5)',
                                                    objectFit: 'cover',
                                                }}
                                            />
                                        </div>
                                    )}

                                    <div className="absolute inset-0 z-10">
                                        <ParticipantTile
                                            trackRef={trackRef}
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'cover',
                                            }}
                                        />
                                    </div>
                                </>
                            ) : (
                                <>
                                    {bgUrl ? (
                                        <>
                                            <div className="absolute inset-0 z-0">
                                                <div className="w-full h-full bg-center bg-cover" style={{ backgroundImage: `url(${bgUrl})` }} />
                                            </div>

                                            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3">
                                                <div className="w-16 h-16 rounded-full bg-black/60 text-white flex items-center justify-center text-xl font-bold">{displayName}</div>
                                                <span className="text-xs text-white/80 px-3 py-1 rounded-full bg-black/50">카메라가 꺼져 있습니다</span>
                                            </div>
                                        </>
                                    ) : (
                                        <ParticipantTile
                                            trackRef={trackRef}
                                            style={{
                                                height: '100%',
                                                width: '100%',
                                                objectFit: 'cover',
                                            }}
                                        />
                                    )}
                                </>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default CustomVideoGrid;
