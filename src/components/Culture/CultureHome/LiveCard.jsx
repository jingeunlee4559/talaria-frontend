// src/components/Culture/CultureHome/LiveCard.jsx
import { useState } from 'react';

const MAX_TAGS = 3; // 한 카드에서 보여줄 최대 태그 수

const LiveCard = ({ meeting, language, index, onJoin }) => {
    const [likes, setLikes] = useState(Math.floor(Math.random() * 2000) + 500);
    const [comments] = useState(Math.floor(Math.random() * 500) + 50);
    const [isLiked, setIsLiked] = useState(false);
    const [isBookmarked, setIsBookmarked] = useState(false);

    // meeting에서 tags 가져오기 (없으면 빈 배열)
    const tags = meeting.tags || [];
    const displayTags = tags.map((tag) => `#${tag}`);

    // 태그 노출/숨김 분리
    const shownTags = displayTags.slice(0, MAX_TAGS);
    const extraTagCount = displayTags.length - shownTags.length;

    // 설명 텍스트 (필요한 필드 우선순위대로 사용)
    const description = meeting.cultureDesc || meeting.description || meeting.cultureDescShort || meeting.cultureDescription || '';

    const handleLike = (e) => {
        e.stopPropagation();
        setLikes((prev) => (isLiked ? prev - 1 : prev + 1));
        setIsLiked((prev) => !prev);
    };

    const handleBookmark = (e) => {
        e.stopPropagation();
        setIsBookmarked((prev) => !prev);
    };

    const thumbnailImage = meeting?.cultureThumbRelPath?.trim() || '/img/content1.webp';
    const viewers = meeting.participants || Math.floor(Math.random() * 2) + 1;

    return (
        <div
            className="
                group flex flex-col h-full
                bg-white rounded-2xl overflow-hidden
                shadow-md hover:shadow-2xl
                border border-gray-100 hover:border-violet-300
                transition-all duration-300 cursor-pointer
            "
            onClick={onJoin}
        >
            {/* 썸네일 영역 */}
            <div className="relative w-full aspect-[16/9] overflow-hidden">
                {/* LIVE 배지 */}
                <div className="absolute top-3 left-3 z-10">
                    <div className="flex items-center gap-1.5 bg-red-500 text-white px-3 py-1.5 rounded-xl shadow-lg">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                        <span className="text-[11px] font-bold tracking-wider">LIVE</span>
                    </div>
                </div>

                {/* 언어 배지 */}
                <div className="absolute top-3 right-3 z-10">
                    <div className="bg-white/95 backdrop-blur-sm text-violet-600 px-3 py-1 rounded-lg text-xs font-semibold shadow-md">{language}</div>
                </div>

                {/* 시청자 수 */}
                <div className="absolute bottom-3 left-3 z-10">
                    <div className="bg-black/70 backdrop-blur-md text-white px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                        </svg>
                        <span>{viewers}명 시청중</span>
                    </div>
                </div>

                {/* 썸네일 이미지 */}
                <img
                    src={thumbnailImage}
                    onError={(e) => {
                        e.target.src = '/img/content1.webp';
                    }}
                    alt={meeting.title}
                    className="
                        absolute inset-0 w-full h-full
                        object-cover
                        group-hover:scale-110
                        transition-transform duration-500
                    "
                />

                {/* 그라데이션 오버레이 */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent group-hover:from-black/70 transition-all duration-300" />
            </div>

            {/* 카드 정보 영역 */}
            <div className="flex flex-col flex-1 px-4 pt-3 pb-3.5 sm:pt-4 sm:pb-4">
                {/* 상단 정보 블록 */}
                <div className="flex-1 flex flex-col gap-2">
                    {/* 제목 (최대 2줄, 그 이상은 …) */}
                    <h3
                        className="
                            font-bold text-[15px] sm:text-base text-gray-900
                            line-clamp-2
                            group-hover:text-violet-600
                            transition-colors
                        "
                    >
                        {meeting.title}
                    </h3>

                    {/* 설명 / 내용 (최대 2줄, 그 이상은 …) */}
                    {description && (
                        <p
                            className="
                                text-gray-600 text-xs sm:text-sm
                                leading-snug
                                line-clamp-2
                            "
                        >
                            {description}
                        </p>
                    )}

                    {/* 호스트 이름 영역 (고정 높이 느낌을 주고 싶으면 min-h 추가 가능) */}
                    <div className="flex items-center gap-2 mt-1">
                        <div className="w-7 h-7 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center text-xs font-semibold">{meeting.host_name?.[0] || 'H'}</div>
                        <div className="flex flex-col">
                            <span className="text-sm font-medium text-gray-800">{meeting.host_name}</span>
                            <span className="text-[11px] text-gray-400">호스트</span>
                        </div>
                    </div>

                    {/* 태그 (최대 MAX_TAGS + 남은 개수 표시) */}
                    {shownTags.length > 0 && (
                        <div className="mt-1.5 flex flex-wrap gap-1.5">
                            {shownTags.map((tag, idx) => (
                                <span
                                    key={idx}
                                    className="
                                        inline-flex items-center
                                        px-2.5 py-1
                                        bg-violet-50 text-violet-600
                                        text-[11px] sm:text-xs font-semibold
                                        rounded-full
                                        hover:bg-violet-100
                                        transition-colors
                                    "
                                >
                                    {tag}
                                </span>
                            ))}

                            {extraTagCount > 0 && (
                                <span
                                    className="
                                        inline-flex items-center
                                        px-2.5 py-1
                                        bg-gray-100 text-gray-500
                                        text-[11px] sm:text-xs font-medium
                                        rounded-full
                                    "
                                >
                                    +{extraTagCount}개
                                </span>
                            )}
                        </div>
                    )}
                </div>

                {/* 하단 액션 버튼 */}
                <div className="flex items-center justify-between pt-3 mt-3 border-t border-gray-100">
                    <div className="flex items-center gap-4 text-gray-600 text-xs sm:text-sm">
                        {/* 좋아요 */}
                        <button
                            onClick={handleLike}
                            className={`
                                flex items-center gap-1.5
                                hover:text-pink-600
                                transition-colors
                                ${isLiked ? 'text-pink-600' : ''}
                            `}
                        >
                            <svg className={`w-5 h-5 ${isLiked ? 'fill-pink-600' : 'fill-none'}`} stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                                />
                            </svg>
                            <span className="font-medium">{likes.toLocaleString()}</span>
                        </button>

                        {/* 댓글 */}
                        <div className="flex items-center gap-1.5">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                                />
                            </svg>
                            <span className="font-medium">{comments.toLocaleString()}</span>
                        </div>
                    </div>

                    {/* 북마크 */}
                    <button onClick={handleBookmark} className="hover:scale-110 transition-transform">
                        <svg
                            className={`
                                w-5 h-5
                                ${isBookmarked ? 'fill-violet-600 text-violet-600' : 'fill-none text-gray-400 hover:text-violet-600'}
                            `}
                            stroke="currentColor"
                            strokeWidth={2}
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LiveCard;
