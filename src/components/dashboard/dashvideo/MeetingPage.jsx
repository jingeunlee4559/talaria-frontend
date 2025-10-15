import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';


import Lobby from './Lobby';
import { getLiveKitToken } from '../../../services/livekitService';
import CustomVideoConference from './CustomVideoUI';

const MeetingPage = () => {
    // 1. URL 파라미터에서 회의 ID와 제목을 가져옵니다.
    const [searchParams] = useSearchParams();
    const meetingId = searchParams.get('id');
    const meetingTitle = searchParams.get('title');

    // 2. 이 페이지 안에서만 사용할 상태들을 정의합니다.
    const [view, setView] = useState('lobby'); // 'lobby' 또는 'meeting'
    const [liveKitState, setLiveKitState] = useState({ token: null, serverUrl: null });

    // 로비에서 '참여' 버튼을 누르면 실행될 함수
const handleConfirmJoin = async (userName) => {
    if (!meetingId) return;

    try {
        // ✅ FIX: Date.now()에 랜덤 문자열을 추가하여 항상 고유한 ID를 생성합니다.
        const uniqueIdentity = `user-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

        const response = await getLiveKitToken({
            room: meetingId,
            identity: uniqueIdentity, // 생성한 고유 ID를 사용합니다.
            name: userName
        });

        setLiveKitState({ token: response.token, serverUrl: response.wsUrl });
        setView('meeting');
    } catch (error) {
        alert("회의 참여에 실패했습니다: " + error.message);
        window.close();
    }
};

    // 회의 나가기 함수 (새 창이므로 그냥 창을 닫습니다)
    const handleLeaveMeeting = () => {
        window.close();
    };

    // 3. view 상태에 따라 로비 또는 화상회의를 렌더링합니다.
    if (view === 'meeting') {
        return (
            <CustomVideoConference
                token={liveKitState.token}
                serverUrl={liveKitState.serverUrl}
                onLeave={handleLeaveMeeting}
            />
        );
    }

    // 기본 화면은 로비입니다.
    return (
        <Lobby 
            meetingTitle={meetingTitle} 
            onJoin={handleConfirmJoin} 
        />
    );
};

export default MeetingPage;