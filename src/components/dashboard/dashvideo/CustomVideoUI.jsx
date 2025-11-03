import React, { useContext, useEffect, useState } from 'react';
import { RoomContext } from '@livekit/components-react';
import { Room } from 'livekit-client';
import '@livekit/components-styles';
import ConferenceUI from './ConferenceUI';
import axios from 'axios';
import { UserContext } from '../../../contexts/UserContext';

// 뒤 슬래시 제거 유틸
const makeBase = () => (import.meta.env.VITE_API_BASE || 'http://localhost:8080').replace(/\/+$/, '');

export default function CustomVideoConference({ roomName, identity, username, onLeave, meetingId, meetingTitle }) {
    const [room] = useState(() => new Room({ adaptiveStream: true, dynacast: true }));
    const [connected, setConnected] = useState(false);
    const [needAudioUnlock, setNeedAudioUnlock] = useState(false);
    const { user } = useContext(UserContext);

    useEffect(() => {
        const fetchTokenAndConnect = async () => {
            try {
                const url = `${makeBase()}/livekit/token`;
                const body = {
                    room: roomName || 'demo-room',
                    meetingId: meetingId,
                    identity: identity || `user-${Math.random().toString(36).slice(2, 8)}`,
                    name: (username && username.trim()) || '참가자',
                    hostId: user.userId,
                    ttlSec: 60,
                };
                console.log('🎯 요청 전송:', url, body);

                const { data } = await axios.post(url, body);
                const { wsUrl, token } = data || {};
                if (!wsUrl || !token) {
                    console.error('❌ wsUrl/token 누락:', data);
                    return;
                }

                await room.connect(wsUrl, token);
                try {
                    await room.startAudio();
                } catch {
                    setNeedAudioUnlock(true);
                }
                console.log('✅ LiveKit 연결 성공');
                setConnected(true);
            } catch (error) {
                console.error('❌ LiveKit connection failed:', error);
            }
        };

        fetchTokenAndConnect();
        return () => {
            room.disconnect();
            console.log('--- Disconnected from LiveKit ---');
        };
        // room 인스턴스는 생성 후 고정
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [roomName, identity, username]);
    if (!connected)
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-b from-white via-blue-50 to-blue-100 px-4">
                {/* 로딩 원 - 부드러운 회전 + 그림자 */}
                <div className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin shadow-md mb-6"></div>

                {/* 메인 텍스트 - 부드러운 애니메이션 + 세련된 폰트 */}
                <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800 text-center tracking-wide animate-pulse">회의방 연결 중</h1>

                {/* 보조 텍스트 */}
                <p className="mt-2 text-gray-500 text-center text-lg sm:text-xl">잠시만 기다려주세요...</p>

                {/* 점 애니메이션 - 부드러운 bounce */}
                <div className="flex space-x-2 mt-6">
                    <span className="w-3 h-3 bg-blue-500 rounded-full animate-bounce delay-0"></span>
                    <span className="w-3 h-3 bg-blue-500 rounded-full animate-bounce delay-200"></span>
                    <span className="w-3 h-3 bg-blue-500 rounded-full animate-bounce delay-400"></span>
                </div>
            </div>
        );

    return (
        <RoomContext.Provider value={room}>
            {needAudioUnlock && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <button
                        onClick={async () => {
                            await room.startAudio();
                            setNeedAudioUnlock(false);
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                    >
                        🔊 오디오 활성화
                    </button>
                </div>
            )}
            <ConferenceUI room={room} onLeave={onLeave} meetingTitle={meetingTitle} />
        </RoomContext.Provider>
    );
}
