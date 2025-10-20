import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Lobby from './Lobby';
import CustomVideoConference from './CustomVideoUI'; // 토큰은 내부에서 직접 요청/연결

const MeetingPage = () => {
    // URL 파라미터
    const [searchParams] = useSearchParams();
    const meetingId = searchParams.get('id') || 'demo-room';
    const meetingTitle = searchParams.get('title') || 'Untitled Meeting';

    // 화면 상태 & 회의 인자
    const [view, setView] = useState('lobby'); // 'lobby' | 'meeting'
    const [meetingArgs, setMeetingArgs] = useState({ roomName: '', identity: '', username: '' });

    // 로비 → 회의 입장
    const handleConfirmJoin = async (userName) => {
        const uniqueIdentity = `user-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        setMeetingArgs({
            roomName: meetingId,
            identity: uniqueIdentity,
            username: (userName && userName.trim()) || '참가자',
        });
        setView('meeting');
    };

    // 회의 나가기
    const handleLeaveMeeting = () => {
        try {
            window.close(); // 새 창일 경우
        } catch {}
        setView('lobby'); // 새 창이 아닐 경우
    };

    // 렌더링
    if (view === 'meeting') {
        return <CustomVideoConference roomName={meetingArgs.roomName} identity={meetingArgs.identity} username={meetingArgs.username} onLeave={handleLeaveMeeting} />;
    }

    return <Lobby meetingTitle={meetingTitle} onJoin={handleConfirmJoin} />;
};

export default MeetingPage;
