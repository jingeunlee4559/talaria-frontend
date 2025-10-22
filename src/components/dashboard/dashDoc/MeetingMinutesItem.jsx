import React from 'react';

import { VideoIcon, StarIcon, CalendarIcon, ClockIcon, UsersIcon, ShareIcon, MoreIcon, DownloadIcon } from '../../icons/icons';

// 개별 회의록 항목 컴포넌트 (모달 호출 기능 추가)
const MeetingMinutesItem = ({ onClick, ...minute }) => (
    <div
        className="flex items-center bg-white p-4 rounded-xl shadow-md hover:shadow-lg transition duration-300 cursor-pointer border border-slate-200"
        onClick={() => onClick({ ...minute, itemType: 'minutes' })}
    >
        <div className="flex-shrink-0 mr-4">
            <div className="p-3 bg-purple-100 text-purple-600 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M11.35 3.82L4.35 10.82M17.35 3.82L24.35 10.82M4 22h16c1.1 0 2-0.9 2-2V4c0-1.1-0.9-2-2-2H4C2.9 2 2 2.9 2 4v16C2 21.1 2.9 22 4 22zM8 8h8M8 12h8M8 16h5"
                    />
                </svg>
            </div>
        </div>
        <div className="flex-grow">
            <div className="flex items-center">
                <p className="text-base font-semibold text-slate-800 truncate mr-2">{minute.title}</p>
                {minute.isStarred && <StarIcon isStarred={true} className="h-4 w-4" />}
            </div>
            <p className="text-sm text-slate-500 mt-0.5">
                회의일: {minute.date} | 시간: {minute.duration} | 참석자: {minute.participants}명
            </p>
        </div>
        <button className="text-slate-400 hover:text-slate-600 p-2 rounded-full transition">
            <DownloadIcon className="w-5 h-5" />
        </button>
    </div>
);

export default MeetingMinutesItem;
