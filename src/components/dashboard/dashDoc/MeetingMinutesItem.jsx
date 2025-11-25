import React from 'react';

// ✅ 사용될 아이콘들만 import 합니다. (StarIcon 제거)
import { VideoIcon, CalendarIcon, ClockIcon, UsersIcon, DownloadIcon } from '../../icons/icons';

// ✅ 1. onSelect와 isSelected props를 받도록 수정
const MeetingMinutesItem = ({ onClick, onSelect, isSelected, ...minute }) => (
    <div
        className={`
            flex items-center p-4 rounded-xl 
            transition-all duration-300 ease-in-out cursor-pointer 
            transform hover:-translate-y-1 
            ${
                isSelected
                    ? 'bg-purple-50 border-purple-400 shadow-xl' // ✨ 2. "선택 상태" (보라색 테마)
                    : 'bg-white border-transparent shadow-lg hover:shadow-xl'
            }
        `}
        // ✅ 3. 부모 클릭 시 모달 열기
        onClick={() => onClick({ ...minute, itemType: 'minutes' })}
    >
        {/* --- ✅ 4. "프리미엄 네이티브" 체크박스 추가 --- 
          - DocumentItem과 동일한 스타일, 보라색 테마('accent-purple-600') 적용
        */}
        <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onSelect(minute.id)} // 👈 minute.id 사용
            onClick={(e) => e.stopPropagation()} // 모달 열기 방지
            className="
                mr-4 cursor-pointer 
                w-5 h-5 
                rounded-md border-2 border-slate-300 
                text-purple-600 
                accent-purple-600 // ✨ 보라색 테마 적용
                focus:ring-2 focus:ring-offset-2 focus:ring-purple-500/50
            "
        />
        {/* --- 여기까지가 체크박스 --- */}

        {/* ✅ "프리미엄" 아이콘 (변경 없음) */}
        <div className="flex-shrink-0 mr-4">
            <div
                className="
                p-3 bg-purple-600 text-white 
                rounded-lg w-12 h-12 
                flex items-center justify-center
            "
            >
                <VideoIcon className="w-6 h-6" />
            </div>
        </div>

        {/* ✅ 텍스트 영역 (변경 없음) */}
        <div className="flex-grow min-w-0">
            {/* --- 제목 --- */}
            <div className="flex items-center">
                <p className="text-base font-semibold text-slate-800 truncate mr-2">{minute.title}</p>
            </div>

            {/* ✅ "유저 친화적" 메타데이터 (변경 없음) */}
            <div className="flex flex-wrap items-center text-sm text-slate-500 mt-1.5 gap-x-3 sm:gap-x-4">
                <span className="flex items-center gap-1.5 truncate">
                    <CalendarIcon className="w-4 h-4" />
                    {minute.date}
                </span>
                {/* <span className="flex items-center gap-1.5 truncate">
                    <ClockIcon className="w-4 h-4" />
                    {minute.duration}
                </span> */}
                <span className="flex items-center gap-1.5 truncate">
                    <UsersIcon className="w-4 h-4" />
                    {minute.participants}명
                </span>
            </div>
        </div>

        {/* ✅ "세련된" 다운로드 버튼 (변경 없음) */}
        <button
            className="text-slate-500 hover:text-slate-800 hover:bg-slate-100 p-2 rounded-lg transition ml-4"
            onClick={(e) => {
                e.stopPropagation(); // 모달 열기 방지
                console.log('회의록 다운로드 클릭:', minute.id);
            }}
        >
            <DownloadIcon className="w-5 h-5" />
        </button>
    </div>
);

export default MeetingMinutesItem;
