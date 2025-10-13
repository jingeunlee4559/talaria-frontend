import React from 'react';

// 아이콘 컴포넌트들
const VideoIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M4.5 4.5a3 3 0 00-3 3v9a3 3 0 003 3h8.25a3 3 0 003-3v-9a3 3 0 00-3-3H4.5zM19.94 18.75l-2.69-2.69V7.94l2.69-2.69c.944-.945 2.56-.276 2.56 1.06v11.38c0 1.336-1.616 2.005-2.56 1.06z" /></svg>;
const StarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-yellow-500"><path fillRule="evenodd" d="M10.868 2.884c.321-.662 1.134-.662 1.456 0l1.868 3.844 4.251.618c.732.107 1.026.997.494 1.503l-3.076 2.998.726 4.234c.125.728-.638 1.283-1.296.952L10 17.64l-3.844 2.02c-.658.332-1.42-.224-1.296-.952l.726-4.234L2.51 8.847c-.532-.506-.238-1.396.494-1.503l4.25-.618 1.868-3.844z" clipRule="evenodd" /></svg>;
const CalendarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0h18" /></svg>;
const ClockIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const UsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-4.663M12 12a3 3 0 100-6 3 3 0 000 6z" /></svg>;
const ShareIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.195.025.39.05.588.08a2.25 2.25 0 014.244 0c.198-.03.393-.055.588-.08m-5.42 2.186a2.25 2.25 0 004.244 0M12 6.344a2.25 2.25 0 100 4.312 2.25 2.25 0 000-4.312z" /></svg>;
const MoreIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 13.5a.75.75 0 110-1.5.75.75 0 010 1.5zM12 20.25a.75.75 0 110-1.5.75.75 0 010 1.5z" /></svg>;


const MeetingMinutesItem = ({ title, isStarred, date, duration, participants }) => {
  return (
    <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-slate-200 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center">
        {/* 아이콘 */}
        <div className="mr-4 bg-violet-100 text-violet-600 p-3 rounded-lg">
          <VideoIcon />
        </div>
        
        {/* 정보 */}
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="font-bold text-slate-800">{title}</h3>
            {isStarred && <StarIcon />}
          </div>
          <div className="flex items-center space-x-4 text-sm text-slate-500 mt-1">
            <span className="flex items-center"><CalendarIcon className="mr-1.5" />{date}</span>
            <span className="flex items-center"><ClockIcon className="mr-1.5" />{duration}</span>
            <span className="flex items-center"><UsersIcon className="mr-1.5" />외 {participants}명</span>
          </div>
        </div>
      </div>

      {/* 액션 버튼 */}
      <div className="flex items-center space-x-1 text-slate-500">
        <button className="p-2 rounded-full hover:bg-slate-200 transition-colors">
          <ShareIcon />
        </button>
        <button className="p-2 rounded-full hover:bg-slate-200 transition-colors">
          <MoreIcon />
        </button>
      </div>
    </div>
  );
};

export default MeetingMinutesItem;