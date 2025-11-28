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

    // identity나 name에 'agent' 포함 여부 확인 (대소문자 무시)
    if (identity.toLowerCase().includes('agent') || name.toLowerCase().includes('agent')) {
        return true;
    }

    // metadata에서 확인
    try {
        const metadata = JSON.parse(participant.metadata || '{}');
        if (metadata.isAgent === true || metadata.type === 'agent') {
            return true;
        }
    } catch (e) {
        // metadata 파싱 실패 시 무시
    }

    return false;
};

function CustomVideoGrid({ virtualBgType, getFallbackBackgroundUrl, bgHighlight, docShare }) {
    const [activeHighlight, setActiveHighlight] = useState(null);

    // ✅ 다른 참가자로부터 받은 문서 포인터 상태 (호스트가 아님)
    const [remotePointer, setRemotePointer] = useState(null);

    // ✅ 문서 동기화용 데이터 채널 (LiveKit)
    //  - channel name: 'doc-sync'
    //  - msg.payload 에 우리가 보낸 객체가 그대로 들어온다고 가정 (LiveKit 문서 기준)
    const { send: sendDocSync } = useDataChannel('doc-sync', (msg) => {
        const data = msg?.payload;
        if (!data || typeof data !== 'object') return;

        // type 구분: pointer / (나중에 page 등 확장 가능)
        if (data.type === 'pointer') {
            // 호스트/뷰어 구분 없이 일단 최신 포인터로 갱신
            setRemotePointer(data);
        }
    });

    // ✅ 호스트가 포인터를 찍을 때 호출되는 브로드캐스트 함수
    const broadcastPointer = (pointerPayload) => {
        if (!sendDocSync || !pointerPayload) return;

        // pointerPayload: { side, page, xPercent, yPercent, ts }
        try {
            // 객체 그대로 보냄 → 상대방은 msg.payload 로 동일 객체 수신
            sendDocSync({
                type: 'pointer',
                ...pointerPayload,
            });
        } catch (err) {
            // 콘솔 로그만 남김 (UI 에러는 굳이 띄우지 않음)
            console.error('문서 동기화(pointer) 전송 오류:', err);
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

    // 🤖 에이전트 제외 필터링
    const screenShareTracks = tracks.filter((t) => t.source === Track.Source.ScreenShare).filter((t) => !isAgent(t.participant));
    const cameraTracks = tracks.filter((t) => t.source === Track.Source.Camera).filter((t) => !isAgent(t.participant));

    const hasScreenShare = screenShareTracks.length > 0;
    const isVirtualBgActive = virtualBgType === 'image' || virtualBgType === 'blur';

    // ======================
    // 0) 문서 공유 레이아웃 (원본/번역 2분할 + 동기 스크롤/페이지)
    // ======================
    if (docShare?.active && (docShare.originalUrl || docShare.translatedUrl)) {
        // ✅ 이 사용자가 문서 컨트롤 호스트인지 여부 (부모에서 내려줌)
        //    예: docShare.isHost === true 인 경우에만 클릭/페이지 변경을 브로드캐스트
        const isDocHost = !!docShare?.isHost;

        return (
            <div className="absolute inset-0 w-full h-full bg-slate-900 flex flex-col">
                <SyncedPdfGrid
                    originalUrl={docShare.originalUrl}
                    translatedUrl={docShare.translatedUrl}
                    originalTitle={docShare.originalTitle}
                    translatedTitle={docShare.translatedTitle}
                    // 🔹 호스트일 때만 클릭으로 포인터/페이지 전파
                    isHost={isDocHost}
                    onPointerSend={isDocHost ? broadcastPointer : undefined}
                    // 🔹 뷰어 쪽에서는 원격 포인터를 그대로 전달
                    remotePointer={!isDocHost ? remotePointer : null}
                />
            </div>
        );
    }

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

                {/* 레이어 3: 참가자 썸네일 (에이전트 제외) */}
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

    const cols = getGridCols(cameraTracks.length || 1);
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
