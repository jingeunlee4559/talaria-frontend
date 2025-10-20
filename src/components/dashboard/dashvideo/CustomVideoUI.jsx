import React, { useEffect, useState } from 'react';
import { RoomContext } from '@livekit/components-react';
import { Room } from 'livekit-client';
import '@livekit/components-styles';
import ConferenceUI from './ConferenceUI';
import axios from 'axios';

// ✅ 이 컴포넌트는 이제 LiveKit 토큰을 직접 요청 → 연결까지 담당
const CustomVideoConference = ({ roomName, identity, userName, onLeave }) => {
  const [room] = useState(() => new Room({ adaptiveStream: true, dynacast: true }));
  const [connected, setConnected] = useState(false);

  // ✅ LiveKit 토큰 요청 → wsUrl, token 수신
  const fetchTokenAndConnect = async () => {
    try {
      console.log("🎯 요청 전송: /livekit/token");
      const res = await axios.post(`${import.meta.env.VITE_API_BASE}/livekit/token`, {
        room: roomName || 'demo-room',
        identity: identity || 'guest-' + Math.floor(Math.random() * 1000),
        name: userName || '참가자',
        ttlSec: 600,
      });

      const { wsUrl, token } = res.data;
      console.log("✅ 토큰 수신 완료:", wsUrl);

      if (!wsUrl || !token) {
        console.error("❌ wsUrl/token 누락:", res.data);
        return;
      }

      await room.connect(wsUrl, token);
      console.log('✅ LiveKit 연결 성공');
      setConnected(true);
    } catch (error) {
      console.error('❌ LiveKit connection failed:', error);
    }
  };

  // ✅ 스타일 로드
  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdn.jsdelivr.net/npm/@livekit/components-styles@1.1.6/dist/style.css';
    document.head.appendChild(link);
    return () => {
      if (document.head.contains(link)) document.head.removeChild(link);
    };
  }, []);

  // ✅ 최초 마운트 시 토큰 요청 & 연결 시도
  useEffect(() => {
    fetchTokenAndConnect();

    return () => {
      room.disconnect();
      console.log('--- Disconnected from LiveKit ---');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!connected) return <div className="text-center mt-8">🔄 회의방에 연결 중입니다...</div>;

  // ✅ 연결 완료 시 실제 회의 UI 렌더링
  return (
    <RoomContext.Provider value={room}>
      <ConferenceUI room={room} onLeave={onLeave} />
    </RoomContext.Provider>
  );
};

export default CustomVideoConference;
