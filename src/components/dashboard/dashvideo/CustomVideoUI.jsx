import React, { useContext, useEffect, useState } from 'react';
import { RoomContext } from '@livekit/components-react';
import { Room } from 'livekit-client';
import '@livekit/components-styles';
import ConferenceUI from './ConferenceUI';
import api from '../../../axios';
import { UserContext } from '../../../contexts/UserContext';
import CultureConferenceUI from '../../Culture/CultureVideo/CultureConferenceUI';

export default function CustomVideoConference({ roomName, identity, username, onLeave, meetingId, meetingTitle, isCultureMode = false }) {
    const [room] = useState(() => new Room({ adaptiveStream: true, dynacast: true }));
    const [connected, setConnected] = useState(false);
    const [needAudioUnlock, setNeedAudioUnlock] = useState(false);
    const [userLocale, setUserLocale] = useState('ko-KR'); // 🔥 기본값을 ko-KR로
    const { user } = useContext(UserContext);

    useEffect(() => {
        const fetchTokenAndConnect = async () => {
            try {
                const url = `/livekit/token`;
                const body = {
                    room: roomName || 'demo-room',
                    meetingId: meetingId,
                    identity: identity || `user-${Math.random().toString(36).slice(2, 8)}`,
                    name: (username && username.trim()) || '참가자',
                    hostId: user?.userId || 1,
                    userId: user?.userId || 1,
                    ttlSec: 60,
                };

                console.log('🎯 LiveKit 토큰 요청:', url, body);

                const { data } = await api.post(url, body);

                console.log('✅ LiveKit 토큰 응답:', {
                    wsUrl: data.wsUrl,
                    room: data.room,
                    identity: data.identity,
                    userLocale: data.userLocale,
                });

                const { wsUrl, token, userLocale: receivedLocale } = data || {};

                if (!wsUrl || !token) {
                    console.error('❌ wsUrl/token 누락:', data);
                    return;
                }

                // 🔥 사용자 locale 저장 (백엔드에서 받은 값 우선)
                if (receivedLocale && receivedLocale.trim()) {
                    setUserLocale(receivedLocale);
                    console.log('🌍 User locale from backend:', receivedLocale);
                } else if (user?.locale) {
                    // 백엔드에서 안 오면 UserContext에서
                    setUserLocale(user.locale);
                    console.log('🌍 User locale from context:', user.locale);
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
                console.error('Error details:', {
                    message: error.message,
                    response: error.response?.data,
                    status: error.response?.status,
                });
            }
        };

        fetchTokenAndConnect();

        return () => {
            room.disconnect();
            console.log('--- Disconnected from LiveKit ---');
        };
    }, [roomName, identity, username, user, room, meetingId]);

    if (!connected) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-b from-white via-blue-50 to-blue-100 px-4">
                <div className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin shadow-md mb-6"></div>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800 text-center tracking-wide animate-pulse">회의방 연결 중</h1>
                <p className="mt-2 text-gray-500 text-center text-lg sm:text-xl">잠시만 기다려주세요...</p>
                <div className="flex space-x-2 mt-6">
                    <span className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></span>
                    <span className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                    <span className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                </div>
            </div>
        );
    }

    return (
        <RoomContext.Provider value={room}>
            {needAudioUnlock && (
                <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50">
                    <button
                        onClick={async () => {
                            await room.startAudio();
                            setNeedAudioUnlock(false);
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        🔊 오디오 활성화
                    </button>
                </div>
            )}
            {isCultureMode ? (
                <CultureConferenceUI onLeave={onLeave} meetingTitle={meetingTitle} userLocale={userLocale} />
            ) : (
                <ConferenceUI onLeave={onLeave} meetingTitle={meetingTitle} userLocale={userLocale} />
            )}
        </RoomContext.Provider>
    );
}
