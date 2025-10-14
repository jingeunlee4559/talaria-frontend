import React from 'react';

// 아이콘 컴포넌트 (기존과 동일)
const UserIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.122-1.28-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.653.122-1.28.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
const CalendarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
const VideoIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18V6a2 2 0 012-2h6a2 2 0 012 2v12a2 2 0 01-2 2H7a2 2 0 01-2-2z" /></svg>;

const MeetingCard = ({ id, title, status, participants, date, time, onJoinMeeting }) => {
  const statusStyles = {
    '진행중': { badge: 'bg-green-100 text-green-700', button: 'bg-green-600 hover:bg-green-700', text: '지금 참여하기', icon: <VideoIcon /> },
    '예정': { badge: 'bg-slate-200 text-slate-600', button: 'bg-blue-600 hover:bg-blue-700', text: '회의 시작하기', icon: <VideoIcon /> },
    '종료': { badge: 'bg-slate-200 text-slate-600', button: 'bg-red-500 cursor-not-allowed', text: '회의가 종료되었습니다.', icon: null },
  };

  const currentStatus = statusStyles[status];

  const handleButtonClick = () => {
    if (status === '진행중' || status === '예정') {
      onJoinMeeting(id);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col justify-between shadow-sm hover:shadow-lg transition-shadow duration-300">
      <div>
        {/* 카드 상단 */}
        <div className="flex justify-between items-center mb-4">
          <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${currentStatus.badge}`}>
            {status}
          </span>
          <div className="flex items-center space-x-1 text-sm text-slate-500">
            <UserIcon />
            <span>{participants}명</span>
          </div>
        </div>

        {/* 카드 본문 */}
        <h3 className="text-lg font-bold text-slate-800 mb-2">{title}</h3>
        <div className="flex items-center space-x-2 text-sm text-slate-500">
          <CalendarIcon />
          <span>{date} ㆍ {time}</span>
        </div>
      </div>

      {/* 카드 하단 (버튼) */}
      <div className="mt-6">
        <button
          className={`w-full text-white font-semibold py-2.5 rounded-lg transition-colors flex items-center justify-center ${currentStatus.button}`}
          disabled={status === '종료'}
          onClick={handleButtonClick}
        >
          {currentStatus.icon}
          {currentStatus.text}
        </button>
      </div>
    </div>
  );
};

export default MeetingCard;