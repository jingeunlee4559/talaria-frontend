// src/hooks/useVirtualBackground.js
import { useEffect, useRef } from 'react';
import { useRoomContext } from '@livekit/components-react';
import { RoomEvent, Track } from 'livekit-client';
import { BackgroundProcessor, supportsBackgroundProcessors } from '@livekit/track-processors';

/**
 * effectConfig 예시
 * { id: 'none',  type: 'none' }
 * { id: 'korean-room', type: 'image', imageUrl: 'https://...' }
 * { id: 'soft-blur',   type: 'blur',  blurRadius: 18 }
 */

// 🔹 로컬 참가자의 카메라 트랙 publication 찾기
function getLocalCameraPublication(room) {
    if (!room || !room.localParticipant) return undefined;
    const lp = room.localParticipant;

    // 1) getTrackPublication(Track.Source.Camera) 지원하는 경우
    if (typeof lp.getTrackPublication === 'function') {
        try {
            const pub = lp.getTrackPublication(Track.Source.Camera);
            if (pub) return pub;
        } catch (e) {
            console.warn('getTrackPublication(Camera) 사용 중 오류:', e);
        }
    }

    // 2) trackPublications(Map) / tracks(Array) 에서 source === Camera 인 것 찾기
    const pubsMapOrArray = lp.trackPublications || lp.tracks || lp.videoTracks;
    if (!pubsMapOrArray) return undefined;

    const pubs = Array.isArray(pubsMapOrArray) ? pubsMapOrArray : Array.from(pubsMapOrArray.values());
    return pubs.find((p) => p.source === Track.Source.Camera);
}

// 🔹 현재 effectConfig 를 기준으로 virtual background 적용
async function applyVirtualBackground(room, effectConfig) {
    if (!room) return;

    const pub = getLocalCameraPublication(room);
    const videoTrack = pub?.videoTrack ?? pub?.track;
    if (!videoTrack) {
        console.log('🎥 로컬 카메라 트랙을 찾지 못했습니다. (아직 카메라 OFF 상태일 수 있음)');
        return;
    }

    try {
        // 1) 효과 없음 (원본 그대로)
        if (!effectConfig || effectConfig.type === 'none') {
            if (typeof videoTrack.stopProcessor === 'function') {
                await videoTrack.stopProcessor();
            } else if (typeof videoTrack.setProcessor === 'function') {
                await videoTrack.setProcessor(undefined);
            }
            console.log('🎛 Virtual BG: disabled (원본 그대로)');
            return;
        }

        // 2) 현재 config 에 맞는 BackgroundProcessor 생성
        let processorConfig;

        if (effectConfig.type === 'image' && effectConfig.imageUrl) {
            processorConfig = {
                mode: 'virtual-background',
                imagePath: effectConfig.imageUrl,
            };
        } else if (effectConfig.type === 'blur') {
            processorConfig = {
                mode: 'background-blur',
                blurRadius: effectConfig.blurRadius ?? 18,
            };
        } else {
            // 방어 코드 – 잘못된 타입이면 비활성화
            if (typeof videoTrack.stopProcessor === 'function') {
                await videoTrack.stopProcessor();
            } else if (typeof videoTrack.setProcessor === 'function') {
                await videoTrack.setProcessor(undefined);
            }
            console.log('🎛 Virtual BG: unknown type → disabled');
            return;
        }

        const processor = BackgroundProcessor(processorConfig);
        await videoTrack.setProcessor(processor);
        console.log('🎛 Virtual BG 적용:', processorConfig);
    } catch (e) {
        console.error('virtual background 적용 에러:', e);
    }
}

export function useVirtualBackground(effectConfig) {
    const room = useRoomContext();
    const latestConfigRef = useRef(effectConfig);

    // ✅ 항상 최신 effectConfig를 ref에 저장
    useEffect(() => {
        latestConfigRef.current = effectConfig;
    }, [effectConfig?.id, effectConfig?.type, effectConfig?.imageUrl, effectConfig?.blurRadius]);

    // ✅ 1) effectConfig 바뀔 때마다 현재 카메라 트랙에 다시 적용
    useEffect(() => {
        if (!room) return;
        if (!supportsBackgroundProcessors()) {
            console.warn('이 브라우저는 LiveKit background processor를 지원하지 않습니다.');
            return;
        }

        let cancelled = false;

        (async () => {
            try {
                await applyVirtualBackground(room, effectConfig);
            } catch (e) {
                if (!cancelled) {
                    console.error('virtual background setup 실패:', e);
                }
            }
        })();

        // cleanup 시에는 효과 해제 (원본으로)
        return () => {
            cancelled = true;
            (async () => {
                try {
                    await applyVirtualBackground(room, { type: 'none' });
                } catch {
                    // 무시
                }
            })();
        };
    }, [room, effectConfig?.id, effectConfig?.type, effectConfig?.imageUrl, effectConfig?.blurRadius]);

    // ✅ 2) 카메라 트랙이 새로 publish 될 때(사용자가 카메라 ON) 현재 설정 다시 적용
    useEffect(() => {
        if (!room) return;
        if (!supportsBackgroundProcessors()) return;

        const handleLocalTrackPublished = async (publication) => {
            if (publication.source !== Track.Source.Camera) return;

            try {
                await applyVirtualBackground(room, latestConfigRef.current);
            } catch (e) {
                console.error('virtual background LocalTrackPublished 적용 에러:', e);
            }
        };

        room.on(RoomEvent.LocalTrackPublished, handleLocalTrackPublished);

        return () => {
            room.off(RoomEvent.LocalTrackPublished, handleLocalTrackPublished);
        };
    }, [room]);
}
