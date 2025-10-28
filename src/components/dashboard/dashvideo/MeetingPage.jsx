import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Lobby from './Lobby';
import CustomVideoConference from './CustomVideoUI'; // 토큰은 내부에서 직접 요청/연결

const MeetingPage = () => {
    // ✅ URL 파라미터 읽기
    const [searchParams] = useSearchParams();
    const meetingId = searchParams.get('id'); // ✅ PK
    const meetingTitle = searchParams.get('title') || 'Untitled Meeting';
    const inviteCode = searchParams.get('invite'); // ✅ 초대코드

    // ✅ 상태
    const [view, setView] = useState('lobby');
    const [meetingArgs, setMeetingArgs] = useState({
        roomName: '',
        meetingId: '',
        identity: '',
        username: '',
    });

    // ✅ 로비 → 회의 입장
    const handleConfirmJoin = async (userName) => {
        const uniqueIdentity = `user-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

        // ✅ 방 이름 규칙: 초대코드 우선, 없으면 meeting_{id}
        const roomName = inviteCode || (meetingId ? `meeting_${meetingId}` : 'demo-room');

        setMeetingArgs({
            roomName,
            meetingId,
            identity: uniqueIdentity,
            username: userName?.trim() || '참가자',
        });

        setView('meeting');
    };

    // ✅ 회의 나가기
    const handleLeaveMeeting = () => {
        try {
            window.close();
        } catch {
            setView('lobby');
        }
    };

    // ✅ 렌더링
    if (view === 'meeting') {
        return <CustomVideoConference roomName={meetingArgs.roomName} meetingId={meetingArgs.meetingId} identity={meetingArgs.identity} username={meetingArgs.username} onLeave={handleLeaveMeeting} />;
    }

    return <Lobby meetingTitle={meetingTitle} onJoin={handleConfirmJoin} />;
};

export default MeetingPage;
