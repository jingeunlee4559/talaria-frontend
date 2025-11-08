import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Lobby from './Lobby';
import CustomVideoConference from './CustomVideoUI';

const MeetingPage = () => {
    // URL 파라미터 읽기
    const [searchParams] = useSearchParams();
    const meetingId = searchParams.get('id');
    const meetingTitle = searchParams.get('title') || 'Untitled Meeting';
    const inviteCode = searchParams.get('invite');

    // 상태
    const [view, setView] = useState('lobby');
    const [meetingArgs, setMeetingArgs] = useState({
        roomName: '',
        meetingId: '',
        meetingTitle: '', // ✅ meetingTitle 추가
        identity: '',
        username: '',
    });

    // 로비 → 회의 입장
    const handleConfirmJoin = async (userName) => {
        const uniqueIdentity = `user-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

        // 방 이름 규칙: 초대코드 우선, 없으면 meeting_{id}
        const roomName = inviteCode || (meetingId ? `meeting_${meetingId}` : 'demo-room');

        setMeetingArgs({
            roomName,
            meetingId,
            meetingTitle, // ✅ meetingTitle 저장
            identity: uniqueIdentity,
            username: userName?.trim() || '참가자',
        });

        setView('meeting');
    };

    // 회의 나가기
    const handleLeaveMeeting = () => {
        try {
            window.close();
        } catch {
            setView('lobby');
        }
    };

    // 렌더링
    if (view === 'meeting') {
        return (
            <CustomVideoConference
                roomName={meetingArgs.roomName}
                meetingId={meetingArgs.meetingId}
                meetingTitle={meetingArgs.meetingTitle} // ✅ meetingTitle 전달
                identity={meetingArgs.identity}
                username={meetingArgs.username}
                onLeave={handleLeaveMeeting}
            />
        );
    }

    return <Lobby meetingTitle={meetingTitle} onJoin={handleConfirmJoin} />;
};

export default MeetingPage;