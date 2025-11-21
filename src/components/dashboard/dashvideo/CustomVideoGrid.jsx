// src/components/dashboard/dashvideo/CustomVideoGrid.jsx
import React, { useEffect, useState } from 'react';
import { useTracks, ParticipantTile, VideoTrack } from '@livekit/components-react';
import { Track } from 'livekit-client';

function CustomVideoGrid({ virtualBgType, getFallbackBackgroundUrl, bgHighlight }) {
    const [activeHighlight, setActiveHighlight] = useState(null);

    // 하이라이트 유지 시간 (짧게 0.3초 정도)
    useEffect(() => {
        if (!bgHighlight) return;

        setActiveHighlight(bgHighlight);

        const timer = setTimeout(() => {
            setActiveHighlight(null);
        }, 320);

        return () => clearTimeout(timer);
    }, [bgHighlight?.token]);

    // 카테고리별 하이라이트 스타일
    const getHighlightClasses = (category) => {
        switch (category) {
            case 'basic':
                // 기본: 파란 계열, 안정적인 느낌
                return 'ring-4 ring-blue-400 shadow-[0_0_24px_rgba(96,165,250,0.9)] scale-[1.02]';
            case 'culture':
                // 문화: 핑크/보라, K-컬처/네온 감성
                return 'ring-4 ring-pink-400 shadow-[0_0_28px_rgba(236,72,153,0.95)] scale-[1.03]';
            case 'special':
                // 특별: 노랑/오렌지, 이벤트/파티 느낌
                return 'ring-4 ring-amber-300 shadow-[0_0_32px_rgba(252,211,77,1)] scale-[1.035]';
            case 'season':
                // 계절: 에메랄드/그린, 자연/계절감
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

    const screenShareTracks = tracks.filter((t) => t.source === Track.Source.ScreenShare);
    const cameraTracks = tracks.filter((t) => t.source === Track.Source.Camera);
    const hasScreenShare = screenShareTracks.length > 0;

    // 🔥 현재 선택된 프리셋이 image/blur 이면, 가상 배경 활성화 모드
    const isVirtualBgActive = virtualBgType === 'image' || virtualBgType === 'blur';

    // ======================
    // 1) 화면 공유 레이아웃
    // ======================
    if (hasScreenShare) {
        const shareTrackRef = screenShareTracks[0];

        return (
            <div className="absolute inset-0 w-full h-full overflow-hidden bg-black">
                {/* 레이어 1: 흐릿한 전체 배경 */}
                <div className="absolute inset-0 z-10" style={{ margin: '-10%' }}>
                    <VideoTrack
                        trackRef={shareTrackRef}
                        // objectFit="cover"
                        style={{
                            width: '120%',
                            height: '120%',
                            filter: 'blur(50px) brightness(0.7)',
                            transform: 'scale(1.5)',
                            objectFit: 'cover',
                        }}
                    />
                </div>

                {/* 레이어 2: 선명한 원본 화면공유 */}
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

                {/* 레이어 3: 참가자 썸네일 */}
                {cameraTracks.length > 0 && (
                    <div className="absolute top-4 right-4 z-40 pointer-events-none max-h-[calc(100vh-200px)] overflow-y-auto">
                        <div className="flex flex-col gap-2 pointer-events-auto">
                            {cameraTracks.map((trackRef) => (
                                <div
                                    key={trackRef.participant.identity}
                                    className="w-32 h-24 flex-shrink-0 rounded-lg overflow-hidden shadow-2xl border-2 border-white/50 bg-slate-800 hover:border-white/70 transition-all hover:scale-105"
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
    // 2) 일반 카메라 그리드 레이아웃
    // ======================
    const getGridCols = (count) => {
        if (count === 1) return 1;
        if (count === 2) return 2;
        if (count <= 4) return 2;
        if (count <= 6) return 3;
        return Math.ceil(Math.sqrt(count));
    };

    const cols = getGridCols(cameraTracks.length || 1); // 최소 1
    const totalCount = cameraTracks.length;
    const lastRowCount = totalCount % cols || cols;
    const isLastRowIncomplete = lastRowCount !== cols && totalCount > cols;
    const isOnlyOneInLastRow = lastRowCount === 1;

    return (
        <div className="absolute inset-0 w-full h-full bg-slate-900">
            <div
                className="w-full h-full grid gap-2 p-2"
                style={{
                    gridTemplateColumns: `repeat(${cols}, 1fr)`,
                    // 🔥 각 row 높이를 균일하게(비디오 비율에 안 끌리게)
                    gridAutoRows: '1fr',
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

                    let gridColumnStyle = {};

                    // 마지막 줄에 1명만 있으면 가운데 정렬
                    if (isOnlyOneInLastRow && isLastItem && cols > 1) {
                        const startCol = Math.max(1, Math.floor((cols - 1) / 2) + 1);
                        gridColumnStyle = {
                            gridColumn: `${startCol} / span 2`,
                        };
                    } else if (isLastRowIncomplete && isInLastRow && lastRowCount > 1) {
                        const spanSize = Math.floor(cols / lastRowCount);
                        const itemPosition = index - (totalCount - lastRowCount);
                        const startCol = itemPosition * spanSize + 1;
                        gridColumnStyle = {
                            gridColumn: `${startCol} / span ${spanSize}`,
                        };
                    }

                    const key = trackRef.publication?.trackSid || trackRef.participant.identity || index;

                    const isHighlighted = activeHighlight?.identity === trackRef.participant.identity;
                    const highlightClasses = getHighlightClasses(isHighlighted ? activeHighlight.category : null);

                    return (
                        <div key={key} className={`relative w-full h-full overflow-hidden rounded-lg bg-black transition-all duration-300 ${highlightClasses}`} style={gridColumnStyle}>
                            {hasVideoTrack ? (
                                <>
                                    {/* 비가상배경일 때만 블러 레이어 추가 */}
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

                                    {/* 🔥 항상 타일을 꽉 채우도록 cover 사용 */}
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
                                // ❗ 카메라 OFF
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
