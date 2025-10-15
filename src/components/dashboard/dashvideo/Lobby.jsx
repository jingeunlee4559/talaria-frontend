import React from 'react';
import { PreJoin } from '@livekit/components-react';
import '@livekit/components-styles';

const Lobby = ({ meetingTitle, onJoin }) => {
  return (
    // LiveKit 기본 테마 적용
    <div data-lk-theme="default" 
         // 전체 배경: 부드러운 그라데이션과 중앙 정렬
         className="w-full h-screen bg-gradient-to-br from-slate-900 to-gray-800 flex items-center justify-center p-4 transition-all duration-300">
      
      {/* 메인 컨테이너: 유리 질감(backdrop-blur), 그림자, 둥근 모서리로 입체감 부여 */}
      <div className="w-full max-w-lg bg-slate-800/50 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border border-slate-700">
        
        {/* 상단 아이콘 영역 */}
        <div className="flex justify-center mb-6">
          <div className="p-3 bg-blue-500/10 rounded-full border border-blue-400/30">
            {/* 비디오 아이콘 (SVG) */}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9A2.25 2.25 0 0 0 13.5 5.25h-9A2.25 2.25 0 0 0 2.25 7.5v9A2.25 2.25 0 0 0 4.5 18.75Z" />
            </svg>
          </div>
        </div>

        {/* 텍스트 영역: 폰트 크기, 색상, 간격 조정을 통해 가독성 향상 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white tracking-tight">회의에 참여할 준비가 되셨나요?</h1>
          <p className="text-slate-300 mt-2 text-lg">{meetingTitle || '회의'}</p>
        </div>
        
        {/* LiveKit의 PreJoin 컴포넌트 */}
        <PreJoin
          defaults={{
            username: '참가자 닉네임', // 실제 유저 이름으로 변경하는 것을 권장합니다.
            videoEnabled: true,
            audioEnabled: true,
          }}
          onSubmit={(values) => {
            console.log('입력된 정보로 회의에 참여합니다:', values);
            onJoin(values.username);
          }}
        />
      </div>
    </div>
  );
};

export default Lobby;