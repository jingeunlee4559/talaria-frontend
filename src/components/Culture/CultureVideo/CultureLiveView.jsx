// src/pages/Culture/CultureLiveView.jsx
import React, { useEffect, useState, useContext } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

import api from '../../../axios';
import CustomVideoConference from '../../dashboard/dashvideo/CustomVideoUI';
import { UserContext } from '../../../contexts/UserContext';

const CultureLiveView = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { user } = useContext(UserContext);

    const [meetingData, setMeetingData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const meetingId = searchParams.get('id');

    useEffect(() => {
        // 1) id 없음
        if (!meetingId) {
            setError('회의 ID가 없습니다.');
            setLoading(false);
            return;
        }

        const numericMeetingId = Number(meetingId);
        if (Number.isNaN(numericMeetingId)) {
            setError('잘못된 회의 ID 입니다.');
            setLoading(false);
            return;
        }

        const fetchMeetingData = async () => {
            try {
                // 2) 문화 모드 회의 목록에서 가져오기
                const response = await api.get('/api/meetings/by-mode', {
                    params: {
                        mode: 'C',
                        page: 0,
                        size: 100, // 필요에 따라 조정
                    },
                });

                // 서버 응답 구조에 따라 items 또는 content 사용
                const list = response.data.items || response.data.content || [];

                // 3) 리스트에서 해당 회의 찾기
                const meeting = list.find((m) => m.meetings_id === numericMeetingId);

                if (!meeting) {
                    setError('해당 라이브를 찾을 수 없습니다.');
                    setLoading(false);
                    return;
                }

                // 4) 모드 확인 (안전하게 한 번 더 체크)
                if (meeting.meeting_mode !== 'C') {
                    setError('이 회의는 문화 모드가 아닙니다.');
                    setLoading(false);
                    return;
                }

                // 5) 화면/영상 컴포넌트에서 쓸 데이터 세팅
                setMeetingData({
                    id: meeting.meetings_id,
                    title: meeting.title,
                    inviteCode: meeting.invite_code,
                    hostId: meeting.host_id,
                    hostName: meeting.host_name,
                    defaultLang: meeting.default_lang || 'ko',
                    status: meeting.status,
                    scheduledAt: meeting.scheduled_at,
                });

                setLoading(false);
            } catch (err) {
                console.error('회의 정보 불러오기 실패:', err);
                setError('회의 정보를 불러올 수 없습니다.');
                setLoading(false);
            }
        };

        fetchMeetingData();
    }, [meetingId]);

    const handleLeave = () => {
        navigate('/culture/videos');
    };

    // 로딩 화면
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-b from-white via-blue-50 to-blue-100">
                <div className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin shadow-md mb-6"></div>
                <h1 className="text-3xl font-extrabold text-gray-800 text-center tracking-wide animate-pulse">라이브 로딩 중</h1>
                <p className="mt-2 text-gray-500 text-center text-lg">잠시만 기다려주세요...</p>
            </div>
        );
    }

    // 에러 화면
    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
                <div className="text-red-500 text-6xl mb-4">⚠️</div>
                <h1 className="text-2xl font-bold text-gray-800 mb-2">오류 발생</h1>
                <p className="text-gray-600 mb-6">{error}</p>
                <button onClick={() => navigate('/culture/videos')} className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    목록으로 돌아가기
                </button>
            </div>
        );
    }

    // meetingData가 없으면 아무 것도 렌더링하지 않음
    if (!meetingData) {
        return null;
    }

    return (
        <div className="w-full min-h-screen bg-slate-50">
            <CustomVideoConference
                roomName={`culture-${meetingData.id}`}
                identity={user?.userId ? `user-${user.userId}` : `guest-${Date.now()}`}
                username={user?.name || user?.email || '게스트'}
                onLeave={handleLeave}
                meetingId={meetingData.id}
                meetingTitle={meetingData.title}
                isCultureMode={true}
            />
        </div>
    );
};

export default CultureLiveView;
