// ☢️ 수정: ParticipantTile 외에 'VideoTrack'을 추가로 import 합니다.
import { useTracks, GridLayout, ParticipantTile, VideoTrack } from '@livekit/components-react';
import { Track } from 'livekit-client';

function CustomVideoGrid() {
    const tracks = useTracks(
        [
            { source: Track.Source.Camera, withPlaceholder: true },
            { source: Track.Source.ScreenShare, withPlaceholder: false },
        ],
        { onlySubscribed: false },
    );

    const screenShareTracks = tracks.filter((trackRef) => trackRef.source === Track.Source.ScreenShare);
    const cameraTracks = tracks.filter((trackRef) => trackRef.source === Track.Source.Camera);
    const hasScreenShare = screenShareTracks.length > 0;

    // 화면 공유가 있을 때
    if (hasScreenShare) {
        console.log('🖥️ Screen share detected - using VideoTrack 2-layer layout');

        return (
            <div className="absolute inset-0 w-full h-full overflow-hidden" style={{ backgroundColor: '#000' }}>
                {/* 레이어 1: 흐릿한 배경 (cover로 꽉 채움) - 검정 여백 완전 제거 */}
                <div className="absolute inset-0 z-10" style={{ margin: '-10%' }}>
                    <VideoTrack
                        trackRef={screenShareTracks[0]}
                        objectFit="cover"
                        style={{
                            width: '120%',
                            height: '120%',
                            filter: 'blur(50px) brightness(0.7)',
                            transform: 'scale(1.5)',
                        }}
                    />
                </div>

                {/* 레이어 2: 선명한 원본 (contain으로 비율 유지) */}
                <div className="absolute inset-0 z-20 flex items-center justify-center">
                    <VideoTrack
                        trackRef={screenShareTracks[0]}
                        objectFit="contain"
                        style={{
                            width: '100%',
                            height: '100%',
                        }}
                    />
                </div>

                {/* 레이어 3: 참가자 썸네일 - 오른쪽 상단으로 이동 */}
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
                                        objectFit="cover"
                                        style={{
                                            height: '100%',
                                            width: '100%',
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

    // 화면 공유가 없을 때 - 커스텀 그리드로 blur 배경 적용
    console.log('👥 No screen share - using custom grid with blur backgrounds');

    // 그리드 레이아웃 계산
    const getGridCols = (count) => {
        if (count === 1) return 1;
        if (count === 2) return 2;
        if (count <= 4) return 2;
        if (count <= 6) return 3;
        return Math.ceil(Math.sqrt(count));
    };

    const cols = getGridCols(cameraTracks.length);
    const totalCount = cameraTracks.length;
    const lastRowCount = totalCount % cols || cols; // 마지막 행의 아이템 개수
    const isLastRowIncomplete = lastRowCount !== cols && totalCount > cols; // 마지막 행이 불완전한지
    const isOnlyOneInLastRow = lastRowCount === 1; // 마지막 행에 1개만 있는지

    return (
        <div className="absolute inset-0 w-full h-full" style={{ backgroundColor: '#1e293b' }}>
            <div
                className="w-full h-full grid gap-2 p-2"
                style={{
                    gridTemplateColumns: `repeat(${cols}, 1fr)`,
                }}
            >
                {cameraTracks.map((trackRef, index) => {
                    const isInLastRow = index >= totalCount - lastRowCount;
                    const isLastItem = index === totalCount - 1;

                    let gridColumnStyle = {};

                    // 🎯 마지막 행에 1개만 있으면 → 2칸 차지 (중앙)
                    if (isOnlyOneInLastRow && isLastItem) {
                        const startCol = Math.max(1, Math.floor((cols - 1) / 2) + 1);
                        gridColumnStyle = {
                            gridColumn: `${startCol} / span 2`,
                        };
                        console.log(`📏 Last item spanning 2 cols: ${startCol} / span 2`);
                    }
                    // 마지막 행에 여러 개 → 각각 더 넓게 span
                    else if (isLastRowIncomplete && isInLastRow && lastRowCount > 1) {
                        const spanSize = Math.floor(cols / lastRowCount);
                        const itemPosition = index - (totalCount - lastRowCount);
                        const startCol = itemPosition * spanSize + 1;
                        gridColumnStyle = {
                            gridColumn: `${startCol} / span ${spanSize}`,
                        };
                        console.log(`📏 Item ${index} in last row: ${startCol} / span ${spanSize}`);
                    }

                    return (
                        <div key={trackRef.participant.identity} className="relative w-full h-full overflow-hidden rounded-lg" style={gridColumnStyle}>
                            {/* Blur 배경 레이어 - 더 크게 확대 */}
                            <div className="absolute inset-0 z-0" style={{ margin: '-10%' }}>
                                <VideoTrack
                                    trackRef={trackRef}
                                    objectFit="cover"
                                    style={{
                                        width: '120%',
                                        height: '120%',
                                        filter: 'blur(40px) brightness(0.6)',
                                        transform: 'scale(1.5)',
                                    }}
                                />
                            </div>

                            {/* 선명한 원본 레이어 */}
                            <div className="absolute inset-0 z-10 flex items-center justify-center">
                                <ParticipantTile
                                    trackRef={trackRef}
                                    objectFit="contain"
                                    style={{
                                        height: '100%',
                                        width: '100%',
                                    }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default CustomVideoGrid;
