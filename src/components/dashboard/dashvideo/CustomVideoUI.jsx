import React, { useEffect, useState } from 'react';
import {
  RoomContext,
} from '@livekit/components-react';
import { Room, Track } from 'livekit-client';
import '@livekit/components-styles';
import ConferenceUI from './ConferenceUI';


// ✅ FIX 2: 부모 컴포넌트는 이제 Room 생성, 연결, Provider 제공 역할만 합니다.
const CustomVideoConference = ({ token, serverUrl, onLeave }) => {
  const [room] = useState(() => new Room({ adaptiveStream: true, dynacast: true }));

  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdn.jsdelivr.net/npm/@livekit/components-styles@1.1.6/dist/style.css';
    document.head.appendChild(link);
    return () => {
      if (document.head.contains(link)) document.head.removeChild(link);
    };
  }, []);

  useEffect(() => {
    if (!token || !serverUrl) return;

    const connectToRoom = async () => {
      try {
        await room.connect(serverUrl, token);
        console.log('✅ Successfully connected!');
      } catch (error) {
        console.error('❌ LiveKit connection failed:', error);
      }
    };

    connectToRoom();

    return () => {
      room.disconnect();
      console.log('--- Disconnected ---');
    };
  }, [room, serverUrl, token]);
  
  return (
    <RoomContext.Provider value={room}>
      <ConferenceUI room={room} onLeave={onLeave} />
    </RoomContext.Provider>
  );
};

export default CustomVideoConference;
