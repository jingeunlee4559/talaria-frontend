import React, { useContext, useEffect, useState } from 'react';
import { RoomContext } from '@livekit/components-react';
import { Room } from 'livekit-client';
import '@livekit/components-styles';
import ConferenceUI from './ConferenceUI';
import api from '../../../axios';
import { UserContext } from '../../../contexts/UserContext';
import CultureConferenceUI from '../../Culture/CultureVideo/CultureConferenceUI';

export default function CustomVideoConference({
    roomName,
    identity,
    username,
    onLeave,
    meetingId,
    meetingTitle,
    meetingDesc,
    isCultureMode = false,
    onConnected, // 🔥 새로운 prop
}) {
    const [room] = useState(() => new Room({ adaptiveStream: true, dynacast: true }));
    const [connected, setConnected] = useState(false);
    const [needAudioUnlock, setNeedAudioUnlock] = useState(false);
    const [userLocale, setUserLocale] = useState('ko-KR');
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

                // 사용자 locale 저장 (백엔드에서 받은 값 우선)
                if (receivedLocale && receivedLocale.trim()) {
                    setUserLocale(receivedLocale);
                    console.log('🌍 User locale from backend:', receivedLocale);
                } else if (user?.locale) {
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

                // 🔥 부모 컴포넌트에 연결 완료 알림
                if (onConnected) {
                    onConnected();
                }
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
    }, [roomName, identity, username, user, room, meetingId]); // 🔥 onConnected 제거

    // 🎯 문화 모드: 부모의 K-밈 로딩 화면 유지
    if (!connected && isCultureMode) {
        return null;
    }

    // 💼 비즈니스 모드: 전문적인 로딩 화면
    if (!connected && !isCultureMode) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 px-4">
                {/* 로딩 스피너 */}
                <div className="relative mb-8">
                    {/* 외부 회전 링 */}
                    <div className="w-24 h-24 sm:w-32 sm:h-32 border-8 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>

                    {/* 중앙 아이콘 */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-4xl sm:text-5xl animate-pulse">💼</div>
                    </div>
                </div>

                {/* 로딩 텍스트 */}
                <div className="text-center space-y-4">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800">회의실 연결 중</h1>

                    {/* 진행 점 */}
                    <div className="flex items-center justify-center gap-2">
                        <div className="w-2.5 h-2.5 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                        <div className="w-2.5 h-2.5 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                        <div className="w-2.5 h-2.5 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                    </div>

                    <p className="text-base sm:text-lg text-gray-600">실시간 통역 시스템을 준비하고 있습니다</p>
                </div>

                {/* 정보 카드 */}
                <div className="mt-10 bg-white rounded-xl shadow-lg px-6 py-4 border border-gray-200 max-w-md mx-auto">
                    <div className="flex items-start gap-3">
                        <span className="text-2xl flex-shrink-0">ℹ️</span>
                        <div className="text-left">
                            <p className="text-sm font-semibold text-gray-800 mb-1">연결 팁</p>
                            <p className="text-xs text-gray-600 leading-relaxed">화상회의 품질을 위해 안정적인 인터넷 연결을 권장합니다</p>
                        </div>
                    </div>
                </div>

                {/* 하단 프로그레스 바 효과 */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200">
                    <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 animate-progress"></div>
                </div>

                <style>{`
                    @keyframes progress {
                        0% { width: 0%; }
                        100% { width: 100%; }
                    }
                    .animate-progress {
                        animation: progress 2s ease-in-out infinite;
                    }
                `}</style>
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
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-lg"
                    >
                        🔊 오디오 활성화
                    </button>
                </div>
            )}
            {isCultureMode ? (
                <CultureConferenceUI onLeave={onLeave} meetingTitle={meetingTitle} userLocale={userLocale} meetingDesc={meetingDesc} />
            ) : (
                <ConferenceUI onLeave={onLeave} meetingTitle={meetingTitle} userLocale={userLocale} />
            )}
        </RoomContext.Provider>
    );
}
