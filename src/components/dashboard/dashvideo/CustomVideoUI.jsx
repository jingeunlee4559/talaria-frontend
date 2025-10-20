import React, { useEffect, useState } from 'react';
import { RoomContext } from '@livekit/components-react';
import { Room } from 'livekit-client';
import '@livekit/components-styles';
import ConferenceUI from './ConferenceUI';
import axios from 'axios';

// 뒤 슬래시 제거 유틸
const makeBase = () => (import.meta.env.VITE_API_BASE || 'http://localhost:8080').replace(/\/+$/, '');

export default function CustomVideoConference({ roomName, identity, username, onLeave }) {
  const [room] = useState(() => new Room({ adaptiveStream: true, dynacast: true }));
  const [connected, setConnected] = useState(false);
  const [needAudioUnlock, setNeedAudioUnlock] = useState(false);

  useEffect(() => {
    const fetchTokenAndConnect = async () => {
      try {
        const url = `${makeBase()}/livekit/token`;
        const body = {
          room: roomName || 'demo-room',
          identity: identity || `user-${Math.random().toString(36).slice(2, 8)}`,
          name: (username && username.trim()) || '참가자',
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
        try { await room.startAudio(); } catch { setNeedAudioUnlock(true); }
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

  if (!connected) return <div className="text-center mt-8">🔄 회의방에 연결 중입니다...</div>;

  return (
    <RoomContext.Provider value={room}>
      {needAudioUnlock && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <button
            onClick={async () => { await room.startAudio(); setNeedAudioUnlock(false); }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            🔊 오디오 활성화
          </button>
        </div>
      )}
      <ConferenceUI room={room} onLeave={onLeave} />
    </RoomContext.Provider>
  );
}
