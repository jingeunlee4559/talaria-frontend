// Lobby.jsx
import React from 'react';
import { PreJoin } from '@livekit/components-react';
import '@livekit/components-styles';

const Lobby = ({ meetingTitle, onJoin }) => {
  return (
    <div
      data-lk-theme="default"
      className="min-h-screen w-full bg-gradient-to-br from-slate-900 to-gray-800 flex items-center justify-center p-4"
    >
      {/* LiveKit 테마 변수 (컴포넌트 범위 한정) */}
      <style>{`
        [data-lk-theme="default"] .lk-prejoin {
          --lk-radius-md: 14px;
          --lk-color-bg: rgba(15, 23, 42, .6);     /* 카드 배경 */
          --lk-color-border: rgba(51, 65, 85, .7); /* 테두리 */
          --lk-color-text: #d1d5db;                /* 본문 */
          --lk-color-text-strong: #fff;            /* 제목/버튼 */
          --lk-color-primary: #2563eb;             /* 주요 파랑 */
          --lk-color-surface: rgba(30, 41, 59, .6);
          --lk-shadow-elevation-2: 0 10px 30px rgba(0,0,0,.35);
        }
      `}</style>

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 왼쪽: 소개 + 타이틀 */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 shadow-2xl p-8">
          <div className="flex justify-center mb-6">
            <div className="p-3 bg-blue-500/10 rounded-full border border-blue-400/30">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9A2.25 2.25 0 0 0 13.5 5.25h-9A2.25 2.25 0 0 0 2.25 7.5v9A2.25 2.25 0 0 0 4.5 18.75Z"
                />
              </svg>
            </div>
          </div>

          <div className="text-center">
            <h1 className="text-3xl font-bold text-white tracking-tight">회의에 참여할 준비가 되셨나요?</h1>
            <p className="text-slate-300 mt-2 text-lg">{meetingTitle || '회의'}</p>
          </div>

          <ul className="mt-8 space-y-2 text-slate-300 text-sm">
            <li>• 입장 전 카메라/마이크/스피커를 선택하세요.</li>
            <li>• 권한 허용이 필요합니다. 브라우저 알림을 확인하세요.</li>
            <li>• 네트워크가 불안정할 경우 해상도/프레임을 낮추면 안정적입니다.</li>
          </ul>
        </div>

        {/* 오른쪽: LiveKit PreJoin (디바이스/권한/미리보기 포함) */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 shadow-2xl p-4">
          <PreJoin
            className="lk-prejoin" // 위에서 테마 변수 적용 범위
            defaults={{
              username: '참가자',
              videoEnabled: true,
              audioEnabled: true,
            }}
            // 필요 시: 자막/라벨 현지화도 가능 (labelOverrides)
            // labelOverrides={{ joinButton: '회의 참여', usernameLabel: '이름' }}
            onSubmit={(values) => {
              // values: { username, videoEnabled, audioEnabled, videoDeviceId, audioDeviceId, audioOutputDeviceId }
              console.log('입력된 정보로 회의에 참여합니다:', values);
              onJoin(values.username);
            }}
          />

          {/* 하단 안내/보조 링크 */}
          <div className="px-4 pb-4">
            <div className="mt-4 text-xs text-slate-400">
              <p>회의 참여 시 카메라/마이크 권한이 요청됩니다.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Lobby;
