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
                const response = await api.get('/api/meetings/by-mode', {
                    params: {
                        mode: 'C',
                        page: 0,
                        size: 100,
                    },
                });

                const list = response.data.items || response.data.content || [];
                const meeting = list.find((m) => m.meetings_id === numericMeetingId);

                if (!meeting) {
                    setError('해당 라이브를 찾을 수 없습니다.');
                    setLoading(false);
                    return;
                }

                if (meeting.meeting_mode !== 'C') {
                    setError('이 회의는 문화 모드가 아닙니다.');
                    setLoading(false);
                    return;
                }

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

    // 🎯 로딩 화면 - 반응형 개선
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-b from-white via-blue-50 to-blue-100 px-4">
                <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin shadow-md mb-4 sm:mb-6"></div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-800 text-center tracking-wide animate-pulse">라이브 로딩 중</h1>
                <p className="mt-2 text-gray-500 text-center text-base sm:text-lg">잠시만 기다려주세요...</p>
            </div>
        );
    }

    // 🎯 에러 화면 - 반응형 개선
    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-gray-50 px-4">
                <div className="text-red-500 text-5xl sm:text-6xl mb-4">⚠️</div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2 text-center">오류 발생</h1>
                <p className="text-gray-600 mb-4 sm:mb-6 text-center text-sm sm:text-base">{error}</p>
                <button onClick={() => navigate('/culture/videos')} className="px-4 sm:px-6 py-2.5 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base">
                    목록으로 돌아가기
                </button>
            </div>
        );
    }

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
