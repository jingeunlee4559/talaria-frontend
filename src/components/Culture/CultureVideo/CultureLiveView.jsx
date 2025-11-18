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
    const [videoConnected, setVideoConnected] = useState(false);

    const meetingId = searchParams.get('id');

    // 🔥 useCallback으로 함수를 메모이제이션
    const handleVideoConnected = React.useCallback(() => {
        console.log('✅ 비디오 연결 완료! videoConnected를 true로 변경');
        setVideoConnected(true);
    }, []);

    // 🔥 디버깅용 로그
    useEffect(() => {
        console.log('📊 CultureLiveView 상태:', { loading, videoConnected, hasMeetingData: !!meetingData });
    }, [loading, videoConnected, meetingData]);

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
                    cultureDesc: meeting.culture_desc,
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

    console.log(meetingData, 'SDfdsfsdfdsfds');

    // 🎯 K-밈 로딩 화면 (meetingData 로딩 중에만 표시)
    if (loading) {
        return (
            <div className="relative flex flex-col items-center justify-center h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 overflow-hidden px-4">
                {/* 배경 패턴 */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-10 left-10 text-6xl animate-float" style={{ animationDelay: '0s' }}>
                        🌸
                    </div>
                    <div className="absolute top-20 right-20 text-5xl animate-float" style={{ animationDelay: '0.5s' }}>
                        🎌
                    </div>
                    <div className="absolute bottom-20 left-20 text-5xl animate-float" style={{ animationDelay: '1s' }}>
                        🏯
                    </div>
                    <div className="absolute bottom-10 right-10 text-6xl animate-float" style={{ animationDelay: '1.5s' }}>
                        💖
                    </div>
                    <div className="absolute top-1/2 left-1/4 text-4xl animate-float" style={{ animationDelay: '0.8s' }}>
                        ✨
                    </div>
                    <div className="absolute top-1/3 right-1/3 text-4xl animate-float" style={{ animationDelay: '1.2s' }}>
                        🎊
                    </div>
                </div>

                {/* 메인 로딩 컨텐츠 */}
                <div className="relative z-10 text-center">
                    {/* 한국 태극 무늬 스피너 */}
                    <div className="relative mb-8">
                        {/* 외부 원 */}
                        <div className="w-32 h-32 sm:w-40 sm:h-40 mx-auto rounded-full border-8 border-transparent bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 animate-spin-slow shadow-2xl">
                            <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                                {/* 태극 무늬 느낌 */}
                                <div className="relative w-20 h-20 sm:w-24 sm:h-24">
                                    <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-r from-pink-500 to-red-500 rounded-t-full animate-pulse"></div>
                                    <div
                                        className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-b-full animate-pulse"
                                        style={{ animationDelay: '0.5s' }}
                                    ></div>
                                    <div className="absolute inset-0 flex items-center justify-center text-4xl sm:text-5xl animate-bounce-gentle">🇰🇷</div>
                                </div>
                            </div>
                        </div>

                        {/* 회전하는 이모지 원형 */}
                        <div className="absolute inset-0 animate-spin-reverse">
                            {['🎎', '🎭', '🎨', '🎪', '🎬', '🎤'].map((emoji, i) => {
                                const angle = (i * 60 * Math.PI) / 180;
                                const radius = 80;
                                const x = Math.cos(angle) * radius;
                                const y = Math.sin(angle) * radius;

                                return (
                                    <div
                                        key={i}
                                        className="absolute text-3xl sm:text-4xl animate-bounce"
                                        style={{
                                            left: '50%',
                                            top: '50%',
                                            transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
                                            animationDelay: `${i * 0.2}s`,
                                        }}
                                    >
                                        {emoji}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* 로딩 텍스트 */}
                    <div className="space-y-4">
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent animate-gradient tracking-tight">
                            문화 라이브 준비중
                        </h1>

                        {/* 점 애니메이션 */}
                        <div className="flex items-center justify-center gap-2">
                            <div className="w-3 h-3 sm:w-4 sm:h-4 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                            <div className="w-3 h-3 sm:w-4 sm:h-4 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            <div className="w-3 h-3 sm:w-4 sm:h-4 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                        </div>

                        <p className="text-base sm:text-lg text-gray-600 font-medium animate-pulse">{loading ? '회의 정보 불러오는 중...' : '실시간 번역 시스템 연결 중...'}</p>
                    </div>

                    {/* 재미있는 로딩 팁 */}
                    <div className="mt-8 sm:mt-12 bg-white/80 backdrop-blur-sm rounded-2xl px-6 sm:px-8 py-4 sm:py-5 shadow-xl border-2 border-pink-200 max-w-md mx-auto">
                        <div className="flex items-start gap-3">
                            <span className="text-2xl sm:text-3xl flex-shrink-0 animate-wiggle">💡</span>
                            <div className="text-left">
                                <p className="text-sm sm:text-base font-bold text-gray-800 mb-1">로딩 팁!</p>
                                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">채팅에 이모지를 입력하면 화면에 특별한 애니메이션이 나타나요! 🎉✨🔥</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 하단 파티클 효과 */}
                <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white/50 to-transparent pointer-events-none">
                    {Array.from({ length: 10 }, (_, i) => (
                        <div
                            key={i}
                            className="absolute text-2xl animate-float-up"
                            style={{
                                left: `${i * 10 + 5}%`,
                                bottom: '-20px',
                                animationDelay: `${i * 0.3}s`,
                                animationDuration: `${3 + Math.random() * 2}s`,
                            }}
                        >
                            {['✨', '💖', '🌸', '🎊', '⭐'][i % 5]}
                        </div>
                    ))}
                </div>

                <style>{`
                    @keyframes float {
                        0%, 100% { transform: translateY(0) rotate(0deg); }
                        50% { transform: translateY(-20px) rotate(5deg); }
                    }

                    @keyframes float-up {
                        0% {
                            transform: translateY(0) scale(0);
                            opacity: 0;
                        }
                        50% {
                            opacity: 1;
                        }
                        100% {
                            transform: translateY(-150px) scale(1);
                            opacity: 0;
                        }
                    }

                    @keyframes spin-slow {
                        from { transform: rotate(0deg); }
                        to { transform: rotate(360deg); }
                    }

                    @keyframes spin-reverse {
                        from { transform: rotate(360deg); }
                        to { transform: rotate(0deg); }
                    }

                    @keyframes bounce-gentle {
                        0%, 100% { transform: translateY(0); }
                        50% { transform: translateY(-10px); }
                    }

                    @keyframes gradient {
                        0%, 100% { background-position: 0% 50%; }
                        50% { background-position: 100% 50%; }
                    }

                    @keyframes wiggle {
                        0%, 100% { transform: rotate(0deg); }
                        25% { transform: rotate(-10deg); }
                        75% { transform: rotate(10deg); }
                    }

                    .animate-float { animation: float 3s ease-in-out infinite; }
                    .animate-float-up { animation: float-up 4s ease-out infinite; }
                    .animate-spin-slow { animation: spin-slow 3s linear infinite; }
                    .animate-spin-reverse { animation: spin-reverse 4s linear infinite; }
                    .animate-bounce-gentle { animation: bounce-gentle 2s ease-in-out infinite; }
                    .animate-gradient { 
                        background-size: 200% 200%;
                        animation: gradient 3s ease infinite; 
                    }
                    .animate-wiggle { animation: wiggle 1s ease-in-out infinite; }
                `}</style>
            </div>
        );
    }

    // 🎯 에러 화면
    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-red-50 via-pink-50 to-purple-50 px-4">
                {/* 에러 아이콘 */}
                <div className="relative mb-6">
                    <div className="text-8xl sm:text-9xl animate-bounce">😢</div>
                    <div className="absolute -top-4 -right-4 text-5xl animate-spin-slow">❌</div>
                </div>

                {/* 에러 메시지 */}
                <div className="bg-white rounded-3xl shadow-2xl px-8 py-8 max-w-md mx-auto border-4 border-red-200">
                    <h1 className="text-2xl sm:text-3xl font-black text-gray-800 mb-4 text-center">앗! 문제가 생겼어요</h1>
                    <div className="bg-red-50 rounded-xl p-4 mb-6 border-2 border-red-200">
                        <p className="text-sm sm:text-base text-red-700 text-center font-medium">{error}</p>
                    </div>

                    {/* 돌아가기 버튼 */}
                    <button
                        onClick={() => navigate('/culture/videos')}
                        className="w-full px-6 py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full font-bold text-lg hover:shadow-2xl transition-all hover:scale-105 active:scale-95"
                    >
                        🏠 홈으로 돌아가기
                    </button>

                    {/* 도움말 */}
                    <p className="mt-4 text-xs text-gray-500 text-center">문제가 계속되면 새로고침을 해보세요!</p>
                </div>

                {/* 배경 파티클 */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    {Array.from({ length: 8 }, (_, i) => (
                        <div
                            key={i}
                            className="absolute text-4xl opacity-20 animate-float"
                            style={{
                                left: `${Math.random() * 100}%`,
                                top: `${Math.random() * 100}%`,
                                animationDelay: `${i * 0.5}s`,
                            }}
                        >
                            💔
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (!meetingData) {
        return null;
    }

    // 🔥 videoConnected가 false일 때는 로딩 화면 오버레이
    return (
        <>
            {/* 비디오 연결 중일 때 K-밈 로딩 화면 오버레이 */}
            {!videoConnected && (
                <div className="fixed inset-0 z-50 bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
                    <div className="relative flex flex-col items-center justify-center h-screen overflow-hidden px-4">
                        {/* 배경 패턴 */}
                        <div className="absolute inset-0 opacity-10">
                            <div className="absolute top-10 left-10 text-6xl animate-float" style={{ animationDelay: '0s' }}>
                                🌸
                            </div>
                            <div className="absolute top-20 right-20 text-5xl animate-float" style={{ animationDelay: '0.5s' }}>
                                🎌
                            </div>
                            <div className="absolute bottom-20 left-20 text-5xl animate-float" style={{ animationDelay: '1s' }}>
                                🏯
                            </div>
                            <div className="absolute bottom-10 right-10 text-6xl animate-float" style={{ animationDelay: '1.5s' }}>
                                💖
                            </div>
                        </div>

                        {/* 메인 로딩 컨텐츠 */}
                        <div className="relative z-10 text-center">
                            <div className="relative mb-8">
                                <div className="w-32 h-32 sm:w-40 sm:h-40 mx-auto rounded-full border-8 border-transparent bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 animate-spin-slow shadow-2xl">
                                    <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                                        <div className="relative w-20 h-20 sm:w-24 sm:h-24">
                                            <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-r from-pink-500 to-red-500 rounded-t-full animate-pulse"></div>
                                            <div
                                                className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-b-full animate-pulse"
                                                style={{ animationDelay: '0.5s' }}
                                            ></div>
                                            <div className="absolute inset-0 flex items-center justify-center text-4xl sm:text-5xl animate-bounce-gentle">🇰🇷</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent animate-gradient tracking-tight">
                                    문화 라이브 준비중
                                </h1>
                                <div className="flex items-center justify-center gap-2">
                                    <div className="w-3 h-3 sm:w-4 sm:h-4 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                                    <div className="w-3 h-3 sm:w-4 sm:h-4 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                    <div className="w-3 h-3 sm:w-4 sm:h-4 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                                </div>
                                <p className="text-base sm:text-lg text-gray-600 font-medium animate-pulse">실시간 번역 시스템 연결 중...</p>
                            </div>
                        </div>

                        <style>{`
                            @keyframes float {
                                0%, 100% { transform: translateY(0) rotate(0deg); }
                                50% { transform: translateY(-20px) rotate(5deg); }
                            }
                            @keyframes spin-slow {
                                from { transform: rotate(0deg); }
                                to { transform: rotate(360deg); }
                            }
                            @keyframes bounce-gentle {
                                0%, 100% { transform: translateY(0); }
                                50% { transform: translateY(-10px); }
                            }
                            @keyframes gradient {
                                0%, 100% { background-position: 0% 50%; }
                                50% { background-position: 100% 50%; }
                            }
                            .animate-float { animation: float 3s ease-in-out infinite; }
                            .animate-spin-slow { animation: spin-slow 3s linear infinite; }
                            .animate-bounce-gentle { animation: bounce-gentle 2s ease-in-out infinite; }
                            .animate-gradient { 
                                background-size: 200% 200%;
                                animation: gradient 3s ease infinite; 
                            }
                        `}</style>
                    </div>
                </div>
            )}

            {/* CustomVideoConference는 항상 렌더링 (뒤에서 연결 진행) */}
            <div className="w-full min-h-screen bg-slate-50">
                <CustomVideoConference
                    roomName={`culture-${meetingData.id}`}
                    identity={user?.userId ? `user-${user.userId}` : `guest-${Date.now()}`}
                    username={user?.name || user?.email || '게스트'}
                    onLeave={handleLeave}
                    meetingId={meetingData.id}
                    meetingTitle={meetingData.title}
                    meetingDesc={meetingData.cultureDesc}
                    isCultureMode={true}
                    onConnected={handleVideoConnected}
                />
            </div>
        </>
    );
};

export default CultureLiveView;
